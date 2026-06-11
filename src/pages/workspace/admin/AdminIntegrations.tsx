import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import api from "@/services/api";
import {
  GlassCard, SectionHeader, Button, BrandPill, StatusDot, EmptyState, Skeleton,
} from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

interface Provider { key: string; name: string; category: string; }
interface Connection {
  id: string;
  provider: string;
  scope_type: string;
  scope_id: string;
  status: string;
  sync_status?: string;
  last_sync_at?: string | null;
  created_at: string;
}

export const AdminIntegrations: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [catalogue, my] = await Promise.all([
        api.get("/integrations-v2/catalogue").then(r => r.data),
        api.get(`/integrations-v2/me/connected?organization_id=${activeOrgId}`).then(r => r.data),
      ]);
      setProviders(catalogue.providers || []);
      setConnections(my || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const connect = async (key: string) => {
    if (!activeOrgId) return;
    setBusyKey(key);
    try {
      const { data } = await api.post(
        `/integrations-v2/${key}/org/${activeOrgId}/oauth/start?organization_id=${activeOrgId}`,
        { return_url: window.location.href },
      );
      // In production: redirect to the provider auth URL.  For now we
      // surface the state so the team can wire each provider's OAuth flow.
      alert(`OAuth state issued. Hand off to ${key}:\n${data.authorize_url_hint}`);
    } finally { setBusyKey(null); }
  };

  const disconnect = async (provider: string) => {
    if (!activeOrgId || !confirm(`Disconnect ${provider}?`)) return;
    await api.delete(`/integrations-v2/${provider}/org/${activeOrgId}?organization_id=${activeOrgId}`);
    setConnections(prev => prev.filter(c => c.provider !== provider));
  };

  const triggerSync = async (provider: string) => {
    if (!activeOrgId) return;
    await api.post(`/integrations-v2/${provider}/org/${activeOrgId}/sync?organization_id=${activeOrgId}`);
    await load();
  };

  if (!activeOrgId) return null;
  const connectedByProvider = new Map(connections.map(c => [c.provider, c]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        eyebrow="Connections"
        title="Integrations"
        subtitle="Connect Slack, Microsoft Teams, Google Workspace, Notion, Linear, Jira, GitHub, and the rest of your stack to this workspace."
      />

      {/* Active connections */}
      {connections.length > 0 && (
        <GlassCard padding={6}>
          {connections.map((c, idx) => (
            <div key={c.id} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 14, alignItems: "center",
              padding: "14px 18px",
              borderBottom: idx < connections.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
            }}>
              <StatusDot tone="ok" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: tokens.INK, textTransform: "capitalize" }}>
                  {c.provider.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>
                  Connected · {c.sync_status || "idle"}{c.last_sync_at ? ` · last sync ${new Date(c.last_sync_at).toLocaleString()}` : ""}
                </div>
              </div>
              <BrandPill tone="ghost">{c.scope_type}</BrandPill>
              <Button tone="outline" size="sm" onClick={() => triggerSync(c.provider)}>Sync now</Button>
              <Button tone="ghost" size="sm" style={{ color: tokens.RED }} onClick={() => disconnect(c.provider)}>Disconnect</Button>
            </div>
          ))}
        </GlassCard>
      )}

      {/* Catalogue grid */}
      <SectionHeader title="Catalogue" subtitle="Tap a provider to start the connection flow." />
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => <GlassCard key={i} padding={20}><Skeleton height={20} /><Skeleton height={14} style={{ marginTop: 10 }} /></GlassCard>)}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState title="Catalogue unavailable" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {providers.map(p => {
            const connected = connectedByProvider.has(p.key);
            return (
              <GlassCard key={p.key} padding={18}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{p.category}</span>
                  {connected && <StatusDot tone="ok" />}
                </div>
                <div style={{ fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 16, color: tokens.INK }}>{p.name}</div>
                <div style={{ marginTop: 12 }}>
                  {connected ? (
                    <Button tone="outline" size="sm" onClick={() => disconnect(p.key)}>Disconnect</Button>
                  ) : (
                    <Button tone="primary" size="sm" disabled={busyKey === p.key} onClick={() => connect(p.key)}>
                      {busyKey === p.key ? "Starting…" : "Connect"}
                    </Button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminIntegrations;
