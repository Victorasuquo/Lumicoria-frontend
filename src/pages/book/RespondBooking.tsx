/**
 * /booking/respond/:token — the host approves or declines from their email.
 *
 * Public by necessity: an email client has no session. The unguessable token
 * in the URL is the credential, exactly like the invitee's cancel link, so
 * this uses the interceptor-free client and never redirects to /login.
 *
 * `?action=approve` or `?action=decline` in the query, set by the email
 * buttons, is confirmed on screen rather than fired automatically. Mail
 * scanners and link prefetchers follow URLs, and a booking must not be
 * decided by a security scanner opening the message.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Check, Loader2, Video, X } from "lucide-react";
import { bookingPublicApi } from "@/services/bookingApi";
import { detectTimezone, formatFull, offsetLabel } from "@/lib/timezone";

interface RespondBooking {
    status: "pending" | "confirmed" | "cancelled" | "declined";
    title: string;
    start: string;
    end: string;
    invitee_name: string;
    invitee_email: string;
    invitee_timezone: string;
    invitee_notes?: string | null;
    answers: { id: string; label?: string; value: string }[];
    join_url: string | null;
    can_respond: boolean;
}

const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-md bg-lumicoria-purple px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-lumicoria-deepPurple disabled:opacity-60";
const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple disabled:opacity-60";

export default function RespondBooking() {
    const { token = "" } = useParams();
    const [params] = useSearchParams();
    const suggested = params.get("action");

    const [booking, setBooking] = useState<RespondBooking | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");
    const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
    const [done, setDone] = useState<string | null>(null);
    const tz = useMemo(detectTimezone, []);

    const load = useCallback(async () => {
        try {
            setBooking(await bookingPublicApi.getRespond(token));
            setState("ready");
        } catch (err: any) {
            setState(err?.response?.status === 404 ? "notfound" : "error");
        }
    }, [token]);

    useEffect(() => {
        void load();
    }, [load]);

    const respond = async (action: "approve" | "decline") => {
        setBusy(action);
        try {
            const res = await bookingPublicApi.respond(token, action);
            setDone(res.status);
            await load();
        } catch {
            setState("error");
        } finally {
            setBusy(null);
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
                            ? "This link is not valid. The booking may have been removed."
                            : "Please try again shortly."}
                    </p>
                </div>
            </div>
        );
    }

    const settled = done || (!booking.can_respond ? booking.status : null);

    return (
        <div className="min-h-[100dvh] bg-[#F8F6FC] px-4 py-16">
            <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-8">
                <h1 className="text-xl font-semibold tracking-tight text-lumicoria-obsidian">
                    {booking.title}
                </h1>

                <dl className="mt-6 space-y-3 border-t border-gray-200 pt-5 text-sm">
                    <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-gray-500">When</dt>
                        <dd className="font-medium text-gray-900">
                            {formatFull(booking.start, tz)}
                            <span className="ml-2 font-normal text-gray-400">{offsetLabel(tz)}</span>
                        </dd>
                    </div>
                    <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-gray-500">Who</dt>
                        <dd className="text-gray-900">{booking.invitee_name}</dd>
                    </div>
                    <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-gray-500">Email</dt>
                        <dd>
                            <a
                                href={`mailto:${booking.invitee_email}`}
                                className="text-lumicoria-purple underline underline-offset-4"
                            >
                                {booking.invitee_email}
                            </a>
                        </dd>
                    </div>
                    {booking.invitee_notes && (
                        <div className="flex gap-3">
                            <dt className="w-28 shrink-0 text-gray-500">Note</dt>
                            <dd className="whitespace-pre-line text-gray-700">
                                {booking.invitee_notes}
                            </dd>
                        </div>
                    )}
                </dl>

                {settled ? (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <p className="text-sm font-medium text-gray-900">
                            {settled === "confirmed"
                                ? "Confirmed."
                                : settled === "declined"
                                  ? "Declined."
                                  : settled === "cancelled"
                                    ? "This booking was cancelled."
                                    : "Already handled."}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            {settled === "confirmed"
                                ? `${booking.invitee_name} has been emailed the meeting link.`
                                : settled === "declined"
                                  ? `${booking.invitee_name} has been notified.`
                                  : "No further action is needed."}
                        </p>
                        {settled === "confirmed" && booking.join_url && (
                            <a href={booking.join_url} className={`${primaryBtn} mt-5`}>
                                <Video className="h-4 w-4" />
                                Join the huddle
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <p className="mb-4 text-sm text-gray-600">
                            {suggested === "decline"
                                ? "Decline this request?"
                                : suggested === "approve"
                                  ? "Approve this request? It creates the huddle link and emails it over."
                                  : "This time is held until you respond."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => respond("approve")}
                                disabled={busy !== null}
                                className={primaryBtn}
                            >
                                {busy === "approve" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Approve
                            </button>
                            <button
                                type="button"
                                onClick={() => respond("decline")}
                                disabled={busy !== null}
                                className={ghostBtn}
                            >
                                {busy === "decline" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                                Decline
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
