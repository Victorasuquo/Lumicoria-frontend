/**
 * integrationsV2Api — `/api/v1/integrations-v2/*`.  Scope-aware
 * connectors (org / team / project) with OAuth + sync + outbox.
 *
 * Baseline integrationsApi (api.ts) stays for the legacy single-scope
 * UI; this is the multi-scope surface AdminIntegrations consumes.
 */

import api from "./api";

export type ScopeType = "org" | "team" | "project";

export interface IntegrationProvider {
  key: string;
  name: string;
  category?: string;
  oauth: boolean;
  scopes: ScopeType[];
  status?: "live" | "beta" | "coming_soon";
}

export interface IntegrationConnection {
  id: string;
  provider: string;
  scope_type: ScopeType;
  scope_id: string;
  status: "connected" | "syncing" | "error" | "disconnected";
  sync_status?: string;
  last_sync_at?: string | null;
  created_at: string;
}

export const integrationsV2Api = {
  catalogue: () =>
    api.get<{ providers: IntegrationProvider[] }>(`/integrations-v2/catalogue`).then(r => r.data),

  listForScope: (scopeType: ScopeType, scopeId: string) =>
    api.get<IntegrationConnection[]>(
      `/integrations-v2/${scopeType}/${scopeId}`,
    ).then(r => r.data),

  oauthStart: (provider: string, scopeType: ScopeType, scopeId: string, payload: { return_url?: string } = {}) =>
    api.post<{ authorize_url?: string; authorize_url_hint?: string; state?: string }>(
      `/integrations-v2/${provider}/${scopeType}/${scopeId}/oauth/start`,
      payload,
      { params: { organization_id: scopeId } },
    ).then(r => r.data),

  oauthCallback: (provider: string, payload: { code: string; state: string }) =>
    api.post(`/integrations-v2/${provider}/oauth/callback`, payload).then(r => r.data),

  disconnect: (provider: string, scopeType: ScopeType, scopeId: string) =>
    api.delete(`/integrations-v2/${provider}/${scopeType}/${scopeId}`, {
      params: { organization_id: scopeId },
    }).then(r => r.data),

  sync: (provider: string, scopeType: ScopeType, scopeId: string) =>
    api.post(`/integrations-v2/${provider}/${scopeType}/${scopeId}/sync`, undefined, {
      params: { organization_id: scopeId },
    }).then(r => r.data),

  status: (provider: string, scopeType: ScopeType, scopeId: string) =>
    api.get(`/integrations-v2/${provider}/${scopeType}/${scopeId}/status`, {
      params: { organization_id: scopeId },
    }).then(r => r.data),

  post: (provider: string, scopeType: ScopeType, scopeId: string, payload: any) =>
    api.post(`/integrations-v2/${provider}/${scopeType}/${scopeId}/post`, payload, {
      params: { organization_id: scopeId },
    }).then(r => r.data),

  health: (provider: string, scopeType: ScopeType, scopeId: string) =>
    api.get(`/integrations-v2/${provider}/${scopeType}/${scopeId}/health`, {
      params: { organization_id: scopeId },
    }).then(r => r.data),

  test: (provider: string, scopeType: ScopeType, scopeId: string) =>
    api.post(`/integrations-v2/${provider}/${scopeType}/${scopeId}/test`, undefined, {
      params: { organization_id: scopeId },
    }).then(r => r.data),

  myConnected: () =>
    api.get<IntegrationConnection[]>(`/integrations-v2/me/connected`).then(r => r.data),

  scopesAvailable: (provider: string) =>
    api.get(`/integrations-v2/${provider}/scopes-available`).then(r => r.data),

  outbox: (params: { limit?: number; status?: string } = {}) =>
    api.get(`/integrations-v2/outbox`, { params }).then(r => r.data),
  retryOutbox: (outboxId: string) =>
    api.post(`/integrations-v2/outbox/${outboxId}/retry`).then(r => r.data),
  deleteOutbox: (outboxId: string) =>
    api.delete(`/integrations-v2/outbox/${outboxId}`).then(r => r.data),
};

export default integrationsV2Api;
