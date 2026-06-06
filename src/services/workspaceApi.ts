/**
 * Lumicoria AI — Workspace API client.
 *
 * Thin typed wrappers over the Phase A–E backend surface.  Shares the
 * authenticated axios instance from `./api`.
 */

import api from "./api";

// ───────────────────────────────────────────── shared types

export type ID = string;

export type TeamRole = "team_admin" | "editor" | "operator" | "viewer";
export type ProjectRole = "lead" | "editor" | "reviewer" | "viewer";
export type ProjectStatus = "planning" | "active" | "blocked" | "completed" | "archived";
export type ProjectVisibility = "private" | "team" | "org";

export interface Team {
  id: ID;
  organization_id: ID;
  name: string;
  slug: string;
  description?: string | null;
  department_tag?: string | null;
  color?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  owner_id: ID;
  admin_ids: ID[];
  member_ids: ID[];
  settings: Record<string, unknown>;
  branding: Record<string, unknown>;
  is_archived: boolean;
  archived_at?: string | null;
  metadata: Record<string, unknown>;
  created_by: ID;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: ID;
  organization_id: ID;
  team_id: ID;
  role: TeamRole;
  joined_at: string;
  invited_by?: ID | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface ProjectV2 {
  id: ID;
  organization_id: ID;
  team_id?: ID | null;
  name: string;
  slug: string;
  description?: string | null;
  status: ProjectStatus;
  priority?: string | null;
  color?: string | null;
  cover_image_url?: string | null;
  due_date?: string | null;
  lead_id?: ID | null;
  member_ids: ID[];
  agent_keys: string[];
  custom_agent_ids: ID[];
  tag_ids: ID[];
  strict_mode: boolean;
  visibility: ProjectVisibility;
  settings: Record<string, unknown>;
  branding: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_archived: boolean;
  archived_at?: string | null;
  created_by: ID;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  project_id: ID;
  user_id: ID;
  organization_id: ID;
  role: ProjectRole;
  joined_at: string;
  invited_by?: ID | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface ProjectAgent {
  id: ID;
  project_id: ID;
  organization_id: ID;
  agent_key?: string | null;
  custom_agent_id?: ID | null;
  enabled: boolean;
  autonomy_level: "suggest" | "auto-propose" | "auto-execute";
  config_overrides: Record<string, unknown>;
  fallback_chain: string[];
  attached_by: ID;
  created_at: string;
  updated_at: string;
}

export interface OrgSubscription {
  plan: "free" | "starter" | "professional" | "team" | "business" | "enterprise";
  status: string;
  cadence?: "monthly" | "annual";
  seats_purchased: number;
  seats_used: number;
  billing_email?: string | null;
  tax_id?: string | null;
  po_number?: string | null;
  cancel_at_period_end?: boolean;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
}

export interface AnalyticsOverview {
  time_range: string;
  since?: string;
  tasks: {
    total: number;
    completed: number;
    overdue?: number;
    completion_rate: number;
  };
  agent_runs: { total: number };
  documents?: { total: number };
  teams?: { total: number };
  projects?: { total: number };
}

export interface AgentMetric {
  id?: ID;
  agent_key?: string | null;
  custom_agent_id?: ID | null;
  organization_id: ID;
  team_id?: ID | string | null;
  project_id?: ID | null;
  window: "day" | "week" | "month" | "all";
  runs: number;
  completed: number;
  errors: number;
  avg_duration_ms?: number | null;
  max_duration_ms?: number | null;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  credits_used: number;
  last_run_at?: string | null;
  success_rate?: number;
}

export interface ActivityRow {
  id: ID;
  organization_id: ID;
  user_id?: ID;
  activity_type: string;
  details: Record<string, unknown>;
  related_resource_type?: string;
  related_resource_id?: string;
  timestamp?: string;
  severity?: string;
}

export interface CommentRow {
  id: ID;
  organization_id: ID;
  resource_type: string;
  resource_id: string;
  user_id?: ID | null;
  agent_key?: string | null;
  body: string;
  mentions: ID[];
  reactions: Record<string, ID[]>;
  parent_id?: ID | null;
  resolved: boolean;
  edited_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderRow {
  id: ID;
  user_id: ID;
  organization_id: ID;
  resource_type: string;
  resource_id: string;
  due_at: string;
  channels: string[];
  note?: string | null;
  recur_cron?: string | null;
  state: "pending" | "sent" | "cancelled";
  last_sent_at?: string | null;
  send_count: number;
}

export interface AutomationTrigger {
  type: "event" | "schedule" | "manual";
  config: Record<string, unknown>;
}
export interface AutomationCondition {
  field: string;
  op: string;
  value: unknown;
}
export interface AutomationAction {
  type: string;
  config: Record<string, unknown>;
}
export interface AutomationRow {
  id: ID;
  organization_id: ID;
  team_id?: ID | null;
  project_id?: ID | null;
  name: string;
  description?: string | null;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  last_run_at?: string | null;
  run_count: number;
  error_count: number;
  created_by?: ID | null;
  created_at: string;
  updated_at: string;
}

export interface ApiTokenRow {
  id: ID;
  organization_id: ID;
  user_id?: ID | null;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
}

export interface WebhookRow {
  id: ID;
  organization_id: ID;
  url: string;
  events: string[];
  enabled: boolean;
  last_delivery_at?: string | null;
  failure_count: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DomainClaim {
  id: ID;
  organization_id: ID;
  domain: string;
  verification_token: string;
  verified_at?: string | null;
  auto_join_role: string;
  enforced: boolean;
}

export interface SsoConfig {
  id?: ID;
  organization_id: ID;
  provider?: "saml" | "oidc";
  metadata_xml?: string | null;
  entity_id?: string | null;
  acs_url?: string | null;
  sso_url?: string | null;
  certificate?: string | null;
  default_role?: string;
  enabled: boolean;
  enforced_for_domains?: string[];
}

export interface SessionPolicy {
  organization_id: ID;
  idle_timeout_minutes: number;
  max_sessions_per_user: number;
  require_mfa: boolean;
  ip_allowlist_enabled: boolean;
  ip_allowlist: string[];
  data_residency: "us" | "eu" | "in";
  cmk_enabled: boolean;
  cmk_kms_key_id?: string | null;
}

// ───────────────────────────────────────────── workspace

export const workspaceApi = {
  // Resolve the user's current org context.  Falls back to organizationApi.getOrganization
  // when no explicit /workspaces/active is wired yet.
  active: async (): Promise<{ organization_id: ID; name?: string; plan?: string }> => {
    try {
      const { data } = await api.get("/workspaces/active");
      return data;
    } catch {
      const { data } = await api.get("/organizations/me");
      return {
        organization_id: data?.id || data?._id || data?.organization_id,
        name: data?.name,
        plan: data?.plan,
      };
    }
  },
  switchTo: async (organizationId: ID): Promise<void> => {
    try {
      await api.post("/workspaces/switch", { organization_id: organizationId });
    } catch {
      /* best-effort; the frontend still tracks state locally */
    }
  },
  overview: async (orgId: ID, timeRange = "30d"): Promise<AnalyticsOverview> => {
    const { data } = await api.get(`/analytics-v2/org/${orgId}/overview?time_range=${timeRange}`);
    return data;
  },
};

// ───────────────────────────────────────────── teams

export const teamApi = {
  list: async (orgId: ID, opts: { includeArchived?: boolean; onlyMine?: boolean; search?: string } = {}): Promise<Team[]> => {
    const params = new URLSearchParams();
    if (opts.includeArchived) params.set("include_archived", "true");
    if (opts.onlyMine) params.set("only_mine", "true");
    if (opts.search) params.set("search", opts.search);
    const { data } = await api.get(`/organizations/${orgId}/teams?${params}`);
    return data as Team[];
  },
  get: async (orgId: ID, teamId: ID): Promise<Team> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}`);
    return data as Team;
  },
  create: async (orgId: ID, payload: Partial<Team> & { name: string }): Promise<Team> => {
    const { data } = await api.post(`/organizations/${orgId}/teams`, payload);
    return data as Team;
  },
  update: async (orgId: ID, teamId: ID, patch: Partial<Team>): Promise<Team> => {
    const { data } = await api.patch(`/organizations/${orgId}/teams/${teamId}`, patch);
    return data as Team;
  },
  archive: async (orgId: ID, teamId: ID): Promise<Team> => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/archive`);
    return data as Team;
  },
  restore: async (orgId: ID, teamId: ID): Promise<Team> => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/restore`);
    return data as Team;
  },
  delete: async (orgId: ID, teamId: ID): Promise<void> => {
    await api.delete(`/organizations/${orgId}/teams/${teamId}`);
  },
  duplicate: async (orgId: ID, teamId: ID): Promise<Team> => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/duplicate`);
    return data as Team;
  },
  members: async (orgId: ID, teamId: ID): Promise<TeamMember[]> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/members`);
    return data as TeamMember[];
  },
  addMember: async (orgId: ID, teamId: ID, userId: ID, role: TeamRole = "editor"): Promise<TeamMember> => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/members`, { user_id: userId, role });
    return data as TeamMember;
  },
  removeMember: async (orgId: ID, teamId: ID, userId: ID): Promise<void> => {
    await api.delete(`/organizations/${orgId}/teams/${teamId}/members/${userId}`);
  },
  updateMemberRole: async (orgId: ID, teamId: ID, userId: ID, role: TeamRole): Promise<TeamMember> => {
    const { data } = await api.patch(`/organizations/${orgId}/teams/${teamId}/members/${userId}/role`, { role });
    return data as TeamMember;
  },
  bulkAddMembers: async (orgId: ID, teamId: ID, members: Array<{ user_id: ID; role: TeamRole }>): Promise<TeamMember[]> => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/members/bulk-add`, { members });
    return data as TeamMember[];
  },
  leave: async (orgId: ID, teamId: ID): Promise<void> => {
    await api.post(`/organizations/${orgId}/teams/${teamId}/leave`);
  },
  transferOwnership: async (orgId: ID, teamId: ID, newOwnerId: ID): Promise<Team> => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/transfer-ownership`, { new_owner_id: newOwnerId });
    return data as Team;
  },
  invites: async (orgId: ID, teamId: ID): Promise<Array<Record<string, unknown>>> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/invites`);
    return data;
  },
  createInvite: async (orgId: ID, teamId: ID, payload: { email: string; role?: string; team_role?: TeamRole; message?: string }) => {
    const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/invites`, payload);
    return data;
  },
  projects: async (orgId: ID, teamId: ID): Promise<ProjectV2[]> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/projects`);
    return data as ProjectV2[];
  },
  agents: async (orgId: ID, teamId: ID): Promise<{ agents: Array<{ agent_key?: string; custom_agent_id?: string; enabled: boolean; autonomy_level?: string }> }> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/agents`);
    return data;
  },
  activity: async (orgId: ID, teamId: ID, limit = 100): Promise<ActivityRow[]> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/activity?limit=${limit}`);
    return data;
  },
  analytics: async (orgId: ID, teamId: ID, range = "30d"): Promise<AnalyticsOverview> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/analytics?time_range=${range}`);
    return data;
  },
  permissions: async (orgId: ID, teamId: ID): Promise<{ is_owner: boolean; is_admin: boolean; role?: string; can: Record<string, boolean> }> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/permissions`);
    return data;
  },
  settings: async (orgId: ID, teamId: ID): Promise<{ settings: Record<string, unknown> }> => {
    const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/settings`);
    return data;
  },
  patchSettings: async (orgId: ID, teamId: ID, settings: Record<string, unknown>) => {
    const { data } = await api.patch(`/organizations/${orgId}/teams/${teamId}/settings`, settings);
    return data;
  },
};

