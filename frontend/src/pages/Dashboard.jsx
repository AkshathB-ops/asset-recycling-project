import React, { useEffect, useMemo, useState } from "react";
import { Plus, ChevronRight, HardDrive, CircleAlert, Users, LogOut } from "lucide-react";
import CustodyStepper from "../components/CustodyStepper";
import StatCard from "../components/StatCard";
import { Pill } from "../components/Atoms";
import IntakeForm from "../components/IntakeForm";
import DetailDrawer from "../components/DetailDrawer";
import Certificate from "../components/Certificate";
import UserAdmin from "../components/UserAdmin";
import { levelTone } from "../constants";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showIntake, setShowIntake] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selected, setSelected] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [certData, setCertData] = useState(null);

  function loadAll() {
    setLoading(true);
    Promise.all([api.listAssets(), api.getStats()])
      .then(([{ assets }, stats]) => {
        setAssets(assets);
        setStats(stats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function openAsset(asset) {
    try {
      const { asset: full, suggestion } = await api.getAsset(asset._id);
      setSelected(full);
      setSuggestion(suggestion);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleAssetChanged(updated) {
    setAssets((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    setSelected(updated);
    api.getStats().then(setStats).catch(() => {});
  }

  async function viewCertificate(asset) {
    try {
      const data = await api.getCertificate(asset._id);
      setCertData(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const restrictedCount = useMemo(() => assets.filter((a) => a.sensitivity === "Restricted").length, [assets]);

  return (
    <div className="min-h-screen bg-ink text-[#C9D0D6] font-sans">
      <header className="border-b border-line px-6 py-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-steel font-mono mb-1">Secure Asset Recycling</div>
          <h1 className="text-xl font-semibold text-paper tracking-tight font-mono">Chain-of-Custody Ledger</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-[11px] text-steel mr-2">
            <div className="text-paper">{user.name}</div>
            <div className="uppercase">{user.role}</div>
          </div>
          {user.role === "admin" && (
            <button onClick={() => setShowAdmin(true)} className="p-2 border border-line text-steel hover:text-paper hover:border-steel transition-colors" title="Manage accounts">
              <Users size={16} />
            </button>
          )}
          {(user.role === "admin" || user.role === "intake_tech") && (
            <button
              onClick={() => setShowIntake(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber text-ink font-mono text-xs uppercase tracking-wide font-bold hover:bg-[#EDA522] transition-colors"
            >
              <Plus size={14} /> Intake asset
            </button>
          )}
          <button onClick={logout} className="p-2 border border-line text-steel hover:text-paper hover:border-steel transition-colors" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-line">
        <StatCard label="Assets tracked" value={stats?.total} />
        <StatCard label="In sanitization pipeline" value={stats?.inProgress} tone="amber" />
        <StatCard label="Certified" value={stats?.certified} tone="verified" />
        <StatCard label="Restricted-class" value={stats?.restricted ?? restrictedCount} tone="redact" icon={CircleAlert} />
      </div>

      <main className="p-6">
        {error && <div className="bg-[#3A1414] border border-[#5C2020] text-[#E17777] text-[12px] font-mono px-3 py-2 mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-steel font-mono text-sm">Loading assets…</div>
        ) : assets.length === 0 ? (
          <div className="text-center py-20 text-steel font-mono text-sm">
            No assets logged yet. Intake the first device to open its custody record.
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((a) => {
              return (
                <div
                  key={a._id}
                  onClick={() => openAsset(a)}
                  className="group flex items-center gap-4 bg-panel border border-line hover:border-steel px-4 py-3 cursor-pointer transition-colors"
                >
                  <HardDrive size={20} className="text-steel shrink-0" />
                  <div className="w-32 shrink-0">
                    <div className="font-mono text-sm text-paper">{a.tag}</div>
                    <div className="font-mono text-[10px] text-steel">{a.serial}</div>
                  </div>
                  <div className="w-28 shrink-0 text-[12px] text-[#9FACB8] hidden sm:block">{a.mediaType}</div>
                  <Pill tone={a.sensitivity === "Restricted" ? "redact" : a.sensitivity === "Confidential" ? "amber" : "steel"}>
                    {a.sensitivity}
                  </Pill>
                  <div className="flex-1 hidden md:block">
                    <CustodyStepper stageIndex={a.stageIndex} />
                  </div>
                  {a.method && <Pill tone={levelTone(a.method.level)}>{a.method.level}</Pill>}
                  <ChevronRight size={16} className="text-[#3A424B] group-hover:text-steel shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showIntake && <IntakeForm onCreated={(a) => setAssets((prev) => [a, ...prev])} onClose={() => { setShowIntake(false); api.getStats().then(setStats).catch(() => {}); }} />}
      {selected && (
        <DetailDrawer
          asset={selected}
          suggestion={suggestion}
          onClose={() => setSelected(null)}
          onChanged={handleAssetChanged}
          onViewCertificate={viewCertificate}
        />
      )}
      {certData && <Certificate data={certData} onClose={() => setCertData(null)} />}
      {showAdmin && <UserAdmin onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
