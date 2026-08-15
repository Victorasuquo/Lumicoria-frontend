import { motion, useReducedMotion } from 'framer-motion';
import { HIRING_PROCESS } from '@/data/careers';
import { EASE } from './Reveal';

/**
 * The published hiring process.
 *
 * The steps reveal in order, which is the one place on this page where
 * sequential motion carries real meaning: the animation follows the same
 * order the candidate will experience.
 *
 * The intro call is step two on purpose, and it is shown on every role page:
 * it is where scope and terms are confirmed, so candidates have the full
 * picture before the later stages ask for real time.
 */
export function ProcessTimeline({ compact = false }: { compact?: boolean }) {
    const reduce = useReducedMotion();

    return (
        <ol className={compact ? 'space-y-6' : 'grid gap-8 sm:grid-cols-2 lg:grid-cols-5'}>
            {HIRING_PROCESS.map((stage, index) => (
                <motion.li
                    key={stage.step}
                    className={compact ? 'flex gap-4' : 'relative'}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: Math.min(index * 0.09, 0.45), ease: EASE }}
                >
                    {/* Connector between steps, drawn only on the wide layout. */}
                    {!compact && index < HIRING_PROCESS.length - 1 && (
                        <span
                            aria-hidden="true"
                            className="absolute left-4 top-2.5 hidden h-px w-full bg-gradient-to-r from-lumicoria-purple/30 to-transparent lg:block"
                        />
                    )}

                    <div
                        className={
                            compact
                                ? 'shrink-0 text-sm font-semibold tabular-nums text-lumicoria-purple'
                                : 'relative mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-lumicoria-purple/10 text-xs font-semibold tabular-nums text-lumicoria-purple'
                        }
                    >
                        {stage.step}
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">{stage.title}</h3>
                        <p className="text-sm leading-relaxed text-gray-600">{stage.description}</p>
                    </div>
                </motion.li>
            ))}
        </ol>
    );
}

export default ProcessTimeline;
