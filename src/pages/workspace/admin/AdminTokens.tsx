import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi, type ApiTokenRow } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

export const AdminTokens: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [tokens_, setTokens] = useState<ApiTokenRow[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        enterpriseApi.listApiTokens(activeOrgId),
        enterpriseApi.scopes(),
      ]);
      setTokens(t); setScopes(s.scopes);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const create = async () => {
    if (!activeOrgId || !name.trim()) return;
    setBusy(true);
    try {
      const r = await enterpriseApi.createApiToken(activeOrgId, { name: name.trim(), scopes: picked });
      setCreatedSecret(r.plaintext_token);
      setTokens(prev => [r.token, ...prev]);
      setName(""); setPicked([]);
    } finally { setBusy(false); }
  };

  const rotate = async (id: string) => {
    if (!activeOrgId) return;
    const r = await enterpriseApi.rotateApiToken(activeOrgId, id);
    setCreatedSecret(r.plaintext_token);
    setTokens(prev => prev.map(t => t.id === id ? r.token : t));
  };

  const revoke = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Revoke this token?")) return;
    await enterpriseApi.revokeApiToken(activeOrgId, id);
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Developer" title="API tokens" subtitle="Personal and service-account tokens scoped to this workspace." />

      {createdSecret && (
        <GlassCard padding={18} style={{ borderLeft: `4px solid ${tokens.PURPLE}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.PURPLE_DEEP, marginBottom: 6 }}>Token created — copy it now.</div>
          <code style={{ display: "block", padding: 10, background: tokens.SLATE_100, borderRadius: 10, fontSize: 12, wordBreak: "break-all" }}>{createdSecret}</code>
          <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 8 }}>This is the only time we will show it. Store it in a secret manager.</div>
          <div style={{ marginTop: 10 }}>
            <Button tone="outline" size="sm" onClick={() => setCreatedSecret(null)}>Done</Button>
          </div>
        </GlassCard>
      )}

      <GlassCard padding={20}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 10 }}>Create token</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Token name (e.g. Zapier connector)" />
          <Button tone="primary" onClick={create} disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create token"}</Button>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Scopes</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {scopes.map(s => (
              <button key={s} onClick={() => setPicked(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{
                padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                background: picked.includes(s) ? `${tokens.PURPLE}14` : "rgba(255,255,255,0.65)",
                color: picked.includes(s) ? tokens.PURPLE_DEEP : tokens.SLATE_600,
                border: `1px solid ${picked.includes(s) ? tokens.PURPLE : tokens.SLATE_200}`,
                cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></div>
        ) : tokens_.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No tokens yet" body="Create your first API token above." /></div>
        ) : tokens_.map((t, idx) => (
          <div key={t.id} style={{
            display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: idx < tokens_.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: tokens.INK }}>{t.name}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{t.prefix}… · {t.scopes.length} scopes</div>
            </div>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{t.last_used_at ? `Last used ${new Date(t.last_used_at).toLocaleDateString()}` : "Never used"}</span>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{t.expires_at ? `Expires ${new Date(t.expires_at).toLocaleDateString()}` : "No expiry"}</span>
            <Button tone="outline" size="sm" onClick={() => rotate(t.id)}>Rotate</Button>
            <Button tone="ghost" size="sm" onClick={() => revoke(t.id)} style={{ color: tokens.RED }}>Revoke</Button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminTokens;
