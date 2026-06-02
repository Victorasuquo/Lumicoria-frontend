/**
 * Phase 9 — Dashboard.
 *
 * Editorial information-density layout.  No AI slop, no gradient walls,
 * no sparkle icons — calibrated typography, a restrained palette, real
 * recharts surfaces, dense KPI strip, agents leaderboard, documents
 * panel, proposals queue, recent activity stream.
 *
 * Everything reads from a single `/analytics/dashboard` payload so the
 * page renders in one round-trip.
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
    ArrowDownRight,
    ArrowRight,
    CheckCircle2,
    Circle,
    PlayCircle,
    PauseCircle,
    Clock,
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

// ── Tokens ─────────────────────────────────────────────────────────────
//
// One accent ("ink") + one warm secondary ("amber").  Everything else
// reads as slate so the data is the loudest thing on screen.
const INK = "#0F172A";          // slate-900
const INK_MUTED = "#475569";    // slate-600
const HAIR = "#E2E8F0";         // slate-200
const PAPER = "#FAFAF7";        // bone
const AMBER = "#C2410C";        // burnt orange — single accent
const POSITIVE = "#15803D";     // forest
const NEGATIVE = "#B91C1C";     // brick
const STATUS_COLOR: Record<string, string> = {
    completed: POSITIVE,
    in_progress: "#0369A1",     // ocean
    todo: "#94A3B8",
    blocked: "#B45309",
    cancelled: "#A1A1AA",
    deferred: "#6B7280",
};

const RANGE_OPTIONS: AnalyticsRange[] = ["7d", "30d", "90d", "1y"];
const RANGE_LABEL: Record<AnalyticsRange, string> = {
    "1d": "Today",
    "7d": "7 days",
    "30d": "30 days",
    "90d": "90 days",
    "1y": "12 months",
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

    // Auto-refresh every 60 s so the dashboard feels alive without polling
    // the user crazy.
    useEffect(() => {
        const id = setInterval(() => load(range, true), 60_000);
        return () => clearInterval(id);
    }, [range, load]);

    return (
        <div className="min-h-screen bg-[#FAFAF7] text-slate-900">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-10">
                <Header
                    user={user}
                    range={range}
                    onRangeChange={setRange}
                    onRefresh={() => load(range, true)}
                    refreshing={refreshing}
                    generatedAt={payload?.generated_at}
                />

                {loading && !payload ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} onRetry={() => load(range)} />
                ) : payload ? (
                    <div className="mt-8 space-y-8">
                        <ProductivityBar payload={payload} />
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

// ── Header ─────────────────────────────────────────────────────────────

function Header({
    user,
    range,
    onRangeChange,
    onRefresh,
    refreshing,
    generatedAt,
}: {
    user: any;
    range: AnalyticsRange;
    onRangeChange: (r: AnalyticsRange) => void;
    onRefresh: () => void;
    refreshing: boolean;
    generatedAt?: string;
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
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-medium">
                    Operations · Lumicoria
                </p>
                <h1 className="mt-2 text-[34px] leading-[1.05] font-serif text-slate-900">
                    {greeting}, {firstName}.
                </h1>
                <p className="mt-2 text-sm text-slate-500 max-w-xl">
                    Everything moving across your workspace right now — tasks, agents,
                    documents, and the work your proposals are waiting on.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5">
                    {RANGE_OPTIONS.map((r) => (
                        <button
                            key={r}
                            onClick={() => onRangeChange(r)}
                            className={`px-3 py-1.5 text-[11.5px] font-medium rounded-full transition-colors ${
                                range === r
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            {RANGE_LABEL[r]}
                        </button>
                    ))}
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="h-8 text-[12px] border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <RefreshCcw size={11} className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
        </div>
    );
}

// ── Productivity bar ───────────────────────────────────────────────────

function ProductivityBar({ payload }: { payload: DashboardPayload }) {
    const { productivity, tasks, agents } = payload;
    const bandLabel: Record<string, string> = {
        excellent: "Excellent",
        strong: "Strong",
        steady: "Steady",
        slipping: "Slipping",
        "needs-attention": "Needs attention",
    };
    const bandColor: Record<string, string> = {
        excellent: POSITIVE,
        strong: POSITIVE,
        steady: "#0369A1",
        slipping: AMBER,
        "needs-attention": NEGATIVE,
    };

    return (
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                }}
            />
            <div className="relative grid grid-cols-12 gap-0 divide-x divide-slate-100">
                <div className="col-span-12 md:col-span-4 px-7 py-7">
                    <p className="text-[10.5px] uppercase tracking-[0.18em] text-slate-500 font-medium">
                        Productivity index
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-serif text-[68px] leading-[0.9] text-slate-900 tabular-nums">
                            {productivity.score}
                        </span>
                        <span className="text-sm text-slate-400">/ 100</span>
                    </div>
                    <div
                        className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                            color: bandColor[productivity.band],
                            background: `${bandColor[productivity.band]}14`,
                        }}
                    >
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

                <BigStat
                    label="Tasks completed"
                    primary={tasks.completed}
                    secondary={`${tasks.total.toLocaleString()} total · ${(tasks.completion_rate * 100).toFixed(0)}% rate`}
                />
                <BigStat
                    label="Agent runs"
                    primary={agents.total_runs}
                    secondary={`${(agents.success_rate * 100).toFixed(0)}% success · ${agents.errors} errors`}
                />
                <BigStat
                    label="Pending review"
                    primary={payload.proposals.pending_review}
                    secondary={`${payload.proposals.approved} approved · ${payload.proposals.rejected} rejected`}
                    accent={payload.proposals.pending_review > 0 ? AMBER : undefined}
                />
            </div>
        </section>
    );
}

function ComponentBar({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="tabular-nums text-slate-700 font-medium">{value.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}

function BigStat({
    label,
    primary,
    secondary,
    accent,
}: {
    label: string;
    primary: number;
    secondary: string;
    accent?: string;
}) {
    return (
        <div className="col-span-12 sm:col-span-6 md:col-span-2.67 px-7 py-7 md:col-span-[2.667] md:[grid-column:span_2.667/span_2.667]">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-slate-500 font-medium">
                {label}
            </p>
            <div className="mt-2 font-serif text-[44px] leading-none tabular-nums" style={accent ? { color: accent } : undefined}>
                {primary.toLocaleString()}
            </div>
            <p className="mt-2 text-[11.5px] text-slate-500">{secondary}</p>
        </div>
    );
}

// ── KPI strip (high-density cards under the hero) ──────────────────────

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
            tone: "ink",
            hint: `${agents.total_runs.toLocaleString()} runs in ${RANGE_LABEL[payload.time_range]}`,
        },
        {
            label: "Documents",
            value: documents.total,
            icon: <FileText size={13} />,
            tone: "ink",
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
                <KpiCard key={i} {...c} />
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
    tone?: "ink" | "warn" | "positive" | "muted";
    hint?: string;
    isString?: boolean;
}) {
    const color =
        tone === "warn" ? AMBER : tone === "positive" ? POSITIVE : tone === "muted" ? INK_MUTED : INK;
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium">
                <span style={{ color }}>{icon}</span>
                <span>{label}</span>
            </div>
            <div
                className="mt-1.5 font-serif text-[26px] leading-none tabular-nums"
                style={{ color }}
            >
                {isString ? value : (typeof value === "number" ? value.toLocaleString() : value)}
            </div>
            {hint && <p className="mt-1 text-[10.5px] text-slate-500">{hint}</p>}
        </div>
    );
}

// ── Tasks panel ────────────────────────────────────────────────────────

function TasksPanel({ payload }: { payload: DashboardPayload }) {
    const { tasks } = payload;
    // Fill missing days so the chart breathes evenly.
    const series = useMemo(() => normaliseDailySeries(tasks.series, payload.window_days), [
        tasks.series,
        payload.window_days,
    ]);

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
                            <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="g_completed" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={INK} stopOpacity={0.18} />
                                        <stop offset="100%" stopColor={INK} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="g_created" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={AMBER} stopOpacity={0.14} />
                                        <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={HAIR} strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 10, fill: INK_MUTED }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={dayLabel}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: INK_MUTED }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={28}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<MiniTooltip />} cursor={{ stroke: HAIR }} />
                                <Area
                                    type="monotone"
                                    dataKey="created"
                                    stroke={AMBER}
                                    strokeWidth={1.5}
                                    fill="url(#g_created)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke={INK}
                                    strokeWidth={1.6}
                                    fill="url(#g_completed)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                        <Legend dot={INK} label="Completed" />
                        <Legend dot={AMBER} label="Created" />
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div>
                        <p className="text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium mb-2">
                            Status mix
                        </p>
                        <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                            {statusEntries.map((e) => (
                                <div
                                    key={e.key}
                                    title={`${e.label}: ${e.count}`}
                                    style={{
                                        width: `${(e.count / totalForBar) * 100}%`,
                                        background: STATUS_COLOR[e.key] || "#94A3B8",
                                    }}
                                />
                            ))}
                        </div>
                        <ul className="mt-3 space-y-1.5">
                            {statusEntries.map((e) => (
                                <li
                                    key={e.key}
                                    className="flex items-center justify-between text-[12px] text-slate-700"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full"
                                            style={{ background: STATUS_COLOR[e.key] || "#94A3B8" }}
                                        />
                                        <span className="capitalize">{e.label}</span>
                                    </span>
                                    <span className="tabular-nums font-medium">{e.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium mb-2">
                            Owned by
                        </p>
                        <ul className="space-y-1.5 text-[12px]">
                            {(["user", "agent", "user_and_agent", "email_invite", "unassigned"] as const).map(
                                (k) => {
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
                                        <li key={k} className="flex items-center justify-between text-slate-700">
                                            <span>{labels[k]}</span>
                                            <span className="tabular-nums font-medium">{v}</span>
                                        </li>
                                    );
                                },
                            )}
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
                            stroke={INK}
                            strokeWidth={1.6}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="errors"
                            stroke={NEGATIVE}
                            strokeWidth={1.2}
                            strokeDasharray="3 3"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium">
                        Top by usage
                    </p>
                    <p className="text-[10.5px] text-slate-400 tabular-nums">runs · success · p95</p>
                </div>
                {top.length === 0 ? (
                    <p className="text-[12px] text-slate-400">
                        No agent runs yet in {RANGE_LABEL[payload.time_range].toLowerCase()}.
                    </p>
                ) : (
                    <ul className="space-y-2">
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
    const successTone = success >= 90 ? POSITIVE : success >= 70 ? AMBER : NEGATIVE;
    return (
        <li>
            <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 min-w-0">
                    <span
                        className="inline-block w-1.5 h-4 rounded-sm"
                        style={{ background: INK }}
                    />
                    <span className="text-slate-800 truncate">{row.label}</span>
                </span>
                <span className="flex items-center gap-3 tabular-nums text-slate-700 flex-none">
                    <span>{row.runs}</span>
                    <span style={{ color: successTone }}>{Math.round(success)}%</span>
                    <span className="text-slate-500">{formatMs(row.p95_ms)}</span>
                </span>
            </div>
            <div className="mt-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
            </div>
        </li>
    );
}

// ── Proposals panel ────────────────────────────────────────────────────

function ProposalsPanel({ payload }: { payload: DashboardPayload }) {
    const { proposals } = payload;
    const data = [
        { name: "Pending", value: proposals.pending_review, color: AMBER },
        { name: "Approved", value: proposals.approved, color: POSITIVE },
        { name: "Revision", value: proposals.revision, color: "#0369A1" },
        { name: "Rejected", value: proposals.rejected, color: NEGATIVE },
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
                        <div className="h-[160px] flex items-center justify-center text-[12px] text-slate-400">
                            No proposals yet
                        </div>
                    ) : (
                        <div className="relative h-[160px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={48}
                                        outerRadius={70}
                                        paddingAngle={1}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        isAnimationActive={false}
                                    >
                                        {data.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} stroke="white" strokeWidth={1.5} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<MiniTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="font-serif text-[28px] leading-none tabular-nums text-slate-900">
                                    {proposals.pending_review}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mt-1">
                                    pending
                                </span>
                            </div>
                        </div>
                    )}
                    <ul className="mt-3 space-y-1.5 text-[11.5px]">
                        {data.map((d) => (
                            <li key={d.name} className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-700">
                                    <span
                                        className="inline-block w-1.5 h-1.5 rounded-full"
                                        style={{ background: d.color }}
                                    />
                                    {d.name}
                                </span>
                                <span className="tabular-nums font-medium">{d.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-span-12 sm:col-span-7">
                    <p className="text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium mb-2">
                        Needs your eye
                    </p>
                    {proposals.pending.length === 0 ? (
                        <p className="text-[12px] text-slate-400">
                            You're all caught up — no proposals waiting.
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                            {proposals.pending.map((row) => (
                                <li key={row.id} className="px-3 py-2 hover:bg-slate-50">
                                    <Link
                                        to={`/tasks?task=${row.id}&proposal=review`}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[12.5px] text-slate-900 truncate">
                                                {row.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                {row.agent_key
                                                    ? row.agent_key.replace(/_/g, " ")
                                                    : "Agent"}
                                                {row.due_date && (
                                                    <>
                                                        {" · due "}
                                                        {new Date(row.due_date).toLocaleDateString(
                                                            undefined,
                                                            { month: "short", day: "numeric" },
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <ArrowRight size={12} className="text-slate-300 flex-none" />
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
                    <p className="text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium mb-2">
                        Uploads
                    </p>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={upload} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                <CartesianGrid stroke={HAIR} strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 10, fill: INK_MUTED }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={dayLabel}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: INK_MUTED }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={28}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<MiniTooltip />} cursor={{ fill: "transparent" }} />
                                <Bar dataKey="uploaded" fill={INK} radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-5">
                    <p className="text-[10.5px] uppercase tracking-[0.16em] text-slate-500 font-medium mb-2">
                        By type
                    </p>
                    {types.length === 0 ? (
                        <p className="text-[12px] text-slate-400">No documents uploaded yet.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {types.map((t) => (
                                <li key={t.type}>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span className="uppercase text-slate-700 tracking-wide">
                                            {t.type}
                                        </span>
                                        <span className="tabular-nums text-slate-700 font-medium">
                                            {t.count}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-slate-900"
                                            style={{ width: `${(t.count / maxType) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-[11px]">
                        <SmallStat label="Processed" value={documents.processed} />
                        <SmallStat label="In flight" value={documents.processing} />
                        <SmallStat label="Failed" value={documents.failed} tone={documents.failed > 0 ? "warn" : undefined} />
                    </div>
                </div>
            </div>
        </PanelCard>
    );
}

function SmallStat({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p
                className="mt-0.5 font-serif text-[18px] tabular-nums"
                style={tone === "warn" ? { color: AMBER } : undefined}
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
            <ol className="divide-y divide-slate-100">
                {activity.slice(0, 14).map((row) => (
                    <li key={row.id} className="py-2.5 flex items-start gap-3">
                        <ActivityIcon type={row.activity_type} />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] text-slate-900">{describeActivity(row)}</p>
                            <p className="text-[11px] text-slate-500">
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
                    </li>
                ))}
            </ol>
        </PanelCard>
    );
}

function ActivityIcon({ type }: { type: string }) {
    const t = (type || "").toLowerCase();
    let Icon: React.ComponentType<{ size?: number; className?: string }> = Circle;
    let color = INK_MUTED;
    if (t.includes("completed") || t.includes("approved")) {
        Icon = CheckCircle2;
        color = POSITIVE;
    } else if (t.includes("started") || t.includes("in_progress") || t.includes("created")) {
        Icon = PlayCircle;
        color = "#0369A1";
    } else if (t.includes("blocked") || t.includes("rejected") || t.includes("error")) {
        Icon = AlertTriangle;
        color = NEGATIVE;
    } else if (t.includes("assigned")) {
        Icon = Users;
        color = INK;
    } else if (t.includes("document")) {
        Icon = FileText;
        color = INK;
    } else if (t.includes("agent") || t.includes("proposal")) {
        Icon = Bot;
        color = INK;
    } else if (t.includes("wellbeing")) {
        Icon = Activity;
        color = AMBER;
    } else if (t.includes("invite")) {
        Icon = Inbox;
        color = AMBER;
    } else if (t.includes("snooze") || t.includes("deferred")) {
        Icon = PauseCircle;
        color = INK_MUTED;
    } else if (t.includes("organization")) {
        Icon = LayoutGrid;
        color = INK;
    }
    return (
        <span
            className="flex-none w-5 h-5 rounded-full flex items-center justify-center border border-slate-200 bg-white mt-0.5"
            style={{ color }}
        >
            <Icon size={11} />
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`rounded-2xl border border-slate-200 bg-white ${className || ""}`}
        >
            <header className="flex items-end justify-between gap-4 px-5 pt-4 pb-3 border-b border-slate-100">
                <div>
                    <h3 className="text-[15px] font-semibold text-slate-900 leading-tight">{title}</h3>
                    {subtitle && (
                        <p className="text-[11.5px] text-slate-500 mt-0.5">{subtitle}</p>
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
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
            {children}
            <ArrowUpRight size={11} />
        </Link>
    );
}

function Legend({ dot, label }: { dot: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: dot }} />
            {label}
        </span>
    );
}

function MiniTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm px-2.5 py-1.5 text-[11px]">
            {label && (
                <p className="text-slate-500 mb-0.5">
                    {typeof label === "string" ? dayLabel(label) : label}
                </p>
            )}
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-slate-700 tabular-nums">
                    <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{ background: p.color || p.fill || INK }}
                    />
                    {p.name}: <span className="font-medium">{p.value}</span>
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
                    className={`col-span-${span === 3 ? 12 : span === 2 ? 6 : 3} h-[120px] rounded-2xl border border-slate-200 bg-white animate-pulse`}
                />
            ))}
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <AlertTriangle size={22} className="mx-auto text-amber-600 mb-2" />
            <h3 className="text-base font-semibold text-slate-900">Dashboard didn't load</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            <Button onClick={onRetry} variant="outline" size="sm" className="mt-3">
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
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
    const cap = Math.min(days, 30); // bar chart looks cleanest within 30 buckets
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
