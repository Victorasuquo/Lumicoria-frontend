import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { analyticsV2Api, type ActivityRow } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton, BrandPill,
} from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

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
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <Input value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="filter by activity type" onKeyDown={e => e.key === "Enter" && load()} style={{ width: 240 }} />
            <Button tone="outline" onClick={load}>Refresh</Button>
          </div>
        }
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
            <div style={{ padding: 24 }}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 24 }}><EmptyState title="Nothing here yet" body="Once activity starts flowing in this workspace, it will show up live." /></div>
          ) : rows.map((r, idx) => (
            <div key={r.id || idx} style={{
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
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
};

export default WorkspaceActivity;
