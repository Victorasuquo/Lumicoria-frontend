/**
 * Dashboard — Lumicoria theme, iOS-liquid finish.
 *
 * Built against the official Lumicoria design system:
 *   • Primary       Lumi Purple   #6C4AB0
 *   • Deep          Deep Purple   #3B2D6A
 *   • Soft fill     Light Purple  #9B87F5
 *   • Accent        Sky Blue      #0EA5E9
 *   • Cool          Teal          #38BDF8
 *   • Pop           Orange        #F97316
 *   • Display font  DM Sans / Space Grotesk
 *   • Body font     Inter
 *   • Surfaces      rounded-2xl / rounded-3xl, glass-card on top of an
 *                   aurora wash (violet → sky → cream).
 *
 * The page reads from one /analytics/dashboard payload — the backend is
 * untouched.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from "recharts";
import {
    ArrowUpRight,
    ArrowRight,
    CheckCircle2,
    PlayCircle,
    PauseCircle,
    AlertTriangle,
    FileText,
    Users,
    Activity,
    Bot,
    Inbox,
    LayoutGrid,
    RefreshCcw,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    analyticsApi,
    AnalyticsRange,
    DashboardPayload,
    AgentLeaderboardRow,
    ActivityRow,
} from "@/services/api";

// ── Lumicoria tokens (from colors_and_type.css) ────────────────────────
const PURPLE = "#6C4AB0";
const PURPLE_DEEP = "#3B2D6A";
const PURPLE_LIGHT = "#9B87F5";
const PURPLE_50 = "#F4EEFE";
const SKY = "#0EA5E9";
const TEAL = "#38BDF8";
const ORANGE = "#F97316";
const INK = "#0F172A";
const INK_2 = "#475569";
const INK_3 = "#94A3B8";
const HAIR = "#E2E8F0";

const STATUS_COLOR: Record<string, string> = {
    completed: "#22C55E",
    in_progress: SKY,
    todo: "#94A3B8",
    blocked: "#F59E0B",
    cancelled: "#CBD5E1",
    deferred: INK_3,
};

const RANGE_OPTIONS: AnalyticsRange[] = ["7d", "30d", "90d", "1y"];
const RANGE_LABEL: Record<AnalyticsRange, string> = {
    "1d": "Today",
    "7d": "7 days",
    "30d": "30 days",
    "90d": "90 days",
    "1y": "12 months",
};

const FADE_UP = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
};

// ── Page ───────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [range, setRange] = useState<AnalyticsRange>("30d");
    const [payload, setPayload] = useState<DashboardPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (r: AnalyticsRange, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await analyticsApi.getDashboard(r);
            setPayload(data);
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || "Could not load dashboard");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load(range);
    }, [range, load]);

    useEffect(() => {
        const id = setInterval(() => load(range, true), 60_000);
        return () => clearInterval(id);
    }, [range, load]);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* ─── Aurora wash (the iOS-liquid background) ─── */}
            <Aurora />

            <div className="relative max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-10">
                <Header
                    user={user}
                    range={range}
                    onRangeChange={setRange}
                    onRefresh={() => load(range, true)}
                    refreshing={refreshing}
                />

                {loading && !payload ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} onRetry={() => load(range)} />
                ) : payload ? (
                    <div className="mt-8 space-y-6">
                        <Hero payload={payload} />
                        <KpiStrip payload={payload} />

                        <div className="grid grid-cols-12 gap-5">
                            <TasksPanel payload={payload} />
                            <AgentsPanel payload={payload} />
                        </div>

                        <div className="grid grid-cols-12 gap-5">
                            <ProposalsPanel payload={payload} />
                            <DocumentsPanel payload={payload} />
                        </div>

                        <ActivityFeed activity={payload.activity} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Dashboard;

// ── Background ─────────────────────────────────────────────────────────

function Aurora() {
    return (
        <>
            {/* Aurora wash */}
            <div
                className="fixed inset-0 -z-10 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(180deg, #F8F6FF 0%, #FFFFFF 28%, #F4F8FF 68%, #FFFFFF 100%)",
                }}
            />
            {/* Floating orbs — purple + sky */}
            <motion.div
                aria-hidden
                className="fixed -z-10 pointer-events-none rounded-full blur-3xl"
                style={{
                    width: 520,
                    height: 520,
                    top: -120,
                    right: -120,
                    background:
                        "radial-gradient(closest-side, rgba(155,135,245,0.55), rgba(155,135,245,0))",
                }}
                animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className="fixed -z-10 pointer-events-none rounded-full blur-3xl"
                style={{
                    width: 480,
                    height: 480,
                    bottom: -180,
                    left: -140,
                    background:
                        "radial-gradient(closest-side, rgba(56,189,248,0.45), rgba(56,189,248,0))",
                }}
                animate={{ y: [0, -24, 0], x: [0, 18, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className="fixed -z-10 pointer-events-none rounded-full blur-3xl"
                style={{
                    width: 360,
                    height: 360,
                    top: "32%",
                    left: "40%",
                    background:
                        "radial-gradient(closest-side, rgba(201,182,244,0.40), rgba(201,182,244,0))",
                }}
                animate={{ y: [0, 14, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Subtle noise grain (gives the liquid surfaces "tooth") */}
            <div
                className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03] mix-blend-multiply"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                }}
            />
        </>
    );
}

// ── Header ─────────────────────────────────────────────────────────────

function Header({
    user,
    range,
    onRangeChange,
    onRefresh,
    refreshing,
}: {
    user: any;
    range: AnalyticsRange;
    onRangeChange: (r: AnalyticsRange) => void;
    onRefresh: () => void;
    refreshing: boolean;
}) {
    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 5) return "Late one";
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        if (h < 22) return "Good evening";
        return "Hello";
    }, []);

    const firstName =
        (user?.full_name || user?.email || "")
            .replace(/@.*$/, "")
            .split(/\s+/)[0] || "there";

    return (
        <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
                <h1
                    className="font-hero font-bold text-[40px] leading-[1.04] tracking-[-0.018em]"
                    style={{ color: INK }}
                >
                    {greeting},{" "}
                    <span style={{ color: PURPLE }}>{firstName}.</span>
                </h1>
                <p
                    className="mt-2 text-[14.5px] max-w-xl leading-relaxed"
                    style={{ color: INK_2 }}
                >
                    Everything moving across your workspace right now — tasks,
                    agents, documents, and the work your proposals are waiting on.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div
                    className="inline-flex items-center rounded-full p-0.5 border"
                    style={{
                        background: "rgba(255,255,255,0.65)",
                        borderColor: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
                    }}
                >
                    {RANGE_OPTIONS.map((r) => (
                        <button
                            key={r}
                            onClick={() => onRangeChange(r)}
                            className={`px-3.5 py-1.5 text-[12px] font-medium rounded-full transition-all ${
                                range === r ? "text-white" : "text-slate-500 hover:text-slate-900"
                            }`}
                            style={
                                range === r
                                    ? {
                                          background:
                                              "linear-gradient(135deg, #6C4AB0 0%, #3B2D6A 100%)",
                                          boxShadow:
                                              "0 6px 16px -6px rgba(108, 74, 176, 0.55)",
                                      }
                                    : undefined
                            }
                        >
                            {RANGE_LABEL[r]}
                        </button>
                    ))}
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="h-9 text-[12px] rounded-full border border-white/60 bg-white/60 backdrop-blur-md hover:bg-white"
                    style={{
                        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
                    }}
                >
                    <RefreshCcw
                        size={12}
                        className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`}
                        style={{ color: PURPLE }}
                    />
                    Refresh
                </Button>
            </div>
        </div>
    );
}

// ── Hero (productivity index + headline stats) ─────────────────────────

function Hero({ payload }: { payload: DashboardPayload }) {
    const { productivity, tasks, agents, proposals } = payload;
    const bandLabel: Record<string, string> = {
        excellent: "Excellent",
        strong: "Strong",
        steady: "Steady",
        slipping: "Slipping",
        "needs-attention": "Needs attention",
    };
    const bandColor: Record<string, string> = {
        excellent: "#16A34A",
        strong: "#16A34A",
        steady: SKY,
        slipping: ORANGE,
        "needs-attention": "#DC2626",
    };

    return (
        <motion.section
            {...FADE_UP}
            className="relative overflow-hidden rounded-3xl border"
            style={{
                background:
                    "linear-gradient(135deg, rgba(108,74,176,0.10) 0%, rgba(14,165,233,0.06) 60%, rgba(252,237,178,0.10) 100%)",
                borderColor: "rgba(255,255,255,0.70)",
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
                boxShadow:
                    "0 24px 64px -16px rgba(108, 74, 176, 0.20), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
        >
            {/* Inner highlight to mimic refracted glass */}
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                }}
            />

            <div className="grid grid-cols-12 gap-0 divide-x divide-white/40">
                <div className="col-span-12 md:col-span-4 px-7 py-7 relative">
                    <p
                        className="text-[10.5px] uppercase tracking-[0.18em] font-medium"
                        style={{ color: INK_2 }}
                    >
                        Productivity index
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span
                            className="font-hero font-bold text-[72px] leading-[0.9] tabular-nums"
                            style={{
                                background:
                                    "linear-gradient(135deg, #6C4AB0 0%, #0EA5E9 100%)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            {productivity.score}
                        </span>
                        <span className="text-sm" style={{ color: INK_3 }}>
                            / 100
                        </span>
                    </div>
                    <div
                        className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                            color: bandColor[productivity.band],
                            background: `${bandColor[productivity.band]}1A`,
                            border: `1px solid ${bandColor[productivity.band]}33`,
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: bandColor[productivity.band] }}
                        />
                        {bandLabel[productivity.band]}
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3 text-[11px]">
                        <ComponentBar
                            label="Completion"
                            value={productivity.components.completion_rate_pct}
                        />
                        <ComponentBar
                            label="Agent success"
                            value={productivity.components.agent_success_rate_pct}
                        />
                        <ComponentBar
                            label="Throughput"
                            value={productivity.components.throughput_pct}
                        />
                    </div>
                </div>

                <HeroStat
                    label="Tasks completed"
                    value={tasks.completed}
                    sub={`${tasks.total.toLocaleString()} total · ${(tasks.completion_rate * 100).toFixed(0)}% rate`}
                />
                <HeroStat
                    label="Agent runs"
                    value={agents.total_runs}
                    sub={`${(agents.success_rate * 100).toFixed(0)}% success · ${agents.errors} errors`}
                />
                <HeroStat
                    label="Pending review"
                    value={proposals.pending_review}
                    sub={`${proposals.approved} approved · ${proposals.rejected} rejected`}
                    accent={proposals.pending_review > 0 ? PURPLE : undefined}
                />
            </div>
        </motion.section>
    );
}

function ComponentBar({ label, value }: { label: string; value: number }) {
    const pct = Math.min(100, Math.max(0, value));
    return (
        <div>
            <div className="flex items-center justify-between">
                <span style={{ color: INK_2 }}>{label}</span>
                <span className="tabular-nums font-semibold" style={{ color: INK }}>
                    {value.toFixed(0)}%
                </span>
            </div>
            <div
                className="mt-1 h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(15,23,42,0.06)" }}
            >
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        background:
                            "linear-gradient(90deg, #6C4AB0 0%, #0EA5E9 100%)",
                    }}
                />
            </div>
        </div>
    );
}

function HeroStat({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: number;
    sub: string;
    accent?: string;
}) {
    return (
        <div className="col-span-12 sm:col-span-4 md:[grid-column:span_2.667/span_2.667] px-7 py-7">
            <p
                className="text-[10.5px] uppercase tracking-[0.18em] font-medium"
                style={{ color: INK_2 }}
            >
                {label}
            </p>
            <div
                className="mt-2 font-hero font-bold text-[44px] leading-none tabular-nums"
                style={{ color: accent || INK }}
            >
                {value.toLocaleString()}
            </div>
            <p className="mt-2 text-[11.5px]" style={{ color: INK_2 }}>
                {sub}
            </p>
        </div>
    );
}

// ── KPI strip ──────────────────────────────────────────────────────────

function KpiStrip({ payload }: { payload: DashboardPayload }) {
    const { tasks, agents, documents, proposals } = payload;
    const cards = [
        {
            label: "Overdue",
            value: tasks.overdue,
            icon: <AlertTriangle size={13} />,
            tone: tasks.overdue > 0 ? "warn" : "muted",
            hint: `${tasks.in_progress} in progress`,
        },
        {
            label: "Active agents",
            value: agents.leaderboard.length,
            icon: <Bot size={13} />,
            tone: "primary",
            hint: `${agents.total_runs.toLocaleString()} runs in ${RANGE_LABEL[payload.time_range]}`,
        },
        {
            label: "Documents",
            value: documents.total,
            icon: <FileText size={13} />,
            tone: "accent",
            hint: `${documents.total_chunks.toLocaleString()} chunks indexed`,
        },
        {
            label: "Tasks extracted",
            value: documents.total_tasks_extracted,
            icon: <Inbox size={13} />,
            tone: "ink",
            hint: "From processed documents",
        },
        {
            label: "p95 agent latency",
            value: formatMs(highestP95(agents.leaderboard)),
            icon: <Activity size={13} />,
            tone: "ink",
            isString: true,
            hint: "Slowest agent worst-case",
        },
        {
            label: "Approvals",
            value: proposals.approved,
            icon: <CheckCircle2 size={13} />,
            tone: "positive",
            hint: `${proposals.rejected} rejected`,
        },
    ];
    return (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((c, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 240, damping: 24 }}
                >
                    <KpiCard {...c} />
                </motion.div>
            ))}
        </section>
    );
}

function KpiCard({
    label,
    value,
    icon,
    tone = "ink",
    hint,
    isString,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    tone?: "ink" | "warn" | "positive" | "muted" | "primary" | "accent";
    hint?: string;
    isString?: boolean;
}) {
    const color =
        tone === "warn" ? ORANGE :
        tone === "positive" ? "#16A34A" :
        tone === "muted" ? INK_3 :
        tone === "primary" ? PURPLE :
        tone === "accent" ? SKY :
        INK;
    const iconBg =
        tone === "warn" ? `${ORANGE}1A` :
        tone === "positive" ? "rgba(34,197,94,0.12)" :
        tone === "primary" ? `${PURPLE}14` :
        tone === "accent" ? `${SKY}14` :
        "rgba(15,23,42,0.06)";
    return (
        <div
            className="rounded-2xl px-4 py-3.5 transition-shadow hover:shadow-lg"
            style={{
                background: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(255,255,255,0.70)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                boxShadow: "0 6px 20px -8px rgba(15, 23, 42, 0.08)",
            }}
        >
            <div className="flex items-center gap-2">
                <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg"
                    style={{ background: iconBg, color }}
                >
                    {icon}
                </span>
                <span
                    className="text-[10.5px] uppercase tracking-[0.16em] font-semibold"
                    style={{ color: INK_2 }}
                >
                    {label}
                </span>
            </div>
            <div
                className="mt-2 font-hero font-bold text-[26px] leading-none tabular-nums"
                style={{ color }}
            >
                {isString
                    ? value
                    : typeof value === "number"
                    ? value.toLocaleString()
                    : value}
            </div>
            {hint && (
                <p className="mt-1 text-[10.5px]" style={{ color: INK_3 }}>
                    {hint}
                </p>
            )}
        </div>
    );
}

// ── Tasks panel ────────────────────────────────────────────────────────

function TasksPanel({ payload }: { payload: DashboardPayload }) {
    const { tasks } = payload;
    const series = useMemo(
        () => normaliseDailySeries(tasks.series, payload.window_days),
        [tasks.series, payload.window_days],
    );

    const statusEntries = ["todo", "in_progress", "completed", "blocked", "cancelled"]
        .map((k) => ({
            key: k,
            label: k.replace("_", " "),
            count: tasks.by_status[k] || 0,
        }))
        .filter((e) => e.count > 0);
    const totalForBar = statusEntries.reduce((a, b) => a + b.count, 0) || 1;

    return (
        <PanelCard
            className="col-span-12 lg:col-span-8"
            title="Tasks"
            subtitle={`${tasks.total.toLocaleString()} total · ${(tasks.completion_rate * 100).toFixed(0)}% completion`}
            cta={<PanelLink to="/tasks">Open task board</PanelLink>}
        >
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={series}
                                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="g_completed" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={PURPLE} stopOpacity={0.32} />
                                        <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="g_created" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={SKY} stopOpacity={0.24} />
                                        <stop offset="100%" stopColor={SKY} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={HAIR} strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 10, fill: INK_2 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={dayLabel}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: INK_2 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={28}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<MiniTooltip />} cursor={{ stroke: HAIR }} />
                                <Area
                                    type="monotone"
                                    dataKey="created"
                                    stroke={SKY}
                                    strokeWidth={1.8}
                                    fill="url(#g_created)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke={PURPLE}
                                    strokeWidth={1.8}
                                    fill="url(#g_completed)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div
                        className="mt-2 flex items-center gap-4 text-[11px]"
                        style={{ color: INK_2 }}
                    >
                        <Legend dot={PURPLE} label="Completed" />
                        <Legend dot={SKY} label="Created" />
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div>
                        <p
                            className="text-[10.5px] uppercase tracking-[0.16em] font-semibold mb-2"
                            style={{ color: INK_2 }}
                        >
                            Status mix
                        </p>
                        <div
                            className="h-2.5 rounded-full overflow-hidden flex"
                            style={{ background: "rgba(15,23,42,0.05)" }}
                        >
                            {statusEntries.map((e) => (
                                <div
                                    key={e.key}
                                    title={`${e.label}: ${e.count}`}
                                    style={{
                                        width: `${(e.count / totalForBar) * 100}%`,
                                        background: STATUS_COLOR[e.key] || INK_3,
                                    }}
                                />
                            ))}
                        </div>
                        <ul className="mt-3 space-y-1.5">
                            {statusEntries.map((e) => (
                                <li
                                    key={e.key}
                                    className="flex items-center justify-between text-[12px]"
                                    style={{ color: INK }}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full"
                                            style={{ background: STATUS_COLOR[e.key] || INK_3 }}
                                        />
                                        <span className="capitalize">{e.label}</span>
                                    </span>
                                    <span className="tabular-nums font-semibold">{e.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p
                            className="text-[10.5px] uppercase tracking-[0.16em] font-semibold mb-2"
                            style={{ color: INK_2 }}
                        >
                            Owned by
                        </p>
                        <ul className="space-y-1.5 text-[12px]">
                            {(
                                [
                                    "user",
                                    "agent",
                                    "user_and_agent",
                                    "email_invite",
                                    "unassigned",
                                ] as const
                            ).map((k) => {
                                const v = tasks.by_assignee_kind[k] || 0;
                                if (!v) return null;
                                const labels: Record<string, string> = {
                                    user: "Team member",
                                    agent: "Agent only",
                                    user_and_agent: "Team + agent",
                                    email_invite: "Pending invite",
                                    unassigned: "Unassigned",
                                };
                                return (
                                    <li
                                        key={k}
                                        className="flex items-center justify-between"
                                        style={{ color: INK }}
                                    >
                                        <span>{labels[k]}</span>
                                        <span className="tabular-nums font-semibold">{v}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </PanelCard>
    );
}

// ── Agents panel ───────────────────────────────────────────────────────

function AgentsPanel({ payload }: { payload: DashboardPayload }) {
    const { agents } = payload;
    const series = useMemo(
        () => normaliseDailyAgentSeries(agents.series, payload.window_days),
        [agents.series, payload.window_days],
    );
    const top = agents.leaderboard.slice(0, 5);
    const maxRuns = Math.max(1, ...top.map((r) => r.runs));

    return (
        <PanelCard
            className="col-span-12 lg:col-span-4"
            title="Agents"
            subtitle={`${agents.total_runs.toLocaleString()} runs · ${(agents.success_rate * 100).toFixed(0)}% success`}
            cta={<PanelLink to="/agents">All agents</PanelLink>}
        >
            <div className="h-[100px] -mx-1 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" hide />
                        <YAxis hide />
                        <Tooltip content={<MiniTooltip />} cursor={false} />
                        <Line
                            type="monotone"
                            dataKey="runs"
                            stroke={PURPLE}
                            strokeWidth={1.8}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="errors"
                            stroke="#DC2626"
                            strokeWidth={1.4}
                            strokeDasharray="3 3"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <p
                        className="text-[10.5px] uppercase tracking-[0.16em] font-semibold"
                        style={{ color: INK_2 }}
                    >
                        Top by usage
                    </p>
                    <p
                        className="text-[10.5px] tabular-nums"
                        style={{ color: INK_3 }}
                    >
                        runs · success · p95
                    </p>
                </div>
                {top.length === 0 ? (
                    <p className="text-[12px]" style={{ color: INK_3 }}>
                        No agent runs yet in {RANGE_LABEL[payload.time_range].toLowerCase()}.
                    </p>
                ) : (
                    <ul className="space-y-2.5">
                        {top.map((row) => (
                            <AgentRow key={row.agent_key} row={row} maxRuns={maxRuns} />
                        ))}
                    </ul>
                )}
            </div>
        </PanelCard>
    );
}

function AgentRow({ row, maxRuns }: { row: AgentLeaderboardRow; maxRuns: number }) {
    const pct = Math.max(2, (row.runs / maxRuns) * 100);
    const success = row.success_rate * 100;
    const successTone = success >= 90 ? "#16A34A" : success >= 70 ? ORANGE : "#DC2626";
    return (
        <li>
            <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 min-w-0">
                    <span
                        className="inline-block w-1.5 h-4 rounded-full"
                        style={{
                            background:
                                "linear-gradient(180deg, #6C4AB0 0%, #3B2D6A 100%)",
                        }}
                    />
                    <span style={{ color: INK }} className="truncate">
                        {row.label}
                    </span>
                </span>
                <span
                    className="flex items-center gap-3 tabular-nums flex-none"
                    style={{ color: INK }}
                >
                    <span>{row.runs}</span>
                    <span style={{ color: successTone, fontWeight: 600 }}>
                        {Math.round(success)}%
                    </span>
                    <span style={{ color: INK_3 }}>{formatMs(row.p95_ms)}</span>
                </span>
            </div>
            <div
                className="mt-1 h-[3px] rounded-full overflow-hidden"
                style={{ background: "rgba(108, 74, 176, 0.10)" }}
            >
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        background:
                            "linear-gradient(90deg, #6C4AB0 0%, #0EA5E9 100%)",
                    }}
                />
            </div>
        </li>
    );
}

// ── Proposals panel ────────────────────────────────────────────────────

function ProposalsPanel({ payload }: { payload: DashboardPayload }) {
    const { proposals } = payload;
    const data = [
        { name: "Pending", value: proposals.pending_review, color: PURPLE },
        { name: "Approved", value: proposals.approved, color: "#16A34A" },
        { name: "Revision", value: proposals.revision, color: SKY },
        { name: "Rejected", value: proposals.rejected, color: "#DC2626" },
    ].filter((d) => d.value > 0);

    return (
        <PanelCard
            className="col-span-12 lg:col-span-5"
            title="Agent proposals"
            subtitle={`${proposals.total.toLocaleString()} total · ${proposals.pending_review} awaiting you`}
            cta={<PanelLink to="/tasks?proposals=pending">Review queue</PanelLink>}
        >
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-5">
                    {data.length === 0 ? (
                        <div
                            className="h-[160px] flex items-center justify-center text-[12px]"
                            style={{ color: INK_3 }}
                        >
                            No proposals yet
                        </div>
                    ) : (
                        <div className="relative h-[160px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={50}
                                        outerRadius={72}
                                        paddingAngle={2}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        isAnimationActive
                                    >
                                        {data.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.color}
                                                stroke="white"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<MiniTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span
                                    className="font-hero font-bold text-[28px] leading-none tabular-nums"
                                    style={{ color: PURPLE }}
                                >
                                    {proposals.pending_review}
                                </span>
                                <span
                                    className="text-[10px] uppercase tracking-[0.16em] mt-1 font-semibold"
                                    style={{ color: INK_2 }}
                                >
                                    pending
                                </span>
                            </div>
                        </div>
                    )}
                    <ul className="mt-3 space-y-1.5 text-[11.5px]">
                        {data.map((d) => (
                            <li
                                key={d.name}
                                className="flex items-center justify-between"
                            >
                                <span
                                    className="flex items-center gap-1.5"
                                    style={{ color: INK }}
                                >
                                    <span
                                        className="inline-block w-1.5 h-1.5 rounded-full"
                                        style={{ background: d.color }}
                                    />
                                    {d.name}
                                </span>
                                <span className="tabular-nums font-semibold">{d.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-span-12 sm:col-span-7">
                    <p
                        className="text-[10.5px] uppercase tracking-[0.16em] font-semibold mb-2"
                        style={{ color: INK_2 }}
                    >
                        Needs your eye
                    </p>
                    {proposals.pending.length === 0 ? (
                        <p className="text-[12px]" style={{ color: INK_3 }}>
                            You're all caught up — no proposals waiting.
                        </p>
                    ) : (
                        <ul
                            className="rounded-2xl overflow-hidden border"
                            style={{
                                background: "rgba(255,255,255,0.6)",
                                borderColor: "rgba(108, 74, 176, 0.18)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                            }}
                        >
                            {proposals.pending.map((row, i) => (
                                <li
                                    key={row.id}
                                    className={`px-3 py-2 hover:bg-white/80 transition-colors ${
                                        i > 0 ? "border-t border-white/60" : ""
                                    }`}
                                >
                                    <Link
                                        to={`/tasks?task=${row.id}&proposal=review`}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p
                                                className="text-[12.5px] truncate"
                                                style={{ color: INK }}
                                            >
                                                {row.title}
                                            </p>
                                            <p
                                                className="text-[11px] truncate"
                                                style={{ color: INK_2 }}
                                            >
                                                {row.agent_key
                                                    ? row.agent_key.replace(/_/g, " ")
                                                    : "Agent"}
                                                {row.due_date && (
                                                    <>
                                                        {" · due "}
                                                        {new Date(
                                                            row.due_date,
                                                        ).toLocaleDateString(undefined, {
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <ArrowRight
                                            size={12}
                                            className="flex-none"
                                            style={{ color: PURPLE }}
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </PanelCard>
    );
}

// ── Documents panel ────────────────────────────────────────────────────

function DocumentsPanel({ payload }: { payload: DashboardPayload }) {
    const { documents } = payload;
    const upload = useMemo(
        () => normaliseUploadSeries(documents.series, payload.window_days),
        [documents.series, payload.window_days],
    );
    const types = documents.by_type.slice(0, 5);
    const maxType = Math.max(1, ...types.map((t) => t.count));

    return (
        <PanelCard
            className="col-span-12 lg:col-span-7"
            title="Documents"
            subtitle={`${documents.total.toLocaleString()} stored · ${documents.total_chunks.toLocaleString()} chunks indexed`}
            cta={<PanelLink to="/documents">Library</PanelLink>}
        >
            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 sm:col-span-7">
                    <p
                        className="text-[10.5px] uppercase tracking-[0.16em] font-semibold mb-2"
                        style={{ color: INK_2 }}
                    >
                        Uploads
                    </p>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={upload}
                                margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="g_bar" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={PURPLE} stopOpacity={1} />
                                        <stop offset="100%" stopColor={PURPLE_LIGHT} stopOpacity={0.85} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={HAIR} strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 10, fill: INK_2 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={dayLabel}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: INK_2 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={28}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<MiniTooltip />} cursor={{ fill: "transparent" }} />
                                <Bar dataKey="uploaded" fill="url(#g_bar)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-5">
                    <p
                        className="text-[10.5px] uppercase tracking-[0.16em] font-semibold mb-2"
                        style={{ color: INK_2 }}
                    >
                        By type
                    </p>
                    {types.length === 0 ? (
                        <p className="text-[12px]" style={{ color: INK_3 }}>
                            No documents uploaded yet.
                        </p>
                    ) : (
                        <ul className="space-y-1.5">
                            {types.map((t) => (
                                <li key={t.type}>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span
                                            className="uppercase tracking-wide"
                                            style={{ color: INK }}
                                        >
                                            {t.type}
                                        </span>
                                        <span
                                            className="tabular-nums font-semibold"
                                            style={{ color: INK }}
                                        >
                                            {t.count}
                                        </span>
                                    </div>
                                    <div
                                        className="mt-1 h-[3px] rounded-full overflow-hidden"
                                        style={{ background: "rgba(108,74,176,0.10)" }}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(t.count / maxType) * 100}%` }}
                                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full rounded-full"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, #6C4AB0 0%, #9B87F5 100%)",
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div
                        className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t text-[11px]"
                        style={{ borderColor: "rgba(15,23,42,0.06)" }}
                    >
                        <SmallStat label="Processed" value={documents.processed} />
                        <SmallStat label="In flight" value={documents.processing} />
                        <SmallStat
                            label="Failed"
                            value={documents.failed}
                            tone={documents.failed > 0 ? "warn" : undefined}
                        />
                    </div>
                </div>
            </div>
        </PanelCard>
    );
}

