/**
 * /workspace/admin/emails — email templates, sent log, branding,
 * sending domains, tracking opt-out.  Powered by emailsApi.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, RefreshCcw, Trash2, Plus, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import emailsApi, { type EmailTemplate, type SentEmailRow } from "@/services/emailsApi";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, OrbEmptyState, FilterChips, Toolbar, BrandPill, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

const TABS = [
  { id: "templates", label: "Templates" },
  { id: "sent", label: "Sent log" },
  { id: "domains", label: "Sending domains" },
  { id: "branding", label: "Branding" },
  { id: "deliverability", label: "Deliverability" },
];

export const AdminEmails: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [tab, setTab] = useState("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sent, setSent] = useState<SentEmailRow[]>([]);
  const [domains, setDomains] = useState<Array<{ domain: string; verified_at?: string; dkim?: any; spf?: any }>>([]);
  const [branding, setBranding] = useState<any>({});
  const [deliverability, setDeliverability] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [testTo, setTestTo] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [t, s, d, b, dl] = await Promise.all([
        emailsApi.templates().catch(() => []),
        emailsApi.sent({ limit: 100 }).catch(() => []),
        emailsApi.sendingDomains(activeOrgId).catch(() => []),
        emailsApi.getBranding(activeOrgId).catch(() => ({})),
        emailsApi.deliverability(activeOrgId).catch(() => ({})),
      ]);
      setTemplates(t as any); setSent(s as any);
      setDomains(Array.isArray(d) ? (d as any) : []);
      setBranding(b); setDeliverability(dl);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const openPreview = async (key: string) => {
    setPreviewKey(key); setPreview(null);
    try { setPreview(await emailsApi.previewWithSampleData(key)); }
    catch { toast.error("Preview failed."); }
  };

  const testSend = async (key: string) => {
    if (!testTo.trim()) { toast.error("Enter a destination email."); return; }
    try { await emailsApi.testSend({ template_key: key, to: testTo }); toast.success(`Test sent to ${testTo}.`); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Send failed."); }
  };

  const addDomain = async () => {
    if (!activeOrgId || !newDomain.trim()) return;
    try {
      const row: any = await emailsApi.addSendingDomain(activeOrgId, { domain: newDomain.trim() });
      setDomains(prev => [row, ...prev]); setNewDomain("");
      toast.success("Domain added. Verify the DNS records.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  const verifyDomain = async (domain: string) => {
    if (!activeOrgId) return;
    try { const row: any = await emailsApi.verifySendingDomain(activeOrgId, domain);
      setDomains(prev => prev.map(d => d.domain === domain ? { ...d, ...row } : d));
      toast.success("Verification updated."); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Verify failed."); }
  };

  const removeDomain = async (domain: string) => {
    if (!activeOrgId || !confirm(`Remove sending domain ${domain}?`)) return;
    try { await emailsApi.deleteSendingDomain(activeOrgId, domain);
      setDomains(prev => prev.filter(d => d.domain !== domain)); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Email"
        subtitle="Transactional templates, sending domains, branding, and deliverability."
      />

      <Toolbar left={<FilterChips options={TABS} value={tab} onChange={v => setTab(v as string)} />} />

      {tab === "templates" && (
        loading ? <GlassCard padding={20}><Skeleton height={16} /></GlassCard> :
        templates.length === 0 ? <OrbEmptyState title="No templates" body="Backend ships standard templates by default." /> :
        <CardGrid minCol={280} gap={12}>
          {templates.map((t, i) => (
            <motion.div key={t.key} {...STAGGER_FAST(i)}>
              <GlassCard padding={16}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 14 }}>{t.subject || t.key}</div>
                    <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 4 }}>{t.category || "transactional"} · {t.key}</div>
                    {t.preview_text && <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 8, lineHeight: 1.5 }}>{t.preview_text}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Button tone="outline" size="sm" onClick={() => openPreview(t.key)}>Preview</Button>
                  <Button tone="ghost" size="sm" onClick={() => testSend(t.key)}><Send size={12} /> Test send</Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </CardGrid>
      )}

      {tab === "templates" && previewKey && (
        <GlassCard padding={18}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Preview · {previewKey}</h3>
            <Button tone="ghost" size="sm" onClick={() => { setPreviewKey(null); setPreview(null); }}>Close</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12 }}>
            <iframe
              title="email-preview" srcDoc={preview?.html || "<i>Loading…</i>"}
              style={{ width: "100%", height: 480, border: `1px solid ${tokens.SLATE_200}`, borderRadius: 12, background: "white" }}
            />
            <div>
              <Input placeholder="Send test to email…" value={testTo} onChange={e => setTestTo(e.target.value)} />
              <Button tone="primary" onClick={() => testSend(previewKey)} style={{ marginTop: 8, width: "100%" }}><Send size={14} /> Send test</Button>
            </div>
          </div>
        </GlassCard>
      )}

      {tab === "sent" && (
        loading ? <GlassCard padding={20}><Skeleton height={16} /></GlassCard> :
        sent.length === 0 ? <OrbEmptyState title="No sent emails" body="The log will populate as your workspace sends transactional mail." /> :
        <GlassCard padding={6}>
          {sent.map((s, i) => (
            <motion.div key={s.id} {...STAGGER_FAST(i)} style={{
              display: "grid", gridTemplateColumns: "1fr 240px 100px 160px auto",
              gap: 10, alignItems: "center", padding: "11px 16px",
              borderBottom: i < sent.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
            }}>
              <div>
                <div style={{ fontWeight: 600, color: tokens.INK, fontSize: 13 }}>{s.subject}</div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{s.template_key || "ad-hoc"}</div>
              </div>
              <span style={{ fontSize: 12, color: tokens.SLATE_700 }}>{s.to}</span>
              <BrandPill tone="ghost" style={{ fontSize: 11 }}>{s.status}</BrandPill>
              <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{new Date(s.sent_at).toLocaleString()}</span>
              <Button tone="ghost" size="sm" onClick={() => emailsApi.resend(s.id).then(() => toast.success("Resent.")).catch(() => toast.error("Failed."))}><RefreshCcw size={12} /></Button>
            </motion.div>
          ))}
        </GlassCard>
      )}

      {tab === "domains" && (
        <>
          <Toolbar
            left={<Input placeholder="domain.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} />}
            right={<Button tone="primary" onClick={addDomain} disabled={!newDomain.trim()}><Plus size={14} /> Add domain</Button>}
          />
          {domains.length === 0 ? <OrbEmptyState title="No sending domains" body="Add one to send branded mail from your own domain." /> :
            <GlassCard padding={6}>
              {domains.map((d, i) => (
                <div key={d.domain} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto auto",
                  gap: 10, padding: "12px 16px", alignItems: "center",
                  borderBottom: i < domains.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: tokens.INK }}>{d.domain}</div>
                    <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{d.verified_at ? `Verified ${new Date(d.verified_at).toLocaleDateString()}` : "Pending verification"}</div>
                  </div>
                  {d.verified_at && <CheckCircle2 size={16} color={tokens.GREEN} />}
                  <Button tone="outline" size="sm" onClick={() => verifyDomain(d.domain)}>Verify</Button>
                  <Button tone="ghost" size="sm" onClick={() => removeDomain(d.domain)} style={{ color: tokens.RED }}><Trash2 size={12} /></Button>
                </div>
              ))}
            </GlassCard>}
        </>
      )}

      {tab === "branding" && (
        <GlassCard padding={20}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Email branding</h3>
          <p style={{ color: tokens.SLATE_600, fontSize: 13, margin: "6px 0 16px" }}>Currently applied to every transactional email sent by this workspace.</p>
          <pre style={{ background: tokens.SLATE_50, padding: 14, borderRadius: 10, fontSize: 12, color: tokens.SLATE_700, whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(branding, null, 2)}</pre>
          <p style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 10 }}>Use Admin → Branding to update logo + colours, then refresh this view.</p>
        </GlassCard>
      )}

      {tab === "deliverability" && (
        <GlassCard padding={20}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Deliverability</h3>
          <pre style={{ background: tokens.SLATE_50, padding: 14, borderRadius: 10, fontSize: 12, color: tokens.SLATE_700, whiteSpace: "pre-wrap", marginTop: 10 }}>{JSON.stringify(deliverability, null, 2)}</pre>
        </GlassCard>
      )}
    </div>
  );
};

export default AdminEmails;
