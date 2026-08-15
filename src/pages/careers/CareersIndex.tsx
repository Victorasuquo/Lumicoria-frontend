import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BENEFITS, DEPARTMENTS, ROLES, sortRoles } from '@/data/careers';
import RoleCard from '@/components/careers/RoleCard';
import FilterBar, { type CareersFilters } from '@/components/careers/FilterBar';
import ProcessTimeline from '@/components/careers/ProcessTimeline';
import CareersLegal from '@/components/careers/CareersLegal';
import SEO from '@/components/SEO';

const primaryButton =
    'inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700';
const secondaryButton =
    'inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900';

export default function CareersIndex() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters live in the URL so a filtered board is a shareable link.
    const filters: CareersFilters = {
        department: searchParams.get('department') ?? '',
        type: searchParams.get('type') ?? '',
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
                if (query) {
                    const haystack = `${role.title} ${role.summary} ${role.team} ${role.type}`.toLowerCase();
                    if (!haystack.includes(query)) return false;
                }
                return true;
            }),
        );
    }, [filters.department, filters.type, filters.q]);

    // Grouped by team, which is how people read a job board.
    const grouped = DEPARTMENTS.map((department) => ({
        department,
        roles: visibleRoles.filter((role) => role.department === department.id),
    })).filter((group) => group.roles.length > 0);

    return (
        <div className="bg-white">
            <SEO
                title="Careers"
                description="Open roles at Lumicoria Inc. across design, marketing, engineering and operations. Remote and open globally."
                canonical="/careers"
            />

            {/* Hero */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 pt-20 pb-16">
                    <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-gray-900 md:text-5xl">
                        Build the tools that change how work happens
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
                        Lumicoria is a small, remote team building an AI platform that does real work for real people.
                        Joining now means shaping the product and the way we work, not just the backlog.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href="#open-roles" className={primaryButton}>
                            See open roles
                        </a>
                        <Link to="/careers/apply" className={secondaryButton}>
                            Apply speculatively
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why join */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Why join Lumicoria</h2>
                    <p className="mt-3 max-w-2xl text-gray-600">
                        We are early. That comes with real trade offs, and with things you cannot get at a larger
                        company.
                    </p>

                    <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.title}>
                                <h3 className="text-base font-semibold text-gray-900">{benefit.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open roles */}
            <section id="open-roles" className="scroll-mt-20 border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Open roles</h2>
                    <p className="mt-3 max-w-2xl text-gray-600">
                        Every role is remote and open globally. If your work is strong and the role is not listed, tell
                        us anyway.
                    </p>

                    <div className="mt-10">
                        <FilterBar
                            filters={filters}
                            onChange={updateFilters}
                            onReset={resetFilters}
                            resultCount={visibleRoles.length}
                        />
                    </div>

                    {grouped.length > 0 ? (
                        <div className="mt-12 space-y-14">
                            {grouped.map(({ department, roles }) => (
                                <div key={department.id}>
                                    <div className="border-b border-gray-900 pb-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                                            {department.label}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{department.blurb}</p>
                                    </div>
                                    <div>
                                        {roles.map((role) => (
                                            <RoleCard key={`${role.department}/${role.slug}`} role={role} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 border-t border-gray-200 py-16 text-center">
                            <h3 className="text-base font-semibold text-gray-900">No roles match those filters</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                                Clear the filters to see everything, or send us a speculative application.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <button type="button" onClick={resetFilters} className={secondaryButton}>
                                    Clear filters
                                </button>
                                <Link to="/careers/apply" className={primaryButton}>
                                    Apply speculatively
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Hiring process */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">How hiring works</h2>
                    <p className="mt-3 max-w-2xl text-gray-600">
                        Five steps. We tell you where you stand at every stage, including when the answer is no.
                    </p>
                    <div className="mt-12">
                        <ProcessTimeline />
                    </div>
                </div>
            </section>

            {/* Legal */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Working with us</h2>
                    <div className="mt-10">
                        <CareersLegal />
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section>
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Not seeing your role?</h2>
                    <p className="mt-3 max-w-2xl text-gray-600">
                        We would rather hear from someone exceptional early than miss them. Tell us what you do and
                        what you would want to own here.
                    </p>
                    <div className="mt-8">
                        <Link to="/careers/apply" className={primaryButton}>
                            Send a speculative application
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
