import React, { useEffect, useState } from "react";
import adminApi, { AdminSentEmail, AdminSentEmailStats } from "@/services/adminApi";
import { getErrorMessage } from "@/services/api";
import { Card, Kpi, PageHeader, StatusPill } from "./adminUi";

const audiences = [
  { value: "all", label: "All active users" },
  { value: "free", label: "Free users" },
  { value: "starter", label: "Starter users" },
  { value: "professional", label: "Professional users" },
  { value: "enterprise", label: "Enterprise users" },
  { value: "paying", label: "All paying users" },
  { value: "comped", label: "Comped users" },
  { value: "active_30d", label: "Active in 30 days" },
  { value: "inactive", label: "Suspended users" },
  { value: "custom", label: "Custom email list" },
];

const emptyStats: AdminSentEmailStats = {
  total: 0,
  direct: 0,
  broadcast: 0,
  sent_total: 0,
  failed_total: 0,
  statuses: { sent: 0, partial: 0, failed: 0 },
};

const statusTone = (status?: string) => {
  if (status === "failed") return "bad";
  if (status === "partial") return "warn";
  return "ok";
};

const formatDate = (value?: string) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
};

const targetLabel = (item: AdminSentEmail) => (
  item.kind === "broadcast"
    ? item.audience || "broadcast"
    : item.to_email || "direct recipient"
);

