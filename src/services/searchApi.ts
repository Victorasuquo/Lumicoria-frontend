/**
 * searchApi — federated search across the workspace (teams, projects,
 * tasks, docs, agents, comments).  Powers /workspace/search + the
 * existing CommandPalette typeahead.
 */

import api from "./api";

export interface SearchHit {
  resource_type: "team" | "project" | "task" | "document" | "agent" | "comment" | "channel";
  resource_id: string;
  organization_id?: string;
  title: string;
  snippet?: string;
  score?: number;
  url?: string;
  matched_at?: string;
}

export const searchApi = {
  /** Federated query.  Use the CommandPalette /search/suggest for low
   *  latency typeahead; this one returns the full result set. */
  query: (q: string, opts: { types?: string[]; limit?: number } = {}) => {
    const params = new URLSearchParams({ q });
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.types?.length) opts.types.forEach(t => params.append("types", t));
    return api.get<{ hits: SearchHit[]; total?: number }>(
      `/search?${params.toString()}`,
    ).then(r => r.data);
  },

  suggest: (q: string) =>
    api.get<{ suggestions: Array<{ label: string; resource_type?: string; resource_id?: string }> }>(
      `/search/suggest`, { params: { q } },
    ).then(r => r.data),

  saved: () => api.get(`/search/saved`).then(r => r.data),
  createSaved: (payload: { name: string; query: string; filters?: any }) =>
    api.post(`/search/saved`, payload).then(r => r.data),
  deleteSaved: (searchId: string) =>
    api.delete(`/search/saved/${searchId}`).then(r => r.data),

  recent: () => api.get(`/search/recent`).then(r => r.data),
  touchRecent: (payload: { query: string }) =>
    api.post(`/search/recent`, payload).then(r => r.data),
  clearRecent: () => api.delete(`/search/recent`).then(r => r.data),
};

export default searchApi;
