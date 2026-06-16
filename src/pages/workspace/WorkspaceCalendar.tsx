/**
 * /workspace/calendar — workspace-wide calendar aggregating tasks +
 * reminders + events.  Pulls /workspaces/{orgId}/calendar.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { workspaceApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Skeleton, EmptyState, FilterChips,
  Toolbar, OrbEmptyState, CardGrid, KpiTile,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";

interface CalendarRow {
  id?: string;
  resource_type: "task" | "reminder" | "event" | "schedule";
  title: string;
  due_at?: string;
  starts_at?: string;
  ends_at?: string;
  source?: string;
  priority?: string;
  url?: string;
}

const RANGE_OPTIONS = [
  { id: "7", label: "Next 7 days" },
  { id: "14", label: "Next 14 days" },
  { id: "30", label: "Next 30 days" },
  { id: "90", label: "Next quarter" },
];

const TYPE_FILTERS = [
  { id: "task", label: "Tasks" },
  { id: "reminder", label: "Reminders" },
  { id: "event", label: "Events" },
  { id: "schedule", label: "Schedules" },
];

const fmtDate = (s?: string) => {
  if (!s) return "";
  try { return new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return s; }
};

const groupByDay = (rows: CalendarRow[]) => {
  const map = new Map<string, CalendarRow[]>();
  for (const r of rows) {
    const d = r.due_at || r.starts_at;
    if (!d) continue;
    const key = new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const arr = map.get(key) || []; arr.push(r); map.set(key, arr);
  }
  return Array.from(map.entries());
};

export const WorkspaceCalendar: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [days, setDays] = useState("14");
  const [types, setTypes] = useState<string[]>([]);
  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    workspaceApi.calendar(activeOrgId, Number(days))
      .then((data: any) => setRows(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [activeOrgId, days]);

  const filtered = types.length === 0 ? rows : rows.filter(r => types.includes(r.resource_type));
  const grouped = groupByDay(filtered);

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Calendar"
        title="What's coming up"
        subtitle="Tasks, reminders, events, and scheduled agent runs — across every team and project."
      />

      <CardGrid minCol={200} gap={14}>
        <KpiTile label="Total" value={filtered.length} sub={`Next ${days} days`} />
        <KpiTile label="Tasks" value={filtered.filter(r => r.resource_type === "task").length} sub="due" />
        <KpiTile label="Reminders" value={filtered.filter(r => r.resource_type === "reminder").length} sub="upcoming" />
        <KpiTile label="Events" value={filtered.filter(r => r.resource_type === "event").length} sub="scheduled" tone="accent" />
      </CardGrid>

      <Toolbar
        left={<FilterChips options={RANGE_OPTIONS} value={days} onChange={v => setDays(v as string)} label="Range" />}
        right={<FilterChips options={TYPE_FILTERS} value={types} onChange={v => setTypes(v as string[])} multi label="Types" />}
      />

      {loading ? (
        <GlassCard padding={20}><Skeleton height={18} /><Skeleton height={14} style={{ marginTop: 10 }} /></GlassCard>
      ) : grouped.length === 0 ? (
        <OrbEmptyState title="Nothing scheduled" body="Tasks, reminders, and events show up here when they have a due date." />
      ) : grouped.map(([day, items], gi) => (
        <motion.div key={day} {...STAGGER_FAST(gi)}>
          <SectionHeader title={day} />
          <GlassCard padding={6}>
            {items.map((r, i) => (
              <div key={`${r.id || i}`} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 12,
                padding: "12px 16px", borderBottom: i < items.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
              }}>
                <span style={{
                  display: "inline-block", width: 8, height: 8, borderRadius: 999,
                  background:
                    r.resource_type === "task" ? tokens.PURPLE :
                    r.resource_type === "reminder" ? tokens.AMBER :
                    r.resource_type === "event" ? tokens.SKY : tokens.GREEN,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: tokens.INK, fontSize: 14 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: tokens.SLATE_500, textTransform: "capitalize" }}>
                    {r.resource_type}{r.source ? ` · ${r.source}` : ""}{r.priority ? ` · ${r.priority}` : ""}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: tokens.SLATE_500, whiteSpace: "nowrap" }}>{fmtDate(r.due_at || r.starts_at)}</span>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

export default WorkspaceCalendar;
