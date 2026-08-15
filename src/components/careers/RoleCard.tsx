import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { roleHref, type Role } from '@/data/careers';
import { EASE } from './Reveal';

/**
 * One opening on the board, rendered as a list row rather than a card.
 *
 * Rows enter in sequence so a long group resolves top to bottom instead of
 * appearing all at once, and the accent rail plus the arrow give the row a
 * clear target state on hover, which a flat list otherwise lacks.
 */
export function RoleCard({ role, index = 0 }: { role: Role; index?: number }) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: EASE }}
        >
            <Link
                to={roleHref(role)}
                className="group relative flex items-start justify-between gap-6 border-b border-gray-200 px-4 py-6 transition-colors hover:bg-lumicoria-purple/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumicoria-purple focus-visible:ring-inset active:bg-lumicoria-purple/[0.07]"
            >
                {/* Accent rail, drawn on hover so the row has a clear target state. */}
                <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 bg-lumicoria-purple transition-transform duration-300 ease-out group-hover:scale-y-100"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-lumicoria-purple">
                            {role.title}
                        </h3>
                        {role.featured && (
                            <span className="rounded-full bg-lumicoria-purple/10 px-2.5 py-0.5 text-xs font-medium text-lumicoria-purple">
                                Featured
                            </span>
                        )}
                    </div>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{role.summary}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span>{role.location}</span>
                        <span aria-hidden="true" className="text-gray-300">/</span>
                        <span>{role.type}</span>
                    </div>
                </div>

                <ArrowRight
                    className="mt-1 hidden h-5 w-5 shrink-0 text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-lumicoria-purple sm:block"
                    aria-hidden="true"
                />
            </Link>
        </motion.div>
    );
}

export default RoleCard;
