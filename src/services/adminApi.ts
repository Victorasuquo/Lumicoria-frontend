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

export const adminApi = {
  me: () => api.get("/admin/me").then(r => r.data),
  overview: (range: Range = "30d") => api.get("/admin/overview", { params: { range } }).then(r => r.data),
  users: (params: { q?: string; page?: number; page_size?: number; sort?: string; order?: "asc" | "desc" } = {}) =>
    api.get<AdminList<AdminUserRow>>("/admin/users", { params }).then(r => r.data),
  userDetail: (id: string) => api.get(`/admin/users/${id}`).then(r => r.data),
  patchUser: (id: string, payload: { is_active: boolean }) => api.patch(`/admin/users/${id}`, payload).then(r => r.data),
  planUpgrade: (payload: { email: string; plan: string; reason: string; send_email?: boolean; expires_at?: string | null }) =>
    api.post("/admin/users/plan-upgrade", payload).then(r => r.data),
  orgs: (params: { page?: number; page_size?: number } = {}) => api.get("/admin/orgs", { params }).then(r => r.data),
  agents: (range: Range = "30d") => api.get("/admin/agents/stats", { params: { range } }).then(r => r.data),
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
};

export default adminApi;
