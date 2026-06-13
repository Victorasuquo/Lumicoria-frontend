import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi, type WebhookRow } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, EmptyState, Skeleton, BrandPill, StatusDot } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";
import { toast } from "sonner";

const EVENTS = [
  "task.created", "task.completed", "project.created", "team.created",
  "agent.run_completed", "agent.run_failed", "invite.accepted", "org.seat_assigned",
  "comment.created", "automation.test",
];

export const AdminWebhooks: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [pickedEvents, setPickedEvents] = useState<string[]>(["task.completed", "agent.run_completed"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try { setRows(await enterpriseApi.listWebhooks(activeOrgId)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const create = async () => {
    if (!activeOrgId || !url.trim() || pickedEvents.length === 0) return;
    setBusy(true);
    try {
      const r = await enterpriseApi.createWebhook(activeOrgId, { url: url.trim(), events: pickedEvents });
      setRows(prev => [r.webhook, ...prev]);
      setSecret(r.signing_secret);
      setUrl("");
      toast.success("Webhook created.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not add webhook.");
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!activeOrgId) return;
    if (!confirm("Delete this webhook?")) return;
    try {
      await enterpriseApi.deleteWebhook(activeOrgId, id);
      setRows(prev => prev.filter(r => r.id !== id));
      toast.success("Webhook deleted.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not delete webhook.");
    }
  };

  const [pingingId, setPingingId] = useState<string | null>(null);
  const ping = async (id: string) => {
    if (!activeOrgId) return;
    setPingingId(id);
    try {
      const res: any = await enterpriseApi.testWebhook(activeOrgId, id);
      const status = res?.status_code ?? res?.delivery?.status_code;
      const ok = res?.delivered === true
        || (typeof status === "number" && status >= 200 && status < 300);
      if (ok) {
        toast.success(`Test delivered${status ? ` · HTTP ${status}` : ""}`);
      } else if (status) {
        toast.error(`Endpoint replied HTTP ${status}`);
      } else {
        toast.success("Test event queued. Check your endpoint's recent deliveries.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Send test failed.");
    } finally {
      setPingingId(null);
    }
  };

  const toggle = async (r: WebhookRow) => {
    if (!activeOrgId) return;
    try {
      const updated = await enterpriseApi.patchWebhook(activeOrgId, r.id, { enabled: !r.enabled });
      setRows(prev => prev.map(x => x.id === r.id ? updated : x));
      toast.success(updated.enabled ? "Webhook resumed." : "Webhook paused.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not change state.");
    }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Developer" title="Webhooks" subtitle="Stream workspace events to your own systems. Every delivery is signed with HMAC-SHA256." />

      {secret && (
        <GlassCard padding={18} style={{ borderLeft: `4px solid ${tokens.PURPLE}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.PURPLE_DEEP, marginBottom: 6 }}>Signing secret created — copy it now.</div>
          <code style={{ display: "block", padding: 10, background: tokens.SLATE_100, borderRadius: 10, fontSize: 12, wordBreak: "break-all" }}>{secret}</code>
          <Button tone="outline" size="sm" style={{ marginTop: 10 }} onClick={() => setSecret(null)}>Done</Button>
        </GlassCard>
      )}

      <GlassCard padding={20}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 10 }}>Add webhook</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/lumicoria-webhook" />
          <Button tone="primary" onClick={create} disabled={busy || !url.trim() || pickedEvents.length === 0}>{busy ? "Adding…" : "Add webhook"}</Button>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Events</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EVENTS.map(s => (
              <button key={s} onClick={() => setPickedEvents(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{
                padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                background: pickedEvents.includes(s) ? `${tokens.PURPLE}14` : "rgba(255,255,255,0.65)",
                color: pickedEvents.includes(s) ? tokens.PURPLE_DEEP : tokens.SLATE_600,
                border: `1px solid ${pickedEvents.includes(s) ? tokens.PURPLE : tokens.SLATE_200}`,
                cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No webhooks yet" body="Add an endpoint above to start receiving events." /></div>
        ) : rows.map((r, idx) => (
          <div key={r.id} style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto auto auto auto", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <StatusDot tone={r.enabled ? "ok" : "off"} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.url}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.events.length} events · {r.failure_count} failures</div>
            </div>
            <BrandPill tone="ghost">{r.enabled ? "Live" : "Paused"}</BrandPill>
            <Button tone="outline" size="sm" onClick={() => toggle(r)}>{r.enabled ? "Pause" : "Resume"}</Button>
            <Button tone="ghost" size="sm" disabled={pingingId === r.id} onClick={() => ping(r.id)}>
              {pingingId === r.id ? "Sending…" : "Send test"}
            </Button>
            <Button tone="ghost" size="sm" style={{ color: tokens.RED }} onClick={() => remove(r.id)}>Delete</Button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminWebhooks;
