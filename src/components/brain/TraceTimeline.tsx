/**
 * TraceTimeline — visual step-by-step view of one BrainRun's nodes.
 *
 * Each node renders as a card with:
 *   - name + status pill (ok / fallback / retry / fail)
 *   - duration_ms badge
 *   - eval_score bar (0..1)
 *   - expandable payload_summary (counts + IDs, never PII)
 *
 * Designed to be embedded inside a page (no header / no own layout) —
 * the parent page owns the chrome.
 */

import React, { useState } from "react";
import {
  Check, AlertTriangle, RotateCw, XCircle, ChevronDown, ChevronRight, Clock,
} from "lucide-react";
import type { BrainTrace } from "@/services/api";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; ring: string; Icon: React.ElementType }> = {
  ok:       { label: "OK",       color: "text-emerald-700", bg: "bg-emerald-50",  ring: "ring-emerald-200", Icon: Check },
  fallback: { label: "Fallback", color: "text-amber-700",   bg: "bg-amber-50",    ring: "ring-amber-200",   Icon: AlertTriangle },
  retry:    { label: "Retry",    color: "text-sky-700",     bg: "bg-sky-50",      ring: "ring-sky-200",     Icon: RotateCw },
  fail:     { label: "Failed",   color: "text-red-700",     bg: "bg-red-50",      ring: "ring-red-200",     Icon: XCircle },
};

function statusOf(s: string) {
  return STATUS_STYLES[s] || STATUS_STYLES.ok;
}

function fmtDuration(ms?: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtTime(ts?: string | null): string {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return ts;
  }
}

function EvalScoreBar({ score }: { score?: number | null }) {
  if (score == null) return null;
  const pct = Math.max(0, Math.min(1, score)) * 100;
  const colour =
    score >= 0.8 ? "bg-emerald-500"
    : score >= 0.5 ? "bg-amber-500"
    : "bg-red-500";
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 w-32">
      <span className="font-mono w-8 text-right">{score.toFixed(2)}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${colour}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PayloadSummary({ data }: { data: Record<string, any> }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-xs text-gray-400 italic">(no payload)</div>;
  }
  return (
    <pre className="text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-64 text-gray-700">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

interface TraceTimelineProps {
  traces: BrainTrace[];
  className?: string;
}

export default function TraceTimeline({ traces, className = "" }: TraceTimelineProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!traces || traces.length === 0) {
    return (
      <div className={`text-sm text-gray-500 italic px-4 py-8 text-center ${className}`}>
        No trace events recorded for this run.
      </div>
    );
  }

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* The thin connecting rail behind every node card */}
      <div className="absolute left-[14px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-purple-200 via-purple-100 to-transparent rounded-full" aria-hidden />

      <ol className="space-y-3">
        {traces.map((t, idx) => {
          const key = `${t.node}-${idx}`;
          const s = statusOf(t.status);
          const isOpen = expanded.has(key);
          return (
            <li key={key} className="relative pl-10">
              {/* Step badge on the rail */}
              <div className={`absolute left-0 top-3 w-[30px] h-[30px] rounded-full ring-4 ring-white flex items-center justify-center ${s.bg} ${s.ring}`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </div>

              <button
                type="button"
                onClick={() => toggle(key)}
                className="w-full text-left bg-white border border-gray-200 hover:border-purple-300 transition-colors rounded-xl p-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{t.node}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-[2px] rounded-md ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                      <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fmtTime(t.started_at)}
                      </span>
                    </div>
                    {t.payload_summary && Object.keys(t.payload_summary).length > 0 && (
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {summariseInline(t.payload_summary)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <EvalScoreBar score={t.eval_score} />
                    <span className="text-xs text-gray-500 font-mono w-12 text-right">
                      {fmtDuration(t.duration_ms)}
                    </span>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                      : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <PayloadSummary data={t.payload_summary} />
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Tiny inline summary for the collapsed row. Picks the first few keys
 *  most useful at a glance — count/error/reason/created. */
function summariseInline(data: Record<string, any>): string {
  const keys = ["count", "ingested", "created", "ranked", "sent", "fired", "reason", "error", "skip_reason"];
  const bits: string[] = [];
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null) {
      bits.push(`${k}: ${typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k]}`);
    }
    if (bits.length >= 3) break;
  }
  return bits.join(" · ");
}
