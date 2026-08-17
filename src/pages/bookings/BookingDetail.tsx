/**
 * /bookings/:id — one booking in full.
 *
 * The target of notification deep-links and of the "View booking" button in
 * the host's email, so everything needed to act is on this one page.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    Clock,
    Copy,
    Globe,
    Loader2,
    Mail,
    User as UserIcon,
    Video,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { bookingApi, type Booking, type BookingStatus } from "@/services/bookingApi";
import { detectTimezone, formatFull, offsetLabel } from "@/lib/timezone";

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
    "inline-flex items-center justify-center gap-2 rounded-md bg-lumicoria-purple px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-lumicoria-deepPurple disabled:opacity-60";
const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple";

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4 border-t border-gray-100 py-4 first:border-t-0">
            <div className="mt-0.5 text-gray-400">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
                <div className="mt-1 text-sm text-gray-800">{children}</div>
            </div>
        </div>
    );
}

export default function BookingDetail() {
    const { id = "" } = useParams();
    const [booking, setBooking] = useState<BookingRow | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");
    const [busy, setBusy] = useState(false);
    const tz = useMemo(detectTimezone, []);

    const load = useCallback(async () => {
        try {
            setBooking((await bookingApi.getBooking(id)) as BookingRow);
            setState("ready");
        } catch {
            setState("notfound");
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    const act = async (action: "approve" | "decline" | "cancel") => {
        setBusy(true);
        try {
            const updated = (await bookingApi[action](id)) as BookingRow;
            setBooking((prev) => (prev ? { ...prev, ...updated } : prev));
            toast.success(
                action === "approve"
                    ? "Approved. The huddle link is on its way."
                    : "Updated. They have been notified.",
            );
            // Re-read so the huddle link appears after approval.
            if (action === "approve") await load();
        } catch {
            toast.error("Could not update that booking.");
        } finally {
            setBusy(false);
        }
    };

    if (state === "loading") {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
            </div>
        );
    }

    if (state === "notfound" || !booking) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <h1 className="text-lg font-semibold text-lumicoria-obsidian">Booking not found</h1>
                <p className="mt-2 text-sm text-gray-600">
                    It may have been removed, or the link is not valid.
                </p>
                <Link to="/bookings" className={`${ghostBtn} mt-6`}>
                    Back to bookings
                </Link>
            </div>
        );
    }

    const style = STATUS_STYLE[booking.status];
    const isPast = new Date(booking.end).getTime() < Date.now();

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <Link
                to="/bookings"
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-lumicoria-purple"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All bookings
            </Link>

            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                    {booking.title || "Meeting"}
                </h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
                    {style.label}
                </span>
            </div>

            {booking.status === "pending" && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm text-amber-900">
                        This time is held for {booking.invitee_name} until you respond. Approving
                        creates the huddle link and emails it to them.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => act("approve")} disabled={busy} className={primaryBtn}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Approve
                        </button>
                        <button type="button" onClick={() => act("decline")} disabled={busy} className={ghostBtn}>
                            <X className="h-4 w-4" />
                            Decline
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
                <Row icon={<Clock className="h-4 w-4" />} label="When">
                    {formatFull(booking.start, tz)}
                    <span className="ml-2 text-gray-400">{offsetLabel(tz)}</span>
                </Row>

                <Row icon={<UserIcon className="h-4 w-4" />} label="Who">
                    {booking.invitee_name}
                </Row>

                <Row icon={<Mail className="h-4 w-4" />} label="Email">
                    <a
                        href={`mailto:${booking.invitee_email}`}
                        className="text-lumicoria-purple underline underline-offset-4"
                    >
                        {booking.invitee_email}
                    </a>
                </Row>

                <Row icon={<Globe className="h-4 w-4" />} label="Their time zone">
                    {booking.invitee_timezone}
                    <span className="ml-2 text-gray-400">
                        {formatFull(booking.start, booking.invitee_timezone)}
                    </span>
                </Row>

                {booking.invitee_notes && (
                    <Row icon={<Mail className="h-4 w-4" />} label="Their note">
                        <p className="whitespace-pre-line leading-relaxed">{booking.invitee_notes}</p>
                    </Row>
                )}

                {booking.answers?.length > 0 && (
                    <Row icon={<Check className="h-4 w-4" />} label="Answers">
                        <dl className="space-y-2">
                            {booking.answers.map((a) => (
                                <div key={a.id}>
                                    <dt className="text-xs text-gray-500">{a.label || a.id}</dt>
                                    <dd>{a.value || "—"}</dd>
                                </div>
                            ))}
                        </dl>
                    </Row>
                )}
            </div>

            {booking.status === "confirmed" && booking.join_url && (
                <div className="mt-6 rounded-lg bg-[#F8F6FC] p-5">
                    <p className="text-sm font-medium text-gray-900">Meeting link</p>
                    <p className="mt-1 text-sm text-gray-600">
                        {booking.invitee_name} has this link too.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <a href={booking.join_url} className={primaryBtn}>
                            <Video className="h-4 w-4" />
                            Join the huddle
                        </a>
                        <button
                            type="button"
                            onClick={() =>
                                navigator.clipboard
                                    .writeText(booking.join_url!)
                                    .then(() => toast.success("Link copied."))
                            }
                            className={ghostBtn}
                        >
                            <Copy className="h-3.5 w-3.5" />
                            Copy link
                        </button>
                    </div>
                </div>
            )}

            {booking.status === "confirmed" && !isPast && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                    <button
                        type="button"
                        onClick={() => act("cancel")}
                        disabled={busy}
                        className="text-sm text-gray-500 underline underline-offset-4 hover:text-red-600"
                    >
                        Cancel this meeting
                    </button>
                </div>
            )}
        </div>
    );
}
