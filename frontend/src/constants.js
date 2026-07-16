export const STAGES = ["Intake", "Classified", "Sanitized", "Verified", "Certified", "Disposed"];
export const ASSET_TYPES = ["Laptop", "Desktop", "Server", "Mobile device", "Networking equipment"];
export const MEDIA_TYPES = ["HDD", "SSD / NVMe", "Mobile flash", "Magnetic tape", "Optical"];
export const SENSITIVITY_LEVELS = ["Public", "Internal", "Confidential", "Restricted"];
export const ROLES = ["admin", "intake_tech", "verifier", "auditor"];

export function levelTone(level) {
  if (level === "Destroy") return "redact";
  if (level === "Purge") return "amber";
  return "verified";
}
