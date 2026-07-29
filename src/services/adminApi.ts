import api from "./api";

export type Range = "7d" | "30d" | "90d";

export interface AdminList<T> {
  items: T[];
  total: number;
  page?: number;
  page_size?: number;
  limit?: number;
  skip?: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser?: boolean;
  organization_id?: string | null;
  organization_ids?: string[];
  created_at?: string;
  last_login?: string | null;
  last_active?: string | null;
  runs?: number;
  cost_usd?: number;
  plan?: string;
  subscription_status?: string | null;
  is_comped?: boolean;
}

export interface AdminTicket {
  id: string;
  customer_email: string;
  customer_name?: string | null;
  subject: string;
  body: string;
  priority: string;
  status: string;
  category?: string | null;
  channel: string;
  created_at: string;
  updated_at?: string;
  replies?: Array<{
    id: string;
    author_type: string;
    author_display_name?: string | null;
    body: string;
    created_at: string;
  }>;
}

export interface AdminSentEmail {
  id: string;
  kind: "direct" | "broadcast";
  status: "sent" | "partial" | "failed";
  subject: string;
  message?: string;
  message_preview?: string;
  to_email?: string | null;
  audience?: string | null;
  recipient_count: number;
  sent: number;
  failed: number;
  provider?: string | null;
  provider_message_id?: string | null;
  error?: string | null;
  admin_email?: string | null;
  from_name?: string | null;
  failures?: Array<{ email: string; error: string }>;
  sample?: Array<{ email: string; full_name?: string | null; plan?: string; is_comped?: boolean }>;
  missing?: string[];
  created_at?: string;
}

export interface AdminSentEmailStats {
  total: number;
  direct: number;
  broadcast: number;
  sent_total: number;
  failed_total: number;
  statuses: {
    sent: number;
    partial: number;
    failed: number;
  };
}

export interface UserConversation {
  id: string;
  title: string;
  type?: string | null;
  description?: string | null;
  message_count: number;
  member_count: number;
  last_message_at?: string | null;
  created_at?: string | null;
}

export interface UserChatMessage {
  id: string;
  role: "user" | "agent";
  user_id?: string | null;
  agent_key?: string | null;
  content?: string | null;
  mentions?: any;
  created_at?: string | null;
}

export interface UserTaskRow {
  id: string;
  title?: string | null;
  status?: string | null;
  priority?: string | null;
  assigned_to_agent?: string | null;
  due_date?: string | null;
  created_at?: string | null;
  proposal_status?: string | null;
}

export interface AgentStatRow {
  agent_key: string;
  name: string;
  description?: string | null;
  in_catalog: boolean;
  runs: number;
  unique_users: number;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  errors: number;
  avg_duration_ms?: number | null;
}

export interface AgentRunRow {
  _id?: string;
  agent_key?: string;
  user_id?: string;
  status?: string;
  trigger?: string;
  provider?: string | null;
  model_used?: string | null;
  tokens_input?: number | null;
  tokens_output?: number | null;
  cost_usd?: number | null;
  duration_ms?: number | null;
  started_at?: string | null;
  error?: string | null;
  parent_run_id?: string | null;
  conversation_id?: string | null;
  task_id?: string | null;
}

export interface AgentDetail {
  agent_key: string;
  name: string;
  description?: string | null;
  range: string;
  total_runs: number;
  errors: number;
  p50_ms?: number | null;
  p95_ms?: number | null;
  runs: AgentRunRow[];
}

export interface DigestUser {
  user_id: string;
  email?: string | null;
  full_name?: string | null;
  runs: number;
  last_run?: string | null;
}

export interface DigestRun {
  id: string;
  user_id: string;
  organization_id?: string | null;
  mode: string;
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
  duration_ms?: number | null;
  emails_processed: number;
  attachments_processed: number;
  tasks_created: number;
  proposals_drafted: number;
  digest_sent: boolean;
  skip_reason?: string | null;
  error?: string | null;
  has_raw_capture: boolean;
}

export interface DigestTrace {
  node: string;
  started_at?: string | null;
  ended_at?: string | null;
  duration_ms?: number | null;
  status: string;
  eval_score?: number | null;
  payload_summary: Record<string, any>;
}

export interface DigestRunDetail extends DigestRun {
  traces: DigestTrace[];
}

export interface DigestRawResponse {
  available: boolean;
  reason?: string;
  run_id: string;
  bundle?: {
    run_id: string;
    mode: string;
    user_id: string;
    captured_at?: string;
    expires_at?: string;
    nodes: Record<string, any>;
    meta?: Record<string, any>;
  };
}

