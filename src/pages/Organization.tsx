/**
 * Phase 8 — Organization settings page.
 *
 * Surfaces:
 *   • Org header (name + logo) — editable inline for admins/owner.
 *   • Members table with role chips, role change, remove, transfer ownership.
 *   • Invite-by-email modal that hooks into the Phase 5 invite flow.
 *   • Pending invites tab with resend / revoke.
 *   • Danger zone: leave org (visible to non-owners).
 *
 * Apple-iOS visual pass — soft cards, calm gradients, no AI-slop emojis.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Building2,
    Users,
    Mail,
    Shield,
    Crown,
    Loader2,
    UserPlus,
    Trash2,
    RefreshCcw,
    X,
    Check,
    ChevronDown,
    ArrowLeft,
    Globe,
    Sparkles,
    Send,
    AlertTriangle,
    LogOut,
    UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    organizationApi,
    OrganizationItem,
    OrgMemberItem,
    OrgInviteItem,
    OrgStats,
    getErrorMessage,
    InviteRole,
    resolveAvatarUrl,
} from "@/services/api";

// ── Helpers ────────────────────────────────────────────────────────────

function initials(label: string): string {
    const cleaned = (label || "").replace(/[<>]/g, "").trim();
    if (!cleaned) return "?";
    if (cleaned.includes("@")) return cleaned[0].toUpperCase();
    return (
        cleaned
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() || "")
            .join("") || "?"
    );
}

function fmtDate(d?: string | null): string {
    if (!d) return "";
    try {
        return new Date(d).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "";
    }
}

const ROLE_BADGE: Record<string, string> = {
    owner: "bg-amber-100 text-amber-700 border-amber-200",
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    member: "bg-gray-100 text-gray-600 border-gray-200",
};

const INVITE_STATUS_BADGE: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
    revoked: "bg-red-100 text-red-600 border-red-200",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Page ───────────────────────────────────────────────────────────────

export default function Organization(): JSX.Element {
    const { toast } = useToast();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<OrganizationItem | null>(null);
    const [members, setMembers] = useState<OrgMemberItem[]>([]);
    const [invites, setInvites] = useState<OrgInviteItem[]>([]);
    const [stats, setStats] = useState<OrgStats | null>(null);
    const [activeTab, setActiveTab] = useState<"members" | "invites" | "settings">("members");

    // Inline header edits
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const [savingHeader, setSavingHeader] = useState(false);

    // Invite modal
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<InviteRole>("member");
    const [inviteMessage, setInviteMessage] = useState("");
    const [sendingInvite, setSendingInvite] = useState(false);

    // Per-member action state — keyed by user_id so we can disable just that row.
    const [memberBusy, setMemberBusy] = useState<Record<string, string>>({});

    const isAdmin = org?.my_role === "admin" || org?.my_role === "owner";
    const isOwner = org?.my_role === "owner";

    // ── Loaders ────────────────────────────────────────────────────────
    const refreshAll = useCallback(async (orgId?: string) => {
        try {
            const baseOrg = orgId
                ? await organizationApi.getOrg(orgId)
                : await organizationApi.getMyOrg();
            setOrg(baseOrg);
            setNameDraft(baseOrg.name);

            const [m, s, inv] = await Promise.all([
                organizationApi.listMembers(baseOrg.id, { limit: 200 }),
                organizationApi.stats(baseOrg.id),
                organizationApi.listInvites(baseOrg.id, { limit: 200 }),
            ]);
            setMembers(m.items);
            setStats(s);
            setInvites(inv.items);
        } catch (e: any) {
            const status = e?.response?.status;
            // 404 from /me is the "you don't belong to an org yet" path —
            // we render the create-org form instead of toasting an error.
            if (status === 404 && !orgId) {
                setOrg(null);
                return;
            }
            toast({
                title: "Could not load organization",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        setLoading(true);
        refreshAll().finally(() => setLoading(false));
    }, [refreshAll]);

    // ── Header edits ──────────────────────────────────────────────────
    const handleSaveName = async () => {
        if (!org) return;
        const next = nameDraft.trim();
        if (!next) {
            toast({ title: "Name can't be empty", variant: "destructive" });
            return;
        }
        if (next === org.name) {
            setEditingName(false);
            return;
        }
        setSavingHeader(true);
        try {
            const updated = await organizationApi.updateOrg(org.id, { name: next });
            setOrg({ ...org, name: updated.name, updated_at: updated.updated_at });
            setEditingName(false);
            toast({ title: "Organization name updated" });
        } catch (e) {
            toast({
                title: "Could not save",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setSavingHeader(false);
        }
    };

    const handleSaveLogoUrl = async (logoUrl: string | null) => {
        if (!org) return;
        try {
            const updated = await organizationApi.updateOrg(org.id, { logo_url: logoUrl });
            setOrg({ ...org, logo_url: updated.logo_url });
            toast({ title: logoUrl ? "Logo updated" : "Logo cleared" });
        } catch (e) {
            toast({
                title: "Could not save logo",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        }
    };

    // ── Member actions ────────────────────────────────────────────────
    const setBusy = (uid: string, action: string | null) => {
        setMemberBusy((prev) => {
            const next = { ...prev };
            if (!action) delete next[uid];
            else next[uid] = action;
            return next;
        });
    };

    const handleRoleChange = async (m: OrgMemberItem, role: "admin" | "member") => {
        if (!org) return;
        setBusy(m.id, "role");
        try {
            await organizationApi.updateMemberRole(org.id, m.id, role);
            await refreshAll(org.id);
            toast({ title: `${m.full_name || m.email} is now an ${role}` });
        } catch (e) {
            toast({
                title: "Could not update role",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setBusy(m.id, null);
        }
    };

    const handleRemoveMember = async (m: OrgMemberItem) => {
        if (!org) return;
        if (!window.confirm(`Remove ${m.full_name || m.email} from ${org.name}?`)) return;
        setBusy(m.id, "remove");
        try {
            await organizationApi.removeMember(org.id, m.id);
            await refreshAll(org.id);
            toast({ title: "Member removed" });
        } catch (e) {
            toast({
                title: "Could not remove member",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setBusy(m.id, null);
        }
    };

    const handleTransferOwnership = async (m: OrgMemberItem) => {
        if (!org) return;
        if (!window.confirm(`Transfer ownership of ${org.name} to ${m.full_name || m.email}? You'll become an admin.`)) return;
        setBusy(m.id, "transfer");
        try {
            await organizationApi.transferOwnership(org.id, m.id);
            await refreshAll(org.id);
            toast({ title: "Ownership transferred" });
        } catch (e) {
            toast({
                title: "Could not transfer ownership",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setBusy(m.id, null);
        }
    };

    const handleLeave = async () => {
        if (!org) return;
        if (isOwner) {
            toast({
                title: "Transfer ownership first",
                description: "Owners can't leave until they hand off the org.",
                variant: "destructive",
            });
            return;
        }
        if (!window.confirm(`Leave ${org.name}? You'll lose access to its content.`)) return;
        try {
            await organizationApi.leaveOrg(org.id);
            toast({ title: "You left the organization" });
            window.location.href = "/dashboard";
        } catch (e) {
            toast({
                title: "Could not leave",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        }
    };

    // ── Invite actions ────────────────────────────────────────────────
    /** Split the textarea on commas / newlines / semicolons → cleaned list. */
    const parseEmailList = (raw: string): string[] => {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const piece of raw.split(/[,\n;]+/)) {
            const e = piece.trim().toLowerCase();
            if (!e || seen.has(e)) continue;
            seen.add(e);
            out.push(e);
        }
        return out;
    };

    const handleSendInvite = async () => {
        if (!org) return;
        const emails = parseEmailList(inviteEmail);
        if (emails.length === 0) {
            toast({ title: "Enter at least one email", variant: "destructive" });
            return;
        }
        const malformed = emails.filter((e) => !EMAIL_REGEX.test(e));
        if (malformed.length > 0) {
            toast({
                title: `${malformed.length} address${malformed.length === 1 ? "" : "es"} look${malformed.length === 1 ? "s" : ""} invalid`,
                description: malformed.slice(0, 3).join(", ") + (malformed.length > 3 ? "…" : ""),
                variant: "destructive",
            });
            return;
        }

        setSendingInvite(true);
        try {
            // Single email → keep the legacy single-result toast.  Multi →
            // surface the per-recipient breakdown.
            if (emails.length === 1) {
                await organizationApi.sendInvite(org.id, {
                    email: emails[0],
                    role: inviteRole,
                    message: inviteMessage.trim() || undefined,
                });
                toast({ title: `Invite sent to ${emails[0]}` });
            } else {
                const res = await organizationApi.sendInvitesBulk(org.id, {
                    emails,
                    role: inviteRole,
                    message: inviteMessage.trim() || undefined,
                });
                const { sent, skipped, failed, total } = res.summary;
                const parts: string[] = [];
                parts.push(`${sent}/${total} sent`);
                if (skipped > 0) parts.push(`${skipped} already a member`);
                if (failed > 0) parts.push(`${failed} failed`);
                const variant = failed === total ? "destructive" : "default";
                const failedRows = res.results.filter((r) => r.status === "failed");
                toast({
                    title: parts.join(" · "),
                    description: failedRows.length
                        ? `Failed: ${failedRows.slice(0, 3).map((r) => r.email).join(", ")}${failedRows.length > 3 ? "…" : ""}`
                        : undefined,
                    variant: variant as any,
                });
            }
            setShowInvite(false);
            setInviteEmail("");
            setInviteRole("member");
            setInviteMessage("");
            await refreshAll(org.id);
        } catch (e) {
            toast({
                title: "Could not send invites",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setSendingInvite(false);
        }
    };

    const handleResendInvite = async (inv: OrgInviteItem) => {
        if (!org) return;
        try {
            await organizationApi.resendInvite(org.id, inv.id);
            await refreshAll(org.id);
            toast({ title: `Invite re-sent to ${inv.email}` });
        } catch (e) {
            toast({
                title: "Could not resend",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        }
    };

    const handleRevokeInvite = async (inv: OrgInviteItem) => {
        if (!org) return;
        if (!window.confirm(`Revoke the invite to ${inv.email}?`)) return;
        try {
            await organizationApi.revokeInvite(org.id, inv.id);
            await refreshAll(org.id);
            toast({ title: "Invite revoked" });
        } catch (e) {
            toast({
                title: "Could not revoke",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        }
    };

    // ── Derived ───────────────────────────────────────────────────────
    const pendingInvitesCount = useMemo(
        () => invites.filter((i) => i.status === "pending").length,
        [invites],
    );

    // ── Render ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
                <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading organization…</span>
                </div>
            </div>
        );
    }

    if (!org) {
        return (
            <CreateOrgEmptyState
                onCreated={async (created) => {
                    await refreshAll(created.id);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top nav */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        to="/dashboard"
                        className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
                    >
                        <ArrowLeft size={12} /> Back to dashboard
                    </Link>
                    {!isOwner && (
                        <button
                            onClick={handleLeave}
                            className="text-xs text-gray-400 hover:text-red-600 inline-flex items-center gap-1"
                        >
                            <LogOut size={12} /> Leave organization
                        </button>
                    )}
                </div>

                {/* Header card */}
                <motion.section
                    layout
                    className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 flex items-center gap-4">
                        {/* Logo / initial */}
                        <div
                            className="flex-none h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-lg font-semibold shadow-inner overflow-hidden"
                            title={org.name}
                        >
                            {org.logo_url ? (
                                <img
                                    src={org.logo_url}
                                    alt={org.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials(org.name)
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            {editingName && isAdmin ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="text-xl font-semibold text-gray-900 bg-white border-b border-purple-200 focus:border-purple-500 outline-none flex-1 min-w-0"
                                        autoFocus
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSaveName}
                                        disabled={savingHeader}
                                        className="bg-purple-600 hover:bg-purple-700 text-white h-8"
                                    >
                                        {savingHeader ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Check size={12} />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingName(false);
                                            setNameDraft(org.name);
                                        }}
                                        className="h-8"
                                    >
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => isAdmin && setEditingName(true)}
                                    className={`text-xl font-semibold text-gray-900 truncate ${isAdmin ? "hover:bg-gray-50 px-1 -mx-1 rounded transition-colors" : ""}`}
                                    title={isAdmin ? "Click to rename" : org.name}
                                >
                                    {org.name}
                                </button>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                                {org.industry && (
                                    <span className="inline-flex items-center gap-1">
                                        <Sparkles size={10} /> {org.industry}
                                    </span>
                                )}
                                {org.website && (
                                    <a
                                        href={org.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700"
                                    >
                                        <Globe size={10} /> Website
                                    </a>
                                )}
                                {org.created_at && (
                                    <span>· Created {fmtDate(org.created_at)}</span>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => setShowInvite(true)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-sm"
                            >
                                <UserPlus size={14} className="mr-1.5" /> Invite member
                            </Button>
                        )}
                    </div>

                    {/* Stats strip */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-px bg-gray-100 border-t border-gray-100">
                            <div className="bg-white px-6 py-3">
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Members</p>
                                <p className="text-lg font-semibold text-gray-900 mt-0.5">{stats.members}</p>
                            </div>
                            <div className="bg-white px-6 py-3">
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Admins</p>
                                <p className="text-lg font-semibold text-gray-900 mt-0.5">{stats.admins}</p>
                            </div>
                            <div className="bg-white px-6 py-3">
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Pending invites</p>
                                <p className="text-lg font-semibold text-gray-900 mt-0.5">{stats.pending_invites}</p>
                            </div>
                        </div>
                    )}
                </motion.section>

                {/* Tabs */}
                <div className="mt-6 flex items-center gap-1 border-b border-gray-200">
                    <TabButton
                        active={activeTab === "members"}
                        onClick={() => setActiveTab("members")}
                        icon={<Users size={12} />}
                        label="Members"
                        count={members.length}
                    />
                    <TabButton
                        active={activeTab === "invites"}
                        onClick={() => setActiveTab("invites")}
                        icon={<Mail size={12} />}
                        label="Invites"
                        count={pendingInvitesCount}
                    />
                    {isAdmin && (
                        <TabButton
                            active={activeTab === "settings"}
                            onClick={() => setActiveTab("settings")}
                            icon={<UserCog size={12} />}
                            label="Settings"
                        />
                    )}
                </div>

                {/* Tab content */}
                <div className="mt-4">
                    <AnimatePresence mode="wait">
                        {activeTab === "members" && (
                            <motion.div
                                key="members"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden"
                            >
                                <table className="w-full">
                                    <thead className="bg-gray-50/70 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5">Member</th>
                                            <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5">Role</th>
                                            <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5 hidden sm:table-cell">Joined</th>
                                            {isAdmin && <th />}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((m) => {
                                            const isMe = m.id === user?.id;
                                            const busy = memberBusy[m.id];
                                            const canManage = isAdmin && !isMe && m.role !== "owner";
                                            return (
                                                <tr key={m.id} className="border-b border-gray-50 last:border-b-0 hover:bg-purple-50/30 transition-colors">
                                                    <td className="px-4 py-3 align-middle">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="flex-none w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold flex items-center justify-center overflow-hidden">
                                                                {resolveAvatarUrl(m.profile_picture) ? (
                                                                    <img src={resolveAvatarUrl(m.profile_picture)} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    initials(m.full_name || m.email)
                                                                )}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="text-sm text-gray-900 truncate">
                                                                    {m.full_name || m.email.split("@")[0]}
                                                                    {isMe && <span className="ml-1.5 text-[10px] text-gray-400">(you)</span>}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 truncate">{m.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-middle">
                                                        <RoleChip role={m.role} />
                                                    </td>
                                                    <td className="px-4 py-3 align-middle hidden sm:table-cell">
                                                        <span className="text-[11px] text-gray-500">{fmtDate(m.created_at) || "—"}</span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-4 py-3 align-middle text-right">
                                                            {canManage ? (
                                                                <MemberActions
                                                                    member={m}
                                                                    isOwnerViewer={isOwner}
                                                                    busy={busy}
                                                                    onRoleChange={(role) => handleRoleChange(m, role)}
                                                                    onRemove={() => handleRemoveMember(m)}
                                                                    onTransferOwnership={() => handleTransferOwnership(m)}
                                                                />
                                                            ) : (
                                                                <span className="text-[11px] text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {members.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        No members yet.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "invites" && (
                            <motion.div
                                key="invites"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden"
                            >
                                {invites.length === 0 ? (
                                    <div className="text-center py-10">
                                        <Mail size={20} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No invites yet</p>
                                        {isAdmin && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-3"
                                                onClick={() => setShowInvite(true)}
                                            >
                                                <UserPlus size={12} className="mr-1.5" /> Invite the first teammate
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50/70 border-b border-gray-100">
                                            <tr>
                                                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5">Email</th>
                                                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5">Role</th>
                                                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5">Status</th>
                                                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-4 py-2.5 hidden md:table-cell">Sent</th>
                                                {isAdmin && <th />}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invites.map((inv) => (
                                                <tr key={inv.id} className="border-b border-gray-50 last:border-b-0 hover:bg-purple-50/30 transition-colors">
                                                    <td className="px-4 py-3 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-[10px] font-semibold flex items-center justify-center">
                                                                {initials(inv.email)}
                                                            </span>
                                                            <span className="text-sm text-gray-900 truncate">{inv.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-middle">
                                                        <RoleChip role={inv.role as any} />
                                                    </td>
                                                    <td className="px-4 py-3 align-middle">
                                                        <span
                                                            className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border ${INVITE_STATUS_BADGE[inv.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}
                                                        >
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 align-middle hidden md:table-cell">
                                                        <span className="text-[11px] text-gray-500">{fmtDate(inv.created_at)}</span>
                                                        {inv.reminder_count ? (
                                                            <span className="ml-1.5 text-[10px] text-gray-400">· resent {inv.reminder_count}×</span>
                                                        ) : null}
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-4 py-3 align-middle text-right">
                                                            {inv.status === "pending" ? (
                                                                <div className="inline-flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleResendInvite(inv)}
                                                                        className="text-[11px] text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-purple-50"
                                                                        title="Resend invite email"
                                                                    >
                                                                        <RefreshCcw size={11} /> Resend
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRevokeInvite(inv)}
                                                                        className="text-[11px] text-gray-500 hover:text-red-600 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-50"
                                                                        title="Revoke invite"
                                                                    >
                                                                        <Trash2 size={11} /> Revoke
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "settings" && isAdmin && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-4"
                            >
                                <SettingsCard
                                    title="Organization profile"
                                    description="What members see when they look up your org."
                                >
                                    <FieldEditor
                                        label="Description"
                                        initial={org.description || ""}
                                        placeholder="What does your team work on?"
                                        multiline
                                        onSave={async (next) => {
                                            const updated = await organizationApi.updateOrg(org.id, { description: next || null });
                                            setOrg({ ...org, description: updated.description });
                                        }}
                                    />
                                    <FieldEditor
                                        label="Industry"
                                        initial={org.industry || ""}
                                        placeholder="Healthcare, Fintech, Education…"
                                        onSave={async (next) => {
                                            const updated = await organizationApi.updateOrg(org.id, { industry: next || null });
                                            setOrg({ ...org, industry: updated.industry });
                                        }}
                                    />
                                    <FieldEditor
                                        label="Website"
                                        initial={org.website || ""}
                                        placeholder="https://example.com"
                                        onSave={async (next) => {
                                            const updated = await organizationApi.updateOrg(org.id, { website: next || null });
                                            setOrg({ ...org, website: updated.website });
                                        }}
                                    />
                                    <FieldEditor
                                        label="Logo URL"
                                        initial={org.logo_url || ""}
                                        placeholder="https://…/logo.png"
                                        helper="Paste a square PNG/SVG URL. We'll show it across the platform."
                                        onSave={async (next) => handleSaveLogoUrl(next || null)}
                                    />
                                </SettingsCard>

                                <SettingsCard
                                    title="Danger zone"
                                    description={isOwner ? "Owner actions — be careful." : "Leaving will revoke your access immediately."}
                                    accent="rose"
                                >
                                    {!isOwner && (
                                        <button
                                            onClick={handleLeave}
                                            className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 border border-rose-100"
                                        >
                                            <LogOut size={13} /> Leave organization
                                        </button>
                                    )}
                                    {isOwner && (
                                        <p className="text-xs text-gray-500 flex items-start gap-1.5">
                                            <AlertTriangle size={12} className="mt-0.5 flex-none text-amber-500" />
                                            <span>
                                                To transfer ownership, open the <strong>Members</strong> tab, find the new owner,
                                                and use the menu on their row.
                                            </span>
                                        </p>
                                    )}
                                </SettingsCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Invite modal */}
            <AnimatePresence>
                {showInvite && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        onClick={() => !sendingInvite && setShowInvite(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 220, damping: 22 }}
                            className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Invite teammates</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Add one email or paste many — separated by commas, semicolons, or new lines.
                                    </p>
                                </div>
                                <button
                                    onClick={() => !sendingInvite && setShowInvite(false)}
                                    className="text-gray-300 hover:text-gray-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="px-5 py-4 space-y-3">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                                            Emails
                                        </label>
                                        {(() => {
                                            const parsed = parseEmailList(inviteEmail);
                                            const bad = parsed.filter((e) => !EMAIL_REGEX.test(e)).length;
                                            const good = parsed.length - bad;
                                            if (parsed.length === 0) return null;
                                            return (
                                                <span className="text-[10px] text-gray-400">
                                                    {good} valid{bad > 0 ? ` · ${bad} invalid` : ""}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <textarea
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder={"name@example.com\nteammate@example.com, another@example.com"}
                                        rows={4}
                                        className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-y font-mono text-[12.5px]"
                                        autoFocus
                                    />
                                    <p className="mt-1 text-[10.5px] text-gray-400">
                                        Up to 200 addresses per send. Each recipient gets the same email and role.
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Role</label>
                                    <div className="mt-1 grid grid-cols-3 gap-1.5">
                                        {(["member", "admin", "viewer"] as InviteRole[]).map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => setInviteRole(r)}
                                                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                                                    inviteRole === r
                                                        ? "border-purple-300 bg-purple-50 text-purple-700"
                                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {r[0].toUpperCase() + r.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Personal note (optional)</label>
                                    <textarea
                                        value={inviteMessage}
                                        onChange={(e) => setInviteMessage(e.target.value)}
                                        placeholder="Welcome to the team — we'll get you set up."
                                        rows={2}
                                        className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowInvite(false)}
                                    disabled={sendingInvite}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSendInvite}
                                    disabled={sendingInvite}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {sendingInvite ? (
                                        <Loader2 size={13} className="mr-1.5 animate-spin" />
                                    ) : (
                                        <Send size={13} className="mr-1.5" />
                                    )}
                                    {(() => {
                                        const n = parseEmailList(inviteEmail).length;
                                        if (n <= 1) return "Send invite";
                                        return `Send ${n} invites`;
                                    })()}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────

function TabButton({
    active,
    onClick,
    icon,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                active ? "text-purple-700" : "text-gray-500 hover:text-gray-700"
            }`}
        >
            {icon}
            {label}
            {count != null && count > 0 && (
                <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0">
                    {count}
                </span>
            )}
            {active && (
                <motion.div
                    layoutId="org-tab-underline"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-purple-500 rounded-t"
                />
            )}
        </button>
    );
}

function RoleChip({ role }: { role: string }) {
    const icon =
        role === "owner" ? <Crown size={9} /> : role === "admin" ? <Shield size={9} /> : null;
    return (
        <span
            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${ROLE_BADGE[role] || ROLE_BADGE.member}`}
        >
            {icon}
            {role}
        </span>
    );
}

function MemberActions({
    member,
    isOwnerViewer,
    busy,
    onRoleChange,
    onRemove,
    onTransferOwnership,
}: {
    member: OrgMemberItem;
    isOwnerViewer: boolean;
    busy?: string;
    onRoleChange: (role: "admin" | "member") => void;
    onRemove: () => void;
    onTransferOwnership: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setOpen((v) => !v)}
                disabled={!!busy}
                className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 disabled:opacity-40"
            >
                {busy ? <Loader2 size={11} className="animate-spin" /> : <>Manage <ChevronDown size={11} /></>}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                        {member.role === "admin" ? (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    onRoleChange("member");
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 text-gray-700 inline-flex items-center gap-2"
                            >
                                <UserCog size={12} /> Demote to member
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    onRoleChange("admin");
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 text-gray-700 inline-flex items-center gap-2"
                            >
                                <Shield size={12} /> Promote to admin
                            </button>
                        )}
                        {isOwnerViewer && (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    onTransferOwnership();
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 text-amber-700 inline-flex items-center gap-2"
                            >
                                <Crown size={12} /> Transfer ownership
                            </button>
                        )}
                        <div className="border-t border-gray-100" />
                        <button
                            onClick={() => {
                                setOpen(false);
                                onRemove();
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 inline-flex items-center gap-2"
                        >
                            <Trash2 size={12} /> Remove from organization
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SettingsCard({
    title,
    description,
    children,
    accent = "purple",
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    accent?: "purple" | "rose";
}) {
    const ring = accent === "rose" ? "border-rose-100" : "border-gray-100";
    return (
        <div className={`rounded-2xl border ${ring} bg-white/80 backdrop-blur-sm shadow-sm p-5`}>
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function FieldEditor({
    label,
    initial,
    placeholder,
    helper,
    multiline = false,
    onSave,
}: {
    label: string;
    initial: string;
    placeholder?: string;
    helper?: string;
    multiline?: boolean;
    onSave: (next: string) => Promise<void> | void;
}) {
    const { toast } = useToast();
    const [value, setValue] = useState(initial);
    const [saving, setSaving] = useState(false);
    const dirty = value !== initial;

    useEffect(() => {
        setValue(initial);
    }, [initial]);

    const handleSave = async () => {
        if (!dirty) return;
        setSaving(true);
        try {
            await onSave(value.trim());
            toast({ title: `${label} updated` });
        } catch (e) {
            toast({
                title: `Could not save ${label.toLowerCase()}`,
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{label}</label>
            <div className="mt-1 flex items-start gap-2">
                {multiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        rows={2}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-none"
                    />
                ) : (
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                    />
                )}
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-9"
                >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                </Button>
            </div>
            {helper && <p className="text-[10.5px] text-gray-400 mt-1">{helper}</p>}
        </div>
    );
}

// ── Empty state: create the first organization ────────────────────────

function CreateOrgEmptyState({ onCreated }: { onCreated: (org: OrganizationItem) => Promise<void> | void }) {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        const cleanName = name.trim();
        if (!cleanName) {
            toast({ title: "Pick an organization name", variant: "destructive" });
            return;
        }
        setCreating(true);
        try {
            const created = await organizationApi.createOrg({
                name: cleanName,
                industry: industry.trim() || undefined,
                website: website.trim() || undefined,
            });
            toast({ title: `Welcome to ${created.name}` });
            await onCreated(created);
        } catch (e) {
            toast({
                title: "Could not create organization",
                description: getErrorMessage(e, "Try again."),
                variant: "destructive",
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link
                    to="/dashboard"
                    className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-6"
                >
                    <ArrowLeft size={12} /> Back to dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3">
                        <div className="flex-none h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-inner">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Create your organization</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                A workspace for your team. You'll be the owner. You can invite teammates next.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                                Organization name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Acme Inc., Bright Labs, etc."
                                className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                                Industry
                            </label>
                            <input
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="Healthcare, Fintech, Education…"
                                className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                                Website
                            </label>
                            <input
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                                className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            onClick={handleCreate}
                            disabled={creating || !name.trim()}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95"
                        >
                            {creating ? (
                                <Loader2 size={13} className="mr-1.5 animate-spin" />
                            ) : (
                                <Check size={13} className="mr-1.5" />
                            )}
                            Create organization
                        </Button>
                    </div>
                </motion.div>

                <p className="mt-4 text-[11px] text-gray-400 text-center">
                    Got an invite from a teammate? Open the invite email — your acceptance will
                    skip this step and place you in their organization directly.
                </p>
            </div>
        </div>
    );
}
