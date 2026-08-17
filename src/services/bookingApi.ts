/**
 * Booking API.
 *
 * Two clients on purpose:
 *
 *   `bookingApi`       host-side, authenticated, uses the shared `api`
 *                      instance so tokens and refresh work normally.
 *
 *   `bookingPublicApi` visitor-side, anonymous. Uses its own axios instance
 *                      with NO interceptors, because the shared instance
 *                      redirects to /login on any 401 and would throw an
 *                      external visitor off the booking page mid-flow.
 *                      Same reasoning as `publicApi` in ./api.ts.
 */

import axios from "axios";
import api from "./api";

const publicClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
});

// ── Types ─────────────────────────────────────────────────────────────

export type ConfirmationMode = "instant" | "approval";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "declined";

export interface BookingQuestion {
    id: string;
    label: string;
    type: "text" | "textarea" | "select";
    required: boolean;
    options: string[];
}

export interface BookingType {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    duration_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    min_notice_minutes: number;
    max_days_ahead: number;
    confirmation_mode: ConfirmationMode;
    questions: BookingQuestion[];
    color: string;
    location_note?: string | null;
    is_active: boolean;
}

export interface AvailabilityRule {
    id: string;
    weekday: number; // 0 = Monday
    start_time: string; // "09:00"
    end_time: string; // "17:00"
    timezone: string;
    booking_type_id?: string | null;
}

export interface AvailabilityOverride {
    id: string;
    date: string; // "2026-08-20"
    is_unavailable: boolean;
    windows: { start_time: string; end_time: string }[];
    timezone: string;
    note?: string | null;
}

export interface Booking {
    id: string;
    booking_type_id: string;
    invitee_name: string;
    invitee_email: string;
    invitee_timezone: string;
    invitee_notes?: string | null;
    answers: { id: string; label?: string; value: string }[];
    start: string;
    end: string;
    status: BookingStatus;
    huddle_share_token?: string | null;
    cancel_token: string;
}

/** What a visitor sees. Deliberately narrower than the host-side type. */
export interface PublicBookingType {
    slug: string;
    title: string;
    description?: string | null;
    duration_minutes: number;
    color: string;
    location_note?: string | null;
    requires_approval: boolean;
    questions: BookingQuestion[];
    max_days_ahead: number;
}

export interface PublicBookingPage {
    handle: string;
    display_name: string;
    avatar_url?: string | null;
    booking_types: PublicBookingType[];
}

export interface Slot {
    start: string; // ISO, UTC
    end: string;
}

export interface BookingResult {
    status: BookingStatus;
    start: string;
    end: string;
    invitee_timezone: string;
    title: string;
    join_url: string | null;
    manage_url: string;
    requires_approval: boolean;
}

// ── Host side (authenticated) ─────────────────────────────────────────

export const bookingApi = {
    getHandle: async (): Promise<{ handle: string | null; suggestion: string | null }> => {
        const { data } = await api.get("/booking/handle");
        return data;
    },
    setHandle: async (handle: string): Promise<{ handle: string }> => {
        const { data } = await api.put("/booking/handle", { handle });
        return data;
    },
    checkHandle: async (handle: string): Promise<boolean> => {
        const { data } = await api.get("/booking/handle/available", { params: { handle } });
        return data.available;
    },

    listTypes: async (): Promise<BookingType[]> => {
        const { data } = await api.get("/booking/types");
        return data;
    },
    createType: async (payload: Partial<BookingType>): Promise<BookingType> => {
        const { data } = await api.post("/booking/types", payload);
        return data;
    },
    updateType: async (id: string, payload: Partial<BookingType>): Promise<BookingType> => {
        const { data } = await api.put(`/booking/types/${id}`, payload);
        return data;
    },
    deleteType: async (id: string): Promise<void> => {
        await api.delete(`/booking/types/${id}`);
    },

    listAvailability: async (bookingTypeId?: string): Promise<AvailabilityRule[]> => {
        const { data } = await api.get("/booking/availability", {
            params: bookingTypeId ? { booking_type_id: bookingTypeId } : {},
        });
        return data;
    },
    /** Replaces the whole weekly schedule in one call. */
    saveAvailability: async (
        rules: Omit<AvailabilityRule, "id">[],
        bookingTypeId?: string,
    ): Promise<AvailabilityRule[]> => {
        const { data } = await api.put("/booking/availability", {
            rules,
            booking_type_id: bookingTypeId ?? null,
        });
        return data;
    },

    listOverrides: async (from?: string, to?: string): Promise<AvailabilityOverride[]> => {
        const { data } = await api.get("/booking/overrides", {
            params: { date_from: from, date_to: to },
        });
        return data;
    },
    createOverride: async (
        payload: Partial<AvailabilityOverride>,
    ): Promise<AvailabilityOverride> => {
        const { data } = await api.post("/booking/overrides", payload);
        return data;
    },
    deleteOverride: async (id: string): Promise<void> => {
        await api.delete(`/booking/overrides/${id}`);
    },

    listBookings: async (params?: {
        status?: BookingStatus;
        upcoming_only?: boolean;
    }): Promise<Booking[]> => {
        const { data } = await api.get("/booking/bookings", { params });
        return data;
    },
    approve: async (id: string): Promise<Booking> => {
        const { data } = await api.post(`/booking/bookings/${id}/approve`);
        return data;
    },
    decline: async (id: string, reason?: string): Promise<Booking> => {
        const { data } = await api.post(`/booking/bookings/${id}/decline`, { reason });
        return data;
    },
    cancel: async (id: string, reason?: string): Promise<Booking> => {
        const { data } = await api.post(`/booking/bookings/${id}/cancel`, { reason });
        return data;
    },
};

// ── Visitor side (anonymous) ──────────────────────────────────────────

export const bookingPublicApi = {
    getPage: async (handle: string): Promise<PublicBookingPage> => {
        const { data } = await publicClient.get(`/public/booking/${handle}`);
        return data;
    },
    getType: async (handle: string, slug: string): Promise<PublicBookingType & { display_name: string }> => {
        const { data } = await publicClient.get(`/public/booking/${handle}/${slug}`);
        return data;
    },
    getSlots: async (
        handle: string,
        slug: string,
        from: string,
        to: string,
    ): Promise<{ duration_minutes: number; slots: Slot[] }> => {
        const { data } = await publicClient.get(`/public/booking/${handle}/${slug}/slots`, {
            params: { from, to },
        });
        return data;
    },
    book: async (
        handle: string,
        slug: string,
        payload: {
            start: string;
            invitee_name: string;
            invitee_email: string;
            invitee_timezone: string;
            invitee_notes?: string;
            answers?: { id: string; value: string }[];
        },
    ): Promise<BookingResult> => {
        const { data } = await publicClient.post(`/public/booking/${handle}/${slug}`, payload);
        return data;
    },
    getByToken: async (token: string) => {
        const { data } = await publicClient.get(`/public/booking/manage/${token}`);
        return data;
    },
    cancelByToken: async (token: string, reason?: string) => {
        const { data } = await publicClient.post(`/public/booking/manage/${token}/cancel`, {
            reason,
        });
        return data;
    },
};

export default bookingApi;
