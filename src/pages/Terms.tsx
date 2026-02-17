import React from 'react';
import { FileText } from 'lucide-react';
import Footer from '@/components/Footer';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        content: `By accessing or using Lumicoria.ai ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not access or use the Service. These terms apply to all users, including visitors, registered users, and subscribers.`,
    },
    {
        title: '2. Account Registration',
        content: `To use certain features, you must create an account with accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be at least 16 years old to create an account. You must notify us immediately of any unauthorized use of your account.`,
    },
    {
        title: '3. Subscription Plans & Billing',
        content: `Lumicoria offers Free, Starter ($29/month), Professional ($79/month), and Enterprise plans. Paid subscriptions are billed through Stripe on a monthly or annual basis. You may cancel at any time; access continues until the end of the billing period. Refunds are handled on a case-by-case basis within 14 days of subscription start. We reserve the right to change pricing with 30 days advance notice.`,
    },
    {
        title: '4. Usage Limits & Fair Use',
        content: `Each plan includes specific usage limits for agent runs, document processing, and knowledge base queries. Exceeding your plan's limits will result in temporary restriction of the exceeded feature until the next billing period or an upgrade. Automated or abusive usage patterns that significantly exceed fair use may result in account suspension.`,
    },
    {
        title: '5. Acceptable Use',
        content: `You may not use Lumicoria to: generate harmful, illegal, or misleading content; attempt to bypass security measures or prompt injection protections; reverse-engineer, decompile, or extract our AI routing algorithms; resell or redistribute API access without authorization; upload malicious files or content designed to exploit our systems; harass, abuse, or harm others through the platform.`,
    },
    {
        title: '6. Intellectual Property',
        content: `You retain ownership of all content you upload or create using Lumicoria. We retain ownership of the Lumicoria platform, its AI routing technology, agent architectures, and all related intellectual property. AI-generated responses are provided for your use but are generated using third-party models subject to their respective terms.`,
    },
    {
        title: '7. AI-Generated Content Disclaimer',
        content: `AI-generated content may contain inaccuracies. Lumicoria does not guarantee the accuracy, completeness, or reliability of responses from any AI model. You are responsible for reviewing and verifying all AI-generated content before relying on it for critical decisions. Do not use AI-generated content as a substitute for professional advice (medical, legal, financial).`,
    },
    {
        title: '8. Service Availability',
        content: `We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform scheduled maintenance with advance notice. We are not liable for service interruptions caused by third-party AI model providers, infrastructure failures, or force majeure events.`,
    },
    {
        title: '9. Termination',
        content: `We may suspend or terminate your account for violations of these terms, with notice when possible. You may delete your account at any time through the settings page. Upon termination, your data will be retained for 30 days and then permanently deleted unless required by law.`,
    },
    {
        title: '10. Limitation of Liability',
        content: `To the maximum extent permitted by law, Lumicoria's total liability is limited to the amount you've paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, special, or consequential damages arising from your use of the Service.`,
    },
    {
        title: '11. Changes to Terms',
        content: `We may update these terms with 30 days notice via email or in-app notification. Continued use after the effective date constitutes acceptance. Material changes will require explicit re-acceptance.`,
    },
    {
        title: '12. Contact',
        content: `For questions about these terms, contact us at legal@lumicoria.ai or through our Contact page.`,
    },
];

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
                <div className="relative container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600 mb-6">
                        <FileText className="w-4 h-4" />
                        Legal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                    <p className="text-gray-500">Last updated: February 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-4 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="p-8 rounded-2xl border border-gray-100 bg-white">
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Please read these Terms of Service carefully before using Lumicoria.ai.
                            By using our platform, you agree to the following terms and conditions.
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

export default Terms;
