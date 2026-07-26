import React, { useEffect, useState } from "react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader } from "./adminUi";

const AdminOrgs: React.FC = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminApi.orgs({ page_size: 100 }).then(setData); }, []);
  return (
    <div>
      <PageHeader eyebrow="Tenants" title="Organizations" subtitle="Workspace organizations across the platform." />
      {!data ? <Loading /> : <Card className="p-0"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="p-4">Organization</th><th>Plan</th><th>Members</th><th>Admins</th><th>Created</th></tr></thead><tbody>{(data.items || []).map((org: any) => <tr key={org._id || org.id} className="border-t border-slate-100"><td className="p-4"><div className="font-bold">{org.name}</div><div className="text-xs text-slate-500">{org.slug || org._id || org.id}</div></td><td>{org.plan || "free"}</td><td>{org.member_ids?.length || 0}</td><td>{org.admin_ids?.length || 0}</td><td>{org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></Card>}
    </div>
  );
};

export default AdminOrgs;
