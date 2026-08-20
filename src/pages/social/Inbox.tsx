/**
 * The unified inbox: comments, direct messages and mentions in one list.
 *
 * Two things here are not cosmetic.
 *
 * Anything the backend flagged `needs_human` — a complaint, a legal threat, a
 * safety signal — sorts to the top and says why. That flag is the reason the
 * automation never answered it, and burying it would undo the guardrail.
 *
 * DM threads show the time left in the platform's reply window. Meta only
 * permits a business to message someone within 24 hours of *their* last
 * message; a composer that lets you type past that and fails on send is worse
 * than one that tells you up front.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    AlertOctagon, AtSign, Clock, Loader2, MessageCircle,
    Send, Sparkles, StickyNote, TriangleAlert, UserCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlatformIcon } from '@/components/social/PlatformIcon';
import {
    PLATFORM_LABELS, type SocialComment, type SocialConversation,
    type SocialMention, type SocialMessage,
    socialApi, socialError, socialExtras,
} from '@/services/socialApi';

type Tab = 'needs_human' | 'comments' | 'messages' | 'mentions';

const TABS: Array<{ id: Tab; label: string; icon: typeof MessageCircle }> = [
    { id: 'needs_human', label: 'Needs you', icon: AlertOctagon },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'messages', label: 'Messages', icon: Send },
    { id: 'mentions', label: 'Mentions', icon: AtSign },
];

const INTENT_NOTE: Record<string, string> = {
    complaint: 'Flagged as a complaint — no automatic reply was sent.',
    crisis: 'Flagged as urgent — no automatic reply was sent.',
};

function timeAgo(iso?: string | null): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function Inbox() {
    const [tab, setTab] = useState<Tab>('needs_human');
    const [comments, setComments] = useState<SocialComment[]>([]);
    const [conversations, setConversations] = useState<SocialConversation[]>([]);
    const [mentions, setMentions] = useState<SocialMention[]>([]);
    const [messages, setMessages] = useState<SocialMessage[]>([]);
    const [openThread, setOpenThread] = useState<SocialConversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);
    const [claimed, setClaimed] = useState<Set<string>>(new Set());
    const [noteFor, setNoteFor] = useState<string | null>(null);
    const [note, setNote] = useState('');

    const load = useCallback(async () => {
        try {
            const [c, t, m] = await Promise.all([
                socialApi.listComments(),
                socialApi.listConversations().catch(() => [] as SocialConversation[]),
                socialApi.listMentions().catch(() => [] as SocialMention[]),
            ]);
            setComments(c);
            setConversations(t);
            setMentions(m);
        } catch (error) {
            toast.error(socialError(error, 'Could not load your inbox'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const needsHuman = useMemo(
        () => comments.filter((c) => c.status === 'needs_human'),
        [comments]);

    const unreplied = useMemo(
        () => comments.filter((c) => c.status === 'new'),
        [comments]);

    const openConversation = async (thread: SocialConversation) => {
        setOpenThread(thread);
        setMessages([]);
        try {
            setMessages(await socialApi.listMessages(thread.id));
        } catch (error) {
            toast.error(socialError(error, 'Could not open that conversation'));
        }
    };

    /**
     * Take a comment before replying.
     *
     * Losing the race tells you who has it rather than letting you start
     * typing a duplicate — two people answering one customer seconds apart is
     * the failure this exists to prevent.
     */
    const claim = async (comment: SocialComment) => {
        try {
            await socialExtras.claimComment(comment.id);
            setClaimed((current) => new Set(current).add(comment.id));
            setReplyTo(comment.id);
            setDraft('');
        } catch (error) {
            toast.error(socialError(error, 'Someone else is handling this one'));
        }
    };

    const saveNote = async (comment: SocialComment) => {
        if (!note.trim()) return;
        try {
            await socialExtras.addNote(comment.id, note.trim());
            toast.success('Note saved — only your team can see it');
            setNote(''); setNoteFor(null);
        } catch (error) {
            toast.error(socialError(error, 'Could not save that note'));
        }
    };

    const sendReply = async (comment: SocialComment, useAi = false) => {
        setBusy(true);
        try {
            const result = await socialApi.replyToComment(comment.id, {
                body: useAi ? undefined : draft,
                use_ai: useAi,
            });
            if (result.action === 'skipped') {
                // The reply-once invariant fired: somebody, or the automation,
                // already answered. Saying so beats a silent no-op.
                toast.info('That comment already has a reply.');
            } else {
                toast.success('Reply sent');
            }
            setComments((rows) => rows.map((r) =>
                r.id === comment.id ? { ...r, status: 'replied' } : r));
            setReplyTo(null);
            setDraft('');
        } catch (error) {
            toast.error(socialError(error, 'Could not send that reply'));
        } finally {
            setBusy(false);
        }
    };

    const draftWithAi = async (comment: SocialComment) => {
        setBusy(true);
        try {
            const { draft: text } = await socialApi.draftReply(comment.id);
            setDraft(text);
            toast.success('Draft ready — edit it before sending');
        } catch (error) {
            toast.error(socialError(error, 'Could not draft a reply'));
        } finally {
            setBusy(false);
        }
    };

    const sendMessage = async () => {
        if (!openThread || !draft.trim()) return;
        setBusy(true);
        try {
            await socialApi.sendMessage(openThread.id, draft);
            setMessages((rows) => [...rows, {
                id: `local-${Date.now()}`,
                conversation_id: openThread.id,
                direction: 'out',
                body: draft,
                source: 'manual',
                created_at: new Date().toISOString(),
            }]);
            setDraft('');
            toast.success('Message sent');
        } catch (error) {
            toast.error(socialError(error, 'Could not send that message'));
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading inbox
            </div>
        );
    }

    const commentList = tab === 'needs_human' ? needsHuman : unreplied;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Everything people said to you, across every connected account.
                </p>
            </header>

            <div className="mb-5 flex flex-wrap gap-2">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const count = id === 'needs_human' ? needsHuman.length
                        : id === 'comments' ? unreplied.length
                            : id === 'messages' ? conversations.length
                                : mentions.length;
                    return (
                        <button key={id} onClick={() => { setTab(id); setOpenThread(null); }}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${tab === id
                                ? 'border-lumicoria-purple bg-purple-50 text-lumicoria-purple'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            <Icon size={13} />
                            {label}
                            {count > 0 && (
                                <span className={`ml-0.5 rounded-full px-1.5 text-[10px] ${id === 'needs_human'
                                    ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Comments */}
            {(tab === 'needs_human' || tab === 'comments') && (
                <div className="space-y-3">
                    {commentList.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                            {tab === 'needs_human'
                                ? 'Nothing needs you right now.'
                                : 'No unanswered comments.'}
                        </p>
                    )}
                    {commentList.map((comment) => (
                        <div key={comment.id}
                            className={`rounded-2xl border bg-white p-4 shadow-sm ${comment.status === 'needs_human'
                                ? 'border-amber-200' : 'border-gray-100'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span className="font-medium text-gray-900">
                                            {comment.author_handle || 'Someone'}
                                        </span>
                                        <PlatformIcon platform={comment.provider} size={14} />
                                        <span>{timeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="mt-2 whitespace-pre-line text-sm text-gray-800">
                                        {comment.text}
                                    </p>
                                    {comment.intent && INTENT_NOTE[comment.intent] && (
                                        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                                            <TriangleAlert size={12} className="mt-0.5 shrink-0" />
                                            {INTENT_NOTE[comment.intent]}
                                        </p>
                                    )}
                                </div>
                                {replyTo !== comment.id && (
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <Button size="sm" variant="ghost"
                                            title="Add an internal note"
                                            onClick={() => { setNoteFor(comment.id); setNote(''); }}>
                                            <StickyNote size={13} />
                                        </Button>
                                        <Button size="sm" variant="outline"
                                            onClick={() => claim(comment)}>
                                            {claimed.has(comment.id)
                                                ? <><UserCheck size={13} className="mr-1" />Yours</>
                                                : 'Reply'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {noteFor === comment.id && (
                                <div className="mt-3 rounded-xl bg-amber-50/60 p-3">
                                    <Textarea value={note} rows={2}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Internal note — never sent to the platform"
                                        className="bg-white text-sm" />
                                    <div className="mt-2 flex gap-2">
                                        <Button size="sm" disabled={!note.trim()}
                                            onClick={() => saveNote(comment)}>Save note</Button>
                                        <Button size="sm" variant="ghost"
                                            onClick={() => setNoteFor(null)}>Cancel</Button>
                                    </div>
                                </div>
                            )}

                            {replyTo === comment.id && (
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    <Textarea value={draft} rows={3}
                                        onChange={(e) => setDraft(e.target.value)}
                                        placeholder="Write your reply…"
                                        className="text-sm" />
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <Button size="sm" disabled={busy || !draft.trim()}
                                            onClick={() => sendReply(comment)}>
                                            {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                            <span className="ml-1.5">Send</span>
                                        </Button>
                                        <Button size="sm" variant="outline" disabled={busy}
                                            onClick={() => draftWithAi(comment)}>
                                            <Sparkles size={13} />
                                            <span className="ml-1.5">Draft with AI</span>
                                        </Button>
                                        <Button size="sm" variant="ghost"
                                            onClick={() => { setReplyTo(null); setDraft(''); }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Direct messages */}
            {tab === 'messages' && !openThread && (
                <div className="space-y-2">
                    {conversations.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                            No message threads yet. Only Instagram, Facebook and X give
                            us access to direct messages.
                        </p>
                    )}
                    {conversations.map((thread) => (
                        <button key={thread.id} onClick={() => openConversation(thread)}
                            className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-colors hover:border-lumicoria-purple">
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-gray-900">
                                        {thread.participant_handle || 'Conversation'}
                                    </span>
                                    <PlatformIcon platform={thread.provider} size={14} />
                                </span>
                                <span className="mt-0.5 block text-xs text-gray-400">
                                    {timeAgo(thread.last_message_at)}
                                </span>
                            </span>
                            {/* The reply window is the single most useful thing to
                                know before opening a thread. */}
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${thread.window_open
                                ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                <Clock size={10} />
                                {thread.window_open
                                    ? `${thread.window_hours_left}h left`
                                    : 'Window closed'}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {tab === 'messages' && openThread && (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {openThread.participant_handle || 'Conversation'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                                {PLATFORM_LABELS[openThread.provider]}
                            </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setOpenThread(null)}>
                            Back
                        </Button>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto p-4">
                        {messages.map((message) => (
                            <div key={message.id}
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.direction === 'out'
                                    ? 'ml-auto bg-lumicoria-purple text-white'
                                    : 'bg-gray-100 text-gray-800'}`}>
                                {message.body}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 p-4">
                        {openThread.window_open ? (
                            <>
                                <Textarea value={draft} rows={2}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Write a message…" className="text-sm" />
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[11px] text-gray-400">
                                        {openThread.window_hours_left}h left to reply
                                    </span>
                                    <Button size="sm" disabled={busy || !draft.trim()}
                                        onClick={sendMessage}>
                                        {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                        <span className="ml-1.5">Send</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            /* Blocked here rather than at the API, so the reason is
                               something the person can act on. */
                            <p className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                <Clock size={13} className="mt-0.5 shrink-0" />
                                {PLATFORM_LABELS[openThread.provider]} only lets you reply
                                within 24 hours of their last message. They will need to
                                message you again before you can respond.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Mentions */}
            {tab === 'mentions' && (
                <div className="space-y-3">
                    {mentions.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                            Nobody has tagged you recently.
                        </p>
                    )}
                    {mentions.map((mention) => (
                        <div key={mention.id}
                            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-medium text-gray-900">
                                    {mention.author_handle || 'Someone'}
                                </span>
                                <PlatformIcon platform={mention.provider} size={14} />
                                {mention.sentiment === 'negative' && (
                                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-700">
                                        negative
                                    </span>
                                )}
                                <span>{timeAgo(mention.captured_at)}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-800">{mention.text}</p>
                            {mention.permalink && (
                                <a href={mention.permalink} target="_blank" rel="noreferrer"
                                    className="mt-2 inline-block text-xs text-lumicoria-purple hover:underline">
                                    View on {PLATFORM_LABELS[mention.provider]}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
