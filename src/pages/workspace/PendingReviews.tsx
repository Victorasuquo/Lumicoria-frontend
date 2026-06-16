/**
 * /workspace/reviews — pending reviews queue from the comments-v2
 * review flow.  Approvers see what's waiting on them.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronRight } from "lucide-react";
import { commentsV2Api } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, OrbEmptyState, CardGrid, KpiTile,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface ReviewRow {
  id: string;
  resource_type: string;
  resource_id: string;
  reviewer_id: string;
  requester_id?: string;
  note?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const PendingReviews: React.FC = () => {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ReviewRow | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data: any = await commentsV2Api.pendingReviews();
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const approve = async () => {
    if (!active) return;
    setBusy(true);
    try {
      await commentsV2Api.approveReview(active.id, notes ? { notes } : undefined);
      setRows(prev => prev.filter(r => r.id !== active.id));
      setActive(null); setNotes(""); toast.success("Approved.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Approve failed."); }
    finally { setBusy(false); }
  };

  const reject = async () => {
    if (!active) return;
    if (!notes.trim()) { toast.error("Add a rejection note."); return; }
    setBusy(true);
    try {
      await commentsV2Api.rejectReview(active.id, { notes });
      setRows(prev => prev.filter(r => r.id !== active.id));
      setActive(null); setNotes(""); toast.success("Rejected.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Reject failed."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Reviews"
        title="Pending reviews"
        subtitle="Items waiting on your sign-off across the workspace."
      />

      <CardGrid minCol={200} gap={14}>
        <KpiTile label="Pending" value={rows.length} sub="awaiting review" tone="accent" />
        <KpiTile label="On me" value={rows.length} sub="reviewer = you" />
        <KpiTile label="Oldest" value={rows[rows.length - 1]?.created_at ? new Date(rows[rows.length - 1].created_at).toLocaleDateString() : "—"} sub="needs attention" />
      </CardGrid>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Queue */}
        <div>
          {loading ? (
            <GlassCard padding={20}><Skeleton height={16} /><Skeleton height={16} style={{ marginTop: 10 }} /></GlassCard>
          ) : rows.length === 0 ? (
            <OrbEmptyState title="All clear" body="Nothing waiting on your sign-off." />
          ) : (
            <GlassCard padding={6}>
              {rows.map((r, i) => (
                <motion.button
                  key={r.id} {...STAGGER_FAST(i)}
                  onClick={() => { setActive(r); setNotes(""); }}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center",
                    width: "100%", padding: "12px 16px", border: "none",
                    background: active?.id === r.id ? `${tokens.PURPLE}08` : "transparent",
                    borderLeft: active?.id === r.id ? `3px solid ${tokens.PURPLE}` : "3px solid transparent",
                    cursor: "pointer", textAlign: "left",
                    borderBottom: i < rows.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: tokens.INK, fontSize: 13, textTransform: "capitalize" }}>
                      {r.resource_type}:{r.resource_id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>
                      {r.note?.slice(0, 100) || "No note"} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight size={14} color={tokens.SLATE_400} />
                </motion.button>
              ))}
            </GlassCard>
          )}
        </div>

        {/* Detail */}
        <div style={{ position: "sticky", top: 96 }}>
          {!active ? (
            <GlassCard padding={32} style={{ textAlign: "center", color: tokens.SLATE_500 }}>
              <p style={{ margin: 0, fontSize: 14 }}>Select a review on the left to act on it.</p>
            </GlassCard>
          ) : (
            <GlassCard padding={20}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Reviewing</div>
              <h3 style={{ margin: "4px 0 8px", fontFamily: tokens.DISPLAY_STACK, fontSize: 18 }}>
                {active.resource_type}:{active.resource_id.slice(0, 12)}
              </h3>
              {active.note && (
                <div style={{ marginBottom: 12, padding: 10, background: tokens.SLATE_100, borderRadius: 10, fontSize: 13, color: tokens.SLATE_700 }}>
                  <strong style={{ color: tokens.SLATE_500, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Request note</strong>
                  {active.note}
                </div>
              )}
              <Textarea
                rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional approval note · required for rejection"
              />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Button tone="primary" onClick={approve} disabled={busy}><Check size={14} /> Approve</Button>
                <Button tone="ghost" onClick={reject} disabled={busy} style={{ color: tokens.RED }}><X size={14} /> Reject</Button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingReviews;
