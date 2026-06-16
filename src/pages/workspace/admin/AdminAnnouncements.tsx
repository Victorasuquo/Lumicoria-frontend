/**
 * /workspace/admin/announcements — org-wide announcements (pinned to
 * WorkspaceHome).  Powered by orgExtendedApi.announcements*.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pin, Trash2, Plus } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgExtendedApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  created_at: string;
  created_by?: string;
}

export const AdminAnnouncements: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await orgExtendedApi.announcements(activeOrgId);
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const create = async () => {
    if (!activeOrgId || !title.trim()) return;
    try {
      const row: any = await orgExtendedApi.createAnnouncement(activeOrgId, { title, body, pinned });
      setRows(prev => [row, ...prev]);
      setShowNew(false); setTitle(""); setBody(""); setPinned(false);
      toast.success("Announcement posted.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Post failed."); }
  };

  const remove = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Delete this announcement?")) return;
    try {
      await orgExtendedApi.deleteAnnouncement(activeOrgId, id);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Delete failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Announcements"
        subtitle="Org-wide notices shown to every member on the workspace home."
        right={<Button tone="primary" onClick={() => setShowNew(s => !s)}><Plus size={14} /> New announcement</Button>}
      />

      {showNew && (
        <GlassCard padding={20}>
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <Textarea rows={4} placeholder="Announcement body" value={body} onChange={e => setBody(e.target.value)} style={{ marginTop: 10 }} />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: tokens.INK }}>
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
            Pin to workspace home
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button tone="primary" onClick={create} disabled={!title.trim()}>Post</Button>
            <Button tone="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard padding={20}><Skeleton height={20} /></GlassCard>
      ) : rows.length === 0 ? (
        <OrbEmptyState title="No announcements yet" body="Post one to broadcast news to your entire workspace." />
      ) : rows.map((r, i) => (
        <motion.div key={r.id} {...STAGGER_FAST(i)}>
          <GlassCard padding={18}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.pinned && <Pin size={14} color={tokens.PURPLE} />}
                  <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 18 }}>{r.title}</h3>
                </div>
                <p style={{ margin: "6px 0 0", color: tokens.SLATE_700, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{r.body}</p>
                <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 8 }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => remove(r.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><Trash2 size={14} /></button>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminAnnouncements;
