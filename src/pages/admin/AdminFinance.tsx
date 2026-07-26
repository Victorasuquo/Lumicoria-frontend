import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import adminApi from "@/services/adminApi";
import { Card, Kpi, Loading, PageHeader, StatusPill } from "./adminUi";

const PLAN_COLORS = ["#6C4AB0", "#0EA5E9", "#F97316", "#16A34A", "#334155", "#9B87F5"];
const money = (value: number) => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const pct = (value: number) => `${Math.round(Number(value || 0) * 100)}%`;

const AdminFinance: React.FC = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminApi.finance().then(setData); }, []);
  if (!data) return <><PageHeader title="Finance" /><Loading /></>;

  const byPlan = data.by_plan || Object.entries(data.mrr_by_plan || {}).map(([plan, value]: any) => ({ plan, mrr_usd: Number(value), accounts: 0, arpu_usd: 0 }));
  const seat = data.seat_utilization || {};

  return (
    <div>
      <PageHeader eyebrow="Revenue" title="Finance" subtitle={`MRR, ARR, ARPU, seats, invoices, and plan mix. Computed ${new Date(data.computed_at).toLocaleString()}`} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi label="MRR" value={money(data.mrr_usd)} hint={`${money(data.arr_usd)} ARR`} />
        <Kpi label="Org MRR" value={money(data.org_mrr_usd)} hint={`${data.paying_orgs || 0} paying orgs`} />
        <Kpi label="Revenue MTD" value={money(data.revenue_mtd_usd)} />
        <Kpi label="ARPU" value={money(data.arpu_usd)} hint={`${data.paying_accounts || 0} paying accounts`} />
        <Kpi label="Paying users" value={data.paying_users || 0} />
        <Kpi label="Comped MRR" value={money(data.comped_mrr_usd)} hint={`${data.comped_count || 0} accounts`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-lg font-black">Revenue trend</h2>
          <p className="mt-1 text-sm text-slate-500">Paid and succeeded invoices grouped by month.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue_by_month || []} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: any) => money(Number(value))} />
                <Bar dataKey="revenue_usd" fill="#6C4AB0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black">MRR by plan</h2>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPlan} dataKey="mrr_usd" nameKey="plan" innerRadius={54} outerRadius={86} paddingAngle={3}>
                  {byPlan.map((_: any, index: number) => <Cell key={index} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {byPlan.map((row: any, index: number) => (
              <div key={row.plan} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-bold capitalize">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAN_COLORS[index % PLAN_COLORS.length] }} />
                  {row.plan}
                </span>
                <span className="text-slate-500">{money(row.mrr_usd)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-black">Seat utilization</h2>
          <div className="mt-4 text-4xl font-black">{pct(seat.rate)}</div>
          <p className="mt-2 text-sm text-slate-500">{seat.used || 0} used of {seat.purchased || 0} purchased seats.</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#6C4AB0]" style={{ width: `${Math.min(100, Number(seat.rate || 0) * 100)}%` }} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black">Invoice status</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(data.invoice_status_counts || {}).map(([status, count]: any) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="font-bold capitalize">{status}</span>
                <StatusPill tone={["paid", "succeeded"].includes(status) ? "ok" : status === "open" ? "warn" : "neutral"}>{count}</StatusPill>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black">Plan economics</h2>
          <div className="mt-4 space-y-3">
            {byPlan.slice(0, 5).map((row: any) => (
              <div key={row.plan} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black capitalize">{row.plan}</span>
                  <span className="text-sm text-slate-500">{row.accounts || 0} accounts</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{money(row.arpu_usd)} ARPU</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-black">Recent paid invoices</h2>
          <p className="mt-1 text-sm text-slate-500">Latest paid revenue records from the invoice collection.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="p-4">Invoice</th><th>Status</th><th>Amount</th><th>Customer</th><th>Paid</th></tr>
            </thead>
            <tbody>
              {(data.recent_invoices || []).map((invoice: any) => (
                <tr key={invoice.id || invoice._id} className="border-t border-slate-100">
                  <td className="p-4 font-bold">{invoice.number || invoice.stripe_invoice_id || invoice.id || invoice._id}</td>
                  <td><StatusPill tone="ok">{invoice.status}</StatusPill></td>
                  <td>{money(Number(invoice.amount_paid ?? invoice.amount ?? 0) / 100)}</td>
                  <td className="text-slate-500">{invoice.customer_email || invoice.user_id || invoice.organization_id || "unknown"}</td>
                  <td className="text-slate-500">{invoice.paid_at || invoice.created_at ? new Date(invoice.paid_at || invoice.created_at).toLocaleString() : "unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminFinance;