export const adminApi = {
  me: () => api.get("/admin/me").then(r => r.data),
  overview: (range: Range = "30d") => api.get("/admin/overview", { params: { range } }).then(r => r.data),
  users: (params: { q?: string; page?: number; page_size?: number; sort?: string; order?: "asc" | "desc" } = {}) =>
    api.get<AdminList<AdminUserRow>>("/admin/users", { params }).then(r => r.data),
  userDetail: (id: string) => api.get(`/admin/users/${id}`).then(r => r.data),
  userConversations: (id: string) => api.get<{ conversations: UserConversation[] }>(`/admin/users/${id}/conversations`).then(r => r.data),
  userConversationMessages: (id: string, cid: string) => api.get<{ messages: UserChatMessage[] }>(`/admin/users/${id}/conversations/${cid}/messages`).then(r => r.data),
  userAgentRuns: (id: string) => api.get<{ runs: AgentRunRow[] }>(`/admin/users/${id}/agent-runs`).then(r => r.data),
  userAgentRun: (id: string, runId: string) => api.get<any>(`/admin/users/${id}/agent-runs/${runId}`).then(r => r.data),
  userTasks: (id: string) => api.get<{ tasks: UserTaskRow[] }>(`/admin/users/${id}/tasks`).then(r => r.data),
  patchUser: (id: string, payload: { is_active: boolean }) => api.patch(`/admin/users/${id}`, payload).then(r => r.data),
  planUpgrade: (payload: { email: string; plan: string; reason: string; send_email?: boolean; expires_at?: string | null }) =>
    api.post("/admin/users/plan-upgrade", payload).then(r => r.data),
  orgs: (params: { page?: number; page_size?: number } = {}) => api.get("/admin/orgs", { params }).then(r => r.data),
  agents: (range: Range = "30d") => api.get<{ range: string; agents: AgentStatRow[] }>("/admin/agents/stats", { params: { range } }).then(r => r.data),
  agentDetail: (agentKey: string, range: Range = "30d") => api.get<AgentDetail>(`/admin/agents/${encodeURIComponent(agentKey)}`, { params: { range } }).then(r => r.data),
  finance: () => api.get("/admin/finance/summary").then(r => r.data),
  previewEmail: (payload: { subject: string; message: string; user_name?: string }) =>
    api.post<{ subject: string; from_name: string; html: string }>("/admin/email/preview", payload).then(r => r.data),
  sendEmail: (payload: { email: string; subject: string; message: string }) => api.post("/admin/email/send", payload).then(r => r.data),
  sentEmails: (params: { kind?: "direct" | "broadcast"; status?: "sent" | "partial" | "failed"; q?: string; page?: number; page_size?: number } = {}) =>
    api.get<AdminList<AdminSentEmail> & { stats: AdminSentEmailStats }>("/admin/email/messages", { params }).then(r => r.data),
  previewBroadcast: (payload: { audience: string; emails?: string[]; subject: string; message: string; limit?: number }) =>
    api.post("/admin/email/broadcast/preview", payload).then(r => r.data),
  sendBroadcast: (payload: { audience: string; emails?: string[]; subject: string; message: string; limit?: number }) =>
    api.post("/admin/email/broadcast/send", payload).then(r => r.data),
  messages: (params: { status?: string; q?: string; page?: number; page_size?: number } = {}) =>
    api.get<{ tickets: AdminTicket[]; total: number; limit: number; offset: number }>("/admin/messages", { params }).then(r => r.data),
  message: (id: string) => api.get<AdminTicket>(`/admin/messages/${id}`).then(r => r.data),
  replyMessage: (id: string, body: string) => api.post(`/admin/messages/${id}/reply`, { body }).then(r => r.data),
  patchMessage: (id: string, status: string) => api.patch(`/admin/messages/${id}`, { status }).then(r => r.data),
  systemHealth: () => api.get("/admin/system/health").then(r => r.data),
  systemStorage: () => api.get("/admin/system/storage").then(r => r.data),
  audit: (params: { action?: string; admin_email?: string; target_type?: string; limit?: number; skip?: number } = {}) =>
    api.get("/admin/audit", { params }).then(r => r.data),
  // Daily-digest (brain) observability
  digestUsers: () => api.get<{ users: DigestUser[] }>("/admin/digest/users").then(r => r.data),
  digestRuns: (userId: string, limit = 50) =>
    api.get<{ runs: DigestRun[] }>("/admin/digest/runs", { params: { user_id: userId, limit } }).then(r => r.data),
  digestRun: (runId: string) => api.get<DigestRunDetail>(`/admin/digest/runs/${runId}`).then(r => r.data),
  digestRaw: (runId: string) => api.get<DigestRawResponse>(`/admin/digest/runs/${runId}/raw`).then(r => r.data),
};

export default adminApi;
