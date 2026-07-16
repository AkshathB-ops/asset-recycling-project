const mongoose = require("mongoose");
const { ASSET_TYPES, MEDIA_TYPES, SENSITIVITY_LEVELS, STAGES } = require("../utils/constants");

const custodyEntrySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const methodSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["Clear", "Purge", "Destroy"] },
    method: { type: String },
  },
  { _id: false }
);

const assetSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true, trim: true },
    serial: { type: String, required: true, trim: true },
    type: { type: String, enum: ASSET_TYPES, required: true },
    mediaType: { type: String, enum: MEDIA_TYPES, required: true },
    sensitivity: { type: String, enum: SENSITIVITY_LEVELS, required: true },
    stageIndex: { type: Number, default: 0, min: 0, max: STAGES.length - 1 },
    method: { type: methodSchema, default: null },
    log: { type: [custodyEntrySchema], default: [] },
    certificateId: { type: String, default: null },
  },
  { timestamps: true }
);

assetSchema.virtual("stage").get(function () {
  return STAGES[this.stageIndex];
});

assetSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Asset", assetSchema);
