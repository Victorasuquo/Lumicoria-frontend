/**
 * AdminAgents — platform agent catalog + usage, with per-agent drill-down.
 *
 * Every agent in the registry shows (zero-filled) with its name + description,
 * so the panel is never blank. Click a row to inspect recent runs, latency
 * percentiles, and errors for that agent.
 */

import React, { useEffect, useState } from "react";
import { Bot, RefreshCw, X } from "lucide-react";
import adminApi, { AgentStatRow, AgentDetail } from "@/services/adminApi";
import { Card, Kpi, Loading, PageHeader, StatusPill } from "./adminUi";

type Range = "7d" | "30d" | "90d";

function fmtMs(ms?: number | null): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}
function statusTone(s?: string): "ok" | "warn" | "bad" | "neutral" {
  if (s === "completed" || s === "ok" || s === "success") return "ok";
  if (s === "error" || s === "failed") return "bad";
  if (s === "running") return "warn";
  return "neutral";
}

const AgentDrawer: React.FC<{ agentKey: string; range: Range; onClose: () => void }> = ({ agentKey, range, onClose }) => {
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    setDetail(null); setErr(false);
    adminApi.agentDetail(agentKey, range).then(setDetail).catch(() => setErr(true));
  }, [agentKey, range]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-2xl overflow-auto bg-[#F7F4EF] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-lg font-black text-slate-900">{detail?.name || agentKey}</div>
            <div className="text-xs text-slate-500">{detail?.description || agentKey}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-black/10 bg-white p-1.5"><X className="h-4 w-4" /></button>
        </div>
        {err && <Card className="border-red-200 bg-red-50 text-sm text-red-700">Could not load agent detail.</Card>}
        {!err && !detail && <Loading />}
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi label="Runs" value={detail.total_runs} />
              <Kpi label="Errors" value={detail.errors} />
              <Kpi label="p50" value={fmtMs(detail.p50_ms)} />
              <Kpi label="p95" value={fmtMs(detail.p95_ms)} />
            </div>
            <Card className="!p-0">
              <div className="border-b border-black/5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Recent runs</div>
              {detail.runs.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">No runs in this window.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr><th className="p-2.5">When</th><th>Status</th><th>Trigger</th><th>Model</th><th>Tokens</th><th>Cost</th><th>Latency</th></tr>
                    </thead>
                    <tbody>
                      {detail.runs.map((r) => (
                        <tr key={r._id} className="border-t border-slate-100 align-top">
                          <td className="p-2.5 text-slate-500">{r.started_at ? new Date(r.started_at).toLocaleString() : "—"}</td>
                          <td><StatusPill tone={statusTone(r.status)}>{r.status || "—"}</StatusPill></td>
                          <td className="text-slate-500">{r.trigger || "—"}</td>
                          <td className="text-slate-500">{r.model_used || r.provider || "—"}</td>
                          <td className="text-slate-500">{(r.tokens_input || 0) + (r.tokens_output || 0)}</td>
                          <td className="text-slate-500">${(r.cost_usd || 0).toFixed(4)}</td>
                          <td className="text-slate-500">{fmtMs(r.duration_ms)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminAgents: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatRow[] | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [err, setErr] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const load = () => {
    setAgents(null); setErr(false);
    adminApi.agents(range).then((d) => setAgents(d.agents || [])).catch(() => setErr(true));
  };
  useEffect(load, [range]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="AI usage"
        title="Agents"
        subtitle="Full agent catalog with usage. Click an agent to drill into its runs, latency, and errors."
        action={
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="rounded-xl border border-black/10 bg-white p-2"><RefreshCw className="h-4 w-4" /></button>
            <select value={range} onChange={(e) => setRange(e.target.value as Range)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">
              <option value="7d">7d</option><option value="30d">30d</option><option value="90d">90d</option>
            </select>
          </div>
        }
      />

      {err && <Card className="border-red-200 bg-red-50 text-sm text-red-700">Could not load agents. Check the admin API / your permissions.</Card>}
      {!err && agents === null && <Loading />}
      {!err && agents && agents.length === 0 && <Card className="text-sm text-slate-500">No agents in the catalog.</Card>}

      {agents && agents.length > 0 && (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr><th className="p-4">Agent</th><th>Runs</th><th>Users</th><th>Tokens</th><th>Cost</th><th>Errors</th><th>Avg</th></tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.agent_key} onClick={() => setSelected(a.agent_key)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4AB0]/10"><Bot className="h-4 w-4 text-[#6C4AB0]" /></div>
                        <div>
                          <div className="font-bold text-slate-800">{a.name}</div>
                          <div className="max-w-md truncate text-[11px] text-slate-400">{a.description || a.agent_key}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold">{a.runs}</td>
                    <td className="text-slate-500">{a.unique_users}</td>
                    <td className="text-slate-500">{(a.tokens_in + a.tokens_out).toLocaleString()}</td>
                    <td className="text-slate-500">${a.cost_usd.toFixed(4)}</td>
                    <td className={a.errors ? "font-semibold text-red-600" : "text-slate-500"}>{a.errors}</td>
                    <td className="text-slate-500">{fmtMs(a.avg_duration_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && <AgentDrawer agentKey={selected} range={range} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AdminAgents;
