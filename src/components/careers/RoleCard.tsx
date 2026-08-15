import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { roleHref, type Role } from '@/data/careers';

/**
 * One opening on the board, rendered as a list row rather than a card.
 * Rows keep a long list scannable; cards would add elevation the content
 * does not earn.
 */
export function RoleCard({ role }: { role: Role }) {
    return (
        <Link
            to={roleHref(role)}
            className="group flex items-start justify-between gap-6 border-b border-gray-200 py-6 transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-4"
        >
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-base font-semibold text-gray-900">{role.title}</h3>
                    {role.featured && (
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Featured
                        </span>
                    )}
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{role.summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>{role.team}</span>
                    <span aria-hidden="true" className="text-gray-300">/</span>
                    <span>{role.location}</span>
                    <span aria-hidden="true" className="text-gray-300">/</span>
                    <span>{role.type}</span>
                </div>
            </div>

            <ArrowRight
                className="mt-1 hidden h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 sm:block"
                aria-hidden="true"
            />
        </Link>
    );
}

export default RoleCard;
