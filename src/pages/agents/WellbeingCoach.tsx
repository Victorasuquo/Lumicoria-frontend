/**
 * WellbeingCoach — the live Coach surface in the Agent Universe.
 *
 * Replaces all mock data with the WellbeingContext + /coach-state.
 * Live break countdown, real timeline, live recommendations,
 * working quick-action buttons, conversational chat panel.
 */

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Coffee,
  Brain,
  Battery,
  Zap,
  Sun,
  Activity,
  Smile,
  MessageCircle,
  Sparkles,
  CheckSquare,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { useWellbeing } from "@/contexts/WellbeingContext";
import { BreakTimer } from "@/components/wellbeing/BreakTimer";
import { CoachChat } from "@/components/wellbeing/CoachChat";
import { WeeklyChart } from "@/components/wellbeing/WeeklyChart";
import { LogActivityDialog } from "@/components/wellbeing/LogActivityDialog";
import { MoodPromptModal } from "@/components/wellbeing/MoodPromptModal";

/* ── Static maps ─────────────────────────────────────────────── */

const TIMELINE_COLORS: Record<string, string> = {
  work: "bg-blue-100 text-blue-600",
  break: "bg-emerald-100 text-emerald-600",
  focus: "bg-violet-100 text-violet-600",
  reminder: "bg-amber-100 text-amber-600",
  mood: "bg-rose-100 text-rose-600",
  energy: "bg-amber-100 text-amber-600",
  stress: "bg-purple-100 text-purple-600",
  activity: "bg-teal-100 text-teal-600",
  default: "bg-gray-100 text-gray-600",
};

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  work: Sun,
  break: Coffee,
  focus: Brain,
  reminder: Activity,
  mood: Smile,
  energy: Zap,
  stress: Heart,
  activity: Activity,
  default: Sparkles,
};

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-rose-50/50 border-rose-100",
  high: "bg-rose-50/50 border-rose-100",
  medium: "bg-amber-50/50 border-amber-100",
  low: "bg-emerald-50/50 border-emerald-100",
};
const PRIORITY_TEXT: Record<string, string> = {
  urgent: "border-rose-200 text-rose-600",
  high: "border-rose-200 text-rose-600",
  medium: "border-amber-200 text-amber-600",
  low: "border-emerald-200 text-emerald-600",
};

/* ── Helpers ─────────────────────────────────────────────────── */

const safeNumber = (v: unknown, fallback = 0): number =>
  typeof v === "number" && !Number.isNaN(v) ? v : fallback;

