import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/services/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  projectV2Api, agentsV2Api, teamApi, workspaceApi,
  type ProjectV2, type ProjectMember, type ProjectAgent, type AnalyticsOverview,
  type Team,
} from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, BrandPill, Button, Input, MemberAvatar, RoleChip,
  AgentChip, EmptyState, Skeleton,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, FADE_UP, initials } from "@/components/workspace/tokens";
import InviteDialog from "@/components/workspace/InviteDialog";
import MemberRowActions from "@/components/workspace/MemberRowActions";
import TaskCreateDialog from "@/components/workspace/TaskCreateDialog";
import AvatarUpload from "@/components/workspace/AvatarUpload";
import CoverUpload from "@/components/workspace/CoverUpload";
import MemberAvatarEditable from "@/components/workspace/MemberAvatarEditable";
import {
  BurnupChart, ActivityHeatmap, TrendLineChart, type BurnupPoint, type ActivityCell,
} from "@/components/charts";
import { toast } from "sonner";

const PROJECT_ROLES = ["viewer", "reviewer", "editor", "lead"];

// projects-v2-extended methods are attached to projectV2Api via Object.assign
// at runtime; this facade names the ones we call so they stay type-checked.
type Row = Record<string, any>;
const projExt = projectV2Api as typeof projectV2Api & {
  taskUpcoming: (o: string, p: string) => Promise<Row[] | Row>;
  taskTimeline: (o: string, p: string) => Promise<Row[] | Row>;
  taskCalendar: (o: string, p: string) => Promise<Row[] | Row>;
  analyticsBurndown: (o: string, p: string, r?: string) => Promise<{ series: Array<{ day: string; remaining: number }> }>;
  analyticsCycleTime: (o: string, p: string, r?: string) => Promise<{ count: number; avg_hours: number; max_hours?: number }>;
  analyticsCost: (o: string, p: string, r?: string) => Promise<{ cost_usd: number; credits_used: number; runs: number }>;
  savedFilters: (o: string, p: string) => Promise<Row[]>;
  createSavedFilter: (o: string, p: string, payload: { name: string; filters: any }) => Promise<Row>;
  deleteSavedFilter: (o: string, p: string, id: string) => Promise<unknown>;
  sharePublic: (o: string, p: string, payload?: { expires_at?: string }) => Promise<Row>;
  unsharePublic: (o: string, p: string) => Promise<unknown>;
  createExternalLink: (o: string, p: string, payload: { permissions?: string[]; expires_at?: string }) => Promise<Row>;
};

type Tab = "overview" | "tasks" | "agents" | "documents" | "chat" | "activity" | "analytics" | "members" | "settings";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "agents", label: "Agents" },
  { id: "documents", label: "Documents" },
  { id: "chat", label: "Chat" },
  { id: "activity", label: "Activity" },
  { id: "analytics", label: "Analytics" },
  { id: "members", label: "Members" },
  { id: "settings", label: "Settings" },
];

import ChatPanel from "@/components/workspace/ChatPanel";

const TabBar: React.FC<{ active: Tab; onChange: (t: Tab) => void }> = ({ active, onChange }) => (
  <div style={{
    display: "flex", gap: 4, padding: 4, overflowX: "auto",
    background: "rgba(255,255,255,0.65)", borderRadius: 9999,
    border: `1px solid ${tokens.SLATE_200}`,
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)", width: "fit-content",
  }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{
        padding: "8px 16px", borderRadius: 9999, border: "none",
        cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
        background: active === t.id ? "white" : "transparent",
        color: active === t.id ? tokens.PURPLE_DEEP : tokens.SLATE_600,
        boxShadow: active === t.id ? "0 2px 8px rgba(15,23,42,0.06)" : "none",
      }}>{t.label}</button>
    ))}
  </div>
);

const TASK_LANES = ["todo", "in_progress", "blocked", "completed"] as const;
const LANE_LABELS: Record<string, string> = { todo: "To do", in_progress: "In progress", blocked: "Blocked", completed: "Done" };

