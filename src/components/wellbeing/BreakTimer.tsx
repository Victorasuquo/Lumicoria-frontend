/**
 * BreakTimer — live countdown to the next recommended break.
 *
 * Driven by the WellbeingContext: the seconds value ticks down
 * locally every second and is reseeded by the server every
 * `/coach-state` refresh (~90s).  Tap "Take it now" to mark a
 * break or "Snooze 15" to push the reminder back.
 *
 * Visual: Apple-style ring with a soft pastel gradient.
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useWellbeing } from "@/contexts/WellbeingContext";
import { wellbeingApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Pause } from "lucide-react";

interface BreakTimerProps {
  compact?: boolean;
}

const formatMMSS = (secs: number) => {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
};

export const BreakTimer: React.FC<BreakTimerProps> = ({ compact = false }) => {
  const { state, secondsUntilBreak, snoozeBreak, refresh } = useWellbeing();
  const { toast } = useToast();
  const intervalMinutes = state?.breakTimer.intervalMinutes ?? 60;
  const intervalSeconds = Math.max(60, intervalMinutes * 60);
  const progress = Math.min(1, Math.max(0, 1 - secondsUntilBreak / intervalSeconds));

  const ringSize = compact ? 88 : 128;
  const stroke = compact ? 7 : 10;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const overdue = secondsUntilBreak <= 0;

  const status = useMemo(() => {
    if (overdue) return { label: "Break overdue", tone: "text-rose-600" };
    if (secondsUntilBreak < 5 * 60) return { label: "Almost time", tone: "text-amber-600" };
    return { label: "Focused", tone: "text-emerald-600" };
  }, [overdue, secondsUntilBreak]);

  const takeBreak = async () => {
    try {
      await wellbeingApi.recordActivity({
        activity_type: "break",
        duration_minutes: state?.breakTimer.durationMinutes ?? 5,
        metadata: { source: "break_timer" },
      });
      toast({
        title: "Break logged",
        description: "Nice. The countdown resets.",
      });
      refresh();
    } catch (e: any) {
      toast({
        title: "Could not log break",
        description: e?.response?.data?.detail || e?.message,
        variant: "destructive",
      });
    }
  };

  const snooze = async () => {
    await snoozeBreak(15);
    toast({ title: "Snoozed 15 min" });
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: ringSize, height: ringSize }}
        aria-label={`Time until next break ${formatMMSS(secondsUntilBreak)}`}
      >
        <svg width={ringSize} height={ringSize} className="-rotate-90">
          <defs>
            <linearGradient id="break-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="url(#break-ring)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-semibold tabular-nums ${compact ? "text-lg" : "text-2xl"} text-gray-900`}>
            {overdue ? "Now" : formatMMSS(secondsUntilBreak)}
          </span>
          <span className={`text-[10px] uppercase tracking-[1.5px] font-semibold ${status.tone}`}>
            {status.label}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={takeBreak}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <Coffee size={12} />
            Take it now
          </button>
          <button
            onClick={snooze}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors"
          >
            <Pause size={12} />
            Snooze 15
          </button>
        </div>
      )}
    </div>
  );
};
