/**
 * Lumicoria workspace chart library.
 *
 * All charts are Recharts-backed and tokenised against the Lumicoria
 * brand palette (Lumi Purple #6C4AB0, Sky #0EA5E9, Outcome Gold #F59E0B).
 * Each chart is self-contained, takes plain data props, and renders a
 * subtle GlassCard-style frame so they can be dropped into any
 * dashboard surface without re-styling.
 *
 * Exports:
 *   - BurnupChart        — sprint / project burnup
 *   - CostBreakdownChart — donut split of agent token spend
 *   - AgentLeaderboardSparkline — compact daily-runs sparkline per agent
 *   - ActivityHeatmap    — 7×24 weekday × hour activity grid
 *   - TrendLineChart     — generic multi-series line chart (drop-in helper)
 */

import React, { useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { tokens, BRAND_GRADIENT } from "@/components/workspace/tokens";

/* ───────── shared utilities ───────── */

const COLORS = {
  purple: "#6C4AB0",
  purpleSoft: "#8466C2",
  sky: "#0EA5E9",
  skySoft: "#7DD3FC",
  gold: "#F59E0B",
  emerald: "#10B981",
  rose: "#F43F5E",
  slate: "#94A3B8",
  ink: "#0F172A",
} as const;

const palette = [COLORS.purple, COLORS.sky, COLORS.gold, COLORS.emerald, COLORS.rose, COLORS.purpleSoft, COLORS.skySoft];

const Frame: React.FC<{ title?: string; subtitle?: string; right?: React.ReactNode; height?: number; children: React.ReactNode }> = ({ title, subtitle, right, height = 220, children }) => (
  <div style={{
    background: "white", borderRadius: 16,
    border: `1px solid ${tokens.SLATE_200}`,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    padding: 18,
  }}>
    {(title || subtitle || right) && (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          {title && <div style={{ fontSize: 13, fontWeight: 700, color: tokens.INK, letterSpacing: -0.1 }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    )}
    <div style={{ width: "100%", height }}>{children}</div>
  </div>
);

const tooltipStyle: React.CSSProperties = {
  border: `1px solid ${tokens.SLATE_200}`,
  borderRadius: 10,
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  fontSize: 12,
  padding: 10,
};

/* ───────── BurnupChart ───────── */

export interface BurnupPoint {
  date: string;        // ISO or "MMM d"
  completed: number;   // cumulative completed work
  scope: number;       // cumulative scope
}

export const BurnupChart: React.FC<{ data: BurnupPoint[]; title?: string; subtitle?: string; height?: number }> = ({ data, title = "Burnup", subtitle, height = 240 }) => (
  <Frame title={title} subtitle={subtitle} height={height}>
    <ResponsiveContainer>
      <AreaChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lumiBurnupCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.45} />
            <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="lumiBurnupScope" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.sky} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLORS.sky} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={tokens.SLATE_100} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: tokens.SLATE_500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: tokens.SLATE_500 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="scope" stroke={COLORS.sky} strokeWidth={2} fill="url(#lumiBurnupScope)" name="Scope" />
        <Area type="monotone" dataKey="completed" stroke={COLORS.purple} strokeWidth={2.5} fill="url(#lumiBurnupCompleted)" name="Completed" />
      </AreaChart>
    </ResponsiveContainer>
  </Frame>
);

/* ───────── CostBreakdownChart ───────── */

export interface CostSlice { name: string; value: number }

export const CostBreakdownChart: React.FC<{ data: CostSlice[]; title?: string; subtitle?: string; height?: number; currency?: string }> = ({ data, title = "Cost breakdown", subtitle, height = 240, currency = "USD" }) => {
  const total = useMemo(() => data.reduce((acc, d) => acc + (d.value || 0), 0), [data]);
  return (
    <Frame title={title} subtitle={subtitle || `${currency} ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} total`} height={height}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={3}>
            {data.map((_, idx) => <Cell key={idx} fill={palette[idx % palette.length]} stroke="white" strokeWidth={2} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [`${currency} ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, name]} />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: tokens.SLATE_600 }} />
        </PieChart>
      </ResponsiveContainer>
    </Frame>
  );
};

/* ───────── AgentLeaderboardSparkline ───────── */

export interface SparklinePoint { day: string; runs: number }

export const AgentLeaderboardSparkline: React.FC<{ data: SparklinePoint[]; height?: number; color?: string }> = ({ data, height = 36, color = COLORS.purple }) => (
  <div style={{ width: "100%", height }}>
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line type="monotone" dataKey="runs" stroke={color} strokeWidth={2} dot={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={false} labelStyle={{ color: tokens.SLATE_600, fontSize: 11 }} formatter={(v: any) => [v, "runs"]} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

/* ───────── ActivityHeatmap (7 × 24) ───────── */

export interface ActivityCell { weekday: number; hour: number; count: number }

const HEAT_STEPS = [0.05, 0.15, 0.3, 0.55, 0.85];
const heatColor = (intensity: number, base = COLORS.purple): string => {
  // intensity ∈ [0,1] → translucent purple gradient
  const a = Math.max(0, Math.min(1, intensity));
  // hex → rgba
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
};

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const ActivityHeatmap: React.FC<{ cells: ActivityCell[]; title?: string; subtitle?: string }> = ({ cells, title = "Activity by hour", subtitle }) => {
  const max = useMemo(() => cells.reduce((m, c) => Math.max(m, c.count), 0) || 1, [cells]);
  const map = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cells) m.set(`${c.weekday}:${c.hour}`, c.count);
    return m;
  }, [cells]);
  return (
    <Frame title={title} subtitle={subtitle} height={180}>
      <div style={{ display: "grid", gridTemplateRows: `repeat(7, 1fr)`, gap: 4, height: "100%" }}>
        {WEEK.map((label, wd) => (
          <div key={wd} style={{ display: "grid", gridTemplateColumns: `40px repeat(24, 1fr)`, gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: tokens.SLATE_500, fontWeight: 700 }}>{label}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const count = map.get(`${wd}:${h}`) || 0;
              const intensity = count > 0 ? HEAT_STEPS[Math.min(HEAT_STEPS.length - 1, Math.floor((count / max) * HEAT_STEPS.length))] : 0;
              return (
                <div
                  key={h}
                  title={`${label} ${String(h).padStart(2, "0")}:00 — ${count}`}
                  style={{
                    borderRadius: 4, height: 14,
                    background: count > 0 ? heatColor(intensity) : `${tokens.SLATE_100}`,
                    border: `1px solid ${tokens.SLATE_200}`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Frame>
  );
};

/* ───────── TrendLineChart (helper) ───────── */

export interface TrendSeries { key: string; label: string; color?: string }

export const TrendLineChart: React.FC<{
  data: Array<Record<string, any>>;
  xKey: string;
  series: TrendSeries[];
  title?: string;
  subtitle?: string;
  height?: number;
}> = ({ data, xKey, series, title, subtitle, height = 240 }) => (
  <Frame title={title} subtitle={subtitle} height={height}>
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={tokens.SLATE_100} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: tokens.SLATE_500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: tokens.SLATE_500 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, color: tokens.SLATE_600 }} />
        {series.map((s, idx) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color || palette[idx % palette.length]} strokeWidth={2.2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </Frame>
);

/* ───────── default export */

export const ChartTokens = COLORS;
export default {
  BurnupChart,
  CostBreakdownChart,
  AgentLeaderboardSparkline,
  ActivityHeatmap,
  TrendLineChart,
  BRAND_GRADIENT,
};
