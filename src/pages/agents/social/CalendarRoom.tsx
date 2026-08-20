/**
 * Calendar, gated behind a connected account.
 *
 * The page lives in src/pages/social/Calendar.tsx; this only decides whether it
 * renders live or as a blurred preview, so the gating rule stays in one place.
 */

import Calendar from '@/pages/social/Calendar';
import { ConnectionGate } from './SocialLayout';

export default function CalendarRoom() {
    return (
        <ConnectionGate
            title="Connect an account to plan ahead"
            description="Your scheduled posts, drafts and gaps in one month view."
        >
            <Calendar />
        </ConnectionGate>
    );
}
