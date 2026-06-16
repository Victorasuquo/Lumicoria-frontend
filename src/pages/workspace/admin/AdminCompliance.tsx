/**
 * /workspace/admin/compliance — request compliance docs (SOC 2, ISO,
 * GDPR DPA, HIPAA BAA) and view status.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Download, Clock, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, OrbEmptyState, CardGrid, BrandPill,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

const DOC_TYPES = [
  { id: "soc2", label: "SOC 2 Type II report", description: "Annual third-party security audit." },
  { id: "iso27001", label: "ISO 27001 certificate", description: "Information security management." },
  { id: "gdpr_dpa", label: "GDPR DPA", description: "EU data processing addendum." },
  { id: "hipaa_baa", label: "HIPAA BAA", description: "Business associate agreement." },
  { id: "ccpa", label: "CCPA addendum", description: "California consumer privacy." },
];

export const AdminCompliance: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState("soc2");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try { setStatus(await enterpriseApi.complianceStatus(activeOrgId)); }
    catch { setStatus(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const submit = async () => {
    if (!activeOrgId || !contactEmail.trim()) { toast.error("Contact email required."); return; }
    setSubmitting(true);
    try {
      await enterpriseApi.requestCompliance(activeOrgId, { document_type: docType, contact_email: contactEmail, notes });
      toast.success("Request received. Our compliance team will reach out.");
      setContactEmail(""); setNotes("");
      await load();
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Request failed."); }
    finally { setSubmitting(false); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Compliance"
        subtitle="Request signed compliance documents and track their status."
      />

      <CardGrid minCol={220} gap={12}>
        {DOC_TYPES.map(d => {
          const s = status?.[d.id];
          const state = s?.status || "available";
          return (
            <GlassCard key={d.id} padding={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={16} color={tokens.PURPLE} />
                <div style={{ fontWeight: 700, color: tokens.INK }}>{d.label}</div>
              </div>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginTop: 6 }}>{d.description}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                {state === "ready" || state === "signed" ? <CheckCircle2 size={14} color={tokens.GREEN} /> : <Clock size={14} color={tokens.AMBER} />}
                <BrandPill tone="ghost" style={{ fontSize: 11 }}>{state}</BrandPill>
                {s?.download_url && <a href={s.download_url} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: tokens.PURPLE, fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}><Download size={12} /> Download</a>}
              </div>
            </GlassCard>
          );
        })}
      </CardGrid>

      <SectionHeader title="Request a document" />
      <GlassCard padding={20}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Document</div>
            <select value={docType} onChange={e => setDocType(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${tokens.SLATE_200}`, fontSize: 14, background: "white" }}>
              {DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </label>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Contact email</div>
            <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="legal@yourcompany.com" />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Notes (optional)</div>
            <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything we should know — e.g. PO number, custom clauses." />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button tone="primary" onClick={submit} disabled={submitting}>{submitting ? "Sending…" : "Submit request"}</Button>
        </div>
      </GlassCard>

      {loading ? <GlassCard padding={20}><Skeleton height={14} /></GlassCard> : null}
    </div>
  );
};

export default AdminCompliance;