function SmallStat({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone?: "warn";
}) {
    return (
        <div>
            <p
                className="text-[10px] uppercase tracking-[0.14em]"
                style={{ color: INK_2 }}
            >
                {label}
            </p>
            <p
                className="mt-0.5 font-hero font-bold text-[20px] tabular-nums leading-none"
                style={tone === "warn" ? { color: ORANGE } : { color: INK }}
            >
                {value.toLocaleString()}
            </p>
        </div>
    );
}

// ── Activity feed ──────────────────────────────────────────────────────

function ActivityFeed({ activity }: { activity: ActivityRow[] }) {
    if (!activity || activity.length === 0) return null;
    return (
        <PanelCard
            className="col-span-12"
            title="Activity stream"
            subtitle="Most recent events across the workspace"
        >
            <ol className="divide-y" style={{ borderColor: "rgba(15,23,42,0.06)" }}>
                {activity.slice(0, 14).map((row, i) => (
                    <motion.li
                        key={row.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="py-2.5 flex items-start gap-3 border-t first:border-t-0"
                        style={{ borderColor: "rgba(15,23,42,0.06)" }}
                    >
                        <ActivityIcon type={row.activity_type} />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12.5px]" style={{ color: INK }}>
                                {describeActivity(row)}
                            </p>
                            <p className="text-[11px]" style={{ color: INK_2 }}>
                                {row.timestamp ? timeAgo(row.timestamp) : ""}
                                {row.related_resource_type && (
                                    <>
                                        {" · "}
                                        <span className="uppercase tracking-wider">
                                            {row.related_resource_type.toLowerCase()}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </motion.li>
                ))}
            </ol>
        </PanelCard>
    );
}

function ActivityIcon({ type }: { type: string }) {
    const t = (type || "").toLowerCase();
    let Icon: React.ComponentType<{ size?: number; className?: string }> = Activity;
    let color = INK_2;
    let bg = "rgba(15,23,42,0.06)";
    if (t.includes("completed") || t.includes("approved")) {
        Icon = CheckCircle2;
        color = "#16A34A";
        bg = "rgba(34,197,94,0.12)";
    } else if (t.includes("started") || t.includes("in_progress") || t.includes("created")) {
        Icon = PlayCircle;
        color = SKY;
        bg = `${SKY}1A`;
    } else if (t.includes("blocked") || t.includes("rejected") || t.includes("error")) {
        Icon = AlertTriangle;
        color = "#DC2626";
        bg = "rgba(220,38,38,0.10)";
    } else if (t.includes("assigned")) {
        Icon = Users;
        color = PURPLE;
        bg = `${PURPLE}14`;
    } else if (t.includes("document")) {
        Icon = FileText;
        color = "#0891B2";
        bg = "rgba(8,145,178,0.10)";
    } else if (t.includes("agent") || t.includes("proposal")) {
        Icon = Bot;
        color = PURPLE;
        bg = `${PURPLE}14`;
    } else if (t.includes("wellbeing")) {
        Icon = Activity;
        color = ORANGE;
        bg = `${ORANGE}1A`;
    } else if (t.includes("invite")) {
        Icon = Inbox;
        color = PURPLE;
        bg = `${PURPLE}14`;
    } else if (t.includes("snooze") || t.includes("deferred")) {
        Icon = PauseCircle;
        color = INK_2;
    } else if (t.includes("organization")) {
        Icon = LayoutGrid;
        color = PURPLE_DEEP;
        bg = `${PURPLE_DEEP}14`;
    }
    return (
        <span
            className="flex-none w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
            style={{ color, background: bg }}
        >
            <Icon size={12} />
        </span>
    );
}

function describeActivity(row: ActivityRow): string {
    const t = (row.activity_type || "").replace(/_/g, " ").replace(/\./g, " · ");
    const d = row.details || {};
    if (row.activity_type?.startsWith("task.") && d.task_id) {
        const title = d.title || d.task_title || `Task ${String(d.task_id).slice(-6)}`;
        return `${t} — ${title}`;
    }
    if (row.activity_type?.startsWith("organization.")) {
        return `${t}${d.email ? ` — ${d.email}` : ""}`;
    }
    if (d.agent_key) {
        return `${t} — ${String(d.agent_key).replace(/_/g, " ")}`;
    }
    return t;
}

// ── Generic primitives ─────────────────────────────────────────────────

function PanelCard({
    title,
    subtitle,
    cta,
    className,
    children,
}: {
    title: string;
    subtitle?: string;
    cta?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <motion.section
            {...FADE_UP}
            className={`relative rounded-3xl overflow-hidden ${className || ""}`}
            style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(255,255,255,0.70)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow:
                    "0 8px 28px -10px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
        >
            <header
                className="flex items-end justify-between gap-4 px-5 pt-4 pb-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.6)" }}
            >
                <div>
                    <h3
                        className="font-hero font-semibold text-[15px] leading-tight"
                        style={{ color: INK }}
                    >
                        {title}
                    </h3>
                    {subtitle && (
                        <p
                            className="text-[11.5px] mt-0.5"
                            style={{ color: INK_2 }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
                {cta}
            </header>
            <div className="px-5 py-4">{children}</div>
        </motion.section>
    );
}

function PanelLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold transition-colors hover:opacity-80"
            style={{ color: PURPLE }}
        >
            {children}
            <ArrowUpRight size={11} />
        </Link>
    );
}

function Legend({ dot, label }: { dot: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: dot }}
            />
            {label}
        </span>
    );
}

function MiniTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div
            className="rounded-xl px-3 py-2 text-[11px]"
            style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                boxShadow: "0 8px 24px -10px rgba(15, 23, 42, 0.18)",
            }}
        >
            {label && (
                <p className="mb-0.5" style={{ color: INK_2 }}>
                    {typeof label === "string" ? dayLabel(label) : label}
                </p>
            )}
            {payload.map((p: any, i: number) => (
                <p
                    key={i}
                    className="tabular-nums"
                    style={{ color: INK }}
                >
                    <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{ background: p.color || p.fill || PURPLE }}
                    />
                    {p.name}: <span className="font-semibold">{p.value}</span>
                </p>
            ))}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="mt-10 grid grid-cols-12 gap-5">
            {[1, 1, 1, 1, 2, 2, 3].map((span, i) => (
                <div
                    key={i}
                    className={`col-span-${span === 3 ? 12 : span === 2 ? 6 : 3} h-[120px] rounded-3xl border border-white/60 animate-pulse`}
                    style={{
                        background: "rgba(255,255,255,0.5)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                    }}
                />
            ))}
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div
            className="mt-12 rounded-3xl p-8 text-center"
            style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.6)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow: "0 12px 40px -16px rgba(15, 23, 42, 0.16)",
            }}
        >
            <AlertTriangle size={22} className="mx-auto mb-2" style={{ color: ORANGE }} />
            <h3 className="text-base font-semibold" style={{ color: INK }}>
                Dashboard didn't load
            </h3>
            <p className="mt-1 text-sm" style={{ color: INK_2 }}>
                {message}
            </p>
            <Button
                onClick={onRetry}
                size="sm"
                className="mt-3 rounded-full"
                style={{
                    background:
                        "linear-gradient(135deg, #6C4AB0 0%, #3B2D6A 100%)",
                    color: "#fff",
                    boxShadow: "0 12px 40px -12px rgba(108, 74, 176, 0.45)",
                }}
            >
                <RefreshCcw size={11} className="mr-1.5" /> Try again
            </Button>
        </div>
    );
}

