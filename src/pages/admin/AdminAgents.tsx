import React, { useEffect, useState } from "react";
import adminApi from "@/services/adminApi";
import { Card, Loading, PageHeader } from "./adminUi";

const AdminAgents: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  useEffect(() => { adminApi.agents(range).then(setData); }, [range]);
  return (
    <div>
      <PageHeader eyebrow="AI usage" title="Agent leaderboard" action={<select value={range} onChange={e => setRange(e.target.value as any)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"><option value="7d">7d</option><option value="30d">30d</option><option value="90d">90d</option></select>} />
      {!data ? <Loading /> : <Card className="p-0"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="p-4">Agent</th><th>Runs</th><th>Users</th><th>Tokens</th><th>Cost</th><th>Errors</th></tr></thead><tbody>{(data.agents || []).map((row: any) => <tr key={row.agent_key || row._id} className="border-t border-slate-100"><td className="p-4 font-bold">{row.agent_key || row._id || "unknown"}</td><td>{row.runs || 0}</td><td>{row.unique_users || 0}</td><td>{(row.tokens_in || 0) + (row.tokens_out || 0)}</td><td>${(row.cost_usd || 0).toFixed(4)}</td><td>{row.errors || 0}</td></tr>)}</tbody></table></Card>}
    </div>
  );
};

export default AdminAgents;
