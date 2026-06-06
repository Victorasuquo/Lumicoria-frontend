import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi, type SsoConfig } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, Textarea, BrandPill, Skeleton } from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT } from "@/components/workspace/tokens";

export const AdminSso: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [cfg, setCfg] = useState<SsoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    enterpriseApi.getSso(activeOrgId).then(c => setCfg(c)).finally(() => setLoading(false));
  }, [activeOrgId]);

  const save = async (patch: Partial<SsoConfig>) => {
    if (!activeOrgId) return;
    setBusy(true); setMsg(null);
    try {
      const c = await enterpriseApi.patchSso(activeOrgId, patch);
      setCfg(c); setMsg("Saved.");
    } catch (e: any) { setMsg(e?.response?.data?.detail || "Save failed"); }
    finally { setBusy(false); }
  };

  if (!activeOrgId) return null;
  if (loading || !cfg) return <GlassCard padding={20}><Skeleton height={20} /></GlassCard>;

  const spMetadataUrl = `${window.location.origin.replace(":8080", ":8000")}/api/v1/enterprise/sso/metadata.xml?org_id=${activeOrgId}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        eyebrow="Identity"
        title="SSO (SAML 2.0)"
        subtitle="Connect Okta, Azure AD, or any SAML 2.0 IdP. Add this workspace's SP metadata to your IdP and paste their assertion URL here."
        right={<BrandPill tone={cfg.enabled ? "primary" : "outline"}>{cfg.enabled ? "Enabled" : "Disabled"}</BrandPill>}
      />

      <GlassCard padding={22}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 8 }}>SP metadata</h3>
        <p style={{ color: tokens.SLATE_600, fontSize: 13, marginBottom: 12 }}>Hand this URL to your IdP team to register Lumicoria as a Service Provider.</p>
        <code style={{ display: "block", padding: 12, background: tokens.SLATE_100, borderRadius: 12, fontSize: 12, wordBreak: "break-all" }}>{spMetadataUrl}</code>
        <div style={{ marginTop: 12 }}>
          <Button tone="outline" size="sm" onClick={() => navigator.clipboard?.writeText(spMetadataUrl)}>Copy URL</Button>
        </div>
      </GlassCard>

      <GlassCard padding={22}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 }}>IdP configuration</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>IdP entity ID</div>
            <Input value={cfg.entity_id || ""} onChange={e => setCfg({ ...cfg, entity_id: e.target.value })} placeholder="urn:auth.example.com" />
          </label>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>SSO URL (from IdP)</div>
            <Input value={cfg.sso_url || ""} onChange={e => setCfg({ ...cfg, sso_url: e.target.value })} placeholder="https://example.okta.com/app/.../sso/saml" />
          </label>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Default role for new users</div>
            <select value={cfg.default_role || "member"} onChange={e => setCfg({ ...cfg, default_role: e.target.value })} style={{
              width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white", fontFamily: tokens.BODY_STACK,
            }}>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>x509 certificate (PEM)</div>
            <Textarea value={cfg.certificate || ""} onChange={e => setCfg({ ...cfg, certificate: e.target.value })} rows={6} placeholder="-----BEGIN CERTIFICATE-----" />
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
          <Button tone="primary" disabled={busy} onClick={() => save({
            entity_id: cfg.entity_id, sso_url: cfg.sso_url, certificate: cfg.certificate,
            default_role: cfg.default_role, enabled: true,
          })}>{busy ? "Saving…" : "Save & enable"}</Button>
          <Button tone="ghost" disabled={busy} onClick={() => save({ enabled: false })}>Disable SSO</Button>
          {msg && <span style={{ color: tokens.SLATE_600, fontSize: 13 }}>{msg}</span>}
        </div>
      </GlassCard>

      <GlassCard padding={20}>
        <BrandPill tone="outline">Heads up</BrandPill>
        <p style={{ color: tokens.SLATE_600, fontSize: 13, marginTop: 8, marginBottom: 0 }}>
          The SAML assertion endpoint is registered with your IdP but the Lumicoria-side assertion verifier is rolling out in a follow-up pass.
          You can complete metadata exchange today; user provisioning over SCIM works in parallel.
        </p>
      </GlassCard>
    </div>
  );
};

export default AdminSso;
