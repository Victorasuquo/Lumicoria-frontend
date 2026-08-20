/**
 * Social media manager API.
 *
 * Typed on purpose, unlike the older `socialMediaApi` in ./api.ts which is
 * `any` throughout. The types here carry platform truth that the UI must not
 * get wrong — chiefly that a capability being false means the platform cannot
 * do it at all, and that a `null` metric is "not available from this
 * platform", which is a different thing from zero.
 *
 * Uses the shared `api` instance: every route here is authenticated, so the
 * 401-redirect interceptor is correct behaviour rather than a hazard.
 */

import api from './api';

// ── platform capabilities ────────────────────────────────────────────────

export type PlatformKey = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'tiktok';
export type AccountKind = 'personal' | 'page' | 'business' | 'creator';

/**
 * What one platform/account-kind pair can actually do.
 *
 * Read this rather than assuming parity. A LinkedIn personal profile can
 * publish but returns no reach data and has no comment API at any tier, so a
 * UI that assumes every account behaves alike promises things that cannot
 * happen.
 */
export interface ProviderCapability {
    platform: PlatformKey;
    kind: AccountKind;
    /** False when this platform's credentials are not in the environment yet. */
    configured: boolean;
    publish: boolean;
    publish_analytics: boolean;
    read_comments: boolean;
    reply_public: boolean;
    /** DM a commenter — the "comment K, get the link" pattern. Meta only. */
    reply_private: boolean;
    direct_messages: boolean;
    mentions: boolean;
    first_comment: boolean;
    max_body_chars: number;
    max_hashtags: number | null;
    messaging_window_hours: number | null;
    private_reply_window_hours: number | null;
}

// ── accounts ─────────────────────────────────────────────────────────────

export type AccountStatus = 'active' | 'expired' | 'revoked' | 'error';
export type ReplyMode = 'manual' | 'rules_only' | 'rules_then_ai' | 'ai';

export interface SocialAccount {
    id: string;
    org_id: string;
    provider: PlatformKey;
    kind: AccountKind;
    external_account_id: string;
    handle?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    status: AccountStatus;
    last_error?: string | null;
    reply_mode: ReplyMode;
    requires_approval: boolean;
    /** Automation is held off until this moment after connecting. */
    automation_allowed_from?: string | null;
    connected_at: string;
}

/** One selectable account returned by an OAuth exchange, before we persist it. */
export interface ConnectableAccount {
    kind: AccountKind;
    platform: PlatformKey;
    external_account_id: string;
    handle?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    parent_external_id?: string | null;
}

// ── posts ────────────────────────────────────────────────────────────────

export type PostStatus =
    | 'draft' | 'in_review' | 'changes_requested' | 'approved'
    | 'scheduled' | 'publishing' | 'published' | 'failed' | 'partial';

export interface PostVariant {
    account_id: string;
    provider: PlatformKey;
    body: string;
    media: Array<Record<string, unknown>>;
    first_comment?: string | null;
    status: PostStatus;
    external_post_id?: string | null;
    permalink?: string | null;
    error?: string | null;
    published_at?: string | null;
}

export interface SocialPost {
    id: string;
    org_id: string;
    idea?: string | null;
    variants: PostVariant[];
    campaign?: string | null;
    status: PostStatus;
    scheduled_for?: string | null;
    scheduled_timezone?: string | null;
    approved_by?: string | null;
    approved_at?: string | null;
    review_note?: string | null;
    created_at: string;
}

// ── inbox ────────────────────────────────────────────────────────────────

export type CommentStatus = 'new' | 'needs_human' | 'replied' | 'ignored' | 'hidden';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type CommentIntent =
    | 'question' | 'praise' | 'complaint' | 'crisis' | 'spam' | 'keyword' | 'other';

export interface SocialComment {
    id: string;
    account_id: string;
    post_id?: string | null;
    provider: PlatformKey;
    external_comment_id: string;
    author_handle?: string | null;
    author_avatar_url?: string | null;
    text: string;
    sentiment?: Sentiment | null;
    intent?: CommentIntent | null;
    status: CommentStatus;
    like_count: number;
    created_at: string;
}

export interface SocialConversation {
    id: string;
    account_id: string;
    provider: PlatformKey;
    external_thread_id: string;
    participant_handle?: string | null;
    participant_avatar_url?: string | null;
    last_message_at?: string | null;
    unread_count: number;
    status: 'open' | 'snoozed' | 'closed';
    /** Meta only allows a reply within 24h of THEIR last message. */
    window_open: boolean;
    window_hours_left: number;
}

