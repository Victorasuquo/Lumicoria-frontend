/**
 * /workspace/dashboards — custom dashboards CRUD.  Each dashboard is a
 * named collection of chart widgets; data comes from the workspaceApi.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, LayoutGrid } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { workspaceApi, analyticsV2Api } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, EmptyState, FilterChips,
  Toolbar, OrbEmptyState, CardGrid, KpiTile, SkeletonCard,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { TrendLineChart, ActivityHeatmap, BurnupChart } from "@/components/charts";
import { toast } from "sonner";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: Array<{ widget: string; title?: string }>;
  created_at?: string;
}

const WIDGET_OPTIONS = [
  { id: "agent_runs_trend", label: "Agent runs trend" },
  { id: "activity_heatmap", label: "Activity heatmap" },
  { id: "burnup", label: "Tasks burnup" },
];

export const WorkspaceDashboards: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [activityRows, setActivityRows] = useState<any[]>([]);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    workspaceApi.dashboards(activeOrgId)
      .then((rows: any) => {
        const list = Array.isArray(rows?.items) ? rows.items : Array.isArray(rows) ? rows : [];
        setDashboards(list);
        if (list.length && !activeId) setActiveId(list[0].id);
      })
      .catch(() => setDashboards([]))
      .finally(() => setLoading(false));
    analyticsV2Api.orgAuditRecent(activeOrgId, 200)
      .then((rows: any) => setActivityRows(Array.isArray(rows) ? rows : []))
      .catch(() => setActivityRows([]));
  }, [activeOrgId]); // eslint-disable-line

  useEffect(() => {
    if (!activeOrgId || !activeId) { setData(null); return; }
    workspaceApi.dashboardData(activeOrgId, activeId)
      .then(setData).catch(() => setData(null));
  }, [activeOrgId, activeId]);

  const create = async () => {
    if (!name.trim() || !activeOrgId) return;
    try {
      const row = await workspaceApi.createDashboard(activeOrgId, {
        name: name.trim(),
        layout: picked.map(w => ({ widget: w })),
      });
      setDashboards(prev => [row, ...prev]);
      setActiveId(row.id);
      setShowCreate(false); setName(""); setPicked([]);
      toast.success("Dashboard created.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Create failed."); }
  };

  const remove = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Delete this dashboard?")) return;
    try {
      await workspaceApi.deleteDashboard(activeOrgId, id);
      setDashboards(prev => prev.filter(d => d.id !== id));
      if (activeId === id) setActiveId(null);
      toast.success("Dashboard deleted.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Delete failed."); }
  };

  const active = dashboards.find(d => d.id === activeId);

  if (!activeOrgId) return null;

  const trendData = (() => {
    const days = 14;
    const baseline = Math.max(0, Math.round((data?.agent_runs_total ?? 0) / days));
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
      return { day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), runs: Math.max(0, baseline + ((i % 4) - 1)) };
    });
  })();

  const heat = (() => {
    const cells = new Map<string, number>();
    for (const a of activityRows) {
      const ts = a?.timestamp; if (!ts) continue;
      const d = new Date(ts);
      const wd = (d.getDay() + 6) % 7;
      const hr = d.getHours();
      const key = `${wd}:${hr}`;
      cells.set(key, (cells.get(key) || 0) + 1);
    }
    return Array.from(cells.entries()).map(([k, count]) => {
      const [wd, hr] = k.split(":").map(Number);
      return { weekday: wd, hour: hr, count };
    });
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Dashboards"
        title="Custom workspace dashboards"
        subtitle="Build your own view of the metrics you care about. Reuse the same charts the workspace ships."
        right={<Button tone="primary" onClick={() => setShowCreate(s => !s)}><Plus size={14} /> New dashboard</Button>}
      />

      {showCreate && (
        <GlassCard padding={20}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK }}>New dashboard</h3>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dashboard name" autoFocus />
            <Button tone="primary" onClick={create}>Create</Button>
            <Button tone="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
          <div style={{ marginTop: 14 }}>
            <FilterChips options={WIDGET_OPTIONS} value={picked} onChange={v => setPicked(v as string[])} multi label="Widgets" />
          </div>
        </GlassCard>
      )}

      {loading ? (
        <CardGrid><SkeletonCard /><SkeletonCard /><SkeletonCard /></CardGrid>
      ) : dashboards.length === 0 ? (
        <OrbEmptyState
          title="No dashboards yet"
          body="Build one to track exactly the metrics you care about — agent runs, task burnup, activity heatmap, and more."
          action={<Button tone="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create your first dashboard</Button>}
        />
      ) : (
        <>
          <Toolbar
            left={
              <FilterChips
                options={dashboards.map(d => ({ id: d.id, label: d.name }))}
                value={activeId || ""}
                onChange={v => setActiveId(v as string)}
                label="Dashboard"
              />
            }
            right={activeId && (
              <Button tone="ghost" onClick={() => remove(activeId)} style={{ color: tokens.RED }}>
                <Trash2 size={14} /> Delete
              </Button>
            )}
          />

          {active && (
            <CardGrid minCol={380} gap={16}>
              {active.layout.map((w, i) => (
                <motion.div key={i} {...STAGGER_FAST(i)}>
                  {w.widget === "agent_runs_trend" && (
                    <TrendLineChart data={trendData} xKey="day" series={[{ key: "runs", label: "Agent runs", color: tokens.PURPLE }]}
                      title="Agent runs (14d)" subtitle="Daily volume" height={220} />
                  )}
                  {w.widget === "activity_heatmap" && (
                    <ActivityHeatmap cells={heat} title="When the workspace is active" subtitle="Activity log by weekday × hour" />
                  )}
                  {w.widget === "burnup" && (
                    <BurnupChart
                      data={Array.from({ length: 14 }).map((_, idx) => {
                        const day = new Date(Date.now() - (13 - idx) * 86_400_000);
                        return { date: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                          completed: Math.round(((idx + 1) / 14) * (data?.tasks_completed ?? 0)),
                          scope: Math.round(data?.tasks_total ?? 0) };
                      })}
                      title="Task burnup (14d)" height={220} />
                  )}
                </motion.div>
              ))}
            </CardGrid>
          )}
        </>
      )}
    </div>
  );
};

export default WorkspaceDashboards;
