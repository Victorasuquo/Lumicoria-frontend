import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Minus, ArrowRight, Shield, ChevronRight, Lock, CreditCard } from 'lucide-react';
import { billingApi, type PlanInfo } from '@/services/api';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════
   Feature comparison rows
   ═══════════════════════════════════════════════════════════════════ */

const FEATURE_ROWS: { label: string; free: string | boolean; starter: string | boolean; pro: string | boolean; enterprise: string | boolean }[] = [
    { label: 'AI Agents', free: '2', starter: '5', pro: '15', enterprise: 'Unlimited' },
    { label: 'Agent Runs / Month', free: '50', starter: '500', pro: '5,000', enterprise: 'Unlimited' },
    { label: 'Documents / Month', free: '10', starter: '100', pro: '1,000', enterprise: 'Unlimited' },
    { label: 'Max File Upload', free: '5 MB', starter: '10 MB', pro: '50 MB', enterprise: '100 MB' },
    { label: 'Knowledge Base Queries', free: '20', starter: '200', pro: '2,000', enterprise: 'Unlimited' },
    { label: 'AI Models', free: 'Default', starter: '4 models', pro: '6 models', enterprise: 'All models' },
    { label: 'Advanced Features', free: false, starter: false, pro: true, enterprise: true },
    { label: 'Custom Agent Templates', free: false, starter: false, pro: true, enterprise: true },
    { label: 'API Access', free: false, starter: false, pro: true, enterprise: true },
    { label: 'Priority Support', free: false, starter: false, pro: true, enterprise: true },
    { label: 'Dedicated Account Manager', free: false, starter: false, pro: false, enterprise: true },
    { label: 'SLA Guarantee', free: false, starter: false, pro: false, enterprise: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
    if (typeof value === 'boolean') {
        return value
            ? <Check className="h-4 w-4 text-gray-900 mx-auto" />
            : <Minus className="h-4 w-4 text-gray-300 mx-auto" />;
    }
    return <span className="text-sm text-gray-700 font-medium">{value}</span>;
}

const PLAN_LOGOS: Record<string, { logo: string; cardBorder: string; checkColor: string; btnClass: string }> = {
    free: {
        logo: '/images/lumicoria-logo-white.png',
        cardBorder: 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        checkColor: 'text-gray-400',
        btnClass: 'border-gray-200 text-gray-600 hover:bg-gray-50',
    },
    starter: {
        logo: '/images/lumicoria-logo-primary.png',
        cardBorder: 'border-purple-200 hover:border-purple-300 hover:shadow-sm',
        checkColor: 'text-purple-500',
        btnClass: 'bg-purple-600 text-white hover:bg-purple-700',
    },
    professional: {
        logo: '/images/lumicoria-logo-gradient.png',
        cardBorder: 'border-gray-900 ring-1 ring-gray-900 shadow-xl shadow-gray-200/50',
        checkColor: 'text-gray-900',
        btnClass: 'bg-gray-900 text-white hover:bg-gray-800 shadow-md',
    },
    enterprise: {
        logo: '/images/lumicoria-logo-mono.png',
        cardBorder: 'border-gray-300 hover:border-gray-400 hover:shadow-sm',
        checkColor: 'text-gray-600',
        btnClass: 'border-gray-900 text-gray-900 hover:bg-gray-50',
    },
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
    free: 'Get started with core agents and essential workflows',
    starter: 'For individuals and small teams getting productive',
    professional: 'For growing businesses that need full power',
    enterprise: 'Security, scale, and governance for large organizations',
};

/* ═══════════════════════════════════════════════════════════════════
   FAQs
   ═══════════════════════════════════════════════════════════════════ */

const faqs = [
    { q: 'What is included in the Free tier?', a: 'You get access to 2 pre-built agents, 50 agent runs per month, 10 documents per month, and 20 knowledge base queries.' },
    { q: 'Which AI models does Lumicoria support?', a: 'Lumicoria supports multiple AI providers including OpenAI, Anthropic, Google Gemini, Perplexity, and Mistral. Available models depend on your plan.' },
    { q: 'Can I switch plans at any time?', a: 'Yes. Upgrades take effect immediately with prorated charges. Downgrades apply at the end of the current billing period.' },
    { q: 'Is there a free trial for paid plans?', a: 'Yes! Starter and Professional plans include a 14-day free trial. No charge until the trial ends.' },
    { q: 'What happens when I hit my usage limit?', a: "You'll be notified and prompted to upgrade. Running operations will complete — we won't cut you off mid-task." },
    { q: 'Is my payment information secure?', a: 'All payments are processed by Stripe, PCI Level 1 certified — the highest level of security in the payments industry. We never store your card details.' },
];

/* ═══════════════════════════════════════════════════════════════════
   Main Pricing Page
   ═══════════════════════════════════════════════════════════════════ */

const Pricing = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<PlanInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        billingApi.getPlans()
            .then(setPlans)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const getDisplayPrice = (plan: PlanInfo): string => {
        if (!plan.price_monthly) return 'Custom';
        if (plan.price_monthly === 0) return '$0';
        if (billingCycle === 'yearly') {
            const yearly = Math.round(plan.price_monthly * 12 * 0.8);
            return `$${Math.round(yearly / 12)}`;
        }
        return `$${plan.price_monthly}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">

                {/* ═══ HERO ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center mb-12"
                >
                    <div className="mb-6 inline-flex items-center">
                        <img src="/images/lumicoria-logo-mono.png" alt="Lumicoria" className="h-8 w-auto" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                        Simple, transparent pricing
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                        Start free and scale as you grow. Choose the plan that matches your needs today.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
                        {['Cancel anytime', '14-day free trial', 'No credit card required'].map((tag) => (
                            <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ BILLING TOGGLE ═══ */}
                <div className="flex items-center justify-center mb-10">
                    <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Yearly
                            <span className="rounded-full bg-gray-900 text-white px-2 py-0.5 text-[10px] font-semibold">
                                -20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* ═══ PLAN CARDS ═══ */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
                                <div className="h-10 w-10 rounded-xl bg-gray-100" />
                                <div className="h-5 w-24 rounded bg-gray-100" />
                                <div className="h-8 w-20 rounded bg-gray-100" />
                                <div className="space-y-3 pt-4">
                                    {[1, 2, 3, 4].map(j => <div key={j} className="h-4 w-full rounded bg-gray-50" />)}
                                </div>
                                <div className="h-10 w-full rounded-lg bg-gray-100 mt-4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {plans.map((plan, index) => {
                            const isEnterprise = plan.plan === 'enterprise';
                            const isFree = plan.plan === 'free';
                            const isHighlighted = plan.plan === 'professional';
                            const scheme = PLAN_LOGOS[plan.plan] || PLAN_LOGOS.free;

                            return (
                                <motion.div
                                    key={plan.plan}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.08 }}
                                >
                                    <div className={`
                                        relative flex flex-col h-full rounded-2xl border bg-white p-6
                                        transition-all duration-300 hover:-translate-y-0.5
                                        ${scheme.cardBorder}
                                    `}>
                                        {isHighlighted && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="rounded-full bg-gray-900 px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <img
                                            src={scheme.logo}
                                            alt={plan.display_name}
                                            className="h-10 w-10 rounded-xl object-cover mb-4 mt-1"
                                        />

                                        <h3 className="text-base font-semibold text-gray-900 mb-1">{plan.display_name}</h3>
                                        <p className="text-xs text-gray-400 mb-4">{PLAN_DESCRIPTIONS[plan.plan] || ''}</p>

                                        <div className="mb-2 flex items-end gap-1.5">
                                            <span className="text-3xl font-bold text-gray-900">{getDisplayPrice(plan)}</span>
                                            {plan.price_monthly !== null && plan.price_monthly > 0 && (
                                                <span className="text-sm text-gray-400 mb-0.5">/mo</span>
                                            )}
                                            {plan.price_monthly === null && (
                                                <span className="text-xs text-gray-400 mb-1">contact us</span>
                                            )}
                                        </div>
                                        {billingCycle === 'yearly' && plan.price_monthly !== null && plan.price_monthly > 0 && (
                                            <p className="text-xs text-gray-400 mb-4">
                                                ${Math.round(plan.price_monthly * 12 * 0.8)}/year
                                            </p>
                                        )}
                                        {(billingCycle !== 'yearly' || !plan.price_monthly) && <div className="mb-4" />}

                                        <Separator className="mb-5" />

                                        <ul className="flex-1 space-y-3 text-sm mb-6">
                                            {[
                                                `${plan.max_agents === -1 ? 'Unlimited' : plan.max_agents} agent${plan.max_agents !== 1 ? 's' : ''}`,
                                                `${plan.max_agent_runs_per_month === -1 ? 'Unlimited' : plan.max_agent_runs_per_month.toLocaleString()} runs/mo`,
                                                `${plan.max_documents_per_month === -1 ? 'Unlimited' : plan.max_documents_per_month.toLocaleString()} docs/mo`,
                                                `${plan.max_file_upload_mb} MB upload limit`,
                                            ].map((feature, fi) => (
                                                <li key={fi} className="flex items-start gap-2.5 text-gray-600">
                                                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${scheme.checkColor}`} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                            {plan.advanced_features && (
                                                <li className="flex items-start gap-2.5 text-gray-600">
                                                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${scheme.checkColor}`} />
                                                    <span>Advanced features</span>
                                                </li>
                                            )}
                                            {plan.priority_support && (
                                                <li className="flex items-start gap-2.5 text-gray-600">
                                                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${scheme.checkColor}`} />
                                                    <span>Priority support</span>
                                                </li>
                                            )}
                                            {plan.api_access && (
                                                <li className="flex items-start gap-2.5 text-gray-600">
                                                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${scheme.checkColor}`} />
                                                    <span>API access</span>
                                                </li>
                                            )}
                                        </ul>

                                        {isFree ? (
                                            <Button
                                                variant="outline"
                                                className={`w-full rounded-lg text-sm font-semibold ${scheme.btnClass}`}
                                                onClick={() => navigate('/signup')}
                                            >
                                                Get Started Free
                                            </Button>
                                        ) : isEnterprise ? (
                                            <Button
                                                variant="outline"
                                                className={`w-full rounded-lg text-sm font-semibold ${scheme.btnClass}`}
                                                onClick={() => window.location.href = 'mailto:sales@lumicoria.ai'}
                                            >
                                                Contact Sales
                                            </Button>
                                        ) : (
                                            <Button
                                                className={`w-full rounded-lg text-sm font-semibold ${scheme.btnClass}`}
                                                onClick={() => navigate('/billing')}
                                            >
                                                Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* ═══ COMPARE ALL FEATURES ═══ */}
                <div className="mt-10 text-center">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {showComparison ? 'Hide comparison' : 'Compare all features'}
                        <ChevronRight className={`h-4 w-4 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                {showComparison && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-6"
                    >
                        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[240px]">Feature</th>
                                            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Free</th>
                                            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Starter</th>
                                            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-100">Professional</th>
                                            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enterprise</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {FEATURE_ROWS.map((row, i) => (
                                            <tr key={row.label} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                                <td className="py-3.5 px-6 text-sm text-gray-700 font-medium">{row.label}</td>
                                                <td className="py-3.5 px-4 text-center"><FeatureCell value={row.free} /></td>
                                                <td className="py-3.5 px-4 text-center"><FeatureCell value={row.starter} /></td>
                                                <td className="py-3.5 px-4 text-center bg-gray-50/50"><FeatureCell value={row.pro} /></td>
                                                <td className="py-3.5 px-4 text-center"><FeatureCell value={row.enterprise} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ ENTERPRISE CTA ═══ */}
                <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-black">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Need a custom solution?</h2>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        We tailor enterprise deployments with advanced security, governance, and custom integrations for regulated and high-scale teams.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6 rounded-lg border-gray-900 text-gray-900 hover:bg-gray-100 font-semibold"
                        onClick={() => window.location.href = 'mailto:sales@lumicoria.ai'}
                    >
                        Contact Sales <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

                {/* ═══ FAQ ═══ */}
                <div className="mt-16 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
                    <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100">
                        {faqs.map((item, i) => (
                            <div key={i}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between py-4 px-6 text-left group"
                                >
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors pr-4">{item.q}</p>
                                    <ChevronRight className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-90' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="px-6 pb-4"
                                    >
                                        <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ TRUST BADGES ═══ */}
                <div className="flex flex-wrap items-center justify-center gap-6 py-10 mt-8">
                    {[
                        { icon: Lock, label: 'SSL Encrypted' },
                        { icon: Shield, label: 'PCI Compliant' },
                        { icon: CreditCard, label: 'Powered by Stripe' },
                    ].map((badge) => (
                        <div key={badge.label} className="flex items-center gap-2 text-gray-400">
                            <badge.icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{badge.label}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Pricing;
