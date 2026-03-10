import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Check, CreditCard, ArrowRight, Loader2, AlertCircle, ExternalLink,
    Zap, BarChart3, Download, FileText, Coins, ArrowUpRight, ArrowDownRight,
    Receipt, RefreshCw, ChevronRight, Shield, Clock, TrendingUp, Eye,
    Sparkles,
} from 'lucide-react';
import {
    billingApi,
    type PlanInfo, type SubscriptionInfo, type UsageInfo,
    type InvoiceItem, type InvoiceListResponse,
    type CreditBalance, type CreditLedgerResponse, type CreditTransaction,
} from '@/services/api';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const PRICE_IDS = {
    starter_monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || '',
    starter_yearly: import.meta.env.VITE_STRIPE_PRICE_STARTER_YEARLY || '',
    pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '',
    pro_yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || '',
    enterprise: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || '',
};

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    trialing: 'bg-blue-50 text-blue-700 border-blue-200',
    past_due: 'bg-amber-50 text-amber-700 border-amber-200',
    canceled: 'bg-red-50 text-red-700 border-red-200',
    incomplete: 'bg-gray-50 text-gray-600 border-gray-200',
    unpaid: 'bg-red-50 text-red-700 border-red-200',
    paused: 'bg-gray-50 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Active', trialing: 'Trial', past_due: 'Past Due',
    canceled: 'Canceled', incomplete: 'Incomplete', unpaid: 'Unpaid', paused: 'Paused',
};

const CREDIT_TX_ICONS: Record<string, { icon: typeof TrendingUp; color: string; bg: string }> = {
    credit: { icon: ArrowDownRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    debit: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50' },
    refund: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
    adjustment: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    bonus: { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
};

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(cents: number, currency = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2,
    }).format(cents / 100);
}

function usagePercent(current: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min(Math.round((current / limit) * 100), 100);
}

function limitLabel(limit: number): string {
    return limit === -1 ? '∞' : limit.toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════════
   FadeInSection — scroll-triggered animation wrapper
   ═══════════════════════════════════════════════════════════════════ */

function FadeInSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Skeleton Loader
   ═══════════════════════════════════════════════════════════════════ */

function BillingSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-32 rounded-lg bg-gray-100" />
                <div className="h-5 w-72 rounded-lg bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-lg bg-gray-100" />
                            <div className="h-5 w-16 rounded-full bg-gray-100" />
                        </div>
                        <div className="h-4 w-24 rounded bg-gray-100" />
                        <div className="h-7 w-32 rounded bg-gray-100" />
                        <div className="h-3 w-40 rounded bg-gray-100" />
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-6">
                <div className="h-10 w-80 rounded-lg bg-gray-100 mx-auto" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-2xl border border-gray-50 p-6 space-y-3">
                            <div className="h-5 w-20 rounded bg-gray-100" />
                            <div className="h-8 w-24 rounded bg-gray-100" />
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map(j => <div key={j} className="h-4 w-full rounded bg-gray-50" />)}
                            </div>
                            <div className="h-10 w-full rounded-lg bg-gray-100 mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   UsageMeter
   ═══════════════════════════════════════════════════════════════════ */

