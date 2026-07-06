/**
 * useHuddleWebSocket — single live socket for everything happening in
 * a Huddle room.
 *
 * Server pushes:
 *   - transcript_chunk:    a new transcript chunk was persisted
 *   - agent_response:      an attached AI agent answered
 *   - participant_joined:  someone joined
 *   - participant_left:    someone left
 *   - huddle_ended:        host ended the call
 *
 * Auto-reconnect with exponential backoff. Kept simple to match the
 * codebase pattern (RealtimeContext) — no fancy WS lib.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { huddleApi } from "@/services/huddleApi";

export interface AgentResponseEvent {
  type: "agent_response";
  huddle_id: string;
  chunk_id: string;
  agent_key: string;
  ok: boolean;
  response?: string | null;
  error?: string | null;
  latency_ms?: number;
  ts: number;
}

export interface TranscriptChunkEvent {
  type: "transcript_chunk";
  huddle_id: string;
  chunk: {
    id: string;
    huddle_id: string;
    speaker_user_id?: string | null;
    speaker_name: string;
    text: string;
    ts: string;
  };
  ts: number;
}

export interface ParticipantEvent {
  type: "participant_joined" | "participant_left";
  huddle_id: string;
  participant: Record<string, any>;
  ts: number;
}

export type HuddleEvent =
  | AgentResponseEvent
  | TranscriptChunkEvent
  | ParticipantEvent
  | { type: "connected" | "subscribed" | "ping" | "huddle_ended"; huddle_id?: string };

interface UseHuddleWebSocketOptions {
  huddleId?: string;
  /** Public lobby: pass a share token instead of an authed huddleId. */
  shareToken?: string;
  /** JWT — pulled from localStorage by default. */
  token?: string;
  onEvent?: (event: HuddleEvent) => void;
  /** Disable reconnection (testing). */
  disableReconnect?: boolean;
}

interface UseHuddleWebSocket {
  connected: boolean;
  send: (msg: object) => void;
  /** Latest transcript chunks, ordered oldest → newest. */
  chunks: TranscriptChunkEvent["chunk"][];
  /** Latest agent responses (most recent last). */
  agentResponses: AgentResponseEvent[];
  /** Aggregated participant list (joined minus left). */
  participants: Record<string, any>[];
}

function getTokenFromStorage(): string | null {
  try {
    // AuthContext stores the JWT under "accessToken" (see src/contexts/AuthContext.tsx).
    // Fall back to legacy keys so older sessions keep working.
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      null
    );
  } catch { return null; }
}

function getApiBase(): string {
  const env = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (env) return env.replace(/\/$/, "");
  return "/api/v1";
}

function buildWsUrl(opts: UseHuddleWebSocketOptions): string {
  const base = getApiBase();
  let httpUrl: string;
  if (base.startsWith("http")) {
    httpUrl = base;
  } else {
    httpUrl = `${window.location.origin}${base}`;
  }
  const wsBase = httpUrl.replace(/^http/, "ws");
  if (opts.shareToken) {
    return `${wsBase}/ws/huddle/share/${opts.shareToken}`;
  }
  const tok = opts.token || getTokenFromStorage();
  return `${wsBase}/ws/huddle/${opts.huddleId}${tok ? `?token=${encodeURIComponent(tok)}` : ""}`;
}

export function useHuddleWebSocket(opts: UseHuddleWebSocketOptions): UseHuddleWebSocket {
  const [connected, setConnected] = useState(false);
  const [chunks, setChunks] = useState<TranscriptChunkEvent["chunk"][]>([]);
  const [agentResponses, setAgentResponses] = useState<AgentResponseEvent[]>([]);
  const [participants, setParticipants] = useState<Record<string, any>[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(1000);
  const cancelledRef = useRef(false);

  const send = useCallback((msg: object) => {
    try { wsRef.current?.send(JSON.stringify(msg)); } catch { /* */ }
  }, []);

  // Seed with persisted history so a page refresh doesn't wipe the
  // Script panel — chunks are stored server-side per huddle; the WS
  // only streams NEW ones. Merge (dedupe by id) so a chunk that raced
  // in over the socket while history loaded isn't duplicated.
  useEffect(() => {
    if (!opts.huddleId) return; // guests via shareToken: endpoint needs auth
    let cancelled = false;
    huddleApi
      .getTranscript(opts.huddleId)
      .then(({ chunks: history }) => {
        if (cancelled || !history?.length) return;
        setChunks((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          const merged = [...history.filter((c) => !seen.has(c.id)), ...prev];
          merged.sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
          return merged;
        });
      })
      .catch(() => { /* guests / transient — live stream still works */ });
    return () => { cancelled = true; };
  }, [opts.huddleId]);

  useEffect(() => {
    cancelledRef.current = false;
    if (!opts.huddleId && !opts.shareToken) return;

    const connect = () => {
      if (cancelledRef.current) return;
      const url = buildWsUrl(opts);
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = 1000;
      };

      ws.onmessage = (e) => {
        let evt: HuddleEvent;
        try { evt = JSON.parse(e.data); } catch { return; }
        opts.onEvent?.(evt);

        if (evt.type === "ping") {
          send({ type: "pong" });
          return;
        }
        if (evt.type === "transcript_chunk") {
          const ch = evt as TranscriptChunkEvent;
          setChunks((prev) => (prev.some((c) => c.id === ch.chunk.id) ? prev : [...prev, ch.chunk]));
          return;
        }
        if (evt.type === "agent_response") {
          setAgentResponses((prev) => [...prev.slice(-49), evt as AgentResponseEvent]);
          return;
        }
        if (evt.type === "participant_joined") {
          const p = (evt as ParticipantEvent).participant || {};
          setParticipants((prev) => {
            const key = p.id || p.user_id || p.guest_email || p.agent_key;
            const without = prev.filter((x) => (x.id || x.user_id || x.guest_email || x.agent_key) !== key);
            return [...without, p];
          });
          return;
        }
        if (evt.type === "participant_left") {
          const p = (evt as ParticipantEvent).participant || {};
          setParticipants((prev) =>
            prev.filter((x) => (x.id || x.user_id || x.guest_email || x.agent_key) !== (p.id || p.user_id || p.guest_email || p.agent_key))
          );
          return;
        }
      };

      ws.onerror = () => { /* logged via onclose */ };
      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (!opts.disableReconnect) scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (cancelledRef.current) return;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      const delay = Math.min(30_000, backoffRef.current);
      backoffRef.current = Math.min(30_000, backoffRef.current * 2);
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    connect();

    return () => {
      cancelledRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      try { wsRef.current?.close(); } catch { /* */ }
      wsRef.current = null;
    };
    // We deliberately only re-establish on huddleId/shareToken change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.huddleId, opts.shareToken]);

  return { connected, send, chunks, agentResponses, participants };
}
