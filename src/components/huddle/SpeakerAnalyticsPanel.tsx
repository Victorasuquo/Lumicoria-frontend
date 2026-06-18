/**
 * SpeakerAnalyticsPanel — surface for the analytics computed in
 * services/huddle_analytics.py.
 *
 * Used in two places:
 *   - Live (inside the room sidebar) — shows interim analytics
 *   - Post-call (in the meeting library detail page)
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mic2, AlertTriangle, Smile, Clock, BarChart3, Loader2 } from "lucide-react";
import { huddleApi } from "@/services/huddleApi";

interface SpeakerAnalyticsPanelProps {
  huddleId: string;
  /** Refetch interval in ms (0 = single fetch). */
  refreshMs?: number;
}

interface SpeakerAnalytics {
  talk_time_by_speaker: Record<string, number>;
  turn_count_by_speaker: Record<string, number>;
  interruption_count: number;
  sentiment_trend: Array<{ ts: string; score: number; samples: number }>;
  longest_silence_sec: number;
  total_words: number;
  speakers_count: number;
}

function fmtSeconds(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

function avgScore(buckets: Array<{ score: number }>): number {
  if (!buckets.length) return 0;
  return buckets.reduce((a, b) => a + b.score, 0) / buckets.length;
}

export const SpeakerAnalyticsPanel: React.FC<SpeakerAnalyticsPanelProps> = ({ huddleId, refreshMs = 0 }) => {
  const [data, setData] = useState<SpeakerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = async () => {
      try {
        const r = await huddleApi.getAnalytics(huddleId, true);
        if (!cancelled) {
          setData(r.analytics as SpeakerAnalytics);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.detail || "Couldn't load analytics");
          setLoading(false);
        }
      }
    };
    fetchOnce();
    if (refreshMs > 0) {
      const id = setInterval(fetchOnce, refreshMs);
      return () => { cancelled = true; clearInterval(id); };
    }
    return () => { cancelled = true; };
  }, [huddleId, refreshMs]);

  const totalTalk = useMemo(() => {
    if (!data) return 0;
    return Object.values(data.talk_time_by_speaker).reduce((a, b) => a + b, 0);
  }, [data]);

  const sortedSpeakers = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.talk_time_by_speaker)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [data]);

  const mood = useMemo(() => {
    if (!data) return { label: "Neutral", color: "text-gray-500" };
    const avg = avgScore(data.sentiment_trend);
    if (avg > 0.2) return { label: "Positive", color: "text-emerald-600" };
    if (avg < -0.2) return { label: "Tense", color: "text-red-600" };
    return { label: "Balanced", color: "text-gray-600" };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
        <Loader2 size={14} className="animate-spin mr-2" /> Computing analytics…
      </div>
    );
  }
  if (error || !data) {
    return <p className="text-xs text-red-500 py-6 text-center">{error || "No analytics yet."}</p>;
  }
  if (data.speakers_count === 0) {
    return <p className="text-xs text-gray-400 py-6 text-center">No transcript chunks yet — analytics will appear once people start talking.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top-line KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <KpiTile icon={Mic2}     label="Speakers"     value={String(data.speakers_count)} />
        <KpiTile icon={Clock}    label="Talk time"    value={fmtSeconds(totalTalk)} />
        <KpiTile icon={AlertTriangle} label="Interruptions" value={String(data.interruption_count)} tone={data.interruption_count > 5 ? "warn" : undefined} />
        <KpiTile icon={Smile}    label="Mood"         value={mood.label} valueClass={mood.color} />
      </div>

      {/* Talk-time bars */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Talk time by speaker</p>
        <div className="flex flex-col gap-1.5">
          {sortedSpeakers.map(([speaker, sec], i) => {
            const pct = totalTalk > 0 ? (sec / totalTalk) * 100 : 0;
            return (
              <motion.div
                key={speaker}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2"
              >
                <span className="text-[11px] text-gray-600 w-24 truncate">{speaker}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                  />
                </div>
                <span className="text-[10px] text-gray-400 w-10 text-right">{fmtSeconds(sec)}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sentiment sparkline */}
      {data.sentiment_trend.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Sentiment over time</p>
          <Sparkline points={data.sentiment_trend.map((b) => b.score)} />
        </div>
      )}

      <p className="text-[10px] text-gray-400">
        <BarChart3 size={10} className="inline mr-1" />
        {data.total_words} words · longest silence {fmtSeconds(data.longest_silence_sec)}
      </p>
    </div>
  );
};

const KpiTile: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "warn";
  valueClass?: string;
}> = ({ icon: Icon, label, value, tone, valueClass }) => (
  <div className={`rounded-xl border p-3 ${tone === "warn" ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white"}`}>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={11} className={tone === "warn" ? "text-amber-600" : "text-gray-400"} />
      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</span>
    </div>
    <p className={`text-base font-bold text-gray-800 ${valueClass || ""}`}>{value}</p>
  </div>
);

const Sparkline: React.FC<{ points: number[] }> = ({ points }) => {
  if (!points.length) return null;
  const w = 100;
  const h = 24;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, -1);
  const range = Math.max(max - min, 0.0001);
  const stride = w / Math.max(points.length - 1, 1);
  const path = points
    .map((p, i) => {
      const x = i * stride;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8">
      <path d={path} fill="none" stroke="#a855f7" strokeWidth="1.4" />
      <line x1="0" x2={w} y1={h / 2} y2={h / 2} stroke="#e5e7eb" strokeDasharray="2,2" strokeWidth="0.4" />
    </svg>
  );
};

export default SpeakerAnalyticsPanel;
