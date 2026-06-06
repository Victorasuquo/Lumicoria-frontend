import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgBillingApi, type OrgSubscription } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, BrandPill, PlanBadge, SeatCounter, EmptyState, Skeleton } from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, planLabel } from "@/components/workspace/tokens";

export const AdminBilling: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [sub, setSub] = useState<OrgSubscription | null>(null);
  const [invoices, setInvoices] = useState<Array<Record<string, any>>>([]);
  const [plans, setPlans] = useState<Array<{ plan: string; display_name: string; per_seat_monthly: number; annual_discount_pct: number; capabilities: Record<string, boolean> }>>([]);
  const [usage, setUsage] = useState<{ plan: string; seats_purchased: number; seats_used: number; seats_remaining: number; limits: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    Promise.all([
      orgBillingApi.subscription(activeOrgId).catch(() => null),
      orgBillingApi.invoices(activeOrgId).then(r => r.invoices || []).catch(() => []),
      orgBillingApi.plans().then(r => r.plans).catch(() => []),
      orgBillingApi.usage(activeOrgId).catch(() => null),
    ]).then(([s, inv, pl, u]) => { setSub(s); setInvoices(inv); setPlans(pl); setUsage(u); }).finally(() => setLoading(false));
  }, [activeOrgId]);

  const openPortal = async () => {
    if (!activeOrgId) return;
    setBusy(true);
    try {
      const { portal_url } = await orgBillingApi.portal(activeOrgId, window.location.href);
      window.location.href = portal_url;
    } catch { setBusy(false); }
  };

  const upgrade = async (planKey: "team" | "business" | "enterprise") => {
    if (!activeOrgId) return;
    setBusy(true);
    try {
      const { checkout_url } = await orgBillingApi.checkout(activeOrgId, {
        plan: planKey, cadence: "annual", seats: Math.max(usage?.seats_purchased || 1, 3),
        success_url: window.location.origin + "/workspace/admin/billing?success=1",
        cancel_url: window.location.origin + "/workspace/admin/billing?cancel=1",
      });
      window.location.href = checkout_url;
    } catch { setBusy(false); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Billing" title="Workspace billing & seats" subtitle="Manage plan, seats, payment method, invoices, and tax info." />

      {/* Current plan card */}
      <GlassCard padding={26} style={{ background: `linear-gradient(135deg, ${tokens.PURPLE_DEEP} 0%, ${tokens.PURPLE} 60%, ${tokens.SKY} 100%)`, color: "white" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Current plan</span>
            <div style={{ fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 36, marginTop: 6, letterSpacing: -0.6 }}>
              {planLabel(sub?.plan)}
            </div>
            <div style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>
              {sub?.seats_used ?? 0} of {sub?.seats_purchased ?? 0} seats used · {sub?.cadence || "monthly"} cadence
            </div>
            {sub?.cancel_at_period_end && (
              <div style={{ marginTop: 10, fontSize: 12, padding: "6px 10px", background: "rgba(255,255,255,0.15)", borderRadius: 9999, display: "inline-block" }}>
                Cancels {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "at end of period"}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button onClick={openPortal} disabled={busy} style={{ background: "white", color: tokens.PURPLE_DEEP, boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}>Open Stripe portal</Button>
            <Button tone="ghost" onClick={() => upgrade("business")} style={{ color: "white", border: "1px solid rgba(255,255,255,0.45)" }}>Change plan</Button>
          </div>
        </div>
      </GlassCard>

      {/* Seats + usage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard padding={22}>
          <SectionHeader title="Seats" subtitle="Adjust the number of paid seats for this workspace." />
          {usage ? (
            <>
              <SeatCounter used={usage.seats_used} purchased={usage.seats_purchased} style={{ marginBottom: 14 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <Button tone="outline" size="sm" onClick={async () => { if (activeOrgId) { setBusy(true); try { await orgBillingApi.buySeats(activeOrgId, 1); const u = await orgBillingApi.usage(activeOrgId); setUsage(u); } finally { setBusy(false); } } }} disabled={busy}>+ 1 seat</Button>
                <Button tone="outline" size="sm" onClick={async () => { if (activeOrgId) { setBusy(true); try { await orgBillingApi.buySeats(activeOrgId, 5); const u = await orgBillingApi.usage(activeOrgId); setUsage(u); } finally { setBusy(false); } } }} disabled={busy}>+ 5 seats</Button>
                <Button tone="ghost" size="sm" onClick={async () => { if (activeOrgId) { setBusy(true); try { await orgBillingApi.returnSeats(activeOrgId, 1); const u = await orgBillingApi.usage(activeOrgId); setUsage(u); } finally { setBusy(false); } } }} disabled={busy}>− 1 seat</Button>
              </div>
            </>
          ) : <Skeleton height={48} />}
        </GlassCard>
        <GlassCard padding={22}>
          <SectionHeader title="Plan limits" subtitle="Caps your tenant is subject to." />
          {usage ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
              {Object.entries(usage.limits || {}).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${tokens.SLATE_200}` }}>
                  <span style={{ color: tokens.SLATE_600 }}>{k.replace(/^max_/, "").replace(/_/g, " ")}</span>
                  <span style={{ color: tokens.INK, fontWeight: 700 }}>{Number(v) < 0 ? "Unlimited" : Number(v).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <Skeleton height={120} />}
        </GlassCard>
      </div>

      {/* Plan picker */}
      <SectionHeader title="Plans" subtitle="Annual saves 15% on every team plan." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {plans.map(p => {
          const annualPerSeat = (p.per_seat_monthly * (1 - (p.annual_discount_pct || 0) / 100)).toFixed(2);
          const current = (sub?.plan === p.plan);
          return (
            <GlassCard key={p.plan} padding={22} style={{ outline: current ? `2px solid ${tokens.PURPLE}` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <PlanBadge plan={p.plan} />
                {current && <span style={{ fontSize: 11, color: tokens.PURPLE_DEEP, fontWeight: 700 }}>Current</span>}
              </div>
              <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700, marginTop: 10 }}>
                ${p.per_seat_monthly}<span style={{ fontSize: 14, color: tokens.SLATE_500, fontWeight: 600 }}>/seat/mo</span>
              </div>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginTop: 4 }}>or ${annualPerSeat}/seat/mo billed annually</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                {Object.entries(p.capabilities).filter(([_, v]) => v).slice(0, 6).map(([k]) => (
                  <li key={k} style={{ display: "flex", alignItems: "center", gap: 8, color: tokens.SLATE_700 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: tokens.PURPLE }} />
                    {k.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 16 }}>
                <Button tone={current ? "outline" : "primary"} disabled={busy || current} onClick={() => upgrade(p.plan as any)}>
                  {current ? "Current plan" : `Switch to ${p.display_name}`}
                </Button>
              </div>
            </GlassCard>
          );
        })}
        {plans.length === 0 && <GlassCard padding={22}><Skeleton height={80} /></GlassCard>}
      </div>

      {/* Invoices */}
      <SectionHeader title="Invoices" subtitle="Paid and outstanding invoices for this workspace." />
      <GlassCard padding={6}>
        {invoices.length === 0 ? (
          <div style={{ padding: 24 }}><EmptyState title="No invoices yet" body="Once you start a paid subscription, invoices appear here." /></div>
        ) : invoices.map((inv: any, idx) => (
          <div key={inv.id || idx} style={{
            display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center",
            padding: "12px 16px",
            borderBottom: idx < invoices.length - 1 ? `1px solid ${tokens.SLATE_200}` : "none",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.number || inv.id}</div>
            <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{inv.created ? new Date(inv.created * 1000).toLocaleDateString() : ""}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{((inv.amount_paid || 0) / 100).toLocaleString("en-US", { style: "currency", currency: (inv.currency || "usd").toUpperCase() })}</span>
            {inv.hosted_invoice_url && (
              <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: tokens.PURPLE_DEEP, fontWeight: 600 }}>Open →</a>
            )}
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default AdminBilling;
