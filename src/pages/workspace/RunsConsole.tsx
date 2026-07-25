import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { agentsV2Api } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Skeleton, EmptyState, AgentChip } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";
import { toast } from "sonner";

/**
 * Runs console — lists agent_runs for the org with a detail drawer
 * (cost/tokens/lineage) and retry/cancel actions. The agents-v2 runs
 * endpoints were all REAL and completely orphaned (no UI).
 */
type Run = Record<string, any>;

const runsExt = agentsV2Api as typeof agentsV2Api & {
  runCost: (id: string) => Promise<any>;
  runTokens: (id: string) => Promise<any>;
  runLineage: (id: string) => Promise<any>;
  runRetry: (id: string) => Promise<any>;
  cancelRun: (id: string) => Promise<any>;
};

const STATUS_TONES: Record<string, string> = { completed: tokens.GREEN, error: tokens.RED, running: tokens.PURPLE, cancelled: tokens.SLATE_400, skipped: tokens.SLATE_400 };
const STATUSES = ["", "running", "completed", "error", "cancelled"];

const RunDrawer: React.FC<{ run: Run; onClose: () => void; onChanged: () => void }> = ({ run, onClose, onChanged }) => {
  const [cost, setCost] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    runsExt.runCost(run.id).then(setCost).catch(() => {});
  }, [run.id]);

  const retry = async () => { setBusy(true); try { await runsExt.runRetry(run.id); toast.success("Re-queued."); onChanged(); onClose(); } catch (e: any) { toast.error(e?.response?.data?.detail || "Retry failed."); } finally { setBusy(false); } };
  const cancel = async () => { setBusy(true); try { await runsExt.cancelRun(run.id); toast.success("Cancelled."); onChanged(); onClose(); } catch (e: any) { toast.error(e?.response?.data?.detail || "Cancel failed."); } finally { setBusy(false); } };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", zIndex: 50 }} onClick={onClose} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(460px, 92vw)", background: "white", zIndex: 51, boxShadow: "-8px 0 34px rgba(15,23,42,0.18)", padding: 24, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AgentChip agentKey={run.agent_key || "agent"} size={26} />
            <div>
              <div style={{ fontWeight: 700, color: tokens.INK }}>{run.agent_name || run.agent_key}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{run.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20, color: tokens.SLATE_500 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            ["Status", run.status],
            ["Trigger", run.trigger],
            ["Duration", run.duration_ms != null ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—"],
            ["Model", run.model_used || "—"],
            ["Tokens in", (cost?.tokens_input ?? run.tokens_input ?? 0).toLocaleString?.() ?? "—"],
            ["Tokens out", (cost?.tokens_output ?? run.tokens_output ?? 0).toLocaleString?.() ?? "—"],
            ["Credits", (run.credits_used ?? cost?.credits_used ?? 0).toLocaleString?.() ?? "—"],
            ["Cost (USD)", `$${run.cost_usd ?? cost?.cost_usd ?? 0}`],
          ].map(([k, v], i) => (
            <div key={i} style={{ padding: "10px 12px", border: `1px solid ${tokens.SLATE_200}`, borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: tokens.SLATE_500, fontWeight: 700, textTransform: "uppercase" }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: tokens.INK, marginTop: 2 }}>{String(v)}</div>
            </div>
          ))}
        </div>

        {run.error && <div style={{ padding: 12, borderRadius: 10, background: `${tokens.RED}10`, color: tokens.RED, fontSize: 12, marginBottom: 16 }}>{String(run.error)}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <Button tone="primary" size="sm" disabled={busy} onClick={retry}>Retry run</Button>
          {run.status === "running" && <Button tone="outline" size="sm" disabled={busy} onClick={cancel}>Cancel</Button>}
        </div>
      </div>
    </>
  );
};

export const RunsConsole: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Run | null>(null);

  const load = () => {
    if (!activeOrgId) return;
    setLoading(true);
    agentsV2Api.runs(activeOrgId, { status: status || undefined, limit: 100 })
      .then((r: any) => setRuns(Array.isArray(r) ? r : (r?.runs || [])))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [activeOrgId, status]);

  if (!activeOrgId) return <EmptyState title="No workspace" body="Pick an organisation to see agent runs." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SectionHeader eyebrow="Agents" title="Runs console" subtitle="Every agent invocation across the workspace — cost, tokens, retries." />
        <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.65)", borderRadius: 9999, border: `1px solid ${tokens.SLATE_200}` }}>
          {STATUSES.map(s => (
            <button key={s || "all"} onClick={() => setStatus(s)} style={{ padding: "6px 14px", borderRadius: 9999, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, textTransform: "capitalize", background: status === s ? "white" : "transparent", color: status === s ? tokens.PURPLE_DEEP : tokens.SLATE_600, boxShadow: status === s ? "0 2px 8px rgba(15,23,42,0.06)" : "none" }}>{s || "All"}</button>
          ))}
        </div>
      </div>

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 22 }}><Skeleton height={18} /><Skeleton height={18} style={{ marginTop: 10 }} /><Skeleton height={18} style={{ marginTop: 10 }} /></div>
        ) : runs.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No runs yet" body="Agent runs (from tasks, schedules, batches, chat) show up here." /></div>
        ) : runs.map((r, idx) => (
          <div key={r.id || idx} onClick={() => setSelected(r)}
            style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center", padding: "12px 16px", cursor: "pointer", borderBottom: idx < runs.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = `${tokens.PURPLE}06`)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <AgentChip agentKey={r.agent_key || "agent"} size={22} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: tokens.INK }}>{r.agent_name || r.agent_key}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.trigger || "manual"}{r.model_used ? ` · ${r.model_used}` : ""}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_TONES[r.status] || tokens.SLATE_500, textTransform: "capitalize" }}>{r.status}</span>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{(r.credits_used ?? 0).toLocaleString()} cr</span>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.started_at ? new Date(r.started_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
          </div>
        ))}
      </GlassCard>

      {selected && <RunDrawer run={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
};

export default RunsConsole;
