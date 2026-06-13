/**
 * NotificationsContext — single shared unread-count + recent-list cache.
 *
 *   const { unreadCount, recent, markAllAsRead, refresh } = useNotifications();
 *
 * Subscribes to /ws/notifications/{user_id} once and fans out events so
 * every consumer (sidebar badge, notification center, ⌘K hint) shares one
 * connection and one cache.  Falls back to a periodic refetch on
 * reconnect.  Used in place of `NotificationCenter`'s private socket
 * once that component is migrated; until then both can coexist.
 */

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationApi, type Notification } from "@/services/api";

interface ContextValue {
  ready: boolean;
  connected: boolean;
  unreadCount: number;
  recent: Notification[];
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const defaultValue: ContextValue = {
  ready: false,
  connected: false,
  unreadCount: 0,
  recent: [],
  refresh: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  remove: async () => {},
};

const NotificationsContext = createContext<ContextValue>(defaultValue);

const apiBase = (): string => {
  const env = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";
  return String(env).replace(/\/$/, "");
};

const wsUrlFor = (userId: string, token: string): string => {
  const api = apiBase();
  if (/^https?:\/\//i.test(api)) {
    const scheme = api.startsWith("https") ? "wss" : "ws";
    return `${api.replace(/^http(s)?/, scheme)}/ws/notifications/${userId}?token=${encodeURIComponent(token)}`;
  }
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  return `${scheme}://${window.location.host}${api}/ws/notifications/${userId}?token=${encodeURIComponent(token)}`;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [recent, setRecent] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnect = useRef<{ timer: number | null; attempts: number }>({ timer: null, attempts: 0 });

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [list, count] = await Promise.all([
        notificationApi.getNotifications(false, 50, 0).catch(() => [] as Notification[]),
        notificationApi.getUnreadCount().catch(() => ({ unread_count: 0 })),
      ]);
      setRecent(Array.isArray(list) ? list : []);
      setUnreadCount(count?.unread_count || 0);
    } catch { /* noop */ }
  }, [user?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  // WS pipe
  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let cancelled = false;
    const open = () => {
      if (cancelled) return;
      try {
        const ws = new WebSocket(wsUrlFor(user.id, token));
        wsRef.current = ws;
        ws.onopen = () => {
          setConnected(true);
          reconnect.current.attempts = 0;
        };
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "notification" && msg.data) {
              const n: Notification = {
                id: msg.data.id,
                user_id: String(user.id),
                notification_type: msg.data.notification_type,
                title: msg.data.title,
                content: msg.data.content,
                priority: msg.data.priority,
                read: false,
                metadata: msg.data.metadata,
                created_at: msg.data.created_at,
              };
              setRecent(prev => prev.find(x => x.id === n.id) ? prev : [n, ...prev].slice(0, 100));
              setUnreadCount(c => c + 1);
            } else if (msg.type === "notification_read" && msg.data?.notification_id) {
              setRecent(prev => prev.map(x => x.id === msg.data.notification_id ? { ...x, read: true } : x));
              setUnreadCount(c => Math.max(0, c - 1));
            } else if (msg.type === "all_notifications_read") {
              setRecent(prev => prev.map(x => ({ ...x, read: true })));
              setUnreadCount(0);
            } else if (msg.type === "notification_deleted" && msg.data?.notification_id) {
              setRecent(prev => prev.filter(x => x.id !== msg.data.notification_id));
              void refresh();
            } else if (msg.type === "ping") {
              try { ws.send(JSON.stringify({ type: "pong" })); } catch { /* noop */ }
            }
          } catch { /* noop */ }
        };
        ws.onclose = () => {
          setConnected(false);
          wsRef.current = null;
          if (cancelled) return;
          const attempt = Math.min(reconnect.current.attempts, 6);
          const delay = Math.min(30_000, 1000 * 2 ** attempt);
          reconnect.current.attempts += 1;
          reconnect.current.timer = window.setTimeout(open, delay);
        };
        ws.onerror = () => { /* close will retry */ };
      } catch {
        const attempt = Math.min(reconnect.current.attempts, 6);
        const delay = Math.min(30_000, 1000 * 2 ** attempt);
        reconnect.current.attempts += 1;
        reconnect.current.timer = window.setTimeout(open, delay);
      }
    };

    open();
    return () => {
      cancelled = true;
      if (reconnect.current.timer) window.clearTimeout(reconnect.current.timer);
      try { wsRef.current?.close(); } catch { /* noop */ }
      wsRef.current = null;
      setConnected(false);
    };
  }, [user?.id, refresh]);

  const markAsRead = useCallback(async (id: string) => {
    setRecent(prev => prev.map(x => x.id === id ? { ...x, read: true } : x));
    setUnreadCount(c => Math.max(0, c - 1));
    try { await notificationApi.markAsRead(id); } catch { /* noop */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setRecent(prev => prev.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
    try { await notificationApi.markAllAsRead(); } catch { /* noop */ }
  }, []);

  const remove = useCallback(async (id: string) => {
    let wasUnread = false;
    setRecent(prev => {
      const t = prev.find(x => x.id === id);
      wasUnread = !!t && !t.read;
      return prev.filter(x => x.id !== id);
    });
    if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
    try { await notificationApi.deleteNotification(id); } catch { /* noop */ }
  }, []);

  const value = useMemo<ContextValue>(() => ({
    ready: !!user?.id,
    connected,
    unreadCount,
    recent,
    refresh,
    markAsRead,
    markAllAsRead,
    remove,
  }), [user?.id, connected, unreadCount, recent, refresh, markAsRead, markAllAsRead, remove]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => useContext(NotificationsContext);

export default NotificationsContext;
