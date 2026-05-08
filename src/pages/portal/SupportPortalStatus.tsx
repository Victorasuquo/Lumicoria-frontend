import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MessageSquare, Bot, Send, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  customerServicePublicApi,
  type PublicBranding,
  type PublicTicketStatus,
} from "@/services/api";

/**
 * Public ticket status page at `/portal/:slug/status/:ticket_id`.
 *
 * Privacy gate:  the email used to submit the ticket must be passed as
 * `?email=...`.  If the URL is missing it (e.g. someone shared just the
 * link), we ask the visitor to enter their email before fetching.
 */

const STATUS_BADGE: Record<string, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-100",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-100",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Closed: "bg-zinc-50 text-zinc-600 border-zinc-100",
  Cancelled: "bg-zinc-50 text-zinc-500 border-zinc-100",
};

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return d.toLocaleString();
}

const SupportPortalStatus: React.FC = () => {
  const { slug = "", ticket_id = "" } = useParams<{ slug: string; ticket_id: string }>();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const justSubmitted = searchParams.get("new") === "1";

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [confirmedEmail, setConfirmedEmail] = useState(initialEmail);
  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [ticket, setTicket] = useState<PublicTicketStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline reply
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Load branding always.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    customerServicePublicApi
      .getBranding(slug)
      .then((b) => !cancelled && setBranding(b))
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [slug]);

  const fetchStatus = useCallback(async (email: string) => {
    if (!slug || !ticket_id || !email) return;
    setLoading(true);
    setNotFound(false);
    setError(null);
    try {
      const t = await customerServicePublicApi.getTicketStatus(slug, ticket_id, email);
      setTicket(t);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err?.response?.data?.detail || "Could not load ticket status.");
      }
    } finally {
      setLoading(false);
    }
  }, [slug, ticket_id]);

  useEffect(() => {
    if (confirmedEmail) fetchStatus(confirmedEmail);
  }, [confirmedEmail, fetchStatus]);

  const handleEmailGate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setConfirmedEmail(emailInput.trim().toLowerCase());
  }, [emailInput]);

  const handleReply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !confirmedEmail || !ticket) return;
    setReplyLoading(true);
    setReplyError(null);
    try {
      await customerServicePublicApi.postCustomerReply(slug, ticket.id, {
        customer_email: confirmedEmail,
        body: reply.trim(),
      });
      setReply("");
      // Reload to show the new context (operator sees customer reply on their side).
      fetchStatus(confirmedEmail);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setReplyError("You're sending replies too quickly. Try again in a few minutes.");
      } else {
        setReplyError(err?.response?.data?.detail || "Could not send reply.");
      }
    } finally {
      setReplyLoading(false);
    }
  }, [slug, ticket, confirmedEmail, reply, fetchStatus]);

  const heroStyle: React.CSSProperties = useMemo(() => {
    if (!branding) return {};
    return { backgroundImage: `linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.accent_color} 100%)` };
  }, [branding]);

  // ─── Email gate (no email in URL) ─────────────────────────────────
  if (!confirmedEmail) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        {branding && <PortalHeader branding={branding} slug={slug} compact />}
        <div className="flex-1 flex items-center justify-center px-6">
          <form onSubmit={handleEmailGate} className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6 max-w-md w-full">
            <ShieldCheck size={20} className="text-zinc-300 mb-3" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Verify your email</h2>
            <p className="text-sm text-zinc-500 mb-4">
              To view ticket <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{ticket_id}</code>, please enter the email address you used when submitting.
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your-email@example.com"
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 mb-3"
            />
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              style={branding ? { backgroundColor: branding.primary_color } : { backgroundColor: "#4f46e5" }}
            >
              View ticket
            </button>
          </form>
        </div>
        <PortalFooter />
      </div>
    );
  }

  // ─── Loading / error / not found ──────────────────────────────────
  if (loading && !ticket) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        {branding && <PortalHeader branding={branding} slug={slug} compact />}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={32} className="text-zinc-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">Ticket not found</h1>
            <p className="text-sm text-zinc-500 mb-4">
              We couldn't find ticket <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{ticket_id}</code> for this email address. Double-check the email and ticket ID.
            </p>
            <button
              onClick={() => setConfirmedEmail("")}
              className="text-sm text-zinc-700 hover:underline"
            >
              Try a different email
            </button>
          </div>
        </div>
        <PortalFooter />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle size={28} className="text-red-300 mx-auto mb-3" />
          <p className="text-sm text-zinc-600">{error}</p>
        </div>
      </div>
    );
  }
  if (!ticket || !branding) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Compact hero */}
      <header className="text-white" style={heroStyle}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <Link to={`/portal/${slug}`} className="text-sm text-white/90 hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft size={14} />
            <span>Back to {branding.display_name}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {justSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-start gap-2"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Your request was submitted.</p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  We'll reply to <strong>{confirmedEmail}</strong> when there's an update. You can also check this page anytime.
                </p>
              </div>
            </motion.div>
          )}

          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-50">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-mono">{ticket.id}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_BADGE[ticket.status] || ""}`}>
                  {ticket.status}
                </span>
              </div>
              <h1 className="text-lg font-semibold text-zinc-900 mb-1">{ticket.subject}</h1>
              <p className="text-xs text-zinc-400">
                Submitted {formatRelativeTime(ticket.created_at)}
                {ticket.resolved_at && ` · Resolved ${formatRelativeTime(ticket.resolved_at)}`}
              </p>
            </div>

            {/* Replies timeline */}
            <div className="p-5 space-y-4 bg-zinc-50/40">
              {ticket.replies.length === 0 ? (
                <div className="text-center py-6 text-sm text-zinc-400">
                  <MessageSquare size={20} className="mx-auto mb-2 opacity-40" />
                  Your inquiry is in the queue. Replies from our team will appear here.
                </div>
              ) : (
                ticket.replies.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-3"
                  >
                    <div className="shrink-0 mt-0.5">
                      {r.is_ai ? (
                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Bot size={12} className="text-indigo-600" />
                        </div>
                      ) : (
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-medium text-white"
                          style={{ backgroundColor: branding.primary_color }}
                        >
                          {(r.author_display_name || branding.display_name).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-500">
                        <span className="font-medium text-zinc-700">{r.author_display_name || "Support"}</span>
                        {r.is_ai && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-medium">AI-assisted</span>
                        )}
                        <span className="text-zinc-300">·</span>
                        <span>{formatRelativeTime(r.created_at)}</span>
                      </div>
                      <div className="bg-white rounded-lg border border-zinc-100 px-3.5 py-2.5 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                        {r.body}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Customer reply box */}
            {ticket.status !== "Closed" && ticket.status !== "Cancelled" && (
              <form onSubmit={handleReply} className="p-5 border-t border-zinc-100 bg-white">
                <p className="text-xs font-medium text-zinc-700 mb-2">Add to this conversation</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Write a follow-up message..."
                  maxLength={10_000}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
                />
                {replyError && <p className="text-xs text-red-600 mt-1">{replyError}</p>}
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={replyLoading || !reply.trim()}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: branding.primary_color }}
                  >
                    {replyLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
};

const PortalHeader: React.FC<{ branding: PublicBranding; slug: string; compact?: boolean }> = ({ branding, slug, compact }) => (
  <header
    className="text-white"
    style={{ backgroundImage: `linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.accent_color} 100%)` }}
  >
    <div className={`max-w-3xl mx-auto px-6 ${compact ? "py-4" : "py-12"}`}>
      <Link to={`/portal/${slug}`} className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">
        {branding.logo_url && <img src={branding.logo_url} alt="" className="h-7 w-7 rounded" />}
        <span className="font-medium">{branding.display_name}</span>
      </Link>
    </div>
  </header>
);

const PortalFooter: React.FC = () => (
  <footer className="py-6 border-t border-zinc-100 bg-white">
    <div className="max-w-3xl mx-auto px-6 text-right text-[11px] text-zinc-400">
      <a href="https://lumicoria.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 transition-colors">
        Powered by Lumicoria Agent
      </a>
    </div>
  </footer>
);

export default SupportPortalStatus;
