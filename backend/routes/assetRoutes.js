const express = require("express");
const {
  listAssets,
  getAsset,
  createAsset,
  advanceAsset,
  getCertificate,
  deleteAsset,
  getStats,
} = require("../controllers/assetController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// All asset routes require a logged-in user; auditors get read-only access naturally
// since they're never included in TRANSITION_ROLES or the delete permission below.
router.use(requireAuth);

router.get("/", asyncHandler(listAssets));
router.get("/stats", asyncHandler(getStats));
router.get("/:id", asyncHandler(getAsset));
router.get("/:id/certificate", asyncHandler(getCertificate));

router.post("/", requireRole("admin", "intake_tech"), asyncHandler(createAsset));
router.post("/:id/advance", asyncHandler(advanceAsset)); // fine-grained role check happens inside the controller per stage
router.delete("/:id", requireRole("admin"), asyncHandler(deleteAsset));

module.exports = router;
