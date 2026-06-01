/**
 * Invites page (Phase 5).
 *
 * Two tabs:
 *   • Sent — invites the current user has issued.  Resend / revoke per row.
 *   • Received — pending invites addressed to the user's email.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mail,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { inviteApi, InviteItem, InviteRole, InviteStatus, getErrorMessage } from "@/services/api";

// Standard RFC-5322-ish email shape — same regex the backend uses for soft checks.
// We validate up-front so the user gets a friendly inline error instead of the
// 422 from pydantic's EmailStr (which otherwise blanks the page).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<InviteStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  expired: { label: "Expired", cls: "bg-gray-50 text-gray-500 border-gray-200", icon: AlertCircle },
  revoked: { label: "Revoked", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

const Invites: React.FC = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"sent" | "received">("sent");
  const [sent, setSent] = useState<InviteItem[]>([]);
  const [received, setReceived] = useState<InviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        inviteApi.listSent({ limit: 100 }).catch(() => []),
        inviteApi.listReceived().catch(() => []),
      ]);
      setSent(s);
      setReceived(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleResend = async (id: string) => {
    try {
      await inviteApi.resend(id);
      toast({ title: "Invite resent" });
      load();
    } catch (e: unknown) {
      toast({ title: "Could not resend", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this invite?")) return;
    try {
      await inviteApi.revoke(id);
      toast({ title: "Invite revoked" });
      load();
    } catch (e: unknown) {
      toast({ title: "Could not revoke", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  const handleAccept = async (token: string) => {
    try {
      const r = await inviteApi.acceptByToken(token);
      toast({
        title: "Invitation accepted",
        description:
          (r.orgs_joined ? `Joined ${r.orgs_joined} workspace${r.orgs_joined === 1 ? "" : "s"}. ` : "") +
          (r.tasks_reassigned ? `${r.tasks_reassigned} task${r.tasks_reassigned === 1 ? "" : "s"} now assigned to you.` : ""),
      });
      load();
    } catch (e: unknown) {
      toast({ title: "Accept failed", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invites</h1>
              <p className="text-sm text-gray-500">Invite collaborators to tasks, projects, or your workspace.</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus size={14} className="mr-1.5" /> New invite
          </Button>
        </header>

        {/* Tabs */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-1 inline-flex mb-5">
          {(["sent", "received"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize",
                tab === t ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:text-gray-800"
              )}
            >
              {t}
              <span className="ml-2 text-[10px] text-gray-400">
                {t === "sent" ? sent.length : received.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
          ) : tab === "sent" ? (
            <SentList sent={sent} onResend={handleResend} onRevoke={handleRevoke} />
          ) : (
            <ReceivedList received={received} onAccept={handleAccept} />
          )}
        </div>
      </div>

      <CreateInviteModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          load();
        }}
      />
    </div>
  );
};

/* ── Sent list ─────────────────────────────────────────────────────── */
const SentList: React.FC<{
  sent: InviteItem[];
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
}> = ({ sent, onResend, onRevoke }) => {
  if (sent.length === 0) {
    return (
      <div className="p-10 text-center">
        <Send size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">No invites sent yet</p>
        <p className="text-xs text-gray-400 mt-1">Invite teammates to a task and they'll appear here.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-gray-50">
      {sent.map((inv) => {
        const s = STATUS_BADGE[inv.status];
        return (
          <li key={inv.id} className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {(inv.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                <Badge variant="outline" className={cn("text-[10px]", s.cls)}>
                  <s.icon size={10} className="mr-1" /> {s.label}
                </Badge>
                <span className="text-[11px] text-gray-400">{inv.scope}</span>
                <span className="text-[11px] text-gray-400">· {inv.role}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Sent {formatDate(inv.created_at)}
                {inv.expires_at && inv.status === "pending" && <> · expires {formatDate(inv.expires_at)}</>}
                {inv.task_ids && inv.task_ids.length > 0 && <> · {inv.task_ids.length} task{inv.task_ids.length === 1 ? "" : "s"}</>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {inv.status === "pending" && (
                <>
                  <button
                    onClick={() => onResend(inv.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Resend email"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => onRevoke(inv.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Revoke"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/* ── Received list ──────────────────────────────────────────────────── */
const ReceivedList: React.FC<{
  received: InviteItem[];
  onAccept: (token: string) => void;
}> = ({ received, onAccept }) => {
  if (received.length === 0) {
    return (
      <div className="p-10 text-center">
        <Mail size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">No pending invitations</p>
        <p className="text-xs text-gray-400 mt-1">Invites sent to your email will appear here.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-gray-50">
      {received.map((inv) => (
        <li key={inv.id} className="p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {(inv.inviter_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{inv.inviter_name || inv.inviter_email || "Someone"}</span>
              <span className="text-gray-500"> invited you to a {inv.scope}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Role: {inv.role} · Sent {formatDate(inv.created_at)}
              {inv.expires_at && <> · expires {formatDate(inv.expires_at)}</>}
            </p>
            {inv.message && (
              <p className="text-sm text-gray-700 mt-2 italic border-l-2 border-purple-200 pl-3">
                "{inv.message}"
              </p>
            )}
          </div>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs shrink-0"
            // The token lives in the email; received invites don't expose it
            // for security.  Acceptance for already-signed-in users is via /by-token/{token}.
            // We approximate it here by querying invite_id → preview/accept;
            // for now we render an "Open invitation" link the user can open.
            onClick={() => onAccept(inv.id)}
            disabled
            title="Open the invitation email to accept — the secure link is in your inbox."
          >
            Accept from email
          </Button>
        </li>
      ))}
    </ul>
  );
};

/* ── Create invite modal ────────────────────────────────────────────── */
const CreateInviteModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ open, onClose, onCreated }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("member");
      setMessage("");
      setEmailError(null);
    }
  }, [open]);

  // Validate as the user types AFTER they've moved past the field once.
  const validateEmail = (value: string): string | null => {
    const v = value.trim();
    if (!v) return "Email is required";
    if (!EMAIL_REGEX.test(v)) return "Please enter a valid email address (e.g. name@example.com)";
    return null;
  };

  const handleCreate = async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError(null);
    setSaving(true);
    try {
      await inviteApi.create({
        email: email.trim(),
        scope: "organization",
        role,
        message: message.trim() || undefined,
      });
      toast({ title: "Invite sent", description: `An invitation email has been sent to ${email.trim()}.` });
      onCreated();
    } catch (e: unknown) {
      toast({ title: "Could not send invite", description: getErrorMessage(e, "Try again"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[460px] max-w-[92vw] bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Invite to workspace</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
            </header>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={() => setEmailError(validateEmail(email))}
                  placeholder="grace@example.com"
                  className={cn(emailError && "border-red-300 focus-visible:ring-red-200")}
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p className="text-[11px] text-red-500 mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as InviteRole)}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Personal note (optional)</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="A few words to include in the email." />
              </div>
            </div>
            <footer className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs" onClick={handleCreate} disabled={saving}>
                {saving ? "Sending…" : "Send invite"}
              </Button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Invites;