// ───────────────────────────────────────────── projects v2

export const projectV2Api = {
  list: async (orgId: ID, opts: { teamId?: ID; onlyMine?: boolean; status?: string; includeArchived?: boolean; search?: string } = {}): Promise<ProjectV2[]> => {
    const params = new URLSearchParams();
    if (opts.teamId) params.set("team_id", opts.teamId);
    if (opts.onlyMine) params.set("only_mine", "true");
    if (opts.status) params.set("status", opts.status);
    if (opts.includeArchived) params.set("include_archived", "true");
    if (opts.search) params.set("search", opts.search);
    const { data } = await api.get(`/organizations/${orgId}/projects?${params}`);
    return data as ProjectV2[];
  },
  get: async (orgId: ID, projectId: ID): Promise<ProjectV2> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}`);
    return data as ProjectV2;
  },
  create: async (orgId: ID, payload: Partial<ProjectV2> & { name: string }): Promise<ProjectV2> => {
    const { data } = await api.post(`/organizations/${orgId}/projects`, payload);
    return data as ProjectV2;
  },
  update: async (orgId: ID, projectId: ID, patch: Partial<ProjectV2>): Promise<ProjectV2> => {
    const { data } = await api.patch(`/organizations/${orgId}/projects/${projectId}`, patch);
    return data as ProjectV2;
  },
  delete: async (orgId: ID, projectId: ID): Promise<void> => {
    await api.delete(`/organizations/${orgId}/projects/${projectId}`);
  },
  archive: async (orgId: ID, projectId: ID): Promise<ProjectV2> => {
    const { data } = await api.post(`/organizations/${orgId}/projects/${projectId}/archive`);
    return data as ProjectV2;
  },
  restore: async (orgId: ID, projectId: ID): Promise<ProjectV2> => {
    const { data } = await api.post(`/organizations/${orgId}/projects/${projectId}/restore`);
    return data as ProjectV2;
  },
  members: async (orgId: ID, projectId: ID): Promise<ProjectMember[]> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/members`);
    return data as ProjectMember[];
  },
  addMember: async (orgId: ID, projectId: ID, userId: ID, role: ProjectRole = "editor"): Promise<ProjectMember> => {
    const { data } = await api.post(`/organizations/${orgId}/projects/${projectId}/members`, { user_id: userId, role });
    return data as ProjectMember;
  },
  removeMember: async (orgId: ID, projectId: ID, userId: ID): Promise<void> => {
    await api.delete(`/organizations/${orgId}/projects/${projectId}/members/${userId}`);
  },
  agents: async (orgId: ID, projectId: ID): Promise<ProjectAgent[]> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/agents`);
    return data as ProjectAgent[];
  },
  attachAgent: async (orgId: ID, projectId: ID, payload: Partial<ProjectAgent> & { agent_key?: string; custom_agent_id?: string }): Promise<ProjectAgent> => {
    const { data } = await api.post(`/organizations/${orgId}/projects/${projectId}/agents`, payload);
    return data as ProjectAgent;
  },
  detachAgent: async (orgId: ID, projectId: ID, agentRef: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}/projects/${projectId}/agents/${agentRef}`);
  },
  patchAgentConfig: async (orgId: ID, projectId: ID, agentRef: string, patch: Partial<ProjectAgent>): Promise<ProjectAgent> => {
    const { data } = await api.patch(`/organizations/${orgId}/projects/${projectId}/agents/${agentRef}/config`, patch);
    return data as ProjectAgent;
  },
  tasks: async (orgId: ID, projectId: ID, status?: string): Promise<Array<Record<string, unknown>>> => {
    const params = status ? `?status=${encodeURIComponent(status)}` : "";
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/tasks${params}`);
    return data;
  },
  documents: async (orgId: ID, projectId: ID): Promise<Array<Record<string, unknown>>> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/documents`);
    return data;
  },
  activity: async (orgId: ID, projectId: ID): Promise<ActivityRow[]> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/activity`);
    return data;
  },
  analytics: async (orgId: ID, projectId: ID, range = "30d"): Promise<AnalyticsOverview> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/analytics?time_range=${range}`);
    return data;
  },
  permissions: async (orgId: ID, projectId: ID): Promise<{ is_lead: boolean; role?: string; can: Record<string, boolean> }> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/permissions`);
    return data;
  },
  settings: async (orgId: ID, projectId: ID): Promise<{ settings: Record<string, unknown> }> => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/settings`);
    return data;
  },
};

