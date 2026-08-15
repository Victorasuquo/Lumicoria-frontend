import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Briefcase, Check, MapPin, Sparkles } from 'lucide-react';
import {
    CAREERS_CONTACT_EMAIL,
    ROLES_POSTED_AT,
    getDepartment,
    getRole,
    roleHref,
    type Role,
} from '@/data/careers';
import ProcessTimeline from '@/components/careers/ProcessTimeline';
import SEO from '@/components/SEO';

/**
 * Google JobPosting structured data — makes each role eligible for the Google
 * Jobs experience, which is free candidate reach.
 *
 * `baseSalary` is deliberately omitted: we don't publish compensation, and
 * stating a figure we haven't committed to would be misleading.
 */
function jobPostingJsonLd(role: Role) {
    return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: role.title,
        description: [
            ...role.about,
            `Responsibilities: ${role.responsibilities.join('; ')}.`,
            `Requirements: ${role.requirements.join('; ')}.`,
        ].join(' '),
        datePosted: ROLES_POSTED_AT,
        employmentType: role.type === 'Full-time' ? 'FULL_TIME' : role.type === 'Internship' ? 'INTERN' : 'CONTRACTOR',
        hiringOrganization: {
            '@type': 'Organization',
            name: 'Lumicoria Inc.',
            sameAs: 'https://lumicoria.ai',
        },
        jobLocationType: 'TELECOMMUTE',
        applicantLocationRequirements: { '@type': 'Country', name: 'Worldwide' },
        directApply: true,
    };
}

function Bullets({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lumicoria-purple" aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function RoleDetail() {
    const { department = '', slug = '' } = useParams();
    const role = getRole(department, slug);

    // Unknown role — send people back to the board rather than a dead end.
    if (!role) return <Navigate to="/careers" replace />;

    const departmentMeta = getDepartment(role.department);

    return (
        <div className="bg-white">
            <SEO
                title={`${role.title} — Careers`}
                description={role.summary}
                canonical={roleHref(role)}
                jsonLd={jobPostingJsonLd(role)}
            />

            {/* ── Header ───────────────────────────────────────────── */}
            <section className="border-b border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="mx-auto max-w-3xl">
                        <Link
                            to="/careers"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-lumicoria-purple"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            All open roles
                        </Link>

                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            {role.priority && (
                                <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-lumicoria-purple/10 px-3 py-1 text-xs font-semibold text-lumicoria-purple">
                                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                    Priority hire for launch
                                </span>
                            )}

                            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
                                {role.title}
                            </h1>

                            <p className="mb-6 text-lg leading-relaxed text-gray-500">{role.summary}</p>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                                    {role.team}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                    {role.location}
                                </span>
                                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs">
                                    {role.type}
                                </span>
                            </div>

                            <div className="mt-8">
                                <Link
                                    to={`${roleHref(role)}/apply`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-lumicoria-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                >
                                    Apply for this role
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Body ─────────────────────────────────────────────── */}
            <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-3xl space-y-12">
                    <div>
                        <h2 className="mb-4 text-xl font-bold text-gray-900">About the role</h2>
                        <div className="space-y-4">
                            {role.about.map((paragraph) => (
                                <p key={paragraph} className="leading-relaxed text-gray-600">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 text-xl font-bold text-gray-900">What you&rsquo;ll do</h2>
                        <Bullets items={role.responsibilities} />
                    </div>

                    <div>
                        <h2 className="mb-4 text-xl font-bold text-gray-900">What we&rsquo;re looking for</h2>
                        <Bullets items={role.requirements} />
                    </div>

                    {role.niceToHave.length > 0 && (
                        <div>
                            <h2 className="mb-2 text-xl font-bold text-gray-900">Nice to have</h2>
                            <p className="mb-4 text-sm text-gray-500">
                                Genuinely optional. Apply if the section above fits — we have never had a candidate
                                tick every box.
                            </p>
                            <Bullets items={role.niceToHave} />
                        </div>
                    )}

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">What you&rsquo;ll get out of it</h2>
                        <Bullets items={role.whatYoullGet} />
                    </div>

                    <div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">How hiring works</h2>
                        <p className="mb-6 text-sm text-gray-500">
                            The intro call covers scope, expectations, and the terms of the engagement — so you have
                            the full picture early, before the later stages ask anything significant of your time.
                        </p>
                        <ProcessTimeline compact />
                    </div>

                    {/* ── Apply CTA ────────────────────────────────── */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
                        <h2 className="mb-3 text-xl font-bold text-gray-900">
                            Interested in {role.title.toLowerCase()}?
                        </h2>
                        <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-gray-500">
                            Send us your work. We read every application ourselves and we come back to you either
                            way.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                to={`${roleHref(role)}/apply`}
                                className="inline-flex items-center gap-2 rounded-xl bg-lumicoria-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            >
                                Apply now
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <a
                                href={`mailto:${CAREERS_CONTACT_EMAIL}?subject=${encodeURIComponent(`Question about the ${role.title} role`)}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple"
                            >
                                Ask a question first
                            </a>
                        </div>
                    </div>

                    {departmentMeta && (
                        <p className="text-center text-sm text-gray-500">
                            More in{' '}
                            <Link
                                to={`/careers?department=${role.department}`}
                                className="font-medium text-lumicoria-purple hover:underline"
                            >
                                {departmentMeta.label}
                            </Link>
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
