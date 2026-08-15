import { useMemo, type ComponentType } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Compass,
    FolderOpen,
    Globe,
    GraduationCap,
    Rocket,
    Sparkles,
    Target,
    Users,
    SearchX,
} from 'lucide-react';
import { BENEFITS, DEPARTMENTS, ROLES, sortRoles } from '@/data/careers';
import RoleCard from '@/components/careers/RoleCard';
import FilterBar, { type CareersFilters } from '@/components/careers/FilterBar';
import ProcessTimeline from '@/components/careers/ProcessTimeline';
import CareersLegal from '@/components/careers/CareersLegal';
import SEO from '@/components/SEO';

/** BENEFITS stores icon names as strings so the data file stays framework-free. */
const BENEFIT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    Target,
    Rocket,
    GraduationCap,
    Sparkles,
    Globe,
    FolderOpen,
    Users,
    Compass,
};

export default function CareersIndex() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters live in the URL so a filtered board is a shareable link.
    const filters: CareersFilters = {
        department: searchParams.get('department') ?? '',
        type: searchParams.get('type') ?? '',
        location: searchParams.get('location') ?? '',
        q: searchParams.get('q') ?? '',
    };

    const updateFilters = (next: Partial<CareersFilters>) => {
        const merged = { ...filters, ...next };
        const params = new URLSearchParams();
        Object.entries(merged).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params, { replace: true });
    };

    const resetFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

    const visibleRoles = useMemo(() => {
        const query = filters.q.trim().toLowerCase();
        return sortRoles(
            ROLES.filter((role) => {
                if (filters.department && role.department !== filters.department) return false;
                if (filters.type && role.type !== filters.type) return false;
                if (filters.location && role.location !== filters.location) return false;
                if (query) {
                    const haystack = `${role.title} ${role.summary} ${role.team} ${role.type}`.toLowerCase();
                    if (!haystack.includes(query)) return false;
                }
                return true;
            }),
        );
    }, [filters.department, filters.type, filters.location, filters.q]);

    return (
        <div className="bg-white">
            <SEO
                title="Careers — build the future of work with AI"
                description="Join Lumicoria Inc. We're hiring across design, marketing, engineering, and operations — remote-first, global, and pre-launch. See our open roles."
                canonical="/careers"
            />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="container mx-auto px-4 pt-20 pb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        We&rsquo;re hiring ahead of launch
                    </div>

                    <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 md:text-[56px]">
                        Build the tools that <span className="gradient-text">change how work happens</span>
                    </h1>

                    <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-500">
                        Lumicoria is a small, remote-first team building an AI platform that does real work for real
                        people. We are weeks from launch, which means the person who joins now shapes the product, the
                        brand, and the way we work — not just the backlog.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <a
                            href="#open-roles"
                            className="inline-flex items-center gap-2 rounded-xl bg-lumicoria-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            See open roles
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <Link
                            to="/careers/apply"
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple"
                        >
                            Apply speculatively
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Why join ─────────────────────────────────────────── */}
            <section className="border-t border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 py-24">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Why join Lumicoria</h2>
                        <p className="mx-auto max-w-2xl text-gray-500">
                            We are early. That comes with real trade-offs, and it comes with things you cannot get at a
                            larger company.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {BENEFITS.map((benefit, index) => {
                            const Icon = BENEFIT_ICONS[benefit.icon] ?? Sparkles;
                            return (
                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                                    className="rounded-2xl border border-gray-100 bg-white p-6"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lumicoria-purple/10 text-lumicoria-purple">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold text-gray-900">{benefit.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-500">{benefit.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Open roles ───────────────────────────────────────── */}
            <section id="open-roles" className="scroll-mt-24 border-t border-gray-100">
                <div className="container mx-auto px-4 py-24">
                    <div className="mb-8 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Open roles</h2>
                        <p className="mx-auto max-w-2xl text-gray-500">
                            Every role below is remote and open globally. If your work is strong and the role is not
                            listed, tell us anyway.
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <FilterBar
                            filters={filters}
                            onChange={updateFilters}
                            onReset={resetFilters}
                            resultCount={visibleRoles.length}
                        />

                        <div className="mt-6 space-y-4">
                            {visibleRoles.map((role, index) => (
                                <RoleCard key={`${role.department}/${role.slug}`} role={role} index={index} />
                            ))}
                        </div>

                        {visibleRoles.length === 0 && (
                            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                                <SearchX className="mx-auto mb-4 h-8 w-8 text-gray-300" aria-hidden="true" />
                                <h3 className="mb-2 text-base font-semibold text-gray-900">
                                    No roles match those filters
                                </h3>
                                <p className="mb-6 text-sm text-gray-500">
                                    Clear the filters to see everything, or send us a speculative application.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-lumicoria-purple hover:text-lumicoria-purple"
                                    >
                                        Clear filters
                                    </button>
                                    <Link
                                        to="/careers/apply"
                                        className="rounded-xl bg-lumicoria-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    >
                                        Apply speculatively
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Team overview — orients people who don't know where they fit. */}
                        <div className="mt-12 grid gap-4 sm:grid-cols-2">
                            {DEPARTMENTS.map((department) => {
                                const count = ROLES.filter((role) => role.department === department.id).length;
                                return (
                                    <button
                                        key={department.id}
                                        type="button"
                                        onClick={() => updateFilters({ department: department.id })}
                                        className="rounded-2xl border border-gray-100 bg-white p-5 text-left transition-colors hover:border-lumicoria-purple/40"
                                    >
                                        <div className="mb-1 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900">{department.label}</h3>
                                            <span className="text-xs text-gray-400">
                                                {count} {count === 1 ? 'role' : 'roles'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{department.blurb}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Hiring process ───────────────────────────────────── */}
            <section className="border-t border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 py-24">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">How hiring works</h2>
                        <p className="mx-auto max-w-2xl text-gray-500">
                            Five steps, no games. We tell you where you stand at every stage — including when the
                            answer is no.
                        </p>
                    </div>
                    <ProcessTimeline />
                </div>
            </section>

            {/* ── Legal ────────────────────────────────────────────── */}
            <section className="border-t border-gray-100">
                <div className="container mx-auto px-4 py-24">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Working with us, fairly</h2>
                        <p className="mx-auto max-w-2xl text-gray-500">
                            What you can expect from us on fairness, access, and your personal data.
                        </p>
                    </div>
                    <div className="mx-auto max-w-4xl">
                        <CareersLegal />
                    </div>
                </div>
            </section>

            {/* ── Closing CTA ──────────────────────────────────────── */}
            <section className="border-t border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Not seeing your role?</h2>
                    <p className="mx-auto mb-8 max-w-xl text-gray-500">
                        We would rather hear from someone exceptional early than miss them entirely. Tell us what you
                        do and what you would want to own here.
                    </p>
                    <Link
                        to="/careers/apply"
                        className="inline-flex items-center gap-2 rounded-xl bg-lumicoria-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        Send a speculative application
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
