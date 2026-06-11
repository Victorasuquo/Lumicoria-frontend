import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/services/api";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, BrandPill,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT } from "@/components/workspace/tokens";

interface OrgBranding {
  primary_color?: string;
  accent_color?: string;
  logo_url?: string | null;
  email_footer?: string;
  favicon_url?: string | null;
}

export const AdminBranding: React.FC = () => {
  const { activeOrgId, activeOrg } = useWorkspace();
  const [branding, setBranding] = useState<OrgBranding>({
    primary_color: tokens.PURPLE, accent_color: tokens.SKY,
  });
  const [emailBranding, setEmailBranding] = useState<{ primary_color?: string; footer_text?: string }>({
    primary_color: tokens.PURPLE, footer_text: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    Promise.all([
      api.get(`/organizations/${activeOrgId}/branding`).then(r => r.data).catch(() => null),
      api.get(`/emails/branding/${activeOrgId}`).then(r => r.data).catch(() => null),
    ]).then(([b, e]) => {
      if (b?.branding) setBranding({ ...b.branding, logo_url: b.logo_url });
      if (e) setEmailBranding(e);
    }).finally(() => setLoading(false));
  }, [activeOrgId]);

  const save = async () => {
    if (!activeOrgId) return;
    setBusy(true); setMsg(null);
    try {
      await api.patch(`/organizations/${activeOrgId}/branding`, branding);
      await api.patch(`/emails/branding/${activeOrgId}`, emailBranding);
      setMsg("Saved.");
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "Save failed.");
    } finally { setBusy(false); }
  };

  if (!activeOrgId) return null;
  if (loading) return <GlassCard padding={20}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></GlassCard>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        eyebrow="Brand"
        title="Workspace branding"
        subtitle="Colours, logo, and email footer applied across the in-app surface and transactional emails."
      />

      {/* Preview card */}
      <GlassCard padding={28} style={{
        background: `linear-gradient(135deg, ${branding.primary_color || tokens.PURPLE} 0%, ${branding.accent_color || tokens.SKY} 100%)`,
        color: "white",
      }}>
        <BrandPill tone="outline" style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.35)", color: "white" }}>Preview</BrandPill>
        <h2 style={{
          margin: "10px 0 8px", fontFamily: tokens.DISPLAY_STACK,
          fontWeight: 700, fontSize: 32, letterSpacing: -0.6,
        }}>{activeOrg?.name || "Workspace"}</h2>
        <p style={{ margin: 0, opacity: 0.92, fontSize: 14 }}>
          This is how a hero card would feel with your brand colours.
        </p>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard padding={22}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>App colours</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Primary</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={branding.primary_color || tokens.PURPLE}
                  onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))}
                  style={{ width: 42, height: 38, border: `1px solid ${tokens.SLATE_200}`, borderRadius: 10, padding: 0, cursor: "pointer" }} />
                <Input value={branding.primary_color || ""} onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value }))} />
              </div>
            </label>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Accent</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={branding.accent_color || tokens.SKY}
                  onChange={e => setBranding(b => ({ ...b, accent_color: e.target.value }))}
                  style={{ width: 42, height: 38, border: `1px solid ${tokens.SLATE_200}`, borderRadius: 10, padding: 0, cursor: "pointer" }} />
                <Input value={branding.accent_color || ""} onChange={e => setBranding(b => ({ ...b, accent_color: e.target.value }))} />
              </div>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Logo URL</div>
              <Input value={branding.logo_url || ""} onChange={e => setBranding(b => ({ ...b, logo_url: e.target.value }))} placeholder="https://" />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Favicon URL</div>
              <Input value={branding.favicon_url || ""} onChange={e => setBranding(b => ({ ...b, favicon_url: e.target.value }))} placeholder="https://" />
            </label>
          </div>
        </GlassCard>

        <GlassCard padding={22}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Transactional email</h3>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Email accent colour</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="color" value={emailBranding.primary_color || tokens.PURPLE}
                onChange={e => setEmailBranding(b => ({ ...b, primary_color: e.target.value }))}
                style={{ width: 42, height: 38, border: `1px solid ${tokens.SLATE_200}`, borderRadius: 10, padding: 0, cursor: "pointer" }} />
              <Input value={emailBranding.primary_color || ""} onChange={e => setEmailBranding(b => ({ ...b, primary_color: e.target.value }))} />
            </div>
          </label>
          <label style={{ display: "block", marginTop: 12 }}>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Footer text</div>
            <Textarea value={emailBranding.footer_text || ""} onChange={e => setEmailBranding(b => ({ ...b, footer_text: e.target.value }))}
              rows={3} placeholder="© Your Company. All rights reserved." />
          </label>
        </GlassCard>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Button tone="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save branding"}</Button>
        {msg && <span style={{ color: tokens.SLATE_600, fontSize: 13 }}>{msg}</span>}
      </div>
    </div>
  );
};

export default AdminBranding;
