import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { projectV2Api, teamApi, type ProjectV2, type Team } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, AgentChip, MemberStack, BrandPill,
  Toolbar, FilterChips, CardGrid, SkeletonCard, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, STAGGER_FAST, HOVER_LIFT, initials } from "@/components/workspace/tokens";

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
  const location = useLocation();
  const [projects, setProjects] = useState<ProjectV2[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Open the create panel when either ?new is set OR the path ends in
  // /projects/new (the route TeamDetail navigates to).
  const [showCreate, setShowCreate] = useState(
    searchParams.get("new") !== null || location.pathname.endsWith("/new"),
  );
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

  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    for (const p of projects) counts[p.status] = (counts[p.status] || 0) + 1;
    return [
      { id: "all", label: "All", count: counts.all },
      { id: "planning", label: "Planning", count: counts.planning },
      { id: "active", label: "Active", count: counts.active },
      { id: "blocked", label: "Blocked", count: counts.blocked },
      { id: "completed", label: "Completed", count: counts.completed },
      { id: "archived", label: "Archived", count: counts.archived },
    ];
  }, [projects]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        eyebrow="Projects"
        title="Projects in this workspace"
        subtitle="Each project owns its tasks, documents, and agents. Strict mode and visibility are governed at the project level."
      />

      <Toolbar
        left={<Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects" style={{ width: 280 }} />}
        center={<FilterChips options={statusOptions} value={statusFilter} onChange={v => setStatusFilter(typeof v === "string" ? v : "all")} />}
        right={<Button tone="primary" onClick={() => setShowCreate(true)}>New project</Button>}
      />

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
        <CardGrid minCol={280}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} height={220} />)}
        </CardGrid>
      ) : filtered.length === 0 ? (
        <OrbEmptyState
          title="No projects match"
          body="Try a different filter or create a new project."
          action={<Button onClick={() => setShowCreate(true)}>Create project</Button>}
        />
      ) : (
        <CardGrid minCol={280}>
          {filtered.map((p, i) => {
            const tone = STATUS_TONES[p.status] || STATUS_TONES.planning;
            return (
              <motion.div key={p.id} {...STAGGER_FAST(i)} {...HOVER_LIFT}>
                <GlassCard
                  padding={0}
                  onClick={() => navigate(`/workspace/projects/${p.id}`)}
                  style={{ cursor: "pointer", height: "100%", overflow: "hidden" }}
                >
                  {/* Cover strip */}
                  <div style={{
                    height: 88,
                    background: (p as any).cover_image_url
                      ? `url(${(p as any).cover_image_url}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${p.color || tokens.PURPLE} 0%, ${tokens.SKY} 100%)`,
                    position: "relative",
                  }}>
                    {(p as any).cover_image_url && (
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0) 50%, rgba(15,23,42,0.18) 100%)" }} />
                    )}
                  </div>
                  <div style={{ padding: 18, paddingTop: 14, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: -28, marginBottom: 10 }}>
                    <span style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: (p as any).logo_url
                        ? `url(${(p as any).logo_url}) center/cover no-repeat`
                        : (p.color || BRAND_GRADIENT),
                      color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13,
                      border: "3px solid white", boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
                      flexShrink: 0,
                    }}>{(p as any).logo_url ? null : initials(p.name)}</span>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
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
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </CardGrid>
      )}
    </div>
  );
};

export default ProjectsList;
