import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader, StatusPill } from "./adminUi";

const AdminAudit: React.FC = () => {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState(false);
  const [action, setAction] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [targetType, setTargetType] = useState("");

  const load = () => {
    setRows(null); setErr(false);
    adminApi
      .audit({ action: action || undefined, admin_email: adminEmail || undefined, target_type: targetType || undefined, limit: 200 })
      .then((d: any) => setRows(d.items || []))
      .catch(() => setErr(true));
  };
  useEffect(load, [targetType]);

  return (
    <div>
      <PageHeader eyebrow="Immutable trail" title="Admin audit" subtitle="Superadmin mutations and outbound actions." />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input value={action} onChange={e => setAction(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Action (e.g. user.impersonate)" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Admin email" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        <select value={targetType} onChange={e => setTargetType(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
          <option value="">All targets</option>
          <option value="user">user</option>
          <option value="conversation">conversation</option>
          <option value="agent_run">agent_run</option>
          <option value="brain_run">brain_run</option>
        </select>
        <button onClick={load} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Search</button>
        {(action || adminEmail || targetType) && <button onClick={() => { setAction(""); setAdminEmail(""); setTargetType(""); }} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear</button>}
        <button onClick={load} className="rounded-2xl border border-slate-200 px-3 py-3"><RefreshCw className="h-4 w-4" /></button>
      </div>

      {err && <Card className="border-red-200 bg-red-50 text-sm text-red-700">Could not load the audit log.</Card>}
      {!err && rows === null && <Loading />}
      {!err && rows && rows.length === 0 && <Card className="text-sm text-slate-500">No audit entries match.</Card>}
      {rows && rows.length > 0 && (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="p-4">Time</th><th>Action</th><th>Admin</th><th>Target</th><th>Result</th></tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row.id || row._id} className="border-t border-slate-100">
                    <td className="p-4 text-slate-500">{row.ts ? new Date(row.ts).toLocaleString() : "—"}</td>
                    <td className="font-bold">{row.action}</td>
                    <td className="text-slate-500">{row.admin_email}</td>
                    <td className="text-slate-500">{row.target_email || row.target_id || "—"}</td>
                    <td><StatusPill tone={row.result === "success" ? "ok" : row.result ? "bad" : "neutral"}>{row.result || "ok"}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminAudit;