// ───────────────────────────────────────────── org billing

export const orgBillingApi = {
  subscription: async (orgId: ID): Promise<OrgSubscription> => {
    const { data } = await api.get(`/org-billing/${orgId}/subscription`);
    return data as OrgSubscription;
  },
  usage: async (orgId: ID): Promise<{ plan: string; seats_purchased: number; seats_used: number; seats_remaining: number; limits: Record<string, number> }> => {
    const { data } = await api.get(`/org-billing/${orgId}/usage`);
    return data;
  },
  seats: async (orgId: ID): Promise<{ purchased: number; used: number; assignments: Array<{ user_id: ID; assigned_at: string; assigned_by?: ID; metadata?: Record<string, unknown> }> }> => {
    const { data } = await api.get(`/org-billing/${orgId}/seats`);
    return data;
  },
  assignSeat: async (orgId: ID, userId: ID): Promise<{ seats_used: number }> => {
    const { data } = await api.post(`/org-billing/${orgId}/seats/assign`, { user_id: userId });
    return data;
  },
  removeSeat: async (orgId: ID, userId: ID): Promise<void> => {
    await api.delete(`/org-billing/${orgId}/seats/${userId}`);
  },
  buySeats: async (orgId: ID, qty: number): Promise<{ purchased: number }> => {
    const { data } = await api.post(`/org-billing/${orgId}/seats/buy`, { quantity: qty });
    return data;
  },
  returnSeats: async (orgId: ID, qty: number): Promise<{ purchased: number }> => {
    const { data } = await api.post(`/org-billing/${orgId}/seats/return`, { quantity: qty });
    return data;
  },
  invoices: async (orgId: ID): Promise<{ invoices: Array<Record<string, unknown>> }> => {
    const { data } = await api.get(`/org-billing/${orgId}/invoices`);
    return data;
  },
  checkout: async (orgId: ID, payload: { plan: string; cadence: "monthly" | "annual"; seats: number; success_url?: string; cancel_url?: string }): Promise<{ checkout_url: string; session_id: string }> => {
    const { data } = await api.post(`/org-billing/${orgId}/checkout`, payload);
    return data;
  },
  portal: async (orgId: ID, returnUrl?: string): Promise<{ portal_url: string }> => {
    const { data } = await api.post(`/org-billing/${orgId}/portal`, { return_url: returnUrl });
    return data;
  },
  quote: async (payload: { plan: string; cadence: "monthly" | "annual"; seats: number }): Promise<Record<string, unknown>> => {
    const { data } = await api.post("/org-billing/quote", payload);
    return data;
  },
  plans: async (): Promise<{ plans: Array<{ plan: string; display_name: string; per_seat_monthly: number; annual_discount_pct: number; limits: Record<string, number>; capabilities: Record<string, boolean> }> }> => {
    const { data } = await api.get("/org-billing/plans");
    return data;
  },
};

