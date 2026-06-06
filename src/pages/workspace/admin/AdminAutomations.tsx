import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { automationsApi, type AutomationRow } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Input, Textarea, EmptyState, Skeleton, StatusDot, BrandPill } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

export const AdminAutomations: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<AutomationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogue, setCatalogue] = useState<{ events: Array<{ type: string }>; actions: Array<{ type: string; description: string }>; condition_ops: string[] } | null>(null);
  const [name, setName] = useState("");
  const [event, setEvent] = useState("task.completed");
  const [actionType, setActionType] = useState("notify");
  const [actionConfig, setActionConfig] = useState('{"title":"Heads up","body":"A task just completed."}');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [rs, cat] = await Promise.all([
        automationsApi.list({ organization_id: activeOrgId }),
        automationsApi.catalogue(),
      ]);
      setRows(rs);
      setCatalogue(cat);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]);

  const create = async () => {
    if (!activeOrgId || !name.trim()) return;
    setBusy(true);
    try {
      let cfg: Record<string, unknown> = {};
      try { cfg = JSON.parse(actionConfig); } catch { cfg = {}; }
      const row = await automationsApi.create({
        name: name.trim(),
        trigger: { type: "event", config: { event_type: event } },
        actions: [{ type: actionType, config: cfg }],
      }, activeOrgId);
      setRows(prev => [row, ...prev]);
      setName("");
    } finally { setBusy(false); }
  };

  const toggle = async (r: AutomationRow) => {
    if (!activeOrgId) return;
    const updated = r.enabled
      ? await automationsApi.disable(r.id, activeOrgId)
      : await automationsApi.enable(r.id, activeOrgId);
    setRows(prev => prev.map(x => x.id === r.id ? updated : x));
  };

  const remove = async (r: AutomationRow) => {
    if (!activeOrgId) return;
    if (!confirm("Delete this automation?")) return;
    await automationsApi.delete(r.id, activeOrgId);
    setRows(prev => prev.filter(x => x.id !== r.id));
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Automations" title="Rules engine" subtitle="When an event fires inside this workspace, dispatch an action. Conditions and chained actions are supported." />

      <GlassCard padding={20}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 10 }}>New automation</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12 }}>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name (e.g. Notify lead on completion)" />
          <select value={event} onChange={e => setEvent(e.target.value)} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, background: "white", fontSize: 14 }}>
            {(catalogue?.events || []).map(ev => <option key={ev.type} value={ev.type}>{ev.type}</option>)}
          </select>
          <select value={actionType} onChange={e => setActionType(e.target.value)} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, background: "white", fontSize: 14 }}>
            {(catalogue?.actions || []).map(a => <option key={a.type} value={a.type}>{a.type}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Action config (JSON)</div>
          <Textarea value={actionConfig} onChange={e => setActionConfig(e.target.value)} rows={4} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }} />
        </div>
        <Button tone="primary" style={{ marginTop: 12 }} onClick={create} disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create automation"}</Button>
      </GlassCard>

      <GlassCard padding={6}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /><Skeleton height={20} style={{ marginTop: 10 }} /></div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No automations yet" body="Create one above to react to events." /></div>
        ) : rows.map((r, idx) => (
          <div key={r.id} style={{
            display: "grid", gridTemplateColumns: "auto 1.4fr 1fr auto auto auto", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: idx < rows.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <StatusDot tone={r.enabled ? "ok" : "off"} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: tokens.INK }}>{r.name}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>on {(r.trigger.config as any)?.event_type || r.trigger.type} · {r.actions.length} action(s)</div>
            </div>
            <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.run_count} runs · {r.error_count} errors</span>
            <BrandPill tone="ghost">{r.last_run_at ? new Date(r.last_run_at).toLocaleDateString() : "never"}</BrandPill>
            <Button tone="outline" size="sm" onClick={() => toggle(r)}>{r.enabled ? "Disable" : "Enable"}</Button>
            <Button tone="ghost" size="sm" style={{ color: tokens.RED }} onClick={() => remove(r)}>Delete</Button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminAutomations;
