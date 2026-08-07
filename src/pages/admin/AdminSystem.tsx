import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader, StatusPill } from "./adminUi";

const AdminSystem: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [err, setErr] = useState(false);

  const load = () => {
    setHealth(null); setStorage(null); setErr(false);
    adminApi.systemHealth().then(setHealth).catch(() => setErr(true));
    adminApi.systemStorage().then(setStorage).catch(() => setStorage({ collections: [] }));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="System health"
        subtitle="Live service checks and storage footprint."
        action={<button onClick={load} className="rounded-xl border border-black/10 bg-white p-2"><RefreshCw className="h-4 w-4" /></button>}
      />
      {err && <Card className="border-red-200 bg-red-50 text-sm text-red-700">Could not reach the system-health endpoint.</Card>}
      {!err && !health ? <Loading /> : !err && (
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(health.services || {}).map(([name, svc]: any) => (
            <Card key={name}>
              <div className="flex items-center justify-between"><h2 className="font-black capitalize">{name}</h2><StatusPill tone={svc.ok ? "ok" : "bad"}>{svc.ok ? "OK" : "Fail"}</StatusPill></div>
              {svc.error && <p className="mt-3 text-xs text-red-600">{svc.error}</p>}
            </Card>
          ))}
          {Object.keys(health.services || {}).length === 0 && <Card className="text-sm text-slate-500">No services reported.</Card>}
        </div>
      )}
      <Card className="mt-6">
        <h2 className="text-lg font-black">Mongo storage</h2>
        {!storage ? <p className="mt-3 text-sm text-slate-500">Loading storage…</p>
          : (storage.collections || []).length === 0 ? <p className="mt-3 text-sm text-slate-500">No collection stats available.</p>
          : <div className="mt-4 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400"><tr><th className="py-2">Collection</th><th>Count</th><th>Storage</th></tr></thead>
                <tbody>
                  {(storage.collections || []).map((row: any) => (
                    <tr key={row.name} className="border-t border-slate-100"><td className="py-2 font-bold">{row.name}</td><td>{row.count}</td><td className="text-slate-500">{row.storageSize}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </Card>
    </div>
  );
};

export default AdminSystem;
