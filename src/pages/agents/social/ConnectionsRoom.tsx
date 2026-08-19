/**
 * Accounts. Deliberately NOT gated — this is the room that removes the gate.
 *
 * Reloads the shell's account state on unmount so connecting here immediately
 * unlocks every other room, rather than leaving them blurred until a refresh.
 */

import { useEffect } from 'react';

import Connections from '@/pages/social/Connections';
import { useSocial } from './SocialLayout';

export default function ConnectionsRoom() {
    const { reload } = useSocial();
    useEffect(() => () => { void reload(); }, [reload]);
    return <Connections />;
}
