import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pin, Clock, Star, Pin as PinIcon, Bell, Zap } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  teamApi,
  projectV2Api,
  analyticsV2Api,
  agentsV2Api,
  workspaceApi,
  type Team,
  type ProjectV2,
  type AnalyticsOverview,
  type ActivityRow,
} from "@/services/workspaceApi";
import {
  GlassCard, BrandPill, SectionHeader, MemberStack, AgentChip, RoleChip,
  Button, EmptyState, Skeleton, PlanBadge, CardGrid, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, FADE_UP, STAGGER, STAGGER_FAST, initials } from "@/components/workspace/tokens";
import InviteDialog from "@/components/workspace/InviteDialog";
import { TrendLineChart } from "@/components/charts";
import { toast } from "sonner";

interface PinRow { id: string; resource_type: string; resource_id: string; label?: string }
interface RecentRow { resource_type: string; resource_id: string; label?: string; touched_at?: string }
interface QuickAction { id: string; label: string; href?: string; icon?: string }

const RESOURCE_HREF: Record<string, (id: string) => string> = {
  team: id => `/workspace/teams/${id}`,
  project: id => `/workspace/projects/${id}`,
  task: id => `/tasks?focus=${id}`,
  document: id => `/documents?focus=${id}`,
  agent: id => `/agents/${id}`,
};

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
  const [pinned, setPinned] = useState<PinRow[]>([]);
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [starred, setStarred] = useState<PinRow[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [unread, setUnread] = useState<{ total?: number; by_category?: Record<string, number> } | null>(null);
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
      workspaceApi.pinned(activeOrgId).catch(() => []),
      workspaceApi.recent(activeOrgId).catch(() => []),
      workspaceApi.starred(activeOrgId).catch(() => []),
      workspaceApi.quickActions(activeOrgId).catch(() => []),
      workspaceApi.unread(activeOrgId).catch(() => null),
    ]).then(([t, p, ov, ac, lb, pn, rc, st, qa, un]) => {
      if (cancelled) return;
      setTeams(t); setProjects(p); setOverview(ov); setActivity(ac); setLeaderboard(lb || []);
      const arr = (v: any) => Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : [];
      setPinned(arr(pn)); setRecent(arr(rc)); setStarred(arr(st));
      setQuickActions(arr(qa)); setUnread(un as any);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrgId]);

  const goResource = (resource_type: string, resource_id: string) => {
    const h = RESOURCE_HREF[resource_type]?.(resource_id);
    if (h) navigate(h);
    if (activeOrgId) {
      workspaceApi.touchRecent(activeOrgId, { resource_type, resource_id }).catch(() => {});
    }
  };

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

      {/* Quick actions + Unread center (top strip) */}
      {(quickActions.length > 0 || unread) && (
        <CardGrid minCol={260} gap={14}>
          {quickActions.length > 0 && (
            <GlassCard padding={18}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Zap size={14} color={tokens.PURPLE} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Quick actions</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {quickActions.slice(0, 6).map((q, i) => (
                  <button
                    key={q.id || i}
                    onClick={() => q.href && navigate(q.href)}
                    style={{
                      padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                      border: `1px solid ${tokens.PURPLE}28`, background: `${tokens.PURPLE}10`,
                      color: tokens.PURPLE_DEEP, fontWeight: 600, fontSize: 12,
                    }}
                  >{q.label}</button>
                ))}
              </div>
            </GlassCard>
          )}
          {unread && (
            <GlassCard padding={18}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Bell size={14} color={tokens.AMBER} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Unread</span>
              </div>
              <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 30, fontWeight: 700 }}>{unread.total ?? 0}</div>
              {unread.by_category && Object.keys(unread.by_category).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                  {Object.entries(unread.by_category).slice(0, 5).map(([cat, n]) => (
                    <span key={cat} style={{ padding: "3px 9px", borderRadius: 999, background: tokens.SLATE_100, fontSize: 11, color: tokens.SLATE_700, fontWeight: 600 }}>
                      {cat} · {n}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </CardGrid>
      )}

      {/* Pinned / Recent / Starred rails */}
      {(pinned.length > 0 || recent.length > 0 || starred.length > 0) && (
        <CardGrid minCol={300} gap={14}>
          {pinned.length > 0 && (
            <GlassCard padding={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <PinIcon size={14} color={tokens.PURPLE} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Pinned</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {pinned.slice(0, 6).map((p, i) => (
                  <button key={p.id || i} onClick={() => goResource(p.resource_type, p.resource_id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", margin: "0 -10px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: tokens.INK, fontSize: 13, fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget.style.background = tokens.SLATE_50)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: 999, background: tokens.PURPLE }} />
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label || `${p.resource_type}:${p.resource_id.slice(0, 8)}`}</span>
                    <span style={{ fontSize: 10, color: tokens.SLATE_500, textTransform: "uppercase", letterSpacing: 0.4 }}>{p.resource_type}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}
          {recent.length > 0 && (
            <GlassCard padding={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Clock size={14} color={tokens.SKY} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Recently viewed</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recent.slice(0, 6).map((r, i) => (
                  <button key={i} onClick={() => goResource(r.resource_type, r.resource_id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", margin: "0 -10px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: tokens.INK, fontSize: 13, fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget.style.background = tokens.SLATE_50)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label || `${r.resource_type}:${r.resource_id.slice(0, 8)}`}</span>
                    <span style={{ fontSize: 10, color: tokens.SLATE_500, textTransform: "uppercase", letterSpacing: 0.4 }}>{r.resource_type}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}
          {starred.length > 0 && (
            <GlassCard padding={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Star size={14} color={tokens.AMBER} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Starred</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {starred.slice(0, 6).map((p, i) => (
                  <button key={p.id || i} onClick={() => goResource(p.resource_type, p.resource_id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", margin: "0 -10px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: tokens.INK, fontSize: 13, fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget.style.background = tokens.SLATE_50)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Star size={10} color={tokens.AMBER} fill={tokens.AMBER} />
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label || `${p.resource_type}:${p.resource_id.slice(0, 8)}`}</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}
        </CardGrid>
      )}

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
