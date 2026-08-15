import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Shared easing. Decelerating curve, so things arrive rather than snap. */
export const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Seconds. Used to sequence siblings. */
    delay?: number;
    /** Travel distance in px. Keep small; large slides read as decoration. */
    y?: number;
    duration?: number;
    as?: 'div' | 'li' | 'section';
}

/**
 * Scroll reveal for the careers section.
 *
 * Transform and opacity only, so it stays on the compositor, and it collapses
 * to a plain static render under `prefers-reduced-motion` rather than being
 * merely faster. `once: true` means content never re-animates on scroll back,
 * which is distracting when someone is re-reading a role.
 */
export function Reveal({
    children,
    className,
    delay = 0,
    y = 18,
    duration = 0.55,
    as = 'div',
}: RevealProps) {
    const reduce = useReducedMotion();
    const Component = motion[as];

    return (
        <Component
            className={className}
            initial={reduce ? false : { opacity: 0, y }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration, delay, ease: EASE }}
        >
            {children}
        </Component>
    );
}

export default Reveal;
