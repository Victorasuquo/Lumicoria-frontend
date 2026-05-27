/**
 * WeeklyChart — Mon→Sun bar chart for a single wellbeing metric.
 * Driven by `state.weekSeries` from the coach-state endpoint
 * (or any 7-value series passed in directly).  Apple-style soft
 * gradients, animated heights, today highlighted.
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface WeeklyChartProps {
  series: Array<number | null>;
  label?: string;
  scale?: { min: number; max: number };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  series,
  label = "Weekly trend",
  scale,
}) => {
  // jsDay: 0=Sun..6=Sat → bar index 0=Mon..6=Sun → map: (jsDay+6) % 7
  const todayIdx = useMemo(() => (new Date().getDay() + 6) % 7, []);

  const { min, max } = useMemo(() => {
    if (scale) return scale;
    const valid = series.filter((v): v is number => typeof v === "number");
    if (valid.length === 0) return { min: 0, max: 10 };
    return {
      min: Math.min(0, ...valid),
      max: Math.max(10, ...valid),
    };
  }, [series, scale]);

  return (
    <div>
      {label && (
        <p className="text-[10px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-3">
          {label}
        </p>
      )}
      <div className="flex items-end justify-between gap-2 h-32">
        {series.map((value, i) => {
          const hasValue = typeof value === "number";
          const normalized = hasValue ? (value! - min) / Math.max(0.0001, max - min) : 0;
          const heightPct = Math.max(hasValue ? 8 : 4, normalized * 100);
          const isToday = i === todayIdx;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div className="w-full flex-1 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                  className={`w-full rounded-t-xl ${
                    isToday
                      ? "bg-gradient-to-t from-purple-500 to-pink-400"
                      : hasValue
                      ? "bg-gradient-to-t from-purple-200 to-pink-200"
                      : "bg-gray-100"
                  }`}
                  title={hasValue ? value!.toFixed(1) : "no data"}
                />
              </div>
              <span
                className={`text-[10px] ${
                  isToday ? "text-purple-700 font-semibold" : "text-gray-500"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
