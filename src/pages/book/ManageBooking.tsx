/**
 * Invitee self-service: /booking/manage/:token
 *
 * The token from the confirmation email is the only credential, so this page
 * is anonymous like the booking page itself and uses the same
 * interceptor-free client.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Video } from "lucide-react";
import { bookingPublicApi } from "@/services/bookingApi";
import { detectTimezone, formatFull, offsetLabel } from "@/lib/timezone";

interface ManagedBooking {
    status: "pending" | "confirmed" | "cancelled" | "declined";
    title: string;
    start: string;
    end: string;
    invitee_name: string;
    invitee_timezone: string;
    join_url: string | null;
    can_cancel: boolean;
}

const STATUS_COPY: Record<ManagedBooking["status"], { label: string; tone: string }> = {
    confirmed: { label: "Confirmed", tone: "bg-green-50 text-green-700" },
    pending: { label: "Awaiting confirmation", tone: "bg-amber-50 text-amber-700" },
    cancelled: { label: "Cancelled", tone: "bg-gray-100 text-gray-600" },
    declined: { label: "Declined", tone: "bg-gray-100 text-gray-600" },
};

export default function ManageBooking() {
    const { token = "" } = useParams();
    const [booking, setBooking] = useState<ManagedBooking | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");
    const [cancelling, setCancelling] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Show times in the viewer's zone, falling back to the one they booked in.
    const [timezone, setTimezone] = useState(detectTimezone);

    useEffect(() => {
        bookingPublicApi
            .getByToken(token)
            .then((data) => {
                setBooking(data);
                if (data.invitee_timezone) setTimezone(data.invitee_timezone);
                setState("ready");
            })
            .catch((err) => setState(err?.response?.status === 404 ? "notfound" : "error"));
    }, [token]);

    const cancel = async () => {
        setCancelling(true);
        try {
            const res = await bookingPublicApi.cancelByToken(token);
            setBooking((prev) => (prev ? { ...prev, status: res.status, can_cancel: false } : prev));
            setConfirmOpen(false);
        } catch {
            setState("error");
        } finally {
            setCancelling(false);
        }
    };

    if (state === "loading") {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-[#F8F6FC]">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
            </div>
        );
    }

    if (state !== "ready" || !booking) {
        return (
            <div className="min-h-[100dvh] bg-[#F8F6FC] px-4 py-16">
                <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-10 text-center">
                    <h1 className="text-lg font-semibold text-lumicoria-obsidian">
                        {state === "notfound" ? "Booking not found" : "Something went wrong"}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {state === "notfound"
                            ? "This link is not valid. It may have already been cancelled."
                            : "Please try again shortly."}
                    </p>
                </div>
            </div>
        );
    }

    const status = STATUS_COPY[booking.status];

    return (
        <div className="min-h-[100dvh] bg-[#F8F6FC] px-4 py-16">
            <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-8">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>
                    {status.label}
                </span>

                <h1 className="mt-4 text-xl font-semibold tracking-tight text-lumicoria-obsidian">
                    {booking.title}
                </h1>
                <p className="mt-2 text-gray-600">
                    {formatFull(booking.start, timezone)}
                    <span className="ml-2 text-sm text-gray-400">{offsetLabel(timezone)}</span>
                </p>

                {booking.status === "confirmed" && booking.join_url && (
                    <a
                        href={booking.join_url}
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-lumicoria-purple px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-lumicoria-deepPurple"
                    >
                        <Video className="h-4 w-4" aria-hidden="true" />
                        Join the huddle
                    </a>
                )}

                {booking.can_cancel && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        {confirmOpen ? (
                            <div>
                                <p className="text-sm text-gray-700">
                                    Cancel this meeting? The host will be notified.
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={cancel}
                                        disabled={cancelling}
                                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                                    >
                                        {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Yes, cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmOpen(false)}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
                                    >
                                        Keep it
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(true)}
                                className="text-sm text-gray-500 underline underline-offset-4 hover:text-red-600"
                            >
                                Cancel this meeting
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