const AdminEmail: React.FC = () => {
  const [form, setForm] = useState({ email: "", subject: "", message: "" });
  const [broadcast, setBroadcast] = useState({ audience: "all", emails: "", subject: "", message: "", limit: 1000 });
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [mailPreview, setMailPreview] = useState<{ mode: "direct" | "broadcast"; recipient: string; subject: string; html: string; from_name: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [history, setHistory] = useState<AdminSentEmail[]>([]);
  const [historyStats, setHistoryStats] = useState<AdminSentEmailStats>(emptyStats);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<AdminSentEmail | null>(null);
  const [historyFilters, setHistoryFilters] = useState<{ kind: "all" | "direct" | "broadcast"; status: "all" | "sent" | "partial" | "failed"; q: string }>({
    kind: "all",
    status: "all",
    q: "",
  });
  const historyPageSize = 25;
  const historyLastPage = Math.max(1, Math.ceil(historyTotal / historyPageSize));

  const loadHistory = async (targetPage = historyPage, filters = historyFilters) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await adminApi.sentEmails({
        kind: filters.kind === "all" ? undefined : filters.kind,
        status: filters.status === "all" ? undefined : filters.status,
        q: filters.q || undefined,
        page: targetPage,
        page_size: historyPageSize,
      });
      setHistory(response.items || []);
      setHistoryTotal(response.total || 0);
      setHistoryStats(response.stats || emptyStats);
      setSelectedHistory(previous => {
        if (previous && (response.items || []).some(item => item.id === previous.id)) return previous;
        return (response.items || [])[0] || null;
      });
    } catch (err) {
      setHistory([]);
      setHistoryTotal(0);
      setHistoryStats(emptyStats);
      setHistoryError(getErrorMessage(err, "Could not load sent messages."));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory(historyPage, historyFilters);
  }, [historyPage]);

  const broadcastPayload = {
    audience: broadcast.audience,
    emails: broadcast.emails.split(/[\n,]/).map(email => email.trim()).filter(Boolean),
    subject: broadcast.subject,
    message: broadcast.message,
    limit: Number(broadcast.limit || 1000),
  };

  const send = async () => {
    setSending(true);
    try {
      const response = await adminApi.sendEmail(form);
      setResult(response.success ? "Sent" : response.error_message || "Failed");
      setHistoryPage(1);
      await loadHistory(1, historyFilters);
    } catch (err) {
      setResult(getErrorMessage(err, "Could not send email."));
    } finally {
      setSending(false);
    }
  };

  const previewBroadcast = async () => {
    try {
      setPreview(await adminApi.previewBroadcast(broadcastPayload));
      setResult(null);
    } catch (err) {
      setResult(getErrorMessage(err, "Could not preview audience."));
    }
  };

  const previewMail = async (mode: "direct" | "broadcast") => {
    const source = mode === "direct" ? form : broadcast;
    const sample = mode === "broadcast" ? preview?.sample?.[0] : null;
    const userName = mode === "broadcast" ? sample?.full_name || "there" : "there";
    const recipient = mode === "direct"
      ? form.email || "Direct recipient"
      : preview
        ? `${preview.count ?? preview.recipient_count ?? 0} ${preview.audience || broadcast.audience} recipients`
        : `${audiences.find(item => item.value === broadcast.audience)?.label || broadcast.audience}`;

    setPreviewing(true);
    try {
      const response = await adminApi.previewEmail({
        subject: source.subject,
        message: source.message,
        user_name: userName,
      });
      setMailPreview({ mode, recipient, ...response });
      setResult(null);
    } catch (err) {
      setResult(getErrorMessage(err, "Could not render mail preview."));
    } finally {
      setPreviewing(false);
    }
  };

  const sendBroadcast = async () => {
    setSending(true);
    try {
      const response: any = await adminApi.sendBroadcast(broadcastPayload);
      setPreview(response);
      setResult(
        response.queued || response.status === "queued"
          ? `Broadcast queued to ${response.recipient_count || 0} recipients — sending in the background.`
          : `Broadcast sent to ${response.sent || 0} users. ${response.failed || 0} failed.`
      );
      setHistoryPage(1);
      await loadHistory(1, historyFilters);
    } catch (err) {
      setResult(getErrorMessage(err, "Could not send broadcast."));
    } finally {
      setSending(false);
    }
  };

  const searchHistory = () => {
    if (historyPage !== 1) {
      setHistoryPage(1);
      return;
    }
    void loadHistory(1, historyFilters);
  };

  const clearHistoryFilters = () => {
    const nextFilters = { kind: "all" as const, status: "all" as const, q: "" };
    setHistoryFilters(nextFilters);
    if (historyPage !== 1) {
      setHistoryPage(1);
      return;
    }
    void loadHistory(1, nextFilters);
  };

  return (
    <div>
      <PageHeader eyebrow="Outbound" title="Email" subtitle="Preview branded mail, send direct messages or broadcasts, and audit every outbound admin message." />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="text-lg font-black">Direct email</h2>
          <p className="mt-1 text-sm text-slate-500">One recipient, real notification template, saved in sent history.</p>
          <div className="mt-4 grid gap-3">
            <input value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="recipient@example.com" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <textarea value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} rows={8} placeholder="Message text" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => previewMail("direct")} disabled={previewing || !form.subject || !form.message} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">Preview mail</button>
              <button onClick={send} disabled={sending || !form.email || !form.subject || !form.message} className="rounded-xl bg-[#6C4AB0] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{sending ? "Sending..." : "Send email"}</button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Broadcast</h2>
              <p className="mt-1 text-sm text-slate-500">Preview the audience first, then send one-by-one so recipients never see each other.</p>
            </div>
            {preview && <StatusPill tone={preview.failed ? "warn" : "ok"}>{preview.count ?? preview.recipient_count ?? 0} matched</StatusPill>}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <select value={broadcast.audience} onChange={event => setBroadcast({ ...broadcast, audience: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                {audiences.map(audience => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
              </select>
              <input type="number" min={1} max={5000} value={broadcast.limit} onChange={event => setBroadcast({ ...broadcast, limit: Number(event.target.value) })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            {broadcast.audience === "custom" && (
              <textarea value={broadcast.emails} onChange={event => setBroadcast({ ...broadcast, emails: event.target.value })} rows={5} placeholder="Paste comma or newline separated emails" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            )}
            <input value={broadcast.subject} onChange={event => setBroadcast({ ...broadcast, subject: event.target.value })} placeholder="Subject" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <textarea value={broadcast.message} onChange={event => setBroadcast({ ...broadcast, message: event.target.value })} rows={8} placeholder="Message text" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => previewMail("broadcast")} disabled={previewing || !broadcast.subject || !broadcast.message} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">
                {previewing ? "Rendering..." : "Preview mail"}
              </button>
              <button onClick={previewBroadcast} disabled={!broadcast.subject || !broadcast.message} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">Preview audience</button>
              <button onClick={sendBroadcast} disabled={sending || !preview || !broadcast.subject || !broadcast.message} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                {sending ? "Sending..." : "Send broadcast"}
              </button>
            </div>
          </div>

          {preview && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill>{preview.audience}</StatusPill>
                <StatusPill tone="ok">{preview.count ?? preview.recipient_count ?? 0} recipients</StatusPill>
                {typeof preview.sent === "number" && <StatusPill tone="ok">{preview.sent} sent</StatusPill>}
                {typeof preview.failed === "number" && preview.failed > 0 && <StatusPill tone="bad">{preview.failed} failed</StatusPill>}
              </div>
              {preview.sample?.length > 0 && (
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {preview.sample.slice(0, 10).map((user: any) => (
                    <div key={user.email} className="rounded-xl bg-white px-3 py-2 text-sm">
                      <div className="font-bold">{user.full_name || "No name"}</div>
                      <div className="text-xs text-slate-500">{user.email} · {user.plan || "free"}</div>
                    </div>
                  ))}
                </div>
              )}
              {preview.failures?.length > 0 && (
                <div className="mt-4 text-sm text-red-700">
                  {preview.failures.slice(0, 5).map((failure: any) => <div key={failure.email}>{failure.email}: {failure.error}</div>)}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {result && <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{result}</p>}

      {mailPreview && (
        <Card className="mt-5 overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#6C4AB0]">Mail preview</div>
              <h2 className="mt-1 text-lg font-black text-slate-950">{mailPreview.subject}</h2>
              <p className="mt-1 text-sm text-slate-500">From {mailPreview.from_name} · To {mailPreview.recipient}</p>
            </div>
            <StatusPill tone={mailPreview.mode === "broadcast" ? "warn" : "ok"}>{mailPreview.mode === "broadcast" ? "Broadcast draft" : "Direct draft"}</StatusPill>
          </div>
          <div className="bg-slate-100 p-3 sm:p-5">
            <iframe
              title="Email preview"
              sandbox=""
              srcDoc={mailPreview.html}
              className="h-[720px] w-full rounded-2xl border border-slate-200 bg-white"
            />
          </div>
        </Card>
      )}

      <div className="mt-8">
        <PageHeader eyebrow="History" title="Sent messages" subtitle="Every direct email and broadcast campaign sent from platform admin, with delivery totals and failure samples." />
        <div className="grid gap-4 md:grid-cols-4">
          <Kpi label="Logged messages" value={historyStats.total} hint={`${historyStats.direct} direct · ${historyStats.broadcast} broadcast`} />
          <Kpi label="Recipients sent" value={historyStats.sent_total} />
          <Kpi label="Failures" value={historyStats.failed_total} hint={`${historyStats.statuses.partial} partial sends`} />
          <Kpi label="Failed messages" value={historyStats.statuses.failed} hint={`${historyStats.statuses.sent} clean sends`} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_150px_150px_auto_auto]">
              <input
                value={historyFilters.q}
                onChange={event => setHistoryFilters({ ...historyFilters, q: event.target.value })}
                onKeyDown={event => event.key === "Enter" && searchHistory()}
                placeholder="Search subject, recipient, audience, admin"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <select value={historyFilters.kind} onChange={event => setHistoryFilters({ ...historyFilters, kind: event.target.value as typeof historyFilters.kind })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="all">All types</option>
                <option value="direct">Direct</option>
                <option value="broadcast">Broadcast</option>
              </select>
              <select value={historyFilters.status} onChange={event => setHistoryFilters({ ...historyFilters, status: event.target.value as typeof historyFilters.status })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="all">All status</option>
                <option value="sent">Sent</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
              <button onClick={searchHistory} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Search</button>
              <button onClick={clearHistoryFilters} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear</button>
            </div>

            {historyError && <div className="border-b border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{historyError}</div>}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-4">Message</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Recipients</th>
                    <th>Sent by</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading && (
                    <tr className="border-t border-slate-100">
                      <td colSpan={6} className="p-8 text-center text-slate-500">Loading sent messages…</td>
                    </tr>
                  )}
                  {!historyLoading && history.length === 0 && (
                    <tr className="border-t border-slate-100">
                      <td colSpan={6} className="p-8 text-center">
                        <div className="font-black text-slate-900">No sent messages found.</div>
                        <p className="mt-2 text-sm text-slate-500">Send a direct email or broadcast, then it will appear here.</p>
                      </td>
                    </tr>
                  )}
                  {!historyLoading && history.map(item => (
                    <tr
                      key={`${item.kind}-${item.id}`}
                      onClick={() => setSelectedHistory(item)}
                      className={`cursor-pointer border-t border-slate-100 hover:bg-purple-50/40 ${selectedHistory?.id === item.id ? "bg-purple-50/60" : ""}`}
                    >
                      <td className="p-4">
                        <div className="font-black text-slate-950">{item.subject || "No subject"}</div>
                        <div className="mt-1 line-clamp-1 text-xs text-slate-500">{item.message_preview || item.message || "No preview"}</div>
                      </td>
                      <td><StatusPill tone={item.kind === "broadcast" ? "warn" : "neutral"}>{item.kind}</StatusPill></td>
                      <td><StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill></td>
                      <td>
                        <div className="font-bold text-slate-800">{item.sent}/{item.recipient_count || 1}</div>
                        {item.failed > 0 && <div className="text-xs text-red-600">{item.failed} failed</div>}
                      </td>
                      <td className="text-slate-500">{item.admin_email || "Unknown"}</td>
                      <td className="min-w-[170px] text-slate-500">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm text-slate-500">
              <span>Page {historyPage} of {historyLastPage}</span>
              <div className="flex gap-2">
                <button disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Previous</button>
                <button disabled={historyPage >= historyLastPage} onClick={() => setHistoryPage(historyPage + 1)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:opacity-40">Next</button>
              </div>
            </div>
          </Card>

          <Card>
            {selectedHistory ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={selectedHistory.kind === "broadcast" ? "warn" : "neutral"}>{selectedHistory.kind}</StatusPill>
                  <StatusPill tone={statusTone(selectedHistory.status)}>{selectedHistory.status}</StatusPill>
                  {selectedHistory.provider && <StatusPill>{selectedHistory.provider}</StatusPill>}
                </div>
                <h2 className="mt-4 text-lg font-black text-slate-950">{selectedHistory.subject || "No subject"}</h2>
                <div className="mt-3 grid gap-2 text-sm">
                  <Detail label={selectedHistory.kind === "broadcast" ? "Audience" : "Recipient"} value={targetLabel(selectedHistory)} />
                  <Detail label="Delivery" value={`${selectedHistory.sent} sent · ${selectedHistory.failed} failed · ${selectedHistory.recipient_count || 1} total`} />
                  <Detail label="Sent by" value={selectedHistory.admin_email || "Unknown"} />
                  <Detail label="Created" value={formatDate(selectedHistory.created_at)} />
                  {selectedHistory.provider_message_id && <Detail label="Provider ID" value={selectedHistory.provider_message_id} />}
                </div>
                <div className="mt-5">
                  <h3 className="text-sm font-black text-slate-950">Message body</h3>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedHistory.message || selectedHistory.message_preview || "No message body stored."}</pre>
                </div>
                {selectedHistory.sample && selectedHistory.sample.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-black text-slate-950">Recipient sample</h3>
                    <div className="mt-2 space-y-2">
                      {selectedHistory.sample.slice(0, 8).map(user => (
                        <div key={user.email} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                          <div className="font-bold">{user.full_name || "No name"}</div>
                          <div className="text-xs text-slate-500">{user.email} · {user.plan || "free"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedHistory.failures && selectedHistory.failures.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-black text-red-700">Failures</h3>
                    <div className="mt-2 space-y-2">
                      {selectedHistory.failures.slice(0, 8).map(failure => (
                        <div key={`${failure.email}-${failure.error}`} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                          <span className="font-bold">{failure.email}</span>: {failure.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-black text-slate-950">Select a message</h2>
                <p className="mt-2 text-sm text-slate-500">Click a sent email or broadcast to inspect recipients, delivery counts, provider metadata, and failures.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2">
    <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
    <div className="mt-1 break-words font-bold text-slate-800">{value}</div>
  </div>
);

export default AdminEmail;
