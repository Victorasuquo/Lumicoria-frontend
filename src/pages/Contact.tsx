import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import Footer from '@/components/Footer';

const CONTACT_OPTIONS = [
    {
        icon: <Mail className="w-5 h-5" />,
        title: 'Email Us',
        detail: 'hello@lumicoria.ai',
        description: 'For general inquiries and partnerships',
    },
    {
        icon: <MessageSquare className="w-5 h-5" />,
        title: 'Live Chat',
        detail: 'Available in-app',
        description: 'Chat with our AI-powered support agent',
    },
    {
        icon: <Clock className="w-5 h-5" />,
        title: 'Response Time',
        detail: 'Within 24 hours',
        description: 'Priority support for Pro & Enterprise users',
    },
];

const Contact: React.FC = () => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-lumicoria-purple/[0.03] blur-3xl pointer-events-none" />

                <div className="relative container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600 mb-6">
                        <Mail className="w-4 h-4" />
                        Get in Touch
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Contact{' '}
                        <span className="gradient-text">Us</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto">
                        Have a question, feature request, or partnership idea? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-24">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {CONTACT_OPTIONS.map((opt) => (
                            <div
                                key={opt.title}
                                className="p-5 rounded-2xl border border-gray-100 bg-white"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-xl bg-lumicoria-purple/10 text-lumicoria-purple">
                                        {opt.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-0.5">{opt.title}</h3>
                                        <p className="text-sm text-lumicoria-purple mb-1">{opt.detail}</p>
                                        <p className="text-xs text-gray-400">{opt.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-lumicoria-purple/10 text-lumicoria-purple">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-0.5">Location</h3>
                                    <p className="text-sm text-gray-500">Remote-first company</p>
                                    <p className="text-xs text-gray-400">Serving 50+ countries worldwide</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="p-8 rounded-2xl border border-gray-100 bg-white">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500 mb-6">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Message Sent!</h3>
                                    <p className="text-gray-500 mb-6">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormState({ name: '', email: '', subject: '', message: '' });
                                        }}
                                        className="text-sm text-lumicoria-purple hover:underline transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.name}
                                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-lumicoria-purple/50 focus:ring-1 focus:ring-lumicoria-purple/30 transition-all text-sm"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formState.email}
                                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-lumicoria-purple/50 focus:ring-1 focus:ring-lumicoria-purple/30 transition-all text-sm"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <select
                                            value={formState.subject}
                                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-lumicoria-purple/50 focus:ring-1 focus:ring-lumicoria-purple/30 transition-all text-sm appearance-none"
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="billing">Billing Question</option>
                                            <option value="enterprise">Enterprise Plan</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="feedback">Feature Request</option>
                                            <option value="bug">Bug Report</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={formState.message}
                                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-lumicoria-purple/50 focus:ring-1 focus:ring-lumicoria-purple/30 transition-all text-sm resize-none"
                                            placeholder="Tell us what's on your mind..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
