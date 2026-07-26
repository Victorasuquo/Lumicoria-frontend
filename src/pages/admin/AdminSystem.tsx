import React, { useEffect, useState } from "react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader, StatusPill } from "./adminUi";

const AdminSystem: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  useEffect(() => { adminApi.systemHealth().then(setHealth); adminApi.systemStorage().then(setStorage); }, []);
  return (
    <div>
      <PageHeader eyebrow="Operations" title="System health" subtitle="Live service checks and storage footprint." />
      {!health ? <Loading /> : <div className="grid gap-4 md:grid-cols-3">{Object.entries(health.services || {}).map(([name, svc]: any) => <Card key={name}><div className="flex items-center justify-between"><h2 className="font-black capitalize">{name}</h2><StatusPill tone={svc.ok ? "ok" : "bad"}>{svc.ok ? "OK" : "Fail"}</StatusPill></div>{svc.error && <p className="mt-3 text-xs text-red-600">{svc.error}</p>}</Card>)}</div>}
      <Card className="mt-6">
        <h2 className="text-lg font-black">Mongo storage</h2>
        {!storage ? <p className="mt-3 text-sm text-slate-500">Loading storage…</p> : <div className="mt-4 overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="py-2">Collection</th><th>Count</th><th>Storage</th></tr></thead><tbody>{(storage.collections || []).map((row: any) => <tr key={row.name} className="border-t border-slate-100"><td className="py-2 font-bold">{row.name}</td><td>{row.count}</td><td>{row.storageSize}</td></tr>)}</tbody></table></div>}
      </Card>
    </div>
  );
};

export default AdminSystem;
