/**
 * CommentsThread — reusable comments thread for any resource.
 *
 * Mounts on Task detail, Project detail, Document detail, Agent run detail.
 * Talks to /api/v1/comments (existing router) for the CRUD operations and
 * adds inline @-mention parsing.
 *
 *   <CommentsThread resourceType="task" resourceId={taskId} orgId={orgId} />
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "@/services/api";
import {
  GlassCard, Button, Input, Textarea, MemberAvatar, BrandPill, Skeleton,
} from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

interface CommentRow {
  id: string;
  user_id?: string | null;
  agent_key?: string | null;
  body: string;
  mentions: string[];
  parent_id?: string | null;
  resolved: boolean;
  created_at: string;
  edited_at?: string | null;
  reactions: Record<string, string[]>;
}

interface ThreadProps {
  resourceType: string;
  resourceId: string;
  orgId?: string;
}

const MENTION_RE = /@([a-zA-Z0-9_.-]+)/g;

function renderBody(body: string): React.ReactNode {
  // Lightly highlight @mentions.
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  const text = body;
  const re = new RegExp(MENTION_RE);
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    parts.push(
      <span key={m.index} style={{
        color: tokens.PURPLE_DEEP, fontWeight: 700,
        background: `${tokens.PURPLE}10`, padding: "1px 6px", borderRadius: 6,
      }}>{m[0]}</span>
    );
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

export const CommentsThread: React.FC<ThreadProps> = ({ resourceType, resourceId, orgId }) => {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ resource_type: resourceType, resource_id: resourceId });
      if (orgId) params.set("organization_id", orgId);
      const { data } = await api.get<CommentRow[]>(`/comments?${params}`);
      setComments(data);
    } finally {
      setLoading(false);
    }
  }, [resourceType, resourceId, orgId]);

  useEffect(() => { void load(); }, [load]);

  const post = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      const mentions = Array.from(draft.matchAll(MENTION_RE)).map(m => m[1]);
      const body = {
        resource_type: resourceType,
        resource_id: resourceId,
        body: draft.trim(),
        mentions,
      };
      const params = orgId ? `?organization_id=${orgId}` : "";
      const { data } = await api.post<CommentRow>(`/comments${params}`, body);
      setComments(prev => [...prev, data]);
      setDraft("");
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    } finally {
      setBusy(false);
    }
  };

  const toggleResolve = async (c: CommentRow) => {
    const endpoint = c.resolved ? `unresolve` : `resolve`;
    await api.post(`/comments/${c.id}/${endpoint}`);
    setComments(prev => prev.map(x => x.id === c.id ? { ...x, resolved: !c.resolved } : x));
  };

  const saveEdit = async (id: string) => {
    if (!editDraft.trim()) return;
    const { data } = await api.patch<CommentRow>(`/comments/${id}`, { body: editDraft.trim() });
    setComments(prev => prev.map(x => x.id === id ? data : x));
    setEditingId(null);
    setEditDraft("");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await api.delete(`/comments/${id}`);
    setComments(prev => prev.filter(x => x.id !== id));
  };

  return (
    <GlassCard padding={20} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
          Discussion · {comments.length}
        </div>
      </div>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 380, overflow: "auto" }}>
        {loading ? (
          <>
            <Skeleton height={48} />
            <Skeleton height={48} />
          </>
        ) : comments.length === 0 ? (
          <div style={{ color: tokens.SLATE_500, fontSize: 13, padding: 14, textAlign: "center" }}>
            No comments yet. Be the first.
          </div>
        ) : comments.map(c => (
          <div key={c.id} style={{ display: "flex", gap: 10 }}>
            <MemberAvatar
              name={c.user_id ? c.user_id.slice(0, 2).toUpperCase() : "?"}
              size={28}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: tokens.INK }}>
                  {c.user_id ? c.user_id.slice(0, 6) : c.agent_key || "—"}
                </span>
                <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>
                  {new Date(c.created_at).toLocaleString()}
                </span>
                {c.resolved && <BrandPill tone="ghost">Resolved</BrandPill>}
                {c.edited_at && <span style={{ fontSize: 11, color: tokens.SLATE_400 }}>(edited)</span>}
              </div>
              {editingId === c.id ? (
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Textarea value={editDraft} onChange={e => setEditDraft(e.target.value)} rows={3} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button tone="primary" size="sm" onClick={() => saveEdit(c.id)}>Save</Button>
                    <Button tone="ghost" size="sm" onClick={() => { setEditingId(null); setEditDraft(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: 4, fontSize: 14, lineHeight: 1.55,
                  color: tokens.INK, whiteSpace: "pre-wrap",
                }}>{renderBody(c.body)}</div>
              )}
              <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                <button onClick={() => toggleResolve(c)} style={{
                  background: "transparent", border: "none", padding: 0,
                  color: tokens.SLATE_500, fontSize: 11, cursor: "pointer", fontWeight: 600,
                }}>{c.resolved ? "Reopen" : "Resolve"}</button>
                {editingId !== c.id && (
                  <button onClick={() => { setEditingId(c.id); setEditDraft(c.body); }} style={{
                    background: "transparent", border: "none", padding: 0,
                    color: tokens.SLATE_500, fontSize: 11, cursor: "pointer", fontWeight: 600,
                  }}>Edit</button>
                )}
                <button onClick={() => remove(c.id)} style={{
                  background: "transparent", border: "none", padding: 0,
                  color: tokens.RED, fontSize: 11, cursor: "pointer", fontWeight: 600,
                }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void post(); } }}
          placeholder="Write a comment. Use @handle to mention."
        />
        <Button tone="primary" onClick={post} disabled={busy || !draft.trim()}>Send</Button>
      </div>
    </GlassCard>
  );
};

export default CommentsThread;
