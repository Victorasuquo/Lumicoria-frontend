import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

interface ScimTokenRow { id: string; prefix: string; name?: string; last_used_at?: string | null; revoked_at?: string | null; created_at?: string; }

export const AdminScim: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<ScimTokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Okta connector");
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try { setRows((await enterpriseApi.listScimTokens(activeOrgId)) as ScimTokenRow[]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const create = async () => {
    if (!activeOrgId || !name.trim()) return;
    setBusy(true);
    try {
      const r = await enterpriseApi.createScimToken(activeOrgId, name.trim());
      setSecret(r.plaintext_token);
      setRows(prev => [r.token as ScimTokenRow, ...prev]);
    } finally { setBusy(false); }
  };

  const revoke = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Revoke this SCIM token?")) return;
    await enterpriseApi.revokeScimToken(activeOrgId, id);
    setRows(prev => prev.filter(r => r.id !== id));
  };

  if (!activeOrgId) return null;

  const scimBase = `${window.location.origin.replace(":8080", ":8000")}/api/v1/scim/v2`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Identity" title="SCIM provisioning" subtitle="Auto-provision and de-provision users from Okta, Azure AD, OneLogin, or any SCIM 2.0 IdP." />

      <GlassCard padding={20}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 8 }}>SCIM base URL</h3>
        <code style={{ display: "block", padding: 12, background: tokens.SLATE_100, borderRadius: 12, fontSize: 12, wordBreak: "break-all" }}>{scimBase}</code>
      </GlassCard>

      {secret && (
        <GlassCard padding={18} style={{ borderLeft: `4px solid ${tokens.PURPLE}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.PURPLE_DEEP, marginBottom: 6 }}>Bearer token created — copy it now.</div>
          <code style={{ display: "block", padding: 10, background: tokens.SLATE_100, borderRadius: 10, fontSize: 12, wordBreak: "break-all" }}>{secret}</code>
          <Button tone="outline" size="sm" style={{ marginTop: 10 }} onClick={() => setSecret(null)}>Done</Button>
        </GlassCard>
      )}

      <GlassCard padding={20}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 10 }}>Issue token</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Token name (e.g. Okta)" />
          <Button tone="primary" onClick={create} disabled={busy || !name.trim()}>{busy ? "Issuing…" : "Issue bearer token"}</Button>
        </div>
      </GlassCard>

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /></div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No SCIM tokens yet" body="Issue a token above and paste it into your IdP." /></div>
        ) : rows.map((r, idx) => (
          <div key={r.id} style={{
            display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.INK }}>{r.name || "SCIM token"}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.prefix}…</div>
            </div>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.last_used_at ? `Last used ${new Date(r.last_used_at).toLocaleDateString()}` : "Never used"}</span>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.created_at ? `Created ${new Date(r.created_at).toLocaleDateString()}` : ""}</span>
            <Button tone="ghost" size="sm" style={{ color: tokens.RED }} onClick={() => revoke(r.id)}>Revoke</Button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminScim;
