/**
 * RealtimeContext — single shared WS to /ws/presence.
 *
 *   const { onlineUserIds, isOnline, subscribe, unsubscribe, sendTyping } = useRealtime();
 *
 * Subscribes/unsubscribes are reference-counted, so multiple components
 * watching the same room share one socket subscription.  Reconnects with
 * exponential backoff on disconnect.  Falls back to a no-op shell when
 * the user is unauthenticated or the workspace is unknown.
 *
 * The lighter `useTyping(room)` hook below wraps the WS protocol so
 * callers (chat composer, task comment box) just call `notifyTyping()`
 * and the hook handles debouncing + auto-stop.
 */

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type ServerMessage =
  | { type: "connected"; data: { user_id: string; organization_id: string; online_user_ids: string[] } }
  | { type: "presence.update"; data: { user_id: string; online: boolean; last_seen?: string | null } }
  | { type: "typing.start"; data: { room: string; user_id: string; at: string } }
  | { type: "typing.stop"; data: { room: string; user_id: string; at: string } }
  | { type: "pong" }
  | { type: string; data?: any };

export interface RealtimeContextValue {
  ready: boolean;
  connected: boolean;
  onlineUserIds: Set<string>;
  isOnline: (userId?: string | null) => boolean;
  lastSeen: Map<string, string>;
  typingByRoom: Map<string, Set<string>>;
  subscribe: (room: string) => void;
  unsubscribe: (room: string) => void;
  sendTyping: (room: string, typing: boolean) => void;
}

const noop = () => {};

const defaultValue: RealtimeContextValue = {
  ready: false,
  connected: false,
  onlineUserIds: new Set(),
  isOnline: () => false,
  lastSeen: new Map(),
  typingByRoom: new Map(),
  subscribe: noop,
  unsubscribe: noop,
  sendTyping: noop,
};

const RealtimeContext = createContext<RealtimeContextValue>(defaultValue);

const apiBaseUrl = (): string => {
  const env = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";
  return String(env).replace(/\/$/, "");
};

