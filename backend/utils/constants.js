// Central place for enums shared between models, controllers, and validation.

const ROLES = ["admin", "intake_tech", "verifier", "auditor"];

// auditor is implicitly read-only everywhere (enforced in middleware/permissions.js)

const ASSET_TYPES = ["Laptop", "Desktop", "Server", "Mobile device", "Networking equipment"];

const MEDIA_TYPES = ["HDD", "SSD / NVMe", "Mobile flash", "Magnetic tape", "Optical"];

const SENSITIVITY_LEVELS = ["Public", "Internal", "Confidential", "Restricted"];

// Pipeline stages every asset moves through, in order.
const STAGES = ["Intake", "Classified", "Sanitized", "Verified", "Certified", "Disposed"];

// NIST SP 800-88 informed suggestion engine: media type + sensitivity -> sanitization action.
function suggestMethod(mediaType, sensitivity) {
  const restricted = sensitivity === "Restricted";

  if (mediaType === "SSD / NVMe") {
    return restricted
      ? { level: "Destroy", method: "Cryptographic erase + physical shred" }
      : { level: "Purge", method: "Cryptographic erase (key destruction) or ATA/NVMe Secure Erase" };
  }
  if (mediaType === "HDD") {
    if (restricted) return { level: "Destroy", method: "Degauss + physical shred" };
    if (sensitivity === "Confidential") return { level: "Purge", method: "Multi-pass overwrite (DoD 5220.22-M) + verify" };
    return { level: "Clear", method: "Single-pass overwrite" };
  }
  if (mediaType === "Mobile flash") {
    return restricted
      ? { level: "Destroy", method: "Crypto erase + physical shred" }
      : { level: "Purge", method: "Factory reset with cryptographic erase" };
  }
  if (mediaType === "Magnetic tape") {
    return { level: "Purge", method: "Degauss (NSA/CSS approved degausser)" };
  }
  return { level: "Destroy", method: "Physical shred / disintegration" };
}

module.exports = { ROLES, ASSET_TYPES, MEDIA_TYPES, SENSITIVITY_LEVELS, STAGES, suggestMethod };
