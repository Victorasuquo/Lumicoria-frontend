import React, { useEffect, useMemo, useState } from "react";
import adminApi, { AdminUserRow } from "@/services/adminApi";
import { getErrorMessage } from "@/services/api";
import { Card, Kpi, Loading, PageHeader, StatusPill } from "./adminUi";

const AdminUsers: React.FC = () => {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [upgrade, setUpgrade] = useState({ email: "", plan: "professional", reason: "Founder admin upgrade" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 50;

  const load = async (targetPage = page, targetQuery = q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.users({ q: targetQuery || undefined, page: targetPage, page_size: pageSize });
      setRows(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(getErrorMessage(err, "Could not load admin users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(page, q); }, [page]);

  const stats = useMemo(() => {
    const active = rows.filter(row => row.is_active).length;
    const superadmins = rows.filter(row => row.is_superuser).length;
    const comped = rows.filter(row => row.is_comped).length;
    const cost = rows.reduce((sum, row) => sum + Number(row.cost_usd || 0), 0);
    return { active, superadmins, comped, cost };
  }, [rows]);

  const search = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }
    void load(1, q);
  };

  const clearSearch = () => {
    setQ("");
    if (page !== 1) {
      setPage(1);
      return;
    }
    void load(1, "");
  };

  const openUser = async (id: string) => {
    setError(null);
    try {
      setSelected(await adminApi.userDetail(id));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load user details."));
    }
  };

  const toggleUser = async (row: AdminUserRow) => {
    setError(null);
    try {
      await adminApi.patchUser(row.id, { is_active: !row.is_active });
      await load();
      if (selected?.user?.id === row.id || selected?.user?._id === row.id) {
        await openUser(row.id);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not update user status."));
    }
  };

  const doUpgrade = async () => {
    setError(null);
    try {
      await adminApi.planUpgrade({ ...upgrade, send_email: true });
      setUpgrade({ ...upgrade, email: "" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not upgrade this user."));
    }
  };

  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader eyebrow="People" title="Users" subtitle="Search users, inspect usage, suspend access, and grant plan overrides." />

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Kpi label="Loaded users" value={rows.length} hint={`${total} total`} />
        <Kpi label="Active loaded" value={stats.active} />
        <Kpi label="Superadmins" value={stats.superadmins} />
        <Kpi label="Loaded cost" value={`$${stats.cost.toFixed(4)}`} hint={`${stats.comped} comped loaded`} />
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search email or name"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
        />
        <button onClick={search} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Search</button>
        {q && <button onClick={clearSearch} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear</button>}
      </div>

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50 text-red-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-black">Users could not load</div>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => void load()} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">Retry</button>
          </div>
        </Card>
      )}

      {loading ? <Loading /> : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="p-4">User</th><th>Status</th><th>Plan</th><th>Orgs</th><th>Runs</th><th>Cost</th><th>Last active</th><th /></tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr className="border-t border-slate-100">
                    <td colSpan={8} className="p-8 text-center">
                      <div className="font-black text-slate-900">{error ? "No users rendered because the request failed." : "No users found."}</div>
                      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                        {error ? "The message above is the backend response. Fix that first, then retry." : "Try clearing the search or check that this environment has user records."}
                      </p>
                    </td>
                  </tr>
                )}
                {rows.map(row => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-purple-50/40">
                    <td onClick={() => openUser(row.id)} className="cursor-pointer p-4">
                      <div className="font-bold">{row.full_name || "No name"}</div>
                      <div className="text-xs text-slate-500">{row.email}</div>
                    </td>
                    <td>
                      <StatusPill tone={row.is_active ? "ok" : "bad"}>{row.is_active ? "Active" : "Suspended"}</StatusPill>
                      {row.is_superuser && <span className="ml-2"><StatusPill tone="warn">Superadmin</StatusPill></span>}
                    </td>
                    <td>
                      <StatusPill tone={row.is_comped ? "warn" : row.plan && row.plan !== "free" ? "ok" : "neutral"}>
                        {row.is_comped ? `${row.plan || "free"} comped` : row.plan || "free"}
                      </StatusPill>
                    </td>
                    <td>{row.organization_ids?.length || (row.organization_id ? 1 : 0)}</td>
                    <td>{row.runs || 0}</td>
                    <td>${(row.cost_usd || 0).toFixed(4)}</td>
                    <td>{row.last_active ? new Date(row.last_active).toLocaleString() : "Never"}</td>
                    <td className="pr-4 text-right">
                      <button onClick={() => toggleUser(row)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        {row.is_active ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm text-slate-500">
            <span>Page {page} of {lastPage}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Previous</button>
              <button disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Next</button>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black">Plan upgrade by email</h2>
          <div className="mt-4 grid gap-3">
            <input value={upgrade.email} onChange={e => setUpgrade({ ...upgrade, email: e.target.value })} placeholder="user@example.com" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select value={upgrade.plan} onChange={e => setUpgrade({ ...upgrade, plan: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <input value={upgrade.reason} onChange={e => setUpgrade({ ...upgrade, reason: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button onClick={doUpgrade} disabled={!upgrade.email} className="rounded-xl bg-[#6C4AB0] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Upgrade and email user</button>
          </div>
        </Card>

        {selected ? (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">{selected.user?.full_name || "No name"}</h2>
                <p className="text-sm text-slate-500">{selected.user?.email}</p>
              </div>
              <StatusPill tone={selected.user?.is_active === false ? "bad" : "ok"}>{selected.user?.is_active === false ? "Suspended" : "Active"}</StatusPill>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Detail label="Runs" value={selected.usage?.totals?.runs || 0} />
              <Detail label="Tokens" value={(selected.usage?.totals?.tokens_in || 0) + (selected.usage?.totals?.tokens_out || 0)} />
              <Detail label="Cost" value={`$${(selected.usage?.totals?.cost_usd || 0).toFixed(4)}`} />
              <Detail label="Plan" value={selected.subscription?.admin_override_plan || selected.subscription?.plan || "free"} />
              <Detail label="Organizations" value={selected.organizations?.length || 0} />
              <Detail label="Created" value={selected.user?.created_at ? new Date(selected.user.created_at).toLocaleDateString() : "Unknown"} />
            </div>
            <div className="mt-5">
              <h3 className="text-sm font-black">Top agent usage</h3>
              <div className="mt-2 space-y-2">
                {(selected.usage?.by_agent || []).slice(0, 5).map((agent: any) => (
                  <div key={agent._id || agent.agent_key} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-bold">{agent._id || agent.agent_key || "unknown"}</span>
                    <span className="text-slate-500">{agent.runs || 0} runs</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="text-lg font-black">Select a user</h2>
            <p className="mt-2 text-sm text-slate-500">Click a row to inspect subscription, organizations, usage, and agent activity.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-3">
    <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
    <div className="mt-1 font-black text-slate-950">{value}</div>
  </div>
);

export default AdminUsers;
