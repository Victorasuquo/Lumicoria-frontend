/**
 * invitesExtendedApi — `/api/v1/invites/*` advanced surface.
 *
 * Baseline inviteApi (api.ts) stays for create + list + accept-by-token.
 * This module adds bulk, csv/gw imports, preview, expiry/role edits,
 * shareable links, link-accept, bulk-resend/revoke, stats, scopes.
 */

import api from "./api";

export type ID = string;

export const invitesExtendedApi = {
  bulk: (payload: { invites: Array<{ email: string; role?: string; scope?: string; scope_id?: string; note?: string }> }) =>
    api.post(`/invites/bulk`, payload).then(r => r.data),

  importCsv: (file: File, opts: { role?: string; scope?: string; scope_id?: string } = {}) => {
    const fd = new FormData();
    fd.append("file", file);
    if (opts.role) fd.append("role", opts.role);
    if (opts.scope) fd.append("scope", opts.scope);
    if (opts.scope_id) fd.append("scope_id", opts.scope_id);
    return api.post(`/invites/import-csv`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },

  importGoogleWorkspace: (payload: { google_workspace_token?: string; emails?: string[]; role?: string; scope?: string }) =>
    api.post(`/invites/import-google-workspace`, payload).then(r => r.data),

  previewTemplate: (params: { scope?: string; role?: string } = {}) =>
    api.get(`/invites/preview-template`, { params }).then(r => r.data),

  previewSend: (payload: { to: string; role?: string; scope?: string; scope_id?: string; note?: string }) =>
    api.post(`/invites/preview-send`, payload).then(r => r.data),

  extendExpiry: (inviteId: string, payload: { extra_days: number }) =>
    api.post(`/invites/${inviteId}/extend-expiry`, payload).then(r => r.data),

  changeRole: (inviteId: string, payload: { role: string }) =>
    api.post(`/invites/${inviteId}/change-role`, payload).then(r => r.data),

  // Shareable links
  links: () => api.get(`/invites/links`).then(r => r.data),
  createLink: (payload: { scope?: string; scope_id?: string; role?: string; max_uses?: number; expires_at?: string }) =>
    api.post(`/invites/links`, payload).then(r => r.data),
  deleteLink: (linkId: string) =>
    api.delete(`/invites/links/${linkId}`).then(r => r.data),
  regenerateLink: (linkId: string) =>
    api.post(`/invites/links/${linkId}/regenerate`).then(r => r.data),
  getLinkMeta: (token: string) =>
    api.get(`/invites/links/${token}`).then(r => r.data),
  acceptLink: (token: string) =>
    api.post(`/invites/links/${token}/accept`).then(r => r.data),

  // Typed accept
  acceptTeamInvite: (token: string, teamId: string) =>
    api.post(`/invites/by-token/${token}/accept/team/${teamId}`).then(r => r.data),
  acceptProjectInvite: (token: string, projectId: string) =>
    api.post(`/invites/by-token/${token}/accept/project/${projectId}`).then(r => r.data),

  // Bulk lifecycle
  bulkResend: (payload: { invite_ids: string[] }) =>
    api.post(`/invites/bulk-resend`, payload).then(r => r.data),
  bulkRevoke: (payload: { invite_ids: string[] }) =>
    api.post(`/invites/bulk-revoke`, payload).then(r => r.data),

  stats: () => api.get(`/invites/stats`).then(r => r.data),
  remind: (inviteId: string) =>
    api.post(`/invites/${inviteId}/remind`).then(r => r.data),
  scopes: () => api.get(`/invites/scopes`).then(r => r.data),
};

export default invitesExtendedApi;
