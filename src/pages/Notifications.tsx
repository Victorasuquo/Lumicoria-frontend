import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Bell, CheckCircle, FileText, CreditCard, Heart, Shield, Mail,
  Trash2, Circle, Check, ChevronLeft, ArrowLeft, Filter, Search,
  Clock, X, MailOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  notificationApi,
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/services/api";

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const typeIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.TASK:
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case NotificationType.DOCUMENT:
      return <FileText className="h-5 w-5 text-blue-500" />;
    case NotificationType.BILLING:
      return <CreditCard className="h-5 w-5 text-purple-500" />;
    case NotificationType.WELLBEING:
      return <Heart className="h-5 w-5 text-rose-500" />;
    case NotificationType.AUTH:
      return <Shield className="h-5 w-5 text-amber-500" />;
    case NotificationType.EMAIL:
      return <Mail className="h-5 w-5 text-indigo-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const typeLabel = (type: NotificationType) => {
  const map: Record<string, string> = {
    auth: "Security",
    task: "Task",
    document: "Document",
    billing: "Billing",
    wellbeing: "Wellbeing",
    email: "Email",
    system: "System",
    in_app: "General",
  };
  return map[type] || type;
};

const priorityBadge = (p: NotificationPriority) => {
  if (p === NotificationPriority.URGENT)
    return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Urgent</Badge>;
  if (p === NotificationPriority.HIGH)
    return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">High</Badge>;
  return null;
};

const formatDate = (d: string) => {
  try {
    return format(new Date(d), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return d;
  }
};

/* ─── Component ───────────────────────────────────────────────────────── */

const Notifications: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("id")
  );

  /* ── Fetch ──────────────────────────────────────────────────────── */

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications(
        tab === "unread",
        100
      );
      if (Array.isArray(data)) setNotifications(data);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ── Actions ────────────────────────────────────────────────────── */

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try { await notificationApi.markAsRead(id); } catch {}
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await notificationApi.markAllAsRead(); } catch {}
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    try { await notificationApi.deleteNotification(id); } catch {}
  };

  /* ── Derived ────────────────────────────────────────────────────── */

  const filtered = notifications.filter((n) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );
  });

  const selected = notifications.find((n) => n.id === selectedId) || null;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Auto-mark selected as read
  useEffect(() => {
    if (selected && !selected.read) markRead(selected.id);
  }, [selectedId]);

  // Sync URL
  useEffect(() => {
    if (selectedId) setSearchParams({ id: selectedId });
    else setSearchParams({});
  }, [selectedId]);

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FAFBFC]">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Notifications
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={markAllRead}
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body — split view */}
      <div className="flex-1 flex min-h-0 max-w-7xl mx-auto w-full">
        {/* ─── List panel ─── */}
        <div
          className={cn(
            "w-full md:w-[380px] lg:w-[420px] border-r bg-white flex flex-col shrink-0",
            selected && "hidden md:flex"
          )}
        >
          {/* Filters */}
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-gray-50 border-gray-200"
              />
            </div>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "all" | "unread")}
            >
              <TabsList className="grid w-full grid-cols-2 h-8 bg-gray-100/60">
                <TabsTrigger value="all" className="text-xs h-6">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs h-6">
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="ml-1.5 h-4 px-1 text-[9px] bg-purple-100 text-purple-700 border-purple-200">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Bell className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">
                  {search ? "Try a different search" : "You're all caught up"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-3",
                      selectedId === n.id && "bg-purple-50/60 border-l-2 border-l-purple-500",
                      !n.read && selectedId !== n.id && "bg-purple-50/30"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{typeIcon(n.notification_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm truncate",
                            !n.read ? "font-semibold text-gray-900" : "font-medium text-gray-600"
                          )}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {n.content}
                      </p>
                      <p className="text-[10px] text-gray-300 mt-1">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ─── Detail panel ─── */}
        <div
          className={cn(
            "flex-1 bg-white flex flex-col",
            !selected && "hidden md:flex"
          )}
        >
          {selected ? (
            <>
              {/* Detail header — mobile back button */}
              <div className="p-4 border-b flex items-center justify-between md:hidden">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              </div>

              {/* Detail content */}
              <ScrollArea className="flex-1">
                <div className="max-w-2xl mx-auto p-6 md:p-10">
                  {/* Type badge + time */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                      {typeIcon(selected.notification_type)}
                      <span className="text-xs font-medium text-gray-600">
                        {typeLabel(selected.notification_type)}
                      </span>
                    </div>
                    {priorityBadge(selected.priority)}
                    {selected.read && (
                      <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-200">
                        <MailOpen className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                    {selected.title}
                  </h2>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(selected.created_at)}
                  </div>

                  {/* Divider */}
                  <hr className="my-6 border-gray-100" />

                  {/* Full content */}
                  <div className="prose prose-sm prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selected.content}
                    </p>
                  </div>

                  {/* Metadata */}
                  {selected.metadata &&
                    Object.keys(selected.metadata).length > 0 && (
                      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Details
                        </p>
                        <dl className="space-y-2">
                          {Object.entries(selected.metadata).map(
                            ([key, value]) =>
                              value != null && (
                                <div key={key} className="flex gap-3">
                                  <dt className="text-xs text-gray-400 w-28 shrink-0 capitalize">
                                    {key.replace(/_/g, " ")}
                                  </dt>
                                  <dd className="text-xs text-gray-700 break-all">
                                    {String(value)}
                                  </dd>
                                </div>
                              )
                          )}
                        </dl>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                    {!selected.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={() => markRead(selected.id)}
                      >
                        <Circle className="h-3 w-3 fill-current" />
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => deleteNotification(selected.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="h-7 w-7 opacity-30" />
              </div>
              <p className="text-sm font-medium">Select a notification</p>
              <p className="text-xs mt-1">
                Click on any notification to see its full details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
