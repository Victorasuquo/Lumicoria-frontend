import React, { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { organizationApi } from "@/services/api";
import {
  GlassCard, SectionHeader, Button, Input, MemberAvatar, RoleChip,
  EmptyState, Skeleton,
} from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";
import InviteDialog from "@/components/workspace/InviteDialog";
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
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members" style={{ width: 280 }} />
            <Button tone="primary" onClick={() => setInviteOpen(true)}>+ Invite</Button>
          </div>
        }
      />

      {loading ? (
        <GlassCard padding={20}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></GlassCard>
      ) : filtered.length === 0 ? (
        <EmptyState title="No members yet" body="Invite the rest of your team from the Organization screen." />
      ) : (
        <GlassCard padding={6}>
          {filtered.map((m, idx) => {
            const name = m.full_name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || m.email || "Member";
            const avatar = m.profile_picture || m.avatar_url || null;
            return (
              <div key={m.id || m.user_id || idx} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center",
                padding: "12px 18px",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
              }}>
                <MemberAvatar name={name} src={avatar} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 14 }}>{name}</div>
                  <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>{m.email || "—"}</div>
                </div>
                <RoleChip role={m.role || "member"} />
                <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>
                  {m.created_at ? `Joined ${new Date(m.created_at).toLocaleDateString()}` : ""}
                </span>
              </div>
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
