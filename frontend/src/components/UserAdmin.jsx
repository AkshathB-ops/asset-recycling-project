import React, { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Field, ErrorBanner, Pill } from "./Atoms";
import { ROLES } from "../constants";
import { api } from "../api/client";

export default function UserAdmin({ onClose }) {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("intake_tech");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh() {
    api.listUsers().then(({ users }) => setUsers(users)).catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      await api.createUser({ username: username.trim(), name: name.trim(), password, role });
      setUsername("");
      setName("");
      setPassword("");
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-panel border border-line w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-mono text-sm uppercase tracking-wide text-paper">Accounts</h3>
          <button onClick={onClose} className="text-steel hover:text-paper"><X size={18} /></button>
        </div>

        <ErrorBanner message={error} />

        <div className="mb-6 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border border-line px-3 py-2 font-mono text-[12px]">
              <div>
                <div className="text-paper">{u.name} <span className="text-steel">@{u.username}</span></div>
              </div>
              <Pill tone={u.role === "admin" ? "redact" : "steel"}>{u.role}</Pill>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-4">
          <div className="text-[10px] uppercase tracking-wide text-steel font-mono mb-3">Create account</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Username"><input className="input" value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
            <Field label="Full name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Temporary password"><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <Field label="Role">
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <button
            onClick={submit}
            disabled={busy || !username || !name || password.length < 8}
            className="w-full py-2 bg-amber disabled:bg-[#3A424B] disabled:text-steel text-ink font-mono text-xs uppercase tracking-wide font-bold hover:bg-[#EDA522] transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={13} /> {busy ? "Creating..." : "Create account"}
          </button>
          <p className="text-[10px] text-steel font-mono mt-2">Password must be at least 8 characters.</p>
        </div>
      </div>
    </div>
  );
}
