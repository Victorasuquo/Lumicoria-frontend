/**
 * AssigneePopover — click-to-edit assignee on a task card (Phase 5).
 *
 * Behaviour:
 *   • Renders the current assignee as a pill button.  When the assignee is
 *     pending (email-invite), shows an amber "Pending" badge.
 *   • Click → small popover opens with a search input.
 *   • Type a name or email → debounced GET /users/search → matching org
 *     members appear.  Click one → POST /tasks/{id}/assign with user_id.
 *   • If the input is a valid email and no match is found, an
 *     "Invite this person" CTA appears → POST /tasks/{id}/assign with email,
 *     the backend issues an invite and stamps the task.
 *
 * Server actions are debounced + idempotent; failures stay in the popover
 * (no toast/blank-page traps).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  Send,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  userApi,
  taskAssignApi,
  inviteApi,
  agentRegistryApi,
  TaskItem,
  UserSearchResult,
  InviteItem,
  InviteStatus,
  AgentRegistryEntry,
  getErrorMessage,
} from "@/services/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  task: TaskItem;
  /** Called after a successful assignment.  Parent should re-fetch the task. */
  onAssigned: () => void;
  /** Compact pill (used on the list) vs. wider chip (used in the detail panel). */
  variant?: "compact" | "detail";
}

const STATUS_BADGE: Record<InviteStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  accepted: { label: "Accepted", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  revoked: { label: "Revoked", cls: "bg-red-100 text-red-600 border-red-200" },
};

/** Pick a display label for the current assignee on the task. */
function getAssigneeLabel(task: TaskItem): string {
  if (task.metadata?.assigned_to_name) return String(task.metadata.assigned_to_name);
  if (task.assigned_to_email) return String(task.assigned_to_email);
  if (task.metadata?.suggested_assignee) return String(task.metadata.suggested_assignee);
  if (task.assigned_to) return String(task.assigned_to);
  return "Unassigned";
}

/** Pretty agent name from a registry key (e.g. "legal_document" → "Legal Document"). */
function agentDisplayName(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}

function initials(label: string): string {
  const cleaned = label.replace(/[<>]/g, "").trim();
  if (!cleaned) return "?";
  if (cleaned.includes("@")) return cleaned[0].toUpperCase();
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("") || "?";
}

