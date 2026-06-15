import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  projectV2Api, agentsV2Api, teamApi,
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
import { toast } from "sonner";

const PROJECT_ROLES = ["viewer", "reviewer", "editor", "lead"];

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

  const load = () => {
    setLoading(true);
    projectV2Api.tasks(orgId, projectId).then(r => setTasks(r as any)).finally(() => setLoading(false));
  };
  useEffect(load, [orgId, projectId]);

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
          projectId={projectId} defaultStatus={createStatus}
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
                      <div style={{ marginTop: 6 }}>
                        <AgentChip agentKey={String(t.assigned_to_agent)} size={18} />
                      </div>
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
      projectId={projectId} defaultStatus={createStatus}
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

      {tab === "tasks" && <TaskBoard orgId={activeOrgId} projectId={projectId} />}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
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
            <div style={{ fontSize: 11, fontWeight: 800, color: tokens.SLATE_500, letterSpacing: 1, textTransform: "uppercase" }}>Agent runs (30d)</div>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 36, fontWeight: 700, marginTop: 8 }}>{(analytics?.agent_runs?.total ?? 0).toLocaleString()}</div>
            <div style={{ color: tokens.SLATE_600, fontSize: 12, marginTop: 4 }}>{project.agent_keys.length + project.custom_agent_ids.length} agents attached.</div>
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
        <GlassCard padding={24}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK }}>Project settings</h3>
          <p style={{ color: tokens.SLATE_600, fontSize: 13, marginBottom: 16 }}>Adjust the project name, description, status, visibility, and strict mode.</p>
          <ProjectSettingsForm project={project} orgId={activeOrgId} onSaved={p => setProject(p)} />
        </GlassCard>
      )}
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

export default ProjectDetail;
