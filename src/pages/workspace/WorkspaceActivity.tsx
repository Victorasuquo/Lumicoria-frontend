import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { analyticsV2Api, type ActivityRow } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, BrandPill,
  Toolbar, SkeletonRow, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { motion } from "framer-motion";

export const WorkspaceActivity: React.FC = () => {
  const { activeOrgId, activeOrg } = useWorkspace();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true); setAccessDenied(false);
    try {
      setRows(await analyticsV2Api.orgAuditRecent(activeOrgId, 200, { activity_type: filterType || undefined }));
    } catch (e: any) {
      if (e?.response?.status === 403) setAccessDenied(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [activeOrgId]);

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        eyebrow="Activity"
        title={`What's happening in ${activeOrg?.name || "this workspace"}`}
        subtitle="A streaming view of recent events. Org admins see everything; members see their own resources."
      />

      <Toolbar
        left={<Input value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="Filter by activity type" onKeyDown={e => e.key === "Enter" && load()} style={{ width: 280 }} />}
        center={<span style={{ fontSize: 12, color: tokens.SLATE_500, fontWeight: 600 }}>{rows.length} {rows.length === 1 ? "event" : "events"}</span>}
        right={<Button tone="outline" onClick={load}>Refresh</Button>}
      />

      {accessDenied ? (
        <GlassCard padding={28}>
          <BrandPill tone="outline">Admin only</BrandPill>
          <p style={{ color: tokens.SLATE_600, fontSize: 14, marginTop: 10 }}>
            Workspace-wide activity is visible to org admins. Ask an admin to share access, or open Admin → Audit log if you have rights.
          </p>
        </GlassCard>
      ) : (
        <GlassCard padding={6}>
          {loading ? (
            <>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} widths={["72px", "36%", "20%", "14%"]} />)}</>
          ) : rows.length === 0 ? (
            <div style={{ padding: 24 }}><OrbEmptyState title="Nothing here yet" body="Once activity starts flowing in this workspace, it will show up live." /></div>
          ) : rows.map((r, idx) => (
            <motion.div key={r.id || idx} {...STAGGER_FAST(idx)} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
              padding: "10px 18px",
              borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
            }}>
              <span style={{
                padding: "2px 10px", borderRadius: 9999,
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                background: `${tokens.PURPLE}10`, color: tokens.PURPLE_DEEP,
              }}>{r.activity_type.split(".")[0]}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: tokens.INK }}>{r.activity_type.replace(/[_\.]/g, " ")}</div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>
                  {r.related_resource_type ? `${r.related_resource_type} ${String(r.related_resource_id || "").slice(0, 8)}…` : "—"}
                </div>
              </div>
              <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : ""}</span>
            </motion.div>
          ))}
        </GlassCard>
      )}
    </div>
  );
};

export default WorkspaceActivity;
