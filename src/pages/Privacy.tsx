import React from 'react';
import { Shield } from 'lucide-react';
import Footer from '@/components/Footer';

const SECTIONS = [
    {
        title: '1. Information We Collect',
        content: `We collect information you provide directly, including your name, email address, and account credentials when you create an account. We also collect usage data such as queries sent to our AI agents, documents uploaded for processing, and interaction patterns to improve our service. We do not sell your personal data to third parties.`,
    },
    {
        title: '2. How We Use Your Information',
        content: `Your information is used to provide and improve Lumicoria's AI services, process your requests through our multi-model routing system, maintain conversation history for context continuity, enforce subscription plan limits, and communicate service updates. We use anonymized, aggregated data for product analytics.`,
    },
    {
        title: '3. AI Model Data Processing',
        content: `When you interact with Lumicoria, your queries are routed to third-party AI model providers (Google, OpenAI, Anthropic, Perplexity). These providers process your queries under their respective data processing agreements. We do not use your data to train AI models. Your conversation history is stored in our secure MongoDB database and is accessible only to you.`,
    },
    {
        title: '4. Data Storage & Security',
        content: `We implement industry-standard security measures including end-to-end encryption for data in transit (TLS 1.3), encryption at rest for all stored data, secure webhook signature verification for payment processing, rate limiting to prevent abuse, and prompt injection detection. Your data is stored on secure cloud infrastructure with regular security audits.`,
    },
    {
        title: '5. Payment Information',
        content: `Billing is handled entirely through Stripe's PCI-compliant hosted checkout. We never store your credit card details on our servers. Stripe processes and stores your payment information under their security standards. We only store your Stripe customer ID, subscription status, and usage metrics.`,
    },
    {
        title: '6. Your Rights',
        content: `You have the right to access, correct, or delete your personal data at any time through your account settings or by contacting us. You can export your conversation history, delete individual conversations, cancel your subscription, and request complete account deletion. We will process deletion requests within 30 days.`,
    },
    {
        title: '7. Cookies & Analytics',
        content: `We use essential cookies for authentication and session management. We may use analytics tools to understand usage patterns and improve our service. You can manage cookie preferences through your browser settings. We do not use cookies for advertising purposes.`,
    },
    {
        title: '8. Changes to This Policy',
        content: `We may update this privacy policy from time to time. We will notify you of significant changes via email or in-app notification at least 30 days before they take effect. Continued use of the service after changes constitutes acceptance of the updated policy.`,
    },
    {
        title: '9. Contact Us',
        content: `If you have questions about this privacy policy or your data, please contact us at privacy@lumicoria.ai or through our Contact page.`,
    },
];

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
                <div className="relative container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600 mb-6">
                        <Shield className="w-4 h-4" />
                        Legal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: February 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-4 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="p-8 rounded-2xl border border-gray-100 bg-white">
                        <p className="text-gray-500 leading-relaxed mb-8">
                            At Lumicoria.ai, we take your privacy seriously. This policy describes how we collect,
                            use, and protect your personal information when you use our AI platform and services.
                        </p>

                        <div className="space-y-8">
                            {SECTIONS.map((section) => (
                                <div key={section.title}>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Privacy;
