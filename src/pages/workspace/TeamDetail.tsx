import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  teamApi, projectV2Api, analyticsV2Api,
  type Team, type TeamMember, type ProjectV2, type AnalyticsOverview, type ActivityRow,
} from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, BrandPill, Button, Input, MemberAvatar, MemberStack,
  RoleChip, AgentChip, EmptyState, Skeleton,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, FADE_UP, initials, planLabel } from "@/components/workspace/tokens";
import InviteDialog from "@/components/workspace/InviteDialog";
import MemberRowActions from "@/components/workspace/MemberRowActions";
import { toast } from "sonner";

const TEAM_ROLES = ["viewer", "operator", "editor", "team_admin"];

type Tab = "overview" | "members" | "projects" | "agents" | "activity" | "analytics" | "settings";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "projects", label: "Projects" },
  { id: "agents", label: "Agents" },
  { id: "activity", label: "Activity" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

const TabBar: React.FC<{ active: Tab; onChange: (t: Tab) => void }> = ({ active, onChange }) => (
  <div style={{
    display: "flex", gap: 4, padding: 4,
    background: "rgba(255,255,255,0.65)", borderRadius: 9999,
    border: `1px solid ${tokens.SLATE_200}`, width: "fit-content",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{
        padding: "8px 16px", borderRadius: 9999, border: "none",
        cursor: "pointer", fontWeight: 600, fontSize: 13,
        background: active === t.id ? "white" : "transparent",
        color: active === t.id ? tokens.PURPLE_DEEP : tokens.SLATE_600,
        boxShadow: active === t.id ? "0 2px 8px rgba(15,23,42,0.06)" : "none",
      }}>{t.label}</button>
    ))}
  </div>
);

