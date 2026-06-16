/**
 * /workspace/notifications/rules — notification rules + digest preview
 * + topics + per-resource subscriptions.  Powered by notificationsV2Api.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Bell, Mail, Smartphone, Webhook } from "lucide-react";
import notificationsV2Api, { type NotificationRule } from "@/services/notificationsV2Api";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, OrbEmptyState, Toolbar, FilterChips, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

const CHANNEL_ICON = {
  email: Mail, push: Smartphone, in_app: Bell, webhook: Webhook,
} as const;

const CHANNEL_OPTS = [
  { id: "email", label: "Email" },
  { id: "push", label: "Push" },
  { id: "in_app", label: "In-app" },
  { id: "webhook", label: "Webhook" },
];

export const NotificationRules: React.FC = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [unreadByCategory, setUnreadByCategory] = useState<Record<string, number>>({});
  const [digest, setDigest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<Partial<NotificationRule>>({ channel: "in_app" });

  const load = async () => {
    setLoading(true);
    await Promise.all([
      notificationsV2Api.listRules().then(setRules).catch(() => setRules([])),
      notificationsV2Api.listTopics().then((d: any) => setTopics(d?.topics || [])).catch(() => setTopics([])),
      notificationsV2Api.listSubscriptions().then((d: any) => setSubscribedTopics((d || []).map((s: any) => s.topic).filter(Boolean))).catch(() => setSubscribedTopics([])),
      notificationsV2Api.unreadByCategory().then(setUnreadByCategory).catch(() => setUnreadByCategory({})),
      notificationsV2Api.digestPreview().then(setDigest).catch(() => setDigest(null)),
    ]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const createRule = async () => {
    if (!draft.name || !draft.channel) { toast.error("Name + channel required."); return; }
    try {
      const row = await notificationsV2Api.createRule(draft as any);
      setRules(prev => [row, ...prev]);
      setShowNew(false); setDraft({ channel: "in_app" });
      toast.success("Rule created.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Create failed."); }
  };

  const toggleRule = async (r: NotificationRule) => {
    try {
      if (r.enabled) await notificationsV2Api.disableRule(r.id);
      else await notificationsV2Api.enableRule(r.id);
      setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: !x.enabled } : x));
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Toggle failed."); }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    try {
      await notificationsV2Api.deleteRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success("Rule deleted.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Delete failed."); }
  };

  const toggleTopic = async (topic: string) => {
    if (subscribedTopics.includes(topic)) {
      try { await notificationsV2Api.unsubscribeTopic(topic); setSubscribedTopics(prev => prev.filter(t => t !== topic)); }
      catch (e: any) { toast.error(e?.response?.data?.detail || "Failed"); }
    } else {
      try { await notificationsV2Api.subscribeTopic(topic); setSubscribedTopics(prev => [...prev, topic]); }
      catch (e: any) { toast.error(e?.response?.data?.detail || "Failed"); }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Notifications"
        title="Rules, topics, digests"
        subtitle="Tune what gets delivered, where, and how often."
      />

      {/* Unread by category */}
      {Object.keys(unreadByCategory).length > 0 && (
        <CardGrid minCol={160} gap={12}>
          {Object.entries(unreadByCategory).map(([cat, count]) => (
            <GlassCard key={cat} padding={14}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>{cat}</div>
              <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 28, fontWeight: 700, marginTop: 4 }}>{count}</div>
              <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 2 }}>unread</div>
            </GlassCard>
          ))}
        </CardGrid>
      )}

      {/* Rules */}
      <SectionHeader title="Rules" right={<Button tone="primary" onClick={() => setShowNew(s => !s)}><Plus size={14} /> New rule</Button>} />
      {showNew && (
        <GlassCard padding={18}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input placeholder="Rule name" value={draft.name || ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
            <select value={draft.channel} onChange={e => setDraft(d => ({ ...d, channel: e.target.value as any }))}
              style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white" }}>
              <option value="in_app">In-app</option>
              <option value="email">Email</option>
              <option value="push">Push</option>
              <option value="webhook">Webhook</option>
            </select>
            <Input placeholder="Category (e.g. task.completed)" value={draft.category || ""} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button tone="primary" onClick={createRule}>Create</Button>
            <Button tone="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard padding={20}><Skeleton height={16} /><Skeleton height={16} style={{ marginTop: 10 }} /></GlassCard>
      ) : rules.length === 0 ? (
        <OrbEmptyState title="No rules yet" body="Rules decide which events get delivered, to which channel." action={<Button tone="primary" onClick={() => setShowNew(true)}>Create your first rule</Button>} />
      ) : (
        <GlassCard padding={6}>
          {rules.map((r, i) => {
            const Icon = CHANNEL_ICON[r.channel] || Bell;
            return (
              <motion.div key={r.id} {...STAGGER_FAST(i)} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center",
                padding: "12px 16px", borderBottom: i < rules.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
              }}>
                <Icon size={18} color={tokens.PURPLE} />
                <div>
                  <div style={{ fontWeight: 600, color: tokens.INK }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{r.category || "any category"} · {r.channel}</div>
                </div>
                <button onClick={() => toggleRule(r)} style={{
                  border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 999,
                  background: r.enabled ? `${tokens.GREEN}1A` : tokens.SLATE_100,
                  color: r.enabled ? tokens.GREEN : tokens.SLATE_600, fontWeight: 700, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase",
                }}>{r.enabled ? "On" : "Off"}</button>
                <button onClick={() => deleteRule(r.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><Trash2 size={14} /></button>
              </motion.div>
            );
          })}
        </GlassCard>
      )}

      {/* Topics */}
      <SectionHeader title="Topics" subtitle="Subscribe / unsubscribe from broadcast topics." />
      {topics.length === 0 ? (
        <GlassCard padding={20} style={{ color: tokens.SLATE_500, fontSize: 13 }}>No topics published yet.</GlassCard>
      ) : (
        <Toolbar
          left={
            <FilterChips
              options={topics.map(t => ({ id: t, label: t }))}
              value={subscribedTopics}
              onChange={() => { /* handled in toggle */ }}
              multi
            />
          }
          right={
            <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
              {topics.map(t => (
                <button key={t} onClick={() => toggleTopic(t)} style={{
                  border: `1px solid ${subscribedTopics.includes(t) ? tokens.PURPLE : tokens.SLATE_200}`,
                  background: subscribedTopics.includes(t) ? `${tokens.PURPLE}10` : "white",
                  color: subscribedTopics.includes(t) ? tokens.PURPLE_DEEP : tokens.SLATE_700,
                  padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
          }
        />
      )}

      {/* Digest preview */}
      {digest && (
        <>
          <SectionHeader title="Digest preview" subtitle="Pre-render of your next scheduled digest." />
          <GlassCard padding={20}>
            <pre style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12, color: tokens.SLATE_700, whiteSpace: "pre-wrap",
              maxHeight: 320, overflow: "auto", margin: 0,
            }}>{JSON.stringify(digest, null, 2)}</pre>
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default NotificationRules;
