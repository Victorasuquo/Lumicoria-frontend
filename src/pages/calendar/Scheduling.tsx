/**
 * Host scheduling: /calendar/scheduling
 *
 * Three tabs: the weekly availability that everything else subtracts from,
 * the shareable links, and incoming bookings. Rendered inside MainLayout, so
 * toasts are available here (unlike the public booking page).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Check,
    Copy,
    Link2,
    Loader2,
    Plus,
    Trash2,
    Video,
    X,
} from "lucide-react";
import { toast } from "sonner";
import {
    bookingApi,
    type AvailabilityRule,
    type Booking,
    type BookingType,
} from "@/services/bookingApi";
import { detectTimezone, formatFull, listTimezones, WEEKDAY_LABELS } from "@/lib/timezone";

type Tab = "availability" | "links" | "bookings";

const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-lumicoria-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lumicoria-deepPurple disabled:opacity-60";
const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple";
const input =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple";

interface DayRow {
    enabled: boolean;
    start: string;
    end: string;
}

const DEFAULT_WEEK: DayRow[] = WEEKDAY_LABELS.map((_, i) => ({
    enabled: i < 5, // weekdays on by default
    start: "09:00",
    end: "17:00",
}));

export default function Scheduling() {
    const [tab, setTab] = useState<Tab>("availability");

    const [handle, setHandle] = useState<string | null>(null);
    const [handleDraft, setHandleDraft] = useState("");
    const [savingHandle, setSavingHandle] = useState(false);

    const [week, setWeek] = useState<DayRow[]>(DEFAULT_WEEK);
    const [timezone, setTimezone] = useState(detectTimezone);
    const [savingWeek, setSavingWeek] = useState(false);
    /**
     * Whether any availability exists on the server.
     *
     * The editor pre-fills a sensible week, which looks identical to a saved
     * one. Without this flag a new user reasonably assumes they are already
     * bookable, shares a link, and it shows no times at all.
     */
    const [hasSavedAvailability, setHasSavedAvailability] = useState(true);

    const [types, setTypes] = useState<BookingType[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const timezones = useMemo(listTimezones, []);
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [h, rules, t, b] = await Promise.all([
                bookingApi.getHandle(),
                bookingApi.listAvailability(),
                bookingApi.listTypes(),
                bookingApi.listBookings({ upcoming_only: true }),
            ]);

            setHandle(h.handle);
            setHandleDraft(h.handle || h.suggestion || "");
            setTypes(t);
            setBookings(b);

            setHasSavedAvailability(rules.length > 0);
            if (rules.length) {
                const next = WEEKDAY_LABELS.map((_, i) => {
                    const rule = rules.find((r) => r.weekday === i);
                    return rule
                        ? { enabled: true, start: rule.start_time, end: rule.end_time }
                        : { enabled: false, start: "09:00", end: "17:00" };
                });
                setWeek(next);
                setTimezone(rules[0].timezone || detectTimezone());
            }
        } catch {
            toast.error("Could not load your scheduling settings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const saveHandle = async () => {
        setSavingHandle(true);
        try {
            const res = await bookingApi.setHandle(handleDraft);
            setHandle(res.handle);
            toast.success("Your booking link is ready.");
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "That handle is not available.");
        } finally {
            setSavingHandle(false);
        }
    };

    const saveWeek = async () => {
        // Guard the one input mistake that silently produces zero slots.
        const invalid = week.find((d) => d.enabled && d.start >= d.end);
        if (invalid) {
            toast.error("Each working day must end after it starts.");
            return;
        }

        setSavingWeek(true);
        try {
            await bookingApi.saveAvailability(
                week
                    .map((d, i) => ({ ...d, weekday: i }))
                    .filter((d) => d.enabled)
                    .map((d) => ({
                        weekday: d.weekday,
                        start_time: d.start,
                        end_time: d.end,
                        timezone,
                    })),
            );
            setHasSavedAvailability(week.some((d) => d.enabled));
            toast.success("Availability saved. Your links are live.");
        } catch {
            toast.error("Could not save availability.");
        } finally {
            setSavingWeek(false);
        }
    };

    const createType = async () => {
        try {
            const created = await bookingApi.createType({
                title: "New meeting",
                duration_minutes: 30,
            });
            setTypes((prev) => [...prev, created]);
            toast.success("Booking link created.");
        } catch {
            toast.error("Could not create the link.");
        }
    };

    const patchType = async (id: string, patch: Partial<BookingType>) => {
        try {
            const updated = await bookingApi.updateType(id, patch);
            setTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
        } catch {
            toast.error("Could not save that change.");
        }
    };

    const removeType = async (id: string) => {
        try {
            await bookingApi.deleteType(id);
            setTypes((prev) => prev.filter((t) => t.id !== id));
            toast.success("Link removed.");
        } catch {
            toast.error("Could not remove the link.");
        }
    };

    const copyLink = (slug: string) => {
        const url = `${origin}/book/${handle}/${slug}`;
        navigator.clipboard.writeText(url).then(
            () => toast.success("Link copied."),
            () => toast.error("Could not copy. Select and copy manually."),
        );
    };

    const act = async (id: string, action: "approve" | "decline" | "cancel") => {
        setBusyId(id);
        try {
            const updated = await bookingApi[action](id);
            setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
            toast.success(
                action === "approve" ? "Confirmed. The huddle link is on its way." : "Updated.",
            );
        } catch {
            toast.error("Could not update that booking.");
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                Scheduling
            </h1>
            <p className="mt-2 text-gray-600">
                Share a link and let people book time with you. Slots come from the hours you set
                below, minus anything already on your calendar.
            </p>

            {/* Public handle */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                    Your booking link
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">{origin}/book/</span>
                    <input
                        id="handle"
                        value={handleDraft}
                        onChange={(e) => setHandleDraft(e.target.value)}
                        className={`${input} w-48`}
                        placeholder="your-name"
                    />
                    <button
                        type="button"
                        onClick={saveHandle}
                        disabled={savingHandle || !handleDraft.trim()}
                        className={primaryBtn}
                    >
                        {savingHandle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {handle ? "Update" : "Claim"}
                    </button>
                </div>
                {!handle && (
                    <p className="mt-2 text-xs text-gray-500">
                        Claim a handle before sharing any links.
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-1 border-b border-gray-200">
                {([
                    ["availability", "Availability"],
                    ["links", "Booking links"],
                    ["bookings", "Bookings"],
                ] as [Tab, string][]).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={[
                            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                            tab === id
                                ? "border-lumicoria-purple text-lumicoria-purple"
                                : "border-transparent text-gray-500 hover:text-gray-800",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Availability not saved yet. The editor pre-fills a week, which
                looks identical to a saved one, so this has to be explicit. */}
            {!hasSavedAvailability && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                        Your availability is not saved yet
                    </p>
                    <p className="mt-1 text-sm text-amber-800">
                        The hours below are a suggested starting point, not live. Until you save
                        them, your booking links show no available times.
                    </p>
                    {tab !== "availability" && (
                        <button
                            type="button"
                            onClick={() => setTab("availability")}
                            className="mt-3 text-sm font-medium text-amber-900 underline underline-offset-4"
                        >
                            Set your availability
                        </button>
                    )}
                </div>
            )}

            {/* Availability */}
            {tab === "availability" && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
                    <div className="mb-5">
                        <label htmlFor="tz" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Time zone
                        </label>
                        <select
                            id="tz"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className={`${input} w-full max-w-xs`}
                        >
                            {timezones.map((tz) => (
                                <option key={tz} value={tz}>
                                    {tz.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Hours below are in this zone. Visitors see them converted to theirs.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {week.map((day, i) => (
                            <div
                                key={WEEKDAY_LABELS[i]}
                                className="flex flex-wrap items-center gap-3 border-t border-gray-100 py-3 first:border-t-0"
                            >
                                <label className="flex w-36 items-center gap-2.5 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={day.enabled}
                                        onChange={(e) =>
                                            setWeek((prev) =>
                                                prev.map((d, j) =>
                                                    j === i ? { ...d, enabled: e.target.checked } : d,
                                                ),
                                            )
                                        }
                                        className="h-4 w-4 accent-[#6C4AB0]"
                                    />
                                    {WEEKDAY_LABELS[i]}
                                </label>

                                {day.enabled ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            aria-label={`${WEEKDAY_LABELS[i]} start`}
                                            value={day.start}
                                            onChange={(e) =>
                                                setWeek((prev) =>
                                                    prev.map((d, j) =>
                                                        j === i ? { ...d, start: e.target.value } : d,
                                                    ),
                                                )
                                            }
                                            className={input}
                                        />
                                        <span className="text-sm text-gray-400">to</span>
                                        <input
                                            type="time"
                                            aria-label={`${WEEKDAY_LABELS[i]} end`}
                                            value={day.end}
                                            onChange={(e) =>
                                                setWeek((prev) =>
                                                    prev.map((d, j) =>
                                                        j === i ? { ...d, end: e.target.value } : d,
                                                    ),
                                                )
                                            }
                                            className={input}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400">Unavailable</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={saveWeek} disabled={savingWeek} className={`${primaryBtn} mt-5`}>
                        {savingWeek && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save availability
                    </button>
                </div>
            )}

            {/* Booking links */}
            {tab === "links" && (
                <div className="mt-6 space-y-4">
                    {types.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
                            <Link2 className="mx-auto mb-3 h-6 w-6 text-gray-300" aria-hidden="true" />
                            <p className="text-sm text-gray-600">
                                No booking links yet. Create one to start sharing.
                            </p>
                            <button type="button" onClick={createType} className={`${primaryBtn} mt-4`}>
                                <Plus className="h-4 w-4" />
                                New link
                            </button>
                        </div>
                    ) : (
                        <>
                            {types.map((t) => (
                                <div key={t.id} className="rounded-lg border border-gray-200 bg-white p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <input
                                            value={t.title}
                                            onChange={(e) =>
                                                setTypes((prev) =>
                                                    prev.map((x) =>
                                                        x.id === t.id ? { ...x, title: e.target.value } : x,
                                                    ),
                                                )
                                            }
                                            onBlur={(e) => patchType(t.id, { title: e.target.value })}
                                            className="min-w-0 flex-1 border-0 p-0 text-base font-semibold text-gray-900 outline-none focus:ring-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeType(t.id)}
                                            aria-label={`Delete ${t.title}`}
                                            className="text-gray-400 transition-colors hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            Duration
                                            <select
                                                value={t.duration_minutes}
                                                onChange={(e) =>
                                                    patchType(t.id, {
                                                        duration_minutes: Number(e.target.value),
                                                    })
                                                }
                                                className={input}
                                            >
                                                {[15, 30, 45, 60, 90].map((m) => (
                                                    <option key={m} value={m}>
                                                        {m} min
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={t.confirmation_mode === "approval"}
                                                onChange={(e) =>
                                                    patchType(t.id, {
                                                        confirmation_mode: e.target.checked
                                                            ? "approval"
                                                            : "instant",
                                                    })
                                                }
                                                className="h-4 w-4 accent-[#6C4AB0]"
                                            />
                                            Require my approval
                                        </label>

                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={t.is_active}
                                                onChange={(e) => patchType(t.id, { is_active: e.target.checked })}
                                                className="h-4 w-4 accent-[#6C4AB0]"
                                            />
                                            Active
                                        </label>
                                    </div>

                                    {handle && (
                                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                                            <code className="truncate rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">
                                                {origin}/book/{handle}/{t.slug}
                                            </code>
                                            <button
                                                type="button"
                                                onClick={() => copyLink(t.slug)}
                                                className={ghostBtn}
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={createType} className={ghostBtn}>
                                <Plus className="h-4 w-4" />
                                New link
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Bookings */}
            {tab === "bookings" && (
                <div className="mt-6">
                    {bookings.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
                            <CalendarDays className="mx-auto mb-3 h-6 w-6 text-gray-300" aria-hidden="true" />
                            <p className="text-sm text-gray-600">No upcoming bookings.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            {bookings.map((b, i) => (
                                <div
                                    key={b.id}
                                    className={`flex flex-wrap items-center justify-between gap-4 p-5 ${
                                        i > 0 ? "border-t border-gray-200" : ""
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-gray-900">{b.invitee_name}</p>
                                            {b.status === "pending" && (
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                    Needs approval
                                                </span>
                                            )}
                                            {b.status === "cancelled" && (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                    Cancelled
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">{b.invitee_email}</p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {formatFull(b.start, detectTimezone())}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {b.status === "pending" && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => act(b.id, "approve")}
                                                    disabled={busyId === b.id}
                                                    className={primaryBtn}
                                                >
                                                    {busyId === b.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => act(b.id, "decline")}
                                                    disabled={busyId === b.id}
                                                    className={ghostBtn}
                                                >
                                                    <X className="h-4 w-4" />
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {b.status === "confirmed" && (
                                            <>
                                                {b.huddle_share_token && (
                                                    <a
                                                        href={`/huddles/join/${b.huddle_share_token}`}
                                                        className={ghostBtn}
                                                    >
                                                        <Video className="h-3.5 w-3.5" />
                                                        Join
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => act(b.id, "cancel")}
                                                    disabled={busyId === b.id}
                                                    className="text-sm text-gray-500 underline underline-offset-4 hover:text-red-600"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
