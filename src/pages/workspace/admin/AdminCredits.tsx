/**
 * /workspace/admin/credits — credits balance, top-up, ledger, refund.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgBillingApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, OrbEmptyState, CardGrid, KpiTile,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface LedgerEntry {
  id?: string;
  amount: number;
  balance_after?: number;
  type: "topup" | "deduct" | "refund" | "credit" | "bonus";
  description?: string;
  created_at: string;
}

export const AdminCredits: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [balance, setBalance] = useState<{ credits: number; usd_value?: number } | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [bal, led] = await Promise.all([
        orgBillingApi.credits(activeOrgId).catch(() => null),
        orgBillingApi.creditsLedger(activeOrgId, 100).catch(() => []),
      ]);
      setBalance(bal as any);
      setLedger(Array.isArray(led) ? led as any : (led as any)?.items || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const topup = async () => {
    const n = Number(amount); if (!n || n <= 0) { toast.error("Enter a positive amount."); return; }
    if (!activeOrgId) return;
    try {
      await orgBillingApi.topupCredits(activeOrgId, { amount: n });
      toast.success(`Topped up ${n} credits.`); setShowTopup(false); setAmount("");
      await load();
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Top-up failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Credits"
        subtitle="Prepaid balance used for premium agent runs and API calls."
        right={<Button tone="primary" onClick={() => setShowTopup(s => !s)}><Plus size={14} /> Top up</Button>}
      />

      <CardGrid minCol={220} gap={14}>
        <KpiTile label="Balance" value={balance?.credits ?? 0} sub="credits available" tone="accent" />
        <KpiTile label="USD value" value={`$${(balance?.usd_value ?? 0).toLocaleString()}`} sub="estimated" />
        <KpiTile label="Ledger entries" value={ledger.length} sub="last 100" />
      </CardGrid>

      {showTopup && (
        <GlassCard padding={20}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Top up credits</h3>
          <p style={{ color: tokens.SLATE_600, fontSize: 13, margin: "6px 0 12px" }}>Stripe Checkout opens in a new tab. Credits land instantly after payment.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount in credits" autoFocus />
            <Button tone="primary" onClick={topup} disabled={!amount}>Continue</Button>
            <Button tone="ghost" onClick={() => setShowTopup(false)}>Cancel</Button>
          </div>
        </GlassCard>
      )}

      <SectionHeader title="Ledger" />
      {loading ? <GlassCard padding={20}><Skeleton height={16} /></GlassCard> :
        ledger.length === 0 ? <OrbEmptyState title="No credit activity yet" body="Top up to start tracking usage and refunds here." /> :
        <GlassCard padding={6}>
          {ledger.map((e, i) => {
            const positive = e.type === "topup" || e.type === "refund" || e.type === "bonus" || e.type === "credit";
            return (
              <motion.div key={e.id || i} {...STAGGER_FAST(i)} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center",
                padding: "12px 16px", borderBottom: i < ledger.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
              }}>
                {positive ? <ArrowUpRight size={16} color={tokens.GREEN} /> : <ArrowDownRight size={16} color={tokens.RED} />}
                <div>
                  <div style={{ fontWeight: 600, color: tokens.INK, fontSize: 13 }}>{e.description || e.type}</div>
                  <div style={{ fontSize: 11, color: tokens.SLATE_500, textTransform: "uppercase", letterSpacing: 0.4 }}>{e.type}</div>
                </div>
                <span style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 14, fontWeight: 700, color: positive ? tokens.GREEN : tokens.RED }}>
                  {positive ? "+" : "−"}{Math.abs(e.amount).toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{new Date(e.created_at).toLocaleDateString()}</span>
              </motion.div>
            );
          })}
        </GlassCard>}
    </div>
  );
};

export default AdminCredits;
