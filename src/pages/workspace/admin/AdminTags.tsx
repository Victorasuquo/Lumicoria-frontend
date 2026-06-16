/**
 * /workspace/admin/tags — org tag manager (CRUD by scope).  Powered by
 * orgExtendedApi.tags + createTag + updateTag + deleteTag.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgExtendedApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, OrbEmptyState, FilterChips, Toolbar, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface Tag { id: string; name: string; color?: string; scope?: string; }

const SCOPES = [
  { id: "all", label: "All" },
  { id: "project", label: "Projects" },
  { id: "task", label: "Tasks" },
  { id: "agent", label: "Agents" },
  { id: "team", label: "Teams" },
];

const SWATCH = ["#6C4AB0", "#0EA5E9", "#F59E0B", "#10B981", "#F97316", "#EF4444", "#EC4899", "#94A3B8"];

export const AdminTags: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCH[0]);
  const [newScope, setNewScope] = useState("project");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await orgExtendedApi.tags(activeOrgId);
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const filtered = scope === "all" ? rows : rows.filter(r => (r.scope || "project") === scope);

  const create = async () => {
    if (!activeOrgId || !name.trim()) return;
    try {
      const row: any = await orgExtendedApi.createTag(activeOrgId, { name, color, scope: newScope });
      setRows(prev => [row, ...prev]);
      setShowNew(false); setName(""); setColor(SWATCH[0]);
      toast.success("Tag created.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  const remove = async (id: string) => {
    if (!activeOrgId || !confirm("Delete this tag?")) return;
    try { await orgExtendedApi.deleteTag(activeOrgId, id); setRows(prev => prev.filter(r => r.id !== id)); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Tags"
        subtitle="Labels you can attach to projects, tasks, agents, and teams."
        right={<Button tone="primary" onClick={() => setShowNew(s => !s)}><Plus size={14} /> New tag</Button>}
      />

      <Toolbar left={<FilterChips options={SCOPES} value={scope} onChange={v => setScope(v as string)} label="Scope" />} />

      {showNew && (
        <GlassCard padding={20}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, alignItems: "end" }}>
            <Input placeholder="Tag name" value={name} onChange={e => setName(e.target.value)} autoFocus />
            <select value={newScope} onChange={e => setNewScope(e.target.value)} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white" }}>
              {SCOPES.filter(s => s.id !== "all").map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <Button tone="primary" onClick={create} disabled={!name.trim()}>Create</Button>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Colour</span>
            {SWATCH.map(c => (
              <button key={c} onClick={() => setColor(c)} aria-label={c} style={{
                width: 24, height: 24, borderRadius: 999, background: c, cursor: "pointer",
                border: color === c ? `2px solid ${tokens.INK}` : "2px solid white",
                boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
              }} />
            ))}
          </div>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard padding={20}><Skeleton height={20} /></GlassCard>
      ) : filtered.length === 0 ? (
        <OrbEmptyState title="No tags" body="Tags let you slice projects, tasks, and agents by team-meaningful labels." />
      ) : (
        <CardGrid minCol={220} gap={12}>
          {filtered.map((t, i) => (
            <motion.div key={t.id} {...STAGGER_FAST(i)}>
              <GlassCard padding={14} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 999, background: t.color || tokens.PURPLE, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: tokens.SLATE_500, textTransform: "capitalize" }}>{t.scope || "project"}</div>
                  </div>
                </div>
                <button onClick={() => remove(t.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><Trash2 size={14} /></button>
              </GlassCard>
            </motion.div>
          ))}
        </CardGrid>
      )}
    </div>
  );
};

export default AdminTags;
