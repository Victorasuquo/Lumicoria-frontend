import React, { useEffect, useState } from "react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader, StatusPill } from "./adminUi";

const AdminAudit: React.FC = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminApi.audit({ limit: 200 }).then(setData); }, []);
  return (
    <div>
      <PageHeader eyebrow="Immutable trail" title="Admin audit" subtitle="Superadmin mutations and outbound actions." />
      {!data ? <Loading /> : <Card className="p-0"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="p-4">Time</th><th>Action</th><th>Admin</th><th>Target</th><th>Result</th></tr></thead><tbody>{(data.items || []).map((row: any) => <tr key={row.id || row._id} className="border-t border-slate-100"><td className="p-4">{row.ts ? new Date(row.ts).toLocaleString() : "—"}</td><td className="font-bold">{row.action}</td><td>{row.admin_email}</td><td>{row.target_email || row.target_id || "—"}</td><td><StatusPill tone={row.result === "success" ? "ok" : "bad"}>{row.result}</StatusPill></td></tr>)}</tbody></table></Card>}
    </div>
  );
};

export default AdminAudit;