// ───────────────────────────────────────────── analytics v2

export const analyticsV2Api = {
  orgOverview: async (orgId: ID, range = "30d"): Promise<AnalyticsOverview> => {
    const { data } = await api.get(`/analytics-v2/org/${orgId}/overview?time_range=${range}`);
    return data;
  },
  orgThroughput: async (orgId: ID, range = "30d") => (await api.get(`/analytics-v2/org/${orgId}/throughput?time_range=${range}`)).data,
  orgCycleTime: async (orgId: ID, range = "30d") => (await api.get(`/analytics-v2/org/${orgId}/cycle-time?time_range=${range}`)).data,
  orgCost: async (orgId: ID, range = "30d") => (await api.get(`/analytics-v2/org/${orgId}/cost?time_range=${range}`)).data,
  orgSeatForecast: async (orgId: ID, horizonDays = 90) => (await api.get(`/analytics-v2/org/${orgId}/seat-forecast?horizon_days=${horizonDays}`)).data,
  team: async (teamId: ID, orgId?: ID, range = "30d") => {
    const params = new URLSearchParams({ time_range: range });
    if (orgId) params.set("organization_id", orgId);
    return (await api.get(`/analytics-v2/team/${teamId}/overview?${params}`)).data as AnalyticsOverview;
  },
  projectBurnup: async (projectId: ID, orgId?: ID, range = "30d") => {
    const params = new URLSearchParams({ time_range: range });
    if (orgId) params.set("organization_id", orgId);
    return (await api.get(`/analytics-v2/project/${projectId}/burnup?${params}`)).data;
  },
  projectThroughput: async (projectId: ID, orgId?: ID, range = "30d") => {
    const params = new URLSearchParams({ time_range: range });
    if (orgId) params.set("organization_id", orgId);
    return (await api.get(`/analytics-v2/project/${projectId}/throughput?${params}`)).data;
  },
  me: async (range = "30d") => (await api.get(`/analytics-v2/me?time_range=${range}`)).data,
  orgAuditRecent: async (orgId: ID, limit = 200, filters: { severity?: string; activity_type?: string; resource_type?: string } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return (await api.get(`/analytics-v2/org/${orgId}/audit/recent?${params}`)).data as ActivityRow[];
  },
  orgAuditExport: async (orgId: ID, days = 30, format: "csv" | "jsonl" = "jsonl") =>
    (await api.post(`/analytics-v2/org/${orgId}/audit/export?days=${days}&format=${format}`)).data,
};

