/**
 * Rules, gated behind a connected account.
 *
 * The page itself lives in src/pages/social/Rules.tsx — it is unchanged and
 * shared. This wrapper only decides whether to show it live or as a blurred
 * preview, so the gating rule lives in one place rather than being repeated
 * inside every screen.
 */

import Rules from '@/pages/social/Rules';
import { ConnectionGate } from './SocialLayout';

export default function RulesRoom() {
    return (
        <ConnectionGate
            title="Connect an account to set up replies"
            description="Choose a word people can comment and what they get back. You can build rules once an account is connected."
        >
            <Rules />
        </ConnectionGate>
    );
}