export interface SocialMessage {
    id: string;
    conversation_id: string;
    direction: 'in' | 'out';
    body: string;
    source: 'manual' | 'rule' | 'ai';
    created_at: string;
}

export interface SocialMention {
    id: string;
    account_id: string;
    provider: PlatformKey;
    external_post_id: string;
    author_handle?: string | null;
    text: string;
    permalink?: string | null;
    sentiment?: Sentiment | null;
    captured_at: string;
}

// ── rules ────────────────────────────────────────────────────────────────

export type TriggerType = 'exact' | 'contains' | 'regex';
export type ReplyChannel = 'public' | 'private';

export interface ReplyRule {
    id: string;
    account_id?: string | null;
    name?: string | null;
    trigger: string;
    trigger_type: TriggerType;
    channel: ReplyChannel;
    body: string;
    link?: string | null;
    once_per_user: boolean;
    priority: number;
    fallthrough_to_ai: boolean;
    is_active: boolean;
    match_count: number;
}

export interface RuleTestResult {
    matched: boolean;
    rule_id?: string;
    name?: string | null;
    channel?: ReplyChannel;
    rendered?: string;
    /** What the sample reduced to — shown on a miss so the author can see why. */
    normalized?: string;
}

// ── analytics ────────────────────────────────────────────────────────────

/**
 * `null` means the platform does not expose that metric, which is NOT zero.
 * Render "not available", never 0 — a silent zero reads as "nobody saw my
 * post" and is a credibility problem in a client report.
 */
export interface AnalyticsTotals {
    impressions: number | null;
    reach: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    clicks: number | null;
}

export interface SocialAnalytics {
    range_days: number;
    computed_at: string;
    posts_measured: number;
    connected_accounts: number;
    totals: AnalyticsTotals;
    by_provider: Record<string, {
        posts: number;
        impressions: number | null;
        reach: number | null;
        engagements: number;
    }>;
    usage: {
        posts_this_month: number;
        ai_replies_this_month: number;
        /** Set when a plan cap forced this org down to rules_only. */
        degraded_at?: string | null;
    };
}

export interface PlatformVariant {
    platform: PlatformKey;
    body?: string;
    characters?: number;
    limit?: number;
    truncated?: boolean;
    error?: string;
}

export interface WeekPlanSlot {
    scheduled_for: string;
    weekday: number;
    hour: number;
    avg_engagement: number | null;
    samples: number;
}

export interface WeekPlan {
    slots: WeekPlanSlot[];
    /** False when there is too little history — the note explains it. */
    grounded_in_history: boolean;
    note: string;
    samples_considered: number;
}

// ── client ───────────────────────────────────────────────────────────────

