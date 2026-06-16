/**
 * mediaApi — avatar + cover uploads, media library, signed-URL,
 * resize/crop queues.  Mirrors `backend/api/v1/endpoints/media.py`.
 *
 * Avatar tile + CoverUpload components already hit /media/avatar/* and
 * /media/cover/* — those calls stay where they are.  This module is for
 * everything else (library browse, signed-url, delete, resize/crop).
 */

import api from "./api";

export type ID = string;

export const mediaApi = {
  /** Library — list every asset uploaded under the active org. */
  list: (params: { scope?: "user" | "team" | "project" | "org"; scope_id?: string; mime_prefix?: string; limit?: number } = {}) =>
    api.get(`/media/library`, { params }).then(r => r.data),

  signedUrl: (assetId: ID) =>
    api.get<{ url: string; expires_in?: number }>(`/media/${assetId}/signed-url`).then(r => r.data),

  remove: (assetId: ID) =>
    api.delete(`/media/${assetId}`).then(r => r.data),

  resize: (payload: { asset_id: string; width: number; height: number; fit?: "cover" | "contain" }) =>
    api.post(`/media/resize`, payload).then(r => r.data),

  crop: (payload: { asset_id: string; x: number; y: number; width: number; height: number }) =>
    api.post(`/media/crop`, payload).then(r => r.data),

  // ── Upload helpers (used by AvatarUpload / CoverUpload primitives) ──

  uploadUserAvatar: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/avatar/user`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  uploadOrgAvatar: (orgId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/avatar/org/${orgId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  uploadTeamAvatar: (orgId: ID, teamId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/avatar/team/${teamId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { organization_id: orgId },
    }).then(r => r.data);
  },
  uploadProjectAvatar: (orgId: ID, projectId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/avatar/project/${projectId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { organization_id: orgId },
    }).then(r => r.data);
  },
  uploadTeamCover: (orgId: ID, teamId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/cover/team/${teamId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { organization_id: orgId },
    }).then(r => r.data);
  },
  uploadProjectCover: (orgId: ID, projectId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/cover/project/${projectId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { organization_id: orgId },
    }).then(r => r.data);
  },
  uploadOrgCover: (orgId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/media/cover/org/${orgId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};

export default mediaApi;
