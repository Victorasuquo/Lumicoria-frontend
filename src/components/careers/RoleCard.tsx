import { ArrowRight, MapPin, Briefcase, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roleHref, type Role } from '@/data/careers';

/**
 * A single opening on the board. Priority roles carry a badge so the hires we
 * most need for launch read first.
 */
export function RoleCard({ role, index = 0 }: { role: Role; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
        >
            <Link
                to={roleHref(role)}
                className="group block rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-lumicoria-purple/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumicoria-purple focus-visible:ring-offset-2"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-lumicoria-purple transition-colors">
                                {role.title}
                            </h3>
                            {role.priority && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-lumicoria-purple/10 px-2.5 py-0.5 text-[11px] font-semibold text-lumicoria-purple">
                                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                                    Priority hire
                                </span>
                            )}
                        </div>

                        <p className="mb-4 text-sm leading-relaxed text-gray-500">{role.summary}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                                {role.team}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                {role.location}
                            </span>
                            <span className="rounded-full border border-gray-200 px-2 py-0.5">{role.type}</span>
                        </div>
                    </div>

                    <ArrowRight
                        className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-lumicoria-purple"
                        aria-hidden="true"
                    />
                </div>
            </Link>
        </motion.div>
    );
}

export default RoleCard;