const wsUrlFor = (orgId: string, token: string): string => {
  const api = apiBaseUrl();
  if (/^https?:\/\//i.test(api)) {
    const scheme = api.startsWith("https") ? "wss" : "ws";
    return `${api.replace(/^http(s)?/, scheme)}/ws/presence?token=${encodeURIComponent(token)}&organization_id=${encodeURIComponent(orgId)}`;
  }
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  return `${scheme}://${window.location.host}${api}/ws/presence?token=${encodeURIComponent(token)}&organization_id=${encodeURIComponent(orgId)}`;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeOrgId } = useWorkspace();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const subCounts = useRef<Map<string, number>>(new Map());
  // Typing timeout per (room,user) so we auto-clear stale typers after 5s
  const typingTimers = useRef<Map<string, number>>(new Map());

  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Map<string, string>>(new Map());
  const [typingByRoom, setTypingByRoom] = useState<Map<string, Set<string>>>(new Map());

  const clearTypingFor = useCallback((room: string, userId: string) => {
    setTypingByRoom(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(room) || []);
      set.delete(userId);
      if (set.size === 0) next.delete(room);
      else next.set(room, set);
      return next;
    });
  }, []);

  const handleMessage = useCallback((m: ServerMessage) => {
    if (m.type === "connected") {
      const ids = new Set((m as any).data?.online_user_ids || []);
      setOnlineUserIds(ids);
      return;
    }
    if (m.type === "presence.update") {
      const { user_id, online, last_seen } = (m as any).data || {};
      if (!user_id) return;
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        if (online) next.add(String(user_id));
        else next.delete(String(user_id));
        return next;
      });
      if (last_seen) {
        setLastSeen(prev => {
          const next = new Map(prev);
          next.set(String(user_id), String(last_seen));
          return next;
        });
      }
      return;
    }
    if (m.type === "typing.start") {
      const { room, user_id } = (m as any).data || {};
      if (!room || !user_id) return;
      setTypingByRoom(prev => {
        const next = new Map(prev);
        const set = new Set(next.get(room) || []);
        set.add(String(user_id));
        next.set(room, set);
        return next;
      });
      const key = `${room}:${user_id}`;
      const existing = typingTimers.current.get(key);
      if (existing) window.clearTimeout(existing);
      const t = window.setTimeout(() => {
        clearTypingFor(room, String(user_id));
        typingTimers.current.delete(key);
      }, 5_000);
      typingTimers.current.set(key, t);
      return;
    }
    if (m.type === "typing.stop") {
      const { room, user_id } = (m as any).data || {};
      if (!room || !user_id) return;
      const key = `${room}:${user_id}`;
      const existing = typingTimers.current.get(key);
      if (existing) { window.clearTimeout(existing); typingTimers.current.delete(key); }
      clearTypingFor(room, String(user_id));
      return;
    }
  }, [clearTypingFor]);

  // Open / re-open socket
  useEffect(() => {
    if (!user?.id || !activeOrgId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let cancelled = false;
    const open = () => {
      if (cancelled) return;
      try {
        const ws = new WebSocket(wsUrlFor(activeOrgId, token));
        wsRef.current = ws;
        ws.onopen = () => {
          if (cancelled) { ws.close(); return; }
          setConnected(true);
          reconnectAttempts.current = 0;
          // Re-subscribe to every room we already had a ref-count for.
          for (const room of subCounts.current.keys()) {
            try { ws.send(JSON.stringify({ type: "subscribe", data: { room } })); } catch { /* noop */ }
          }
        };
        ws.onmessage = (e) => {
          try { handleMessage(JSON.parse(e.data)); } catch { /* noop */ }
        };
        ws.onclose = () => {
          setConnected(false);
          wsRef.current = null;
          if (cancelled) return;
          const attempt = Math.min(reconnectAttempts.current, 6);
          const delay = Math.min(30_000, 1000 * 2 ** attempt);
          reconnectAttempts.current += 1;
          reconnectTimer.current = window.setTimeout(open, delay);
        };
        ws.onerror = () => { /* close handler will retry */ };
      } catch {
        const delay = Math.min(30_000, 1000 * 2 ** Math.min(reconnectAttempts.current, 6));
        reconnectAttempts.current += 1;
        reconnectTimer.current = window.setTimeout(open, delay);
      }
    };

    open();
    return () => {
      cancelled = true;
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      try { wsRef.current?.close(); } catch { /* noop */ }
      wsRef.current = null;
      setConnected(false);
      setOnlineUserIds(new Set());
      setTypingByRoom(new Map());
    };
  }, [user?.id, activeOrgId, handleMessage]);

  const subscribe = useCallback((room: string) => {
    if (!room) return;
    const count = subCounts.current.get(room) || 0;
    subCounts.current.set(room, count + 1);
    if (count === 0) {
      try { wsRef.current?.send(JSON.stringify({ type: "subscribe", data: { room } })); } catch { /* noop */ }
    }
  }, []);

  const unsubscribe = useCallback((room: string) => {
    if (!room) return;
    const count = subCounts.current.get(room) || 0;
    if (count <= 1) {
      subCounts.current.delete(room);
      try { wsRef.current?.send(JSON.stringify({ type: "unsubscribe", data: { room } })); } catch { /* noop */ }
    } else {
      subCounts.current.set(room, count - 1);
    }
  }, []);

  const sendTyping = useCallback((room: string, typing: boolean) => {
    if (!room) return;
    try {
      wsRef.current?.send(JSON.stringify({ type: "typing", data: { room, typing } }));
    } catch { /* noop */ }
  }, []);

  const isOnline = useCallback((userId?: string | null) => {
    if (!userId) return false;
    return onlineUserIds.has(String(userId));
  }, [onlineUserIds]);

  const value = useMemo<RealtimeContextValue>(() => ({
    ready: true,
    connected,
    onlineUserIds,
    isOnline,
    lastSeen,
    typingByRoom,
    subscribe,
    unsubscribe,
    sendTyping,
  }), [connected, onlineUserIds, isOnline, lastSeen, typingByRoom, subscribe, unsubscribe, sendTyping]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);

/** Auto-subscribe to a room for the lifetime of the calling component. */
export const useRoomSubscription = (room: string | null | undefined) => {
  const { subscribe, unsubscribe, typingByRoom, connected } = useRealtime();
  useEffect(() => {
    if (!room) return;
    subscribe(room);
    return () => { unsubscribe(room); };
  }, [room, subscribe, unsubscribe]);
  const typers = room ? Array.from(typingByRoom.get(room) || []) : [];
  return { typers, connected };
};

/** Debounced "I'm typing" emitter.
 *  Call `notify()` on every keystroke; we auto-emit `typing:true` once,
 *  then `typing:false` after the user pauses for `idleMs` (default 2 s).
 */
export const useTyping = (room: string | null | undefined, idleMs = 2_000) => {
  const { sendTyping } = useRealtime();
  const isTypingRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (!room) return;
    if (idleTimerRef.current) { window.clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping(room, false);
    }
  }, [room, sendTyping]);

  const notify = useCallback(() => {
    if (!room) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(room, true);
    }
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(room, false);
      idleTimerRef.current = null;
    }, idleMs);
  }, [room, sendTyping, idleMs]);

  useEffect(() => stop, [stop]);

  return { notify, stop };
};

export default RealtimeContext;