const TaskBoard: React.FC<{ orgId: string; projectId: string }> = ({ orgId, projectId }) => {
  const [tasks, setTasks] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<string>("todo");
  const [projectAgents, setProjectAgents] = useState<ProjectAgent[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    projectV2Api.tasks(orgId, projectId).then(r => setTasks(r as any)).finally(() => setLoading(false));
  };
  useEffect(load, [orgId, projectId]);
  useEffect(() => {
    projectV2Api.agents(orgId, projectId)
      .then(list => setProjectAgents((list || []).filter(a => a.enabled && a.agent_key)))
      .catch(() => setProjectAgents([]));
  }, [orgId, projectId]);

  const assignAgent = async (taskId: string, agentKey: string) => {
    if (!agentKey) return; // the /assign endpoint has no "unassign" mode
    setAssigningId(taskId);
    try {
      await api.post(`/tasks/${taskId}/assign`, { agent_key: agentKey });
      toast.success("Agent assigned — running now.");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail?.message || e?.response?.data?.detail || "Could not assign agent.");
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {TASK_LANES.map(l => (
          <GlassCard key={l} padding={16}>
            <Skeleton height={16} />
            <Skeleton height={48} style={{ marginTop: 12 }} />
            <Skeleton height={48} style={{ marginTop: 10 }} />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState title="No tasks yet" body="Tasks created in this project show up here in a kanban." action={
          <Button onClick={() => { setCreateStatus("todo"); setCreateOpen(true); }}>+ New task</Button>
        } />
        <TaskCreateDialog
          open={createOpen} onClose={() => setCreateOpen(false)}
          orgId={orgId} projectId={projectId} defaultStatus={createStatus}
          onCreated={() => { toast.success("Task created."); load(); }}
        />
      </>
    );
  }

  return (
    <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
      {TASK_LANES.map(lane => {
        const items = tasks.filter(t => (t.status || "todo") === lane);
        return (
          <GlassCard key={lane} padding={14}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>{LANE_LABELS[lane]}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700 }}>{items.length}</span>
                <button
                  onClick={() => { setCreateStatus(lane); setCreateOpen(true); }}
                  className="text-xs font-bold text-[#6C4AB0] hover:text-[#3B2D6A] px-1.5 leading-none"
                  aria-label={`Add task to ${lane}`}
                >+</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
              {items.map(t => {
                const priorityTone: Record<string, string> = {
                  critical: tokens.RED, high: tokens.ORANGE, medium: tokens.PURPLE_LIGHT, low: tokens.SLATE_400,
                };
                return (
                  <div key={t.id} style={{
                    padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.8)",
                    border: `1px solid ${tokens.SLATE_200}`,
                    boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
                  }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 9999,
                        background: priorityTone[t.priority || "medium"] || tokens.PURPLE_LIGHT,
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: tokens.INK }}>{t.title}</span>
                    </div>
                    {t.due_date && (
                      <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Due {new Date(t.due_date).toLocaleDateString()}</div>
                    )}
                    {t.assigned_to_agent && (
                      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <AgentChip agentKey={String(t.assigned_to_agent)} size={18} />
                        {t.agent_proposal?.status && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 9999,
                            background: t.agent_proposal.status === "error" ? "#FEE2E2"
                              : t.agent_proposal.status === "approved" ? "#DCFCE7" : "#EDE9FE",
                            color: t.agent_proposal.status === "error" ? "#991B1B"
                              : t.agent_proposal.status === "approved" ? "#166534" : "#5B21B6",
                          }}>
                            {t.agent_proposal.status === "pending_review" ? "needs review" : t.agent_proposal.status}
                          </span>
                        )}
                      </div>
                    )}
                    {projectAgents.length > 0 && (
                      <select
                        value={t.assigned_to_agent || ""}
                        disabled={assigningId === t.id}
                        onChange={e => assignAgent(t.id, e.target.value)}
                        style={{
                          marginTop: 8, width: "100%", fontSize: 11, padding: "4px 6px",
                          borderRadius: 8, border: `1px solid ${tokens.SLATE_200}`,
                          background: "white", color: tokens.SLATE_600,
                        }}
                      >
                        <option value="">{t.assigned_to_agent ? "Reassign agent…" : "Assign to agent…"}</option>
                        {projectAgents.map(a => (
                          <option key={a.id} value={a.agent_key || ""}>{a.agent_key}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </div>
    <TaskCreateDialog
      open={createOpen} onClose={() => setCreateOpen(false)}
      orgId={orgId} projectId={projectId} defaultStatus={createStatus}
      onCreated={() => { toast.success("Task created."); load(); }}
    />
    </>
  );
};

const AgentsPanel: React.FC<{ orgId: string; projectId: string }> = ({ orgId, projectId }) => {
  const [agents, setAgents] = useState<ProjectAgent[]>([]);
  const [platform, setPlatform] = useState<Array<{ key: string; name: string }>>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [pa, plat] = await Promise.all([
        projectV2Api.agents(orgId, projectId).catch(() => [] as ProjectAgent[]),
        agentsV2Api.platform().catch(() => ({ agents: [] as Array<{ key: string; name: string }>, count: 0 })),
      ]);
      setAgents(pa); setPlatform(plat.agents || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [orgId, projectId]);

  const attached = useMemo(() => new Set(agents.map(a => a.agent_key || `custom:${a.custom_agent_id}`)), [agents]);
  const available = useMemo(() => platform.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.key.toLowerCase().includes(search.toLowerCase())) return false;
    return !attached.has(p.key);
  }), [platform, attached, search]);

  const attach = async (key: string) => {
    setBusyKey(key);
    try {
      const row = await projectV2Api.attachAgent(orgId, projectId, { agent_key: key });
      setAgents(prev => [row, ...prev]);
    } catch { /* ignore */ } finally { setBusyKey(null); }
  };

  const detach = async (ref: string) => {
    setBusyKey(ref);
    try {
      await projectV2Api.detachAgent(orgId, projectId, ref);
      setAgents(prev => prev.filter(a => (a.agent_key || `custom:${a.custom_agent_id}`) !== ref));
    } finally { setBusyKey(null); }
  };

  const setAutonomy = async (ref: string, level: "suggest" | "auto-propose" | "auto-execute") => {
    try {
      const updated = await projectV2Api.patchAgentConfig(orgId, projectId, ref, { autonomy_level: level });
      setAgents(prev => prev.map(a => (a.agent_key || `custom:${a.custom_agent_id}`) === ref ? updated : a));
    } catch { /* ignore */ }
  };

  if (loading) {
    return <GlassCard padding={20}><Skeleton height={16} /><Skeleton height={36} style={{ marginTop: 14 }} /></GlassCard>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
      <div>
        <SectionHeader title="Active agents" subtitle="Tune autonomy per agent. The 21 platform agents are free everywhere." />
        {agents.length === 0 ? (
          <EmptyState title="No agents attached yet" body="Browse the catalogue to add an agent to this project." />
        ) : (
          <GlassCard padding={6}>
            {agents.map((a, idx) => {
              const ref = (a.agent_key || `custom:${a.custom_agent_id}`) as string;
              return (
                <div key={ref} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: idx < agents.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
                }}>
                  <AgentChip agentKey={a.agent_key || a.custom_agent_id || "agent"} size={28} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>Model: {(a.config_overrides as any)?.model || "default"}</div>
                  </div>
                  <select
                    value={a.autonomy_level}
                    onChange={e => setAutonomy(ref, e.target.value as "suggest" | "auto-propose" | "auto-execute")}
                    style={{
                      padding: "6px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${tokens.SLATE_200}`, background: "white",
                    }}>
                    <option value="suggest">Suggest only</option>
                    <option value="auto-propose">Auto-propose</option>
                    <option value="auto-execute">Auto-execute</option>
                  </select>
                  <Button tone="ghost" size="sm" disabled={busyKey === ref} onClick={() => detach(ref)}>Remove</Button>
                </div>
              );
            })}
          </GlassCard>
        )}
      </div>
      <div>
        <SectionHeader title="Catalogue" subtitle="Add a platform agent." />
        <GlassCard padding={14}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, maxHeight: 360, overflow: "auto" }}>
            {available.map(p => (
              <div key={p.key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 6px", borderRadius: 10,
              }}>
                <AgentChip agentKey={p.key} size={22} />
                <span style={{ flex: 1, fontSize: 13, color: tokens.INK, fontWeight: 600 }}>{p.name}</span>
                <Button tone="outline" size="sm" disabled={busyKey === p.key} onClick={() => attach(p.key)}>Add</Button>
              </div>
            ))}
            {available.length === 0 && (
              <div style={{ fontSize: 12, color: tokens.SLATE_500, padding: "8px 6px" }}>All available agents are attached.</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Tasks tab with a view switcher. Board is the existing kanban; Upcoming/
// Timeline/Calendar consume the projects-v2 task-view endpoints that were
// REAL but had no UI caller.
const TASK_VIEWS = ["board", "upcoming", "timeline", "calendar"] as const;
type TaskView = typeof TASK_VIEWS[number];
const VIEW_LABELS: Record<TaskView, string> = { board: "Board", upcoming: "Upcoming", timeline: "Timeline", calendar: "Calendar" };

const statusColor = (s?: string): string =>
  s === "completed" ? tokens.GREEN : s === "blocked" ? tokens.RED : s === "in_progress" ? tokens.PURPLE : tokens.SLATE_400;

const TaskRow: React.FC<{ t: Row }> = ({ t }) => (
  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 10, alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${tokens.SLATE_200}` }}>
    <span style={{ width: 8, height: 8, borderRadius: 999, background: statusColor(t.status) }} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title || "Untitled task"}</div>
      <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{(t.status || "todo").replace(/_/g, " ")}{t.assigned_to_agent ? ` · agent: ${t.assigned_to_agent}` : ""}</div>
    </div>
    {t.priority ? <span style={{ fontSize: 11, color: tokens.SLATE_500, textTransform: "uppercase", fontWeight: 700 }}>{t.priority}</span> : <span />}
    <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "no due date"}</span>
  </div>
);

const TaskViews: React.FC<{ orgId: string; projectId: string }> = ({ orgId, projectId }) => {
  const [view, setView] = useState<TaskView>("board");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === "board") return;
    setLoading(true);
    const p =
      view === "upcoming" ? projExt.taskUpcoming(orgId, projectId).then((r: any) => Array.isArray(r) ? r : (r?.tasks || r?.timeline || [])) :
      view === "timeline" ? projExt.taskTimeline(orgId, projectId).then((r: any) => r?.timeline || (Array.isArray(r) ? r : [])) :
      projExt.taskCalendar(orgId, projectId).then((r: any) => r?.tasks || (Array.isArray(r) ? r : []));
    p.then((list: Row[]) => setRows(list || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, [view, orgId, projectId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.65)", borderRadius: 9999, border: `1px solid ${tokens.SLATE_200}`, width: "fit-content" }}>
        {TASK_VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 9999, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, background: view === v ? "white" : "transparent", color: view === v ? tokens.PURPLE_DEEP : tokens.SLATE_600, boxShadow: view === v ? "0 2px 8px rgba(15,23,42,0.06)" : "none" }}>{VIEW_LABELS[v]}</button>
        ))}
      </div>
      {view === "board" ? (
        <TaskBoard orgId={orgId} projectId={projectId} />
      ) : loading ? (
        <GlassCard padding={20}><Skeleton height={16} /><Skeleton height={16} style={{ marginTop: 10 }} /></GlassCard>
      ) : rows.length === 0 ? (
        <EmptyState title={`Nothing in ${VIEW_LABELS[view].toLowerCase()}`} body={view === "upcoming" ? "No tasks due in the next 14 days." : "No dated tasks to show here yet."} />
      ) : (
        <GlassCard padding={6}>{rows.map((t, i) => <TaskRow key={t.id || i} t={t} />)}</GlassCard>
      )}
    </div>
  );
};

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeOrgId } = useWorkspace();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectV2 | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [docs, setDocs] = useState<Array<Record<string, any>>>([]);
  const [activity, setActivity] = useState<Array<Record<string, any>>>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId || !projectId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      projectV2Api.get(activeOrgId, projectId).catch(() => null),
      projectV2Api.members(activeOrgId, projectId).catch(() => []),
      projectV2Api.documents(activeOrgId, projectId).catch(() => []),
      projectV2Api.activity(activeOrgId, projectId).catch(() => []),
      projectV2Api.analytics(activeOrgId, projectId).catch(() => null),
    ]).then(([p, m, d, ac, an]) => {
      if (cancelled) return;
      setProject(p); setMembers(m); setDocs(d as any); setActivity(ac as any); setAnalytics(an);
    }).finally(() => { if (!cancelled) setLoading(false); });
    // "Recent" on WorkspaceHome only updated on an explicit click there —
    // opening a project directly (nav, bookmark, search result) never
    // touched it, so the rail rarely reflected what you'd actually been
    // working on. Touch it on every real open.
    workspaceApi.touchRecent(activeOrgId, { resource_type: "project", resource_id: projectId }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeOrgId, projectId]);

  if (!activeOrgId || !projectId) return null;
  if (loading && !project) {
    return <GlassCard padding={28}><Skeleton height={32} /><Skeleton height={14} style={{ marginTop: 12 }} /></GlassCard>;
  }
  if (!project) {
    return <EmptyState title="Project not found" action={<Button onClick={() => navigate("/workspace/projects")}>Back to projects</Button>} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <motion.div {...FADE_UP}>
        <CoverUpload
          scope="project"
          scopeId={project.id}
          orgId={activeOrgId}
          currentUrl={project.cover_image_url}
          height={180}
          rounded={20}
          overlay="dark"
          onUploaded={(url) => {
            setProject(prev => prev ? { ...prev, cover_image_url: url } as any : prev);
            toast.success("Cover updated.");
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <AvatarUpload
              scope="project"
              scopeId={project.id}
              orgId={activeOrgId}
              currentUrl={(project as any).logo_url}
              fallbackName={project.name}
              size={64}
              rounded="lg"
              onUploaded={(url) => {
                setProject(prev => prev ? { ...prev, logo_url: url } as any : prev);
                toast.success("Logo updated.");
              }}
            />
            <div style={{ flex: 1, minWidth: 0, color: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12, fontWeight: 700, color: "white", letterSpacing: 0.3, textTransform: "capitalize" }}>
                  {project.status}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600, color: "white", textTransform: "capitalize" }}>
                  {project.visibility}
                </span>
                {project.strict_mode && (
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600, color: "white" }}>Strict mode</span>
                )}
              </div>
              <h1 style={{ margin: "8px 0 0", fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 30, letterSpacing: -0.6, color: "white", textShadow: "0 2px 16px rgba(15,23,42,0.4)" }}>
                {project.name}
              </h1>
              {project.description && (
                <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 14, marginTop: 6, marginBottom: 0, maxWidth: 720, textShadow: "0 1px 8px rgba(15,23,42,0.4)" }}>{project.description}</p>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button tone="outline" size="sm" onClick={() => setTab("agents")}>Manage agents</Button>
              <Button tone="primary" size="sm" onClick={() => setInviteOpen(true)}>Invite</Button>
            </div>
          </div>
        </CoverUpload>
      </motion.div>

      <TabBar active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <GlassCard padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Tasks total</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 30, fontWeight: 700, marginTop: 6 }}>{analytics?.tasks?.total ?? 0}</div>
            <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 4 }}>{analytics?.tasks?.completed ?? 0} completed</div>
          </GlassCard>
          <GlassCard padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Completion</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 30, fontWeight: 700, marginTop: 6, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {Math.round((analytics?.tasks?.completion_rate || 0) * 100)}%
            </div>
            <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 4 }}>{(analytics?.tasks as any)?.overdue ?? 0} overdue</div>
          </GlassCard>
          <GlassCard padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Agent runs (30d)</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 30, fontWeight: 700, marginTop: 6 }}>{(analytics?.agent_runs?.total ?? 0).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 4 }}>{(analytics as any)?.documents?.total ?? docs.length} documents</div>
          </GlassCard>
          <GlassCard padding={20} style={{ gridColumn: "1 / -1" }}>
            <SectionHeader title="Members" subtitle="People who can read or edit this project." />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {members.map(m => (
                <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: 9999, background: "rgba(255,255,255,0.7)", border: `1px solid ${tokens.SLATE_200}` }}>
                  <MemberAvatarEditable
                    userId={m.user_id}
                    size={24}
                    name={m.full_name || m.email}
                    avatarUrl={m.avatar_url}
                    onSelfUpdated={(url) => {
                      setMembers(prev => prev.map(x => x.user_id === m.user_id ? { ...x, avatar_url: url } : x));
                    }}
                  />
                  <span style={{ fontSize: 12, color: tokens.INK, fontWeight: 600 }}>{m.full_name || m.email || m.user_id.slice(0, 6)}</span>
                  <RoleChip role={m.role} />
                </div>
              ))}
              {members.length === 0 && (
                <span style={{ fontSize: 13, color: tokens.SLATE_500 }}>Just you so far. Invite members from the Members tab.</span>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "tasks" && <TaskViews orgId={activeOrgId} projectId={projectId} />}
      {tab === "agents" && <AgentsPanel orgId={activeOrgId} projectId={projectId} />}

      {tab === "documents" && (
        <GlassCard padding={6}>
          {docs.length === 0 ? (
            <div style={{ padding: 24 }}><EmptyState title="No documents yet" body="Upload from the project hub or paste a URL." /></div>
          ) : docs.map((d: any, idx) => (
            <div key={d.id || idx} style={{
              display: "grid", gridTemplateColumns: "1fr auto", padding: "12px 16px", gap: 12,
              borderBottom: idx < docs.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: tokens.INK }}>{d.name || d.title || d.filename || d.id?.slice(0, 8)}</div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{d.mime_type || d.type || "document"}</div>
              </div>
              <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : ""}</span>
            </div>
          ))}
        </GlassCard>
      )}

      {tab === "chat" && <ChatPanel orgId={activeOrgId} projectId={projectId} />}

      {tab === "activity" && (
        <GlassCard padding={6}>
          {activity.length === 0 ? (
            <div style={{ padding: 24 }}><EmptyState title="No activity yet" /></div>
          ) : activity.slice(0, 50).map((a: any, idx) => (
            <div key={a.id || idx} style={{
              display: "grid", gridTemplateColumns: "1fr auto", gap: 10,
              padding: "10px 16px",
              borderBottom: idx < activity.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.INK }}>{a.activity_type?.replace(/[_\.]/g, " ")}</div>
              <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}</span>
            </div>
          ))}
        </GlassCard>
      )}

      {tab === "analytics" && (
        <ProjectAnalyticsPanel orgId={activeOrgId} project={project} analytics={analytics} activity={activity} />
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
              <EmptyState title="Just you" body="Invite members from the workspace to collaborate on this project." action={<Button onClick={() => setInviteOpen(true)}>Invite</Button>} />
            </div>
          ) : members.map((m, idx) => (
            <div key={m.user_id} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center",
              padding: "12px 16px",
              borderBottom: idx < members.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
            }}>
              <MemberAvatarEditable
                userId={m.user_id}
                name={m.full_name || m.email}
                avatarUrl={m.avatar_url}
                size={36}
                onSelfUpdated={(url) => {
                  setMembers(prev => prev.map(x => x.user_id === m.user_id ? { ...x, avatar_url: url } : x));
                  toast.success("Profile photo updated");
                }}
              />
              <div>
                <div style={{ fontWeight: 700, color: tokens.INK }}>{m.full_name || m.email || m.user_id}</div>
                <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>{m.email || "—"}</div>
              </div>
              <RoleChip role={m.role} />
              <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : ""}</span>
              <MemberRowActions
                currentRole={m.role}
                roleChoices={PROJECT_ROLES}
                onChangeRole={async (next) => {
                  try {
                    await projectV2Api.updateMemberRole(activeOrgId!, projectId!, m.user_id, next as any);
                    setMembers(prev => prev.map(x => x.user_id === m.user_id ? { ...x, role: next as any } : x));
                    toast.success("Role updated.");
                  } catch (e: any) { toast.error(e?.response?.data?.detail || "Could not change role."); }
                }}
                onRemove={async () => {
                  try {
                    await projectV2Api.removeMember(activeOrgId!, projectId!, m.user_id);
                    setMembers(prev => prev.filter(x => x.user_id !== m.user_id));
                    toast.success("Removed from project.");
                  } catch (e: any) { toast.error(e?.response?.data?.detail || "Could not remove member."); }
                }}
              />
            </div>
          ))}
        </GlassCard>
      )}

      {project && activeOrgId && (
        <InviteDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          scope="project"
          orgId={activeOrgId}
          projectId={projectId}
          onInvited={() => { toast.success("Invitations sent."); }}
        />
      )}

      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard padding={24}>
            <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK }}>Project settings</h3>
            <p style={{ color: tokens.SLATE_600, fontSize: 13, marginBottom: 16 }}>Adjust the project name, description, status, visibility, and strict mode.</p>
            <ProjectSettingsForm project={project} orgId={activeOrgId} onSaved={p => setProject(p)} />
          </GlassCard>
          <ProjectSharingCard orgId={activeOrgId} project={project} onChanged={p => setProject(p)} />
        </div>
      )}
    </div>
  );
};

// Real project analytics — burnup/burndown/cycle-time/cost all come from
// the analytics-v2 aggregations (previously this panel FABRICATED a burnup
// and runs trend client-side from a single total, the same anti-pattern the
// workspace home was fixed for).  A 7×24 heatmap is still derived from the
// activity log (that's a genuine client-side rollup, not fabricated data).
const ProjectAnalyticsPanel: React.FC<{
  orgId: string;
  project: ProjectV2;
  analytics: AnalyticsOverview | null;
  activity: Array<Record<string, any>>;
}> = ({ orgId, project, analytics, activity }) => {
  const [burnupSeries, setBurnupSeries] = useState<Array<{ day: string; created: number; completed: number }>>([]);
  const [burndownSeries, setBurndownSeries] = useState<Array<{ day: string; remaining: number }>>([]);
  const [cycle, setCycle] = useState<{ count: number; avg_hours: number; max_hours?: number } | null>(null);
  const [cost, setCost] = useState<{ cost_usd: number; credits_used: number; runs: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyticsV2Api.projectBurnup(project.id, orgId).then((r: any) => !cancelled && setBurnupSeries(r?.series || [])).catch(() => {});
    projExt.analyticsBurndown(orgId, project.id).then(r => !cancelled && setBurndownSeries(r?.series || [])).catch(() => {});
    projExt.analyticsCycleTime(orgId, project.id).then(r => !cancelled && setCycle(r)).catch(() => {});
    projExt.analyticsCost(orgId, project.id).then(r => !cancelled && setCost(r)).catch(() => {});
    return () => { cancelled = true; };
  }, [orgId, project.id]);

  const burnup: BurnupPoint[] = React.useMemo(() =>
    burnupSeries.map(s => ({
      date: new Date(s.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      scope: s.created,
      completed: s.completed,
    })), [burnupSeries]);

  const burndown = React.useMemo(() =>
    burndownSeries.map(s => ({
      day: new Date(s.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      remaining: s.remaining,
    })), [burndownSeries]);

  const heat: ActivityCell[] = React.useMemo(() => {
    const cells = new Map<string, number>();
    for (const a of activity || []) {
      const ts = a?.timestamp;
      if (!ts) continue;
      try {
        const d = new Date(ts);
        const wd = (d.getDay() + 6) % 7; // Mon..Sun
        const hr = d.getHours();
        const key = `${wd}:${hr}`;
        cells.set(key, (cells.get(key) || 0) + 1);
      } catch { /* noop */ }
    }
    return Array.from(cells.entries()).map(([k, count]) => {
      const [wd, hr] = k.split(":").map(Number);
      return { weekday: wd, hour: hr, count };
    });
  }, [activity]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <GlassCard padding={20}>
          <div style={{ fontSize: 11, fontWeight: 800, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Tasks</div>
          <div style={{ marginTop: 8, display: "flex", gap: 22 }}>
            <div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Total</div>
              <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 28, fontWeight: 700 }}>{analytics?.tasks?.total ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Completed</div>
              <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 28, fontWeight: 700, color: tokens.GREEN }}>{analytics?.tasks?.completed ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Overdue</div>
              <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 28, fontWeight: 700, color: tokens.RED }}>{(analytics?.tasks as any)?.overdue ?? 0}</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding={20}>
          <div style={{ fontSize: 11, fontWeight: 800, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Cycle time</div>
          <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 8 }}>{cycle ? `${cycle.avg_hours}h` : "—"}</div>
          <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>avg over {cycle?.count ?? 0} completed{cycle?.max_hours ? ` · max ${cycle.max_hours}h` : ""}</div>
        </GlassCard>
        <GlassCard padding={20}>
          <div style={{ fontSize: 11, fontWeight: 800, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Agent cost (30d)</div>
          <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 8 }}>{cost ? `${cost.credits_used.toLocaleString()} cr` : "—"}</div>
          <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>{cost?.runs ?? 0} runs · ${cost?.cost_usd ?? 0} internal</div>
        </GlassCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
        <BurnupChart data={burnup} title="Task burnup" subtitle="Cumulative scope vs. completed (real)." height={240} />
        <TrendLineChart
          data={burndown}
          xKey="day"
          series={[{ key: "remaining", label: "Remaining", color: tokens.AMBER }]}
          title="Burndown"
          subtitle="Open tasks remaining over time."
          height={240}
        />
      </div>

      <ActivityHeatmap
        cells={heat}
        title="When the team is active"
        subtitle="Project activity log by weekday × hour."
      />
    </div>
  );
};

const ProjectSettingsForm: React.FC<{ project: ProjectV2; orgId: string; onSaved: (p: ProjectV2) => void }> = ({ project, orgId, onSaved }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState(project.status);
  const [visibility, setVisibility] = useState(project.visibility);
  const [strict, setStrict] = useState(project.strict_mode);
  const [teamId, setTeamId] = useState<string>(project.team_id ? String(project.team_id) : "");
  const [teams, setTeams] = useState<Team[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    teamApi.list(orgId).then(setTeams).catch(() => setTeams([]));
  }, [orgId]);

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const updated = await projectV2Api.update(orgId, project.id, {
        name, description, status, visibility, strict_mode: strict,
        team_id: teamId || null,
      } as any);
      onSaved(updated); setMsg("Saved.");
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || e?.message || "Save failed");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
      <label style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Name</div>
        <Input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Description</div>
        <Input value={description} onChange={e => setDescription(e.target.value)} />
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Team</div>
        <select value={teamId} onChange={e => setTeamId(e.target.value)} style={{
          width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`,
          fontSize: 14, background: "white", fontFamily: tokens.BODY_STACK,
        }}>
          <option value="">No team (workspace-level)</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}{t.department_tag ? ` · ${t.department_tag}` : ""}</option>)}
        </select>
        <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 6 }}>
          Move this project into a team so it counts toward that team's projects + analytics.
        </div>
      </label>
      <label>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Status</div>
        <select value={status} onChange={e => setStatus(e.target.value as ProjectV2["status"])} style={{
          width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`,
          fontSize: 14, background: "white", fontFamily: tokens.BODY_STACK,
        }}>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label>
        <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Visibility</div>
        <select value={visibility} onChange={e => setVisibility(e.target.value as ProjectV2["visibility"])} style={{
          width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`,
          fontSize: 14, background: "white", fontFamily: tokens.BODY_STACK,
        }}>
          <option value="private">Private</option>
          <option value="team">Team</option>
          <option value="org">Workspace</option>
        </select>
      </label>
      <label style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" checked={strict} onChange={e => setStrict(e.target.checked)} />
        <span style={{ fontSize: 13, color: tokens.INK, fontWeight: 600 }}>Strict mode</span>
        <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>Requires lead approval on any structural change. Business+ plans.</span>
      </label>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
        <Button tone="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        {msg && <span style={{ color: tokens.SLATE_600, fontSize: 13 }}>{msg}</span>}
      </div>
    </div>
  );
};