export const socialApi = {
    listProviders: async (): Promise<{ providers: ProviderCapability[] }> =>
        (await api.get('/social/providers')).data,

    startOAuth: async (provider: PlatformKey): Promise<{ authorize_url: string; state: string }> =>
        (await api.post(`/social/oauth/${provider}/start`)).data,

    connectAccount: async (payload: ConnectableAccount & { state: string }): Promise<SocialAccount> =>
        (await api.post('/social/accounts/connect', payload)).data,

    listAccounts: async (): Promise<SocialAccount[]> =>
        (await api.get('/social/accounts')).data,

    updateAccount: async (
        id: string,
        payload: { reply_mode?: ReplyMode; requires_approval?: boolean },
    ): Promise<SocialAccount> =>
        (await api.patch(`/social/accounts/${id}`, payload)).data,

    disconnectAccount: async (id: string): Promise<{ disconnected: boolean }> =>
        (await api.delete(`/social/accounts/${id}`)).data,

    createPost: async (payload: {
        idea?: string;
        variants: Array<{ account_id: string; body: string; media?: unknown[]; first_comment?: string }>;
        campaign?: string;
        scheduled_for?: string;
        ai_generated?: boolean;
    }): Promise<{ id: string; warnings: string[]; status: PostStatus }> =>
        (await api.post('/social/posts', payload)).data,

    listPosts: async (status?: PostStatus): Promise<SocialPost[]> =>
        (await api.get('/social/posts', { params: status ? { status } : {} })).data,

    submitPost: async (id: string): Promise<SocialPost> =>
        (await api.post(`/social/posts/${id}/submit`)).data,
    approvePost: async (id: string): Promise<SocialPost> =>
        (await api.post(`/social/posts/${id}/approve`)).data,
    requestChanges: async (id: string, note: string): Promise<SocialPost> =>
        (await api.post(`/social/posts/${id}/request-changes`, { note })).data,
    schedulePost: async (id: string, scheduled_for: string, tz?: string): Promise<SocialPost> =>
        (await api.post(`/social/posts/${id}/schedule`, {
            scheduled_for, scheduled_timezone: tz,
        })).data,
    publishPost: async (id: string): Promise<{ status: PostStatus; published: number; total: number }> =>
        (await api.post(`/social/posts/${id}/publish`)).data,

    listComments: async (params?: { status?: CommentStatus; account_id?: string }): Promise<SocialComment[]> =>
        (await api.get('/social/comments', { params })).data,

    replyToComment: async (
        id: string,
        payload: { body?: string; channel?: ReplyChannel; use_ai?: boolean },
    ): Promise<{ action: string; body: string; reason?: string }> =>
        (await api.post(`/social/comments/${id}/reply`, payload)).data,

    draftReply: async (id: string): Promise<{ draft: string; model: string }> =>
        (await api.post(`/social/comments/${id}/draft`)).data,

    listConversations: async (): Promise<SocialConversation[]> =>
        (await api.get('/social/conversations')).data,
    listMessages: async (id: string): Promise<SocialMessage[]> =>
        (await api.get(`/social/conversations/${id}/messages`)).data,
    sendMessage: async (id: string, body: string): Promise<{ sent: boolean }> =>
        (await api.post(`/social/conversations/${id}/send`, { body })).data,

    listMentions: async (): Promise<SocialMention[]> =>
        (await api.get('/social/mentions')).data,

    listRules: async (): Promise<ReplyRule[]> =>
        (await api.get('/social/rules')).data,
    createRule: async (payload: Partial<ReplyRule> & { trigger: string; body: string }): Promise<{ id: string }> =>
        (await api.post('/social/rules', payload)).data,
    deleteRule: async (id: string): Promise<{ deleted: boolean }> =>
        (await api.delete(`/social/rules/${id}`)).data,
    testRules: async (sample: string, account_id?: string): Promise<RuleTestResult> =>
        (await api.post('/social/rules/test', { sample, account_id })).data,

    analytics: async (range_days = 30): Promise<SocialAnalytics> =>
        (await api.get('/social/analytics', { params: { range_days } })).data,

    adaptForPlatforms: async (payload: {
        idea: string; platforms?: string[]; tone?: string;
    }): Promise<{ idea: string; variants: PlatformVariant[] }> =>
        (await api.post('/social/adapt', payload)).data,

    planWeek: async (payload: { posts_per_week?: number; platforms?: string[] }): Promise<WeekPlan> =>
        (await api.post('/social/plan-week', payload)).data,
};

// ── display helpers ──────────────────────────────────────────────────────

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    x: 'X',
    tiktok: 'TikTok',
};

/**
 * Format a metric that may legitimately be unknown.
 *
 * The whole reason this exists: showing 0 where a platform simply does not
 * report the number is worse than showing nothing, because a customer reads
 * it as a result rather than as a gap.
 */
export function formatMetric(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'Not available';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
}

/** The one-line truth about what an account can and cannot do. */
export function capabilitySummary(cap: ProviderCapability): string {
    const has: string[] = [];
    const missing: string[] = [];
    if (cap.publish) has.push('publishing');
    cap.publish_analytics ? has.push('reach data') : missing.push('reach data');
    cap.read_comments ? has.push('comments') : missing.push('comments');
    if (cap.direct_messages) has.push('DMs');
    let summary = has.length ? has.join(', ') : 'nothing yet';
    if (missing.length) summary += ` — no ${missing.join(' or ')}`;
    return summary.charAt(0).toUpperCase() + summary.slice(1);
}

/** Extract the backend's structured error message, including 402 plan caps. */
export function socialError(error: unknown, fallback = 'Something went wrong'): string {
    const err = error as { response?: { data?: { detail?: unknown } }; message?: string };
    const detail = err?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object') {
        const asRecord = detail as { message?: string };
        if (asRecord.message) return asRecord.message;
    }
    return err?.message || fallback;
}

// ── calendar, media, links, roles, reports ───────────────────────────────

