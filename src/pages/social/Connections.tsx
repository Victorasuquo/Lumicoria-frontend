/**
 * Connect and manage social accounts.
 *
 * The job of this page is to be honest *before* someone commits. Platforms
 * differ enormously — a LinkedIn personal profile can publish but will never
 * return reach data or a single comment — and the moment to say so is on the
 * connect card, not in a support reply after they have paid.
 *
 * Everything shown here comes from the backend capability table rather than
 * being restated in the UI, so a platform's real limits and this page cannot
 * drift apart.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
    AlertTriangle, Check, Link2, Loader2, MessageSquare,
    RefreshCw, Shield, Trash2, TriangleAlert,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    PLATFORM_LABELS, type ConnectableAccount, type PlatformKey,
    type ProviderCapability, type ReplyMode, type SocialAccount,
    capabilitySummary, socialApi, socialError,
} from '@/services/socialApi';

const REPLY_MODE_LABELS: Record<ReplyMode, string> = {
    manual: 'Manual only',
    rules_only: 'Keyword rules',
    rules_then_ai: 'Rules, then AI',
    ai: 'AI answers everything',
};

const REPLY_MODE_HELP: Record<ReplyMode, string> = {
    manual: 'Nothing is sent automatically. Everything waits for you.',
    rules_only: 'Only your keyword rules reply. No AI involved.',
    rules_then_ai: 'Rules answer first; the AI handles what is left.',
    ai: 'The AI answers everything your rules do not catch first.',
};

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expired: 'bg-amber-50 text-amber-700 border-amber-200',
    revoked: 'bg-gray-100 text-gray-600 border-gray-200',
    error: 'bg-red-50 text-red-700 border-red-200',
};

export default function Connections() {
    const [providers, setProviders] = useState<ProviderCapability[]>([]);
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<PlatformKey | null>(null);
    const [choices, setChoices] = useState<{ state: string; accounts: ConnectableAccount[] } | null>(null);

    const load = useCallback(async () => {
        try {
            const [caps, connected] = await Promise.all([
                socialApi.listProviders(),
                socialApi.listAccounts(),
            ]);
            setProviders(caps.providers);
            setAccounts(connected.filter((a) => a.status !== 'revoked'));
        } catch (error) {
            toast.error(socialError(error, 'Could not load your connections'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    /** One card per platform, carrying its most capable account kind. */
    const platformCards = useMemo(() => {
        const byPlatform = new Map<PlatformKey, ProviderCapability>();
        for (const cap of providers) {
            const existing = byPlatform.get(cap.platform);
            // Prefer the kind that can do the most — that is what the connect
            // button will actually offer.
            const score = (c: ProviderCapability) =>
                Number(c.publish_analytics) + Number(c.read_comments) + Number(c.direct_messages);
            if (!existing || score(cap) > score(existing)) byPlatform.set(cap.platform, cap);
        }
        return Array.from(byPlatform.values()).sort((a, b) =>
            PLATFORM_LABELS[a.platform].localeCompare(PLATFORM_LABELS[b.platform]));
    }, [providers]);

    const startConnect = async (platform: PlatformKey) => {
        setConnecting(platform);
        try {
            const { authorize_url, state } = await socialApi.startOAuth(platform);
            // A popup keeps the app mounted, so returning from the platform
            // lands the customer back where they were rather than on a reload.
            const popup = window.open(authorize_url, 'lumicoria-social-oauth',
                'width=680,height=760,menubar=no,toolbar=no');
            if (!popup) {
                toast.error('Allow popups for this site, then try connecting again.');
                return;
            }
            toast.info(`Approve access in the ${PLATFORM_LABELS[platform]} window.`);
            sessionStorage.setItem('lumicoria.social.oauth_state', state);
        } catch (error) {
            toast.error(socialError(error, `Could not start the ${platform} connection`));
        } finally {
            setConnecting(null);
        }
    };

    const confirmAccount = async (account: ConnectableAccount) => {
        if (!choices) return;
        try {
            await socialApi.connectAccount({ ...account, state: choices.state });
            toast.success(`${account.display_name || account.handle} connected`);
            setChoices(null);
            await load();
        } catch (error) {
            toast.error(socialError(error, 'Could not connect that account'));
        }
    };

    const changeReplyMode = async (account: SocialAccount, mode: ReplyMode) => {
        const previous = account.reply_mode;
        setAccounts((rows) => rows.map((r) =>
            r.id === account.id ? { ...r, reply_mode: mode } : r));
        try {
            await socialApi.updateAccount(account.id, { reply_mode: mode });
            toast.success(`${account.display_name || 'Account'}: ${REPLY_MODE_LABELS[mode]}`);
        } catch (error) {
            // Put the old value back rather than leaving the UI claiming a
            // setting the server never accepted.
            setAccounts((rows) => rows.map((r) =>
                r.id === account.id ? { ...r, reply_mode: previous } : r));
            toast.error(socialError(error, 'Could not change the reply mode'));
        }
    };

    const disconnect = async (account: SocialAccount) => {
        try {
            await socialApi.disconnectAccount(account.id);
            setAccounts((rows) => rows.filter((r) => r.id !== account.id));
            toast.success('Disconnected, and the stored access was destroyed.');
        } catch (error) {
            toast.error(socialError(error, 'Could not disconnect that account'));
        }
    };

    const capabilityFor = (account: SocialAccount) =>
        providers.find((p) => p.platform === account.provider && p.kind === account.kind);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading connections
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Connected accounts</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Connect the accounts you post from. What each platform gives back
                    differs — the details are on every card, before you connect.
                </p>
            </header>

            {/* Connected */}
            {accounts.length > 0 && (
                <section className="mb-10 space-y-3">
                    {accounts.map((account) => {
                        const cap = capabilityFor(account);
                        const cooling = account.automation_allowed_from
                            && new Date(account.automation_allowed_from) > new Date();
                        return (
                            <div key={account.id}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        {account.avatar_url
                                            ? <img src={account.avatar_url} alt=""
                                                className="h-11 w-11 rounded-full object-cover" />
                                            : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                                                {PLATFORM_LABELS[account.provider][0]}
                                            </div>}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {account.display_name || account.handle || 'Account'}
                                                </span>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {PLATFORM_LABELS[account.provider]}
                                                </Badge>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[account.status]}`}>
                                                    {account.status}
                                                </span>
                                            </div>
                                            {cap && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {capabilitySummary(cap)}
                                                </p>
                                            )}
                                            {account.last_error && (
                                                <p className="mt-1 text-xs text-red-600">{account.last_error}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={account.reply_mode}
                                            onChange={(e) => changeReplyMode(account, e.target.value as ReplyMode)}
                                            disabled={!cap?.read_comments}
                                            title={cap?.read_comments
                                                ? REPLY_MODE_HELP[account.reply_mode]
                                                : `${PLATFORM_LABELS[account.provider]} does not expose comments to us`}
                                            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-900 outline-none transition-colors focus:border-lumicoria-purple disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                        >
                                            {(Object.keys(REPLY_MODE_LABELS) as ReplyMode[]).map((mode) => (
                                                <option key={mode} value={mode}>{REPLY_MODE_LABELS[mode]}</option>
                                            ))}
                                        </select>
                                        <Button variant="ghost" size="sm"
                                            onClick={() => disconnect(account)}
                                            className="text-gray-400 hover:text-red-600">
                                            <Trash2 size={15} />
                                        </Button>
                                    </div>
                                </div>

                                {/* The two things that most often surprise people. */}
                                {cooling && (
                                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                        <Shield size={13} className="mt-0.5 shrink-0" />
                                        Automatic replies stay off for the first 24 hours, so a new
                                        rule cannot fire across everything you have ever posted.
                                    </p>
                                )}
                                {cap && !cap.publish_analytics && (
                                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                        <TriangleAlert size={13} className="mt-0.5 shrink-0" />
                                        {PLATFORM_LABELS[account.provider]} does not give us reach or
                                        impression figures for this kind of account. You can post,
                                        but this account will show no numbers.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </section>
            )}

            {/* Available to connect */}
            <section>
                <h2 className="mb-3 text-sm font-medium text-gray-900">Add an account</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {platformCards.map((cap) => {
                        const already = accounts.filter((a) => a.provider === cap.platform).length;
                        return (
                            <div key={cap.platform}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
                                                {PLATFORM_LABELS[cap.platform]}
                                            </span>
                                            {already > 0 && (
                                                <span className="text-[10px] text-gray-400">
                                                    {already} connected
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {capabilitySummary(cap)}
                                        </p>
                                    </div>
                                    <Button size="sm"
                                        disabled={!cap.configured || connecting === cap.platform}
                                        onClick={() => startConnect(cap.platform)}>
                                        {connecting === cap.platform
                                            ? <Loader2 size={14} className="animate-spin" />
                                            : <Link2 size={14} />}
                                        <span className="ml-1.5">Connect</span>
                                    </Button>
                                </div>

                                {/* Honest about why a platform is unavailable. Approvals
                                    land one at a time, and a greyed-out button with no
                                    explanation reads as a bug. */}
                                {!cap.configured && (
                                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                        Not available yet — we are still completing
                                        {' '}{PLATFORM_LABELS[cap.platform]}'s approval process.
                                    </p>
                                )}
                                {cap.configured && cap.reply_private && (
                                    <p className="mt-3 flex items-start gap-2 text-xs text-emerald-700">
                                        <MessageSquare size={13} className="mt-0.5 shrink-0" />
                                        Supports "comment a keyword, get sent a message".
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Account picker after an OAuth exchange */}
            {choices && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-medium text-gray-900">Choose what to connect</h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Pick only the accounts you want us to post to.
                        </p>
                        <div className="mt-4 space-y-2">
                            {choices.accounts.map((account) => (
                                <button key={`${account.platform}-${account.external_account_id}`}
                                    onClick={() => confirmAccount(account)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 text-left transition-colors hover:border-lumicoria-purple hover:bg-purple-50/40">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
                                        {PLATFORM_LABELS[account.platform][0]}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm text-gray-900">
                                            {account.display_name || account.handle}
                                        </span>
                                        <span className="block text-[11px] text-gray-400">
                                            {PLATFORM_LABELS[account.platform]} · {account.kind}
                                        </span>
                                    </span>
                                    <Check size={15} className="text-gray-300" />
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-4 w-full"
                            onClick={() => setChoices(null)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <footer className="mt-10 flex items-center justify-between border-t border-gray-100 pt-5 text-xs text-gray-400">
                <span>Access is encrypted and never shown back to you or anyone else.</span>
                <Link to="../rules" className="inline-flex items-center gap-1 hover:text-lumicoria-purple">
                    <RefreshCw size={12} /> Reply rules
                </Link>
            </footer>
        </div>
    );
}
