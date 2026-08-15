import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
 * Google JobPosting structured data, which makes each role eligible for the
 * Google Jobs experience.
 *
 * `baseSalary` is deliberately omitted. We do not publish compensation, and
 * stating a figure we have not committed to would be misleading.
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
        employmentType:
            role.type === 'Full-time' ? 'FULL_TIME' : role.type === 'Internship' ? 'INTERN' : 'CONTRACTOR',
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

const primaryButton =
    'inline-flex items-center justify-center rounded-md bg-lumicoria-purple px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-lumicoria-deepPurple';
const secondaryButton =
    'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-lg font-semibold tracking-tight text-lumicoria-obsidian">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Bullets({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                    <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-lumicoria-purple" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function RoleDetail() {
    const { department = '', slug = '' } = useParams();
    const role = getRole(department, slug);

    // Unknown role. Send people back to the board rather than a dead end.
    if (!role) return <Navigate to="/careers" replace />;

    const departmentMeta = getDepartment(role.department);

    return (
        <div className="bg-white">
            <SEO
                title={`${role.title}, Careers`}
                description={role.summary}
                canonical={roleHref(role)}
                jsonLd={jobPostingJsonLd(role)}
            />

            {/* Header */}
            <section className="border-b border-gray-200 bg-[#F8F6FC]">
                <div className="mx-auto max-w-3xl px-4 pt-12 pb-12">
                    <Link
                        to="/careers"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-lumicoria-purple"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        All open roles
                    </Link>

                    <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-lumicoria-obsidian md:text-4xl">
                        {role.title}
                    </h1>

                    <p className="mt-4 text-lg leading-relaxed text-gray-600">{role.summary}</p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>{role.team}</span>
                        <span aria-hidden="true" className="text-gray-300">/</span>
                        <span>{role.location}</span>
                        <span aria-hidden="true" className="text-gray-300">/</span>
                        <span>{role.type}</span>
                    </div>

                    <div className="mt-8">
                        <Link to={`${roleHref(role)}/apply`} className={primaryButton}>
                            Apply for this role
                        </Link>
                    </div>
                </div>
            </section>

            {/* Body */}
            <section className="mx-auto max-w-3xl px-4 py-16">
                <div className="space-y-12">
                    <Section title="About the role">
                        <div className="space-y-4">
                            {role.about.map((paragraph) => (
                                <p key={paragraph} className="leading-relaxed text-gray-600">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </Section>

                    <Section title="What you will do">
                        <Bullets items={role.responsibilities} />
                    </Section>

                    <Section title="What we are looking for">
                        <Bullets items={role.requirements} />
                    </Section>

                    {role.niceToHave.length > 0 && (
                        <Section title="Nice to have">
                            <p className="mb-4 text-sm text-gray-500">
                                Genuinely optional. Apply if the section above fits. We have never had a candidate
                                tick every box.
                            </p>
                            <Bullets items={role.niceToHave} />
                        </Section>
                    )}

                    <Section title="What you get out of it">
                        <Bullets items={role.whatYoullGet} />
                    </Section>

                    <Section title="How hiring works">
                        <p className="mb-6 text-sm text-gray-500">
                            The intro call covers scope, expectations and the terms of the engagement, so you have the
                            full picture early, before the later stages ask for significant time.
                        </p>
                        <ProcessTimeline compact />
                    </Section>

                    <div className="border-t border-gray-200 pt-12">
                        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                            Interested in this role?
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
                            Send us your work. We read every application ourselves and come back to you either way.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to={`${roleHref(role)}/apply`} className={primaryButton}>
                                Apply for this role
                            </Link>
                            <a
                                href={`mailto:${CAREERS_CONTACT_EMAIL}?subject=${encodeURIComponent(
                                    `Question about the ${role.title} role`,
                                )}`}
                                className={secondaryButton}
                            >
                                Ask a question
                            </a>
                        </div>

                        {departmentMeta && (
                            <p className="mt-8 text-sm text-gray-500">
                                More roles in{' '}
                                <Link
                                    to={`/careers?department=${role.department}`}
                                    className="text-lumicoria-purple underline underline-offset-4 hover:text-lumicoria-deepPurple"
                                >
                                    {departmentMeta.label}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
