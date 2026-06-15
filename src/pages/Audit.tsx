/**
 * User-scoped /audit page.
 *
 * Chronological list of every action the signed-in user has taken across
 * this workspace, filterable by type / severity / date range and
 * exportable to CSV.  Powered by GET /api/v1/activity/me/audit and
 * GET /api/v1/activity/me/audit/export.
 *
 * Lives at /audit and is linked from Profile → Audit log.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Activity, Download, Filter, ChevronLeft, ShieldCheck, AlertTriangle,
  Search, RefreshCcw, FileText, Bot, KeyRound, Settings, FolderKanban, ListChecks,
} from "lucide-react";
import { activityApi, type ActivityEntry } from "@/services/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Severity = "info" | "warning" | "error" | "critical";

function iconForType(t: string) {
  const k = (t || "").toLowerCase();
  if (k.startsWith("auth") || k.includes("login") || k.includes("session")) return <KeyRound className="h-4 w-4 text-amber-500" />;
  if (k.startsWith("document")) return <FileText className="h-4 w-4 text-blue-500" />;
  if (k.startsWith("agent")) return <Bot className="h-4 w-4 text-purple-500" />;
  if (k.startsWith("project")) return <FolderKanban className="h-4 w-4 text-indigo-500" />;
  if (k.startsWith("task")) return <ListChecks className="h-4 w-4 text-emerald-500" />;
  if (k.startsWith("setting") || k.startsWith("profile")) return <Settings className="h-4 w-4 text-slate-500" />;
  if (k.includes("security") || k.includes("token")) return <ShieldCheck className="h-4 w-4 text-rose-500" />;
  return <Activity className="h-4 w-4 text-gray-500" />;
}

function severityBadge(sev: string | undefined) {
  const s = (sev || "info").toLowerCase() as Severity;
  switch (s) {
    case "critical":
      return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[10px]">Critical</Badge>;
    case "error":
      return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200 text-[10px]">Error</Badge>;
    case "warning":
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">Warning</Badge>;
    default:
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Info</Badge>;
  }
}

const RANGES = [
  { id: "24h", label: "Last 24 h", hours: 24 },
  { id: "7d", label: "Last 7 days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 days", hours: 24 * 30 },
  { id: "all", label: "All time", hours: 0 },
];

const TYPES = [
  "", "auth.login", "auth.logout", "agent.executed", "document.uploaded",
  "task.created", "task.completed", "project.created", "settings.updated",
];

const SEVERITIES = ["", "info", "warning", "error", "critical"];

const Audit: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [range, setRange] = useState("7d");
  const [exporting, setExporting] = useState(false);

  const params = useMemo(() => {
    const p: Record<string, any> = { limit: 500 };
    if (activeOrgId) p.organization_id = activeOrgId;
    if (type) p.activity_type = type;
    if (severity) p.severity = severity;
    const r = RANGES.find(x => x.id === range);
    if (r?.hours) {
      p.start_date = new Date(Date.now() - r.hours * 3600 * 1000).toISOString();
    }
    return p;
  }, [activeOrgId, type, severity, range]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await activityApi.myAudit(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not load audit log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [type, severity, range]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.activity_type || "").toLowerCase().includes(q) ||
      (r.related_resource_type || "").toLowerCase().includes(q) ||
      (r.related_resource_id || "").toLowerCase().includes(q) ||
      JSON.stringify(r.details || {}).toLowerCase().includes(q),
    );
  }, [rows, search]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await activityApi.myAuditExport(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumicoria-audit-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Audit log exported.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 hover:text-gray-800">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-gray-300">/</span>
          <span>Audit log</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Audit log</h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Every action you've taken across this workspace — logins, agent runs, documents,
              project changes, profile updates. Export to CSV any time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void load()} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700" onClick={() => void exportCsv()} disabled={exporting}>
              <Download className="h-4 w-4" />
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Filter</span>
            </div>
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map(t => <option key={t} value={t}>{t || "All types"}</option>)}
            </select>
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              {SEVERITIES.map(s => <option key={s} value={s}>{s || "All severities"}</option>)}
            </select>
            <div className="relative ml-auto w-72 max-w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search action, resource, or details…"
                className="pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" />
              No audit events in this window.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((r, idx) => {
                const ts = (() => { try { return format(new Date(r.timestamp), "MMM d, yyyy HH:mm:ss"); } catch { return r.timestamp; } })();
                const sev = (r as any).severity as string | undefined;
                return (
                  <li key={r.id || idx} className="px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full border bg-white shadow-sm">
                        {iconForType(r.activity_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">{r.activity_type}</span>
                          {severityBadge(sev)}
                          {r.related_resource_type && (
                            <Badge variant="outline" className="text-[10px] text-gray-500">
                              {r.related_resource_type}{r.related_resource_id ? `:${String(r.related_resource_id).slice(0, 8)}` : ""}
                            </Badge>
                          )}
                        </div>
                        {r.details && Object.keys(r.details || {}).length > 0 && (
                          <pre className="mt-2 max-h-32 overflow-auto text-xs text-gray-500 whitespace-pre-wrap bg-gray-50 rounded-md p-2 border border-gray-100">
                            {JSON.stringify(r.details, null, 2)}
                          </pre>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{ts}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Compliance note */}
        <div className="mt-6 flex items-start gap-2 text-xs text-gray-500">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-gray-400" />
          <p>
            Audit entries are retained per your workspace's retention policy. Admins can review
            org-wide audit data from <a className="text-purple-600 underline-offset-2 hover:underline" href="/workspace/admin/audit">Admin → Audit</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Audit;
