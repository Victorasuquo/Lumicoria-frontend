/**
 * The Social Media Agent hub.
 *
 * Everything social lives under /agents/social-media rather than a top-level
 * nav item: this is one product with several rooms, not several products.
 *
 * The shell owns the one piece of state every room needs — whether any
 * account is actually connected. Rooms that are meaningless without one
 * (analytics, inbox, composer) render their real layout behind a blur with a
 * connect prompt on top, so a new customer can see exactly what they are
 * getting before they authorise anything. An empty state that shows nothing
 * teaches nothing; a blurred real one shows the shape of the thing.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';

import AgentPageLayout from '@/components/AgentPageLayout';
import {
    type ProviderCapability, type SocialAccount, socialApi,
} from '@/services/socialApi';

interface SocialContextValue {
    accounts: SocialAccount[];
    providers: ProviderCapability[];
    /** True once at least one usable account exists. Gates every locked room. */
    connected: boolean;
    loading: boolean;
    reload: () => Promise<void>;
}

const SocialContext = createContext<SocialContextValue>({
    accounts: [], providers: [], connected: false, loading: true,
    reload: async () => { },
});

export const useSocial = () => useContext(SocialContext);

// Studio first, because it is where the work happens and it needs nothing
// connected. The automation rooms sit beside it rather than replacing it.
const TABS = [
    { to: '', label: 'Studio', end: true },
    { to: 'connections', label: 'Accounts' },
    { to: 'inbox', label: 'Inbox' },
    { to: 'rules', label: 'Auto-replies' },
    { to: 'analytics', label: 'Performance' },
];

export default function SocialLayout() {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [providers, setProviders] = useState<ProviderCapability[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            const [rows, caps] = await Promise.all([
                socialApi.listAccounts(),
                socialApi.listProviders(),
            ]);
            setAccounts(rows.filter((a) => a.status !== 'revoked'));
            setProviders(caps.providers);
        } catch {
            // A failure here means "not connected", which is the safe reading:
            // every room degrades to its locked preview rather than erroring.
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void reload(); }, [reload]);

    const value = useMemo<SocialContextValue>(() => ({
        accounts, providers, loading,
        connected: accounts.some((a) => a.status === 'active'),
        reload,
    }), [accounts, providers, loading, reload]);

    return (
        <AgentPageLayout
            agentName="Social Media Agent"
            tagline="Connect your accounts, publish everywhere, and never miss a comment"
            icon={Share2}
            gradient="from-pink-500 to-rose-600"
        >
            <SocialContext.Provider value={value}>
                <nav className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
                    {TABS.map((tab) => (
                        <NavLink key={tab.to} to={tab.to} end={tab.end}
                            className={({ isActive }) =>
                                `-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${isActive
                                    ? 'border-lumicoria-purple font-medium text-lumicoria-purple'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>
                <Outlet />
            </SocialContext.Provider>
        </AgentPageLayout>
    );
}

/**
 * Wraps a room that needs a connected account.
 *
 * Renders the real thing, blurred and inert, with a prompt over it. The point
 * is that the preview is the actual interface rather than a mockup — what you
 * see blurred is exactly what you get once you connect.
 */
export function ConnectionGate({
    children,
    title = 'Connect an account to use this',
    description,
}: {
    children: React.ReactNode;
    title?: string;
    description?: string;
}) {
    const { connected, loading } = useSocial();
    const navigate = useNavigate();

    if (loading) {
        return <div className="py-20 text-center text-sm text-gray-400">Loading…</div>;
    }
    if (connected) return <>{children}</>;

    return (
        <div className="relative">
            {/* aria-hidden + inert: the blurred layer is decoration, and a
                screen reader or keyboard user must not be able to tab into
                controls that do nothing. */}
            <div aria-hidden className="pointer-events-none select-none blur-[6px] saturate-50 opacity-60">
                {children}
            </div>

            <div className="absolute inset-0 flex items-start justify-center pt-16">
                <div className="mx-4 max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-6 text-center shadow-lg backdrop-blur">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-purple-50">
                        <Share2 size={18} className="text-lumicoria-purple" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900">{title}</h3>
                    <p className="mt-1.5 text-sm text-gray-500">
                        {description
                            ?? 'This is what it looks like with your accounts connected. Connect one to fill it with your own numbers.'}
                    </p>
                    <button onClick={() => navigate('/agents/social-media/connections')}
                        className="mt-4 w-full rounded-lg bg-lumicoria-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                        Connect an account
                    </button>
                </div>
            </div>
        </div>
    );
}
