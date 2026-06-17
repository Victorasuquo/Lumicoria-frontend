import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { teamApi, type Team } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, BrandPill, Button, Input, Textarea,
  MemberStack, Toolbar, CardGrid, SkeletonCard, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, STAGGER_FAST, HOVER_LIFT, initials } from "@/components/workspace/tokens";

const CreateTeamPanel: React.FC<{ orgId: string; onCreated: (team: Team) => void; onClose: () => void }> = ({ orgId, onCreated, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [color, setColor] = useState(tokens.PURPLE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setBusy(true); setError(null);
    try {
      const team = await teamApi.create(orgId, { name: name.trim(), description, department_tag: department, color });
      onCreated(team);
    } catch (e: any) {
      setError(e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Could not create team");
    } finally {
      setBusy(false);
    }
  };

  const palette = [tokens.PURPLE, tokens.PURPLE_DEEP, tokens.SKY, tokens.TEAL, tokens.ORANGE, tokens.GREEN, tokens.AMBER, "#EC4899"];

  return (
    <GlassCard padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 20, fontWeight: 700, margin: 0 }}>New team</h3>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: tokens.SLATE_500, fontSize: 14, cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Name</div>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Growth, Engineering" autoFocus />
        </label>
        <label>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Description</div>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this team focus on?" rows={3} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Department tag (optional)</div>
          <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Sales, Eng, Ops…" />
        </label>
        <div>
          <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Colour</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {palette.map(c => (
              <button key={c} onClick={() => setColor(c)} aria-label={c} style={{
                width: 28, height: 28, borderRadius: 9999, background: c, cursor: "pointer",
                border: color === c ? `2px solid ${tokens.INK}` : "2px solid white",
                boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
              }} />
            ))}
          </div>
        </div>
        {error && <div style={{ color: tokens.RED, fontSize: 13 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <Button tone="primary" onClick={submit} disabled={busy}>{busy ? "Creating…" : "Create team"}</Button>
          <Button tone="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </GlassCard>
  );
};

export const TeamsList: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(
    searchParams.get("new") !== null || location.pathname.endsWith("/new")
  );
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      setTeams(await teamApi.list(activeOrgId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [activeOrgId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(t => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.department_tag?.toLowerCase().includes(q));
  }, [teams, search]);

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        eyebrow="Teams"
        title="Teams in this workspace"
        subtitle="Department-style groupings. Each team carries its own projects, agents, and analytics."
      />

      <Toolbar
        left={<Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams" style={{ width: 280 }} />}
        center={<span style={{ fontSize: 12, color: tokens.SLATE_500, fontWeight: 600 }}>{filtered.length} {filtered.length === 1 ? "team" : "teams"}</span>}
        right={<Button tone="primary" onClick={() => setShowCreate(true)}>New team</Button>}
      />

      {showCreate && (
        <CreateTeamPanel
          orgId={activeOrgId}
          onClose={() => setShowCreate(false)}
          onCreated={(t) => { setShowCreate(false); setTeams(prev => [t, ...prev]); navigate(`/workspace/teams/${t.id}`); }}
        />
      )}

      {loading ? (
        <CardGrid minCol={280}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} height={220} />)}
        </CardGrid>
      ) : filtered.length === 0 ? (
        <OrbEmptyState
          title="No teams yet"
          body="Create your first team to group people, projects, and agents."
          action={<Button onClick={() => setShowCreate(true)}>Create team</Button>}
        />
      ) : (
        <CardGrid minCol={280}>
          {filtered.map((t, i) => (
            <motion.div key={t.id} {...STAGGER_FAST(i)} {...HOVER_LIFT}>
              <GlassCard
                padding={0}
                onClick={() => navigate(`/workspace/teams/${t.id}`)}
                style={{ cursor: "pointer", height: "100%", overflow: "hidden" }}
              >
                {/* Cover strip */}
                <div style={{
                  height: 96,
                  background: t.cover_url
                    ? `url(${t.cover_url}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${t.color || tokens.PURPLE} 0%, ${tokens.SKY} 100%)`,
                  position: "relative",
                }}>
                  {t.cover_url && (
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0) 50%, rgba(15,23,42,0.18) 100%)" }} />
                  )}
                </div>
                <div style={{ padding: 18, paddingTop: 14, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: -32, marginBottom: 10 }}>
                    <span style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: t.logo_url
                        ? `url(${t.logo_url}) center/cover no-repeat`
                        : (t.color || BRAND_GRADIENT),
                      color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14,
                      border: "3px solid white", boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
                      flexShrink: 0,
                    }}>{t.logo_url ? null : initials(t.name)}</span>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                      {t.department_tag && <BrandPill tone="outline" style={{ marginTop: 4 }}>{t.department_tag}</BrandPill>}
                    </div>
                  </div>
                  <p style={{ color: tokens.SLATE_600, fontSize: 13, lineHeight: 1.55, margin: 0, minHeight: 40 }}>
                    {t.description || "—"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                    <MemberStack members={t.member_ids.slice(0, 5).map(id => ({ name: id }))} size={24} />
                    <span style={{ fontSize: 12, color: tokens.SLATE_500, fontWeight: 600 }}>
                      {t.member_ids.length} members · {t.admin_ids.length} admins
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsList;
