/**
 * Composer, gated behind a connected account.
 *
 * The page itself lives in src/pages/social/Composer.tsx — it is unchanged and
 * shared. This wrapper only decides whether to show it live or as a blurred
 * preview, so the gating rule lives in one place rather than being repeated
 * inside every screen.
 */

import Composer from '@/pages/social/Composer';
import { ConnectionGate } from './SocialLayout';

export default function ComposerRoom() {
    return (
        <ConnectionGate
            title="Connect an account to publish"
            description="Write once and we shape a version for each platform. Connect an account and this becomes your composer."
        >
            <Composer />
        </ConnectionGate>
    );
}
