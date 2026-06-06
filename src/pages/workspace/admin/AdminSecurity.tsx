import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi, type SessionPolicy } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, Skeleton, BrandPill } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

export const AdminSecurity: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [policy, setPolicy] = useState<SessionPolicy | null>(null);
  const [ipText, setIpText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    enterpriseApi.getPolicy(activeOrgId).then(p => {
      setPolicy(p);
      setIpText((p.ip_allowlist || []).join("\n"));
    }).finally(() => setLoading(false));
  }, [activeOrgId]);

  const save = async (patch: Partial<SessionPolicy>) => {
    if (!activeOrgId || !policy) return;
    setBusy(true); setMsg(null);
    try {
      const p = await enterpriseApi.patchPolicy(activeOrgId, patch);
      setPolicy(p);
      setMsg("Saved.");
    } catch (e: any) { setMsg(e?.response?.data?.detail || "Save failed"); }
    finally { setBusy(false); }
  };

  if (!activeOrgId) return null;
  if (loading || !policy) return <GlassCard padding={20}><Skeleton height={20} /></GlassCard>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Security" title="Session & access policy" subtitle="Idle timeout, MFA, IP allowlists, and data residency for this workspace." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard padding={22}>
          <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 }}>Sessions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Idle timeout (minutes)</div>
              <Input type="number" min={5} max={1440} value={policy.idle_timeout_minutes} onChange={e => setPolicy({ ...policy, idle_timeout_minutes: parseInt(e.target.value, 10) })} />
            </label>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Max sessions per user</div>
              <Input type="number" min={1} max={100} value={policy.max_sessions_per_user} onChange={e => setPolicy({ ...policy, max_sessions_per_user: parseInt(e.target.value, 10) })} />
            </label>
            <label style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={policy.require_mfa} onChange={e => setPolicy({ ...policy, require_mfa: e.target.checked })} />
              <span style={{ fontSize: 13, color: tokens.INK, fontWeight: 600 }}>Require MFA for every user</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
            <Button tone="primary" disabled={busy} onClick={() => save({
              idle_timeout_minutes: policy.idle_timeout_minutes,
              max_sessions_per_user: policy.max_sessions_per_user,
              require_mfa: policy.require_mfa,
            })}>{busy ? "Saving…" : "Save"}</Button>
            {msg && <span style={{ fontSize: 13, color: tokens.SLATE_600 }}>{msg}</span>}
          </div>
        </GlassCard>

        <GlassCard padding={22}>
          <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 }}>Data residency</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["us", "eu", "in"] as const).map(r => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: `1px solid ${policy.data_residency === r ? tokens.PURPLE : tokens.SLATE_200}`, background: policy.data_residency === r ? `${tokens.PURPLE}10` : "white", cursor: "pointer" }}>
                <input type="radio" checked={policy.data_residency === r} onChange={() => setPolicy({ ...policy, data_residency: r })} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r === "us" ? "United States" : r === "eu" ? "European Union" : "India"}</span>
              </label>
            ))}
          </div>
          <Button tone="primary" disabled={busy} style={{ marginTop: 14 }} onClick={() => save({ data_residency: policy.data_residency })}>{busy ? "Saving…" : "Save residency"}</Button>
        </GlassCard>
      </div>

      <GlassCard padding={22}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>IP allowlist</h3>
        <p style={{ color: tokens.SLATE_600, fontSize: 13, margin: 0, marginBottom: 12 }}>One CIDR or IP per line. Leave empty to allow all.</p>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={policy.ip_allowlist_enabled} onChange={e => setPolicy({ ...policy, ip_allowlist_enabled: e.target.checked })} />
          <span style={{ fontSize: 13, color: tokens.INK, fontWeight: 600 }}>Enforce IP allowlist</span>
          <BrandPill tone="ghost">{policy.ip_allowlist.length} entries</BrandPill>
        </label>
        <textarea value={ipText} onChange={e => setIpText(e.target.value)} rows={6} style={{
          width: "100%", marginTop: 10, padding: 12, borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`,
          fontFamily: "JetBrains Mono, monospace", fontSize: 12, background: "white", color: tokens.INK,
        }} placeholder="10.0.0.0/8\n203.0.113.42" />
        <Button tone="primary" disabled={busy} style={{ marginTop: 12 }} onClick={() => save({
          ip_allowlist_enabled: policy.ip_allowlist_enabled,
          ip_allowlist: ipText.split(/\s+/).filter(Boolean),
        })}>{busy ? "Saving…" : "Save allowlist"}</Button>
      </GlassCard>
    </div>
  );
};

export default AdminSecurity;
