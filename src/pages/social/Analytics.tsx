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
    Share2, TriangleAlert, Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    PLATFORM_LABELS, type PlatformKey, type SocialAnalytics,
    formatMetric, socialApi, socialError,
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
                <div className="flex gap-1.5">
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

            <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-500 shadow-sm">
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