export const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { activeOrgId } = useWorkspace();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectV2[]>([]);
  const [agents, setAgents] = useState<Array<{ agent_key?: string; custom_agent_id?: string; autonomy_level?: string; enabled?: boolean }>>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!activeOrgId || !teamId) return;
    setLoading(true);
    Promise.all([
      teamApi.get(activeOrgId, teamId).catch(() => null),
      teamApi.members(activeOrgId, teamId).catch(() => []),
      teamApi.projects(activeOrgId, teamId).catch(() => []),
      teamApi.agents(activeOrgId, teamId).then(r => r.agents || []).catch(() => []),
      teamApi.activity(activeOrgId, teamId, 50).catch(() => []),
      teamApi.analytics(activeOrgId, teamId).catch(() => null),
    ]).then(([t, m, p, a, ac, an]) => {
      if (cancelled) return;
      setTeam(t); setMembers(m); setProjects(p); setAgents(a); setActivity(ac); setAnalytics(an);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrgId, teamId]);

  if (!activeOrgId || !teamId) return null;
  if (loading && !team) {
    return <GlassCard padding={28}><Skeleton height={32} style={{ marginBottom: 14 }} /><Skeleton height={14} /><Skeleton height={14} style={{ marginTop: 6 }} /></GlassCard>;
  }
  if (!team) return <EmptyState title="Team not found" body="It may have been archived or deleted." action={<Button onClick={() => navigate("/workspace/teams")}>Back to teams</Button>} />;

  const isPrivileged = true; // sidebar already gates this — server enforces

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <motion.div {...FADE_UP}>
        <GlassCard padding={26}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              width: 56, height: 56, borderRadius: 18,
              background: team.color || BRAND_GRADIENT,
              color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 20,
            }}>{initials(team.name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BrandPill tone="outline">Team · {team.member_ids.length} members</BrandPill>
                {team.department_tag && <BrandPill tone="ghost">{team.department_tag}</BrandPill>}
                {team.is_archived && <BrandPill tone="ghost" style={{ background: `${tokens.AMBER}1A`, color: tokens.AMBER }}>Archived</BrandPill>}
              </div>
              <h1 style={{ margin: "6px 0 0", fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 30, letterSpacing: -0.6 }}>
                {team.name}
              </h1>
              {team.description && <p style={{ color: tokens.SLATE_600, fontSize: 14, marginTop: 6, marginBottom: 0, maxWidth: 720 }}>{team.description}</p>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button tone="outline" size="sm" onClick={() => navigate(`/workspace/projects/new?team=${team.id}`)}>New project</Button>
              <Button tone="primary" size="sm" onClick={() => setInviteOpen(true)}>Invite</Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <TabBar active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <GlassCard padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: tokens.SLATE_500, textTransform: "uppercase" }}>Projects</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 6 }}>{projects.length}</div>
            <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>{projects.filter(p => p.status === "active").length} active</div>
          </GlassCard>
          <GlassCard padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: tokens.SLATE_500, textTransform: "uppercase" }}>Tasks completed (30d)</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 6 }}>{analytics?.tasks?.completed ?? 0}</div>
            <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>{Math.round((analytics?.tasks?.completion_rate || 0) * 100)}% completion</div>
          </GlassCard>
          <GlassCard padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: tokens.SLATE_500, textTransform: "uppercase" }}>Agent runs (30d)</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 6 }}>{(analytics?.agent_runs?.total ?? 0).toLocaleString()}</div>
            <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>{agents.length} agents in play</div>
          </GlassCard>
        </div>
      )}

      {tab === "members" && (
        <GlassCard padding={6}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: `1px solid ${tokens.SLATE_200}`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: tokens.SLATE_500 }}>
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            <Button tone="primary" size="sm" onClick={() => setInviteOpen(true)}>+ Invite members</Button>
          </div>
          {members.length === 0 ? (
            <div style={{ padding: 24 }}>
              <EmptyState title="Just you so far" body="Invite people from the workspace to this team." action={<Button onClick={() => setInviteOpen(true)}>Invite members</Button>} />
            </div>
          ) : members.map((m, idx) => (
            <div key={m.user_id} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center",
              padding: "12px 16px",
              borderBottom: idx < members.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
            }}>
              <MemberAvatar name={m.full_name || m.email} src={m.avatar_url} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: tokens.INK }}>{m.full_name || m.email || m.user_id}</div>
                <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>{m.email || "—"}</div>
              </div>
              <RoleChip role={m.role} />
              <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : ""}</span>
              <MemberRowActions
                currentRole={m.role}
                roleChoices={TEAM_ROLES}
                onChangeRole={async (next) => {
                  try {
                    await teamApi.updateMemberRole(activeOrgId!, teamId!, m.user_id, next as any);
                    setMembers(prev => prev.map(x => x.user_id === m.user_id ? { ...x, role: next as any } : x));
                    toast.success("Role updated.");
                  } catch (e: any) { toast.error(e?.response?.data?.detail || "Could not change role."); }
                }}
                onRemove={async () => {
                  try {
                    await teamApi.removeMember(activeOrgId!, teamId!, m.user_id);
                    setMembers(prev => prev.filter(x => x.user_id !== m.user_id));
                    toast.success("Removed from team.");
                  } catch (e: any) { toast.error(e?.response?.data?.detail || "Could not remove member."); }
                }}
              />
            </div>
          ))}
        </GlassCard>
      )}

      {team && activeOrgId && (
        <InviteDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          scope="team"
          orgId={activeOrgId}
          teamId={teamId}
          onInvited={() => { toast.success("Invitations sent."); }}
        />
      )}

      {tab === "projects" && (
        projects.length === 0 ? (
          <EmptyState title="No projects in this team yet" body="Spin up a project — the team's agents and members come along automatically." action={<Button onClick={() => navigate(`/workspace/projects/new?team=${team.id}`)}>New project</Button>} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {projects.map(p => (
              <GlassCard
                key={p.id}
                padding={18}
                onClick={() => navigate(`/workspace/projects/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: p.color || tokens.PURPLE }} />
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span style={{ marginLeft: "auto", padding: "2px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", background: `${tokens.PURPLE}10`, color: tokens.PURPLE_DEEP }}>{p.status}</span>
                </div>
                <p style={{ color: tokens.SLATE_600, fontSize: 13, margin: 0 }}>{p.description?.slice(0, 140) || "—"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {p.agent_keys.slice(0, 3).map(k => <AgentChip key={k} agentKey={k} size={20} />)}
                  </div>
                  <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 600 }}>{p.member_ids.length} members</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      )}

      {tab === "agents" && (
        <GlassCard padding={18}>
          {agents.length === 0 ? (
            <EmptyState title="No agents yet" body="Activate a platform agent on any of this team's projects — they show up here." />
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {agents.map((a, idx) => (
                <AgentChip key={(a.agent_key || a.custom_agent_id || idx).toString()} agentKey={(a.agent_key || a.custom_agent_id || "agent") as string} />
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {tab === "activity" && (
        <GlassCard padding={6}>
          {activity.length === 0 ? (
            <div style={{ padding: 24 }}><EmptyState title="No activity yet" /></div>
          ) : activity.slice(0, 30).map((a, idx) => (
            <div key={a.id || idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "10px 16px", borderBottom: idx < activity.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: tokens.INK }}>{a.activity_type.replace(/[_\.]/g, " ")}</div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{a.related_resource_type || ""}</div>
              </div>
              <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}</span>
            </div>
          ))}
        </GlassCard>
      )}

      {tab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <GlassCard padding={20}>
            <div style={{ fontSize: 12, fontWeight: 700, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Tasks</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Total</div>
                <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 24, fontWeight: 700 }}>{analytics?.tasks?.total ?? 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Completed</div>
                <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 24, fontWeight: 700, color: tokens.GREEN }}>{analytics?.tasks?.completed ?? 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Completion</div>
                <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 24, fontWeight: 700, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {Math.round((analytics?.tasks?.completion_rate || 0) * 100)}%
                </div>
              </div>
            </div>
          </GlassCard>
          <GlassCard padding={20}>
            <div style={{ fontSize: 12, fontWeight: 700, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Agent runs (30d)</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 36, fontWeight: 700, marginTop: 8 }}>{(analytics?.agent_runs?.total ?? 0).toLocaleString()}</div>
            <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 6 }}>{agents.length} agents bound to this team across {projects.length} projects.</div>
          </GlassCard>
        </div>
      )}

      {tab === "settings" && (
        <GlassCard padding={24}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK }}>Team settings</h3>
          <p style={{ color: tokens.SLATE_600, fontSize: 13, marginBottom: 16 }}>Adjust the team's name, description, color, and department tag. Owner-only actions live below.</p>
          <TeamSettingsForm team={team} orgId={activeOrgId} onSaved={(t) => setTeam(t)} />
        </GlassCard>
      )}
    </div>
  );
};

const TeamSettingsForm: React.FC<{ team: Team; orgId: string; onSaved: (t: Team) => void }> = ({ team, orgId, onSaved }) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [department, setDepartment] = useState(team.department_tag || "");
  const [color, setColor] = useState(team.color || tokens.PURPLE);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const t = await teamApi.update(orgId, team.id, { name, description, department_tag: department, color });
      onSaved(t); setMsg("Saved.");
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <label>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Name</div>
        <Input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Department tag</div>
        <Input value={department} onChange={e => setDepartment(e.target.value)} />
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Description</div>
        <Input value={description} onChange={e => setDescription(e.target.value)} />
      </label>
      <label>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Colour</div>
        <Input value={color} onChange={e => setColor(e.target.value)} />
      </label>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
        <Button tone="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        {msg && <span style={{ color: tokens.SLATE_600, fontSize: 13 }}>{msg}</span>}
      </div>
    </div>
  );
};

export default TeamDetail;
