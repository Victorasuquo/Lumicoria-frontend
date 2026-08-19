/**
 * Write once, publish natively everywhere.
 *
 * The point of this page is that a caption which works on LinkedIn dies on X.
 * You write the idea, the agent returns a version shaped for each account you
 * picked, and every version stays independently editable — because the whole
 * value is lost if the customer has to accept them as generated.
 *
 * Character limits are enforced live from the backend capability table rather
 * than hardcoded here, so a platform changing its cap does not leave this page
 * quietly wrong.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    CalendarClock, Loader2, Send, Sparkles, TriangleAlert, Wand2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    PLATFORM_LABELS, type ProviderCapability, type SocialAccount,
    socialApi, socialError,
} from '@/services/socialApi';

interface VariantDraft {
    accountId: string;
    body: string;
    firstComment: string;
}

export default function Composer() {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [providers, setProviders] = useState<ProviderCapability[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [idea, setIdea] = useState('');
    const [variants, setVariants] = useState<Record<string, VariantDraft>>({});
    const [adapting, setAdapting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [scheduleAt, setScheduleAt] = useState('');

    useEffect(() => {
        void (async () => {
            try {
                const [rows, caps] = await Promise.all([
                    socialApi.listAccounts(),
                    socialApi.listProviders(),
                ]);
                setAccounts(rows.filter((a) => a.status === 'active'));
                setProviders(caps.providers);
            } catch (error) {
                toast.error(socialError(error, 'Could not load your accounts'));
            }
        })();
    }, []);

    const capFor = useCallback((account: SocialAccount) =>
        providers.find((p) => p.platform === account.provider && p.kind === account.kind),
        [providers]);

    const toggle = (id: string) => {
        setSelected((current) => current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id]);
    };

    /** Ask the agent for one native version per selected platform. */
    const adapt = async () => {
        if (!idea.trim() || selected.length === 0) return;
        setAdapting(true);
        try {
            const platforms = Array.from(new Set(
                selected.map((id) => accounts.find((a) => a.id === id)?.provider)
                    .filter(Boolean) as string[]));
            const { variants: generated } = await socialApi.adaptForPlatforms({
                idea, platforms,
            });

            const next: Record<string, VariantDraft> = { ...variants };
            for (const accountId of selected) {
                const account = accounts.find((a) => a.id === accountId);
                if (!account) continue;
                const match = generated.find((v) => v.platform === account.provider);
                if (match?.error) {
                    toast.error(`${PLATFORM_LABELS[account.provider]}: ${match.error}`);
                    continue;
                }
                next[accountId] = {
                    accountId,
                    body: match?.body ?? idea,
                    firstComment: next[accountId]?.firstComment ?? '',
                };
            }
            setVariants(next);
            toast.success('Versions ready — edit anything before you post');
        } catch (error) {
            toast.error(socialError(error, 'Could not adapt that idea'));
        } finally {
            setAdapting(false);
        }
    };

    const setVariantField = (accountId: string, field: keyof VariantDraft, value: string) => {
        setVariants((current) => ({
            ...current,
            [accountId]: {
                accountId,
                body: field === 'body' ? value : current[accountId]?.body ?? '',
                firstComment: field === 'firstComment' ? value : current[accountId]?.firstComment ?? '',
            },
        }));
    };

    const ready = useMemo(
        () => selected.filter((id) => (variants[id]?.body || '').trim().length > 0),
        [selected, variants]);

    const save = async (thenSchedule: boolean) => {
        if (ready.length === 0) return;
        setSaving(true);
        try {
            const { id, warnings } = await socialApi.createPost({
                idea,
                variants: ready.map((accountId) => ({
                    account_id: accountId,
                    body: variants[accountId].body,
                    first_comment: variants[accountId].firstComment || undefined,
                })),
            });
            // Warnings are advisory — a cropped image or too many hashtags is
            // worth saying but not worth blocking a draft over.
            warnings.forEach((warning) => toast.warning(warning));

            if (thenSchedule && scheduleAt) {
                await socialApi.submitPost(id);
                toast.info('Sent for approval. Approve it to schedule.');
            } else {
                toast.success('Draft saved');
            }
            setIdea('');
            setVariants({});
            setSelected([]);
        } catch (error) {
            toast.error(socialError(error, 'Could not save that post'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Write a post</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Write it once. We shape a version for each platform, and you edit
                    anything that is not right.
                </p>
            </header>

            {accounts.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                    Connect an account first.
                </p>
            ) : (
                <>
                    <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <label className="mb-2 block text-xs font-medium text-gray-700">
                            Post to
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {accounts.map((account) => (
                                <button key={account.id} onClick={() => toggle(account.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${selected.includes(account.id)
                                        ? 'border-lumicoria-purple bg-purple-50 text-lumicoria-purple'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                    {account.display_name || account.handle}
                                    <Badge variant="outline" className="text-[9px]">
                                        {PLATFORM_LABELS[account.provider]}
                                    </Badge>
                                </button>
                            ))}
                        </div>

                        <label className="mb-2 mt-5 block text-xs font-medium text-gray-700">
                            Your idea
                        </label>
                        <Textarea value={idea} rows={3}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="What do you want to say?"
                            className="text-sm" />

                        <Button className="mt-3" size="sm"
                            disabled={adapting || !idea.trim() || selected.length === 0}
                            onClick={adapt}>
                            {adapting ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                            <span className="ml-1.5">
                                Shape for {selected.length || 'each'} platform{selected.length === 1 ? '' : 's'}
                            </span>
                        </Button>
                    </section>

                    {/* One editable card per target account. */}
                    <div className="space-y-3">
                        {selected.map((accountId) => {
                            const account = accounts.find((a) => a.id === accountId);
                            if (!account) return null;
                            const cap = capFor(account);
                            const draft = variants[accountId];
                            const length = draft?.body.length ?? 0;
                            const limit = cap?.max_body_chars ?? 3000;
                            const over = length > limit;

                            return (
                                <div key={accountId}
                                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {account.display_name || account.handle}
                                            </span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {PLATFORM_LABELS[account.provider]}
                                            </Badge>
                                        </div>
                                        <span className={`text-[11px] ${over ? 'text-red-600' : 'text-gray-400'}`}>
                                            {length} / {limit}
                                        </span>
                                    </div>

                                    <Textarea value={draft?.body ?? ''} rows={4}
                                        onChange={(e) => setVariantField(accountId, 'body', e.target.value)}
                                        placeholder={`Write the ${PLATFORM_LABELS[account.provider]} version…`}
                                        className={`text-sm ${over ? 'border-red-300' : ''}`} />

                                    {over && (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                                            <TriangleAlert size={12} />
                                            {PLATFORM_LABELS[account.provider]} will reject this — trim
                                            {' '}{length - limit} characters.
                                        </p>
                                    )}

                                    {/* First comment only where the platform supports it,
                                        and explained: a link in the caption suppresses
                                        reach on Instagram and LinkedIn. */}
                                    {cap?.first_comment && (
                                        <div className="mt-3">
                                            <label className="mb-1 block text-[11px] text-gray-500">
                                                First comment — put links here so they do not
                                                hurt the post's reach
                                            </label>
                                            <input type="text" value={draft?.firstComment ?? ''}
                                                onChange={(e) => setVariantField(accountId, 'firstComment', e.target.value)}
                                                placeholder="https://…"
                                                className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {ready.length > 0 && (
                        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <input type="datetime-local" value={scheduleAt}
                                onChange={(e) => setScheduleAt(e.target.value)}
                                className="h-9 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                            <Button size="sm" disabled={saving} onClick={() => save(false)}>
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                <span className="ml-1.5">Save draft</span>
                            </Button>
                            <Button size="sm" variant="outline" disabled={saving || !scheduleAt}
                                onClick={() => save(true)}>
                                <CalendarClock size={13} />
                                <span className="ml-1.5">Send for approval</span>
                            </Button>
                            <span className="text-[11px] text-gray-400">
                                Posts are reviewed before they go out.
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
