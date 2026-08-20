/**
 * The publishing calendar.
 *
 * Drafts and awaiting-approval appear alongside scheduled and published, on
 * purpose: the gaps are what a manager comes here to see. A calendar showing
 * only committed posts hides the fact that Thursday to Saturday is empty,
 * which is the single most useful thing it could tell you.
 *
 * Everything renders in the browser's timezone from stored UTC. Publishing
 * times are wall-clock statements — "9am Tuesday" — so the conversion happens
 * at the edge and never by adding a fixed offset, which drifts an hour across
 * a daylight-saving boundary.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, PenLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/social/PlatformIcon';
import {
    type CalendarPost, type PlatformKey, type PostStatus,
    socialError, socialExtras, socialSchedule,
} from '@/services/socialApi';

const STATUS_STYLE: Record<PostStatus, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    in_review: 'bg-amber-50 text-amber-700 border-amber-200',
    changes_requested: 'bg-orange-50 text-orange-700 border-orange-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    scheduled: 'bg-purple-50 text-lumicoria-purple border-purple-200',
    publishing: 'bg-purple-50 text-lumicoria-purple border-purple-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday-first grid covering the whole month, padded to complete weeks. */
function monthGrid(anchor: Date): Date[] {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // shift Sunday=0 to Monday=0
    const start = new Date(first);
    start.setDate(first.getDate() - offset);

    return Array.from({ length: 42 }, (_, i) => {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        return day;
    });
}

/** Only an approved or scheduled post has a time worth moving. */
const movable = (post: CalendarPost) =>
    post.status === 'scheduled' || post.status === 'approved';

const dayKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function Calendar() {
    const [anchor, setAnchor] = useState(() => new Date());
    const [posts, setPosts] = useState<CalendarPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [dragging, setDragging] = useState<CalendarPost | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    const days = useMemo(() => monthGrid(anchor), [anchor]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const from = days[0];
            const to = new Date(days[days.length - 1]);
            to.setDate(to.getDate() + 1);
            setPosts(await socialExtras.calendar(from.toISOString(), to.toISOString()));
        } catch (error) {
            toast.error(socialError(error, 'Could not load your calendar'));
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { void load(); }, [load]);

    const byDay = useMemo(() => {
        const map = new Map<string, CalendarPost[]>();
        for (const post of posts) {
            if (!post.calendar_at) continue;
            const key = dayKey(post.calendar_at);
            map.set(key, [...(map.get(key) ?? []), post]);
        }
        return map;
    }, [posts]);

    /** Consecutive empty weekdays in the future — the reason to look at all. */
    const gaps = useMemo(() => {
        const today = dayKey(new Date());
        const upcoming = days.filter(
            (d) => dayKey(d) >= today && d.getMonth() === anchor.getMonth());
        const empty = upcoming.filter((d) => !byDay.has(dayKey(d)));
        return empty.length;
    }, [days, byDay, anchor]);

    /**
     * Drop a post on a new day.
     *
     * Keeps the original time of day and moves only the date — someone
     * dragging a post from Tuesday to Thursday means "same slot, different
     * day", not "9am becomes whenever I released the mouse".
     *
     * Only scheduled or approved posts can move; a draft has no time to keep
     * and a published post cannot be unpublished.
     */
    const drop = async (day: Date) => {
        const post = dragging;
        setDragging(null);
        setDropTarget(null);
        if (!post) return;

        if (!['scheduled', 'approved'].includes(post.status)) {
            toast.error(
                post.status === 'published'
                    ? 'That one has already gone out.'
                    : 'Only approved posts can be scheduled. Approve it first.');
            return;
        }

        const original = new Date(post.calendar_at);
        const target = new Date(day);
        target.setHours(original.getHours(), original.getMinutes(), 0, 0);

        if (target <= new Date()) {
            toast.error('Pick a day in the future.');
            return;
        }

        // Move it on screen first, then reconcile. Waiting on the network
        // makes a drag feel broken even when it works.
        const previous = posts;
        setPosts((rows) => rows.map((r) =>
            r.id === post.id ? { ...r, calendar_at: target.toISOString() } : r));
        try {
            await socialSchedule.reschedule(post.id, target);
            toast.success(`Moved to ${target.toLocaleDateString(undefined, {
                weekday: 'long', day: 'numeric', month: 'short' })}`);
        } catch (error) {
            setPosts(previous);
            toast.error(socialError(error, 'Could not move that post'));
        }
    };

    const move = (months: number) => {
        const next = new Date(anchor);
        next.setMonth(anchor.getMonth() + months);
        setAnchor(next);
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {anchor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Drafts and posts awaiting approval are shown too, so you can
                        see what is coming and what is missing. Drag a scheduled
                        post to another day to move it.
                    </p>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => move(-1)}>
                        <ChevronLeft size={14} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => move(1)}>
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </header>

            {gaps > 3 && (
                <p className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
                    <CalendarDays size={13} className="shrink-0" />
                    {gaps} days left this month with nothing planned.
                    <Link to=".." className="font-medium underline underline-offset-2">
                        Write something
                    </Link>
                </p>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/60">
                        {WEEKDAYS.map((day) => (
                            <div key={day}
                                className="px-2 py-2 text-center text-[11px] font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {days.map((day) => {
                            const key = dayKey(day);
                            const items = byDay.get(key) ?? [];
                            const otherMonth = day.getMonth() !== anchor.getMonth();
                            const isToday = key === dayKey(new Date());

                            return (
                                <div key={key}
                                    onDragOver={(e) => {
                                        if (!dragging) return;
                                        e.preventDefault();
                                        setDropTarget(key);
                                    }}
                                    onDragLeave={() => setDropTarget((c) => (c === key ? null : c))}
                                    onDrop={(e) => { e.preventDefault(); void drop(day); }}
                                    className={`min-h-[92px] border-b border-r border-gray-100 p-1.5 transition-colors last:border-r-0 ${otherMonth ? 'bg-gray-50/40' : ''} ${dropTarget === key ? 'bg-purple-50 ring-1 ring-inset ring-lumicoria-purple' : ''}`}>
                                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${isToday
                                        ? 'bg-lumicoria-purple font-medium text-white'
                                        : otherMonth ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {day.getDate()}
                                    </span>

                                    <div className="mt-1 space-y-1">
                                        {items.slice(0, 3).map((post) => {
                                            const provider = post.variants?.[0]?.provider;
                                            return (
                                                <div key={post.id}
                                                    draggable={movable(post)}
                                                    onDragStart={() => setDragging(post)}
                                                    onDragEnd={() => { setDragging(null); setDropTarget(null); }}
                                                    title={movable(post)
                                                        ? 'Drag to another day to move it'
                                                        : post.idea ?? post.variants?.[0]?.body ?? ''}
                                                    className={`flex items-center gap-1 truncate rounded border px-1 py-0.5 text-[10px] ${STATUS_STYLE[post.status]} ${movable(post) ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging?.id === post.id ? 'opacity-40' : ''}`}>
                                                    {provider && (
                                                        <PlatformIcon
                                                            platform={provider as PlatformKey}
                                                            size={10} />
                                                    )}
                                                    <span className="truncate">
                                                        {post.idea || post.variants?.[0]?.body || 'Post'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {items.length > 3 && (
                                            <p className="px-1 text-[10px] text-gray-400">
                                                +{items.length - 3} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                {(['draft', 'in_review', 'scheduled', 'published', 'failed'] as PostStatus[])
                    .map((status) => (
                        <span key={status} className="inline-flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded border ${STATUS_STYLE[status]}`} />
                            {status.replace('_', ' ')}
                        </span>
                    ))}
                <Link to=".." className="ml-auto inline-flex items-center gap-1 text-lumicoria-purple hover:underline">
                    <PenLine size={11} /> Write a post
                </Link>
            </div>
        </div>
    );
}
