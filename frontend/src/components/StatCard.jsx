import React from "react";

const TONE_COLOR = { steel: "#EDEAE2", amber: "#D98E04", verified: "#5FBF88", redact: "#E17777" };

export default function StatCard({ label, value, tone = "steel", icon: Icon }) {
  return (
    <div className="bg-panel border border-line p-3">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-steel font-mono mb-1">
        {Icon && <Icon size={11} />} {label}
      </div>
      <div className="text-2xl font-mono font-semibold" style={{ color: TONE_COLOR[tone] }}>{value ?? "—"}</div>
    </div>
  );
}