// ───────────────────────────────────────────── agents v2

export const agentsV2Api = {
  platform: async () => (await api.get("/agents-v2/platform")).data as { count: number; agents: Array<{ key: string; name: string; description?: string }> },
  metrics: async (params: { organization_id?: ID; agent_key?: string; project_id?: ID; team_id?: ID; window?: string } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) q.set(k, String(v)); });
    return (await api.get(`/agents-v2/metrics?${q}`)).data as AgentMetric[];
  },
  leaderboard: async (orgId?: ID, window = "month", limit = 25) => {
    const q = new URLSearchParams({ window, limit: String(limit) });
    if (orgId) q.set("organization_id", orgId);
    return (await api.get(`/agents-v2/leaderboard?${q}`)).data;
  },
  costBreakdown: async (orgId?: ID, window = "month") => {
    const q = new URLSearchParams({ window });
    if (orgId) q.set("organization_id", orgId);
    return (await api.get(`/agents-v2/cost-breakdown?${q}`)).data;
  },
  tokenBurn: async (orgId?: ID, window = "month") => {
    const q = new URLSearchParams({ window });
    if (orgId) q.set("organization_id", orgId);
    return (await api.get(`/agents-v2/token-burn?${q}`)).data;
  },
  errorRate: async (orgId?: ID, window = "month") => {
    const q = new URLSearchParams({ window });
    if (orgId) q.set("organization_id", orgId);
    return (await api.get(`/agents-v2/error-rate?${q}`)).data;
  },
  runs: async (orgId: ID, opts: { agent_key?: string; status?: string; limit?: number } = {}) => {
    const q = new URLSearchParams({ organization_id: orgId });
    Object.entries(opts).forEach(([k, v]) => { if (v != null) q.set(k, String(v)); });
    return (await api.get(`/agents-v2/runs?${q}`)).data;
  },
  setAutonomy: async (projectId: ID, agentRef: string, level: "suggest" | "auto-propose" | "auto-execute", orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return (await api.patch(`/agents-v2/projects/${projectId}/agents/${agentRef}/autonomy${q}`, { level })).data;
  },
  setModel: async (projectId: ID, agentRef: string, model: string, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return (await api.patch(`/agents-v2/projects/${projectId}/agents/${agentRef}/model${q}`, { model })).data;
  },
};

