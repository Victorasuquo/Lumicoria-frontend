/**
 * /workspace/admin/jit — just-in-time access grants.  Powered by
 * enterpriseApi.jitGrant + jitGrants.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Clock, Plus } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, OrbEmptyState, BrandPill, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface JitGrant {
  id: string;
  user_id: string;
  user_email?: string;
  role: string;
  expires_at?: string;
  reason?: string;
  granted_at: string;
  granted_by?: string;
  status?: "active" | "expired" | "revoked";
}

const ROLES = ["admin", "team_admin", "billing_admin", "audit_viewer", "scim_token_holder"];

export const AdminJit: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<JitGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [expires, setExpires] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await enterpriseApi.jitGrants(activeOrgId);
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const grant = async () => {
    if (!activeOrgId || !userId.trim() || !role) return;
    try {
      const row: any = await enterpriseApi.jitGrant(activeOrgId, { user_id: userId.trim(), role, expires_at: expires || undefined, reason: reason || undefined });
      setRows(prev => [row, ...prev]);
      setShowNew(false); setUserId(""); setExpires(""); setReason("");
      toast.success("JIT access granted.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Grant failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Just-in-time access"
        subtitle="Grant temporary elevated permissions. Auto-expires at the deadline."
        right={<Button tone="primary" onClick={() => setShowNew(s => !s)}><Plus size={14} /> Grant access</Button>}
      />

      {showNew && (
        <GlassCard padding={20}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 10 }}>
            <Input placeholder="User ID or email" value={userId} onChange={e => setUserId(e.target.value)} />
            <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white" }}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
            <Input type="datetime-local" value={expires} onChange={e => setExpires(e.target.value)} placeholder="Expires" />
          </div>
          <Textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason / ticket #" style={{ marginTop: 10 }} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button tone="primary" onClick={grant} disabled={!userId.trim()}>Grant access</Button>
            <Button tone="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </GlassCard>
      )}

      {loading ? <GlassCard padding={20}><Skeleton height={16} /></GlassCard> :
        rows.length === 0 ? <OrbEmptyState title="No active grants" body="JIT access lets you temporarily elevate a user without a permanent role change." /> :
        <CardGrid minCol={320} gap={12}>
          {rows.map((r, i) => (
            <motion.div key={r.id} {...STAGGER_FAST(i)}>
              <GlassCard padding={16}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <KeyRound size={18} color={tokens.PURPLE} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: tokens.INK }}>{r.user_email || r.user_id.slice(0, 12)}</div>
                    <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 2 }}>Role · {r.role.replace(/_/g, " ")}</div>
                    {r.reason && <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 6 }}>{r.reason}</div>}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, fontSize: 11, color: tokens.SLATE_500 }}>
                      <Clock size={12} />
                      <span>{r.expires_at ? `Expires ${new Date(r.expires_at).toLocaleString()}` : "No expiry"}</span>
                      <BrandPill tone="ghost" style={{ fontSize: 10, marginLeft: "auto" }}>{r.status || "active"}</BrandPill>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </CardGrid>}
    </div>
  );
};

export default AdminJit;
