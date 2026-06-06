import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { projectV2Api, teamApi, type ProjectV2, type Team } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, AgentChip, MemberStack, EmptyState, Skeleton, BrandPill,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, STAGGER, initials } from "@/components/workspace/tokens";

const STATUS_TONES: Record<string, { bg: string; color: string }> = {
  planning: { bg: `${tokens.SKY}1A`, color: tokens.SKY },
  active: { bg: `${tokens.PURPLE}14`, color: tokens.PURPLE_DEEP },
  blocked: { bg: `${tokens.RED}14`, color: tokens.RED },
  completed: { bg: `${tokens.GREEN}14`, color: tokens.GREEN },
  archived: { bg: `${tokens.SLATE_400}22`, color: tokens.SLATE_600 },
};

const CreateProjectPanel: React.FC<{ orgId: string; teams: Team[]; defaultTeamId?: string; onCreated: (p: ProjectV2) => void; onClose: () => void }> = ({
  orgId, teams, defaultTeamId, onCreated, onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState<string>(defaultTeamId || "");
  const [color, setColor] = useState(tokens.PURPLE);
  const [visibility, setVisibility] = useState<"private" | "team" | "org">(defaultTeamId ? "team" : "private");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const palette = [tokens.PURPLE, tokens.PURPLE_DEEP, tokens.SKY, tokens.TEAL, tokens.ORANGE, tokens.GREEN, tokens.AMBER, "#EC4899"];

  const submit = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setBusy(true); setError(null);
    try {
      const p = await projectV2Api.create(orgId, {
        name: name.trim(),
        description,
        team_id: teamId || undefined,
        color,
        visibility,
      });
      onCreated(p);
    } catch (e: any) {
      setError(e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Could not create project");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 20, fontWeight: 700, margin: 0 }}>New project</h3>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: tokens.SLATE_500, fontSize: 14, cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Name</div>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" autoFocus />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Description</div>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this project for?" rows={3} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Team (optional)</div>
          <select value={teamId} onChange={e => setTeamId(e.target.value)} style={{
            width: "100%", padding: "10px 14px", borderRadius: 12,
            border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white", fontFamily: tokens.BODY_STACK,
          }}>
            <option value="">No team (workspace-level)</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Visibility</div>
          <select value={visibility} onChange={e => setVisibility(e.target.value as "private" | "team" | "org")} style={{
            width: "100%", padding: "10px 14px", borderRadius: 12,
            border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white", fontFamily: tokens.BODY_STACK,
          }}>
            <option value="private">Private — invited members only</option>
            <option value="team">Team — anyone on the team can read</option>
            <option value="org">Workspace — every member can read</option>
          </select>
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Colour</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {palette.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 28, height: 28, borderRadius: 9999, background: c, cursor: "pointer",
                border: color === c ? `2px solid ${tokens.INK}` : "2px solid white",
                boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
              }} />
            ))}
          </div>
        </div>
        {error && <div style={{ gridColumn: "1 / -1", color: tokens.RED, fontSize: 13 }}>{error}</div>}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 6 }}>
          <Button tone="primary" onClick={submit} disabled={busy}>{busy ? "Creating…" : "Create project"}</Button>
          <Button tone="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </GlassCard>
  );
};

export const ProjectsList: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectV2[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(searchParams.get("new") !== null);
  const [loading, setLoading] = useState(true);

  const defaultTeamId = searchParams.get("team") || undefined;

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        projectV2Api.list(activeOrgId, { includeArchived: false }),
        teamApi.list(activeOrgId),
      ]);
      setProjects(p); setTeams(t);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    });
  }, [projects, search, statusFilter]);

  if (!activeOrgId) return null;

  const statuses = ["all", "planning", "active", "blocked", "completed", "archived"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        eyebrow="Projects"
        title="Projects in this workspace"
        subtitle="Each project owns its tasks, documents, and agents. Strict mode and visibility are governed at the project level."
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects" style={{ width: 240 }} />
            <Button tone="primary" onClick={() => setShowCreate(true)}>New project</Button>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
            background: statusFilter === s ? BRAND_GRADIENT : "rgba(255,255,255,0.6)",
            color: statusFilter === s ? "white" : tokens.SLATE_600,
            border: `1px solid ${tokens.SLATE_200}`, cursor: "pointer",
          }}>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {showCreate && (
        <CreateProjectPanel
          orgId={activeOrgId}
          teams={teams}
          defaultTeamId={defaultTeamId}
          onClose={() => setShowCreate(false)}
          onCreated={(p) => { setShowCreate(false); setProjects(prev => [p, ...prev]); navigate(`/workspace/projects/${p.id}`); }}
        />
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} padding={20}><Skeleton height={20} /><Skeleton height={14} style={{ marginTop: 10 }} /><Skeleton height={14} style={{ marginTop: 6 }} /></GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No projects match" body="Try a different filter or create a new project." action={<Button onClick={() => setShowCreate(true)}>Create project</Button>} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          {filtered.map((p, i) => {
            const tone = STATUS_TONES[p.status] || STATUS_TONES.planning;
            return (
              <motion.div key={p.id} {...STAGGER(i)}>
                <GlassCard
                  padding={20}
                  onClick={() => navigate(`/workspace/projects/${p.id}`)}
                  style={{ cursor: "pointer", height: "100%" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: p.color || tokens.PURPLE }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{p.visibility} · {p.member_ids.length} members</div>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 9999,
                      background: tone.bg, color: tone.color,
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                    }}>{p.status}</span>
                  </div>
                  <p style={{ color: tokens.SLATE_600, fontSize: 13, lineHeight: 1.55, margin: 0, minHeight: 40 }}>
                    {p.description || "—"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                    <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                      {p.agent_keys.slice(0, 3).map(k => <AgentChip key={k} agentKey={k} size={20} />)}
                      {p.agent_keys.length > 3 && (
                        <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, background: tokens.SLATE_100, color: tokens.SLATE_600, fontWeight: 600 }}>
                          +{p.agent_keys.length - 3}
                        </span>
                      )}
                    </div>
                    {p.strict_mode && <BrandPill tone="ghost" style={{ background: `${tokens.PURPLE}10` }}>Strict mode</BrandPill>}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
