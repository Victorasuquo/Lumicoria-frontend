import React, { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { organizationApi } from "@/services/api";
import {
  GlassCard, SectionHeader, Button, Input, RoleChip,
  Toolbar, SkeletonRow, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { motion } from "framer-motion";
import InviteDialog from "@/components/workspace/InviteDialog";
import MemberAvatarEditable from "@/components/workspace/MemberAvatarEditable";
import { toast } from "sonner";

interface OrgMember {
  id?: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  avatar_url?: string | null;
  role?: string;
  created_at?: string;
}

export const WorkspaceMembers: React.FC = () => {
  const { activeOrgId, activeOrg } = useWorkspace();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    organizationApi.listMembers(activeOrgId, { limit: 500 })
      .then((r: any) => setMembers((r?.items || r || []) as OrgMember[]))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [activeOrgId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m =>
      (m.full_name || `${m.first_name || ""} ${m.last_name || ""}`).toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q)
    );
  }, [members, search]);

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        eyebrow="Members"
        title={`Everyone in ${activeOrg?.name || "this workspace"}`}
        subtitle="Full workspace directory. Filter by name or email."
      />

      <Toolbar
        left={<Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members" style={{ width: 320 }} />}
        center={<span style={{ fontSize: 12, color: tokens.SLATE_500, fontWeight: 600 }}>{filtered.length} {filtered.length === 1 ? "member" : "members"}</span>}
        right={<Button tone="primary" onClick={() => setInviteOpen(true)}>+ Invite</Button>}
      />

      {loading ? (
        <GlassCard padding={6}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} widths={["36px", "32%", "22%", "16%"]} />)}
        </GlassCard>
      ) : filtered.length === 0 ? (
        <OrbEmptyState title="No members yet" body="Invite the rest of your team to start collaborating." action={<Button onClick={() => setInviteOpen(true)}>Invite</Button>} />
      ) : (
        <GlassCard padding={6}>
          {filtered.map((m, idx) => {
            const name = m.full_name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || m.email || "Member";
            const avatar = m.profile_picture || m.avatar_url || null;
            return (
              <motion.div key={m.id || m.user_id || idx} {...STAGGER_FAST(idx)} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center",
                padding: "12px 18px",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
              }}>
                <MemberAvatarEditable
                  userId={m.user_id || m.id}
                  name={name}
                  avatarUrl={avatar}
                  size={36}
                  onSelfUpdated={(url) => {
                    setMembers(prev => prev.map(x =>
                      (x.user_id || x.id) === (m.user_id || m.id) ? { ...x, profile_picture: url, avatar_url: url } : x,
                    ));
                    toast.success("Profile photo updated");
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 14 }}>{name}</div>
                  <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>{m.email || "—"}</div>
                </div>
                <RoleChip role={m.role || "member"} />
                <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>
                  {m.created_at ? `Joined ${new Date(m.created_at).toLocaleDateString()}` : ""}
                </span>
              </motion.div>
            );
          })}
        </GlassCard>
      )}

      {activeOrgId && (
        <InviteDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          scope="org"
          orgId={activeOrgId}
          onInvited={() => { toast.success("Invitations sent."); }}
        />
      )}
    </div>
  );
};

export default WorkspaceMembers;
