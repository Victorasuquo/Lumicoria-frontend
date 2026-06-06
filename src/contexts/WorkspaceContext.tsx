/**
 * WorkspaceContext — active organisation + helpers.
 *
 * Stores the currently-active organisation id in memory + localStorage so
 * the rest of the workspace surface (sidebar, tabs, API calls) can read
 * one consistent value.  Hydrates from `/workspaces/active` on mount and
 * exposes a `switchTo(orgId)` helper that updates both the server cookie
 * and the local cache.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { organizationApi } from "@/services/api";
import { workspaceApi, orgBillingApi, type OrgSubscription, type ID } from "@/services/workspaceApi";
import { useAuth } from "@/contexts/AuthContext";

interface WorkspaceMembership {
  id: ID;
  name: string;
  logo_url?: string | null;
  plan?: string | null;
  role?: "owner" | "admin" | "member" | "viewer";
}

interface WorkspaceContextValue {
  activeOrgId: ID | null;
  activeOrg: WorkspaceMembership | null;
  memberships: WorkspaceMembership[];
  subscription: OrgSubscription | null;
  loading: boolean;
  switchTo: (orgId: ID) => Promise<void>;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = "lumicoria.active_org_id";

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeOrgId, setActiveOrgId] = useState<ID | null>(() => localStorage.getItem(STORAGE_KEY));
  const [activeOrg, setActiveOrg] = useState<WorkspaceMembership | null>(null);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [subscription, setSubscription] = useState<OrgSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMemberships = useCallback(async () => {
    if (!user) {
      setMemberships([]); setActiveOrg(null); setActiveOrgId(null); setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Hydrate the primary org via /organizations/me (already wired in
      // existing organizationApi) — this gives us the bare minimum.
      const primary = await organizationApi.getMyOrg().catch(() => null);
      const ms: WorkspaceMembership[] = [];
      if (primary && ((primary as any).id || (primary as any)._id)) {
        ms.push({
          id: String((primary as any).id || (primary as any)._id),
          name: (primary as any).name || "Workspace",
          logo_url: (primary as any).logo_url || null,
          plan: (primary as any).plan || null,
        });
      }
      setMemberships(ms);
      const stored = localStorage.getItem(STORAGE_KEY);
      const next = ms.find(m => m.id === stored) || ms[0] || null;
      if (next) {
        setActiveOrg(next);
        setActiveOrgId(next.id);
        localStorage.setItem(STORAGE_KEY, next.id);
        // Pull org-scoped subscription if any (best-effort — non-team plans return free).
        try {
          const sub = await orgBillingApi.subscription(next.id);
          setSubscription(sub);
        } catch {
          setSubscription(null);
        }
      } else {
        setActiveOrg(null); setActiveOrgId(null); setSubscription(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadMemberships(); }, [loadMemberships]);

  const switchTo = useCallback(async (orgId: ID) => {
    setActiveOrgId(orgId);
    localStorage.setItem(STORAGE_KEY, orgId);
    const ms = memberships.find(m => m.id === orgId);
    if (ms) setActiveOrg(ms);
    try {
      await workspaceApi.switchTo(orgId);
    } catch { /* best-effort */ }
    try {
      const sub = await orgBillingApi.subscription(orgId);
      setSubscription(sub);
    } catch { setSubscription(null); }
  }, [memberships]);

  const refresh = useCallback(() => loadMemberships(), [loadMemberships]);

  const value = useMemo<WorkspaceContextValue>(() => ({
    activeOrgId,
    activeOrg,
    memberships,
    subscription,
    loading,
    switchTo,
    refresh,
  }), [activeOrgId, activeOrg, memberships, subscription, loading, switchTo, refresh]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = (): WorkspaceContextValue => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
};
