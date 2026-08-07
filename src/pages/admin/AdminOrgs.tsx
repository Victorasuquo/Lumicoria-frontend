import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader } from "./adminUi";

const AdminOrgs: React.FC = () => {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState(false);
  const load = () => {
    setRows(null); setErr(false);
    adminApi.orgs({ page_size: 100 }).then((d: any) => setRows(d.items || [])).catch(() => setErr(true));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader
        eyebrow="Tenants"
        title="Organizations"
        subtitle="Workspace organizations across the platform."
        action={<button onClick={load} className="rounded-xl border border-black/10 bg-white p-2"><RefreshCw className="h-4 w-4" /></button>}
      />
      {err && <Card className="border-red-200 bg-red-50 text-sm text-red-700">Could not load organizations.</Card>}
      {!err && rows === null && <Loading />}
      {!err && rows && rows.length === 0 && <Card className="text-sm text-slate-500">No organizations found.</Card>}
      {rows && rows.length > 0 && (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="p-4">Organization</th><th>Plan</th><th>Members</th><th>Admins</th><th>Created</th></tr>
              </thead>
              <tbody>
                {rows.map((org: any) => (
                  <tr key={org._id || org.id} className="border-t border-slate-100">
                    <td className="p-4"><div className="font-bold">{org.name}</div><div className="text-xs text-slate-500">{org.slug || org._id || org.id}</div></td>
                    <td>{org.plan || "free"}</td>
                    <td>{org.member_ids?.length || 0}</td>
                    <td>{org.admin_ids?.length || 0}</td>
                    <td className="text-slate-500">{org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</td>
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

export default AdminOrgs;
