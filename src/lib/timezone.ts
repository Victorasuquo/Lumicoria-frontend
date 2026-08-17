/**
 * Timezone helpers for booking.
 *
 * No date library is added for this. `Intl` ships in every browser we
 * support and handles daylight saving correctly, which is the only hard
 * part: a fixed UTC offset would silently drift by an hour twice a year.
 *
 * The backend sends and receives UTC instants. Everything here is about
 * displaying those instants in whichever zone the viewer picked.
 */

/** The viewer's own zone, e.g. "Europe/London". */
export function detectTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}

/**
 * Every IANA zone the browser knows.
 *
 * `supportedValuesOf` is not in older Safari, so fall back to a short list
 * that still covers our main regions rather than rendering an empty select.
 */
export function listTimezones(): string[] {
    try {
        const anyIntl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
        const zones = anyIntl.supportedValuesOf?.("timeZone");
        if (zones?.length) return zones;
    } catch {
        /* fall through */
    }
    return [
        "UTC",
        "Africa/Lagos",
        "Africa/Nairobi",
        "Africa/Johannesburg",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/New_York",
        "America/Sao_Paulo",
        "Asia/Dubai",
        "Asia/Kolkata",
        "Asia/Shanghai",
        "Asia/Singapore",
        "Asia/Tokyo",
        "Australia/Sydney",
        "Europe/Berlin",
        "Europe/London",
        "Europe/Paris",
    ];
}

/** "14:30" in the given zone. */
export function formatTime(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
    }).format(new Date(iso));
}

/** "Monday, 18 August" in the given zone. */
export function formatDayLong(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone,
    }).format(new Date(iso));
}

/** "Mon 18 Aug 2026, 14:30" in the given zone. */
export function formatFull(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
    }).format(new Date(iso));
}

/** Current UTC offset label, e.g. "GMT+1". Shown next to the zone picker. */
export function offsetLabel(timeZone: string): string {
    try {
        const parts = new Intl.DateTimeFormat("en", {
            timeZone,
            timeZoneName: "shortOffset",
        }).formatToParts(new Date());
        return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    } catch {
        return "";
    }
}

/**
 * The calendar date an instant falls on *in a given zone*, as "YYYY-MM-DD".
 *
 * Grouping slots by day has to use the viewer's zone, not the browser's and
 * not UTC: a 23:00 UTC slot is tomorrow in Tokyo and today in London, and
 * grouping it wrongly puts slots under the wrong heading.
 */
export function dayKeyInZone(iso: string, timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone,
    }).formatToParts(new Date(iso));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "YYYY-MM-DD" for a local Date, used for calendar cells. */
export function toDateKey(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const WEEKDAY_LABELS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
