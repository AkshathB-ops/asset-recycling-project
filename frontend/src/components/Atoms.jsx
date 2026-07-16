import React from "react";

const TONES = {
  steel: "bg-[#2A3138] text-[#9FACB8] border-[#3A424B]",
  amber: "bg-[#3A2C0D] text-[#E4A93A] border-[#5C4614]",
  verified: "bg-[#123822] text-[#5FBF88] border-[#1E5236]",
  redact: "bg-[#3A1414] text-[#E17777] border-[#5C2020]",
};

export function Pill({ children, tone = "steel" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border font-mono text-[11px] tracking-wide uppercase ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide text-steel mb-1 font-mono">{label}</span>
      {children}
    </label>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-[#3A1414] border border-[#5C2020] text-[#E17777] text-[12px] font-mono px-3 py-2 mb-3">
      {message}
    </div>
  );
}
