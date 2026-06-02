import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    ChevronDown,
    ChevronUp,
    Loader2,
    Check,
    AlertTriangle,
    CircleDot,
    ArrowRight,
} from "lucide-react";

import { AgentFlow, AgentFlowStep } from "@/pages/Chat";

/**
 * Phase 7 — collapsible Agent Flow panel.
 *
 * Renders the live multi-agent step trace under an assistant message.
 * Shows each step's agent badge, purpose, status (pending → running →
 * completed/error), elapsed duration, and a short output preview once
 * the step finishes.  Auto-collapses when every step is `completed`
 * unless the user expanded it manually.
 */

interface Props {
    flow: AgentFlow;
    /** Optional registry lookup so each step inherits the agent's colour. */
    agentMeta?: Record<string, { label: string; color: string; icon: React.ReactNode }>;
}

function fmtMs(ms?: number): string {
    if (ms == null) return "";
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(1)} s`;
}

function StepIcon({ status }: { status: AgentFlowStep["status"] }) {
    if (status === "running") return <Loader2 size={12} className="animate-spin text-purple-600" />;
    if (status === "completed") return <Check size={12} className="text-emerald-600" />;
    if (status === "error") return <AlertTriangle size={12} className="text-rose-600" />;
    if (status === "skipped") return <CircleDot size={12} className="text-gray-300" />;
    return <CircleDot size={12} className="text-gray-300" />;
}

function statusLine(step: AgentFlowStep): string {
    if (step.status === "running") {
        return step.is_composer ? "composing answer…" : `calling ${step.agent_label || step.agent} agent…`;
    }
    if (step.status === "completed") {
        return step.is_composer ? "composed answer" : `done · ${fmtMs(step.duration_ms)}`;
    }
    if (step.status === "error") return step.error ? `error: ${step.error}` : "agent error";
    if (step.status === "skipped") return "skipped";
    return "queued";
}

export function AgentFlowPanel({ flow, agentMeta }: Props) {
    const allDone =
        flow.steps.length > 0 &&
        flow.steps.every((s) => s.status === "completed" || s.status === "error" || s.status === "skipped");

    // Open while running; auto-collapsed once all done unless the user toggles.
    const [userToggled, setUserToggled] = useState<null | boolean>(null);
    const open = userToggled ?? !allDone;

    if (!flow.steps || flow.steps.length === 0) return null;

    const completedCount = flow.steps.filter((s) => s.status === "completed").length;
    const errorCount = flow.steps.filter((s) => s.status === "error").length;
    const runningStep = flow.steps.find((s) => s.status === "running");

    const headerLabel = runningStep
        ? `Running · ${runningStep.agent_label || runningStep.agent}`
        : errorCount > 0
        ? `${completedCount} of ${flow.steps.length} steps · ${errorCount} error`
        : allDone
        ? `${completedCount} step${completedCount === 1 ? "" : "s"} · done`
        : `${flow.steps.length} step${flow.steps.length === 1 ? "" : "s"}`;

    return (
        <div className="mt-1.5 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/40 via-white to-white">
            <button
                type="button"
                onClick={() => setUserToggled(!open)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <Sparkles size={12} className="text-purple-500 shrink-0" />
                    <span className="text-[11px] font-medium text-gray-700">Agent flow</span>
                    <span className="text-[11px] text-gray-400 truncate">· {headerLabel}</span>
                </div>
                {open ? (
                    <ChevronUp size={12} className="text-gray-400 shrink-0" />
                ) : (
                    <ChevronDown size={12} className="text-gray-400 shrink-0" />
                )}
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-purple-100/70 px-3 py-2 space-y-1.5">
                            {flow.reason && (
                                <p className="text-[10px] text-purple-700/70 italic mb-1">
                                    Why these steps: {flow.reason}
                                </p>
                            )}
                            {flow.steps.map((step, i) => {
                                const meta = agentMeta?.[step.agent];
                                const accent = meta?.color || "#6C4AB0";
                                return (
                                    <div key={step.step_id || i} className="flex items-start gap-2">
                                        <div className="mt-1 flex h-4 w-4 items-center justify-center shrink-0">
                                            <StepIcon status={step.status} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 text-[11.5px]">
                                                <span
                                                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                                                    style={{
                                                        background: `${accent}1a`,
                                                        color: accent,
                                                    }}
                                                >
                                                    {meta?.icon}
                                                    {meta?.label || step.agent_label || step.agent}
                                                </span>
                                                <span className="text-gray-700 truncate">{step.purpose}</span>
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-gray-500">
                                                <span>{statusLine(step)}</span>
                                                {step.sources_count != null && step.sources_count > 0 && (
                                                    <span className="text-purple-600">· {step.sources_count} source{step.sources_count === 1 ? '' : 's'}</span>
                                                )}
                                            </div>
                                            {step.output_preview && step.status === "completed" && !step.is_composer && (
                                                <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-2 leading-snug">
                                                    {step.output_preview}
                                                </p>
                                            )}
                                        </div>
                                        {i < flow.steps.length - 1 && (
                                            <ArrowRight size={10} className="mt-1.5 text-gray-300 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AgentFlowPanel;
