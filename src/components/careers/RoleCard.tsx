import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { roleHref, type Role } from '@/data/careers';
import { EASE } from './Reveal';

/**
 * One opening, laid out as an index row.
 *
 * Title and meta share the top line so the row uses its full width, with the
 * summary beneath. Two lines per role instead of four, which keeps a
 * thirteen role board readable without a long scroll.
 */
export function RoleCard({ role, index = 0 }: { role: Role; index?: number }) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: EASE }}
        >
            <Link
                to={roleHref(role)}
                className="group relative block border-b border-gray-200 py-5 transition-colors first:border-t-0 hover:bg-lumicoria-purple/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumicoria-purple focus-visible:ring-inset"
            >
                {/* Accent rail, drawn on hover so the row has a clear target. */}
                <span
                    aria-hidden="true"
                    className="absolute inset-y-0 -left-4 w-0.5 origin-center scale-y-0 bg-lumicoria-purple transition-transform duration-300 ease-out group-hover:scale-y-100"
                />

                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-lumicoria-purple">
                            {role.title}
                        </h3>
                        {role.featured && (
                            <span className="shrink-0 rounded-full bg-lumicoria-purple/10 px-2 py-0.5 text-[11px] font-medium text-lumicoria-purple">
                                Featured
                            </span>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-sm text-gray-500">
                        <span>{role.location}</span>
                        <span aria-hidden="true" className="text-gray-300">/</span>
                        <span>{role.type}</span>
                        <ArrowUpRight
                            className="h-4 w-4 text-gray-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lumicoria-purple"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">{role.summary}</p>
            </Link>
        </motion.div>
    );
}

export default RoleCard;
