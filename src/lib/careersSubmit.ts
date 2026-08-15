/**
 * Careers application submission.
 *
 * The backend is not up, so applications go straight to a Google Sheet via a
 * Google Apps Script Web App. See docs/CAREERS_SHEET_SETUP.md for the one-time
 * deploy, and scripts/careers-apps-script.gs for the receiving end.
 */

import { CAREERS_CONTACT_EMAIL } from '@/data/careers';

/** Apps Script Web App `/exec` URL. Unset in local dev → mailto fallback. */
const ENDPOINT = import.meta.env.VITE_CAREERS_ENDPOINT as string | undefined;

export const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_CV_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface ApplicationPayload {
    roleTitle: string;
    roleSlug: string;
    department: string;
    fullName: string;
    email: string;
    phone?: string;
    location: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    cvUrl?: string;
    coverNote: string;
    earliestStart?: string;
    heardFrom?: string;
    rightToWork: boolean;
    consent: boolean;
    /** Optional CV file, converted to base64 before transport. */
    cvFile?: File | null;
}

export type SubmitResult =
    | { ok: true }
    | { ok: false; reason: 'not-configured' | 'network' | 'server'; message: string };

/** Read a File as a base64 string (no data-URL prefix). */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result ?? '');
            // strip the "data:<mime>;base64," prefix
            resolve(result.slice(result.indexOf(',') + 1));
        };
        reader.onerror = () => reject(new Error('Could not read the file'));
        reader.readAsDataURL(file);
    });
}

/**
 * A prefilled email so a candidate is never stranded if the endpoint is
 * missing or down. Their application still reaches us.
 */
export function buildMailtoFallback(payload: ApplicationPayload): string {
    const body = [
        `Role: ${payload.roleTitle}`,
        `Name: ${payload.fullName}`,
        `Email: ${payload.email}`,
        payload.phone ? `Phone: ${payload.phone}` : null,
        `Location: ${payload.location}`,
        payload.portfolioUrl ? `Portfolio: ${payload.portfolioUrl}` : null,
        payload.linkedinUrl ? `LinkedIn: ${payload.linkedinUrl}` : null,
        payload.cvUrl ? `CV link: ${payload.cvUrl}` : null,
        payload.earliestStart ? `Earliest start: ${payload.earliestStart}` : null,
        payload.heardFrom ? `Heard about us via: ${payload.heardFrom}` : null,
        '',
        'Why this role:',
        payload.coverNote,
        '',
        payload.cvFile ? '(Please remember to attach your CV to this email.)' : '',
    ]
        .filter((line) => line !== null)
        .join('\n');

    return `mailto:${CAREERS_CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Application: ${payload.roleTitle}`,
    )}&body=${encodeURIComponent(body)}`;
}

export const isCareersEndpointConfigured = (): boolean => Boolean(ENDPOINT);

export async function submitApplication(payload: ApplicationPayload): Promise<SubmitResult> {
    if (!ENDPOINT) {
        return {
            ok: false,
            reason: 'not-configured',
            message: 'Applications are not connected yet. Use the email option below.',
        };
    }

    let cvFileName: string | undefined;
    let cvFileBase64: string | undefined;
    let cvMimeType: string | undefined;

    if (payload.cvFile) {
        if (payload.cvFile.size > MAX_CV_BYTES) {
            return { ok: false, reason: 'server', message: 'That file is larger than 5MB.' };
        }
        try {
            cvFileBase64 = await fileToBase64(payload.cvFile);
            cvFileName = payload.cvFile.name;
            cvMimeType = payload.cvFile.type;
        } catch {
            return { ok: false, reason: 'server', message: 'We could not read that file. Try a different one.' };
        }
    }

    const body = {
        submittedAt: new Date().toISOString(),
        roleTitle: payload.roleTitle,
        roleSlug: payload.roleSlug,
        department: payload.department,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone ?? '',
        location: payload.location,
        portfolioUrl: payload.portfolioUrl ?? '',
        linkedinUrl: payload.linkedinUrl ?? '',
        cvUrl: payload.cvUrl ?? '',
        coverNote: payload.coverNote,
        earliestStart: payload.earliestStart ?? '',
        heardFrom: payload.heardFrom ?? '',
        rightToWork: payload.rightToWork ? 'Yes' : 'No',
        consent: payload.consent ? 'Yes' : 'No',
        cvFileName: cvFileName ?? '',
        cvMimeType: cvMimeType ?? '',
        cvFileBase64: cvFileBase64 ?? '',
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            // IMPORTANT: text/plain keeps this a CORS "simple request" so the
            // browser skips the preflight OPTIONS call. Apps Script cannot
            // answer preflight, and this is the #1 cause of silent failures.
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(body),
            signal: controller.signal,
            redirect: 'follow',
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return { ok: false, reason: 'server', message: 'The server rejected the application.' };
        }

        // Apps Script returns JSON, but be forgiving about the shape.
        try {
            const data = await response.json();
            if (data && data.ok === false) {
                return { ok: false, reason: 'server', message: String(data.error ?? 'Submission failed.') };
            }
        } catch {
            /* A non-JSON 200 from Apps Script still means the row was written. */
        }

        return { ok: true };
    } catch {
        return {
            ok: false,
            reason: 'network',
            message: 'We could not reach the server. Check your connection, or email us instead.',
        };
    }
}
