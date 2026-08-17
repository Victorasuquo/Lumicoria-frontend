/**
 * /bookings — everything booked with you.
 *
 * Lives inside MainLayout, so notifications and emails can deep-link here.
 * Pending requests sort first because they are the only ones needing action.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CalendarDays,
    Check,
    ChevronRight,
    Clock,
    Loader2,
    Settings2,
    Video,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { bookingApi, type Booking, type BookingStatus } from "@/services/bookingApi";
import { detectTimezone, formatFull } from "@/lib/timezone";

type Filter = "all" | "pending" | "confirmed" | "past" | "cancelled";

interface BookingRow extends Booking {
    title?: string;
    join_url?: string | null;
}

const STATUS_STYLE: Record<BookingStatus, { label: string; className: string }> = {
    pending: { label: "Needs approval", className: "bg-amber-50 text-amber-700" },
    confirmed: { label: "Confirmed", className: "bg-green-50 text-green-700" },
    cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
    declined: { label: "Declined", className: "bg-gray-100 text-gray-600" },
};

const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-lumicoria-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lumicoria-deepPurple disabled:opacity-60";
const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple";

export default function BookingsList() {
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [busyId, setBusyId] = useState<string | null>(null);
    const tz = useMemo(detectTimezone, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setBookings((await bookingApi.listBookings()) as BookingRow[]);
        } catch {
            toast.error("Could not load your bookings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    const visible = useMemo(() => {
        const now = Date.now();
        const rows = bookings.filter((b) => {
            const isPast = new Date(b.end).getTime() < now;
            switch (filter) {
                case "pending":
                    return b.status === "pending";
                case "confirmed":
                    return b.status === "confirmed" && !isPast;
                case "past":
                    return isPast && b.status !== "cancelled" && b.status !== "declined";
                case "cancelled":
                    return b.status === "cancelled" || b.status === "declined";
                default:
                    return true;
            }
        });

        // Anything awaiting a decision comes first, then soonest.
        return rows.sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (b.status === "pending" && a.status !== "pending") return 1;
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
    }, [bookings, filter]);

    const act = async (id: string, action: "approve" | "decline" | "cancel") => {
        setBusyId(id);
        try {
            const updated = (await bookingApi[action](id)) as BookingRow;
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, ...updated } : b)),
            );
            toast.success(
                action === "approve"
                    ? "Approved. The huddle link is on its way."
                    : action === "decline"
                      ? "Declined. They have been notified."
                      : "Cancelled. They have been notified.",
            );
        } catch {
            toast.error("Could not update that booking.");
        } finally {
            setBusyId(null);
        }
    };

    const filters: [Filter, string][] = [
        ["all", "All"],
        ["pending", pendingCount ? `Pending (${pendingCount})` : "Pending"],
        ["confirmed", "Upcoming"],
        ["past", "Past"],
        ["cancelled", "Cancelled"],
    ];

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                        Bookings
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Meetings people have booked with you through your links.
                    </p>
                </div>
                <Link to="/calendar/scheduling" className={ghostBtn}>
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                    Scheduling settings
                </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-1 border-b border-gray-200">
                {filters.map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setFilter(id)}
                        className={[
                            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                            filter === id
                                ? "border-lumicoria-purple text-lumicoria-purple"
                                : "border-transparent text-gray-500 hover:text-gray-800",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
                </div>
            ) : visible.length === 0 ? (
                <div className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                    <CalendarDays className="mx-auto mb-3 h-6 w-6 text-gray-300" aria-hidden="true" />
                    <p className="text-sm text-gray-600">
                        {filter === "all"
                            ? "Nothing booked yet. Share a booking link to get started."
                            : "Nothing here."}
                    </p>
                    {filter === "all" && (
                        <Link to="/calendar/scheduling" className={`${primaryBtn} mt-5`}>
                            Set up a booking link
                        </Link>
                    )}
                </div>
            ) : (
                <div className="mt-6 space-y-3">
                    {visible.map((b, i) => {
                        const style = STATUS_STYLE[b.status];
                        return (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
                                className="rounded-lg border border-gray-200 bg-white p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <Link to={`/bookings/${b.id}`} className="group min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold text-gray-900 group-hover:text-lumicoria-purple">
                                                {b.title || "Meeting"}
                                            </h2>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
                                            >
                                                {style.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {b.invitee_name} · {b.invitee_email}
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500">
                                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                            {formatFull(b.start, tz)}
                                        </p>
                                    </Link>

                                    <div className="flex shrink-0 items-center gap-2">
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
                                        {b.status === "confirmed" && b.join_url && (
                                            <a href={b.join_url} className={ghostBtn}>
                                                <Video className="h-3.5 w-3.5" />
                                                Join
                                            </a>
                                        )}
                                        <Link
                                            to={`/bookings/${b.id}`}
                                            aria-label="View booking"
                                            className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-lumicoria-purple"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
