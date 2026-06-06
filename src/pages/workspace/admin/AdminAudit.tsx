import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { analyticsV2Api, type ActivityRow } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton, BrandPill } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

export const AdminAudit: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      setRows(await analyticsV2Api.orgAuditRecent(activeOrgId, 250, { activity_type: filterType || undefined }));
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const startExport = async () => {
    if (!activeOrgId) return;
    setExporting(true);
    try {
      const r = await analyticsV2Api.orgAuditExport(activeOrgId, 30, "jsonl");
      setJobId(r?.job_id || null);
    } finally { setExporting(false); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        eyebrow="Audit"
        title="Workspace audit log"
        subtitle="Every action that touched this workspace. Filter, search, or queue a signed export to your SIEM."
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <Input value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="filter by activity type" onKeyDown={e => e.key === "Enter" && load()} style={{ width: 240 }} />
            <Button tone="outline" onClick={load}>Refresh</Button>
            <Button tone="primary" onClick={startExport} disabled={exporting}>{exporting ? "Queuing…" : "Export last 30 days"}</Button>
          </div>
        }
      />

      {jobId && (
        <GlassCard padding={18}>
          <BrandPill tone="outline">Export queued</BrandPill>
          <div style={{ marginTop: 8, fontSize: 13, color: tokens.SLATE_700 }}>
            Job <code style={{ color: tokens.PURPLE_DEEP }}>{jobId}</code> is being prepared. We'll notify you when the signed URL is ready.
          </div>
        </GlassCard>
      )}

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No audit entries match" /></div>
        ) : rows.map((r, idx) => (
          <div key={r.id || idx} style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center",
            padding: "10px 18px",
            borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <span style={{
              padding: "2px 10px", borderRadius: 9999,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
              background: (r.severity === "error" ? `${tokens.RED}1A` : `${tokens.PURPLE}10`),
              color: r.severity === "error" ? tokens.RED : tokens.PURPLE_DEEP,
            }}>{r.activity_type.split(".")[0]}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.INK }}>{r.activity_type.replace(/[_\.]/g, " ")}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>
                {r.related_resource_type ? `${r.related_resource_type} ${String(r.related_resource_id || "").slice(0, 8)}…` : "—"}
              </div>
            </div>
            <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{r.user_id ? `user ${String(r.user_id).slice(0, 6)}…` : "system"}</span>
            <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : ""}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminAudit;
