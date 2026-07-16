import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Field, ErrorBanner } from "../components/Atoms";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-panel border border-line p-8">
        <div className="flex items-center gap-2 mb-1 text-steel">
          <ShieldCheck size={18} />
          <span className="text-[10px] uppercase tracking-[0.25em] font-mono">Secure Asset Recycling</span>
        </div>
        <h1 className="text-xl font-mono font-semibold text-paper mb-6">Sign in</h1>

        <ErrorBanner message={error} />

        <div className="space-y-3">
          <Field label="Username">
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </Field>
          <Field label="Password">
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        </div>

        <button
          type="submit"
          disabled={busy || !username || !password}
          className="mt-6 w-full py-2 bg-amber disabled:bg-[#3A424B] disabled:text-steel text-ink font-mono text-xs uppercase tracking-wide font-bold hover:bg-[#EDA522] transition-colors"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-[10px] text-steel font-mono mt-4 leading-relaxed">
          No account? Ask an admin to create one, or run <span className="text-[#C9D0D6]">npm run seed</span> in the
          backend to bootstrap the first admin.
        </p>
      </form>
    </div>
  );
}
