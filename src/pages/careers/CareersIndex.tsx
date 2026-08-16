import { useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { BENEFITS, DEPARTMENTS, ROLES, sortRoles } from '@/data/careers';
import RoleCard from '@/components/careers/RoleCard';
import FilterBar, { type CareersFilters } from '@/components/careers/FilterBar';
import ProcessTimeline from '@/components/careers/ProcessTimeline';
import CareersLegal from '@/components/careers/CareersLegal';
import Reveal, { EASE } from '@/components/careers/Reveal';
import SEO from '@/components/SEO';

/**
 * Radius rule for this section: buttons and inputs are `rounded-md`, tiles and
 * panels are `rounded-lg`, badges are `rounded-full`. Applied everywhere.
 *
 * Buttons carry a 1px lift on hover and compress on press, so a click feels
 * physical rather than instantaneous.
 */
const primaryButton =
    'inline-flex items-center justify-center rounded-md bg-lumicoria-purple px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-lumicoria-deepPurple hover:shadow-lg hover:shadow-lumicoria-purple/20 active:translate-y-0 active:scale-[0.98]';
const secondaryButton =
    'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-all duration-200 hover:-translate-y-px hover:border-lumicoria-purple hover:text-lumicoria-purple active:translate-y-0 active:scale-[0.98]';

export default function CareersIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const reduce = useReducedMotion();
    const heroRef = useRef<HTMLElement>(null);

    // Hero parallax. The tinted wash drifts slower than the copy as the page
    // scrolls, which gives the header depth instead of a flat colour block.
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const washY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
    const washOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

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

    // Hero copy arrives in reading order: belief, then problem, then actions.
    const heroItem = (delay: number) =>
        reduce
            ? {}
            : {
                  initial: { opacity: 0, y: 22 },
                  // whileInView rather than animate. Mount-time animations do
                  // not run reliably when a tab loads in the background, which
                  // would leave the hero blank; an IntersectionObserver reveal
                  // fires whenever the section is actually seen.
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '0px' },
                  transition: { duration: 0.7, delay, ease: EASE },
              };

    return (
        <div className="bg-white">
            <SEO
                title="Careers"
                description="Open roles at Lumicoria Inc. across design, marketing, engineering and operations. Remote and open globally."
                canonical="/careers"
            />

            {/* Hero */}
            <section ref={heroRef} className="relative overflow-hidden border-b border-gray-200 bg-[#F8F6FC]">
                {/* Parallax wash. Decorative only, never hit-tested. */}
                <motion.div
                    aria-hidden="true"
                    style={reduce ? undefined : { y: washY, opacity: washOpacity }}
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -top-24 left-[-10%] h-[420px] w-[520px] rounded-full bg-lumicoria-purple/10 blur-3xl" />
                    <div className="absolute -top-10 right-[-5%] h-[360px] w-[460px] rounded-full bg-lumicoria-blue/10 blur-3xl" />
                </motion.div>

                <div className="relative mx-auto max-w-5xl px-4 pt-24 pb-24">
                    {/*
                     * Line mask reveal. Each line sits in an overflow-hidden
                     * block and rises from below, which reads as the statement
                     * being set rather than fading in. Leading is 1.2 so the
                     * descenders in "amplify" clear the mask edge.
                     */}
                    <h1 className="max-w-5xl text-4xl font-semibold leading-[1.2] tracking-tight text-lumicoria-obsidian sm:text-5xl">
                        {['AI should amplify human potential,', 'not replace it.'].map((line, index) => (
                            <span key={line} className="block overflow-hidden pb-1">
                                <motion.span
                                    className="block"
                                    initial={reduce ? false : { y: '110%' }}
                                    whileInView={reduce ? undefined : { y: 0 }}
                                    viewport={{ once: true, margin: '0px' }}
                                    transition={{ duration: 0.85, delay: 0.05 + index * 0.1, ease: EASE }}
                                >
                                    {line}
                                </motion.span>
                            </span>
                        ))}
                    </h1>

                    <motion.p {...heroItem(0.42)} className="mt-8 max-w-xl text-lg leading-relaxed text-gray-600">
                        We are building the research, the systems and the safeguards to make that true for everyone,
                        everywhere.
                    </motion.p>

                    <motion.div {...heroItem(0.52)} className="mt-10 flex flex-wrap items-center gap-3">
                        <a href="#open-roles" className={primaryButton}>
                            See open roles
                        </a>
                        <Link to="/careers/apply" className={secondaryButton}>
                            Apply speculatively
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Why join */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <Reveal>
                        <h2 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                            Why people join Lumicoria
                        </h2>
                        <p className="mt-3 max-w-2xl text-gray-600">
                            Our work runs from applied research through to the systems people rely on every day. The
                            questions are still open, the scale is global, and the answers are not in a paper yet.
                        </p>
                    </Reveal>

                    <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {BENEFITS.map((benefit, index) => (
                            <Reveal
                                key={benefit.title}
                                delay={Math.min(index * 0.07, 0.35)}
                                className="border-t-2 border-lumicoria-purple/25 pt-4"
                            >
                                <h3 className="text-base font-semibold text-gray-900">{benefit.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open roles */}
            <section id="open-roles" className="scroll-mt-20 border-b border-gray-200 bg-[#FAFAFD]">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <Reveal>
                        <h2 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">Open roles</h2>
                        <p className="mt-3 max-w-2xl text-gray-600">
                            Every role is remote and open globally. If your work is strong and the role is not listed,
                            tell us anyway.
                        </p>
                    </Reveal>

                    <Reveal delay={0.08} className="mt-10">
                        <FilterBar
                            filters={filters}
                            onChange={updateFilters}
                            onReset={resetFilters}
                            resultCount={visibleRoles.length}
                        />
                    </Reveal>

                    {grouped.length > 0 ? (
                        /*
                         * Split index. The team holds a sticky left column while
                         * its roles scroll past on the right, so the reader
                         * always knows which team they are looking at and the
                         * row width is actually used.
                         */
                        <div className="mt-12 space-y-16">
                            {grouped.map(({ department, roles }) => (
                                <Reveal key={department.id} className="border-t border-gray-200 pt-8">
                                    <div className="grid gap-x-12 gap-y-6 md:grid-cols-12">
                                        <div className="md:col-span-4 lg:col-span-3">
                                            <div className="md:sticky md:top-24">
                                                {/* Team accent, drawn on entry. */}
                                                <motion.span
                                                    aria-hidden="true"
                                                    className={`block h-1 w-12 origin-left rounded-full ${department.ruleClass}`}
                                                    initial={reduce ? false : { scaleX: 0 }}
                                                    whileInView={reduce ? undefined : { scaleX: 1 }}
                                                    viewport={{ once: true, margin: '-80px' }}
                                                    transition={{ duration: 0.6, ease: EASE }}
                                                />
                                                <h3 className="mt-5 text-xl font-semibold tracking-tight text-lumicoria-obsidian">
                                                    {department.label}
                                                </h3>
                                                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                                    {department.blurb}
                                                </p>
                                                <p className="mt-4 text-sm text-gray-400">
                                                    {roles.length} {roles.length === 1 ? 'open role' : 'open roles'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="md:col-span-8 lg:col-span-9">
                                            {roles.map((role, index) => (
                                                <RoleCard
                                                    key={`${role.department}/${role.slug}`}
                                                    role={role}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    ) : (
                        <Reveal className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
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
                        </Reveal>
                    )}
                </div>
            </section>

            {/* Hiring process */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <Reveal>
                        <h2 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                            How hiring works
                        </h2>
                        <p className="mt-3 max-w-2xl text-gray-600">
                            Five steps. We tell you where you stand at every stage, including when the answer is no.
                        </p>
                    </Reveal>
                    <div className="mt-12">
                        <ProcessTimeline />
                    </div>
                </div>
            </section>

            {/* Legal. Informational, so it fades in place without travel. */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <Reveal y={0}>
                        <h2 className="text-2xl font-semibold tracking-tight text-lumicoria-obsidian">
                            Working with us
                        </h2>
                    </Reveal>
                    <Reveal y={0} delay={0.08} className="mt-10">
                        <CareersLegal />
                    </Reveal>
                </div>
            </section>

            {/* Closing */}
            <section className="bg-white">
                <div className="mx-auto max-w-5xl px-4 py-20">
                    <Reveal y={24}>
                        <div className="relative overflow-hidden rounded-lg bg-lumicoria-obsidian px-8 py-12 md:px-12">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lumicoria-purple/25 blur-3xl"
                            />
                            <div className="relative">
                                <h2 className="text-2xl font-semibold tracking-tight text-white">
                                    Not seeing your role?
                                </h2>
                                <p className="mt-3 max-w-xl text-gray-300">
                                    We would rather hear from someone exceptional early than miss them. Tell us what
                                    you do and what you would want to own here.
                                </p>
                                <div className="mt-8">
                                    <Link
                                        to="/careers/apply"
                                        className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-lumicoria-obsidian transition-all duration-200 hover:-translate-y-px hover:bg-gray-100 active:translate-y-0 active:scale-[0.98]"
                                    >
                                        Send a speculative application
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