const ProjectSharingCard: React.FC<{ orgId: string; project: ProjectV2; onChanged: (p: ProjectV2) => void }> = ({ orgId, project, onChanged }) => {
  const isOrgVisible = project.visibility === "org";
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  const toggleOrg = async () => {
    setBusy(true);
    try {
      if (isOrgVisible) { await projExt.unsharePublic(orgId, project.id); onChanged({ ...project, visibility: "private" } as ProjectV2); toast.success("Now private."); }
      else { await projExt.sharePublic(orgId, project.id); onChanged({ ...project, visibility: "org" } as ProjectV2); toast.success("Shared with the whole org."); }
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Could not update sharing."); }
    finally { setBusy(false); }
  };

  const makeLink = async () => {
    setBusy(true);
    try {
      const r: any = await projExt.createExternalLink(orgId, project.id, {});
      const url = `${window.location.origin}${r.url || `/p/${project.id}/share/${r.token}`}`;
      setLink(url);
      try { await navigator.clipboard.writeText(url); toast.success("Link copied to clipboard."); }
      catch { toast.success("Link created."); }
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Could not create link."); }
    finally { setBusy(false); }
  };

  return (
    <GlassCard padding={24}>
      <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK }}>Sharing</h3>
      <p style={{ color: tokens.SLATE_600, fontSize: 13, marginBottom: 16 }}>Control who can see this project. External links are read-only and can be revoked any time.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: `1px solid ${tokens.SLATE_200}`, borderRadius: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 14 }}>Visible to the whole organisation</div>
            <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>{isOrgVisible ? "Every org member can open this project." : "Only project members can open it."}</div>
          </div>
          <Button tone={isOrgVisible ? "outline" : "primary"} size="sm" disabled={busy} onClick={toggleOrg}>{isOrgVisible ? "Make private" : "Share with org"}</Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: `1px solid ${tokens.SLATE_200}`, borderRadius: 12, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 14 }}>Read-only external link</div>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link || "Generate a token-protected link to share outside the org."}</div>
          </div>
          <Button tone="outline" size="sm" disabled={busy} onClick={makeLink}>{link ? "New link" : "Create link"}</Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProjectDetail;
