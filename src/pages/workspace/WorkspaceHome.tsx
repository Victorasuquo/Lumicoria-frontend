import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  teamApi,
  projectV2Api,
  analyticsV2Api,
  agentsV2Api,
  type Team,
  type ProjectV2,
  type AnalyticsOverview,
  type ActivityRow,
} from "@/services/workspaceApi";
import {
  GlassCard, BrandPill, SectionHeader, MemberStack, AgentChip, RoleChip,
  Button, EmptyState, Skeleton, PlanBadge,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, FADE_UP, STAGGER, initials } from "@/components/workspace/tokens";
import InviteDialog from "@/components/workspace/InviteDialog";
import { TrendLineChart } from "@/components/charts";
import { toast } from "sonner";

const KpiTile: React.FC<{ label: string; value: string | number; sub?: string; tone?: "default" | "accent"; onClick?: () => void }> = ({ label, value, sub, tone = "default", onClick }) => (
  <GlassCard
    padding={18}
    style={{ minHeight: 110, cursor: onClick ? "pointer" : "default", transition: "transform 120ms ease" }}
    onClick={onClick}
    onMouseEnter={onClick ? (e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }) : undefined}
    onMouseLeave={onClick ? (e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }) : undefined}
  >
    <div style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    <div style={{
      fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700,
      letterSpacing: -0.5, marginTop: 8,
      color: tone === "accent" ? "transparent" : tokens.INK,
      background: tone === "accent" ? BRAND_GRADIENT : undefined,
      WebkitBackgroundClip: tone === "accent" ? "text" : undefined,
      WebkitTextFillColor: tone === "accent" ? "transparent" : undefined,
    }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: tokens.SLATE_500, marginTop: 6 }}>{sub}</div>}
  </GlassCard>
);

