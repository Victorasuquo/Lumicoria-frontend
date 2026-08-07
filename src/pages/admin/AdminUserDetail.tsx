/**
 * AdminUserDetail — per-user drill-down for the superadmin console.
 *
 * Tabs: Overview / Chats / Agent runs / Tasks / Digest. Read-only; content-
 * bearing views (chat messages, agent-run I/O) are audited server-side.
 */

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bot, MessageSquare, ListChecks, Brain, Send, LogIn, LogOut, Coins } from "lucide-react";
import adminApi, {
  AgentRunRow, UserConversation, UserChatMessage, UserTaskRow, DigestRun, AdminDirectMessage,
} from "@/services/adminApi";
import { Card, Kpi, Loading, PageHeader, StatusPill } from "./adminUi";

type Tab = "Overview" | "Messages" | "Chats" | "Agent runs" | "Tasks" | "Digest";
const TABS: Tab[] = ["Overview", "Messages", "Chats", "Agent runs", "Tasks", "Digest"];

function fmtMs(ms?: number | null) { return ms == null ? "—" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`; }
function when(s?: string | null) { return s ? new Date(s).toLocaleString() : "—"; }
function pretty(v: any) { try { return JSON.stringify(v, null, 2); } catch { return String(v); } }
function tone(s?: string): "ok" | "warn" | "bad" | "neutral" {
  if (["ok", "completed", "success", "active", "done"].includes(s || "")) return "ok";
  if (["error", "failed", "suspended"].includes(s || "")) return "bad";
  if (["running", "degraded", "pending_review", "in_progress"].includes(s || "")) return "warn";
  return "neutral";
}

/* ── Overview ── */
const OverviewTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [d, setD] = useState<any>(null);
  useEffect(() => { adminApi.userDetail(userId).then(setD).catch(() => setD({})); }, [userId]);
  if (!d) return <Loading />;
  const t = d.usage?.totals || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Runs" value={t.runs || 0} />
        <Kpi label="Tokens" value={(t.tokens_in || 0) + (t.tokens_out || 0)} />
        <Kpi label="Cost" value={`$${(t.cost_usd || 0).toFixed(4)}`} />
        <Kpi label="Plan" value={d.subscription?.admin_override_plan || d.subscription?.plan || "free"} />
      </div>
      <Card>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Top agent usage</div>
        <div className="mt-2 space-y-1.5">
          {(d.usage?.by_agent || []).slice(0, 8).map((a: any) => (
            <div key={a._id || a.agent_key} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
              <span className="font-semibold">{a._id || a.agent_key}</span><span className="text-slate-500">{a.runs || 0} runs</span>
            </div>
          ))}
          {(!d.usage?.by_agent || d.usage.by_agent.length === 0) && <div className="text-sm text-slate-500">No agent usage.</div>}
        </div>
      </Card>
    </div>
  );
};

/* ── Messages (admin → user direct messages) ── */
const MessagesTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [thread, setThread] = useState<AdminDirectMessage[] | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = () => adminApi.userMessages(userId).then((r) => setThread(r.messages)).catch(() => setThread([]));
  useEffect(() => { load(); }, [userId]);

  const send = async () => {
    if (!body.trim()) return;
    const channels = [inApp && "in_app", email && "email"].filter(Boolean) as string[];
    if (channels.length === 0) { setNote("Pick at least one channel."); return; }
    setSending(true); setNote(null);
    try {
      const res = await adminApi.sendUserMessage(userId, { subject, body, channels });
      const d = res.message?.delivered || {};
      setNote(`Sent · ${Object.entries(d).map(([k, v]) => `${k}: ${v ? "✓" : "✗"}`).join("  ")}`);
      setSubject(""); setBody("");
      await load();
    } catch { setNote("Failed to send."); }
    finally { setSending(false); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
      <Card className="!p-0">
        <div className="border-b border-black/5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Message thread</div>
        {!thread ? <div className="p-6"><Loading /></div>
          : thread.length === 0 ? <div className="p-6 text-sm text-slate-500">No messages sent to this user yet.</div>
          : <div className="max-h-[520px] space-y-2 overflow-auto p-4">
              {thread.map((m) => (
                <div key={m._id} className="rounded-xl bg-[#6C4AB0]/5 px-3 py-2 text-sm">
                  <div className="mb-0.5 flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Admin{m.admin_email ? ` · ${m.admin_email}` : ""}</span><span>{when(m.created_at)}</span>
                  </div>
                  {m.subject && <div className="font-semibold text-slate-800">{m.subject}</div>}
                  <div className="whitespace-pre-wrap break-words text-slate-700">{m.body}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{(m.channels || []).join(", ")}</div>
                </div>
              ))}
            </div>}
      </Card>
      <Card>
        <div className="text-sm font-black text-slate-800">Send a message</div>
        <div className="mt-3 space-y-2">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Message to the user…" className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm" />
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={inApp} onChange={(e) => setInApp(e.target.checked)} /> In-app</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /> Email</label>
          </div>
          <button onClick={send} disabled={sending || !body.trim()} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#6C4AB0] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send message"}
          </button>
          {note && <div className="text-[11px] text-slate-500">{note}</div>}
        </div>
      </Card>
    </div>
  );
};

/* ── Chats ── */
const ChatsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [chans, setChans] = useState<UserConversation[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<UserChatMessage[] | null>(null);
  useEffect(() => { adminApi.userConversations(userId).then((r) => setChans(r.conversations)).catch(() => setChans([])); }, [userId]);
  useEffect(() => { if (!sel) { setMsgs(null); return; } setMsgs(null); adminApi.userConversationMessages(userId, sel).then((r) => setMsgs(r.messages)).catch(() => setMsgs([])); }, [sel, userId]);
  if (!chans) return <Loading />;
  if (chans.length === 0) return <Card className="text-sm text-slate-500">No chat channels for this user.</Card>;
  return (
    <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
      <div className="space-y-2">
        {chans.map((c) => (
          <button key={c.id} onClick={() => setSel(c.id)} className={`w-full rounded-xl border p-3 text-left ${sel === c.id ? "border-[#6C4AB0] bg-[#6C4AB0]/5" : "border-black/10 bg-white hover:border-black/20"}`}>
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-800">{c.title}</span><span className="text-[10px] uppercase text-slate-400">{c.type}</span></div>
            <div className="mt-1 text-[11px] text-slate-500">{c.message_count} msgs · {c.member_count} members · {when(c.last_message_at)}</div>
          </button>
        ))}
      </div>
      <Card className="!p-0">
        {!sel ? <div className="p-6 text-sm text-slate-500">Select a channel.</div>
          : !msgs ? <div className="p-6"><Loading /></div>
          : msgs.length === 0 ? <div className="p-6 text-sm text-slate-500">No messages.</div>
          : <div className="max-h-[560px] space-y-2 overflow-auto p-4">
              {msgs.map((m) => (
                <div key={m.id} className={`rounded-xl px-3 py-2 text-sm ${m.role === "agent" ? "bg-[#6C4AB0]/5" : "bg-slate-50"}`}>
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">{m.role === "agent" ? (m.agent_key || "agent") : "user"} · {when(m.created_at)}</div>
                  <div className="whitespace-pre-wrap break-words text-slate-800">{m.content}</div>
                </div>
              ))}
            </div>}
      </Card>
    </div>
  );
};

/* ── Agent runs ── */
const RunsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [runs, setRuns] = useState<AgentRunRow[] | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  useEffect(() => { adminApi.userAgentRuns(userId).then((r) => setRuns(r.runs)).catch(() => setRuns([])); }, [userId]);
  const open = async (id: string) => { setDetail(null); setLoadingDetail(true); try { setDetail(await adminApi.userAgentRun(userId, id)); } catch { setDetail({}); } finally { setLoadingDetail(false); } };
  if (!runs) return <Loading />;
  if (runs.length === 0) return <Card className="text-sm text-slate-500">No agent runs for this user.</Card>;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
      <Card className="!p-0">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="p-2.5">Agent</th><th>Status</th><th>Model</th><th>Latency</th><th>When</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r._id} onClick={() => open(r._id!)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-2.5 font-semibold">{r.agent_key}{r.parent_run_id && <span className="ml-1 text-[9px] text-slate-400">↳child</span>}</td>
                  <td><StatusPill tone={tone(r.status)}>{r.status}</StatusPill></td>
                  <td className="text-slate-500">{r.model_used || r.provider || "—"}</td>
                  <td className="text-slate-500">{fmtMs(r.duration_ms)}</td>
                  <td className="text-slate-500">{when(r.started_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="!p-0">
        {loadingDetail ? <div className="p-6"><Loading /></div>
          : !detail ? <div className="p-6 text-sm text-slate-500">Select a run to see I/O + lineage.</div>
          : <div className="max-h-[600px] space-y-3 overflow-auto p-4">
              <div className="text-sm font-bold text-slate-800">{detail.agent_key} · <StatusPill tone={tone(detail.status)}>{detail.status}</StatusPill></div>
              {detail.parent && <div className="text-[11px] text-slate-500">Parent: {detail.parent.agent_key} ({detail.parent.id})</div>}
              {Array.isArray(detail.children) && detail.children.length > 0 && <div className="text-[11px] text-slate-500">Children: {detail.children.map((c: any) => c.agent_key).join(", ")}</div>}
              <div className="text-[10px] font-bold uppercase text-slate-400">Input</div>
              <pre className="max-h-52 overflow-auto rounded-lg bg-slate-900 p-2 text-[11px] text-slate-100 whitespace-pre-wrap break-words">{pretty(detail.input)}</pre>
              <div className="text-[10px] font-bold uppercase text-slate-400">Output</div>
              <pre className="max-h-52 overflow-auto rounded-lg bg-slate-900 p-2 text-[11px] text-slate-100 whitespace-pre-wrap break-words">{pretty(detail.output)}</pre>
              {detail.error && <><div className="text-[10px] font-bold uppercase text-red-400">Error</div><pre className="rounded-lg bg-red-50 p-2 text-[11px] text-red-700 whitespace-pre-wrap break-words">{detail.error}</pre></>}
            </div>}
      </Card>
    </div>
  );
};

/* ── Tasks ── */
const TasksTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [tasks, setTasks] = useState<UserTaskRow[] | null>(null);
  useEffect(() => { adminApi.userTasks(userId).then((r) => setTasks(r.tasks)).catch(() => setTasks([])); }, [userId]);
  if (!tasks) return <Loading />;
  if (tasks.length === 0) return <Card className="text-sm text-slate-500">No tasks for this user.</Card>;
  return (
    <Card className="!p-0">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="p-3">Task</th><th>Status</th><th>Priority</th><th>Agent</th><th>Proposal</th><th>Due</th></tr></thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-t border-slate-100">
              <td className="p-3 font-semibold text-slate-800">{t.title || "(untitled)"}</td>
              <td><StatusPill tone={tone(t.status || undefined)}>{t.status}</StatusPill></td>
              <td className="text-slate-500">{t.priority}</td>
              <td className="text-slate-500">{t.assigned_to_agent || "—"}</td>
              <td className="text-slate-500">{t.proposal_status || "—"}</td>
              <td className="text-slate-500">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

/* ── Digest ── */
const DigestTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [runs, setRuns] = useState<DigestRun[] | null>(null);
  useEffect(() => { adminApi.digestRuns(userId).then((r) => setRuns(r.runs)).catch(() => setRuns([])); }, [userId]);
  if (!runs) return <Loading />;
  if (runs.length === 0) return <Card className="text-sm text-slate-500">No brain/digest runs for this user.</Card>;
  return (
    <Card className="!p-0">
      <div className="border-b border-black/5 px-4 py-2 text-xs text-slate-500">Deep-inspect raw steps in the <Link to="/admin/digest" className="font-semibold text-[#6C4AB0]">Daily Digest</Link> viewer.</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="p-3">Mode</th><th>Status</th><th>Emails</th><th>Tasks</th><th>Raw</th><th>When</th></tr></thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="p-3 font-semibold capitalize text-slate-800">{r.mode}</td>
              <td><StatusPill tone={tone(r.status)}>{r.status}</StatusPill></td>
              <td className="text-slate-500">{r.emails_processed}</td>
              <td className="text-slate-500">{r.tasks_created}</td>
              <td className="text-slate-500">{r.has_raw_capture ? "✓" : "—"}</td>
              <td className="text-slate-500">{when(r.started_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

/* ── Actions bar (impersonate / grant credits / force logout) ── */
const ActionsBar: React.FC<{ userId: string }> = ({ userId }) => {
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState("Goodwill credit");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const impersonate = async () => {
    if (!window.confirm("Log in as this user? This replaces your current session — you'll need to sign back in as admin afterwards.")) return;
    setBusy("impersonate"); setNote(null);
    try {
      const res = await adminApi.impersonateUser(userId);
      localStorage.setItem("adminTokenBackup", localStorage.getItem("accessToken") || "");
      localStorage.setItem("accessToken", res.access_token);
      window.location.href = "/dashboard";
    } catch { setNote("Impersonation failed."); setBusy(null); }
  };
  const grant = async () => {
    if (!amount || amount < 1) { setNote("Enter a positive amount."); return; }
    setBusy("grant"); setNote(null);
    try {
      const res = await adminApi.grantCredits(userId, { amount, reason });
      setNote(`Granted ${res.granted} credits${res.balance != null ? ` · new balance ${res.balance}` : ""}.`);
    } catch { setNote("Grant failed."); }
    finally { setBusy(null); }
  };
  const forceLogout = async () => {
    if (!window.confirm("Force-logout this user? Their existing tokens are revoked and push devices dropped.")) return;
    setBusy("logout"); setNote(null);
    try {
      const res = await adminApi.forceLogout(userId);
      setNote(`Sessions revoked · ${res.revoked_device_tokens} device token(s) removed.`);
    } catch { setNote("Force-logout failed."); }
    finally { setBusy(null); }
  };

  return (
    <Card className="flex flex-wrap items-center gap-3">
      <button onClick={impersonate} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-xl bg-[#6C4AB0] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
        <LogIn className="h-4 w-4" /> Login as
      </button>
      <div className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2 py-1.5">
        <Coins className="h-4 w-4 text-amber-500" />
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason" className="w-32 rounded-lg border border-black/10 px-2 py-1 text-sm" />
        <button onClick={grant} disabled={!!busy} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white disabled:opacity-50">{busy === "grant" ? "…" : "Grant"}</button>
      </div>
      <button onClick={forceLogout} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">
        <LogOut className="h-4 w-4" /> Force logout
      </button>
      {note && <span className="text-[12px] text-slate-500">{note}</span>}
    </Card>
  );
};

const TAB_ICON: Record<Tab, React.ElementType> = { "Overview": Bot, "Messages": Send, "Chats": MessageSquare, "Agent runs": Bot, "Tasks": ListChecks, "Digest": Brain };

export default function AdminUserDetail() {
  const { userId = "" } = useParams();
  const [tab, setTab] = useState<Tab>("Overview");
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => { adminApi.userDetail(userId).then((d: any) => setEmail(d?.user?.email || null)).catch(() => {}); }, [userId]);

  return (
    <div className="space-y-4">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> All users</Link>
      <PageHeader eyebrow="Per-user" title={email || userId} subtitle="Chats, agent runs (with lineage), tasks, and digest runs for this user." />

      <ActionsBar userId={userId} />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const Icon = TAB_ICON[t];
          return (
            <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${tab === t ? "bg-[#6C4AB0] text-white" : "bg-white text-slate-600 border border-black/10"}`}>
              <Icon className="h-3.5 w-3.5" /> {t}
            </button>
          );
        })}
      </div>

      {tab === "Overview" && <OverviewTab userId={userId} />}
      {tab === "Messages" && <MessagesTab userId={userId} />}
      {tab === "Chats" && <ChatsTab userId={userId} />}
      {tab === "Agent runs" && <RunsTab userId={userId} />}
      {tab === "Tasks" && <TasksTab userId={userId} />}
      {tab === "Digest" && <DigestTab userId={userId} />}
    </div>
  );
}
