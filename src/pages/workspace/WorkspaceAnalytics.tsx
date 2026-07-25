import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { analyticsV2Api, agentsV2Api } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Skeleton, EmptyState } from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT } from "@/components/workspace/tokens";
import { TrendLineChart } from "@/components/charts";

/**
 * Workspace-level analytics — surfaces the analytics-v2 org aggregations
 * (throughput, cycle-time, cost, seat forecast, cost-by-agent) that were
 * REAL on the backend but had no page rendering them.
 */
const RANGES = ["7d", "30d", "90d"] as const;
type Range = typeof RANGES[number];

const Kpi: React.FC<{ label: string; value: React.ReactNode; sub?: string; accent?: boolean }> = ({ label, value, sub, accent }) => (
  <GlassCard padding={20}>
    <div style={{ fontSize: 11, fontWeight: 800, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 8, ...(accent ? { background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: tokens.INK }) }}>{value}</div>
    {sub && <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>{sub}</div>}
  </GlassCard>
);

export const WorkspaceAnalytics: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [throughput, setThroughput] = useState<Array<{ day: string; completed: number }>>([]);
  const [cycle, setCycle] = useState<{ avg_hours?: number; count?: number; max_hours?: number } | null>(null);
  const [cost, setCost] = useState<{ credits_used?: number; cost_usd?: number; runs?: number; tokens_in?: number; tokens_out?: number } | null>(null);
  const [seat, setSeat] = useState<{ purchased?: number; used_today?: number; projected_used?: number; utilisation_pct?: number } | null>(null);
  const [byAgent, setByAgent] = useState<Array<Record<string, any>>>([]);

  useEffect(() => {
    if (!activeOrgId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      analyticsV2Api.orgThroughput(activeOrgId, range).catch(() => ({ series: [] })),
      analyticsV2Api.orgCycleTime(activeOrgId, range).catch(() => null),
      analyticsV2Api.orgCost(activeOrgId, range).catch(() => null),
      analyticsV2Api.orgSeatForecast(activeOrgId).catch(() => null),
      agentsV2Api.costBreakdown(activeOrgId, range === "7d" ? "week" : range === "90d" ? "quarter" : "month").catch(() => []),
    ]).then(([tp, cy, co, se, ba]: any[]) => {
      if (cancelled) return;
      setThroughput(tp?.series || []);
      setCycle(cy); setCost(co); setSeat(se);
      setByAgent(Array.isArray(ba) ? ba : (ba?.agents || ba?.breakdown || []));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrgId, range]);

  if (!activeOrgId) return <EmptyState title="No workspace" body="Pick an organisation to see analytics." />;

  const trend = throughput.map(s => ({ day: new Date(s.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }), completed: s.completed }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SectionHeader eyebrow="Analytics" title="Workspace analytics" subtitle="Throughput, cycle time, agent cost and seat utilisation across the whole organisation." />
        <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.65)", borderRadius: 9999, border: `1px solid ${tokens.SLATE_200}` }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: "6px 14px", borderRadius: 9999, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, background: range === r ? "white" : "transparent", color: range === r ? tokens.PURPLE_DEEP : tokens.SLATE_600, boxShadow: range === r ? "0 2px 8px rgba(15,23,42,0.06)" : "none" }}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <GlassCard key={i} padding={20}><Skeleton height={16} /><Skeleton height={30} style={{ marginTop: 10 }} /></GlassCard>)}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <Kpi label={`Tasks completed (${range})`} value={throughput.reduce((s, p) => s + (p.completed || 0), 0).toLocaleString()} sub="Sum over the window" />
            <Kpi label="Avg cycle time" value={cycle ? `${cycle.avg_hours ?? 0}h` : "—"} sub={`${cycle?.count ?? 0} completed${cycle?.max_hours ? ` · max ${cycle.max_hours}h` : ""}`} />
            <Kpi label={`Agent credits (${range})`} value={cost ? (cost.credits_used ?? 0).toLocaleString() : "—"} sub={`${cost?.runs ?? 0} runs · ${((cost?.tokens_in ?? 0) + (cost?.tokens_out ?? 0)).toLocaleString()} tokens`} accent />
            <Kpi label="Seat utilisation" value={seat ? `${seat.utilisation_pct ?? 0}%` : "—"} sub={`${seat?.used_today ?? 0}/${seat?.purchased ?? 0} used · ~${seat?.projected_used ?? 0} projected`} />
          </div>

          <TrendLineChart
            data={trend}
            xKey="day"
            series={[{ key: "completed", label: "Tasks completed", color: tokens.PURPLE }]}
            title="Throughput"
            subtitle="Tasks completed per day across the workspace."
            height={260}
          />

          <div>
            <SectionHeader eyebrow="Cost" title="Cost by agent" subtitle="Credits and runs by agent over the window." />
            <GlassCard padding={6}>
              {byAgent.length === 0 ? (
                <div style={{ padding: 24 }}><EmptyState title="No agent cost yet" body="Once agents run in this window their cost breakdown appears here." /></div>
              ) : byAgent.slice(0, 15).map((row: any, idx) => {
                const key = row.agent_key || row.agent || row._id || "agent";
                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", padding: "12px 16px", borderBottom: idx < Math.min(byAgent.length, 15) - 1 ? `1px solid ${tokens.SLATE_200}` : "none" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: tokens.INK }}>{String(key).replace(/_/g, " ")}</span>
                    <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{Number(row.runs || row.count || 0).toLocaleString()} runs</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tokens.PURPLE_DEEP }}>{Number(row.credits_used || row.credits || 0).toLocaleString()} cr</span>
                  </div>
                );
              })}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceAnalytics;
