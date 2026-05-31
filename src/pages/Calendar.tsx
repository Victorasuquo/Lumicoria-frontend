/**
 * Lumicoria-native Calendar — Phase 2.
 *
 * Three views: Month / Week / Day.
 * Drag-to-reschedule on Week and Day views.
 * Right-side drawer for event detail + edit + delete.
 * Linked-task badge when an event came from a task.
 * Always works without Google Calendar.  Per-event "Sync to Google" button
 * surfaces the Phase-3-ready endpoint result.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Link2,
  CloudUpload,
  Sparkles,
  Filter as FilterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  calendarApi,
  CalendarEvent,
  CalendarEventCreatePayload,
  CalendarEventSource,
} from "@/services/api";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────

type ViewMode = "month" | "week" | "day";

const SOURCE_LABELS: Record<CalendarEventSource, string> = {
  task: "Task",
  manual: "Manual",
  gcal_imported: "From Google",
  agent: "Agent",
};

const SOURCE_COLORS: Record<CalendarEventSource, string> = {
  task: "bg-purple-100 text-purple-700 border-purple-200",
  manual: "bg-gray-100 text-gray-700 border-gray-200",
  gcal_imported: "bg-blue-100 text-blue-700 border-blue-200",
  agent: "bg-amber-100 text-amber-700 border-amber-200",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Monday as first day
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function toIso(d: Date): string {
  return d.toISOString();
}
function fmtHM(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString([], { year: "numeric", month: "long" });
}

// ── Visible range for the current view ──────────────────────────────────

function rangeForView(view: ViewMode, anchor: Date): { start: Date; end: Date; gridStart: Date; gridEnd: Date } {
  if (view === "day") {
    const start = startOfDay(anchor);
    const end = addDays(start, 1);
    return { start, end, gridStart: start, gridEnd: end };
  }
  if (view === "week") {
    const start = startOfWeek(anchor);
    const end = addDays(start, 7);
    return { start, end, gridStart: start, gridEnd: end };
  }
  // month — pad to full grid weeks
  const mStart = startOfMonth(anchor);
  const mEnd = startOfMonth(addMonths(anchor, 1));
  const gridStart = startOfWeek(mStart);
  const gridEnd = addDays(startOfWeek(addDays(mEnd, -1)), 7);
  return { start: mStart, end: mEnd, gridStart, gridEnd };
}

// ── Component ──────────────────────────────────────────────────────────

const HOUR_HEIGHT = 56; // px per hour in week/day view

const Calendar: React.FC = () => {
  const { toast } = useToast();
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [showCreate, setShowCreate] = useState<Date | null>(null);
  const [sourceFilter, setSourceFilter] = useState<Set<CalendarEventSource>>(
    () => new Set(["task", "manual", "gcal_imported", "agent"])
  );

  const { gridStart, gridEnd } = useMemo(() => rangeForView(view, anchor), [view, anchor]);

  // ── Fetch in window ─────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await calendarApi.list({
        start: toIso(gridStart),
        end: toIso(gridEnd),
        include_completed: true,
      });
      setEvents(data);
    } catch (e: any) {
      toast({ title: "Calendar", description: e?.message || "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [gridStart, gridEnd, toast]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Refresh after a Calendar mutation
  const refresh = useCallback(() => fetchEvents(), [fetchEvents]);

  // ── Filtered events ─────────────────────────────────────────────────
  const filtered = useMemo(
    () => events.filter((e) => sourceFilter.has(e.source) && !e.deleted_at),
    [events, sourceFilter],
  );

  // ── Navigation ──────────────────────────────────────────────────────
  const goPrev = () => {
    if (view === "month") setAnchor(addMonths(anchor, -1));
    else if (view === "week") setAnchor(addDays(anchor, -7));
    else setAnchor(addDays(anchor, -1));
  };
  const goNext = () => {
    if (view === "month") setAnchor(addMonths(anchor, 1));
    else if (view === "week") setAnchor(addDays(anchor, 7));
    else setAnchor(addDays(anchor, 1));
  };
  const goToday = () => setAnchor(new Date());

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await calendarApi.delete(id);
      setSelected(null);
      toast({ title: "Event deleted" });
      refresh();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  // ── Mark completed ──────────────────────────────────────────────────
  const handleComplete = async (id: string) => {
    try {
      const updated = await calendarApi.update(id, { status: "completed" });
      setSelected(updated);
      refresh();
      toast({ title: "Event marked completed" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    }
  };

  // ── Google sync ─────────────────────────────────────────────────────
  const handleSyncGoogle = async (id: string) => {
    try {
      const result = await calendarApi.syncEventToGoogle(id);
      if (result.synced) {
        toast({ title: "Synced to Google Calendar" });
      } else if (result.reason === "google_not_connected") {
        toast({ title: "Google not connected", description: "Connect Google Workspace in Settings → Integrations.", variant: "destructive" });
      } else {
        toast({ title: "Sync pending", description: result.note || result.reason });
      }
      refresh();
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.message, variant: "destructive" });
    }
  };

  // ── Drag-to-reschedule (week/day) ──────────────────────────────────
  const moveEventBy = async (event: CalendarEvent, deltaMinutes: number) => {
    const start = new Date(new Date(event.start).getTime() + deltaMinutes * 60_000);
    const end = new Date(new Date(event.end).getTime() + deltaMinutes * 60_000);
    try {
      const updated = await calendarApi.update(event.id, {
        start: toIso(start),
        end: toIso(end),
      });
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (e: any) {
      toast({ title: "Reschedule failed", description: e?.message, variant: "destructive" });
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <CalendarDays size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-500">{fmtMonthYear(anchor)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs">
              Today
            </Button>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <button onClick={goPrev} className="p-2 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={goNext} className="p-2 hover:bg-gray-50 border-l border-gray-100">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-0.5 flex">
              {(["month", "week", "day"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                    view === v ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button
              onClick={() => setShowCreate(anchor)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus size={14} className="mr-1.5" /> New event
            </Button>
          </div>
        </header>

        {/* Source filter chips */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <FilterIcon size={12} className="text-gray-400" />
          {(["task", "manual", "agent", "gcal_imported"] as CalendarEventSource[]).map((s) => {
            const active = sourceFilter.has(s);
            return (
              <button
                key={s}
                onClick={() => {
                  setSourceFilter((prev) => {
                    const next = new Set(prev);
                    next.has(s) ? next.delete(s) : next.add(s);
                    return next;
                  });
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full border transition-colors",
                  active
                    ? SOURCE_COLORS[s] + " font-medium"
                    : "bg-white border-gray-200 text-gray-400"
                )}
              >
                {SOURCE_LABELS[s]}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400">
            {loading ? "Loading…" : `${filtered.length} event${filtered.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {/* Grid */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {view === "month" && (
            <MonthGrid
              anchor={anchor}
              events={filtered}
              onSelectEvent={setSelected}
              onSelectDate={(d) => { setAnchor(d); setView("day"); }}
              onCreateOnDate={(d) => setShowCreate(d)}
            />
          )}
          {view === "week" && (
            <TimedGrid
              start={startOfWeek(anchor)}
              days={7}
              events={filtered}
              onSelectEvent={setSelected}
              onCreate={(d) => setShowCreate(d)}
              onMove={moveEventBy}
            />
          )}
          {view === "day" && (
            <TimedGrid
              start={startOfDay(anchor)}
              days={1}
              events={filtered}
              onSelectEvent={setSelected}
              onCreate={(d) => setShowCreate(d)}
              onMove={moveEventBy}
            />
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <EventDrawer
        event={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        onComplete={handleComplete}
        onSyncGoogle={handleSyncGoogle}
        onSaved={(e) => { setSelected(e); refresh(); }}
      />

      {/* Create modal */}
      <CreateEventModal
        defaultStart={showCreate}
        onClose={() => setShowCreate(null)}
        onCreated={() => { setShowCreate(null); refresh(); }}
      />
    </div>
  );
};

// ── Month grid ─────────────────────────────────────────────────────────

const MonthGrid: React.FC<{
  anchor: Date;
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
  onSelectDate: (d: Date) => void;
  onCreateOnDate: (d: Date) => void;
}> = ({ anchor, events, onSelectEvent, onSelectDate, onCreateOnDate }) => {
  const { gridStart, gridEnd } = useMemo(() => rangeForView("month", anchor), [anchor]);
  const today = startOfDay(new Date());
  const monthIndex = anchor.getMonth();

  const days: Date[] = [];
  for (let d = new Date(gridStart); d < gridEnd; d = addDays(d, 1)) days.push(d);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = startOfDay(new Date(e.start)).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  return (
    <div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {w}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 grid-rows-6">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === monthIndex;
          const isToday = sameDay(d, today);
          const list = eventsByDay.get(startOfDay(d).toISOString()) || [];
          return (
            <div
              key={i}
              className={cn(
                "border-b border-r border-gray-50 min-h-[110px] p-1.5 group cursor-pointer transition-colors",
                inMonth ? "bg-white hover:bg-gray-50/50" : "bg-gray-50/30 text-gray-300"
              )}
              onClick={() => onSelectDate(d)}
              onDoubleClick={(e) => { e.stopPropagation(); onCreateOnDate(d); }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center",
                    isToday ? "bg-purple-600 text-white" : inMonth ? "text-gray-700" : "text-gray-300"
                  )}
                >
                  {d.getDate()}
                </span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-purple-600 text-xs"
                  onClick={(e) => { e.stopPropagation(); onCreateOnDate(d); }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-0.5">
                {list.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); onSelectEvent(e); }}
                    className="w-full text-left px-1.5 py-0.5 rounded text-[11px] truncate hover:opacity-80 transition-opacity flex items-center gap-1"
                    style={{ backgroundColor: `${e.color}1F`, color: e.color, borderLeft: `2px solid ${e.color}` }}
                  >
                    {e.task_id && <Link2 size={9} />}
                    <span className="truncate">{e.title}</span>
                  </button>
                ))}
                {list.length > 3 && (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); onSelectDate(d); }}
                    className="text-[10px] text-purple-600 hover:underline pl-1.5"
                  >
                    +{list.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Week / Day timed grid ─────────────────────────────────────────────

const TimedGrid: React.FC<{
  start: Date;
  days: number;
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
  onCreate: (d: Date) => void;
  onMove: (event: CalendarEvent, deltaMinutes: number) => void;
}> = ({ start, days, events, onSelectEvent, onCreate, onMove }) => {
  const today = startOfDay(new Date());
  const dayList: Date[] = [];
  for (let i = 0; i < days; i++) dayList.push(addDays(start, i));

  const dragRef = useRef<{ id: string; originY: number; rendererStart: Date } | null>(null);

  const onDragStart = (e: React.DragEvent, ev: CalendarEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ev.id);
    dragRef.current = { id: ev.id, originY: e.clientY, rendererStart: new Date(ev.start) };
  };

  const onDropOnColumn = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const event = events.find((x) => x.id === id);
    if (!event) return;
    // Compute the new start from the drop Y position within the column.
    const col = e.currentTarget as HTMLDivElement;
    const rect = col.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = Math.max(0, Math.round((y / HOUR_HEIGHT) * 60 / 15) * 15); // snap to 15 min
    const newStart = new Date(day);
    newStart.setHours(0, 0, 0, 0);
    newStart.setMinutes(minutes);
    const delta = Math.round((newStart.getTime() - new Date(event.start).getTime()) / 60_000);
    if (delta !== 0) onMove(event, delta);
  };

  return (
    <div className="relative">
      {/* Day headers */}
      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: `60px repeat(${days}, 1fr)` }}>
        <div /> {/* hour gutter */}
        {dayList.map((d) => {
          const isToday = sameDay(d, today);
          return (
            <div key={d.toISOString()} className="px-3 py-2 text-center border-l border-gray-50">
              <div className="text-[10px] uppercase tracking-wide text-gray-400">
                {d.toLocaleDateString([], { weekday: "short" })}
              </div>
              <div
                className={cn(
                  "mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium",
                  isToday ? "bg-purple-600 text-white" : "text-gray-700"
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body — hour rows + columns */}
      <div className="relative overflow-y-auto" style={{ height: HOUR_HEIGHT * 24, maxHeight: "70vh" }}>
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `60px repeat(${days}, 1fr)`, height: HOUR_HEIGHT * 24 }}
        >
          {/* Hour gutter */}
          <div>
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="text-[10px] text-gray-400 pr-2 text-right border-b border-gray-50"
                style={{ height: HOUR_HEIGHT, lineHeight: `${HOUR_HEIGHT}px` }}
              >
                {h === 0 ? "" : `${h.toString().padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
          {/* Day columns */}
          {dayList.map((d) => {
            const dayEvents = events.filter((e) => sameDay(new Date(e.start), d));
            return (
              <div
                key={d.toISOString()}
                className="relative border-l border-gray-50"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                onDrop={(e) => onDropOnColumn(e, d)}
                onDoubleClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const minutes = Math.max(0, Math.round((y / HOUR_HEIGHT) * 60 / 15) * 15);
                  const dropAt = new Date(d);
                  dropAt.setHours(0, 0, 0, 0);
                  dropAt.setMinutes(minutes);
                  onCreate(dropAt);
                }}
              >
                {/* Hour grid lines */}
                {Array.from({ length: 24 }).map((_, h) => (
                  <div
                    key={h}
                    className="border-b border-gray-50"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
                {/* Events */}
                {dayEvents.map((e) => {
                  const startD = new Date(e.start);
                  const endD = new Date(e.end);
                  const top = (startD.getHours() + startD.getMinutes() / 60) * HOUR_HEIGHT;
                  const heightPx = Math.max(
                    20,
                    ((endD.getTime() - startD.getTime()) / 3_600_000) * HOUR_HEIGHT
                  );
                  return (
                    <button
                      key={e.id}
                      draggable
                      onDragStart={(ev) => onDragStart(ev, e)}
                      onClick={() => onSelectEvent(e)}
                      className="absolute left-1 right-1 rounded-md px-2 py-1 text-[11px] text-left shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-grab active:cursor-grabbing"
                      style={{
                        top,
                        height: heightPx,
                        background: `${e.color}1F`,
                        borderLeft: `3px solid ${e.color}`,
                        color: e.color,
                      }}
                    >
                      <div className="font-medium truncate flex items-center gap-1">
                        {e.task_id && <Link2 size={9} />}
                        <span className="truncate">{e.title}</span>
                      </div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {fmtHM(startD)} – {fmtHM(endD)}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Event drawer ───────────────────────────────────────────────────────

const EventDrawer: React.FC<{
  event: CalendarEvent | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onSyncGoogle: (id: string) => void;
  onSaved: (e: CalendarEvent) => void;
}> = ({ event, onClose, onDelete, onComplete, onSyncGoogle, onSaved }) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string; start: string; end: string; color: string } | null>(null);

  useEffect(() => {
    if (event) {
      setEditing(false);
      setDraft({
        title: event.title,
        description: event.description || "",
        start: event.start.slice(0, 16),
        end: event.end.slice(0, 16),
        color: event.color,
      });
    } else {
      setDraft(null);
    }
  }, [event]);

  if (!event || !draft) return null;

  const handleSave = async () => {
    try {
      const updated = await calendarApi.update(event.id, {
        title: draft.title,
        description: draft.description,
        start: new Date(draft.start).toISOString(),
        end: new Date(draft.end).toISOString(),
        color: draft.color,
      });
      onSaved(updated);
      setEditing(false);
      toast({ title: "Event saved" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40" onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <header className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Event detail</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
            </header>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Source / status */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px]", SOURCE_COLORS[event.source])}>
                  {SOURCE_LABELS[event.source]}
                </Badge>
                {event.status === "completed" && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Completed
                  </Badge>
                )}
                {event.gcal_event_id && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                    <CloudUpload size={9} className="mr-1" /> Synced to Google
                  </Badge>
                )}
                {event.task_id && (
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                    <Link2 size={9} className="mr-1" /> Linked to task
                  </Badge>
                )}
              </div>

              {/* Title */}
              {editing ? (
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
              )}

              {/* Time */}
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Clock size={14} className="mt-1 text-gray-400" />
                {editing ? (
                  <div className="space-y-1 flex-1">
                    <input
                      type="datetime-local"
                      value={draft.start}
                      onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
                    />
                    <input
                      type="datetime-local"
                      value={draft.end}
                      onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
                    />
                  </div>
                ) : (
                  <div>
                    <div>{new Date(event.start).toLocaleString()}</div>
                    <div className="text-gray-400">→ {new Date(event.end).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Color */}
              {editing && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Color</p>
                  <input
                    type="color"
                    value={draft.color}
                    onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                    className="h-8 w-16 border border-gray-200 rounded cursor-pointer"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Description</p>
                {editing ? (
                  <Textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={4}
                    className="text-sm"
                  />
                ) : event.description ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.description}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No description</p>
                )}
              </div>

              {/* Linked task */}
              {event.task_id && (
                <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3 text-sm text-purple-900">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium mb-1">
                    <Sparkles size={11} /> Linked task
                  </div>
                  <p className="text-xs text-purple-700">
                    Changes to the task's due date, title, or status sync here automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <footer className="p-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {!editing && event.status !== "completed" && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => onComplete(event.id)}>
                    <CheckCircle2 size={12} className="mr-1" /> Complete
                  </Button>
                )}
                {!editing && !event.gcal_event_id && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => onSyncGoogle(event.id)}>
                    <CloudUpload size={12} className="mr-1" /> Sync
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {editing ? (
                  <>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs" onClick={handleSave}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditing(true)}>
                      <Edit3 size={12} className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={() => onDelete(event.id)}>
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Create-event modal ─────────────────────────────────────────────────

const CreateEventModal: React.FC<{
  defaultStart: Date | null;
  onClose: () => void;
  onCreated: () => void;
}> = ({ defaultStart, onClose, onCreated }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [color, setColor] = useState("#6C4AB0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultStart) {
      const s = new Date(defaultStart);
      if (s.getHours() === 0 && s.getMinutes() === 0) s.setHours(9, 0, 0, 0);
      const e = new Date(s.getTime() + 60 * 60_000);
      setStart(s.toISOString().slice(0, 16));
      setEnd(e.toISOString().slice(0, 16));
      setTitle("");
      setDescription("");
      setColor("#6C4AB0");
    }
  }, [defaultStart]);

  if (!defaultStart) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: CalendarEventCreatePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        color,
        source: "manual",
      };
      await calendarApi.create(payload);
      toast({ title: "Event created" });
      onCreated();
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {defaultStart && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[440px] max-w-[92vw] bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">New calendar event</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
            </header>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's this about?" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-gray-400">Start</label>
                  <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="w-full text-sm border border-gray-200 rounded px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-gray-400">End</label>
                  <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full text-sm border border-gray-200 rounded px-2 py-1.5" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Notes, agenda, links…" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400">Color</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-16 border border-gray-200 rounded cursor-pointer" />
              </div>
            </div>
            <footer className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs" onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Create event"}
              </Button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Calendar;
