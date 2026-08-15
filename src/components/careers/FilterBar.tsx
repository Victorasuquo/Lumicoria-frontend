import { X } from 'lucide-react';
import { DEPARTMENTS, EMPLOYMENT_TYPES, LOCATIONS } from '@/data/careers';

export interface CareersFilters {
    department: string;
    type: string;
    location: string;
    q: string;
}

interface FilterBarProps {
    filters: CareersFilters;
    onChange: (next: Partial<CareersFilters>) => void;
    onReset: () => void;
    resultCount: number;
}

const selectClass =
    'h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-lumicoria-purple focus:ring-2 focus:ring-lumicoria-purple/20';

/**
 * Department / type / location / search filters.
 *
 * State lives in the URL (see CareersIndex) so a filtered board is a
 * shareable link — e.g. /careers?department=design.
 */
export function FilterBar({ filters, onChange, onReset, resultCount }: FilterBarProps) {
    const hasActiveFilter =
        Boolean(filters.department) || Boolean(filters.type) || Boolean(filters.location) || Boolean(filters.q);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                    <label htmlFor="careers-search" className="sr-only">
                        Search roles
                    </label>
                    <input
                        id="careers-search"
                        type="search"
                        value={filters.q}
                        onChange={(event) => onChange({ q: event.target.value })}
                        placeholder="Search roles — e.g. designer, social, engineer"
                        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-lumicoria-purple focus:ring-2 focus:ring-lumicoria-purple/20"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div>
                        <label htmlFor="filter-department" className="sr-only">
                            Filter by team
                        </label>
                        <select
                            id="filter-department"
                            className={selectClass}
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

                    <div>
                        <label htmlFor="filter-type" className="sr-only">
                            Filter by employment type
                        </label>
                        <select
                            id="filter-type"
                            className={selectClass}
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

                    <div>
                        <label htmlFor="filter-location" className="sr-only">
                            Filter by location
                        </label>
                        <select
                            id="filter-location"
                            className={selectClass}
                            value={filters.location}
                            onChange={(event) => onChange({ location: event.target.value })}
                        >
                            <option value="">All locations</option>
                            {LOCATIONS.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500" role="status" aria-live="polite">
                    {resultCount} {resultCount === 1 ? 'open role' : 'open roles'}
                </p>
                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-lumicoria-purple"
                    >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}

export default FilterBar;
