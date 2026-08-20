/**
 * Reach, engagement and what the plan allows.
 *
 * The rule this page exists to honour: a metric a platform does not expose is
 * shown as "Not available", never as 0. LinkedIn gives no reach figures for a
 * personal profile, and a zero there reads as "nobody saw my post" — which is
 * both false and the kind of thing that loses a customer's trust in every
 * other number on the page.
 *
 * Usage is shown alongside the numbers because hitting the AI reply allowance
 * does not break anything — it drops back to keyword rules — but the customer
 * has to be told, or the agent just appears to have gone quiet.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
    BarChart3, Eye, Heart, Loader2, MessageCircle, MousePointerClick,
    Download, Mail, Share2, TriangleAlert, Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/social/PlatformIcon';
import {
    PLATFORM_LABELS, type PlatformKey, type SocialAnalytics,
    type ReportSchedule,
    formatMetric, socialApi, socialError, socialExtras, socialSchedule,
} from '@/services/socialApi';

const RANGES = [7, 30, 90];

const TILES: Array<{
    key: keyof SocialAnalytics['totals'];
    label: string;
    icon: typeof Eye;
}> = [
        { key: 'reach', label: 'Reach', icon: Users },
        { key: 'impressions', label: 'Impressions', icon: Eye },
        { key: 'likes', label: 'Likes', icon: Heart },
        { key: 'comments', label: 'Comments', icon: MessageCircle },
        { key: 'shares', label: 'Shares', icon: Share2 },
        { key: 'clicks', label: 'Clicks', icon: MousePointerClick },
    ];

export default function Analytics() {
    const [data, setData] = useState<SocialAnalytics | null>(null);
    const [range, setRange] = useState(30);
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState<ReportSchedule | null>(null);
    const [editingSchedule, setEditingSchedule] = useState(false);
    const [recipients, setRecipients] = useState('');
    const [cadence, setCadence] = useState<'weekly' | 'monthly'>('weekly');

    const load = useCallback(async (days: number) => {
        setLoading(true);
        try {
            setData(await socialApi.analytics(days));
        } catch (error) {
            toast.error(socialError(error, 'Could not load your numbers'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(range); }, [load, range]);

    useEffect(() => {
        void socialSchedule.get().then((row) => {
            setSchedule(row);
            setRecipients((row.recipients ?? []).join(', '));
            setCadence(row.cadence ?? 'weekly');
        }).catch(() => { /* no schedule yet is the normal case */ });
    }, []);

    const saveSchedule = async (enabled: boolean) => {
        try {
            const saved = await socialSchedule.set({
                cadence,
                // Split on comma OR whitespace: people paste address lists in
                // both shapes and neither should silently drop a recipient.
                recipients: recipients.split(/[,\s]+/).map((r) => r.trim()).filter(Boolean),
                enabled,
            });
            setSchedule(saved);
            setEditingSchedule(false);
            toast.success(enabled
                ? `Report will send ${saved.cadence}`
                : 'Recurring report turned off');
        } catch (error) {
            toast.error(socialError(error, 'Could not save that'));
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
            </div>
        );
    }

    if (!data) return null;

    const nothingMeasured = data.posts_measured === 0;

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Performance</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {data.posts_measured} post{data.posts_measured === 1 ? '' : 's'} measured
                        across {data.connected_accounts} account
                        {data.connected_accounts === 1 ? '' : 's'}.
                    </p>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" className="mr-1"
                        onClick={() => {
                            void socialExtras.downloadReport(range)
                                .then(() => toast.success('Report downloaded'))
                                .catch((e) => toast.error(socialError(e, 'Could not build the report')));
                        }}>
                        <Download size={13} className="mr-1.5" /> Report
                    </Button>
                    {RANGES.map((days) => (
                        <button key={days} onClick={() => setRange(days)}
                            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${range === days
                                ? 'border-lumicoria-purple bg-purple-50 text-lumicoria-purple'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            {days} days
                        </button>
                    ))}
                </div>
            </header>

            {/* The AI allowance state, when it matters. Without this the agent
                simply appears to have stopped replying. */}
            {data.usage.degraded_at && (
                <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
                    <div className="text-sm text-amber-900">
                        <p className="font-medium">Automatic AI replies have paused this month.</p>
                        <p className="mt-0.5 text-xs">
                            You have used your allowance of AI replies. Your keyword rules are
                            still replying, and your inbox still works — only the AI has
                            stopped. It resumes next month, or upgrade to lift the limit.
                        </p>
                    </div>
                </div>
            )}

            {nothingMeasured ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                    <BarChart3 size={22} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">
                        No numbers yet. They appear once you publish and the platforms
                        report back — usually within an hour or so.
                    </p>
                    <Link to="../compose">
                        <Button size="sm" variant="outline" className="mt-4">Write a post</Button>
                    </Link>
                </div>
            ) : (
                <>
                    <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {TILES.map(({ key, label, icon: Icon }) => {
                            const value = data.totals[key];
                            const unavailable = value === null || value === undefined;
                            return (
                                <div key={key}
                                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <Icon size={15} className="text-gray-400" />
                                    <p className={`mt-2 font-semibold tracking-tight ${unavailable
                                        ? 'text-sm text-gray-400' : 'text-xl text-gray-900'}`}>
                                        {formatMetric(value)}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-gray-500">{label}</p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-medium text-gray-900">By platform</h2>
                        <div className="space-y-3">
                            {Object.entries(data.by_provider).map(([provider, stats]) => {
                                const label = PLATFORM_LABELS[provider as PlatformKey] || provider;
                                const noReach = stats.reach === null && stats.impressions === null;
                                return (
                                    <div key={provider}
                                        className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2">
                                            <PlatformIcon platform={provider as PlatformKey} size={18} />
                                            <span className="text-sm text-gray-900">{label}</span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {stats.posts} post{stats.posts === 1 ? '' : 's'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-5 text-xs">
                                            <span className="text-gray-500">
                                                Reach{' '}
                                                <span className={noReach ? 'text-gray-400' : 'font-medium text-gray-900'}>
                                                    {formatMetric(stats.reach)}
                                                </span>
                                            </span>
                                            <span className="text-gray-500">
                                                Engagements{' '}
                                                <span className="font-medium text-gray-900">
                                                    {formatMetric(stats.engagements)}
                                                </span>
                                            </span>
                                        </div>
                                        {/* Named, so it reads as a platform limit rather
                                            than something we failed to fetch. */}
                                        {noReach && (
                                            <p className="w-full text-[11px] text-gray-400">
                                                {label} does not report reach for this kind of
                                                account, so there is nothing to show.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}

            <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                            {schedule?.enabled
                                ? `Emailing ${schedule.recipients.length} ${schedule.recipients.length === 1 ? 'person' : 'people'} ${schedule.cadence}`
                                : 'Send this report automatically'}
                        </span>
                    </div>
                    <Button size="sm" variant="outline"
                        onClick={() => setEditingSchedule((v) => !v)}>
                        {schedule?.enabled ? 'Change' : 'Set up'}
                    </Button>
                </div>

                {schedule?.enabled && schedule.next_run_at && !editingSchedule && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                        Next on {new Date(schedule.next_run_at).toLocaleDateString(undefined,
                            { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                )}

                {editingSchedule && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <label className="mb-1 block text-xs text-gray-600">Send to</label>
                        <input value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                            placeholder="client@example.com, boss@example.com"
                            className="mb-3 h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                        <div className="flex flex-wrap items-center gap-2">
                            {(['weekly', 'monthly'] as const).map((option) => (
                                <button key={option} onClick={() => setCadence(option)}
                                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${cadence === option
                                        ? 'border-lumicoria-purple bg-purple-50 text-lumicoria-purple'
                                        : 'border-gray-200 text-gray-600'}`}>
                                    {option === 'weekly' ? 'Every Monday' : '1st of the month'}
                                </button>
                            ))}
                            <Button size="sm" className="ml-auto"
                                disabled={!recipients.trim()}
                                onClick={() => saveSchedule(true)}>
                                Save
                            </Button>
                            {schedule?.enabled && (
                                <Button size="sm" variant="ghost"
                                    onClick={() => saveSchedule(false)}>
                                    Turn off
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-500 shadow-sm">
                <span>
                    This month: {data.usage.posts_this_month} post
                    {data.usage.posts_this_month === 1 ? '' : 's'} ·{' '}
                    {data.usage.ai_replies_this_month} AI repl
                    {data.usage.ai_replies_this_month === 1 ? 'y' : 'ies'}
                </span>
                <span className="text-gray-400">
                    Updated {new Date(data.computed_at).toLocaleTimeString()}
                </span>
            </section>
        </div>
    );
}