// ───────────────────────────────────────────── reminders / automations / comments

export const remindersApi = {
  list: (params: { state?: string; upcoming_only?: boolean; organization_id?: ID } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== false) q.set(k, String(v)); });
    return api.get(`/reminders?${q}`).then(r => r.data as ReminderRow[]);
  },
  upcoming: () => api.get("/reminders/upcoming").then(r => r.data as ReminderRow[]),
  overdue: () => api.get("/reminders/overdue").then(r => r.data as ReminderRow[]),
  create: (payload: { resource_type: string; resource_id: string; due_at: string; channels: string[]; note?: string; recur_cron?: string }, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.post(`/reminders${q}`, payload).then(r => r.data as ReminderRow);
  },
  snooze: (id: ID, minutes = 60) => api.post(`/reminders/${id}/snooze?minutes=${minutes}`).then(r => r.data),
  delete: (id: ID) => api.delete(`/reminders/${id}`),
};

export const automationsApi = {
  list: (params: { organization_id?: ID; enabled?: boolean; project_id?: ID; team_id?: ID } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) q.set(k, String(v)); });
    return api.get(`/automations?${q}`).then(r => r.data as AutomationRow[]);
  },
  get: (id: ID, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.get(`/automations/${id}${q}`).then(r => r.data as AutomationRow);
  },
  create: (payload: Partial<AutomationRow> & { name: string; trigger: AutomationTrigger; actions: AutomationAction[] }, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.post(`/automations${q}`, payload).then(r => r.data as AutomationRow);
  },
  patch: (id: ID, patch: Partial<AutomationRow>, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.patch(`/automations/${id}${q}`, patch).then(r => r.data as AutomationRow);
  },
  delete: (id: ID, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.delete(`/automations/${id}${q}`);
  },
  enable: (id: ID, orgId?: ID) => api.post(`/automations/${id}/enable${orgId ? `?organization_id=${orgId}` : ""}`).then(r => r.data as AutomationRow),
  disable: (id: ID, orgId?: ID) => api.post(`/automations/${id}/disable${orgId ? `?organization_id=${orgId}` : ""}`).then(r => r.data as AutomationRow),
  catalogue: () => api.get("/automations/event-catalogue").then(r => r.data),
  runs: (params: { organization_id?: ID; automation_id?: ID; status?: string } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) q.set(k, String(v)); });
    return api.get(`/automations/runs?${q}`).then(r => r.data);
  },
};

