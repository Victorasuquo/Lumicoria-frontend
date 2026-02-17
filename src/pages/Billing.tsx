import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, ArrowRight, Loader2, AlertCircle, ExternalLink, Zap, BarChart3 } from 'lucide-react';
import { billingApi, type PlanInfo, type SubscriptionInfo, type UsageInfo } from '@/services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    trialing: 'bg-blue-100 text-blue-700 border-blue-200',
    past_due: 'bg-amber-100 text-amber-700 border-amber-200',
    canceled: 'bg-red-100 text-red-700 border-red-200',
    incomplete: 'bg-gray-100 text-gray-600 border-gray-200',
    unpaid: 'bg-red-100 text-red-700 border-red-200',
    paused: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    trialing: 'Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
    incomplete: 'Incomplete',
    unpaid: 'Unpaid',
    paused: 'Paused',
};

/* ═══════════════════════════════════════════════════════════════════
   Helper
   ═══════════════════════════════════════════════════════════════════ */

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function usagePercent(current: number, limit: number): number {
    if (limit <= 0) return 0; // unlimited
    return Math.min(Math.round((current / limit) * 100), 100);
}

function limitLabel(limit: number): string {
    return limit === -1 ? '∞' : limit.toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

const Billing: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();

    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    /* ── Fetch data ── */
    useEffect(() => {
        const load = async () => {
            try {
                const [plansData, subData, usageData] = await Promise.all([
                    billingApi.getPlans(),
                    billingApi.getSubscription().catch(() => null),
                    billingApi.getUsage().catch(() => null),
                ]);
                setPlans(plansData);
                setSubscription(subData);
                setUsage(usageData);
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
            toast({ title: '🎉 Subscription activated!', description: 'Your plan has been updated. Welcome aboard!' });
            window.history.replaceState({}, '', '/billing');
        } else if (billingStatus === 'canceled') {
            toast({ title: 'Checkout canceled', description: 'No changes were made to your subscription.', variant: 'destructive' });
            window.history.replaceState({}, '', '/billing');
        }
    }, [searchParams, toast]);

    /* ── Checkout ── */
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

    /* ── Customer Portal ── */
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

    /* ── Price for display ── */
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

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#6c4ab0]" />
            </div>
        );
    }

    const currentPlan = subscription?.plan || 'free';
    const isActive = subscription?.is_active ?? true;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f7f6ff] text-[#1d143f] dark:bg-[#0c0a14] dark:text-[#f7f6ff]">
            {/* Background — matches Pricing page */}
            <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_10%_-10%,rgba(191,191,255,0.55),transparent_60%),radial-gradient(700px_520px_at_90%_0%,rgba(226,240,255,0.7),transparent_60%),linear-gradient(180deg,#f7f6ff_0%,#ffffff_55%,#ffffff_100%)] dark:bg-[radial-gradient(900px_520px_at_10%_-10%,rgba(70,58,126,0.5),transparent_60%),radial-gradient(700px_520px_at_90%_0%,rgba(80,115,170,0.3),transparent_60%),linear-gradient(180deg,#0c0a14_0%,#131024_60%,#0c0a14_100%)]" />

            <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">

                {/* ─── Header ─── */}
                <div className="mx-auto max-w-3xl text-center mb-12">
                    <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#372673] shadow-[0_12px_35px_-28px_rgba(55,38,115,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-[#e2dcff]">
                        <CreditCard className="h-3.5 w-3.5" />
                        Billing
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        Manage Your Subscription
                    </h1>
                    <p className="mt-4 text-lg text-[#5b5572] dark:text-[#c8c4e0]">
                        View your plan, track usage, and manage billing.
                    </p>
                </div>

                {/* ─── Current Plan + Usage ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">

                    {/* Current Plan Card */}
                    <Card className="rounded-[28px] border border-white/60 bg-white/80 shadow-[0_30px_80px_-50px_rgba(22,16,48,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl text-[#1d143f] dark:text-white">Current Plan</CardTitle>
                                <Badge className={`${STATUS_COLORS[subscription?.status || 'active']} border text-xs font-medium`}>
                                    {STATUS_LABELS[subscription?.status || 'active'] || subscription?.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-3xl font-bold text-[#1d143f] dark:text-white capitalize">
                                    {currentPlan === 'free' ? 'Free' : currentPlan}
                                </p>
                                {subscription?.trial_end && subscription?.status === 'trialing' && (
                                    <p className="text-sm text-[#6b6484] dark:text-[#b7b3cd] mt-1">
                                        Trial ends {formatDate(subscription.trial_end)}
                                    </p>
                                )}
                            </div>

                            {subscription?.current_period_start && (
                                <div className="text-sm text-[#6b6484] dark:text-[#b7b3cd] space-y-1">
                                    <p>Current period: {formatDate(subscription.current_period_start)} — {formatDate(subscription.current_period_end)}</p>
                                    {subscription.cancel_at_period_end && (
                                        <p className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            Cancels at end of period
                                        </p>
                                    )}
                                </div>
                            )}

                            {subscription?.status === 'past_due' && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                    <p className="font-medium">Payment past due</p>
                                    <p className="mt-1 text-xs">Please update your payment method to avoid service interruption.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {currentPlan !== 'free' && (
                                <Button
                                    variant="outline"
                                    className="rounded-full border-[#6c4ab0] text-[#6c4ab0] hover:bg-[#6c4ab0]/10 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                                    onClick={handlePortal}
                                    disabled={portalLoading}
                                >
                                    {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                                    Manage Billing
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Usage Card */}
                    <Card className="rounded-[28px] border border-white/60 bg-white/80 shadow-[0_30px_80px_-50px_rgba(22,16,48,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-[#6c4ab0]" />
                                <CardTitle className="text-xl text-[#1d143f] dark:text-white">Usage This Month</CardTitle>
                            </div>
                            {usage && (
                                <CardDescription className="text-[#6b6484] dark:text-[#c4c0da]">
                                    {new Date(0, (usage.month || 1) - 1).toLocaleString('default', { month: 'long' })} {usage.year}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Agent Runs */}
                            <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-[#524c68] dark:text-[#d1cde6]">Agent Runs</span>
                                    <span className="font-medium text-[#1d143f] dark:text-white">
                                        {(usage?.agent_runs || 0).toLocaleString()} / {limitLabel(usage?.agent_runs_limit || 50)}
                                    </span>
                                </div>
                                <Progress
                                    value={usagePercent(usage?.agent_runs || 0, usage?.agent_runs_limit || 50)}
                                    className="h-2 bg-[#e6e0ff] dark:bg-white/10"
                                />
                            </div>

                            {/* Documents */}
                            <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-[#524c68] dark:text-[#d1cde6]">Documents Processed</span>
                                    <span className="font-medium text-[#1d143f] dark:text-white">
                                        {(usage?.documents_processed || 0).toLocaleString()} / {limitLabel(usage?.documents_limit || 10)}
                                    </span>
                                </div>
                                <Progress
                                    value={usagePercent(usage?.documents_processed || 0, usage?.documents_limit || 10)}
                                    className="h-2 bg-[#e6e0ff] dark:bg-white/10"
                                />
                            </div>

                            {/* KB Queries */}
                            <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-[#524c68] dark:text-[#d1cde6]">Knowledge Base Queries</span>
                                    <span className="font-medium text-[#1d143f] dark:text-white">
                                        {(usage?.knowledge_base_queries || 0).toLocaleString()} / {limitLabel(usage?.knowledge_base_queries_limit || 20)}
                                    </span>
                                </div>
                                <Progress
                                    value={usagePercent(usage?.knowledge_base_queries || 0, usage?.knowledge_base_queries_limit || 20)}
                                    className="h-2 bg-[#e6e0ff] dark:bg-white/10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Billing Cycle Toggle ─── */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly'
                                ? 'bg-[#6c4ab0] text-white shadow-lg'
                                : 'bg-white/80 text-[#6b6484] border border-white/60 hover:bg-white dark:bg-white/5 dark:text-[#c4c0da] dark:border-white/10'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                ? 'bg-[#6c4ab0] text-white shadow-lg'
                                : 'bg-white/80 text-[#6b6484] border border-white/60 hover:bg-white dark:bg-white/5 dark:text-[#c4c0da] dark:border-white/10'
                            }`}
                    >
                        Yearly
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold dark:bg-emerald-900/30 dark:text-emerald-300">
                            Save 20%
                        </span>
                    </button>
                </div>

                {/* ─── Plan Cards ─── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 mb-16">
                    {plans.map((plan) => {
                        const isCurrent = plan.plan === currentPlan;
                        const isEnterprise = plan.plan === 'enterprise';
                        const isFree = plan.plan === 'free';
                        const isHighlighted = plan.plan === 'professional';
                        const priceId = getPriceId(plan.plan);

                        return (
                            <Card
                                key={plan.plan}
                                className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-white/80 backdrop-blur-2xl shadow-[0_30px_80px_-50px_rgba(22,16,48,0.35)] transition-all duration-300 ${isHighlighted
                                        ? 'border-[#6c4ab0]/60 ring-1 ring-[#6c4ab0]/30 shadow-[0_40px_100px_-60px_rgba(55,38,115,0.6)]'
                                        : isCurrent
                                            ? 'border-emerald-400/60 ring-1 ring-emerald-400/30'
                                            : 'border-white/70 hover:-translate-y-1 hover:border-[#c7b8f7]'
                                    } dark:border-white/10 dark:bg-white/5`}
                            >
                                {isHighlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <span className="rounded-full bg-[#6c4ab0] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                {isCurrent && !isHighlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                <CardHeader className="pb-3 pt-8">
                                    <CardTitle className="text-xl text-[#1d143f] dark:text-white">{plan.display_name}</CardTitle>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <div className="mb-6 flex items-end gap-2">
                                        <span className="text-4xl font-semibold text-[#1d143f] dark:text-white">
                                            {getDisplayPrice(plan)}
                                        </span>
                                        {plan.price_monthly !== null && plan.price_monthly > 0 && (
                                            <span className="text-sm text-[#6b6484] dark:text-[#b7b3cd]">
                                                /mo{billingCycle === 'yearly' ? ' (billed yearly)' : ''}
                                            </span>
                                        )}
                                        {plan.price_monthly === null && (
                                            <span className="text-sm text-[#6b6484] dark:text-[#b7b3cd]">contact sales</span>
                                        )}
                                    </div>

                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                            <Check className="h-4 w-4 text-[#6c4ab0] mt-0.5 shrink-0" />
                                            <span>{plan.max_agents === -1 ? 'Unlimited' : plan.max_agents} agent{plan.max_agents !== 1 ? 's' : ''}</span>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                            <Check className="h-4 w-4 text-[#6c4ab0] mt-0.5 shrink-0" />
                                            <span>{plan.max_agent_runs_per_month === -1 ? 'Unlimited' : plan.max_agent_runs_per_month.toLocaleString()} runs/mo</span>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                            <Check className="h-4 w-4 text-[#6c4ab0] mt-0.5 shrink-0" />
                                            <span>{plan.max_documents_per_month === -1 ? 'Unlimited' : plan.max_documents_per_month.toLocaleString()} documents/mo</span>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                            <Check className="h-4 w-4 text-[#6c4ab0] mt-0.5 shrink-0" />
                                            <span>{plan.max_file_upload_mb} MB max file upload</span>
                                        </li>
                                        {plan.advanced_features && (
                                            <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                                <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                <span>Advanced features</span>
                                            </li>
                                        )}
                                        {plan.priority_support && (
                                            <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                                <Check className="h-4 w-4 text-[#6c4ab0] mt-0.5 shrink-0" />
                                                <span>Priority support</span>
                                            </li>
                                        )}
                                        {plan.api_access && (
                                            <li className="flex items-start gap-2.5 text-[#524c68] dark:text-[#d1cde6]">
                                                <Check className="h-4 w-4 text-[#6c4ab0] mt-0.5 shrink-0" />
                                                <span>API access</span>
                                            </li>
                                        )}
                                    </ul>
                                </CardContent>

                                <CardFooter className="mt-auto items-stretch pt-4">
                                    {isCurrent ? (
                                        <Button
                                            disabled
                                            className="w-full rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                                        >
                                            Current Plan
                                        </Button>
                                    ) : isFree ? (
                                        <Button
                                            disabled
                                            variant="outline"
                                            className="w-full rounded-full text-sm font-medium border-gray-200 text-gray-400 dark:border-white/10 dark:text-white/40"
                                        >
                                            Free Forever
                                        </Button>
                                    ) : isEnterprise ? (
                                        <Button
                                            className="w-full rounded-full text-sm font-semibold bg-white text-[#6c4ab0] border border-[#6c4ab0] hover:bg-[#6c4ab0]/10 dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20"
                                            onClick={() => window.location.href = 'mailto:sales@lumicoria.ai'}
                                        >
                                            Contact Sales
                                        </Button>
                                    ) : (
                                        <Button
                                            className={`w-full rounded-full text-sm font-semibold transition-all ${isHighlighted
                                                    ? 'bg-[#6c4ab0] text-white shadow-[0_18px_40px_-28px_rgba(55,38,115,0.7)] hover:bg-[#3b2d6a]'
                                                    : 'bg-white text-[#6c4ab0] border border-[#6c4ab0] hover:bg-[#6c4ab0]/10'
                                                } dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20`}
                                            onClick={() => handleCheckout(priceId)}
                                            disabled={!!checkoutLoading}
                                        >
                                            {checkoutLoading === priceId ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            {checkoutLoading === priceId ? 'Redirecting…' : 'Upgrade'}
                                            {checkoutLoading !== priceId && <ArrowRight className="h-4 w-4 ml-2" />}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* ─── FAQ ─── */}
                <div className="mx-auto max-w-2xl rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(22,16,48,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-xl font-semibold text-[#1d143f] dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <p className="font-medium text-[#1d143f] dark:text-white text-sm">Can I switch plans at any time?</p>
                            <p className="text-sm text-[#6b6484] dark:text-[#b7b3cd] mt-1">
                                Yes. Upgrades take effect immediately and you'll be charged a prorated amount. Downgrades take effect at the end of your current billing period.
                            </p>
                        </div>
                        <Separator className="bg-[#e6e0ff]/50 dark:bg-white/5" />
                        <div>
                            <p className="font-medium text-[#1d143f] dark:text-white text-sm">What happens when I hit my usage limit?</p>
                            <p className="text-sm text-[#6b6484] dark:text-[#b7b3cd] mt-1">
                                You'll be notified and asked to upgrade. We won't cut off access mid-task — any running operations will complete.
                            </p>
                        </div>
                        <Separator className="bg-[#e6e0ff]/50 dark:bg-white/5" />
                        <div>
                            <p className="font-medium text-[#1d143f] dark:text-white text-sm">How do I cancel my subscription?</p>
                            <p className="text-sm text-[#6b6484] dark:text-[#b7b3cd] mt-1">
                                Click "Manage Billing" above to open the Stripe Customer Portal, where you can cancel, update payment methods, and download invoices.
                            </p>
                        </div>
                        <Separator className="bg-[#e6e0ff]/50 dark:bg-white/5" />
                        <div>
                            <p className="font-medium text-[#1d143f] dark:text-white text-sm">Is there a free trial?</p>
                            <p className="text-sm text-[#6b6484] dark:text-[#b7b3cd] mt-1">
                                Yes! Starter and Professional plans come with a 14-day free trial. You won't be charged until the trial ends.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Billing;
