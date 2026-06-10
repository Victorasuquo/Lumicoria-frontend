/**
 * ChatPanel — minimal channel chat for the Project hub.
 *
 * Lists messages in a channel and lets the user post.  Slash command
 * `/run <agent_key> <prompt>` triggers an inline agent reply (the
 * backend interceptor returns both the user message and the agent reply
 * in one round-trip).
 *
 * Mounted from the Project detail "Chat" tab; the parent passes the
 * project's primary chat channel id.  If none exists yet, the panel
 * offers to create one.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import api, { BACKEND_ORIGIN } from "@/services/api";
import {
  GlassCard, Button, Input, EmptyState, Skeleton, MemberAvatar, AgentChip,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT } from "@/components/workspace/tokens";

interface ChatMessage {
  id: string;
  channel_id: string;
  organization_id: string;
  user_id?: string | null;
  agent_key?: string | null;
  content: string;
  mentions: string[];
  parent_message_id?: string | null;
  created_at: string;
}

interface ChatChannel {
  id: string;
  organization_id: string;
  team_id?: string | null;
  project_id?: string | null;
  name: string;
  type: string;
  description?: string | null;
  created_by: string;
  created_at: string;
  last_message_at?: string | null;
  member_ids: string[];
}

interface ChatPanelProps {
  orgId: string;
  projectId?: string;
  teamId?: string;
}

const POST_HEADERS = { "Content-Type": "application/json" };

export const ChatPanel: React.FC<ChatPanelProps> = ({ orgId, projectId, teamId }) => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ organization_id: orgId });
      if (projectId) params.set("project_id", projectId);
      if (teamId) params.set("team_id", teamId);
      const { data } = await api.get<ChatChannel[]>(`/chat-v2/channels?${params}`);
      setChannels(data);
      if (!activeId && data.length > 0) setActiveId(data[0].id);
    } finally {
      setLoading(false);
    }
  }, [orgId, projectId, teamId, activeId]);

  const loadMessages = useCallback(async (channelId: string) => {
    const { data } = await api.get<ChatMessage[]>(`/chat-v2/channels/${channelId}/messages?limit=80`);
    setMessages(data);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, []);

  useEffect(() => { void loadChannels(); }, [loadChannels]);
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    void loadMessages(activeId);
  }, [activeId, loadMessages]);

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post<ChatChannel>(`/chat-v2/channels?organization_id=${orgId}`, {
        name: newChannelName.trim(),
        type: projectId ? "project" : teamId ? "team" : "workspace",
        project_id: projectId,
        team_id: teamId,
      }, { headers: POST_HEADERS });
      setChannels(prev => [data, ...prev]);
      setActiveId(data.id);
      setNewChannelName("");
      setCreating(false);
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!activeId || !draft.trim()) return;
    setBusy(true);
    try {
      const res = await api.post(`/chat-v2/channels/${activeId}/messages`, {
        content: draft.trim(),
      }, { headers: POST_HEADERS });
      const body = res.data;
      if (body?.user_message) {
        setMessages(prev => [...prev, body.user_message, body.agent_message]);
      } else {
        setMessages(prev => [...prev, body]);
      }
      setDraft("");
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <GlassCard padding={24}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></GlassCard>;
  }

  if (channels.length === 0 && !creating) {
    return (
      <EmptyState
        title="No channels yet"
        body="Start a channel to discuss this project in real time."
        action={<Button onClick={() => setCreating(true)}>New channel</Button>}
      />
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, minHeight: 460 }}>
      {/* Channel list */}
      <GlassCard padding={10}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px" }}>
          <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>Channels</span>
          <button onClick={() => setCreating(c => !c)} style={{
            background: "transparent", border: "none", color: tokens.PURPLE_DEEP,
            fontSize: 18, lineHeight: 1, cursor: "pointer", fontWeight: 700,
          }}>+</button>
        </div>
        {creating && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 6 }}>
            <Input value={newChannelName} onChange={e => setNewChannelName(e.target.value)}
              placeholder="channel name" onKeyDown={e => e.key === "Enter" && createChannel()} />
            <Button tone="primary" size="sm" onClick={createChannel} disabled={busy || !newChannelName.trim()}>
              Create
            </Button>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
          {channels.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 10, border: "none",
              background: activeId === c.id ? `${tokens.PURPLE}10` : "transparent",
              color: activeId === c.id ? tokens.PURPLE_DEEP : tokens.SLATE_700,
              fontWeight: activeId === c.id ? 700 : 600, fontSize: 13,
              cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ color: tokens.SLATE_400 }}>#</span> {c.name}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Messages */}
      <GlassCard padding={0} style={{ display: "flex", flexDirection: "column", height: 540 }}>
        <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 ? (
            <div style={{ color: tokens.SLATE_500, fontSize: 13, padding: 20, textAlign: "center" }}>
              Say hi. Try <code>/run rag what's our remaining runway?</code> to invoke an agent.
            </div>
          ) : messages.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ flexShrink: 0 }}>
                {m.agent_key ? (
                  <AgentChip agentKey={m.agent_key} size={28} />
                ) : (
                  <MemberAvatar name={m.user_id ? m.user_id.slice(0, 2).toUpperCase() : "?"} size={28} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: tokens.INK }}>
                    {m.agent_key ? `agent · ${m.agent_key}` : m.user_id?.slice(0, 6) || "you"}
                  </span>
                  <span style={{ fontSize: 11, color: tokens.SLATE_400 }}>
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
                <div style={{
                  marginTop: 4, fontSize: 14, lineHeight: 1.55, color: tokens.SLATE_800 || tokens.INK,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  background: m.agent_key ? `${tokens.PURPLE}08` : "transparent",
                  padding: m.agent_key ? "10px 12px" : 0,
                  borderRadius: m.agent_key ? 14 : 0,
                  border: m.agent_key ? `1px solid ${tokens.PURPLE}20` : "none",
                }}>{m.content}</div>
                {m.mentions.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: tokens.SLATE_500 }}>
                    mentions: {m.mentions.map(h => `@${h}`).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${tokens.SLATE_200}`, padding: 12, display: "flex", gap: 10 }}>
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write a message. Use /run agent_key prompt to invoke an agent."
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          />
          <Button tone="primary" onClick={send} disabled={busy || !draft.trim()}>Send</Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ChatPanel;