export const commentsApi = {
  list: (resourceType: string, resourceId: string, orgId?: ID) => {
    const q = new URLSearchParams({ resource_type: resourceType, resource_id: resourceId });
    if (orgId) q.set("organization_id", orgId);
    return api.get(`/comments?${q}`).then(r => r.data as CommentRow[]);
  },
  create: (payload: { resource_type: string; resource_id: string; body: string; mentions?: ID[]; parent_id?: ID }, orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.post(`/comments${q}`, payload).then(r => r.data as CommentRow);
  },
  patch: (id: ID, patch: Partial<CommentRow>) => api.patch(`/comments/${id}`, patch).then(r => r.data as CommentRow),
  delete: (id: ID) => api.delete(`/comments/${id}`),
  react: (id: ID, emoji: string) => api.post(`/comments/${id}/reactions/${encodeURIComponent(emoji)}`).then(r => r.data),
  unreact: (id: ID, emoji: string) => api.delete(`/comments/${id}/reactions/${encodeURIComponent(emoji)}`).then(r => r.data),
  myMentions: (orgId?: ID) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.get(`/comments/mentions/me${q}`).then(r => r.data as CommentRow[]);
  },
};

export const notificationRulesApi = {
  categories: () => api.get("/notification-rules/categories").then(r => r.data),
  preferences: () => api.get("/notification-rules/preferences").then(r => r.data),
  upsert: (payload: { channel: string; category: string; enabled?: boolean; quiet_hours?: Record<string, unknown> }) =>
    api.patch("/notification-rules/preferences", payload).then(r => r.data),
  getQuietHours: () => api.get("/notification-rules/quiet-hours").then(r => r.data),
  setQuietHours: (payload: { start?: string; end?: string; timezone?: string }) =>
    api.patch("/notification-rules/quiet-hours", payload).then(r => r.data),
};

// ───────────────────────────────────────────── enterprise

