import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Zap, Shield, Sparkles, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

interface ModelCard {
    name: string;
    provider: string;
    description: string;
    strengths: string[];
    minPlan: string;
    badge: string;
    gradient: string;
    icon: React.ReactNode;
}

const MODELS: ModelCard[] = [
    {
        name: 'Gemini Flash',
        provider: 'Google DeepMind',
        description: 'Ultra-fast, cost-efficient model ideal for everyday tasks, summaries, and quick responses.',
        strengths: ['Lightning fast', 'Cost-efficient', 'Great for simple tasks'],
        minPlan: 'Free',
        badge: 'Included Free',
        gradient: 'from-blue-500 to-cyan-400',
        icon: <Zap className="w-6 h-6" />,
    },
    {
        name: 'Gemini Pro',
        provider: 'Google DeepMind',
        description: 'Advanced reasoning and multimodal capabilities for complex document analysis and research.',
        strengths: ['Deep reasoning', 'Multimodal', 'Long context window'],
        minPlan: 'Starter',
        badge: 'Starter+',
        gradient: 'from-indigo-500 to-purple-500',
        icon: <Sparkles className="w-6 h-6" />,
    },
    {
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Industry-leading general-purpose model with exceptional instruction following and creativity.',
        strengths: ['Creative writing', 'Code generation', 'Instruction following'],
        minPlan: 'Starter',
        badge: 'Starter+',
        gradient: 'from-emerald-500 to-teal-400',
        icon: <Cpu className="w-6 h-6" />,
    },
    {
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Compact but capable model, perfect for quick completions and structured data extraction.',
        strengths: ['Fast responses', 'Structured output', 'Cost-effective'],
        minPlan: 'Starter',
        badge: 'Starter+',
        gradient: 'from-green-500 to-emerald-400',
        icon: <Zap className="w-6 h-6" />,
    },
    {
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Thoughtful, nuanced responses with strong analytical and safety-aware capabilities.',
        strengths: ['Nuanced analysis', 'Long documents', 'Safety-focused'],
        minPlan: 'Professional',
        badge: 'Pro',
        gradient: 'from-orange-500 to-amber-400',
        icon: <Shield className="w-6 h-6" />,
    },
    {
        name: 'Sonar Large',
        provider: 'Perplexity',
        description: 'Real-time web search powered model for up-to-date research and fact-checking.',
        strengths: ['Live web search', 'Real-time data', 'Source citations'],
        minPlan: 'Professional',
        badge: 'Pro',
        gradient: 'from-rose-500 to-pink-400',
        icon: <Sparkles className="w-6 h-6" />,
    },
];

const Models: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-lumicoria-purple/[0.03] blur-3xl pointer-events-none" />

                <div className="relative container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600 mb-8">
                        <Cpu className="w-4 h-4" />
                        Multi-Model Intelligence
                    </div>
                    <h1 className="text-4xl md:text-[56px] font-bold tracking-tight leading-[1.1] text-gray-900 mb-5">
                        Powered by the{' '}
                        <span className="gradient-text">
                            World's Best AI
                        </span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Lumicoria routes your queries to the optimal model automatically.
                        Access 6+ frontier models from Google, OpenAI, Anthropic, and Perplexity.
                    </p>
                </div>
            </section>

            {/* Model Grid */}
            <section className="container mx-auto px-4 pb-24">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MODELS.map((model) => (
                        <div
                            key={model.name}
                            className="group relative rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300 overflow-hidden"
                        >
                            {/* Gradient stripe */}
                            <div className={`h-1 w-full bg-gradient-to-r ${model.gradient}`} />

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${model.gradient} text-white shadow-sm`}>
                                            {model.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{model.name}</h3>
                                            <p className="text-xs text-gray-400">{model.provider}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${model.minPlan === 'Free'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                : model.minPlan === 'Professional'
                                                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                            }`}
                                    >
                                        {model.badge}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{model.description}</p>

                                {/* Strengths */}
                                <div className="space-y-2">
                                    {model.strengths.map((s) => (
                                        <div key={s} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-lumicoria-purple flex-shrink-0" />
                                            {s}
                                        </div>
                                    ))}
                                </div>

                                {/* Min plan */}
                                {model.minPlan !== 'Free' && (
                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                                        <Lock className="w-3 h-3" />
                                        Requires {model.minPlan} plan or higher
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <p className="text-gray-500 mb-6">
                        Our intelligent router automatically selects the best model for your query.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/pricing"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
                        >
                            View Plans
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/chat"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Try It Free
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Models;
