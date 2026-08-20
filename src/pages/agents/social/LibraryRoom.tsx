/**
 * Library, gated behind a connected account.
 *
 * The page lives in src/pages/social/Library.tsx; this only decides whether it
 * renders live or as a blurred preview, so the gating rule stays in one place.
 */

import Library from '@/pages/social/Library';
import { ConnectionGate } from './SocialLayout';

export default function LibraryRoom() {
    return (
        <ConnectionGate
            title="Connect an account to build your library"
            description="Your images, tracked links and posts you want to keep an eye on."
        >
            <Library />
        </ConnectionGate>
    );
}