export const AssigneePopover: React.FC<Props> = ({ task, onAssigned, variant = "compact" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<InviteItem | null>(null);
  // Phase 6: tab between "people" and "agents".
  const [tab, setTab] = useState<"people" | "agents">("people");
  const [agentRegistry, setAgentRegistry] = useState<AgentRegistryEntry[]>([]);
  const [agentRegistryLoaded, setAgentRegistryLoaded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const assigneeLabel = getAssigneeLabel(task);
  const isPending = task.assignee_kind === "email_invite";
  const isAgent = !!task.assigned_to_agent;
  const hasHuman = !!(task.assigned_to || task.assigned_to_email);
  const isUnassigned = !hasHuman && !isAgent;
  const agentLabel = isAgent ? agentDisplayName(String(task.assigned_to_agent)) : "";

  // ── Close on outside-click / Escape ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // ── Focus the input when the popover opens ────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setError(null);
      // Default to the right tab based on the current assignment so the
      // user always lands where it makes sense to edit from.
      setTab(isAgent && !hasHuman ? "agents" : "people");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, isAgent, hasHuman]);

  // ── Fetch the pending-invite metadata when this task has one ──────────
  useEffect(() => {
    if (!task.invite_id || !isPending) {
      setInviteStatus(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // We don't have a "get invite by id" public endpoint, but the user's
        // own /invites/sent endpoint returns it.  We filter to the matching id.
        const sent = await inviteApi.listSent({ limit: 100 });
        if (cancelled) return;
        const match = sent.find((i) => i.id === task.invite_id);
        if (match) setInviteStatus(match);
      } catch {
        // best-effort — no metadata to show is fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [task.invite_id, isPending]);

  // ── Debounced search ──────────────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    setSearching(true);
    setError(null);
    try {
      const r = await userApi.search(q, 8);
      setResults(r);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Search failed"));
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // ── Assign actions ────────────────────────────────────────────────────
  const handleAssignToUser = async (user: UserSearchResult) => {
    setSaving(true);
    setError(null);
    try {
      await taskAssignApi.assign(task.id, { user_id: user.id });
      setOpen(false);
      onAssigned();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not assign"));
    } finally {
      setSaving(false);
    }
  };

  const handleInviteByEmail = async () => {
    const email = query.trim();
    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email address (e.g. name@example.com)");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await taskAssignApi.assign(task.id, { email });
      setOpen(false);
      onAssigned();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not send invite"));
    } finally {
      setSaving(false);
    }
  };

  // ── Phase 6: agent assignment ──────────────────────────────────────
  const loadAgentRegistry = useCallback(async () => {
    if (agentRegistryLoaded) return;
    try {
      const r = await agentRegistryApi.list();
      setAgentRegistry(r);
      setAgentRegistryLoaded(true);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not load agents"));
    }
  }, [agentRegistryLoaded]);

  useEffect(() => {
    if (open && tab === "agents") {
      void loadAgentRegistry();
    }
  }, [open, tab, loadAgentRegistry]);

  const handleAssignToAgent = async (entry: AgentRegistryEntry) => {
    setSaving(true);
    setError(null);
    try {
      await taskAssignApi.assign(task.id, { agent_key: entry.key });
      setOpen(false);
      onAssigned();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not assign agent"));
    } finally {
      setSaving(false);
    }
  };

  const filteredAgents = useMemo(() => {
    if (!query.trim()) return agentRegistry;
    const q = query.trim().toLowerCase();
    return agentRegistry.filter(
      (a) =>
        a.key.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [agentRegistry, query]);

  const handleUnassign = async () => {
    setSaving(true);
    setError(null);
    try {
      // Use the generic update endpoint to clear *every* assignment field —
      // human, email-invite, and agent — plus stale proposal.
      const { taskApi } = await import("@/services/api");
      await taskApi.updateTask(task.id, {
        assigned_to: null,
        assigned_to_email: null,
        assigned_to_agent: null,
        assignee_kind: null,
        agent_proposal: null,
      } as any);
      setOpen(false);
      onAssigned();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not unassign"));
    } finally {
      setSaving(false);
    }
  };

  const showInviteCta =
    EMAIL_REGEX.test(query.trim()) &&
    !searching &&
    !results.some((u) => u.email.toLowerCase() === query.trim().toLowerCase());

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full transition-colors",
          variant === "compact"
            ? "px-2 py-0.5 text-[11px] hover:bg-purple-50"
            : "px-2.5 py-1 text-xs hover:bg-purple-50 border border-gray-200",
          isPending && "bg-amber-50 hover:bg-amber-100 border-amber-200",
          isAgent && !hasHuman && "bg-purple-50 hover:bg-purple-100 border-purple-200",
          isUnassigned && "text-gray-400 hover:text-purple-600",
        )}
        title={
          isPending
            ? "Invite is pending"
            : isAgent && !hasHuman
            ? `Assigned to ${agentLabel} agent — click to change`
            : isUnassigned
            ? "Assign someone or an agent"
            : "Change assignee"
        }
      >
        {isUnassigned ? (
          <>
            <UserIcon size={11} />
            <span>Assign</span>
          </>
        ) : isPending ? (
          <>
            <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[9px] font-semibold">
              {initials(assigneeLabel)}
            </span>
            <span className="text-amber-700 truncate max-w-[140px]">{assigneeLabel}</span>
            <span className="text-[9px] uppercase tracking-wide bg-amber-100 text-amber-700 px-1 py-0.5 rounded">
              Pending
            </span>
          </>
        ) : isAgent && !hasHuman ? (
          <>
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot size={9} />
            </span>
            <span className="text-purple-700 truncate max-w-[160px]">{agentLabel}</span>
            <span className="text-[9px] uppercase tracking-wide bg-purple-100 text-purple-700 px-1 py-0.5 rounded">
              Agent
            </span>
          </>
        ) : (
          <>
            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-semibold">
              {initials(assigneeLabel)}
            </span>
            <span className="text-violet-700 truncate max-w-[140px]">{assigneeLabel}</span>
            {/* Phase 6: when a human AND an agent are co-assigned, add a small bot chip. */}
            {isAgent && (
              <span
                className="ml-0.5 inline-flex items-center gap-1 rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] text-purple-700 border border-purple-100"
                title={`${agentLabel} agent is co-assigned`}
              >
                <Bot size={9} />
                {agentLabel}
              </span>
            )}
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute z-50 mt-1 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header — current state */}
            <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                Assignee
              </span>
              {(!isUnassigned || task.assigned_to_agent) && (
                <button
                  type="button"
                  onClick={handleUnassign}
                  disabled={saving}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  Unassign
                </button>
              )}
            </div>

            {/* Phase 6: tab switcher ─ People vs Agents ──────────────────── */}
            <div className="flex border-b border-gray-100 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setTab("people")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors",
                  tab === "people"
                    ? "text-purple-700 border-b-2 border-purple-500 bg-white"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                <UserIcon size={12} /> People
              </button>
              <button
                type="button"
                onClick={() => setTab("agents")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors",
                  tab === "agents"
                    ? "text-purple-700 border-b-2 border-purple-500 bg-white"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Sparkles size={12} /> Agents
                {task.assigned_to_agent && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-purple-500" />
                )}
              </button>
            </div>

            {/* Pending invite metadata strip */}
            {isPending && inviteStatus && (
              <div className="px-3 py-2 bg-amber-50/40 border-b border-amber-100">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-amber-800">
                    Invited {new Date(inviteStatus.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded border text-[10px]",
                      STATUS_BADGE[inviteStatus.status].cls,
                    )}
                  >
                    {STATUS_BADGE[inviteStatus.status].label}
                  </span>
                </div>
                {inviteStatus.expires_at && (
                  <p className="text-[10px] text-amber-700/80 mt-0.5">
                    Expires {new Date(inviteStatus.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Search input */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    tab === "people"
                      ? "Search name or email…"
                      : "Search agents by capability…"
                  }
                  className="w-full px-3 py-2 pr-7 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {error && (
                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} /> {error}
                </p>
              )}
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto">
              {tab === "people" && (
                <>
                  {searching && (
                    <div className="px-3 py-4 flex items-center justify-center text-gray-400 text-xs">
                      <Loader2 size={14} className="animate-spin mr-1.5" /> Searching…
                    </div>
                  )}

                  {!searching && results.length > 0 && (
                    <ul className="py-1">
                      {results.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleAssignToUser(u)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-50 transition-colors text-left disabled:opacity-50"
                          >
                            <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                              {initials(u.full_name || u.email)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-900 truncate">{u.full_name || u.email.split("@")[0]}</p>
                              <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!searching && query.trim() && results.length === 0 && !showInviteCta && (
                    <div className="px-3 py-3 text-center text-[11px] text-gray-400">
                      No matching teammates. Type a full email to invite someone.
                    </div>
                  )}

                  {showInviteCta && (
                    <div className="p-2 border-t border-gray-100 bg-gradient-to-b from-purple-50/40 to-purple-50/0">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleInviteByEmail}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span className="flex-1 text-left">
                          Invite <span className="font-medium">{query.trim()}</span>
                        </span>
                        <Mail size={12} className="opacity-70" />
                      </button>
                      <p className="text-[10px] text-purple-600/70 mt-1.5 text-center">
                        They'll get an email to join Lumicoria and pick up this task.
                      </p>
                    </div>
                  )}

                  {!searching && !query.trim() && (
                    <div className="px-3 py-3 text-center text-[11px] text-gray-400">
                      Start typing to find teammates or invite someone new.
                    </div>
                  )}
                </>
              )}

              {tab === "agents" && (
                <>
                  {!agentRegistryLoaded && (
                    <div className="px-3 py-4 flex items-center justify-center text-gray-400 text-xs">
                      <Loader2 size={14} className="animate-spin mr-1.5" /> Loading agents…
                    </div>
                  )}

                  {agentRegistryLoaded && filteredAgents.length === 0 && (
                    <div className="px-3 py-3 text-center text-[11px] text-gray-400">
                      No agents match that search.
                    </div>
                  )}

                  {agentRegistryLoaded && filteredAgents.length > 0 && (
                    <ul className="py-1">
                      {filteredAgents.map((agent) => {
                        const active = task.assigned_to_agent === agent.key;
                        return (
                          <li key={agent.key}>
                            <button
                              type="button"
                              disabled={saving || active}
                              onClick={() => handleAssignToAgent(agent)}
                              className={cn(
                                "w-full flex items-start gap-2 px-3 py-2 transition-colors text-left disabled:opacity-50",
                                active ? "bg-purple-50" : "hover:bg-purple-50",
                              )}
                            >
                              <span className="mt-0.5 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shrink-0">
                                <Bot size={12} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm text-gray-900 truncate">{agent.name}</p>
                                  {active && (
                                    <span className="text-[9px] uppercase tracking-wide bg-purple-100 text-purple-700 px-1 py-0.5 rounded">
                                      Assigned
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-2">{agent.description}</p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="px-3 py-2 border-t border-gray-100 bg-purple-50/30">
                    <p className="text-[10px] text-purple-700/80 leading-snug">
                      Assigning an agent triggers a draft proposal. You'll review and approve before anything is final.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssigneePopover;
