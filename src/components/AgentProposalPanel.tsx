import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  CheckCircle2,
  RefreshCcw,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api";
import {
  taskProposalApi,
  AgentProposal,
  AgentProposalSource,
  TaskItem,
} from "@/services/api";

/**
 * Phase 6: Agent Proposal Panel.
 *
 * Surfaces the agent's drafted output, with citations, plus three big
 * actions:
 *   • Approve & mark done
 *   • Request revision (text field → re-runs the agent)
 *   • Reject & take over manually
 */

interface Props {
  task: TaskItem;
  onChanged?: (updated?: TaskItem) => void;
}

function statusBadge(status?: string) {
  switch (status) {
    case "pending_review":
      return { label: "Awaiting your review", color: "bg-purple-100 text-purple-700 border-purple-200" };
    case "approved":
      return { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "revision":
      return { label: "Revising", color: "bg-amber-100 text-amber-700 border-amber-200" };
    case "rejected":
      return { label: "Rejected", color: "bg-gray-100 text-gray-700 border-gray-200" };
    case "error":
      return { label: "Agent error", color: "bg-rose-100 text-rose-700 border-rose-200" };
    default:
      return { label: status ?? "Unknown", color: "bg-gray-100 text-gray-700 border-gray-200" };
  }
}

function SourceRow({ source, idx }: { source: AgentProposalSource; idx: number }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
      <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-purple-50 text-[11px] font-semibold text-purple-700">
        {idx + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {source.title || "Source"}
          </p>
          {source.type && (
            <Badge variant="outline" className="text-[10px] text-gray-500">
              {source.type}
            </Badge>
          )}
          {source.page_number != null && (
            <span className="text-[11px] text-gray-400">p. {source.page_number}</span>
          )}
        </div>
        {source.chunk_text && (
          <p className="mt-1 line-clamp-2 text-[12px] text-gray-500">{source.chunk_text}</p>
        )}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function AgentProposalPanel({ task, onChanged }: Props) {
  const { toast } = useToast();
  const proposal: AgentProposal | undefined = task.agent_proposal ?? undefined;

  const [busy, setBusy] = useState<"approve" | "revise" | "reject" | "run" | null>(null);
  const [showRevise, setShowRevise] = useState(false);
  const [reviseNotes, setReviseNotes] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // No proposal yet, but an agent is assigned → offer to run it now.
  if (!proposal) {
    if (!task.assigned_to_agent) return null;

    const handleRun = async () => {
      setBusy("run");
      try {
        await taskProposalApi.runNow(task.id);
        toast({
          title: "Agent is drafting",
          description: "We'll refresh the proposal in a moment.",
        });
        onChanged?.();
      } catch (e) {
        toast({
          title: "Could not start agent",
          description: getErrorMessage(e, "Try again in a few seconds."),
          variant: "destructive",
        });
      } finally {
        setBusy(null);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {task.assigned_to_agent.replace(/_/g, " ")} agent is assigned
            </h4>
            <p className="mt-0.5 text-[13px] text-gray-600">
              The agent will draft a proposal for this task on the next scan, or you can run it now.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={busy === "run"}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {busy === "run" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run now"}
          </Button>
        </div>
      </motion.div>
    );
  }

  const badge = statusBadge(proposal.status);

  const handleApprove = async () => {
    setBusy("approve");
    try {
      await taskProposalApi.approve(task.id);
      toast({ title: "Proposal approved", description: "Task marked as completed." });
      onChanged?.();
    } catch (e) {
      toast({
        title: "Could not approve",
        description: getErrorMessage(e, "Try again."),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleRevise = async () => {
    if (!reviseNotes.trim()) {
      toast({ title: "Add a note", description: "Tell the agent what to change.", variant: "destructive" });
      return;
    }
    setBusy("revise");
    try {
      await taskProposalApi.revise(task.id, reviseNotes.trim());
      toast({
        title: "Revision requested",
        description: "The agent is redoing the proposal.",
      });
      setShowRevise(false);
      setReviseNotes("");
      onChanged?.();
    } catch (e) {
      toast({
        title: "Could not request revision",
        description: getErrorMessage(e, "Try again."),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    setBusy("reject");
    try {
      await taskProposalApi.reject(task.id);
      toast({
        title: "Proposal rejected",
        description: "You can take this task over manually.",
      });
      onChanged?.();
    } catch (e) {
      toast({
        title: "Could not reject",
        description: getErrorMessage(e, "Try again."),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 via-white to-white shadow-sm"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">
              {task.assigned_to_agent
                ? task.assigned_to_agent.replace(/_/g, " ")
                : "Agent"}{" "}
              proposal
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badge.color}`}
              >
                {badge.label}
              </span>
              {proposal.sources && proposal.sources.length > 0 && (
                <span className="text-[11px] text-gray-500">
                  {proposal.sources.length} source{proposal.sources.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-4">
              {/* Content */}
              {proposal.status === "error" ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                  <div>
                    <p className="font-medium">The agent could not complete this draft.</p>
                    {proposal.error && (
                      <p className="mt-1 text-[12px] text-rose-600/90">{proposal.error}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-[13.5px] leading-relaxed text-gray-800">
                  {proposal.content ? (
                    <div className="prose prose-sm max-w-none
                      prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:tracking-tight
                      prose-h1:text-[16px] prose-h1:mt-0 prose-h1:mb-2
                      prose-h2:text-[15px] prose-h2:mt-4 prose-h2:mb-1.5
                      prose-h3:text-[14px] prose-h3:mt-3 prose-h3:mb-1
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-1.5
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-em:text-gray-600
                      prose-ul:my-1.5 prose-ul:space-y-0.5 prose-ol:my-1.5 prose-ol:space-y-0.5
                      prose-li:text-gray-700 prose-li:my-0.5 prose-li:leading-relaxed prose-li:marker:text-purple-400
                      prose-code:text-purple-700 prose-code:bg-purple-100/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[12px] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:my-2 prose-pre:text-[12px]
                      prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-purple-300 prose-blockquote:bg-purple-50/60 prose-blockquote:rounded-r-md prose-blockquote:py-0.5 prose-blockquote:not-italic
                      prose-hr:border-gray-200 prose-hr:my-3
                      prose-table:text-[12.5px] prose-th:bg-purple-50 prose-th:font-semibold prose-td:py-1.5">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Open external links in a new tab safely.
                          a: ({ href, children, ...props }) => (
                            <a
                              href={href}
                              target={href?.startsWith("http") ? "_blank" : undefined}
                              rel={href?.startsWith("http") ? "noreferrer noopener" : undefined}
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {proposal.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-gray-400">No content drafted.</span>
                  )}
                </div>
              )}

              {/* Revision notes (carried from last revision request) */}
              {proposal.revision_notes && proposal.status === "revision" && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
                  <p className="font-medium">Your revision notes:</p>
                  <p className="mt-0.5">{proposal.revision_notes}</p>
                </div>
              )}

              {/* Sources */}
              {proposal.sources && proposal.sources.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setSourcesOpen((v) => !v)}
                    className="flex items-center gap-1 text-[12px] font-medium text-gray-500 hover:text-gray-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {sourcesOpen ? "Hide" : "Show"} sources ({proposal.sources.length})
                    {sourcesOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {sourcesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 space-y-1.5 overflow-hidden"
                      >
                        {proposal.sources.map((src, i) => (
                          <SourceRow key={i} source={src} idx={i} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Actions */}
              {proposal.status === "pending_review" && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={handleApprove}
                      disabled={!!busy}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {busy === "approve" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Approve & mark done
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRevise((v) => !v)}
                      disabled={!!busy}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Request revision
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleReject}
                      disabled={!!busy}
                      className="text-gray-600 hover:text-rose-700"
                    >
                      {busy === "reject" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject & take over
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showRevise && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-purple-100 bg-white p-3">
                          <label className="text-[12px] font-medium text-gray-700">
                            What should the agent change?
                          </label>
                          <textarea
                            value={reviseNotes}
                            onChange={(e) => setReviseNotes(e.target.value)}
                            rows={3}
                            placeholder="Be specific. E.g., 'Make it shorter and add a clear next step.'"
                            className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowRevise(false);
                                setReviseNotes("");
                              }}
                              disabled={busy === "revise"}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleRevise}
                              disabled={busy === "revise"}
                              className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                              {busy === "revise" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Send to agent
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Re-run footer for non-pending states */}
              {(proposal.status === "rejected" || proposal.status === "error" || proposal.status === "revision") && (
                <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-white/60 px-3 py-2 text-[12px] text-gray-500">
                  <span>
                    {proposal.status === "revision"
                      ? "The agent is redoing the proposal."
                      : "You can run the agent again any time."}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      setBusy("run");
                      try {
                        await taskProposalApi.runNow(task.id);
                        toast({ title: "Re-running agent" });
                        onChanged?.();
                      } catch (e) {
                        toast({
                          title: "Could not re-run",
                          description: getErrorMessage(e, "Try again."),
                          variant: "destructive",
                        });
                      } finally {
                        setBusy(null);
                      }
                    }}
                    disabled={!!busy}
                  >
                    {busy === "run" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="mr-2 h-4 w-4" />
                    )}
                    Run again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
