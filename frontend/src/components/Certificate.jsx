import React from "react";
import { X } from "lucide-react";

export default function Certificate({ data, onClose }) {
  if (!data) return null;
  const { certificateId, issuedAt, asset } = data;
  const issued = new Date(issuedAt);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-paper text-ink max-w-xl w-full p-8 relative font-mono shadow-2xl"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(20,24,28,0.035) 28px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-ink/50 hover:text-ink">
          <X size={18} />
        </button>
        <div className="flex items-start justify-between border-b-2 border-ink pb-3 mb-5">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-steel">Media Sanitization Record</div>
            <div className="text-xl font-bold tracking-tight">Certificate of Destruction</div>
          </div>
          <div className="rotate-[-8deg] border-2 border-verified text-verified px-3 py-1 text-xs font-bold tracking-widest">CERTIFIED</div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] mb-5">
          <div><dt className="text-steel text-[10px] uppercase">Asset Tag</dt><dd>{asset.tag}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">Serial No.</dt><dd>{asset.serial}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">Asset Type</dt><dd>{asset.type}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">Media Type</dt><dd>{asset.mediaType}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">Data Sensitivity</dt><dd>{asset.sensitivity}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">NIST 800-88 Level</dt><dd>{asset.method?.level}</dd></div>
          <div className="col-span-2"><dt className="text-steel text-[10px] uppercase">Method Applied</dt><dd>{asset.method?.method}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">Date Issued</dt><dd>{issued.toLocaleDateString()}</dd></div>
          <div><dt className="text-steel text-[10px] uppercase">Certificate ID</dt><dd>{certificateId}</dd></div>
        </dl>

        <div className="border-t border-ink/30 pt-3">
          <div className="text-[10px] uppercase text-steel mb-1">Chain of custody</div>
          <ul className="text-[11px] space-y-0.5">
            {asset.log.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-steel">{new Date(l.at).toLocaleDateString()}</span>
                <span>{l.actorName} — {l.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] text-steel mt-5 leading-relaxed">
          This record attests that the media described above was sanitized in accordance with NIST SP 800-88
          Guidelines for Media Sanitization. Retain for compliance and audit purposes.
        </p>
      </div>
    </div>
  );
}
