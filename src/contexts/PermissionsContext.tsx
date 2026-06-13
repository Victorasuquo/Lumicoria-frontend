/**
 * PermissionsContext — cached capability probe for the signed-in user.
 *
 *   const { can, isAdmin, isOwner, role, plan } = usePermissions();
 *   if (can("invite_members")) { … }
 *
 * Reads /api/v1/permissions/me?organization_id=<active>.  Refetches when
 * the active org changes and on a coarse 60 s interval so the UI stays
 * fresh after backend role changes.
 */

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export type Capability =
  | "view_workspace"
  | "create_project" | "create_team"
  | "invite_members" | "manage_members"
  | "manage_billing" | "manage_branding" | "manage_settings"
  | "manage_automations" | "manage_webhooks" | "manage_api_tokens"
  | "manage_integrations" | "manage_sso" | "manage_scim" | "manage_custom_domains"
  | "view_audit" | "export_audit" | "manage_seats" | "manage_enterprise_features";

export interface PermissionsPayload {
  user_id: string;
  organization_id: string | null;
  plan: string;
  is_org_owner: boolean;
  is_org_admin: boolean;
  role: string;
  can: Partial<Record<Capability, boolean>>;
}

interface ContextValue {
  ready: boolean;
  loading: boolean;
  error: string | null;
  data: PermissionsPayload | null;
  can: (cap: Capability) => boolean;
  isAdmin: boolean;
  isOwner: boolean;
  role: string;
  plan: string;
  refresh: () => Promise<void>;
}

const defaultValue: ContextValue = {
  ready: false,
  loading: false,
  error: null,
  data: null,
  can: () => false,
  isAdmin: false,
  isOwner: false,
  role: "guest",
  plan: "free",
  refresh: async () => {},
};

const PermissionsContext = createContext<ContextValue>(defaultValue);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeOrgId } = useWorkspace();
  const [data, setData] = useState<PermissionsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerms = useCallback(async () => {
    if (!user?.id) { setData(null); return; }
    setLoading(true); setError(null);
    try {
      const params: Record<string, any> = {};
      if (activeOrgId) params.organization_id = activeOrgId;
      const r = await api.get<PermissionsPayload>("/permissions/me", { params });
      setData(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Could not load permissions");
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeOrgId]);

  useEffect(() => { void fetchPerms(); }, [fetchPerms]);
  useEffect(() => {
    if (!user?.id) return;
    const t = window.setInterval(() => { void fetchPerms(); }, 60_000);
    return () => window.clearInterval(t);
  }, [user?.id, fetchPerms]);

  const can = useCallback((cap: Capability) => {
    if (!data) return false;
    return Boolean(data.can?.[cap]);
  }, [data]);

  const value = useMemo<ContextValue>(() => ({
    ready: !!data || !user?.id,
    loading,
    error,
    data,
    can,
    isAdmin: !!data?.is_org_admin,
    isOwner: !!data?.is_org_owner,
    role: data?.role || "guest",
    plan: data?.plan || "free",
    refresh: fetchPerms,
  }), [data, loading, error, can, user?.id, fetchPerms]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => useContext(PermissionsContext);

/** Convenience guard: render children only if the user has the capability. */
export const Can: React.FC<{ cap: Capability; children: React.ReactNode; fallback?: React.ReactNode }> = ({ cap, children, fallback = null }) => {
  const { can } = usePermissions();
  return <>{can(cap) ? children : fallback}</>;
};

export default PermissionsContext;
