import React, { useState } from "react";
import { X } from "lucide-react";
import { Field, ErrorBanner } from "./Atoms";
import { ASSET_TYPES, MEDIA_TYPES, SENSITIVITY_LEVELS } from "../constants";
import { api } from "../api/client";

export default function IntakeForm({ onCreated, onClose }) {
  const [tag, setTag] = useState("");
  const [serial, setSerial] = useState("");
  const [type, setType] = useState(ASSET_TYPES[0]);
  const [mediaType, setMediaType] = useState(MEDIA_TYPES[0]);
  const [sensitivity, setSensitivity] = useState(SENSITIVITY_LEVELS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = tag.trim() && serial.trim() && !submitting;

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const { asset } = await api.createAsset({ tag: tag.trim(), serial: serial.trim(), type, mediaType, sensitivity });
      onCreated(asset);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-panel border border-[#3A424B] w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-mono text-sm uppercase tracking-wide text-paper">New intake record</h3>
          <button onClick={onClose} className="text-steel hover:text-paper"><X size={18} /></button>
        </div>

        <ErrorBanner message={error} />

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Asset tag"><input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="AST-0003" className="input" /></Field>
            <Field label="Serial number"><input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="SN-..." className="input" /></Field>
          </div>
          <Field label="Asset type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Media type">
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="input">
                {MEDIA_TYPES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Data sensitivity">
              <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} className="input">
                {SENSITIVITY_LEVELS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <button
          disabled={!canSubmit}
          onClick={submit}
          className="mt-5 w-full py-2 bg-amber disabled:bg-[#3A424B] disabled:text-steel text-ink font-mono text-xs uppercase tracking-wide font-bold hover:bg-[#EDA522] transition-colors"
        >
          {submitting ? "Logging..." : "Log asset"}
        </button>
      </div>
    </div>
  );
}
