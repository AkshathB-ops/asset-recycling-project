const Asset = require("../models/Asset");
const { STAGES, ASSET_TYPES, MEDIA_TYPES, SENSITIVITY_LEVELS, suggestMethod } = require("../utils/constants");

// Which roles may push an asset out of a given stageIndex.
// index = current stageIndex before the transition.
const TRANSITION_ROLES = {
  0: ["admin", "intake_tech"], // Intake -> Classified (classification happens at intake; kept for future split)
  1: ["admin", "intake_tech"], // Classified -> Sanitized
  2: ["admin", "verifier"], // Sanitized -> Verified (segregation of duties from the sanitizing tech)
  3: ["admin", "verifier"], // Verified -> Certified
  4: ["admin", "verifier", "intake_tech"], // Certified -> Disposed
};

function pushLog(asset, user, note) {
  asset.log.push({ actorId: user.id, actorName: user.name, note });
}

// GET /api/assets
async function listAssets(req, res) {
  const { sensitivity, mediaType, stage, q } = req.query;
  const filter = {};
  if (sensitivity) filter.sensitivity = sensitivity;
  if (mediaType) filter.mediaType = mediaType;
  if (stage) filter.stageIndex = STAGES.indexOf(stage);
  if (q) filter.$or = [{ tag: new RegExp(q, "i") }, { serial: new RegExp(q, "i") }];

  const assets = await Asset.find(filter).sort({ createdAt: -1 });
  res.json({ assets, meta: { stages: STAGES, assetTypes: ASSET_TYPES, mediaTypes: MEDIA_TYPES, sensitivityLevels: SENSITIVITY_LEVELS } });
}

// GET /api/assets/:id
async function getAsset(req, res) {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ error: "Asset not found." });
  res.json({ asset, suggestion: suggestMethod(asset.mediaType, asset.sensitivity) });
}

// POST /api/assets  (intake)
async function createAsset(req, res) {
  const { tag, serial, type, mediaType, sensitivity } = req.body;
  if (!tag || !serial || !type || !mediaType || !sensitivity) {
    return res.status(400).json({ error: "tag, serial, type, mediaType, and sensitivity are all required." });
  }
  if (!ASSET_TYPES.includes(type)) return res.status(400).json({ error: `type must be one of: ${ASSET_TYPES.join(", ")}` });
  if (!MEDIA_TYPES.includes(mediaType)) return res.status(400).json({ error: `mediaType must be one of: ${MEDIA_TYPES.join(", ")}` });
  if (!SENSITIVITY_LEVELS.includes(sensitivity)) {
    return res.status(400).json({ error: `sensitivity must be one of: ${SENSITIVITY_LEVELS.join(", ")}` });
  }

  const existing = await Asset.findOne({ tag: tag.trim() });
  if (existing) return res.status(409).json({ error: `Asset tag "${tag}" is already in use.` });

  const asset = new Asset({
    tag: tag.trim(),
    serial: serial.trim(),
    type,
    mediaType,
    sensitivity,
    stageIndex: 1, // received + classified in one step, mirrors the intake form
  });
  pushLog(asset, req.user, "Asset received and classified at intake.");
  await asset.save();

  res.status(201).json({ asset });
}

// POST /api/assets/:id/advance  { note? }
// Moves the asset to the next pipeline stage, enforcing role permissions per transition.
async function advanceAsset(req, res) {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ error: "Asset not found." });

  if (asset.stageIndex >= STAGES.length - 1) {
    return res.status(400).json({ error: "This asset has already completed its lifecycle." });
  }

  const allowedRoles = TRANSITION_ROLES[asset.stageIndex] || [];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Moving an asset from "${STAGES[asset.stageIndex]}" requires one of these roles: ${allowedRoles.join(", ")}.`,
    });
  }

  // Locking in the sanitization method happens on the Classified -> Sanitized transition.
  if (asset.stageIndex === 1) {
    asset.method = suggestMethod(asset.mediaType, asset.sensitivity);
  }

  const defaultNotes = {
    1: `Sanitization started: ${asset.method ? asset.method.method : suggestMethod(asset.mediaType, asset.sensitivity).method}`,
    2: "Sanitization verified by a second operator.",
    3: "Certificate of destruction issued.",
    4: "Asset released to recycling / resale channel.",
  };

  const note = (req.body && req.body.note && req.body.note.trim()) || defaultNotes[asset.stageIndex] || "Stage advanced.";
  asset.stageIndex += 1;
  if (asset.stageIndex === 4) {
    asset.certificateId = `COD-${asset.tag}-${new Date().getFullYear()}`;
  }
  pushLog(asset, req.user, note);
  await asset.save();

  res.json({ asset });
}

// GET /api/assets/:id/certificate
async function getCertificate(req, res) {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ error: "Asset not found." });
  if (asset.stageIndex < 4) {
    return res.status(400).json({ error: "Certificate is issued once the asset reaches the Certified stage." });
  }
  res.json({
    certificateId: asset.certificateId,
    issuedAt: asset.updatedAt,
    asset: {
      tag: asset.tag,
      serial: asset.serial,
      type: asset.type,
      mediaType: asset.mediaType,
      sensitivity: asset.sensitivity,
      method: asset.method,
      log: asset.log,
    },
  });
}

// DELETE /api/assets/:id  (admin only, see routes)
async function deleteAsset(req, res) {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) return res.status(404).json({ error: "Asset not found." });
  res.json({ deleted: true });
}

// GET /api/stats
async function getStats(req, res) {
  const [total, inProgress, certified, restricted] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ stageIndex: { $gt: 0, $lt: STAGES.length - 1 } }),
    Asset.countDocuments({ stageIndex: { $gte: 4 } }),
    Asset.countDocuments({ sensitivity: "Restricted" }),
  ]);
  res.json({ total, inProgress, certified, restricted });
}

module.exports = { listAssets, getAsset, createAsset, advanceAsset, getCertificate, deleteAsset, getStats };
