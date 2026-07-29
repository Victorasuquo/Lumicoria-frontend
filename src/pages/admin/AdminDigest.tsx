/**
 * AdminDigest — superadmin observability for the autonomous daily-digest (brain).
 *
 * Pick a user who has run the digest → pick a run → inspect every pipeline
 * step: the node timeline (status/eval/duration + counts) and, when raw capture
 * is enabled, the RAW input/output of each step (extracted email content, the
 * exact LLM prompts + responses, judge output, tasks, composed digest) as
 * copyable blocks. Toggle "email-by-email ↔ combined". Read-only; the digest
 * pipeline is never touched.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Brain, Check, ChevronRight, Copy, RefreshCw } from "lucide-react";
import {
  adminApi,
  DigestUser,
  DigestRun,
  DigestRunDetail,
  DigestRawResponse,
} from "@/services/adminApi";
import { PageHeader, Card, Kpi, StatusPill, Loading } from "./adminUi";

// Canonical display order for the pipeline steps.
const NODE_ORDER = [
  "gate", "fetch_gmail", "fetch_calendar", "fetch_drive", "fetch_huddle",
  "fetch_open_tasks", "download_attachments", "ingest_to_rag", "classify",
  "prioritise", "prioritise_attempt_1", "prioritise_attempt_2",
  "prioritise_rule_fallback", "create_tasks", "fire_agents", "wait_proposals",
  "compose", "compose_primary", "send", "audit",
];

// When splitting a node "email-by-email", these array fields get one block each.
const ARRAY_FIELDS = ["emails", "batches", "classified", "ranked_actions", "attachments", "events", "drive_changes", "open_tasks"];

function orderNodes(keys: string[]): string[] {
  const rank = (k: string) => {
    const i = NODE_ORDER.indexOf(k);
    return i === -1 ? NODE_ORDER.length + 1 : i;
  };
  return [...keys].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

function statusTone(s: string): "ok" | "warn" | "bad" | "neutral" {
  if (s === "ok") return "ok";
  if (s === "degraded" || s === "fallback" || s === "retry") return "warn";
  if (s === "failed" || s === "fail") return "bad";
  return "neutral";
}

function pretty(v: any): string {
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* noop */ }
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
    >
      {done ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
};

const RawBlock: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  const text = typeof value === "string" ? value : pretty(value);
  return (
    <div className="rounded-xl border border-black/10 bg-slate-900">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[11px] text-slate-300">{label}</span>
        <CopyButton text={text} />
      </div>
      <pre className="max-h-[420px] overflow-auto px-3 py-2 text-[11px] leading-relaxed text-slate-100 whitespace-pre-wrap break-words">{text}</pre>
    </div>
  );
};

const NodeRaw: React.FC<{ node: string; value: any; perItem: boolean }> = ({ node, value, perItem }) => {
  const [open, setOpen] = useState(true);
  const blocks: { label: string; value: any }[] = [];
  if (perItem && value && typeof value === "object" && !Array.isArray(value)) {
    const arrField = ARRAY_FIELDS.find((f) => Array.isArray(value[f]) && value[f].length);
    if (arrField) {
      const { [arrField]: arr, ...rest } = value;
      if (Object.keys(rest).length) blocks.push({ label: `${node} · meta`, value: rest });
      (arr as any[]).forEach((item, i) => blocks.push({ label: `${node} · ${arrField}[${i}]`, value: item }));
    }
  }
  if (!blocks.length) blocks.push({ label: node, value });

  return (
    <Card className="overflow-hidden !p-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-2.5 text-left">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
          {node}
        </span>
        <span className="text-[11px] text-slate-400">{blocks.length} block{blocks.length > 1 ? "s" : ""}</span>
      </button>
      {open && <div className="space-y-2 px-4 pb-4">{blocks.map((b, i) => <RawBlock key={i} label={b.label} value={b.value} />)}</div>}
    </Card>
  );
};

