import { HIRING_PROCESS } from '@/data/careers';

/**
 * The published hiring process.
 *
 * The intro call is step two on purpose, and it is shown on every role page:
 * it is where scope and terms are confirmed, so candidates have the full
 * picture before the later stages ask for real time.
 */
export function ProcessTimeline({ compact = false }: { compact?: boolean }) {
    return (
        <ol className={compact ? 'space-y-6' : 'grid gap-8 sm:grid-cols-2 lg:grid-cols-5'}>
            {HIRING_PROCESS.map((stage) => (
                <li key={stage.step} className={compact ? 'flex gap-4' : ''}>
                    <div
                        className={
                            compact
                                ? 'shrink-0 text-sm font-semibold tabular-nums text-lumicoria-purple'
                                : 'mb-2 text-sm font-semibold tabular-nums text-lumicoria-purple'
                        }
                    >
                        {stage.step}
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">{stage.title}</h3>
                        <p className="text-sm leading-relaxed text-gray-600">{stage.description}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export default ProcessTimeline;
