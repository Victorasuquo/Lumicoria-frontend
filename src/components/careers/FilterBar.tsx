import { DEPARTMENTS, EMPLOYMENT_TYPES } from '@/data/careers';

export interface CareersFilters {
    department: string;
    type: string;
    q: string;
}

interface FilterBarProps {
    filters: CareersFilters;
    onChange: (next: Partial<CareersFilters>) => void;
    onReset: () => void;
    resultCount: number;
}

const controlClass =
    'h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900';

/**
 * Team, type and search filters. State lives in the URL (see CareersIndex) so
 * a filtered board is a shareable link.
 *
 * There is no location filter: every role is remote, so the control would
 * have had a single option.
 */
export function FilterBar({ filters, onChange, onReset, resultCount }: FilterBarProps) {
    const hasActiveFilter = Boolean(filters.department || filters.type || filters.q);

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <label htmlFor="careers-search" className="sr-only">
                        Search roles
                    </label>
                    <input
                        id="careers-search"
                        type="search"
                        value={filters.q}
                        onChange={(event) => onChange({ q: event.target.value })}
                        placeholder="Search roles"
                        className={`${controlClass} w-full placeholder:text-gray-400`}
                    />
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 sm:flex-none">
                        <label htmlFor="filter-department" className="sr-only">
                            Filter by team
                        </label>
                        <select
                            id="filter-department"
                            className={`${controlClass} w-full`}
                            value={filters.department}
                            onChange={(event) => onChange({ department: event.target.value })}
                        >
                            <option value="">All teams</option>
                            {DEPARTMENTS.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 sm:flex-none">
                        <label htmlFor="filter-type" className="sr-only">
                            Filter by employment type
                        </label>
                        <select
                            id="filter-type"
                            className={`${controlClass} w-full`}
                            value={filters.type}
                            onChange={(event) => onChange({ type: event.target.value })}
                        >
                            <option value="">All types</option>
                            {EMPLOYMENT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500" role="status" aria-live="polite">
                    {resultCount} {resultCount === 1 ? 'open role' : 'open roles'}
                </p>
                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-900"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}

export default FilterBar;
