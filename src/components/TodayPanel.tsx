/**
 * Today panel — small horizontal card that surfaces:
 *   • Today's calendar events (Lumicoria-native)
 *   • Today's due tasks
 *
 * Dropped at the top of the Tasks page (Phase 2).  Auto-refreshes every
 * 60s so a task created elsewhere shows up without a manual reload.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, ChevronRight, Link2 } from "lucide-react";
import { calendarApi, CalendarEvent, taskApi, TaskItem } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function fmtHM(d: string | Date): string {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const TodayPanel: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasksToday, setTasksToday] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [ev, tk] = await Promise.all([
        calendarApi.today().catch(() => []),
        taskApi.getTasks({ limit: 100 }).catch(() => []),
      ]);
      setEvents(Array.isArray(ev) ? ev : []);
      const now = new Date();
      const todayTasks = (Array.isArray(tk) ? tk : []).filter((t) => {
        if (!t.due_date) return false;
        return isSameLocalDay(new Date(t.due_date), now) && t.status !== "completed";
      });
      setTasksToday(todayTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading) return null;
  if (events.length === 0 && tasksToday.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Today</h3>
          <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-500">
            {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </Badge>
        </div>
        <Link to="/calendar" className="text-[11px] text-purple-600 hover:underline flex items-center gap-1">
          Open calendar <ChevronRight size={11} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Calendar events */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
            Events ({events.length})
          </p>
          {events.length === 0 ? (
            <div className="text-xs text-gray-400 italic">No events today</div>
          ) : (
            <ul className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {events.map((e) => (
                <li
                  key={e.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 border text-xs",
                    e.status === "completed"
                      ? "bg-gray-50 border-gray-100 text-gray-400 line-through"
                      : "bg-white border-gray-100 text-gray-800"
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="flex-1 truncate">{e.title}</span>
                  {e.task_id && <Link2 size={10} className="text-purple-400" />}
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {fmtHM(e.start)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tasks due today */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
            Tasks due ({tasksToday.length})
          </p>
          {tasksToday.length === 0 ? (
            <div className="text-xs text-gray-400 italic">Nothing due today</div>
          ) : (
            <ul className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {tasksToday.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 border border-gray-100 bg-white text-xs"
                >
                  <Clock size={11} className="text-purple-400 shrink-0" />
                  <span className="flex-1 truncate text-gray-800">
                    {t.title || t.name || "Untitled task"}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {fmtHM(t.due_date!)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayPanel;
