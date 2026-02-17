import React from 'react';
import { Target, Heart, Lightbulb, Users, Globe, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const VALUES = [
    {
        icon: <Lightbulb className="w-6 h-6" />,
        title: 'Innovation First',
        description: 'We push boundaries with multi-model AI architecture, routing queries to the optimal model for every task.',
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: 'Privacy & Security',
        description: 'Enterprise-grade security with end-to-end encryption, SOC 2 compliance, and zero data training policies.',
    },
    {
        icon: <Heart className="w-6 h-6" />,
        title: 'Well-being Centered',
        description: "We believe productivity and personal wellness go hand in hand. It's built into our platform's DNA.",
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: 'Accessible AI',
        description: 'Powerful AI should be available to everyone — students, professionals, and teams of all sizes.',
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: 'Global Impact',
        description: 'Serving users across 50+ countries with multilingual support and culturally aware AI agents.',
    },
    {
        icon: <Sparkles className="w-6 h-6" />,
        title: 'Continuous Learning',
        description: 'Our agents evolve with you, learning your preferences and adapting to your workflows.',
    },
];

const STATS = [
    { value: '21+', label: 'Specialized AI Agents' },
    { value: '6', label: 'Frontier AI Models' },
    { value: '50+', label: 'Countries Served' },
    { value: '99.9%', label: 'Uptime SLA' },
];

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative pt-24 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-lumicoria-purple/[0.03] blur-3xl pointer-events-none" />

                <div className="relative container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600 mb-8">
                        <Target className="w-4 h-4" />
                        Our Story
                    </div>
                    <h1 className="text-4xl md:text-[56px] font-bold tracking-tight leading-[1.1] text-gray-900 mb-5">
                        AI That{' '}
                        <span className="gradient-text">
                            Understands You
                        </span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
                        Lumicoria was born from a simple belief: artificial intelligence should amplify human potential,
                        not replace it. We're building the most intuitive AI platform that adapts to the way you think,
                        work, and create.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="container mx-auto px-4 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="text-center p-6 rounded-2xl border border-gray-100 bg-white"
                        >
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission */}
            <section className="container mx-auto px-4 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-500 leading-relaxed">
                                To democratize access to the world's best AI models through an intelligent routing
                                system that automatically selects the optimal model for every query — making
                                enterprise-grade AI accessible to students, professionals, and teams without requiring
                                technical expertise.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                            <p className="text-gray-500 leading-relaxed">
                                A world where everyone has a personal AI copilot that understands their unique context,
                                respects their privacy, and grows with them — combining productivity, creativity,
                                and well-being into a single platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 py-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Values</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            The principles that guide every decision we make.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {VALUES.map((value) => (
                            <div
                                key={value.title}
                                className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
                            >
                                <div className="p-2.5 rounded-xl bg-lumicoria-purple/10 text-lumicoria-purple w-fit mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">{value.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-4 py-24 text-center">
                <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-gradient-to-r from-lumicoria-purple to-lumicoria-deepPurple text-white">
                    <h2 className="text-2xl font-bold mb-4">Ready to experience the future of AI?</h2>
                    <p className="text-white/80 mb-8">Start free, upgrade when you're ready.</p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-lumicoria-purple font-medium hover:bg-gray-100 transition-all"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