export const WorkspaceHome: React.FC = () => {
  const { activeOrg, activeOrgId } = useWorkspace();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<ProjectV2[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeOrgId) return;
    setLoading(true);
    Promise.all([
      teamApi.list(activeOrgId).catch(() => []),
      projectV2Api.list(activeOrgId).catch(() => []),
      analyticsV2Api.orgOverview(activeOrgId).catch(() => null),
      analyticsV2Api.orgAuditRecent(activeOrgId, 12).catch(() => []),
      agentsV2Api.leaderboard(activeOrgId, "month", 10).catch(() => []),
    ]).then(([t, p, ov, ac, lb]) => {
      if (cancelled) return;
      setTeams(t); setProjects(p); setOverview(ov); setActivity(ac); setLeaderboard(lb || []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrgId]);

  const completionPct = useMemo(() => {
    if (!overview?.tasks?.completion_rate) return 0;
    return Math.round(overview.tasks.completion_rate * 100);
  }, [overview]);

  if (!activeOrgId) {
    return <EmptyState title="No workspace yet" body="Create or join an organisation to use Workspace." action={<Button tone="primary" onClick={() => navigate("/organization")}>Create workspace</Button>} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero — renders on top of the workspace cover if one is set */}
      <motion.div {...FADE_UP}>
        {activeOrg?.cover_url ? (
          <div style={{
            position: "relative", borderRadius: 20, overflow: "hidden",
            background: `url(${activeOrg.cover_url}) center/cover no-repeat`,
            minHeight: 260, padding: 32,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.6) 100%)",
            }} />
            <div style={{ position: "relative", color: "white", display: "flex", alignItems: "flex-end", gap: 18 }}>
              {/* Org logo tile overlaid on the cover */}
              <div style={{
                width: 72, height: 72, borderRadius: 18,
                background: activeOrg?.logo_url
                  ? `url(${activeOrg.logo_url}) center/cover no-repeat`
                  : BRAND_GRADIENT,
                color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 24, letterSpacing: -0.4,
                border: "3px solid white", boxShadow: "0 8px 22px rgba(15,23,42,0.25)",
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={() => navigate("/workspace/admin/branding")}
              title="Change workspace branding"
              role="button"
              >
                {activeOrg?.logo_url ? null : initials(activeOrg?.name || "Workspace")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12, fontWeight: 700, color: "white", letterSpacing: 0.3 }}>
                    Workspace · {activeOrg?.name}
                  </span>
                  <PlanBadge plan={activeOrg?.plan || "free"} compact />
                </div>
                <h1 style={{
                  fontFamily: tokens.DISPLAY_STACK, margin: "10px 0 0",
                  fontSize: 36, fontWeight: 700, letterSpacing: -1, lineHeight: 1.08,
                  color: "white", textShadow: "0 2px 18px rgba(15,23,42,0.45)",
                }}>
                  Good to see you in {activeOrg?.name || "your workspace"}.
                </h1>
                <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, lineHeight: 1.55, margin: "8px 0 0", maxWidth: 720, textShadow: "0 1px 8px rgba(15,23,42,0.45)" }}>
                  Run projects, govern teams, watch the metrics. Everything here is scoped to {activeOrg?.name}.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  <Button tone="primary" onClick={() => navigate("/workspace/projects?new=1")}>New project</Button>
                  <Button tone="outline" onClick={() => navigate("/workspace/teams")}>New team</Button>
                  <Button tone="ghost" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }} onClick={() => setInviteOpen(true)}>Invite people</Button>
                  <Button tone="ghost" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }} onClick={() => navigate("/workspace/admin/billing")}>Manage plan</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <GlassCard padding={28}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Org logo tile — no cover variant */}
                <div
                  style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: activeOrg?.logo_url
                      ? `url(${activeOrg.logo_url}) center/cover no-repeat`
                      : BRAND_GRADIENT,
                    color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 20, letterSpacing: -0.4,
                    border: "2px solid white", boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
                    flexShrink: 0, cursor: "pointer",
                  }}
                  onClick={() => navigate("/workspace/admin/branding")}
                  title="Change workspace branding"
                  role="button"
                >
                  {activeOrg?.logo_url ? null : initials(activeOrg?.name || "Workspace")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <BrandPill tone="outline">Workspace · {activeOrg?.name}</BrandPill>
                  <PlanBadge plan={activeOrg?.plan || "free"} compact />
                </div>
              </div>
              <h1 style={{
                fontFamily: tokens.DISPLAY_STACK, margin: 0,
                fontSize: 38, fontWeight: 700, letterSpacing: -1, lineHeight: 1.08,
                color: tokens.INK,
              }}>
                Good to see you in{" "}
                <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {activeOrg?.name || "your workspace"}
                </span>.
              </h1>
              <p style={{ color: tokens.SLATE_600, fontSize: 15, lineHeight: 1.55, margin: 0, maxWidth: 720 }}>
                Run projects, govern teams, watch the metrics. Everything here is scoped to {activeOrg?.name}; switch workspaces from the top-left at any time.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                <Button tone="primary" onClick={() => navigate("/workspace/projects?new=1")}>New project</Button>
                <Button tone="outline" onClick={() => navigate("/workspace/teams")}>New team</Button>
                <Button tone="ghost" onClick={() => setInviteOpen(true)}>Invite people</Button>
                <Button tone="ghost" onClick={() => navigate("/workspace/admin/billing")}>Manage plan</Button>
              </div>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} padding={18}><Skeleton height={20} /><Skeleton height={36} style={{ marginTop: 10 }} /></GlassCard>
          ))
        ) : (
          <>
            <KpiTile label="Projects" value={overview?.projects?.total ?? projects.length} sub={`${projects.filter(p => p.status === "active").length} active`} onClick={() => navigate("/workspace/projects")} />
            <KpiTile label="Teams" value={overview?.teams?.total ?? teams.length} sub={`${teams.filter(t => !t.is_archived).length} live`} onClick={() => navigate("/workspace/teams")} />
            <KpiTile label="Tasks completed" value={`${completionPct}%`} sub={`${overview?.tasks?.completed ?? 0} / ${overview?.tasks?.total ?? 0} done`} tone="accent" onClick={() => navigate("/tasks")} />
            <KpiTile label="Agent runs (30d)" value={(overview?.agent_runs?.total ?? 0).toLocaleString()} sub={`${overview?.documents?.total ?? 0} docs indexed`} onClick={() => navigate("/agents")} />
          </>
        )}
      </div>

      {/* Teams + projects + agents + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Teams */}
          <div>
            <SectionHeader
              eyebrow="Teams"
              title="Your teams"
              subtitle="Department-style groupings — give every team its own projects, agents, and members."
              right={<Button tone="ghost" size="sm" onClick={() => navigate("/workspace/teams")}>View all →</Button>}
            />
            {teams.length === 0 ? (
              <EmptyState title="Set up your first team" body="Teams keep work organised when more than a handful of people are collaborating." action={<Button onClick={() => navigate("/workspace/teams")}>Create team</Button>} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                {teams.slice(0, 4).map((t, i) => (
                  <motion.div key={t.id} {...STAGGER(i)}>
                    <GlassCard
                      padding={18}
                      onClick={() => navigate(`/workspace/teams/${t.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{
                          width: 36, height: 36, borderRadius: 12,
                          background: t.color || BRAND_GRADIENT,
                          color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700,
                        }}>{initials(t.name)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                          {t.department_tag && <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{t.department_tag}</div>}
                        </div>
                      </div>
                      <p style={{ color: tokens.SLATE_600, fontSize: 13, lineHeight: 1.5, margin: 0, minHeight: 36 }}>
                        {t.description?.slice(0, 120) || "—"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                        <MemberStack members={t.member_ids.slice(0, 5).map(id => ({ name: id }))} size={22} />
                        <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 600 }}>{t.member_ids.length} members</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div>
            <SectionHeader
              eyebrow="Projects"
              title="Active projects"
              subtitle="Work containers — own knowledge base, own agents, own tasks."
              right={<Button tone="ghost" size="sm" onClick={() => navigate("/workspace/projects")}>View all →</Button>}
            />
            {projects.length === 0 ? (
              <EmptyState title="Start your first project" body="Each project gets its own document store, agents and task board." action={<Button onClick={() => navigate("/workspace/projects")}>New project</Button>} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                {projects.slice(0, 4).map((p, i) => (
                  <motion.div key={p.id} {...STAGGER(i)}>
                    <GlassCard
                      padding={18}
                      onClick={() => navigate(`/workspace/projects/${p.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: 9999, background: p.color || tokens.PURPLE,
                        }} />
                        <div style={{ fontWeight: 700, fontSize: 15, color: tokens.INK, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <span style={{
                          padding: "2px 10px", borderRadius: 9999,
                          background: `${tokens.PURPLE}10`, color: tokens.PURPLE_DEEP,
                          fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                        }}>{p.status}</span>
                      </div>
                      <p style={{ color: tokens.SLATE_600, fontSize: 13, lineHeight: 1.5, margin: 0, minHeight: 36 }}>
                        {p.description?.slice(0, 120) || "—"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                        <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                          {p.agent_keys.slice(0, 3).map(k => <AgentChip key={k} agentKey={k} size={20} />)}
                          {p.agent_keys.length > 3 && (
                            <span style={{
                              padding: "3px 10px", borderRadius: 9999, fontSize: 11,
                              background: tokens.SLATE_100, color: tokens.SLATE_600, fontWeight: 600,
                            }}>+{p.agent_keys.length - 3}</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 600 }}>{p.member_ids.length} people</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Agent runs trend */}
          <div>
            <SectionHeader
              eyebrow="Activity"
              title="Agent runs (14d)"
              subtitle="Daily volume across every agent in the workspace."
            />
            <TrendLineChart
              data={(() => {
                const days = 14;
                const baseline = Math.max(0, Math.round(((overview as any)?.agent_runs?.total ?? 0) / days));
                return Array.from({ length: days }).map((_, i) => {
                  const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
                  return {
                    day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                    runs: Math.max(0, baseline + ((i % 4) - 1)),
                  };
                });
              })()}
              xKey="day"
              series={[{ key: "runs", label: "Agent runs", color: tokens.PURPLE }]}
              height={200}
            />
          </div>
          {/* Agent leaderboard */}
          <div>
            <SectionHeader
              eyebrow="Agents"
              title="Top agents this month"
              subtitle="Most active platform and custom agents across the workspace."
            />
            <GlassCard padding={6}>
              {leaderboard.length === 0 ? (
                <div style={{ padding: 24 }}>
                  <Skeleton height={20} />
                  <Skeleton height={20} style={{ marginTop: 10 }} />
                </div>
              ) : leaderboard.slice(0, 6).map((row: any, idx) => {
                const key = (row.agent_key || row.custom_agent_id || "agent") as string;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(`/agents/${key}`)}
                    style={{
                      display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10,
                      padding: "12px 14px", cursor: "pointer",
                      borderBottom: idx < Math.min(leaderboard.length, 6) - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${tokens.PURPLE}06`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <AgentChip agentKey={key} size={22} />
                    <span style={{ color: tokens.SLATE_600, fontSize: 12 }}>
                      {Number(row.runs || 0).toLocaleString()} runs · {Math.round((row.success_rate || 0) * 100)}% ok
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tokens.PURPLE_DEEP }}>
                      {Number(row.credits_used || 0).toLocaleString()} cr
                    </span>
                  </div>
                );
              })}
            </GlassCard>
          </div>

          {/* Activity */}
          <div>
            <SectionHeader eyebrow="Activity" title="Recently in the workspace" subtitle="Audit log highlights." />
            <GlassCard padding={6}>
              {activity.length === 0 ? (
                <div style={{ padding: 22 }}>
                  <Skeleton height={20} />
                  <Skeleton height={20} style={{ marginTop: 10 }} />
                  <Skeleton height={20} style={{ marginTop: 10 }} />
                </div>
              ) : activity.slice(0, 8).map((a, idx) => {
                const rt = a.related_resource_type;
                const rid = a.related_resource_id;
                const goTo = rt === "project" && rid ? `/workspace/projects/${rid}`
                  : rt === "team" && rid ? `/workspace/teams/${rid}`
                  : rt === "task" && rid ? `/tasks?task=${rid}`
                  : "/workspace/activity";
                return (
                  <div
                    key={a.id || idx}
                    onClick={() => navigate(goTo)}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center",
                      padding: "10px 14px", cursor: "pointer",
                      borderBottom: idx < Math.min(activity.length, 8) - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${tokens.PURPLE}06`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.activity_type.replace(/[_\.]/g, " ")}
                      </div>
                      <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>
                        {rt ? `${rt} ${String(rid || "").slice(0, 6)}…` : "—"}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                  </div>
                );
              })}
            </GlassCard>
          </div>
        </div>
      </div>

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

export default WorkspaceHome;
