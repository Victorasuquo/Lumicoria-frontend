import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi, type DomainClaim } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton, BrandPill, StatusDot } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

export const AdminDomains: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<DomainClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [autoJoinRole, setAutoJoinRole] = useState("member");
  const [enforced, setEnforced] = useState(false);
  const [pendingDomain, setPendingDomain] = useState<DomainClaim | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try { setRows(await enterpriseApi.listDomains(activeOrgId)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const add = async () => {
    if (!activeOrgId || !domain.trim()) return;
    setBusy(true);
    try {
      const r = await enterpriseApi.addDomain(activeOrgId, { domain: domain.trim(), auto_join_role: autoJoinRole, enforced });
      setPendingDomain(r as any);
      setRows(prev => [r as any, ...prev]);
      setDomain("");
    } finally { setBusy(false); }
  };

  const verify = async (d: DomainClaim) => {
    if (!activeOrgId) return;
    setBusy(true);
    try {
      const updated = await enterpriseApi.verifyDomain(activeOrgId, d.domain);
      setRows(prev => prev.map(x => x.id === updated.id ? updated : x));
      setPendingDomain(null);
    } finally { setBusy(false); }
  };

  const remove = async (d: DomainClaim) => {
    if (!activeOrgId) return;
    if (!confirm(`Remove ${d.domain}?`)) return;
    await enterpriseApi.deleteDomain(activeOrgId, d.domain);
    setRows(prev => prev.filter(x => x.id !== d.id));
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Identity" title="Domains & auto-join" subtitle="Claim email domains so new users with matching addresses can auto-join the workspace." />

      <GlassCard padding={20}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 10 }}>Claim a domain</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: 12, alignItems: "center" }}>
          <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com" />
          <select value={autoJoinRole} onChange={e => setAutoJoinRole(e.target.value)} style={{
            padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, background: "white", fontSize: 14,
          }}>
            <option value="viewer">Auto-join as viewer</option>
            <option value="member">Auto-join as member</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: tokens.SLATE_700 }}>
            <input type="checkbox" checked={enforced} onChange={e => setEnforced(e.target.checked)} />
            Enforce SSO
          </label>
          <Button tone="primary" onClick={add} disabled={busy || !domain.trim()}>{busy ? "…" : "Add"}</Button>
        </div>
      </GlassCard>

      {pendingDomain && (
        <GlassCard padding={18} style={{ borderLeft: `4px solid ${tokens.AMBER}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.AMBER, marginBottom: 6 }}>Verify {pendingDomain.domain}</div>
          <div style={{ fontSize: 13, color: tokens.SLATE_700, marginBottom: 10 }}>Add a TXT record:</div>
          <code style={{ display: "block", padding: 12, background: tokens.SLATE_100, borderRadius: 10, fontSize: 12, wordBreak: "break-all" }}>
            _lumicoria.{pendingDomain.domain} &nbsp;TXT&nbsp; {pendingDomain.verification_token}
          </code>
          <Button tone="primary" size="sm" style={{ marginTop: 10 }} onClick={() => verify(pendingDomain)} disabled={busy}>I've added it — verify</Button>
        </GlassCard>
      )}

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /></div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No domains claimed" body="Claim your work domain to enable auto-join." /></div>
        ) : rows.map((d, idx) => (
          <div key={d.id} style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <StatusDot tone={d.verified_at ? "ok" : "warn"} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.domain}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>Auto-join as {d.auto_join_role}{d.enforced ? " · SSO enforced" : ""}</div>
            </div>
            <BrandPill tone="ghost">{d.verified_at ? "Verified" : "Pending"}</BrandPill>
            {!d.verified_at && <Button tone="outline" size="sm" onClick={() => setPendingDomain(d)}>Verify</Button>}
            <Button tone="ghost" size="sm" style={{ color: tokens.RED }} onClick={() => remove(d)}>Remove</Button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminDomains;
