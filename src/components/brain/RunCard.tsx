/**
 * RunCard — one row in the BrainRuns list page.
 *
 * Shows the run's mode + status + when it ran + duration + the four
 * core counters (emails, attachments, tasks, proposals) + whether the
 * digest was sent. Clicking the card navigates to the run detail.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, AlertTriangle, XCircle, MinusCircle, Mail, Paperclip, ListChecks, Bot, Send, Sunrise, Moon, ChevronRight,
} from "lucide-react";
import type { BrainRun } from "@/services/api";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ok:       { label: "Healthy",  color: "text-emerald-700", bg: "bg-emerald-50", Icon: Check },
  degraded: { label: "Degraded", color: "text-amber-700",   bg: "bg-amber-50",   Icon: AlertTriangle },
  failed:   { label: "Failed",   color: "text-red-700",     bg: "bg-red-50",     Icon: XCircle },
  skipped:  { label: "Skipped",  color: "text-gray-600",    bg: "bg-gray-100",   Icon: MinusCircle },
};

function fmtDuration(ms?: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtRelative(ts?: string | null): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  } catch {
    return ts;
  }
}

function Counter({
  icon: Icon, value, label,
}: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <span className="font-medium text-gray-900">{value}</span>
      <span className="hidden md:inline text-gray-500">{label}</span>
    </div>
  );
}

interface RunCardProps {
  run: BrainRun;
}

export default function RunCard({ run }: RunCardProps) {
  const navigate = useNavigate();
  const s = STATUS_STYLES[run.status] || STATUS_STYLES.ok;
  const ModeIcon = run.mode === "evening" ? Moon : Sunrise;

  return (
    <button
      type="button"
      onClick={() => navigate(`/brain/runs/${run.id}`)}
      className="w-full text-left bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all rounded-xl p-4 group"
    >
      <div className="flex items-start gap-4">
        {/* Mode badge */}
        <div className={`shrink-0 w-10 h-10 rounded-lg ${run.mode === "evening" ? "bg-indigo-50" : "bg-purple-50"} flex items-center justify-center`}>
          <ModeIcon className={`w-5 h-5 ${run.mode === "evening" ? "text-indigo-600" : "text-purple-600"}`} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: mode + status + when */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900 capitalize">
              {run.mode} run
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-[2px] rounded-md ${s.bg} ${s.color}`}>
              <s.Icon className="w-3 h-3" />
              {s.label}
            </span>
            <span className="text-xs text-gray-400">{fmtRelative(run.started_at)}</span>
            {run.digest_sent && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-[2px] rounded-md bg-purple-50 text-purple-700">
                <Send className="w-3 h-3" />
                Digest sent
              </span>
            )}
          </div>

          {/* Skip reason or error, if present */}
          {run.skip_reason && (
            <div className="mt-1 text-xs text-gray-500">
              Skip reason: <code className="bg-gray-50 px-1 py-0.5 rounded">{run.skip_reason}</code>
            </div>
          )}
          {run.error && !run.skip_reason && (
            <div className="mt-1 text-xs text-red-600 truncate">
              Error: {run.error}
            </div>
          )}

          {/* Counters row */}
          <div className="mt-2 flex items-center gap-4 flex-wrap">
            <Counter icon={Mail} value={run.emails_processed} label="emails" />
            <Counter icon={Paperclip} value={run.attachments_processed} label="attachments" />
            <Counter icon={ListChecks} value={run.tasks_created} label="tasks" />
            <Counter icon={Bot} value={run.proposals_drafted} label="proposals" />
          </div>
        </div>

        {/* Right column: duration + chevron */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            {fmtDuration(run.duration_ms)}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
        </div>
      </div>
    </button>
  );
}