const formatTimeOfDay = (iso?: string): string => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const titleCase = (s: string) =>
  s.replace(/[_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ── Component ───────────────────────────────────────────────── */

const WellbeingCoach: React.FC = () => {
  const { state, refresh } = useWellbeing();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);

  /* ── Metric tiles (derived from state.metrics + productivity) ── */
  const metricsSummary = (state?.metrics?.metrics_summary || {}) as Record<
    string,
    { avg: number; count: number; trend?: number[] }
  >;
  const productivity = state?.productivity || {};

  const tiles = useMemo(() => {
    const mood = metricsSummary.mood?.avg;
    const energy = metricsSummary.energy?.avg;
    const stress = metricsSummary.stress?.avg;
    const focusMinutes = safeNumber((productivity as any).focus_minutes_today);
    const adherence = safeNumber((productivity as any).completion_ratio) * 100;

    const trendOf = (key: string): "up" | "down" | "flat" => {
      const t = metricsSummary[key]?.trend || [];
      if (t.length < 2) return "flat";
      return t[t.length - 1] > t[t.length - 2]
        ? "up"
        : t[t.length - 1] < t[t.length - 2]
        ? "down"
        : "flat";
    };

    return [
      {
        label: "Mood",
        value: mood !== undefined ? `${mood.toFixed(1)}/10` : "—",
        icon: Smile,
        color: "text-rose-500",
        trend: trendOf("mood"),
      },
      {
        label: "Energy",
        value: energy !== undefined ? `${energy.toFixed(1)}/10` : "—",
        icon: Battery,
        color: "text-violet-500",
        trend: trendOf("energy"),
      },
      {
        label: "Stress",
        value: stress !== undefined ? `${stress.toFixed(1)}/10` : "—",
        icon: Brain,
        color: "text-purple-500",
        // For stress, "up" arrow is bad — invert visual intent.
        trend: trendOf("stress") === "up" ? "down" : trendOf("stress") === "down" ? "up" : "flat",
      },
      {
        label: "Focus today",
        value: focusMinutes ? `${Math.round(focusMinutes)}m` : "—",
        icon: Zap,
        color: "text-amber-500",
        trend: "flat" as const,
        sub: adherence ? `${Math.round(adherence)}% tasks done` : undefined,
      },
    ];
  }, [metricsSummary, productivity]);

  /* ── Timeline (from state.todayTimeline) ── */
  const timeline = state?.todayTimeline || [];

  /* ── Recommendations ── */
  const recommendations = state?.recommendations || [];

  /* ── Weekly series (mood by default) ── */
  const weekSeries = state?.weekSeries || [null, null, null, null, null, null, null];


  return (
    <AgentPageLayout
      agentName="Well-being Coach"
      tagline="Your personal wellness guardian"
      icon={Heart}
      gradient="from-rose-500 to-pink-600"
    >
      {/* Metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {tiles.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={m.color} />
                  <span className="text-xs text-gray-400">{m.label}</span>
                </div>
                {m.trend !== "flat" && (
                  <div
                    className={`flex items-center gap-0.5 text-[10px] ${
                      m.trend === "up" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {m.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  </div>
                )}
              </div>
              <p className="text-xl font-bold text-gray-900">{m.value}</p>
              {(m as any).sub && (
                <p className="text-[10px] text-gray-400 mt-0.5">{(m as any).sub}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Break ring + countdown */}
          <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 border border-rose-100 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-rose-600 font-semibold mb-1">
                  Live break timer
                </p>
                <h3 className="text-base font-semibold text-gray-900">Time for a break?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Driven by your work pattern. Snooze if you're in flow.
                </p>
              </div>
              <BreakTimer />
            </div>
          </div>

          {/* Chat or timeline (toggle) */}
          {chatOpen ? (
            <div className="h-[420px]">
              <CoachChat />
              <button
                onClick={() => setChatOpen(false)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                ← Back to timeline
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Today's timeline</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Activity across the platform.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={refresh}
                    className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
                    aria-label="Refresh"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <MessageCircle size={11} />
                    Talk to Coach
                  </button>
                </div>
              </div>
              <div className="p-4">
                {timeline.length === 0 ? (
                  <div className="text-center py-10">
                    <Sparkles size={20} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      Nothing yet today. Your activity will land here.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                    <div className="space-y-3">
                      {timeline.slice(0, 12).map((item: any, i: number) => {
                        const kind = String(item.type || "default").toLowerCase();
                        const Icon = TIMELINE_ICONS[kind] || TIMELINE_ICONS.default;
                        const color = TIMELINE_COLORS[kind] || TIMELINE_COLORS.default;
                        const label =
                          item.title ||
                          item.event ||
                          item.activity_type ||
                          titleCase(String(item.type || "Activity"));
                        const at = formatTimeOfDay(item.timestamp || item.created_at);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 relative"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${color}`}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 pt-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">
                                {label}
                              </p>
                              {at && <p className="text-[10px] text-gray-400">{at}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendations */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Coach recommendations</h3>
              <Sparkles size={14} className="text-rose-400" />
            </div>
            {recommendations.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No active recommendations. Keep going — you're doing well.
              </p>
            ) : (
              <div className="space-y-2">
                {recommendations.slice(0, 4).map((r: any, i: number) => {
                  const prio = String(r.priority || "medium").toLowerCase();
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border ${PRIORITY_TONE[prio] || PRIORITY_TONE.medium}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            PRIORITY_TEXT[prio] || PRIORITY_TEXT.medium
                          }`}
                        >
                          {prio}
                        </Badge>
                        {r.category && (
                          <span className="text-[10px] text-gray-400 capitalize">
                            {String(r.category).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      {r.title && (
                        <p className="text-xs font-medium text-gray-900 mb-0.5">
                          {String(r.title)}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {String(r.description || r.content || "")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly chart */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Weekly wellness</h3>
            <WeeklyChart series={weekSeries} label="Mood (Mon–Sun)" />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMoodDialogOpen(true)}
              className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-2"
            >
              <Smile size={14} className="text-amber-500" />
              <span className="text-xs font-medium text-gray-700">Log mood</span>
            </button>
            <button
              onClick={() => setActivityDialogOpen(true)}
              className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-2"
            >
              <Activity size={14} className="text-blue-500" />
              <span className="text-xs font-medium text-gray-700">Log activity</span>
            </button>
            <button
              onClick={() => navigate("/wellbeing")}
              className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-2"
            >
              <CheckSquare size={14} className="text-violet-500" />
              <span className="text-xs font-medium text-gray-700">Open ledger</span>
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-2"
            >
              <PlayCircle size={14} className="text-rose-500" />
              <span className="text-xs font-medium text-gray-700">Chat now</span>
            </button>
          </div>
        </div>
      </div>

      <LogActivityDialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        onLogged={refresh}
      />
      <MoodPromptModal
        open={moodDialogOpen}
        onClose={() => setMoodDialogOpen(false)}
        source="coach_quick"
      />
    </AgentPageLayout>
  );
};

export default WellbeingCoach;
