import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi, { AdminTicket } from "@/services/adminApi";
import { Card, Loading, PageHeader, StatusPill } from "./adminUi";

const AdminMessages: React.FC = () => {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [active, setActive] = useState<AdminTicket | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [q, setQ] = useState("");
  const load = () => {
    setLoading(true);
    return adminApi
      .messages({ page_size: 100, status: filterStatus || undefined, q: q || undefined })
      .then(res => setTickets(res.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterStatus]);
  const open = async (id: string) => { const t = await adminApi.message(id); setActive(t); setStatus(t.status); };
  const send = async () => { if (!active || !reply.trim()) return; await adminApi.replyMessage(active.id, reply); setReply(""); await open(active.id); await load(); };
  const update = async () => { if (!active || !status) return; const t = await adminApi.patchMessage(active.id, status); setActive(t); await load(); };
  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title="Admin messages"
        subtitle="Contact-page submissions and Lumicoria platform support tickets."
        action={<Link to="/admin/email" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Broadcast to users</Link>}
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Search subject or email" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        <button onClick={() => load()} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Search</button>
        {(q || filterStatus) && <button onClick={() => { setQ(""); setFilterStatus(""); }} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear</button>}
      </div>
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="max-h-[75vh] overflow-auto p-0">
          {loading ? <Loading /> : tickets.length === 0 ? <div className="p-6 text-sm text-slate-500">No tickets match.</div> : tickets.map(ticket => (
            <button key={ticket.id} onClick={() => open(ticket.id)} className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-purple-50/40 ${active?.id === ticket.id ? "bg-purple-50" : ""}`}>
              <div className="flex items-center justify-between gap-3"><b className="line-clamp-1">{ticket.subject}</b><StatusPill tone={ticket.status === "Open" ? "warn" : ticket.status === "Resolved" ? "ok" : "neutral"}>{ticket.status}</StatusPill></div>
              <div className="mt-1 text-xs text-slate-500">{ticket.customer_email} · {new Date(ticket.created_at).toLocaleString()}</div>
            </button>
          ))}
        </Card>
        <Card>
          {!active ? <p className="text-sm text-slate-500">Select a message to read and reply.</p> : (
            <div>
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div><h2 className="text-xl font-black">{active.subject}</h2><p className="text-sm text-slate-500">{active.customer_name || "Customer"} · {active.customer_email}</p></div>
                <div className="flex gap-2">
                  <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option><option>Cancelled</option></select>
                  <button onClick={update} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Update</button>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700" dangerouslySetInnerHTML={{ __html: active.body }} />
              <div className="mt-5 space-y-3">
                {(active.replies || []).map(r => <div key={r.id} className="rounded-2xl border border-slate-100 p-4"><div className="mb-2 text-xs font-bold uppercase text-slate-400">{r.author_type} · {r.author_display_name || "Unknown"} · {new Date(r.created_at).toLocaleString()}</div><div className="text-sm" dangerouslySetInnerHTML={{ __html: r.body }} /></div>)}
              </div>
              <textarea value={reply} onChange={e => setReply(e.target.value)} rows={6} placeholder="Reply as Agent at Lumicoria…" className="mt-5 w-full rounded-2xl border border-slate-200 p-4 text-sm" />
              <button onClick={send} disabled={!reply.trim()} className="mt-3 rounded-2xl bg-[#6C4AB0] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Send email reply</button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminMessages;
