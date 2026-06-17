/**
 * /workspace/admin/billing — full extended billing surface.
 *
 * Wires every endpoint on orgBillingApi (plan + cadence change,
 * cancel/uncancel, trial extend, credits topup + ledger, promo codes,
 * payment methods, upcoming invoice, billing alerts + dismiss,
 * billing-email + tax-id + PO, forecast usage + cost).
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Receipt, AlertTriangle, X, ExternalLink, Coins, BadgePercent,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgBillingApi, type OrgSubscription } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, OrbEmptyState,
  KpiTile, CardGrid, BrandPill, PlanBadge, SeatCounter, TabBar,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "invoices", label: "Invoices" },
  { id: "credits", label: "Credits" },
  { id: "promo", label: "Promo codes" },
  { id: "details", label: "Details" },
  { id: "forecast", label: "Forecast" },
  { id: "alerts", label: "Alerts" },
] as const;

type Tab = typeof TABS[number]["id"];

const fmtMoney = (n?: number, cur = "USD") =>
  n === undefined || n === null ? "—" : `${cur === "USD" ? "$" : ""}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const AdminBilling: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [tab, setTab] = useState<Tab>("overview");
  const [sub, setSub] = useState<OrgSubscription | null>(null);
  const [usage, setUsage] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [credits, setCredits] = useState<any | null>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [forecastU, setForecastU] = useState<any | null>(null);
  const [forecastC, setForecastC] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [promoCode, setPromoCode] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [poNumber, setPoNumber] = useState("");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const [s, u, inv, cr, led, pr, pm, up, al, fu, fc] = await Promise.all([
        orgBillingApi.subscription(activeOrgId).catch(() => null),
        orgBillingApi.usage(activeOrgId).catch(() => null),
        orgBillingApi.invoices(activeOrgId).catch(() => []),
        orgBillingApi.credits(activeOrgId).catch(() => null),
        orgBillingApi.creditsLedger(activeOrgId, 50).catch(() => []),
        orgBillingApi.promos(activeOrgId).catch(() => []),
        orgBillingApi.paymentMethods(activeOrgId).catch(() => []),
        orgBillingApi.upcomingInvoice(activeOrgId).catch(() => null),
        orgBillingApi.alerts(activeOrgId).catch(() => []),
        orgBillingApi.forecastUsage(activeOrgId).catch(() => null),
        orgBillingApi.forecastCost(activeOrgId).catch(() => null),
      ]);
      setSub(s as any); setUsage(u); setInvoices(inv as any);
      setCredits(cr); setLedger(Array.isArray(led) ? led as any : []);
      setPromos(Array.isArray(pr) ? pr as any : []); setMethods(Array.isArray(pm) ? pm as any : []);
      setUpcoming(up); setAlerts(Array.isArray(al) ? al as any : []);
      setForecastU(fu); setForecastC(fc);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const openPortal = async () => {
    if (!activeOrgId) return;
    try { const r: any = await orgBillingApi.portal(activeOrgId, { return_url: window.location.href });
      if (r?.url) window.location.href = r.url; }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Portal failed."); }
  };

  const changePlan = async (plan: string) => {
    if (!activeOrgId) return;
    try { await orgBillingApi.changePlan(activeOrgId, { plan });
      toast.success(`Plan changed to ${plan}.`); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Plan change failed."); }
  };

  const changeCadence = async (cad: string) => {
    if (!activeOrgId) return;
    try { await orgBillingApi.changeCadence(activeOrgId, { cadence: cad });
      toast.success(`Cadence updated to ${cad}.`); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Cadence change failed."); }
  };

  const cancel = async () => {
    if (!activeOrgId || !confirm("Cancel subscription at period end?")) return;
    try { await orgBillingApi.cancel(activeOrgId); toast.success("Cancellation scheduled."); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };
  const uncancel = async () => {
    if (!activeOrgId) return;
    try { await orgBillingApi.uncancel(activeOrgId); toast.success("Cancellation reversed."); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  const applyPromo = async () => {
    if (!activeOrgId || !promoCode.trim()) return;
    try { await orgBillingApi.applyPromo(activeOrgId, { code: promoCode.trim() });
      toast.success("Promo applied."); setPromoCode(""); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Apply failed."); }
  };
  const removePromo = async (code: string) => {
    if (!activeOrgId) return;
    try { await orgBillingApi.removePromo(activeOrgId, code); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Remove failed."); }
  };

  const topup = async () => {
    const n = Number(topupAmount); if (!n || !activeOrgId) return;
    try { await orgBillingApi.topupCredits(activeOrgId, { amount: n });
      toast.success(`Top-up of ${n} credits queued.`); setTopupAmount(""); await load(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  const saveDetails = async () => {
    if (!activeOrgId) return;
    try {
      if (billingEmail.trim()) await orgBillingApi.setBillingEmail(activeOrgId, { email: billingEmail.trim() });
      if (taxId.trim()) await orgBillingApi.setTaxId(activeOrgId, { tax_id: taxId.trim() });
      if (poNumber.trim()) await orgBillingApi.setPoNumber(activeOrgId, { po_number: poNumber.trim() });
      toast.success("Details saved.");
      setBillingEmail(""); setTaxId(""); setPoNumber("");
      await load();
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Save failed."); }
  };

  const dismissAlert = async (id: string) => {
    if (!activeOrgId) return;
    try { await orgBillingApi.dismissAlert(activeOrgId, id);
      setAlerts(prev => prev.filter(a => a.id !== id)); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Billing & seats"
        subtitle="Plan, cadence, seats, invoices, credits, promo codes, and account details."
        right={<Button tone="outline" onClick={openPortal}><ExternalLink size={14} /> Stripe portal</Button>}
      />

      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map(a => (
            <GlassCard key={a.id} padding={14} style={{ borderLeft: `3px solid ${tokens.AMBER}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={16} color={tokens.AMBER} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 13 }}>{a.title || a.kind}</div>
                  {a.body && <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 3 }}>{a.body}</div>}
                </div>
                <button onClick={() => dismissAlert(a.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><X size={14} /></button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <TabBar tabs={TABS as any} active={tab} onChange={t => setTab(t as Tab)} />

      {tab === "overview" && (
        loading ? <GlassCard padding={20}><Skeleton height={20} /></GlassCard> :
        <>
          <CardGrid minCol={220} gap={14}>
            <KpiTile label="Plan" value={sub?.plan ? sub.plan[0].toUpperCase() + sub.plan.slice(1) : "Free"} sub={sub?.status || "—"} tone="accent" />
            <KpiTile label="Seats" value={`${sub?.seats_used ?? 0} / ${sub?.seats_purchased ?? 0}`} sub="active" />
            <KpiTile label="Credits" value={credits?.credits ?? 0} sub="available" />
            <KpiTile label="Next renewal" value={(sub as any)?.current_period_end ? new Date((sub as any).current_period_end).toLocaleDateString() : "—"} sub={(sub as any)?.cadence || "—"} />
          </CardGrid>

          <CardGrid minCol={300} gap={16}>
            <GlassCard padding={20}>
              <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Plan</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <PlanBadge plan={sub?.plan || "free"} />
                <span style={{ fontSize: 12, color: tokens.SLATE_500 }}>{sub?.status}</span>
              </div>
              <SeatCounter used={sub?.seats_used ?? 0} purchased={sub?.seats_purchased ?? 0} style={{ marginTop: 12 }} />
              <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                {["team", "business", "enterprise"].filter(p => p !== sub?.plan).map(p => (
                  <Button key={p} tone="outline" size="sm" onClick={() => changePlan(p)}>Switch to {p}</Button>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Cadence</span>
                {["monthly", "annual"].map(c => (
                  <button key={c} onClick={() => changeCadence(c)} style={{
                    padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${(sub as any)?.cadence === c ? tokens.PURPLE : tokens.SLATE_200}`,
                    background: (sub as any)?.cadence === c ? `${tokens.PURPLE}10` : "white",
                    color: (sub as any)?.cadence === c ? tokens.PURPLE_DEEP : tokens.SLATE_700,
                    cursor: "pointer",
                  }}>{c}</button>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                {(sub as any)?.cancel_at_period_end ? (
                  <Button tone="ghost" onClick={uncancel}>Resume subscription</Button>
                ) : (
                  <Button tone="ghost" onClick={cancel} style={{ color: tokens.RED }}>Cancel at period end</Button>
                )}
              </div>
            </GlassCard>

            <GlassCard padding={20}>
              <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Usage this period</h3>
              {usage ? (
                <pre style={{ fontSize: 12, color: tokens.SLATE_700, background: tokens.SLATE_50, padding: 14, borderRadius: 10, marginTop: 12, whiteSpace: "pre-wrap", maxHeight: 220, overflow: "auto" }}>{JSON.stringify(usage, null, 2)}</pre>
              ) : <span style={{ color: tokens.SLATE_500, fontSize: 13 }}>No usage data yet.</span>}
            </GlassCard>

            <GlassCard padding={20}>
              <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Payment methods</h3>
              {methods.length === 0 ? (
                <span style={{ color: tokens.SLATE_500, fontSize: 13, display: "block", marginTop: 8 }}>No payment methods on file.</span>
              ) : (
                <div style={{ marginTop: 10 }}>
                  {methods.map((m, i) => (
                    <div key={m.id || i} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                      borderBottom: i < methods.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
                    }}>
                      <CreditCard size={16} color={tokens.SLATE_500} />
                      <span style={{ fontSize: 13, color: tokens.INK }}>•••• {m.last4 || m.last_4 || "—"}</span>
                      <span style={{ fontSize: 11, color: tokens.SLATE_500, marginLeft: "auto" }}>{m.brand || ""} · exp {m.exp_month}/{m.exp_year}</span>
                      {m.is_default && <BrandPill tone="ghost" style={{ fontSize: 10 }}>Default</BrandPill>}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard padding={20}>
              <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Upcoming invoice</h3>
              {upcoming ? (
                <>
                  <div style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 30, fontWeight: 700, marginTop: 8 }}>{fmtMoney(upcoming.amount, upcoming.currency)}</div>
                  <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>Due {upcoming.due_date ? new Date(upcoming.due_date).toLocaleDateString() : "—"}</div>
                </>
              ) : <span style={{ color: tokens.SLATE_500, fontSize: 13, display: "block", marginTop: 8 }}>Nothing scheduled.</span>}
            </GlassCard>
          </CardGrid>
        </>
      )}

      {tab === "invoices" && (
        loading ? <GlassCard padding={20}><Skeleton height={20} /></GlassCard> :
        invoices.length === 0 ? <OrbEmptyState title="No invoices yet" body="Your first invoice lands when the period closes." /> :
        <GlassCard padding={6}>
          {invoices.map((inv, i) => (
            <motion.div key={inv.id || i} {...STAGGER_FAST(i)} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center",
              padding: "12px 16px", borderBottom: i < invoices.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
            }}>
              <Receipt size={16} color={tokens.PURPLE} />
              <div>
                <div style={{ fontWeight: 600, color: tokens.INK, fontSize: 13 }}>{inv.number || inv.id?.slice(0, 12) || "—"}</div>
                <div style={{ fontSize: 11, color: tokens.SLATE_500 }}>{inv.period_start ? new Date(inv.period_start).toLocaleDateString() : ""} → {inv.period_end ? new Date(inv.period_end).toLocaleDateString() : ""}</div>
              </div>
              <BrandPill tone="ghost" style={{ fontSize: 11 }}>{inv.status || "open"}</BrandPill>
              <span style={{ fontFamily: tokens.DISPLAY_STACK, fontWeight: 700 }}>{fmtMoney(inv.amount || inv.total, inv.currency)}</span>
              {inv.invoice_pdf_url && <a href={inv.invoice_pdf_url} target="_blank" rel="noreferrer" style={{ color: tokens.PURPLE, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>PDF</a>}
            </motion.div>
          ))}
        </GlassCard>
      )}

      {tab === "credits" && (
        <>
          <CardGrid minCol={220} gap={14}>
            <KpiTile label="Balance" value={credits?.credits ?? 0} sub="available" tone="accent" />
            <KpiTile label="USD value" value={`$${credits?.usd_value ?? 0}`} sub="estimated" />
            <KpiTile label="Ledger entries" value={ledger.length} sub="recent" />
          </CardGrid>
          <GlassCard padding={20}>
            <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}><Coins size={14} style={{ verticalAlign: "middle" }} /> Top up</h3>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Input type="number" min={1} value={topupAmount} onChange={e => setTopupAmount(e.target.value)} placeholder="Credits to purchase" />
              <Button tone="primary" onClick={topup} disabled={!topupAmount}>Continue</Button>
            </div>
          </GlassCard>
          <GlassCard padding={6}>
            {ledger.length === 0 ? <div style={{ padding: 18, color: tokens.SLATE_500 }}>No credit activity yet.</div> :
              ledger.map((e, i) => (
                <div key={e.id || i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center",
                  padding: "10px 14px", borderBottom: i < ledger.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
                  fontSize: 13,
                }}>
                  <span>{e.description || e.type}</span>
                  <span style={{ fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, color: e.amount > 0 ? tokens.GREEN : tokens.RED }}>
                    {e.amount > 0 ? "+" : ""}{e.amount}
                  </span>
                  <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
              ))}
          </GlassCard>
        </>
      )}

      {tab === "promo" && (
        <>
          <GlassCard padding={20}>
            <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}><BadgePercent size={14} style={{ verticalAlign: "middle" }} /> Apply a promo code</h3>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="PROMO-CODE" />
              <Button tone="primary" onClick={applyPromo} disabled={!promoCode.trim()}>Apply</Button>
            </div>
          </GlassCard>
          {promos.length === 0 ? <OrbEmptyState title="No active promos" body="Codes you apply show up here." /> :
            <GlassCard padding={6}>
              {promos.map((p, i) => (
                <div key={p.code || i} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, padding: "12px 16px", alignItems: "center",
                  borderBottom: i < promos.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
                }}>
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700 }}>{p.code}</span>
                  <span style={{ fontSize: 13, color: tokens.SLATE_600 }}>{p.description || "—"}</span>
                  <Button tone="ghost" size="sm" onClick={() => removePromo(p.code)} style={{ color: tokens.RED }}>Remove</Button>
                </div>
              ))}
            </GlassCard>}
        </>
      )}

      {tab === "details" && (
        <GlassCard padding={20}>
          <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Billing details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Billing email</div>
              <Input value={billingEmail} onChange={e => setBillingEmail(e.target.value)} placeholder={(sub as any)?.billing_email || "ar@yourcompany.com"} />
            </label>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Tax ID</div>
              <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder={(sub as any)?.tax_id || "VAT / EIN / GSTIN"} />
            </label>
            <label>
              <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>PO number</div>
              <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder={(sub as any)?.po_number || "PO-12345"} />
            </label>
          </div>
          <div style={{ marginTop: 14 }}>
            <Button tone="primary" onClick={saveDetails}>Save details</Button>
          </div>
        </GlassCard>
      )}

      {tab === "forecast" && (
        <CardGrid minCol={340} gap={16}>
          <GlassCard padding={20}>
            <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Usage forecast</h3>
            <pre style={{ fontSize: 12, color: tokens.SLATE_700, background: tokens.SLATE_50, padding: 14, borderRadius: 10, marginTop: 10, whiteSpace: "pre-wrap", maxHeight: 280, overflow: "auto" }}>{forecastU ? JSON.stringify(forecastU, null, 2) : "—"}</pre>
          </GlassCard>
          <GlassCard padding={20}>
            <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>Cost forecast</h3>
            <pre style={{ fontSize: 12, color: tokens.SLATE_700, background: tokens.SLATE_50, padding: 14, borderRadius: 10, marginTop: 10, whiteSpace: "pre-wrap", maxHeight: 280, overflow: "auto" }}>{forecastC ? JSON.stringify(forecastC, null, 2) : "—"}</pre>
          </GlassCard>
        </CardGrid>
      )}

      {tab === "alerts" && (
        alerts.length === 0 ? <OrbEmptyState title="No billing alerts" body="We'll flag overages, expiring cards, and trial deadlines here." /> :
        <GlassCard padding={6}>
          {alerts.map((a, i) => (
            <div key={a.id || i} style={{ display: "flex", gap: 12, padding: "12px 16px", alignItems: "center", borderBottom: i < alerts.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none" }}>
              <AlertTriangle size={16} color={tokens.AMBER} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: tokens.INK, fontSize: 13 }}>{a.title || a.kind}</div>
                {a.body && <div style={{ fontSize: 12, color: tokens.SLATE_600 }}>{a.body}</div>}
              </div>
              <button onClick={() => dismissAlert(a.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><X size={14} /></button>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
};

export default AdminBilling;
