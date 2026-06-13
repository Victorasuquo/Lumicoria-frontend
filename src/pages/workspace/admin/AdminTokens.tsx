import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi, type ApiTokenRow } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";
import { toast } from "sonner";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

export const AdminTokens: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [tokens_, setTokens] = useState<ApiTokenRow[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
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
      setSecretRevealed(false);
      setCopied(false);
      setTokens(prev => [r.token, ...prev]);
      setName(""); setPicked([]);
      toast.success("Token created. Copy it now — we won't show it again.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not create token.");
    } finally { setBusy(false); }
  };

  const rotate = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Rotate this token? The old secret will stop working immediately.")) return;
    try {
      const r = await enterpriseApi.rotateApiToken(activeOrgId, id);
      setCreatedSecret(r.plaintext_token);
      setSecretRevealed(false);
      setCopied(false);
      setTokens(prev => prev.map(t => t.id === id ? r.token : t));
      toast.success("Token rotated. Copy the new secret now.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Rotation failed.");
    }
  };

  const revoke = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Revoke this token?")) return;
    try {
      await enterpriseApi.revokeApiToken(activeOrgId, id);
      setTokens(prev => prev.filter(t => t.id !== id));
      toast.success("Token revoked.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not revoke token.");
    }
  };

  const copySecret = async () => {
    if (!createdSecret) return;
    try {
      // navigator.clipboard requires a secure context (HTTPS or localhost).
      // Fallback: select a temporary textarea + document.execCommand("copy").
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(createdSecret);
      } else {
        const ta = document.createElement("textarea");
        ta.value = createdSecret;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("Token copied to clipboard.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Select the text manually and copy.");
    }
  };

  if (!activeOrgId) return null;

  const masked = createdSecret
    ? `${createdSecret.slice(0, 6)}${"•".repeat(Math.max(createdSecret.length - 10, 12))}${createdSecret.slice(-4)}`
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Developer" title="API tokens" subtitle="Personal and service-account tokens scoped to this workspace." />

      {createdSecret && (
        <GlassCard padding={18} style={{ borderLeft: `4px solid ${tokens.PURPLE}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.PURPLE_DEEP, marginBottom: 6 }}>
            Token created — copy it now.
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: 10, background: tokens.SLATE_100, borderRadius: 10,
          }}>
            <code style={{
              flex: 1, fontSize: 12, wordBreak: "break-all",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: tokens.INK,
            }}>
              {secretRevealed ? createdSecret : masked}
            </code>
            <button
              onClick={() => setSecretRevealed(v => !v)}
              title={secretRevealed ? "Hide" : "Reveal"}
              aria-label={secretRevealed ? "Hide token" : "Reveal token"}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, borderRadius: 8, border: "none",
                background: "white", color: tokens.SLATE_600, cursor: "pointer",
                boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
              }}
            >
              {secretRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={copySecret}
              title="Copy"
              aria-label="Copy token"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 8, border: "none",
                background: copied ? `${tokens.GREEN}` : tokens.PURPLE,
                color: "white", cursor: "pointer", fontWeight: 700, fontSize: 12,
                boxShadow: "0 4px 12px rgba(108,74,176,0.25)",
                transition: "background 120ms ease",
              }}
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 8 }}>
            This is the only time we will show it. Store it in a secret manager.
          </div>
          <div style={{ marginTop: 10 }}>
            <Button tone="outline" size="sm" onClick={() => { setCreatedSecret(null); setSecretRevealed(false); }}>Done</Button>
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
