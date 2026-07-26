import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import adminApi, { Range } from "@/services/adminApi";
import { Card, Kpi, Loading, PageHeader, StatusPill } from "./adminUi";

const currency = (value: number) => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const pct = (value: number) => `${Math.round(Number(value || 0) * 100)}%`;

const AdminOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.overview(range).then(setData).finally(() => setLoading(false));
  }, [range]);

  const combinedSeries = useMemo(() => {
    const users = data?.users?.series || [];
    const orgs = data?.orgs?.series || [];
    const runs = data?.agent_runs?.series || [];
    const byDay = new Map<string, any>();
    for (const row of users) byDay.set(row.day, { ...(byDay.get(row.day) || {}), ...row });
    for (const row of orgs) byDay.set(row.day, { ...(byDay.get(row.day) || {}), ...row });
    for (const row of runs) byDay.set(row.day, { ...(byDay.get(row.day) || {}), ...row });
    return Array.from(byDay.values()).sort((a, b) => String(a.day).localeCompare(String(b.day)));
  }, [data]);

  if (loading && !data) return <><PageHeader title="Platform overview" /><Loading /></>;

  return (
    <div>
      <PageHeader
        eyebrow="Superadmin"
        title="Platform overview"
        subtitle={`Everything that matters at a glance. Computed ${data?.computed_at ? new Date(data.computed_at).toLocaleString() : "now"}`}
        action={
          <select value={range} onChange={e => setRange(e.target.value as Range)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="90d">90d</option>
          </select>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Users" value={data?.users?.total ?? 0} hint={`${data?.users?.active ?? 0} active, ${pct(data?.users?.activation_rate)} active rate`} />
        <Kpi label="New users" value={data?.users?.new_in_range ?? 0} hint={range} />
        <Kpi label="Organizations" value={data?.orgs?.total ?? 0} />
        <Kpi label="Agent runs" value={(data?.agent_runs?.total ?? 0).toLocaleString()} hint={`${(data?.agent_runs?.tokens ?? 0).toLocaleString()} tokens`} />
        <Kpi label="Run cost" value={currency(data?.agent_runs?.cost_usd ?? 0)} hint={`${pct(data?.agent_runs?.error_rate)} error rate`} />
        <Kpi label="Open tickets" value={data?.open_tickets ?? 0} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black">Platform motion</h2>
              <p className="mt-1 text-sm text-slate-500">New users, new orgs, run volume, and errors over the selected range.</p>
            </div>
            {loading && <StatusPill>Refreshing</StatusPill>}
          </div>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={42} allowDecimals={false} />
                <Tooltip />
                <Area yAxisId="right" type="monotone" dataKey="runs" name="Agent runs" stroke="#6C4AB0" fill="#6C4AB0" fillOpacity={0.12} strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="new_users" name="New users" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.10} strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="new_orgs" name="New orgs" stroke="#F97316" fill="#F97316" fillOpacity={0.08} strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="errors" name="Errors" stroke="#DC2626" fill="#DC2626" fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black">Operating quality</h2>
          <div className="mt-5 grid gap-3">
            <QualityRow label="Activation" value={pct(data?.users?.activation_rate)} tone={(data?.users?.activation_rate ?? 0) >= 0.5 ? "ok" : "warn"} />
            <QualityRow label="Task completion" value={pct(data?.tasks?.completion_rate)} tone={(data?.tasks?.completion_rate ?? 0) >= 0.6 ? "ok" : "warn"} />
            <QualityRow label="Document processing" value={pct(data?.documents?.processing_rate)} tone={(data?.documents?.processing_rate ?? 0) >= 0.8 ? "ok" : "warn"} />
            <QualityRow label="Agent error rate" value={pct(data?.agent_runs?.error_rate)} tone={(data?.agent_runs?.error_rate ?? 0) <= 0.05 ? "ok" : "bad"} />
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Review queue</div>
            <div className="mt-2 text-3xl font-black">{data?.tasks?.pending_proposals ?? 0}</div>
            <p className="mt-1 text-sm text-slate-500">Agent proposals waiting for admin or workspace review.</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-black">Top agents</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.top_agents || []).map((agent: any) => ({ ...agent, name: agent.agent_key || agent._id || "unknown" }))} layout="vertical" margin={{ left: 12, right: 8 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="runs" fill="#6C4AB0" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black">Plan mix</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(data?.users?.plan_counts || {}).map(([plan, count]: any) => (
              <div key={plan}>
                <div className="flex justify-between text-sm">
                  <span className="font-bold capitalize">{plan}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#6C4AB0]" style={{ width: `${Math.min(100, (Number(count) / Math.max(1, data?.users?.total || 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
            {(data?.users?.comped ?? 0) > 0 && <StatusPill tone="warn">{data.users.comped} comped accounts</StatusPill>}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {(data?.risks || []).length === 0 ? (
          <Card className="lg:col-span-3">
            <h2 className="text-lg font-black">No current admin risk flags</h2>
            <p className="mt-2 text-sm text-slate-500">The selected range has no high-signal warnings from the platform checks.</p>
          </Card>
        ) : (data?.risks || []).map((risk: any) => (
          <Card key={`${risk.label}-${risk.value}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black">{risk.label}</h2>
              <StatusPill tone={risk.level === "high" ? "bad" : risk.level === "medium" ? "warn" : "neutral"}>{risk.level}</StatusPill>
            </div>
            <div className="mt-3 text-3xl font-black">{typeof risk.value === "number" && risk.value < 1 ? pct(risk.value) : risk.value}</div>
            <p className="mt-2 text-sm text-slate-500">{risk.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const QualityRow: React.FC<{ label: string; value: string; tone: "ok" | "warn" | "bad" }> = ({ label, value, tone }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <StatusPill tone={tone}>{value}</StatusPill>
  </div>
);

export default AdminOverview;
