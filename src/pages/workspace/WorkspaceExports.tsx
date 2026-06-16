/**
 * /workspace/exports — list workspace export jobs + download.  Powered
 * by /workspaces/{org_id}/exports.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCcw } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { workspaceApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Skeleton, Toolbar, OrbEmptyState, FilterChips,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface ExportJob {
  id: string;
  kind: string;
  format?: string;
  status: "queued" | "running" | "ready" | "failed";
  created_at: string;
  finished_at?: string;
  download_url?: string;
  size_bytes?: number;
  error?: string;
}

const KINDS = [
  { id: "activity", label: "Activity log" },
  { id: "tasks", label: "Tasks" },
  { id: "members", label: "Members" },
  { id: "billing", label: "Billing" },
];

const STATUS_TONE: Record<string, { bg: string; color: string }> = {
  queued:  { bg: `${tokens.SLATE_300}33`, color: tokens.SLATE_600 },
  running: { bg: `${tokens.SKY}1A`, color: tokens.SKY },
  ready:   { bg: `${tokens.GREEN}1A`, color: tokens.GREEN },
  failed:  { bg: `${tokens.RED}1A`, color: tokens.RED },
};

const fmtBytes = (n?: number) => {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export const WorkspaceExports: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("activity");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await workspaceApi.exports(activeOrgId);
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const requestExport = async () => {
    if (!activeOrgId || !kind) return;
    setCreating(true);
    try {
      const job: any = await workspaceApi.requestExport(activeOrgId, { kind, format: "csv" });
      setRows(prev => [job, ...prev]);
      toast.success(`${KINDS.find(k => k.id === kind)?.label} export queued.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not queue export.");
    } finally { setCreating(false); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Exports"
        title="Workspace exports"
        subtitle="Bulk-download activity logs, task rosters, billing data, and member lists."
        right={<Button tone="ghost" onClick={() => void load()}><RefreshCcw size={14} /> Refresh</Button>}
      />

      <Toolbar
        left={<FilterChips options={KINDS} value={kind} onChange={v => setKind(v as string)} label="Kind" />}
        right={<Button tone="primary" onClick={requestExport} disabled={creating}>{creating ? "Queuing…" : "Request export"}</Button>}
      />

      {loading ? (
        <GlassCard padding={20}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></GlassCard>
      ) : rows.length === 0 ? (
        <OrbEmptyState title="No exports yet" body="Request one above and we'll prepare the file for download." />
      ) : (
        <GlassCard padding={6}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 90px 100px 140px 80px 120px",
            gap: 8, padding: "10px 16px", color: tokens.SLATE_500, fontSize: 11,
            fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
            borderBottom: `1px solid ${tokens.SLATE_100}`,
          }}>
            <span>Kind</span><span>Format</span><span>Status</span><span>Created</span><span>Size</span><span></span>
          </div>
          {rows.map((r, i) => {
            const tone = STATUS_TONE[r.status] || STATUS_TONE.queued;
            return (
              <motion.div key={r.id} {...STAGGER_FAST(i)} style={{
                display: "grid", gridTemplateColumns: "1fr 90px 100px 140px 80px 120px",
                gap: 8, padding: "12px 16px", alignItems: "center",
                borderBottom: i < rows.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
              }}>
                <span style={{ fontWeight: 600, color: tokens.INK, textTransform: "capitalize" }}>{r.kind}</span>
                <span style={{ fontSize: 12, color: tokens.SLATE_600 }}>{r.format || "csv"}</span>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 999,
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
                  background: tone.bg, color: tone.color, width: "fit-content",
                }}>{r.status}</span>
                <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{new Date(r.created_at).toLocaleString()}</span>
                <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{fmtBytes(r.size_bytes)}</span>
                <span>
                  {r.status === "ready" && r.download_url && (
                    <a href={r.download_url} target="_blank" rel="noreferrer"
                       style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 999, background: tokens.PURPLE, color: "white", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      <Download size={12} /> Download
                    </a>
                  )}
                  {r.status === "failed" && r.error && (
                    <span style={{ fontSize: 11, color: tokens.RED }} title={r.error}>Failed</span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </GlassCard>
      )}
    </div>
  );
};

export default WorkspaceExports;
