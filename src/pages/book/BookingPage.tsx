/**
 * Public booking page: /book/:handle and /book/:handle/:slug
 *
 * Rendered for anonymous visitors, outside MainLayout, so there is no nav,
 * no footer and no toaster. Every success and error state is inline for that
 * reason, matching the hosted support portal.
 *
 * All network calls go through `bookingPublicApi`, which uses an
 * interceptor-free axios instance. Using the shared client would redirect the
 * visitor to /login on any 401 and lose their booking.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Globe,
    Loader2,
    Video,
} from "lucide-react";
import {
    bookingPublicApi,
    type PublicBookingPage,
    type PublicBookingType,
    type Slot,
    type BookingResult,
} from "@/services/bookingApi";
import {
    dayKeyInZone,
    detectTimezone,
    formatDayLong,
    formatFull,
    formatTime,
    listTimezones,
    offsetLabel,
    toDateKey,
} from "@/lib/timezone";

const EASE = [0.16, 1, 0.3, 1] as const;

const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-lumicoria-purple px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-lumicoria-deepPurple disabled:cursor-not-allowed disabled:opacity-60";
const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple";

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[100dvh] bg-[#F8F6FC] px-4 py-10">
            <div className="mx-auto max-w-4xl">{children}</div>
        </div>
    );
}

function Centered({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
    return (
        <Shell>
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <h1 className="text-xl font-semibold text-lumicoria-obsidian">{title}</h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">{body}</p>
                {action && <div className="mt-6">{action}</div>}
            </div>
        </Shell>
    );
}

function Spinner({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {label}
        </div>
    );
}

// ── Type picker: /book/:handle ────────────────────────────────────────

function TypePicker({ handle }: { handle: string }) {
    const [page, setPage] = useState<PublicBookingPage | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");

    useEffect(() => {
        bookingPublicApi
            .getPage(handle)
            .then((data) => {
                setPage(data);
                setState("ready");
            })
            .catch((err) => setState(err?.response?.status === 404 ? "notfound" : "error"));
    }, [handle]);

    if (state === "loading") return <Shell><Spinner label="Loading" /></Shell>;
    if (state === "notfound")
        return <Centered title="Page not found" body="This booking link does not exist or is no longer active." />;
    if (state === "error")
        return <Centered title="Something went wrong" body="We could not load this page. Please try again shortly." />;

    return (
        <Shell>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                    {page!.display_name}
                </h1>
                <p className="mt-2 text-gray-600">Choose a meeting to book.</p>
            </div>

            {page!.booking_types.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                    <p className="text-sm text-gray-600">
                        {page!.display_name} has no meetings available to book right now.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {page!.booking_types.map((t, i) => (
                        <motion.div
                            key={t.slug}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.2), ease: EASE }}
                        >
                            <Link
                                to={`/book/${handle}/${t.slug}`}
                                className="group flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-lumicoria-purple"
                            >
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-gray-900 group-hover:text-lumicoria-purple">
                                        {t.title}
                                    </h2>
                                    {t.description && (
                                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                            {t.description}
                                        </p>
                                    )}
                                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t.duration_minutes} min
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Video className="h-3.5 w-3.5" aria-hidden="true" />
                                            Lumicoria Huddle
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight
                                    className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-lumicoria-purple"
                                    aria-hidden="true"
                                />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </Shell>
    );
}

// ── Slot picker + form: /book/:handle/:slug ───────────────────────────

interface FormState {
    name: string;
    email: string;
    notes: string;
    answers: Record<string, string>;
}

function BookingFlow({ handle, slug }: { handle: string; slug: string }) {
    const [type, setType] = useState<(PublicBookingType & { display_name: string }) | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");

    const [timezone, setTimezone] = useState(detectTimezone);
    const [monthCursor, setMonthCursor] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    const [form, setForm] = useState<FormState>({ name: "", email: "", notes: "", answers: {} });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [result, setResult] = useState<BookingResult | null>(null);

    const timezones = useMemo(listTimezones, []);

    useEffect(() => {
        bookingPublicApi
            .getType(handle, slug)
            .then((data) => {
                setType(data);
                setState("ready");
            })
            .catch((err) => setState(err?.response?.status === 404 ? "notfound" : "error"));
    }, [handle, slug]);

    const loadSlots = useCallback(async () => {
        setSlotsLoading(true);
        try {
            // Pad the request by a day either side so slots near the month
            // boundary are not clipped when the viewer's zone shifts the date.
            const from = new Date(monthCursor);
            from.setDate(from.getDate() - 1);
            const to = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
            to.setDate(to.getDate() + 1);
            const now = new Date();
            const start = from > now ? from : now;

            const data = await bookingPublicApi.getSlots(
                handle,
                slug,
                start.toISOString().slice(0, 19),
                to.toISOString().slice(0, 19),
            );
            setSlots(data.slots);
        } catch {
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, [handle, slug, monthCursor]);

    useEffect(() => {
        if (state === "ready") void loadSlots();
    }, [state, loadSlots]);

    /** Slots grouped by the calendar day they fall on *in the viewer's zone*. */
    const slotsByDay = useMemo(() => {
        const map = new Map<string, Slot[]>();
        for (const slot of slots) {
            const key = dayKeyInZone(slot.start, timezone);
            const list = map.get(key);
            if (list) list.push(slot);
            else map.set(key, [slot]);
        }
        return map;
    }, [slots, timezone]);

    // Keep the selected day valid when the timezone changes underneath it.
    useEffect(() => {
        if (selectedDay && !slotsByDay.has(selectedDay)) {
            setSelectedDay(null);
            setSelectedSlot(null);
        }
    }, [slotsByDay, selectedDay]);

    const monthGrid = useMemo(() => {
        const year = monthCursor.getFullYear();
        const month = monthCursor.getMonth();
        const first = new Date(year, month, 1);
        // Monday-first grid.
        const lead = (first.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: (Date | null)[] = Array(lead).fill(null);
        for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
        return cells;
    }, [monthCursor]);

    const submit = async () => {
        if (!selectedSlot || !type) return;
        setFormError(null);

        if (!form.name.trim()) return setFormError("Please enter your name.");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
            return setFormError("Please enter a valid email address.");
        for (const q of type.questions) {
            if (q.required && !(form.answers[q.id] || "").trim())
                return setFormError(`"${q.label}" is required.`);
        }

        setSubmitting(true);
        try {
            const res = await bookingPublicApi.book(handle, slug, {
                start: selectedSlot.start.replace("Z", ""),
                invitee_name: form.name.trim(),
                invitee_email: form.email.trim(),
                invitee_timezone: timezone,
                invitee_notes: form.notes.trim() || undefined,
                answers: type.questions.map((q) => ({ id: q.id, value: form.answers[q.id] || "" })),
            });
            setResult(res);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
                // Someone took the slot between rendering and submitting.
                setFormError("That time was just taken. Please choose another slot.");
                setSelectedSlot(null);
                void loadSlots();
            } else {
                setFormError(
                    err?.response?.data?.detail || "We could not complete the booking. Please try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (state === "loading") return <Shell><Spinner label="Loading" /></Shell>;
    if (state === "notfound")
        return <Centered title="Page not found" body="This booking link does not exist or is no longer active." />;
    if (state === "error")
        return <Centered title="Something went wrong" body="We could not load this page. Please try again shortly." />;

    // ── Confirmation ──────────────────────────────────────────────────
    if (result) {
        return (
            <Shell>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="rounded-lg border border-gray-200 bg-white p-8 md:p-12"
                >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
                        <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                        {result.requires_approval ? "Request sent" : "You are booked"}
                    </h1>
                    <p className="mt-3 max-w-lg leading-relaxed text-gray-600">
                        {result.requires_approval
                            ? `${type!.display_name} will review your request and confirm by email. Nothing is in the calendar until they do.`
                            : `A calendar invitation is on its way to ${form.email}.`}
                    </p>

                    <dl className="mt-8 space-y-3 border-t border-gray-200 pt-6 text-sm">
                        <div className="flex gap-3">
                            <dt className="w-24 shrink-0 text-gray-500">Meeting</dt>
                            <dd className="font-medium text-gray-900">{result.title}</dd>
                        </div>
                        <div className="flex gap-3">
                            <dt className="w-24 shrink-0 text-gray-500">When</dt>
                            <dd className="font-medium text-gray-900">
                                {formatFull(result.start, timezone)}
                                <span className="ml-2 font-normal text-gray-500">
                                    {offsetLabel(timezone)}
                                </span>
                            </dd>
                        </div>
                        <div className="flex gap-3">
                            <dt className="w-24 shrink-0 text-gray-500">Where</dt>
                            <dd className="font-medium text-gray-900">Lumicoria Huddle</dd>
                        </div>
                    </dl>

                    {result.join_url && (
                        <div className="mt-8 rounded-lg bg-[#F8F6FC] p-5">
                            <p className="text-sm font-medium text-gray-900">Your meeting link</p>
                            <p className="mt-1 text-sm text-gray-600">
                                You will be asked to create a free Lumicoria account when you join.
                            </p>
                            <a href={result.join_url} className={`${primaryBtn} mt-4`}>
                                <Video className="h-4 w-4" aria-hidden="true" />
                                Join the huddle
                            </a>
                        </div>
                    )}

                    <p className="mt-8 text-sm text-gray-500">
                        Need to change something?{" "}
                        <a
                            href={result.manage_url}
                            className="text-lumicoria-purple underline underline-offset-4"
                        >
                            Manage this booking
                        </a>
                    </p>
                </motion.div>
            </Shell>
        );
    }

    const daySlots = selectedDay ? slotsByDay.get(selectedDay) ?? [] : [];

    return (
        <Shell>
            <Link
                to={`/book/${handle}`}
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-lumicoria-purple"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All meeting types
            </Link>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="grid md:grid-cols-12">
                    {/* Meeting summary */}
                    <div className="border-b border-gray-200 p-6 md:col-span-4 md:border-b-0 md:border-r">
                        <p className="text-sm text-gray-500">{type!.display_name}</p>
                        <h1 className="mt-1 text-xl font-semibold tracking-tight text-lumicoria-obsidian">
                            {type!.title}
                        </h1>
                        {type!.description && (
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                {type!.description}
                            </p>
                        )}
                        <div className="mt-5 space-y-2 text-sm text-gray-600">
                            <p className="inline-flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                {type!.duration_minutes} minutes
                            </p>
                            <p className="inline-flex items-center gap-2">
                                <Video className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                Lumicoria Huddle
                            </p>
                            {type!.requires_approval && (
                                <p className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    Confirmed after review
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="tz"
                                className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-500"
                            >
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                Time zone
                            </label>
                            <select
                                id="tz"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                            >
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-400">{offsetLabel(timezone)}</p>
                        </div>
                    </div>

                    {/* Calendar + slots */}
                    <div className="p-6 md:col-span-8">
                        {!selectedSlot ? (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-semibold text-gray-900">Select a time</h2>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            aria-label="Previous month"
                                            onClick={() =>
                                                setMonthCursor(
                                                    new Date(
                                                        monthCursor.getFullYear(),
                                                        monthCursor.getMonth() - 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="min-w-[130px] text-center text-sm font-medium text-gray-700">
                                            {monthCursor.toLocaleDateString(undefined, {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Next month"
                                            onClick={() =>
                                                setMonthCursor(
                                                    new Date(
                                                        monthCursor.getFullYear(),
                                                        monthCursor.getMonth() + 1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {slotsLoading ? (
                                    <Spinner label="Finding available times" />
                                ) : (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 text-center">
                                            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                                <div
                                                    key={`${d}${i}`}
                                                    className="pb-2 text-xs font-medium text-gray-400"
                                                >
                                                    {d}
                                                </div>
                                            ))}
                                            {monthGrid.map((date, i) => {
                                                if (!date) return <div key={`e${i}`} />;
                                                const key = toDateKey(date);
                                                const has = slotsByDay.has(key);
                                                const isSelected = selectedDay === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        disabled={!has}
                                                        onClick={() => setSelectedDay(key)}
                                                        className={[
                                                            "aspect-square rounded-md text-sm transition-colors",
                                                            isSelected
                                                                ? "bg-lumicoria-purple font-semibold text-white"
                                                                : has
                                                                  ? "bg-lumicoria-purple/10 font-medium text-lumicoria-purple hover:bg-lumicoria-purple/20"
                                                                  : "text-gray-300",
                                                        ].join(" ")}
                                                    >
                                                        {date.getDate()}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {selectedDay && (
                                            <div className="mt-6 border-t border-gray-200 pt-5">
                                                <p className="mb-3 text-sm font-medium text-gray-700">
                                                    {formatDayLong(daySlots[0].start, timezone)}
                                                </p>
                                                <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                                                    {daySlots.map((slot) => (
                                                        <button
                                                            key={slot.start}
                                                            type="button"
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className="rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple"
                                                        >
                                                            {formatTime(slot.start, timezone)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {slotsByDay.size === 0 && (
                                            <p className="mt-8 text-center text-sm text-gray-500">
                                                No times available this month. Try the next one.
                                            </p>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            /* Details form */
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSlot(null)}
                                    className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-lumicoria-purple"
                                >
                                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                    Change time
                                </button>

                                <div className="mb-5 rounded-md bg-[#F8F6FC] px-4 py-3 text-sm">
                                    <span className="font-medium text-gray-900">
                                        {formatFull(selectedSlot.start, timezone)}
                                    </span>
                                    <span className="ml-2 text-gray-500">{offsetLabel(timezone)}</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Name <span className="text-lumicoria-purple">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Email <span className="text-lumicoria-purple">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                                        />
                                    </div>

                                    {type!.questions.map((q) => (
                                        <div key={q.id}>
                                            <label
                                                htmlFor={`q-${q.id}`}
                                                className="mb-1.5 block text-sm font-medium text-gray-700"
                                            >
                                                {q.label}
                                                {q.required && <span className="text-lumicoria-purple"> *</span>}
                                            </label>
                                            {q.type === "textarea" ? (
                                                <textarea
                                                    id={`q-${q.id}`}
                                                    rows={3}
                                                    value={form.answers[q.id] || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            answers: { ...form.answers, [q.id]: e.target.value },
                                                        })
                                                    }
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                                                />
                                            ) : q.type === "select" ? (
                                                <select
                                                    id={`q-${q.id}`}
                                                    value={form.answers[q.id] || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            answers: { ...form.answers, [q.id]: e.target.value },
                                                        })
                                                    }
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                                                >
                                                    <option value="">Select…</option>
                                                    {q.options.map((o) => (
                                                        <option key={o} value={o}>
                                                            {o}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    id={`q-${q.id}`}
                                                    value={form.answers[q.id] || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            answers: { ...form.answers, [q.id]: e.target.value },
                                                        })
                                                    }
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <div>
                                        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Anything else?
                                        </label>
                                        <textarea
                                            id="notes"
                                            rows={3}
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple"
                                        />
                                    </div>

                                    {formError && (
                                        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                                            {formError}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={submitting}
                                        className={`${primaryBtn} w-full`}
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                                        {submitting
                                            ? "Booking…"
                                            : type!.requires_approval
                                              ? "Request this time"
                                              : "Confirm booking"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Shell>
    );
}

export default function BookingPage() {
    const { handle = "", slug } = useParams();
    if (!handle) return <Centered title="Page not found" body="This booking link is not valid." />;
    return slug ? <BookingFlow handle={handle} slug={slug} /> : <TypePicker handle={handle} />;
}
