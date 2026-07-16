import React, { useState } from "react";
import { X, Shield, HardDrive, Zap, Check, Stamp, Trash2 } from "lucide-react";
import CustodyStepper from "./CustodyStepper";
import { Pill, ErrorBanner } from "./Atoms";
import { STAGES, levelTone } from "../constants";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

// Mirrors backend/controllers/assetController.js TRANSITION_ROLES, used only to
// decide whether to show the action button — the server re-checks on every call.
const TRANSITION_ROLES = {
  0: ["admin", "intake_tech"],
  1: ["admin", "intake_tech"],
  2: ["admin", "verifier"],
  3: ["admin", "verifier"],
  4: ["admin", "verifier", "intake_tech"],
};

const STAGE_ACTIONS = {
  1: { label: "Begin sanitization", icon: Zap },
  2: { label: "Mark verified", icon: Check },
  3: { label: "Certify & issue record", icon: Stamp },
  4: { label: "Mark disposed / recycled", icon: Trash2 },
};

export default function DetailDrawer({ asset, suggestion, onClose, onChanged, onViewCertificate }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canAdvance = asset.stageIndex < STAGES.length - 1 && (TRANSITION_ROLES[asset.stageIndex] || []).includes(user.role);
  const action = STAGE_ACTIONS[asset.stageIndex];
  const method = asset.method || suggestion;

  async function advance() {
    setBusy(true);
    setError("");
    try {
      const { asset: updated } = await api.advanceAsset(asset._id);
      onChanged(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-end z-40" onClick={onClose}>
      <div className="bg-panel border-l border-[#3A424B] w-full max-w-md h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-steel" />
            <div>
              <div className="font-mono text-sm text-paper">{asset.tag}</div>
              <div className="font-mono text-[10px] text-steel">{asset.serial}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-steel hover:text-paper"><X size={18} /></button>
        </div>

        <div className="mb-6"><CustodyStepper stageIndex={asset.stageIndex} /></div>

        <div className="grid grid-cols-2 gap-3 text-[12px] font-mono mb-5">
          <div className="bg-ink border border-line p-2"><div className="text-[9px] uppercase text-steel">Media</div>{asset.mediaType}</div>
          <div className="bg-ink border border-line p-2"><div className="text-[9px] uppercase text-steel">Sensitivity</div>{asset.sensitivity}</div>
        </div>

        {method && (
          <div className="mb-5 p-3 border border-[#3A424B] bg-ink/60">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={13} className="text-steel" />
              <span className="text-[10px] uppercase tracking-wide text-steel font-mono">NIST 800-88 {asset.method ? "method" : "suggestion"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={levelTone(method.level)}>{method.level}</Pill>
              <span className="text-[12px] text-[#C9D0D6]">{method.method}</span>
            </div>
          </div>
        )}

        <ErrorBanner message={error} />

        <div className="space-y-2">
          {action && canAdvance && (
            <button onClick={advance} disabled={busy} className="action-btn disabled:opacity-50">
              <action.icon size={13} /> {busy ? "Working..." : action.label}
            </button>
          )}
          {action && !canAdvance && (
            <div className="text-[11px] font-mono text-steel border border-line px-3 py-2">
              Moving this asset out of "{STAGES[asset.stageIndex]}" requires role: {(TRANSITION_ROLES[asset.stageIndex] || []).join(" or ")}.
            </div>
          )}
          {asset.stageIndex >= 4 && (
            <button onClick={() => onViewCertificate(asset)} className="w-full py-2 border border-steel text-[#C9D0D6] font-mono text-xs uppercase tracking-wide hover:border-paper transition-colors flex items-center justify-center gap-2">
              <Stamp size={13} /> View certificate
            </button>
          )}
          {asset.stageIndex === STAGES.length - 1 && (
            <div className="text-center text-[11px] font-mono text-verified pt-1">Lifecycle complete — chain of custody closed.</div>
          )}
        </div>

        <div className="mt-6">
          <div className="text-[10px] uppercase text-steel font-mono mb-2">Custody log</div>
          <ul className="space-y-2">
            {asset.log.map((l, i) => (
              <li key={i} className="text-[11px] font-mono border-l border-[#3A424B] pl-3 py-0.5">
                <div className="text-steel">{new Date(l.at).toLocaleString()} · {l.actorName}</div>
                <div className="text-[#C9D0D6]">{l.note}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
