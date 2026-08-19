/**
 * Inbox, gated behind a connected account.
 *
 * The page itself lives in src/pages/social/Inbox.tsx — it is unchanged and
 * shared. This wrapper only decides whether to show it live or as a blurred
 * preview, so the gating rule lives in one place rather than being repeated
 * inside every screen.
 */

import Inbox from '@/pages/social/Inbox';
import { ConnectionGate } from './SocialLayout';

export default function InboxRoom() {
    return (
        <ConnectionGate
            title="Connect an account to see your inbox"
            description="Comments, messages and mentions from every platform land here in one list, with anything urgent flagged at the top."
        >
            <Inbox />
        </ConnectionGate>
    );
}