export interface CalendarPost extends SocialPost {
    /** The date the calendar places it on: when due, or when it went out. */
    calendar_at: string;
}

export interface MediaAsset {
    id: string;
    s3_key: string;
    kind: 'image' | 'video';
    mime: string;
    size_bytes: number;
    width?: number | null;
    height?: number | null;
    alt_text?: string | null;
    created_at?: string;
    /** Presigned — unpublished creative is not left openly readable. */
    url: string;
    /** Which platforms will crop this. Advisory, not blocking. */
    warnings?: string[];
}

export interface TrackedLink {
    id: string;
    short_code: string;
    short_url: string;
    target_url: string;
    utm_campaign?: string | null;
    click_count: number;
    last_clicked_at?: string | null;
    created_at: string;
}

export interface TrackUrlResult {
    provider: PlatformKey;
    external_post_id: string;
    /** False when the post is not on a connected account — public metrics only. */
    owned: boolean;
    note: string;
}

export type SocialRoleKey =
    | 'social_viewer' | 'social_drafter' | 'social_approver' | 'social_admin';

export interface SocialRoles {
    roles: Array<{ user_id: string; role: SocialRoleKey; updated_at?: string }>;
    your_role: SocialRoleKey | null;
    requirements: Record<string, SocialRoleKey>;
}

export const socialExtras = {
    calendar: async (from: string, to: string): Promise<CalendarPost[]> =>
        (await api.get('/social/calendar', { params: { from, to } })).data,

    listMedia: async (): Promise<MediaAsset[]> =>
        (await api.get('/social/media')).data,

    uploadMedia: async (file: File, altText?: string): Promise<MediaAsset> => {
        const form = new FormData();
        form.append('file', file);
        if (altText) form.append('alt_text', altText);
        return (await api.post('/social/media', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })).data;
    },

    deleteMedia: async (id: string): Promise<{ deleted: boolean }> =>
        (await api.delete(`/social/media/${id}`)).data,

    listLinks: async (): Promise<TrackedLink[]> =>
        (await api.get('/social/links')).data,

    createLink: async (payload: {
        target_url: string; campaign?: string; provider?: string;
    }): Promise<TrackedLink> => (await api.post('/social/links', payload)).data,

    trackUrl: async (url: string): Promise<TrackUrlResult> =>
        (await api.post('/social/track-url', { url })).data,

    roles: async (): Promise<SocialRoles> => (await api.get('/social/roles')).data,

    setRole: async (user_id: string, role: SocialRoleKey) =>
        (await api.put('/social/roles', { user_id, role })).data,

    claimComment: async (id: string): Promise<{ claimed: boolean }> =>
        (await api.post(`/social/comments/${id}/claim`)).data,

    addNote: async (id: string, body: string) =>
        (await api.post(`/social/comments/${id}/notes`, { body })).data,

    listNotes: async (id: string): Promise<Array<{ id: string; body: string; created_at: string }>> =>
        (await api.get(`/social/comments/${id}/notes`)).data,

    /**
     * Download the branded PDF.
     *
     * Fetched as a blob and saved client-side rather than opened in a tab, so
     * the browser keeps the filename we set instead of naming it after the id.
     */
    downloadReport: async (days = 30, orgName?: string): Promise<void> => {
        const response = await api.get('/social/report', {
            params: { days, org_name: orgName },
            responseType: 'blob',
        });
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `social-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    },
};

export interface ReportSchedule {
    enabled: boolean;
    cadence: 'weekly' | 'monthly';
    recipients: string[];
    org_name?: string | null;
    next_run_at?: string | null;
    last_run_at?: string | null;
}

export const socialSchedule = {
    get: async (): Promise<ReportSchedule> =>
        (await api.get('/social/report/schedule')).data,

    set: async (payload: {
        cadence: 'weekly' | 'monthly';
        recipients: string[];
        org_name?: string;
        enabled: boolean;
    }): Promise<ReportSchedule> =>
        (await api.put('/social/report/schedule', payload)).data,

    /**
     * Move a scheduled post.
     *
     * Distinct from scheduling: this accepts posts that are already scheduled
     * and leaves their approval intact, so dragging one across the calendar
     * does not quietly send it back for review.
     */
    reschedule: async (postId: string, scheduledFor: Date): Promise<SocialPost> =>
        (await api.patch(`/social/posts/${postId}/reschedule`, {
            scheduled_for: scheduledFor.toISOString(),
        })).data,
};
