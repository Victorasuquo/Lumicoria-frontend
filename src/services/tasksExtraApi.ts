/**
 * tasksExtraApi — `/api/v1/tasks-v2/*` advanced surface.
 *
 * Wraps subtasks, history, duplicate, move/convert, templates, imports
 * (CSV/Asana/Jira/Linear/Notion/Trello), snooze, reactions,
 * cross-project dependency graph.  Used by ProjectDetail task views +
 * task detail modal.
 */

import api from "./api";

export type ID = string;

export const tasksExtraApi = {
  // Subtasks
  listSubtasks: (taskId: ID) =>
    api.get(`/tasks-v2/${taskId}/subtasks`).then(r => r.data),
  createSubtask: (taskId: ID, payload: { title: string; description?: string; priority?: string }) =>
    api.post(`/tasks-v2/${taskId}/subtasks`, payload).then(r => r.data),
  promoteSubtask: (taskId: ID) =>
    api.post(`/tasks-v2/${taskId}/promote`).then(r => r.data),

  // History + duplicate + move/convert
  history: (taskId: ID) => api.get(`/tasks-v2/${taskId}/history`).then(r => r.data),
  duplicate: (taskId: ID) => api.post(`/tasks-v2/${taskId}/duplicate`).then(r => r.data),
  moveToProject: (taskId: ID, payload: { project_id: string }) =>
    api.post(`/tasks-v2/${taskId}/move-to-project`, payload).then(r => r.data),
  convertToProject: (taskId: ID, payload: { name?: string; team_id?: string }) =>
    api.post(`/tasks-v2/${taskId}/convert-to-project`, payload).then(r => r.data),

  // Templates
  templates: () => api.get(`/tasks-v2/templates`).then(r => r.data),
  createTemplate: (payload: { name: string; description?: string; defaults?: any }) =>
    api.post(`/tasks-v2/templates`, payload).then(r => r.data),
  fromTemplate: (templateId: string, payload: { project_id: string; overrides?: any }) =>
    api.post(`/tasks-v2/from-template/${templateId}`, payload).then(r => r.data),
  deleteTemplate: (templateId: string) =>
    api.delete(`/tasks-v2/templates/${templateId}`).then(r => r.data),
  saveAsTemplate: (taskId: ID, payload: { name: string; description?: string }) =>
    api.post(`/tasks-v2/${taskId}/save-as-template`, payload).then(r => r.data),

  // Imports
  importCsv: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/tasks-v2/import/csv`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  importAsana: (payload: { token: string; workspace_id?: string; project_id?: string }) =>
    api.post(`/tasks-v2/import/asana`, payload).then(r => r.data),
  importJira: (payload: { domain: string; token: string; project_key?: string }) =>
    api.post(`/tasks-v2/import/jira`, payload).then(r => r.data),
  importLinear: (payload: { token: string; team_id?: string }) =>
    api.post(`/tasks-v2/import/linear`, payload).then(r => r.data),
  importNotion: (payload: { token: string; database_id?: string }) =>
    api.post(`/tasks-v2/import/notion`, payload).then(r => r.data),
  importTrello: (payload: { token: string; board_id?: string }) =>
    api.post(`/tasks-v2/import/trello`, payload).then(r => r.data),

  export: (payload: { format?: "csv" | "json"; project_id?: string }) =>
    api.post(`/tasks-v2/export`, payload, { responseType: "blob" }).then(r => r.data),

  // Snooze
  snooze: (taskId: ID, payload: { until: string }) =>
    api.post(`/tasks-v2/${taskId}/snooze`, payload).then(r => r.data),
  unsnooze: (taskId: ID) =>
    api.post(`/tasks-v2/${taskId}/unsnooze`).then(r => r.data),
  snoozed: () => api.get(`/tasks-v2/snoozed`).then(r => r.data),

  // Reactions
  react: (taskId: ID, emoji: string) =>
    api.post(`/tasks-v2/${taskId}/reactions/${encodeURIComponent(emoji)}`).then(r => r.data),
  unreact: (taskId: ID, emoji: string) =>
    api.delete(`/tasks-v2/${taskId}/reactions/${encodeURIComponent(emoji)}`).then(r => r.data),

  crossProjectGraph: () =>
    api.get(`/tasks-v2/dependencies/cross-project-graph`).then(r => r.data),
};

export default tasksExtraApi;
