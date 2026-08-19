/**
 * The room you land in.
 *
 * Two jobs: show what this agent can do for someone who has not connected
 * anything yet, and get out of the way once they have — at which point the
 * same page becomes their live numbers and what needs them today.
 *
 * Capabilities are described in the customer's words. Nothing here says
 * "agent", "AI" or "automation": those are our words for it, not theirs.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3, CalendarClock, CheckCircle2, Inbox, Loader2,
    MessageSquareReply, PenLine, Users, Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    PLATFORM_LABELS, type PlatformKey, type SocialAnalytics, type SocialComment,
    formatMetric, socialApi,
} from '@/services/socialApi';
import { useSocial } from './SocialLayout';

const CAPABILITIES = [
    {
        icon: PenLine,
        title: 'Write once, post everywhere',
        body: 'Describe what you want to say. You get a version shaped for each platform — the right length, the right tone — and you edit anything before it goes out.',
        to: 'compose',
    },
    {
        icon: MessageSquareReply,
        title: 'Answer the easy comments for you',
        body: 'Set a word people can comment — "link", "price", "K" — and what they get back. They are answered in seconds, at 2am, whether or not you are awake.',
        to: 'rules',
    },
    {
        icon: Inbox,
        title: 'One inbox for every platform',
        body: 'Comments, messages and mentions from all your accounts in one list. Anything angry or urgent is flagged at the top and never answered automatically.',
        to: 'inbox',
    },
    {
        icon: BarChart3,
        title: 'See what actually worked',
        body: 'Reach, engagement and clicks per post and per account. Where a platform does not share a number, we say so rather than showing you a zero.',
        to: 'analytics',
    },
    {
        icon: CalendarClock,
        title: 'Plan a week in one sitting',
        body: 'Schedule ahead, and get suggested times based on when your own audience actually engaged — not generic advice.',
        to: 'compose',
    },
    {
        icon: CheckCircle2,
        title: 'Nothing goes out unreviewed',
        body: 'Posts are approved before they publish. Edit something after approval and it goes back for review, so a sign-off always matches what ships.',
        to: 'compose',
    },
];

export default function Overview() {
    const { accounts, providers, connected, loading } = useSocial();
    const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null);
    const [needsHuman, setNeedsHuman] = useState<SocialComment[]>([]);

    useEffect(() => {
        if (!connected) return;
        void (async () => {
            const [stats, comments] = await Promise.all([
                socialApi.analytics(30).catch(() => null),
                socialApi.listComments({ status: 'needs_human' }).catch(() => []),
            ]);
            setAnalytics(stats);
            setNeedsHuman(comments);
        })();
    }, [connected]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Live state, once there is something to show. */}
            {connected && (
                <>
                    {needsHuman.length > 0 && (
                        <Link to="inbox"
                            className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100/70">
                            <div className="flex items-center gap-3">
                                <Zap size={16} className="text-amber-600" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900">
                                        {needsHuman.length} {needsHuman.length === 1 ? 'comment needs' : 'comments need'} you
                                    </p>
                                    <p className="text-xs text-amber-800">
                                        Flagged as a complaint or something urgent — no automatic
                                        reply was sent.
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-amber-700">Open inbox →</span>
                        </Link>
                    )}

                    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: 'Reach (30 days)', value: formatMetric(analytics?.totals.reach) },
                            { label: 'Engagements', value: formatMetric(analytics?.totals.likes) },
                            { label: 'Posts this month', value: String(analytics?.usage.posts_this_month ?? 0) },
                            { label: 'Accounts', value: String(accounts.length) },
                        ].map((tile) => (
                            <div key={tile.label}
                                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <p className="text-xl font-semibold tracking-tight text-gray-900">
                                    {tile.value}
                                </p>
                                <p className="mt-0.5 text-[11px] text-gray-500">{tile.label}</p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-900">Your accounts</h2>
                            <Link to="connections" className="text-xs text-lumicoria-purple hover:underline">
                                Manage
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {accounts.map((account) => (
                                <span key={account.id}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700">
                                    {account.avatar_url
                                        ? <img src={account.avatar_url} alt="" className="h-4 w-4 rounded-full" />
                                        : <Users size={12} className="text-gray-400" />}
                                    {account.display_name || account.handle}
                                    <Badge variant="outline" className="text-[9px]">
                                        {PLATFORM_LABELS[account.provider]}
                                    </Badge>
                                </span>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* The pitch, for anyone who has not connected yet. */}
            {!connected && (
                <section className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900">
                        Stop living in notifications
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                        Connect the accounts you post from. Write once and publish
                        everywhere, let the repetitive comments answer themselves, and keep
                        every conversation in one place.
                    </p>
                    <Link to="connections">
                        <Button className="mt-4" size="sm">Connect your first account</Button>
                    </Link>

                    {/* Which platforms are live right now — honest about approvals
                        still in progress rather than showing a dead button. */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {Array.from(new Set(providers.map((p) => p.platform))).map((platform) => {
                            const ready = providers.some(
                                (p) => p.platform === platform && p.configured);
                            return (
                                <span key={platform}
                                    className={`rounded-full border px-3 py-1 text-xs ${ready
                                        ? 'border-gray-200 text-gray-700'
                                        : 'border-dashed border-gray-200 text-gray-400'}`}>
                                    {PLATFORM_LABELS[platform as PlatformKey]}
                                    {!ready && ' · coming soon'}
                                </span>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* What it does — always shown, because it is the map of the product. */}
            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-900">What this does</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {CAPABILITIES.map(({ icon: Icon, title, body, to }) => (
                        <Link key={title} to={to}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-lumicoria-purple/40">
                            <Icon size={17} className="text-lumicoria-purple" />
                            <h3 className="mt-2.5 text-sm font-medium text-gray-900">{title}</h3>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500">{body}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Set expectations before they are disappointed by them. */}
            <section className="rounded-2xl bg-gray-50 p-5">
                <h2 className="text-sm font-medium text-gray-900">Worth knowing</h2>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600">
                    <li>
                        Automatic replies start switched off. Turn them on per account once
                        you have seen what they would say.
                    </li>
                    <li>
                        Complaints and anything urgent are never answered automatically —
                        they go to your inbox, flagged, whatever your rules say.
                    </li>
                    <li>
                        LinkedIn personal profiles can publish, but LinkedIn shares no reach
                        figures or comments for them with anyone. A Company Page gives you both.
                    </li>
                    <li>
                        Sending someone a private message after they comment works on
                        Instagram and Facebook. Elsewhere the reply goes under the post.
                    </li>
                </ul>
            </section>
        </div>
    );
}