// ── Pure helpers ───────────────────────────────────────────────────────

function highestP95(rows: AgentLeaderboardRow[]): number | null {
    const ps = rows.map((r) => r.p95_ms).filter((v): v is number => v != null);
    if (!ps.length) return null;
    return Math.max(...ps);
}

function formatMs(ms: number | null): string {
    if (ms == null) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
}

function dayLabel(day: string): string {
    try {
        const d = new Date(`${day}T00:00:00`);
        if (isNaN(d.getTime())) return day;
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    } catch {
        return day;
    }
}

function timeAgo(ts: string): string {
    try {
        const d = new Date(ts);
        const secs = (Date.now() - d.getTime()) / 1000;
        if (secs < 60) return "just now";
        if (secs < 3600) return `${Math.round(secs / 60)} min ago`;
        if (secs < 86400) return `${Math.round(secs / 3600)} h ago`;
        if (secs < 604800) return `${Math.round(secs / 86400)} d ago`;
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
        return ts;
    }
}

function normaliseDailySeries(
    rows: { day: string; created: number; completed: number }[],
    days: number,
) {
    const out: { day: string; created: number; completed: number }[] = [];
    const map = new Map(rows.map((r) => [r.day, r]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const existing = map.get(key);
        out.push({
            day: key,
            created: existing?.created || 0,
            completed: existing?.completed || 0,
        });
    }
    return out;
}

function normaliseDailyAgentSeries(
    rows: { day: string; runs: number; errors: number }[],
    days: number,
) {
    const out: { day: string; runs: number; errors: number }[] = [];
    const map = new Map(rows.map((r) => [r.day, r]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const existing = map.get(key);
        out.push({
            day: key,
            runs: existing?.runs || 0,
            errors: existing?.errors || 0,
        });
    }
    return out;
}

function normaliseUploadSeries(
    rows: { day: string; uploaded: number }[],
    days: number,
) {
    const cap = Math.min(days, 30);
    const out: { day: string; uploaded: number }[] = [];
    const map = new Map(rows.map((r) => [r.day, r]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = cap - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const existing = map.get(key);
        out.push({ day: key, uploaded: existing?.uploaded || 0 });
    }
    return out;
}