function UsageMeter({ label, current, limit }: { label: string; current: number; limit: number }) {
    const pct = usagePercent(current, limit);
    const isWarning = pct >= 80;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">{label}</span>
                <span className={`font-medium tabular-nums ${isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
                    {current.toLocaleString()} / {limitLabel(limit)}
                </span>
            </div>
            <Progress value={pct} className="h-2" />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════ */

function InvoiceStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        open: 'bg-amber-50 text-amber-700 border-amber-200',
        draft: 'bg-gray-50 text-gray-600 border-gray-200',
        void: 'bg-red-50 text-red-700 border-red-200',
        uncollectible: 'bg-red-50 text-red-700 border-red-200',
    };
    const dots: Record<string, string> = {
        paid: 'bg-emerald-500', open: 'bg-amber-500', void: 'bg-red-500', draft: 'bg-gray-400', uncollectible: 'bg-red-500',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${styles[status] || styles.draft}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || dots.draft}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function CreditRow({ tx }: { tx: CreditTransaction }) {
    const meta = CREDIT_TX_ICONS[tx.transaction_type] || CREDIT_TX_ICONS.credit;
    const TxIcon = meta.icon;
    const isPositive = tx.amount >= 0;
    return (
        <div className="flex items-center gap-3 py-3.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <TxIcon className={`h-4 w-4 ${meta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                <p className="text-[11px] text-gray-400">{formatDate(tx.created_at)}</p>
            </div>
            <div className="text-right shrink-0">
                <p className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 tabular-nums">bal: {tx.balance_after.toLocaleString()}</p>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
                {icon}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-xs text-gray-400 max-w-xs">{description}</p>
        </div>
    );
}

function FAQSection() {
    const faqs = [
        { q: 'Can I switch plans at any time?', a: 'Yes. Upgrades take effect immediately with prorated charges. Downgrades apply at the end of the current billing period.' },
        { q: 'What happens when I hit my usage limit?', a: "You'll be notified and prompted to upgrade. Running operations will complete — we won't cut you off mid-task." },
        { q: 'How do I cancel my subscription?', a: 'Open the Billing Portal via the "Manage in Stripe" button. You can cancel, update payment methods, and download invoices there.' },
        { q: 'Is there a free trial?', a: 'Yes! Starter and Professional plans include a 14-day free trial. No charge until the trial ends.' },
        { q: 'How do credits work?', a: 'Credits are granted automatically with each payment. They reflect your usage balance and are tracked in the Credits tab.' },
    ];
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Frequently Asked Questions
            </h2>
            <div className="space-y-5">
                {faqs.map((item, i) => (
                    <div key={i}>
                        <p className="text-sm font-medium text-gray-900">{item.q}</p>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.a}</p>
                        {i < faqs.length - 1 && <Separator className="bg-gray-100 mt-5" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Billing Page
   ═══════════════════════════════════════════════════════════════════ */

const Billing: React.FC = () => {
    const { toast } = useToast();
    const [searchParams] = useSearchParams();

    // ── Data ──
    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
    const [creditLedger, setCreditLedger] = useState<CreditLedgerResponse | null>(null);
    const [invoices, setInvoices] = useState<InvoiceListResponse | null>(null);

    // ── UI ──
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [activeTab, setActiveTab] = useState('overview');
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

    /* ── Fetch all data ── */
    useEffect(() => {
        const load = async () => {
            try {
                const [plansData, subData, usageData, balanceData, ledgerData, invoiceData] = await Promise.all([
                    billingApi.getPlans(),
                    billingApi.getSubscription().catch(() => null),
                    billingApi.getUsage().catch(() => null),
                    billingApi.getCreditBalance().catch(() => null),
                    billingApi.getCreditLedger({ limit: 50 }).catch(() => null),
                    billingApi.getInvoices({ limit: 50 }).catch(() => null),
                ]);
                setPlans(plansData);
                setSubscription(subData);
                setUsage(usageData);
                setCreditBalance(balanceData);
                setCreditLedger(ledgerData);
                setInvoices(invoiceData);
            } catch (err) {
                console.error('Failed to load billing data:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /* ── Handle Stripe redirect params ── */
    useEffect(() => {
        const billingStatus = searchParams.get('billing');
        if (billingStatus === 'success') {
            toast({ title: '🎉 Subscription activated!', description: 'Your plan has been updated successfully.' });
            window.history.replaceState({}, '', '/billing');
        } else if (billingStatus === 'canceled') {
            toast({ title: 'Checkout canceled', description: 'No changes were made.', variant: 'destructive' });
            window.history.replaceState({}, '', '/billing');
        }
    }, [searchParams, toast]);

    /* ── Handlers ── */
    const handleCheckout = async (priceId: string) => {
        if (!priceId) return;
        setCheckoutLoading(priceId);
        try {
            const result = await billingApi.createCheckout({ price_id: priceId });
            window.location.href = result.checkout_url;
        } catch (err: any) {
            toast({ title: 'Checkout failed', description: err?.response?.data?.detail || 'Please try again.', variant: 'destructive' });
            setCheckoutLoading(null);
        }
    };

    const handlePortal = async () => {
        setPortalLoading(true);
        try {
            const result = await billingApi.createPortalSession();
            window.location.href = result.portal_url;
        } catch (err: any) {
            toast({ title: 'Error', description: err?.response?.data?.detail || 'Could not open billing portal.', variant: 'destructive' });
            setPortalLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoiceId: string) => {
        setDownloadingInvoice(invoiceId);
        try {
            const { pdf_url } = await billingApi.getInvoicePdf(invoiceId);
            if (pdf_url) {
                window.open(pdf_url, '_blank');
            } else {
                toast({ title: 'No PDF available', description: 'PDF is not available for this invoice.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Could not fetch invoice PDF.', variant: 'destructive' });
        } finally {
            setDownloadingInvoice(null);
        }
    };

    const handleExportInvoice = async (invoiceId: string) => {
        try {
            const data = await billingApi.exportInvoice(invoiceId);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({ title: 'Exported', description: 'Invoice data downloaded.' });
        } catch {
            toast({ title: 'Error', description: 'Could not export invoice.', variant: 'destructive' });
        }
    };

    const getPriceId = (planKey: string): string => {
        if (billingCycle === 'yearly') {
            if (planKey === 'starter') return PRICE_IDS.starter_yearly;
            if (planKey === 'professional') return PRICE_IDS.pro_yearly;
        } else {
            if (planKey === 'starter') return PRICE_IDS.starter_monthly;
            if (planKey === 'professional') return PRICE_IDS.pro_monthly;
        }
        if (planKey === 'enterprise') return PRICE_IDS.enterprise;
        return '';
    };

    const getDisplayPrice = (plan: PlanInfo): string => {
        if (!plan.price_monthly) return 'Custom';
        if (plan.price_monthly === 0) return '$0';
        if (billingCycle === 'yearly') {
            const yearly = Math.round(plan.price_monthly * 12 * 0.8);
            return `$${Math.round(yearly / 12)}`;
        }
        return `$${plan.price_monthly}`;
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto max-w-6xl px-6 py-12">
                    <BillingSkeleton />
                </div>
            </div>
        );
    }

    const currentPlan = subscription?.plan || 'free';
    const credits = creditBalance?.balance ?? 0;
    const invoiceCount = invoices?.total_count ?? 0;
    const txCount = creditLedger?.total_count ?? 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-purple-600/[0.04] blur-[120px]" />
            </div>

            <div className="relative container mx-auto max-w-6xl px-6 py-12 md:py-16">

                {/* ═══ HEADER ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
                            <p className="mt-1 text-gray-500">Manage your subscription, track usage, and view invoices.</p>
                        </div>
                        {currentPlan !== 'free' && (
                            <Button
                                variant="outline"
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg self-start"
                                onClick={handlePortal}
                                disabled={portalLoading}
                            >
                                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                                Manage in Stripe
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Past due banner */}
                {subscription?.status === 'past_due' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">Payment past due</p>
                            <p className="text-xs text-amber-600 mt-0.5">Please update your payment method to avoid service interruption.</p>
                        </div>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs" onClick={handlePortal}>
                            Update Payment
                        </Button>
                    </motion.div>
                )}

                {/* ═══ STAT CARDS ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    {/* Current Plan */}
                    <FadeInSection delay={0}>
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/80">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                </div>
                                <Badge className={`${STATUS_COLORS[subscription?.status || 'active']} border text-[11px] font-medium`}>
                                    {STATUS_LABELS[subscription?.status || 'active'] || subscription?.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                            <p className="text-2xl font-bold text-gray-900 capitalize mb-2">
                                {currentPlan === 'free' ? 'Free' : currentPlan}
                            </p>
                            {subscription?.trial_end && subscription?.status === 'trialing' && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Trial ends {formatDate(subscription.trial_end)}
                                </p>
                            )}
                            {subscription?.current_period_end && (
                                <p className="text-xs text-gray-400">Renews {formatDate(subscription.current_period_end)}</p>
                            )}
                            {subscription?.cancel_at_period_end && (
                                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Cancels at period end
                                </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                {currentPlan !== 'free' ? (
                                    <button className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors" onClick={handlePortal}>
                                        Manage Billing <ChevronRight className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors" onClick={() => setActiveTab('plans')}>
                                        <Zap className="h-3 w-3" /> Upgrade Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Credit Balance */}
                    <FadeInSection delay={0.08}>
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/80">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Coins className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Credit Balance</p>
                            <div className="flex items-end gap-2 mb-1">
                                <p className="text-2xl font-bold text-gray-900 tabular-nums">{credits.toLocaleString()}</p>
                                <p className="text-sm text-gray-400 mb-0.5">credits</p>
                            </div>
                            <p className="text-xs text-gray-400">≈ {formatCurrency(credits)} value</p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors" onClick={() => setActiveTab('credits')}>
                                    <Eye className="h-3 w-3" /> View History
                                </button>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Usage This Month */}
                    <FadeInSection delay={0.16}>
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/80">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                </div>
                                {usage && (
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        {new Date(0, (usage.month || 1) - 1).toLocaleString('default', { month: 'short' })} {usage.year}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                <UsageMeter label="Agent Runs" current={usage?.agent_runs || 0} limit={usage?.agent_runs_limit || 50} />
                                <UsageMeter label="Documents" current={usage?.documents_processed || 0} limit={usage?.documents_limit || 10} />
                                <UsageMeter label="KB Queries" current={usage?.knowledge_base_queries || 0} limit={usage?.knowledge_base_queries_limit || 20} />
                            </div>
                        </div>
                    </FadeInSection>
                </div>

                {/* ═══ TABBED CONTENT ═══ */}
                <FadeInSection delay={0.2}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-8 bg-gray-100/80 rounded-lg p-1">
                            <TabsTrigger value="overview" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="plans" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">
                                Plans
                            </TabsTrigger>
                            <TabsTrigger value="invoices" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">
                                Invoices
                            </TabsTrigger>
                            <TabsTrigger value="credits" className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">
                                Credits
                            </TabsTrigger>
                        </TabsList>

                        {/* ─── OVERVIEW TAB ─── */}
                        <TabsContent value="overview" className="space-y-6">

                            {/* Quick Actions */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { icon: Zap, label: 'Upgrade Plan', desc: 'Get more agent runs & features', color: 'purple' as const, onClick: () => setActiveTab('plans') },
                                        { icon: Receipt, label: 'View Invoices', desc: `${invoiceCount} invoice${invoiceCount !== 1 ? 's' : ''} available`, color: 'blue' as const, onClick: () => setActiveTab('invoices') },
                                        { icon: Coins, label: 'Credit History', desc: `${txCount} transaction${txCount !== 1 ? 's' : ''}`, color: 'emerald' as const, onClick: () => setActiveTab('credits') },
                                        { icon: ExternalLink, label: 'Billing Portal', desc: 'Stripe dashboard', color: 'amber' as const, onClick: handlePortal, isLoading: portalLoading },
                                    ].map((action) => {
                                        const colorMap = {
                                            purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
                                            blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
                                            emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
                                            amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
                                        };
                                        return (
                                            <button
                                                key={action.label}
                                                onClick={action.onClick}
                                                disabled={action.isLoading}
                                                className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 text-left transition-all hover:bg-white hover:border-gray-200 hover:shadow-sm disabled:opacity-50"
                                            >
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${colorMap[action.color]}`}>
                                                    {action.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <action.icon className="h-4 w-4" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">{action.desc}</p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 group-hover:text-gray-400 transition-colors" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Invoices */}
                            {invoices && invoices.invoices.length > 0 && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
                                        <button className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-0.5 transition-colors" onClick={() => setActiveTab('invoices')}>
                                            View All <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {invoices.invoices.slice(0, 3).map((inv) => (
                                            <div key={inv.invoice_id} className="flex items-center gap-3 py-3 group">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {inv.invoice_number || `INV-${inv.invoice_id.slice(-8)}`}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">{formatDate(inv.invoice_date)}</p>
                                                </div>
                                                <InvoiceStatusBadge status={inv.status} />
                                                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                                    {formatCurrency(inv.amount_paid, inv.currency)}
                                                </span>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                                    onClick={() => handleDownloadInvoice(inv.invoice_id)}
                                                    disabled={downloadingInvoice === inv.invoice_id}
                                                >
                                                    {downloadingInvoice === inv.invoice_id
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <Download className="h-3.5 w-3.5" />}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Credit Activity */}
                            {creditLedger && creditLedger.transactions.length > 0 && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Recent Credit Activity</h3>
                                        <button className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-0.5 transition-colors" onClick={() => setActiveTab('credits')}>
                                            View All <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {creditLedger.transactions.slice(0, 4).map((tx, i) => (
                                            <CreditRow key={`${tx.created_at}-${i}`} tx={tx} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <FAQSection />
                        </TabsContent>

                        {/* ─── PLANS TAB ─── */}
                        <TabsContent value="plans" className="space-y-8">

                            {/* Billing Cycle Toggle */}
                            <div className="flex items-center justify-center">
                                <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100/80 p-1">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'monthly'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Yearly
                                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                                            Save 20%
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Plan Cards */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {plans.map((plan, index) => {
                                    const isCurrent = plan.plan === currentPlan;
                                    const isEnterprise = plan.plan === 'enterprise';
                                    const isFree = plan.plan === 'free';
                                    const isHighlighted = plan.plan === 'professional';
                                    const priceId = getPriceId(plan.plan);

                                    return (
                                        <motion.div
                                            key={plan.plan}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                                        >
                                            <div className={`
                                                relative flex flex-col h-full rounded-2xl border bg-white p-6
                                                transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/80
                                                ${isHighlighted
                                                    ? 'border-purple-200 ring-1 ring-purple-100 shadow-lg shadow-purple-50'
                                                    : isCurrent
                                                        ? 'border-emerald-200 ring-1 ring-emerald-50'
                                                        : 'border-gray-100 hover:border-gray-200 hover:-translate-y-0.5'
                                                }
                                            `}>
                                                {isHighlighted && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                        <span className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md shadow-purple-200">
                                                            Most Popular
                                                        </span>
                                                    </div>
                                                )}
                                                {isCurrent && !isHighlighted && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                        <span className="rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md shadow-emerald-200">
                                                            Current Plan
                                                        </span>
                                                    </div>
                                                )}

                                                <h3 className="text-base font-semibold text-gray-900 mb-4 mt-1">{plan.display_name}</h3>

                                                <div className="mb-6 flex items-end gap-1.5">
                                                    <span className="text-3xl font-bold text-gray-900">{getDisplayPrice(plan)}</span>
                                                    {plan.price_monthly !== null && plan.price_monthly > 0 && (
                                                        <span className="text-sm text-gray-400 mb-0.5">/mo{billingCycle === 'yearly' ? ' billed yearly' : ''}</span>
                                                    )}
                                                    {plan.price_monthly === null && (
                                                        <span className="text-xs text-gray-400 mb-1">contact sales</span>
                                                    )}
                                                </div>

                                                <ul className="flex-1 space-y-3 text-sm mb-6">
                                                    {[
                                                        `${plan.max_agents === -1 ? 'Unlimited' : plan.max_agents} agent${plan.max_agents !== 1 ? 's' : ''}`,
                                                        `${plan.max_agent_runs_per_month === -1 ? 'Unlimited' : plan.max_agent_runs_per_month.toLocaleString()} runs/mo`,
                                                        `${plan.max_documents_per_month === -1 ? 'Unlimited' : plan.max_documents_per_month.toLocaleString()} documents/mo`,
                                                        `${plan.max_file_upload_mb} MB max file upload`,
                                                    ].map((feature, fi) => (
                                                        <li key={fi} className="flex items-start gap-2 text-gray-600">
                                                            <Check className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                    {plan.advanced_features && (
                                                        <li className="flex items-start gap-2 text-gray-600">
                                                            <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                            <span>Advanced features</span>
                                                        </li>
                                                    )}
                                                    {plan.priority_support && (
                                                        <li className="flex items-start gap-2 text-gray-600">
                                                            <Check className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                                            <span>Priority support</span>
                                                        </li>
                                                    )}
                                                    {plan.api_access && (
                                                        <li className="flex items-start gap-2 text-gray-600">
                                                            <Check className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                                            <span>API access</span>
                                                        </li>
                                                    )}
                                                </ul>

                                                {isCurrent ? (
                                                    <Button disabled className="w-full rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default">
                                                        Current Plan
                                                    </Button>
                                                ) : isFree ? (
                                                    <Button disabled variant="outline" className="w-full rounded-lg text-sm font-medium border-gray-200 text-gray-400 cursor-default">
                                                        Free Forever
                                                    </Button>
                                                ) : isEnterprise ? (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-lg text-sm font-semibold border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        onClick={() => window.location.href = 'mailto:sales@lumicoria.ai'}
                                                    >
                                                        Contact Sales
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className={`w-full rounded-lg text-sm font-semibold transition-all ${isHighlighted
                                                            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
                                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                                        }`}
                                                        onClick={() => handleCheckout(priceId)}
                                                        disabled={!!checkoutLoading}
                                                    >
                                                        {checkoutLoading === priceId && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                        {checkoutLoading === priceId ? 'Redirecting…' : 'Upgrade'}
                                                        {checkoutLoading !== priceId && <ArrowRight className="h-4 w-4 ml-2" />}
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <FAQSection />
                        </TabsContent>

                        {/* ─── INVOICES TAB ─── */}
                        <TabsContent value="invoices">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Receipt className="h-5 w-5 text-purple-600" />
                                            Invoice History
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {invoiceCount} total invoice{invoiceCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {currentPlan !== 'free' && (
                                        <Button
                                            variant="outline" size="sm"
                                            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs self-start"
                                            onClick={handlePortal}
                                            disabled={portalLoading}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                            Open Stripe Portal
                                        </Button>
                                    )}
                                </div>

                                {invoices && invoices.invoices.length > 0 ? (
                                    <div className="overflow-x-auto -mx-6">
                                        <table className="w-full text-sm min-w-[600px]">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Invoice</th>
                                                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="text-right py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                                    <th className="text-right py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.invoices.map((inv) => (
                                                    <tr key={inv.invoice_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                                                                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                                </div>
                                                                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                                                                    {inv.invoice_number || `INV-${inv.invoice_id.slice(-8)}`}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-3 text-gray-500">{formatDate(inv.invoice_date)}</td>
                                                        <td className="py-3.5 px-3"><InvoiceStatusBadge status={inv.status} /></td>
                                                        <td className="py-3.5 px-3 text-right font-semibold text-gray-900 tabular-nums">
                                                            {formatCurrency(inv.amount_paid, inv.currency)}
                                                        </td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                                    onClick={() => handleDownloadInvoice(inv.invoice_id)}
                                                                    disabled={downloadingInvoice === inv.invoice_id}
                                                                    title="Download PDF"
                                                                >
                                                                    {downloadingInvoice === inv.invoice_id
                                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                        : <Download className="h-3.5 w-3.5" />}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                                    onClick={() => handleExportInvoice(inv.invoice_id)}
                                                                    title="Export JSON"
                                                                >
                                                                    <FileText className="h-3.5 w-3.5" />
                                                                </Button>
                                                                {inv.hosted_invoice_url && (
                                                                    <Button
                                                                        variant="ghost" size="icon"
                                                                        className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                                        onClick={() => window.open(inv.hosted_invoice_url!, '_blank')}
                                                                        title="View on Stripe"
                                                                    >
                                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Receipt className="h-8 w-8 text-gray-300" />}
                                        title="No invoices yet"
                                        description="Invoices will appear here after your first payment."
                                    />
                                )}
                            </div>
                        </TabsContent>

                        {/* ─── CREDITS TAB ─── */}
                        <TabsContent value="credits" className="space-y-6">

                            {/* Balance Hero */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center relative overflow-hidden">
                                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-purple-100/40 blur-[80px]" />
                                <div className="relative">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-200">
                                        <Coins className="h-7 w-7 text-white" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Available Credits</p>
                                    <p className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums mb-1">{credits.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400">≈ {formatCurrency(credits)} USD value</p>
                                </div>
                            </div>

                            {/* Transaction History */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        Transaction History
                                    </h2>
                                </div>
                                <p className="text-xs text-gray-400 mb-6">
                                    {txCount} total transaction{txCount !== 1 ? 's' : ''}
                                </p>

                                {creditLedger && creditLedger.transactions.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {creditLedger.transactions.map((tx, i) => (
                                            <CreditRow key={`${tx.created_at}-${i}`} tx={tx} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Coins className="h-8 w-8 text-gray-300" />}
                                        title="No transactions yet"
                                        description="Credit transactions will appear here as you use the platform."
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </FadeInSection>

            </div>
        </div>
    );
};

export default Billing;