export default function AdminDigest() {
  const [users, setUsers] = useState<DigestUser[] | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [runs, setRuns] = useState<DigestRun[] | null>(null);
  const [run, setRun] = useState<DigestRunDetail | null>(null);
  const [raw, setRaw] = useState<DigestRawResponse | null>(null);
  const [loadingRaw, setLoadingRaw] = useState(false);
  const [perItem, setPerItem] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminApi.digestUsers().then((d) => setUsers(d.users || [])).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!userId) { setRuns(null); return; }
    setRuns(null); setRun(null); setRaw(null);
    adminApi.digestRuns(userId).then((d) => setRuns(d.runs || [])).catch(() => setRuns([]));
  }, [userId]);

  const openRun = async (id: string) => {
    setRun(null); setRaw(null); setErr(null);
    try { setRun(await adminApi.digestRun(id)); }
    catch (e: any) { setErr(e?.response?.data?.detail || "Failed to load run"); }
  };

  const loadRaw = async () => {
    if (!run) return;
    setLoadingRaw(true); setErr(null);
    try { setRaw(await adminApi.digestRaw(run.id)); }
    catch (e: any) { setErr(e?.response?.data?.detail || "Failed to load raw capture"); }
    finally { setLoadingRaw(false); }
  };

  const rawNodes = useMemo(() => raw?.bundle?.nodes || null, [raw]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Observability"
        title="Daily Digest"
        subtitle="Inspect every step of a user's autonomous brain run — including the raw content not shown in their digest. Raw capture requires BRAIN_RAW_CAPTURE_ENABLED."
        action={<Brain className="h-6 w-6 text-[#6C4AB0]" />}
      />

      {/* Pickers */}
      <Card className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-bold text-slate-500">User</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="min-w-[280px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">{users === null ? "Loading…" : `Select a user (${users.length})`}</option>
          {(users || []).map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {(u.email || u.full_name || u.user_id)} — {u.runs} run{u.runs === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </Card>

      {err && <Card className="border-red-200 bg-red-50 text-sm text-red-700">{err}</Card>}

      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        {/* Run list */}
        <div className="space-y-2">
          {userId && runs === null && <Loading />}
          {runs && runs.length === 0 && <Card className="text-sm text-slate-500">No runs for this user.</Card>}
          {(runs || []).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openRun(r.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${run?.id === r.id ? "border-[#6C4AB0] bg-[#6C4AB0]/5" : "border-black/10 bg-white hover:border-black/20"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold capitalize text-slate-800">{r.mode} run</span>
                <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{r.started_at ? new Date(r.started_at).toLocaleString() : "—"}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span>{r.emails_processed} emails</span>
                <span>· {r.tasks_created} tasks</span>
                {r.has_raw_capture && <span className="font-semibold text-[#6C4AB0]">· raw ✓</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Run detail */}
        <div className="space-y-4">
          {!run && <Card className="text-sm text-slate-500">Select a run to inspect its steps.</Card>}
          {run && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Kpi label="Status" value={<StatusPill tone={statusTone(run.status)}>{run.status}</StatusPill>} />
                <Kpi label="Emails" value={run.emails_processed} />
                <Kpi label="Tasks" value={run.tasks_created} />
                <Kpi label="Duration" value={run.duration_ms != null ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—"} />
              </div>

              {/* Node timeline */}
              <Card>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Node timeline ({run.traces.length})</div>
                <div className="space-y-1.5">
                  {run.traces.map((t, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-black/5 bg-slate-50 px-3 py-1.5 text-sm">
                      <span className="font-mono text-[12px] text-slate-700">{t.node}</span>
                      <span className="flex items-center gap-3 text-[11px] text-slate-500">
                        {t.eval_score != null && <span>eval {t.eval_score.toFixed(2)}</span>}
                        <span>{t.duration_ms != null ? `${t.duration_ms}ms` : ""}</span>
                        <StatusPill tone={statusTone(t.status)}>{t.status}</StatusPill>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Raw capture */}
              <Card>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Raw per-step capture</div>
                  <div className="flex items-center gap-2">
                    {rawNodes && (
                      <div className="inline-flex rounded-lg border border-black/10 bg-white p-0.5 text-[11px] font-semibold">
                        <button type="button" onClick={() => setPerItem(false)} className={`rounded-md px-2 py-1 ${!perItem ? "bg-[#6C4AB0] text-white" : "text-slate-500"}`}>Combined</button>
                        <button type="button" onClick={() => setPerItem(true)} className={`rounded-md px-2 py-1 ${perItem ? "bg-[#6C4AB0] text-white" : "text-slate-500"}`}>Email-by-email</button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={loadRaw}
                      disabled={loadingRaw || !run.has_raw_capture}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#6C4AB0] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingRaw ? "animate-spin" : ""}`} />
                      {rawNodes ? "Reload raw" : "Load raw"}
                    </button>
                  </div>
                </div>

                {!run.has_raw_capture && (
                  <div className="text-sm text-slate-500">
                    No raw capture for this run. Set <code className="rounded bg-slate-100 px-1">BRAIN_RAW_CAPTURE_ENABLED=1</code> and re-run to capture raw steps.
                  </div>
                )}
                {run.has_raw_capture && raw && !raw.available && (
                  <div className="text-sm text-slate-500">Raw bundle unavailable (expired or not found).</div>
                )}
                {rawNodes && (
                  <div className="space-y-2">
                    {orderNodes(Object.keys(rawNodes)).map((node) => (
                      <NodeRaw key={node} node={node} value={rawNodes[node]} perItem={perItem} />
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
