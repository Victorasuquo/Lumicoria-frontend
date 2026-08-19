/**
 * Analytics, gated behind a connected account.
 *
 * The page itself lives in src/pages/social/Analytics.tsx — it is unchanged and
 * shared. This wrapper only decides whether to show it live or as a blurred
 * preview, so the gating rule lives in one place rather than being repeated
 * inside every screen.
 */

import Analytics from '@/pages/social/Analytics';
import { ConnectionGate } from './SocialLayout';

export default function AnalyticsRoom() {
    return (
        <ConnectionGate
            title="Connect an account to see your numbers"
            description="Reach, engagement and clicks per post and per account, pulled from the platforms themselves."
        >
            <Analytics />
        </ConnectionGate>
    );
}
