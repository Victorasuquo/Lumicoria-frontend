/**
 * Keyword reply rules, and the tester that makes them trustworthy.
 *
 * This is the "comment K to get the link" feature. The live tester matters
 * more than it looks: a rule author types one sample, sees exactly which rule
 * wins and the exact text that would be sent, and finds out *before* it fires
 * on a real audience rather than after.
 *
 * The private-reply channel is only offered where the platform actually
 * supports a DM to a commenter — Instagram and Facebook. Offering it elsewhere
 * would let someone build a rule that silently degrades at send time.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    FlaskConical, Loader2, MessageSquare, Plus, Send, Trash2, TriangleAlert,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    PLATFORM_LABELS, type ProviderCapability, type ReplyChannel, type ReplyRule,
    type RuleTestResult, type SocialAccount, type TriggerType,
    socialApi, socialError,
} from '@/services/socialApi';

const TRIGGER_HELP: Record<TriggerType, string> = {
    exact: 'The whole comment is this word. "K", "k!" and "k 🙏" all match.',
    contains: 'The comment mentions this anywhere.',
    regex: 'Advanced pattern matching.',
};

export default function Rules() {
    const [rules, setRules] = useState<ReplyRule[]>([]);
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [providers, setProviders] = useState<ProviderCapability[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [trigger, setTrigger] = useState('');
    const [triggerType, setTriggerType] = useState<TriggerType>('exact');
    const [body, setBody] = useState('');
    const [link, setLink] = useState('');
    const [channel, setChannel] = useState<ReplyChannel>('public');
    const [accountId, setAccountId] = useState('');

    const [sample, setSample] = useState('');
    const [testResult, setTestResult] = useState<RuleTestResult | null>(null);
    const [testing, setTesting] = useState(false);

    const load = useCallback(async () => {
        try {
            const [r, a, p] = await Promise.all([
                socialApi.listRules(),
                socialApi.listAccounts(),
                socialApi.listProviders(),
            ]);
            setRules(r);
            setAccounts(a.filter((x) => x.status === 'active'));
            setProviders(p.providers);
        } catch (error) {
            toast.error(socialError(error, 'Could not load your rules'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    /** Whether the chosen account's platform can DM a commenter at all. */
    const privateReplyAvailable = (() => {
        if (!accountId) return providers.some((p) => p.reply_private);
        const account = accounts.find((a) => a.id === accountId);
        if (!account) return false;
        return Boolean(providers.find(
            (p) => p.platform === account.provider && p.kind === account.kind)?.reply_private);
    })();

    const create = async () => {
        if (!trigger.trim() || !body.trim()) return;
        setCreating(true);
        try {
            await socialApi.createRule({
                trigger, trigger_type: triggerType, body,
                link: link || undefined,
                channel: privateReplyAvailable ? channel : 'public',
                account_id: accountId || undefined,
            });
            toast.success('Rule created');
            setTrigger(''); setBody(''); setLink(''); setTestResult(null);
            await load();
        } catch (error) {
            toast.error(socialError(error, 'Could not create that rule'));
        } finally {
            setCreating(false);
        }
    };

    const runTest = async () => {
        if (!sample.trim()) return;
        setTesting(true);
        try {
            setTestResult(await socialApi.testRules(sample, accountId || undefined));
        } catch (error) {
            toast.error(socialError(error, 'Could not test that comment'));
        } finally {
            setTesting(false);
        }
    };

    const remove = async (rule: ReplyRule) => {
        try {
            await socialApi.deleteRule(rule.id);
            setRules((rows) => rows.filter((r) => r.id !== rule.id));
            toast.success('Rule deleted');
        } catch (error) {
            toast.error(socialError(error, 'Could not delete that rule'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading rules
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Automatic replies</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Set a word people can comment, and what they get back. Test it
                    here before it ever reaches anyone.
                </p>
            </header>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* New rule */}
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-medium text-gray-900">New rule</h2>

                    <label className="mb-1 block text-xs text-gray-600">
                        When someone comments
                    </label>
                    <div className="flex gap-2">
                        <input value={trigger} onChange={(e) => setTrigger(e.target.value)}
                            placeholder="K"
                            className="h-9 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                        <select value={triggerType}
                            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                            className="h-9 rounded-md border border-gray-300 px-2 text-xs outline-none focus:border-lumicoria-purple">
                            <option value="exact">is exactly</option>
                            <option value="contains">contains</option>
                            <option value="regex">matches pattern</option>
                        </select>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">{TRIGGER_HELP[triggerType]}</p>

                    <label className="mb-1 mt-4 block text-xs text-gray-600">Send them</label>
                    <Textarea value={body} rows={3}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Hi {{first_name}}, here's the link: {{link}}"
                        className="text-sm" />
                    <p className="mt-1 text-[11px] text-gray-400">
                        Use <code>{'{{first_name}}'}</code> and <code>{'{{link}}'}</code> to
                        personalise.
                    </p>

                    <label className="mb-1 mt-4 block text-xs text-gray-600">Link</label>
                    <input value={link} onChange={(e) => setLink(e.target.value)}
                        placeholder="https://…"
                        className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />

                    <label className="mb-1 mt-4 block text-xs text-gray-600">On</label>
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
                        className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-lumicoria-purple">
                        <option value="">Every account</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.display_name || account.handle} · {PLATFORM_LABELS[account.provider]}
                            </option>
                        ))}
                    </select>

                    <label className="mb-1 mt-4 block text-xs text-gray-600">Reply</label>
                    <div className="flex gap-2">
                        {(['public', 'private'] as ReplyChannel[]).map((option) => (
                            <button key={option}
                                disabled={option === 'private' && !privateReplyAvailable}
                                onClick={() => setChannel(option)}
                                className={`flex-1 rounded-md border px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${channel === option
                                    ? 'border-lumicoria-purple bg-purple-50 text-lumicoria-purple'
                                    : 'border-gray-200 text-gray-600'}`}>
                                {option === 'public' ? 'Under the post' : 'In a message'}
                            </button>
                        ))}
                    </div>
                    {/* Said here, at authoring time — not discovered at send time. */}
                    {!privateReplyAvailable && (
                        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-700">
                            <TriangleAlert size={12} className="mt-0.5 shrink-0" />
                            Only Instagram and Facebook let us send a private message to
                            someone who commented. This rule will reply under the post.
                        </p>
                    )}

                    <Button className="mt-5 w-full" size="sm"
                        disabled={creating || !trigger.trim() || !body.trim()}
                        onClick={create}>
                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        <span className="ml-1.5">Create rule</span>
                    </Button>
                </section>

                {/* Live tester */}
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        <FlaskConical size={14} /> Try it
                    </h2>
                    <p className="mb-4 text-xs text-gray-500">
                        Type a comment the way someone really would. See which rule wins
                        and exactly what they would get.
                    </p>

                    <div className="flex gap-2">
                        <input value={sample} onChange={(e) => setSample(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && runTest()}
                            placeholder="k 🙏"
                            className="h-9 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-lumicoria-purple" />
                        <Button size="sm" variant="outline" disabled={testing || !sample.trim()}
                            onClick={runTest}>
                            {testing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        </Button>
                    </div>

                    {testResult && (
                        <div className="mt-4">
                            {testResult.matched ? (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                    <p className="text-xs font-medium text-emerald-800">
                                        Matches{testResult.name ? ` "${testResult.name}"` : ''} — they
                                        would get {testResult.channel === 'private'
                                            ? 'a private message' : 'a reply under the post'}:
                                    </p>
                                    <p className="mt-2 whitespace-pre-line rounded-lg bg-white px-3 py-2 text-sm text-gray-800">
                                        {testResult.rendered}
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-600">
                                        No rule matches this. Nothing would be sent automatically —
                                        it would wait for you in the inbox.
                                    </p>
                                    {testResult.normalized && (
                                        <p className="mt-1.5 text-[11px] text-gray-400">
                                            We read that comment as: "{testResult.normalized}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Existing rules */}
            <section className="mt-8">
                <h2 className="mb-3 text-sm font-medium text-gray-900">
                    Your rules {rules.length > 0 && (
                        <span className="text-gray-400">({rules.length})</span>
                    )}
                </h2>
                {rules.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                        No rules yet. Every comment waits for you in the inbox.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {rules.map((rule) => (
                            <div key={rule.id}
                                className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">
                                            {rule.trigger}
                                        </code>
                                        <Badge variant="outline" className="text-[10px]">
                                            {rule.channel === 'private' ? 'message' : 'reply'}
                                        </Badge>
                                        {rule.match_count > 0 && (
                                            <span className="text-[10px] text-gray-400">
                                                used {rule.match_count} times
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1.5 truncate text-sm text-gray-700">{rule.body}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => remove(rule)}
                                    className="text-gray-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <p className="mt-8 flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                <MessageSquare size={13} className="mt-0.5 shrink-0" />
                Complaints and anything urgent are never answered automatically — they
                go straight to your inbox, flagged, whatever your rules say.
            </p>
        </div>
    );
}
