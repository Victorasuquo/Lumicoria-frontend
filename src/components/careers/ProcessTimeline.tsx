import { HIRING_PROCESS } from '@/data/careers';

/**
 * The published hiring process.
 *
 * Step 2 is the intro call where scope and terms are confirmed — it is shown
 * on every role page on purpose, so candidates understand the arrangement
 * before investing time in the later stages.
 */
export function ProcessTimeline({ compact = false }: { compact?: boolean }) {
    return (
        <ol className={compact ? 'space-y-4' : 'grid gap-6 md:grid-cols-5'}>
            {HIRING_PROCESS.map((stage) => (
                <li
                    key={stage.step}
                    className={
                        compact
                            ? 'flex gap-4'
                            : 'rounded-2xl border border-gray-100 bg-white p-5'
                    }
                >
                    <div
                        className={
                            compact
                                ? 'shrink-0 text-sm font-bold text-lumicoria-purple'
                                : 'mb-2 text-sm font-bold text-lumicoria-purple'
                        }
                    >
                        {stage.step}
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">{stage.title}</h3>
                        <p className="text-sm leading-relaxed text-gray-500">{stage.description}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export default ProcessTimeline;
