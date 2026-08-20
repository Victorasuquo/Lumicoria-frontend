/**
 * A platform's logo.
 *
 * Loads from /social/<platform>.png so swapping in the real brand assets is a
 * file replacement and nothing more — no rebuild of this component, no import
 * to update.
 *
 * Falls back to a lettered tile if the file is missing or fails to load, so an
 * absent icon degrades quietly instead of leaving a broken-image glyph in the
 * middle of the connect screen.
 */

import { useState } from 'react';

import { PLATFORM_LABELS, type PlatformKey } from '@/services/socialApi';

const FALLBACK_TINT: Record<PlatformKey, string> = {
    instagram: 'bg-gradient-to-br from-purple-500 to-orange-400',
    facebook: 'bg-[#1877F2]',
    linkedin: 'bg-[#0A66C2]',
    x: 'bg-gray-900',
    tiktok: 'bg-gray-900',
};

export function PlatformIcon({
    platform,
    size = 24,
    className = '',
}: {
    platform: PlatformKey;
    size?: number;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    const label = PLATFORM_LABELS[platform] ?? platform;

    if (failed) {
        return (
            <span
                role="img"
                aria-label={label}
                style={{ width: size, height: size, fontSize: Math.max(9, size * 0.4) }}
                className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold text-white ${FALLBACK_TINT[platform] ?? 'bg-gray-400'} ${className}`}
            >
                {label.slice(0, 2)}
            </span>
        );
    }

    return (
        <img
            src={`/social/${platform}.png`}
            alt={label}
            width={size}
            height={size}
            loading="lazy"
            onError={() => setFailed(true)}
            style={{ width: size, height: size }}
            className={`shrink-0 rounded-lg object-contain ${className}`}
        />
    );
}

export default PlatformIcon;
