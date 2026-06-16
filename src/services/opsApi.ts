/**
 * opsApi — `/api/v1/ops/*`.  Admin observability surface used by the
 * Workspace Health pill on WorkspaceHome and the Admin → Ops view.
 */

import api from "./api";

export const opsApi = {
  health: () => api.get(`/ops/health`).then(r => r.data),
  version: () => api.get(`/ops/version`).then(r => r.data),
  featureFlags: () => api.get(`/ops/feature-flags`).then(r => r.data),
  queueDepth: () => api.get(`/ops/queue-depth`).then(r => r.data),
  dbStats: () => api.get(`/ops/db-stats`).then(r => r.data),
  cacheStats: () => api.get(`/ops/cache-stats`).then(r => r.data),
  orgStatus: (orgId: string) => api.get(`/ops/status/${orgId}`).then(r => r.data),
  routerSummary: () => api.get(`/ops/router-summary`).then(r => r.data),
};

export default opsApi;