export const enterpriseApi = {
  // API tokens
  listApiTokens: (orgId: ID) => api.get(`/enterprise/${orgId}/api-tokens`).then(r => r.data as ApiTokenRow[]),
  scopes: () => api.get("/enterprise/api-tokens/scopes").then(r => r.data as { scopes: string[] }),
  createApiToken: (orgId: ID, payload: { name: string; scopes: string[]; user_id?: ID; expires_at?: string }) =>
    api.post(`/enterprise/${orgId}/api-tokens`, payload).then(r => r.data as { plaintext_token: string; token: ApiTokenRow; warning: string }),
  rotateApiToken: (orgId: ID, tokenId: ID) =>
    api.post(`/enterprise/${orgId}/api-tokens/${tokenId}/rotate`).then(r => r.data as { plaintext_token: string; token: ApiTokenRow }),
  revokeApiToken: (orgId: ID, tokenId: ID) => api.delete(`/enterprise/${orgId}/api-tokens/${tokenId}`),
  // Webhooks
  listWebhooks: (orgId: ID) => api.get(`/enterprise/${orgId}/webhooks`).then(r => r.data as WebhookRow[]),
  createWebhook: (orgId: ID, payload: { url: string; events: string[]; description?: string }) =>
    api.post(`/enterprise/${orgId}/webhooks`, payload).then(r => r.data as { signing_secret: string; webhook: WebhookRow; warning: string }),
  patchWebhook: (orgId: ID, webhookId: ID, patch: Partial<WebhookRow>) =>
    api.patch(`/enterprise/${orgId}/webhooks/${webhookId}`, patch).then(r => r.data as WebhookRow),
  deleteWebhook: (orgId: ID, webhookId: ID) => api.delete(`/enterprise/${orgId}/webhooks/${webhookId}`),
  testWebhook: (orgId: ID, webhookId: ID) => api.post(`/enterprise/${orgId}/webhooks/${webhookId}/test`).then(r => r.data),
  // SSO
  getSso: (orgId: ID) => api.get(`/enterprise/${orgId}/sso`).then(r => r.data as SsoConfig),
  patchSso: (orgId: ID, patch: Partial<SsoConfig>) => api.patch(`/enterprise/${orgId}/sso`, patch).then(r => r.data as SsoConfig),
  // SCIM tokens
  listScimTokens: (orgId: ID) => api.get(`/enterprise/${orgId}/scim-tokens`).then(r => r.data),
  createScimToken: (orgId: ID, name?: string) =>
    api.post(`/enterprise/${orgId}/scim-tokens`, { name }).then(r => r.data as { plaintext_token: string; token: Record<string, unknown>; warning: string }),
  revokeScimToken: (orgId: ID, tokenId: ID) => api.delete(`/enterprise/${orgId}/scim-tokens/${tokenId}`),
  // Domains
  listDomains: (orgId: ID) => api.get(`/enterprise/${orgId}/domains`).then(r => r.data as DomainClaim[]),
  addDomain: (orgId: ID, payload: { domain: string; auto_join_role?: string; enforced?: boolean }) =>
    api.post(`/enterprise/${orgId}/domains`, payload).then(r => r.data),
  verifyDomain: (orgId: ID, domain: string) => api.post(`/enterprise/${orgId}/domains/${domain}/verify`).then(r => r.data as DomainClaim),
  deleteDomain: (orgId: ID, domain: string) => api.delete(`/enterprise/${orgId}/domains/${domain}`),
  // Session policy
  getPolicy: (orgId: ID) => api.get(`/enterprise/${orgId}/session-policy`).then(r => r.data as SessionPolicy),
  patchPolicy: (orgId: ID, patch: Partial<SessionPolicy>) => api.patch(`/enterprise/${orgId}/session-policy`, patch).then(r => r.data as SessionPolicy),
  // Compliance
  complianceStatus: (orgId: ID) => api.get(`/enterprise/${orgId}/compliance/status`).then(r => r.data),
  requestCompliance: (orgId: ID, payload: { document_type: string; contact_email: string; notes?: string }) =>
    api.post(`/enterprise/${orgId}/compliance/request`, payload).then(r => r.data),
};
