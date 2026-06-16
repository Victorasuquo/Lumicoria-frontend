/**
 * /workspace/admin/contracts — annual / enterprise contracts:
 * request → review → sign.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, ExternalLink } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgBillingApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, OrbEmptyState, BrandPill, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface Contract {
  id: string;
  status: "requested" | "drafted" | "ready_to_sign" | "signed" | "expired";
  seats?: number;
  duration_months?: number;
  notes?: string;
  document_url?: string;
  signed_at?: string;
  signed_by?: string;
  created_at: string;
}

const STATUS_TONE: Record<string, { bg: string; color: string }> = {
  requested:     { bg: `${tokens.SLATE_300}33`, color: tokens.SLATE_600 },
  drafted:       { bg: `${tokens.SKY}1A`, color: tokens.SKY },
  ready_to_sign: { bg: `${tokens.AMBER}1A`, color: tokens.AMBER },
  signed:        { bg: `${tokens.GREEN}1A`, color: tokens.GREEN },
  expired:       { bg: `${tokens.RED}1A`, color: tokens.RED },
};

export const AdminContracts: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [seats, setSeats] = useState("25");
  const [months, setMonths] = useState("12");
  const [notes, setNotes] = useState("");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await orgBillingApi.contracts(activeOrgId);
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const request = async () => {
    if (!activeOrgId) return;
    try {
      const row: any = await orgBillingApi.requestContract(activeOrgId, { seats: Number(seats), duration_months: Number(months), notes });
      setRows(prev => [row, ...prev]); setShowNew(false); setNotes("");
      toast.success("Request received. Our team will be in touch.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  const sign = async (id: string) => {
    if (!activeOrgId) return;
    const signedBy = window.prompt("Your name (used as electronic signature)");
    if (!signedBy?.trim()) return;
    try {
      const row: any = await orgBillingApi.signContract(activeOrgId, id, { signed_by: signedBy.trim() });
      setRows(prev => prev.map(r => r.id === id ? { ...r, ...row } : r));
      toast.success("Contract signed.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Sign failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Contracts"
        subtitle="Annual + enterprise agreements. Custom seat counts, custom clauses."
        right={<Button tone="primary" onClick={() => setShowNew(s => !s)}><Plus size={14} /> Request contract</Button>}
      />

      {showNew && (
        <GlassCard padding={20}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Seats</div>
              <Input type="number" min={1} value={seats} onChange={e => setSeats(e.target.value)} />
            </label>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Duration (months)</div>
              <Input type="number" min={1} value={months} onChange={e => setMonths(e.target.value)} />
            </label>
          </div>
          <label style={{ display: "block", marginTop: 10 }}>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Notes</div>
            <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Custom clauses, requested SLAs, security questionnaire links…" />
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button tone="primary" onClick={request}>Submit request</Button>
            <Button tone="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </GlassCard>
      )}

      {loading ? <GlassCard padding={20}><Skeleton height={16} /></GlassCard> :
        rows.length === 0 ? <OrbEmptyState title="No contracts yet" body="Annual / enterprise agreements show up here once requested." /> :
        <CardGrid minCol={320} gap={14}>
          {rows.map((r, i) => {
            const tone = STATUS_TONE[r.status] || STATUS_TONE.requested;
            return (
              <motion.div key={r.id} {...STAGGER_FAST(i)}>
                <GlassCard padding={18}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <FileText size={18} color={tokens.PURPLE} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: tokens.INK }}>{r.seats || "—"} seats · {r.duration_months || "?"} months</div>
                      <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", background: tone.bg, color: tone.color, marginTop: 6 }}>{r.status.replace(/_/g, " ")}</div>
                      {r.notes && <p style={{ fontSize: 12, color: tokens.SLATE_600, margin: "10px 0 0", lineHeight: 1.5 }}>{r.notes}</p>}
                      <div style={{ fontSize: 11, color: tokens.SLATE_500, marginTop: 10 }}>Requested {new Date(r.created_at).toLocaleDateString()}{r.signed_at ? ` · signed ${new Date(r.signed_at).toLocaleDateString()}` : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {r.document_url && <a href={r.document_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 999, border: `1px solid ${tokens.PURPLE}33`, color: tokens.PURPLE_DEEP, fontSize: 12, fontWeight: 600, textDecoration: "none" }}><ExternalLink size={12} /> Open document</a>}
                    {r.status === "ready_to_sign" && <Button tone="primary" size="sm" onClick={() => sign(r.id)}>Sign</Button>}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </CardGrid>}
    </div>
  );
};

export default AdminContracts;
