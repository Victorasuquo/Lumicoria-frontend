/**
 * BrainRunDetail — drill into one brain run + its node timeline.
 *
 * Shows the run summary (mode, status, counts, when, duration, skip
 * reason / error if any) and a TraceTimeline of the 16 nodes with
 * per-node duration, eval score, and expandable payload_summary.
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Brain, ArrowLeft, Loader2, Mail, Paperclip, ListChecks, Bot, Send,
  Sunrise, Moon, Check, AlertTriangle, XCircle, MinusCircle,
  Clock, RefreshCw, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  brainApi,
  BrainRunDetail,
  getErrorMessage,
} from "@/services/api";
import TraceTimeline from "@/components/brain/TraceTimeline";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ok:       { label: "Healthy",  color: "text-emerald-700", bg: "bg-emerald-50", Icon: Check },
  degraded: { label: "Degraded", color: "text-amber-700",   bg: "bg-amber-50",   Icon: AlertTriangle },
  failed:   { label: "Failed",   color: "text-red-700",     bg: "bg-red-50",     Icon: XCircle },
  skipped:  { label: "Skipped",  color: "text-gray-600",    bg: "bg-gray-100",   Icon: MinusCircle },
};

function fmtDuration(ms?: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function fmtAbsolute(ts?: string | null): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function BrainRunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [run, setRun] = useState<BrainRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (runId) load();
  }, [runId]);

  const load = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const data = await brainApi.getRun(runId);
      setRun(data);
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not load run detail") });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!runId) return;
    setRefreshing(true);
    try {
      const data = await brainApi.getRun(runId);
      setRun(data);
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not refresh") });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center max-w-sm">
          <div className="text-sm text-gray-600">Run not found.</div>
          <Link
            to="/brain/runs"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to runs
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLES[run.status] || STATUS_STYLES.ok;
  const ModeIcon = run.mode === "evening" ? Moon : Sunrise;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 md:px-6">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate("/brain/runs")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All runs
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="ml-2 hidden md:inline">Refresh</span>
            </Button>
            <Link to="/brain/preferences">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
                <span className="ml-2 hidden md:inline">Preferences</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${run.mode === "evening" ? "bg-indigo-50" : "bg-purple-50"} flex items-center justify-center`}>
              <ModeIcon className={`w-6 h-6 ${run.mode === "evening" ? "text-indigo-600" : "text-purple-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {run.mode} run
                </h1>
                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-[2px] rounded-md ${status.bg} ${status.color}`}>
                  <status.Icon className="w-3 h-3" />
                  {status.label}
                </span>
                {run.digest_sent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-[2px] rounded-md bg-purple-50 text-purple-700">
                    <Send className="w-3 h-3" />
                    Digest sent
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {fmtAbsolute(run.started_at)}
                {run.duration_ms != null && (
                  <> · {fmtDuration(run.duration_ms)}</>
                )}
              </div>
              {(run.skip_reason || run.error) && (
                <div className="mt-3 text-sm">
                  {run.skip_reason && (
                    <div className="text-gray-600">
                      <span className="font-medium">Skip reason:</span>{" "}
                      <code className="text-xs bg-gray-50 px-1 py-0.5 rounded">{run.skip_reason}</code>
                    </div>
                  )}
                  {run.error && (
                    <div className="text-red-600 mt-1">
                      <span className="font-medium">Error:</span> {run.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Counters */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Counter icon={Mail} label="Emails" value={run.emails_processed} />
            <Counter icon={Paperclip} label="Attachments" value={run.attachments_processed} />
            <Counter icon={ListChecks} label="Tasks created" value={run.tasks_created} />
            <Counter icon={Bot} label="Proposals" value={run.proposals_drafted} />
          </div>
        </div>

        {/* Trace timeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Node timeline
              <span className="text-xs text-gray-500 font-normal">
                ({run.traces.length} nodes)
              </span>
            </h2>
          </div>
          <TraceTimeline traces={run.traces} />
        </div>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <Link
            to="/brain/runs"
            className="text-sm text-purple-700 hover:text-purple-900 font-medium"
          >
            ← Back to all runs
          </Link>
        </div>

      </div>
    </div>
  );
}

function Counter({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold text-gray-900 leading-tight">{value}</div>
      </div>
    </div>
  );
}
