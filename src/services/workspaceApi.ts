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
  logo_url?: string | null;
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
  updateMemberRole: async (orgId: ID, projectId: ID, userId: ID, role: ProjectRole): Promise<ProjectMember> => {
    const { data } = await api.patch(`/organizations/${orgId}/projects/${projectId}/members/${userId}/role`, { role });
    return data as ProjectMember;
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

/**
 * Presence — REST companion to the /ws/presence WebSocket.
 * Use only when a one-shot snapshot is enough (e.g. an admin dashboard);
 * the live RealtimeContext already streams every change over WS.
 */
export const presenceApi = {
  snapshot: (orgId: ID) =>
    api.get<{ organization_id: string; online_user_ids: string[] }>(
      `/ws/presence/snapshot`, { params: { organization_id: orgId } },
    ).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════
// BATCH 1 EXTENSIONS — extend every existing namespace with the missing
// endpoints from the OpenAPI surface.  Object.assign keeps the existing
// methods + adds the new ones onto the SAME exported reference, so
// consumers don't need to switch imports.
// ════════════════════════════════════════════════════════════════════

// ── workspaceApi (federated workspace router) ────────────────────────

Object.assign(workspaceApi, {
  list: () => api.get(`/workspaces`).then(r => r.data),
  search: (orgId: ID, q: string) =>
    api.get(`/workspaces/${orgId}/search`, { params: { q } }).then(r => r.data),
  timeline: (orgId: ID, limit = 100) =>
    api.get(`/workspaces/${orgId}/timeline`, { params: { limit } }).then(r => r.data),
  calendar: (orgId: ID, daysAhead = 14) =>
    api.get(`/workspaces/${orgId}/calendar`, { params: { days_ahead: daysAhead } }).then(r => r.data),
  quickActions: (orgId: ID) => api.get(`/workspaces/${orgId}/quick-actions`).then(r => r.data),
  defaults: (orgId: ID) => api.get(`/workspaces/${orgId}/defaults`).then(r => r.data),
  patchDefaults: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/workspaces/${orgId}/defaults`, patch).then(r => r.data),
  preferredView: (orgId: ID) => api.get(`/workspaces/${orgId}/preferred-view`).then(r => r.data),
  setPreferredView: (orgId: ID, view: string) =>
    api.patch(`/workspaces/${orgId}/preferred-view`, { view }).then(r => r.data),
  widgetConfig: (orgId: ID) => api.get(`/workspaces/${orgId}/widget-config`).then(r => r.data),
  patchWidgetConfig: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/workspaces/${orgId}/widget-config`, patch).then(r => r.data),
  pinned: (orgId: ID) => api.get(`/workspaces/${orgId}/pinned`).then(r => r.data),
  pin: (orgId: ID, payload: { resource_type: string; resource_id: string; label?: string }) =>
    api.post(`/workspaces/${orgId}/pinned`, payload).then(r => r.data),
  unpin: (orgId: ID, pinId: string) =>
    api.delete(`/workspaces/${orgId}/pinned/${pinId}`).then(r => r.data),
  recent: (orgId: ID) => api.get(`/workspaces/${orgId}/recent`).then(r => r.data),
  touchRecent: (orgId: ID, payload: { resource_type: string; resource_id: string }) =>
    api.post(`/workspaces/${orgId}/recent`, payload).then(r => r.data),
  clearRecent: (orgId: ID) => api.delete(`/workspaces/${orgId}/recent`).then(r => r.data),
  starred: (orgId: ID) => api.get(`/workspaces/${orgId}/starred`).then(r => r.data),
  addStarred: (orgId: ID, payload: { resource_type: string; resource_id: string; label?: string }) =>
    api.post(`/workspaces/${orgId}/starred`, payload).then(r => r.data),
  removeStarred: (orgId: ID, starId: string) =>
    api.delete(`/workspaces/${orgId}/starred/${starId}`).then(r => r.data),
  dashboards: (orgId: ID) => api.get(`/workspaces/${orgId}/dashboards`).then(r => r.data),
  createDashboard: (orgId: ID, payload: { name: string; layout: any[]; description?: string }) =>
    api.post(`/workspaces/${orgId}/dashboards`, payload).then(r => r.data),
  updateDashboard: (orgId: ID, dashboardId: string, patch: Record<string, any>) =>
    api.patch(`/workspaces/${orgId}/dashboards/${dashboardId}`, patch).then(r => r.data),
  deleteDashboard: (orgId: ID, dashboardId: string) =>
    api.delete(`/workspaces/${orgId}/dashboards/${dashboardId}`).then(r => r.data),
  dashboardData: (orgId: ID, dashboardId: string) =>
    api.get(`/workspaces/${orgId}/dashboards/${dashboardId}/data`).then(r => r.data),
  exports: (orgId: ID) => api.get(`/workspaces/${orgId}/exports`).then(r => r.data),
  requestExport: (orgId: ID, payload: { kind: string; format?: string; filters?: any }) =>
    api.post(`/workspaces/${orgId}/exports`, payload).then(r => r.data),
  getExport: (orgId: ID, jobId: string) =>
    api.get(`/workspaces/${orgId}/exports/${jobId}`).then(r => r.data),
  onboardingTour: (orgId: ID) => api.get(`/workspaces/${orgId}/onboarding-tour`).then(r => r.data),
  completeTourStep: (orgId: ID, step: string) =>
    api.post(`/workspaces/${orgId}/onboarding-tour/${step}/complete`).then(r => r.data),
  dismissOnboardingTour: (orgId: ID) =>
    api.post(`/workspaces/${orgId}/onboarding-tour/dismiss`).then(r => r.data),
  resetOnboardingTour: (orgId: ID) =>
    api.post(`/workspaces/${orgId}/onboarding-tour/reset`).then(r => r.data),
  unread: (orgId: ID) => api.get(`/workspaces/${orgId}/unread`).then(r => r.data),
  seatsSummary: (orgId: ID) => api.get(`/workspaces/${orgId}/seats-summary`).then(r => r.data),
  health: (orgId: ID) => api.get(`/workspaces/${orgId}/health`).then(r => r.data),
});

// ── orgExtendedApi — organisations-extended router ───────────────────

export const orgExtendedApi = {
  stats: (orgId: ID) => api.get(`/organizations/${orgId}/stats`).then(r => r.data),
  profile: (orgId: ID) => api.get(`/organizations/${orgId}/profile`).then(r => r.data),
  updateProfile: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/profile`, patch).then(r => r.data),
  uploadProfileLogo: (orgId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/profile/logo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  uploadProfileCover: (orgId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/profile/cover`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  branding: (orgId: ID) => api.get(`/organizations/${orgId}/branding`).then(r => r.data),
  updateBranding: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/branding`, patch).then(r => r.data),
  settings: (orgId: ID) => api.get(`/organizations/${orgId}/settings`).then(r => r.data),
  patchSettings: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/settings`, patch).then(r => r.data),
  limits: (orgId: ID) => api.get(`/organizations/${orgId}/limits`).then(r => r.data),
  upgradePlan: (orgId: ID, payload: { plan: string }) =>
    api.post(`/organizations/${orgId}/upgrade-plan`, payload).then(r => r.data),
  admins: (orgId: ID) => api.get(`/organizations/${orgId}/admins`).then(r => r.data),
  owners: (orgId: ID) => api.get(`/organizations/${orgId}/owners`).then(r => r.data),
  transferOwner: (orgId: ID, payload: { new_owner_id: string }) =>
    api.post(`/organizations/${orgId}/owners/transfer`, payload).then(r => r.data),
  delegateOwner: (orgId: ID, payload: { user_id: string; until?: string }) =>
    api.post(`/organizations/${orgId}/owners/delegate`, payload).then(r => r.data),
  seatStatus: (orgId: ID) => api.get(`/organizations/${orgId}/seat-status`).then(r => r.data),
  tags: (orgId: ID) => api.get(`/organizations/${orgId}/tags`).then(r => r.data),
  createTag: (orgId: ID, payload: { name: string; color?: string; scope?: string }) =>
    api.post(`/organizations/${orgId}/tags`, payload).then(r => r.data),
  updateTag: (orgId: ID, tagId: string, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/tags/${tagId}`, patch).then(r => r.data),
  deleteTag: (orgId: ID, tagId: string) =>
    api.delete(`/organizations/${orgId}/tags/${tagId}`).then(r => r.data),
  announcements: (orgId: ID) =>
    api.get(`/organizations/${orgId}/announcements`).then(r => r.data),
  createAnnouncement: (orgId: ID, payload: { title: string; body: string; pinned?: boolean }) =>
    api.post(`/organizations/${orgId}/announcements`, payload).then(r => r.data),
  deleteAnnouncement: (orgId: ID, announcementId: string) =>
    api.delete(`/organizations/${orgId}/announcements/${announcementId}`).then(r => r.data),
  onboardingChecklist: (orgId: ID) =>
    api.get(`/organizations/${orgId}/onboarding-checklist`).then(r => r.data),
  completeOnboardingStep: (orgId: ID, stepId: string) =>
    api.post(`/organizations/${orgId}/onboarding-checklist/${stepId}/complete`).then(r => r.data),
  activity: (orgId: ID, opts: { limit?: number; type?: string } = {}) =>
    api.get(`/organizations/${orgId}/activity`, { params: opts }).then(r => r.data),
  exportActivity: (orgId: ID, payload: { start_date?: string; end_date?: string; format?: string }) =>
    api.post(`/organizations/${orgId}/activity/export`, payload).then(r => r.data),
  customRoles: (orgId: ID) => api.get(`/organizations/${orgId}/custom-roles`).then(r => r.data),
  createCustomRole: (orgId: ID, payload: { name: string; permissions: string[]; description?: string }) =>
    api.post(`/organizations/${orgId}/custom-roles`, payload).then(r => r.data),
  updateCustomRole: (orgId: ID, roleId: string, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/custom-roles/${roleId}`, patch).then(r => r.data),
  deleteCustomRole: (orgId: ID, roleId: string) =>
    api.delete(`/organizations/${orgId}/custom-roles/${roleId}`).then(r => r.data),
  domainsProxy: (orgId: ID) => api.get(`/organizations/${orgId}/domains`).then(r => r.data),
  integrationsProxy: (orgId: ID) =>
    api.get(`/organizations/${orgId}/integrations`).then(r => r.data),
  webhooksProxy: (orgId: ID) => api.get(`/organizations/${orgId}/webhooks`).then(r => r.data),
  apiTokensProxy: (orgId: ID) => api.get(`/organizations/${orgId}/api-tokens`).then(r => r.data),
  posture: (orgId: ID) => api.get(`/organizations/${orgId}/posture`).then(r => r.data),
  health: (orgId: ID) => api.get(`/organizations/${orgId}/health`).then(r => r.data),
};

// ── teamApi extension — teams + teams-extended ───────────────────────

Object.assign(teamApi, {
  branding: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/branding`).then(r => r.data),
  updateBranding: (orgId: ID, teamId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/teams/${teamId}/branding`, patch).then(r => r.data),
  exportActivity: (orgId: ID, teamId: ID, payload: { start_date?: string; end_date?: string; format?: string }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/activity/export`, payload).then(r => r.data),
  analyticsTasks: (orgId: ID, teamId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/teams/${teamId}/analytics/tasks`, { params: { time_range: timeRange } }).then(r => r.data),
  analyticsAgents: (orgId: ID, teamId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/teams/${teamId}/analytics/agents`, { params: { time_range: timeRange } }).then(r => r.data),
  analyticsMembers: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/analytics/members`).then(r => r.data),
  analyticsDocuments: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/analytics/documents`).then(r => r.data),
  analyticsTimeline: (orgId: ID, teamId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/teams/${teamId}/analytics/timeline`, { params: { time_range: timeRange } }).then(r => r.data),
  savedViews: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/views`).then(r => r.data),
  createSavedView: (orgId: ID, teamId: ID, payload: { name: string; filters: any; view_type?: string }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/views`, payload).then(r => r.data),
  deleteSavedView: (orgId: ID, teamId: ID, viewId: string) =>
    api.delete(`/organizations/${orgId}/teams/${teamId}/views/${viewId}`).then(r => r.data),
  notificationSettings: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/settings/notifications`).then(r => r.data),
  patchNotificationSettings: (orgId: ID, teamId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/teams/${teamId}/settings/notifications`, patch).then(r => r.data),
  permissionSettings: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/settings/permissions`).then(r => r.data),
  patchPermissionSettings: (orgId: ID, teamId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/teams/${teamId}/settings/permissions`, patch).then(r => r.data),
  tags: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/tags`).then(r => r.data),
  attachTag: (orgId: ID, teamId: ID, payload: { tag_id: string }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/tags`, payload).then(r => r.data),
  membersByRole: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/members/by-role`).then(r => r.data),
  projectsSummary: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/projects-summary`).then(r => r.data),
  createChannel: (orgId: ID, teamId: ID, payload: { name: string; description?: string; type?: string }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/chat-channels`, payload).then(r => r.data),
  deleteChannel: (orgId: ID, teamId: ID, channelId: string) =>
    api.delete(`/organizations/${orgId}/teams/${teamId}/chat-channels/${channelId}`).then(r => r.data),
  reminders: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/reminders`).then(r => r.data),
  createReminder: (orgId: ID, teamId: ID, payload: { title: string; due_at: string; resource_type?: string; resource_id?: string }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/reminders`, payload).then(r => r.data),
  updateReminder: (orgId: ID, teamId: ID, reminderId: string, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/teams/${teamId}/reminders/${reminderId}`, patch).then(r => r.data),
  deleteReminder: (orgId: ID, teamId: ID, reminderId: string) =>
    api.delete(`/organizations/${orgId}/teams/${teamId}/reminders/${reminderId}`).then(r => r.data),
  importCsvMembers: (orgId: ID, teamId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/teams/${teamId}/members/import-csv`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  importGwMembers: (orgId: ID, teamId: ID, payload: { google_workspace_token?: string; emails?: string[] }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/members/import-google-workspace`, payload).then(r => r.data),
  uploadLogo: (orgId: ID, teamId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/teams/${teamId}/logo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  uploadCover: (orgId: ID, teamId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/teams/${teamId}/cover`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  connectIntegration: (orgId: ID, teamId: ID, provider: string, payload?: any) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/integrations/${provider}/connect`, payload || {}).then(r => r.data),
  disconnectIntegration: (orgId: ID, teamId: ID, provider: string) =>
    api.delete(`/organizations/${orgId}/teams/${teamId}/integrations/${provider}`).then(r => r.data),
  tasks: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/tasks`).then(r => r.data),
  documents: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/documents`).then(r => r.data),
  chatChannels: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/chat-channels`).then(r => r.data),
  announcements: (orgId: ID, teamId: ID) =>
    api.get(`/organizations/${orgId}/teams/${teamId}/announcements`).then(r => r.data),
  createAnnouncement: (orgId: ID, teamId: ID, payload: { title: string; body: string; pinned?: boolean }) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/announcements`, payload).then(r => r.data),
  deleteAnnouncement: (orgId: ID, teamId: ID, announcementId: string) =>
    api.delete(`/organizations/${orgId}/teams/${teamId}/announcements/${announcementId}`).then(r => r.data),
  resendInvite: (orgId: ID, teamId: ID, inviteId: string) =>
    api.post(`/organizations/${orgId}/teams/${teamId}/invites/${inviteId}/resend`).then(r => r.data),
  revokeInvite: (orgId: ID, teamId: ID, inviteId: string) =>
    api.delete(`/organizations/${orgId}/teams/${teamId}/invites/${inviteId}`).then(r => r.data),
});

// ── projectV2Api extension — projects-v2 + projects-v2-extended ─────

Object.assign(projectV2Api, {
  transferToTeam: (orgId: ID, projectId: ID, teamId: string) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/transfer-to-team`, { team_id: teamId }).then(r => r.data),
  duplicate: (orgId: ID, projectId: ID) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/duplicate`).then(r => r.data),
  enableStrictMode: (orgId: ID, projectId: ID) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/strict-mode/enable`).then(r => r.data),
  disableStrictMode: (orgId: ID, projectId: ID) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/strict-mode/disable`).then(r => r.data),
  strictModeAudit: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/strict-mode/audit`).then(r => r.data),
  branding: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/branding`).then(r => r.data),
  updateBranding: (orgId: ID, projectId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/projects/${projectId}/branding`, patch).then(r => r.data),
  uploadCover: (orgId: ID, projectId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/projects/${projectId}/cover`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  // Task views
  taskBoard: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/board`).then(r => r.data),
  taskList: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/list`).then(r => r.data),
  taskCalendar: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/calendar`).then(r => r.data),
  taskGantt: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/gantt`).then(r => r.data),
  taskTimeline: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/timeline`).then(r => r.data),
  taskUpcoming: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/upcoming`).then(r => r.data),
  taskProposalsPending: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/tasks/proposals/pending`).then(r => r.data),
  bulkCreateTasks: (orgId: ID, projectId: ID, payload: { tasks: any[] }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/bulk-create`, payload).then(r => r.data),
  importCsvTasks: (orgId: ID, projectId: ID, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/organizations/${orgId}/projects/${projectId}/tasks/import-csv`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  exportCsvTasks: (orgId: ID, projectId: ID) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/export-csv`, {}, { responseType: "blob" }).then(r => r.data),
  importAsana: (orgId: ID, projectId: ID, payload: { workspace_id?: string; token?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/import/asana`, payload).then(r => r.data),
  importJira: (orgId: ID, projectId: ID, payload: { domain?: string; token?: string; project_key?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/import/jira`, payload).then(r => r.data),
  importLinear: (orgId: ID, projectId: ID, payload: { token?: string; team_id?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/import/linear`, payload).then(r => r.data),
  importNotion: (orgId: ID, projectId: ID, payload: { token?: string; database_id?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/import/notion`, payload).then(r => r.data),
  importTrello: (orgId: ID, projectId: ID, payload: { board_id?: string; token?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/tasks/import/trello`, payload).then(r => r.data),
  // Saved filters
  savedFilters: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/saved-filters`).then(r => r.data),
  createSavedFilter: (orgId: ID, projectId: ID, payload: { name: string; filters: any }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/saved-filters`, payload).then(r => r.data),
  deleteSavedFilter: (orgId: ID, projectId: ID, filterId: string) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/saved-filters/${filterId}`).then(r => r.data),
  // Templates
  listTemplates: (orgId: ID) =>
    api.get(`/organizations/${orgId}/projects/templates`).then(r => r.data),
  fromTemplate: (orgId: ID, payload: { template_id: string; name: string; team_id?: string }) =>
    api.post(`/organizations/${orgId}/projects/from-template`, payload).then(r => r.data),
  saveAsTemplate: (orgId: ID, projectId: ID, payload: { name: string; description?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/save-as-template`, payload).then(r => r.data),
  // KB
  kbQuery: (orgId: ID, projectId: ID, payload: { question: string; limit?: number }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/kb/query`, payload).then(r => r.data),
  kbIndexStatus: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/kb/index-status`).then(r => r.data),
  kbRebuild: (orgId: ID, projectId: ID) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/kb/rebuild`).then(r => r.data),
  // Share
  sharePublic: (orgId: ID, projectId: ID, payload?: { expires_at?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/share/public`, payload || {}).then(r => r.data),
  unsharePublic: (orgId: ID, projectId: ID) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/share/public`).then(r => r.data),
  createExternalLink: (orgId: ID, projectId: ID, payload: { permissions?: string[]; expires_at?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/share/external-link`, payload).then(r => r.data),
  deleteExternalLink: (orgId: ID, projectId: ID, token: string) =>
    api.delete(`/organizations/${orgId}/projects/${projectId}/share/external-link/${token}`).then(r => r.data),
  // Automations + agents
  automations: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/automations`).then(r => r.data),
  agentSchedules: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/agent-schedules`).then(r => r.data),
  // Analytics (granular)
  analyticsBurnup: (orgId: ID, projectId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/projects/${projectId}/analytics/burnup`, { params: { time_range: timeRange } }).then(r => r.data),
  analyticsBurndown: (orgId: ID, projectId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/projects/${projectId}/analytics/burndown`, { params: { time_range: timeRange } }).then(r => r.data),
  analyticsThroughput: (orgId: ID, projectId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/projects/${projectId}/analytics/throughput`, { params: { time_range: timeRange } }).then(r => r.data),
  analyticsCycleTime: (orgId: ID, projectId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/projects/${projectId}/analytics/cycle-time`, { params: { time_range: timeRange } }).then(r => r.data),
  analyticsCost: (orgId: ID, projectId: ID, timeRange = "30d") =>
    api.get(`/organizations/${orgId}/projects/${projectId}/analytics/cost`, { params: { time_range: timeRange } }).then(r => r.data),
  // Members bulk
  bulkAddMembers: (orgId: ID, projectId: ID, payload: { user_ids: string[]; role?: string }) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/members/bulk-add`, payload).then(r => r.data),
  importMembersFromTeam: (orgId: ID, projectId: ID, teamId: string) =>
    api.post(`/organizations/${orgId}/projects/${projectId}/members/import-from-team/${teamId}`).then(r => r.data),
  // Invites
  invites: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/invites`).then(r => r.data),
  // Webhook events
  webhookEvents: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/webhook-events`).then(r => r.data),
  // Health
  health: (orgId: ID, projectId: ID) =>
    api.get(`/organizations/${orgId}/projects/${projectId}/health`).then(r => r.data),
  // Settings (general)
  patchSettings: (orgId: ID, projectId: ID, patch: Record<string, any>) =>
    api.patch(`/organizations/${orgId}/projects/${projectId}/settings`, patch).then(r => r.data),
});

// ── agentsV2Api extension — agents-v2 + agents-v2-extras ─────────────

Object.assign(agentsV2Api, {
  // Run actions
  runCost: (runId: string) => api.get(`/agents-v2/runs/${runId}/cost`).then(r => r.data),
  runTimeline: (runId: string) => api.get(`/agents-v2/runs/${runId}/timeline`).then(r => r.data),
  runTokens: (runId: string) => api.get(`/agents-v2/runs/${runId}/tokens`).then(r => r.data),
  runRetry: (runId: string) => api.post(`/agents-v2/runs/${runId}/retry`).then(r => r.data),
  runFeedback: (runId: string, payload: { rating: number; notes?: string }) =>
    api.post(`/agents-v2/runs/${runId}/feedback`, payload).then(r => r.data),
  runLineage: (runId: string) => api.get(`/agents-v2/runs/${runId}/lineage`).then(r => r.data),
  cancelRun: (runId: string) => api.post(`/agents-v2/runs/${runId}/cancel`).then(r => r.data),
  // Rebuild metrics
  rebuildMetrics: () => api.post(`/agents-v2/metrics/rebuild`).then(r => r.data),
  quota: () => api.get(`/agents-v2/quota`).then(r => r.data),
  platformGet: (agentKey: string) => api.get(`/agents-v2/platform/${agentKey}`).then(r => r.data),
  // Project agents shortcuts
  projectAgents: (projectId: string) => api.get(`/agents-v2/projects/${projectId}/agents`).then(r => r.data),
  projectRuns: (projectId: string) => api.get(`/agents-v2/projects/${projectId}/runs`).then(r => r.data),
  setFallbackChain: (projectId: string, agentRef: string, payload: { fallbacks: string[] }) =>
    api.patch(`/agents-v2/projects/${projectId}/agents/${agentRef}/fallback-chain`, payload).then(r => r.data),
  // Schedules
  schedules: () => api.get(`/agents-v2/schedules`).then(r => r.data),
  createSchedule: (payload: { agent_ref: string; cron: string; project_id?: string; team_id?: string; payload?: any }) =>
    api.post(`/agents-v2/schedules`, payload).then(r => r.data),
  pauseSchedule: (scheduleId: string) => api.post(`/agents-v2/schedules/${scheduleId}/pause`).then(r => r.data),
  resumeSchedule: (scheduleId: string) => api.post(`/agents-v2/schedules/${scheduleId}/resume`).then(r => r.data),
  deleteSchedule: (scheduleId: string) => api.delete(`/agents-v2/schedules/${scheduleId}`).then(r => r.data),
  // Handoffs
  handoffToUser: (payload: { run_id: string; user_id: string; reason?: string }) =>
    api.post(`/agents-v2/handoffs/to-user`, payload).then(r => r.data),
  handoffToAgent: (payload: { run_id: string; agent_ref: string; reason?: string }) =>
    api.post(`/agents-v2/handoffs/to-agent`, payload).then(r => r.data),
  agentHandoffs: (agentKey: string) => api.get(`/agents-v2/${agentKey}/handoffs`).then(r => r.data),
  // Custom agents CRUD
  customList: () => api.get(`/agents-v2/custom`).then(r => r.data),
  customCreate: (payload: { name: string; system_prompt: string; model?: string; description?: string }) =>
    api.post(`/agents-v2/custom`, payload).then(r => r.data),
  customGet: (id: string) => api.get(`/agents-v2/custom/${id}`).then(r => r.data),
  customUpdate: (id: string, patch: Record<string, any>) =>
    api.patch(`/agents-v2/custom/${id}`, patch).then(r => r.data),
  customDelete: (id: string) => api.delete(`/agents-v2/custom/${id}`).then(r => r.data),
  customPublish: (id: string) => api.post(`/agents-v2/custom/${id}/publish`).then(r => r.data),
  customUnpublish: (id: string) => api.post(`/agents-v2/custom/${id}/unpublish`).then(r => r.data),
  customFork: (id: string, payload?: { name?: string }) =>
    api.post(`/agents-v2/custom/${id}/fork`, payload || {}).then(r => r.data),
  customShareToTeam: (id: string, teamId: string) =>
    api.post(`/agents-v2/custom/${id}/share-to-team/${teamId}`).then(r => r.data),
  customShareToOrg: (id: string) => api.post(`/agents-v2/custom/${id}/share-to-org`).then(r => r.data),
  // Batches
  createBatch: (payload: { agent_ref: string; inputs: any[]; project_id?: string }) =>
    api.post(`/agents-v2/batches`, payload).then(r => r.data),
  listBatches: () => api.get(`/agents-v2/batches`).then(r => r.data),
  getBatch: (id: string) => api.get(`/agents-v2/batches/${id}`).then(r => r.data),
  getBatchResults: (id: string) => api.get(`/agents-v2/batches/${id}/results`).then(r => r.data),
  cancelBatch: (id: string) => api.post(`/agents-v2/batches/${id}/cancel`).then(r => r.data),
  // Presets
  presets: () => api.get(`/agents-v2/presets`).then(r => r.data),
  createPreset: (payload: { name: string; agent_ref: string; config: any }) =>
    api.post(`/agents-v2/presets`, payload).then(r => r.data),
  updatePreset: (id: string, patch: Record<string, any>) =>
    api.patch(`/agents-v2/presets/${id}`, patch).then(r => r.data),
  deletePreset: (id: string) => api.delete(`/agents-v2/presets/${id}`).then(r => r.data),
  // Feedback
  submitFeedback: (payload: { agent_ref: string; rating: number; notes?: string; run_id?: string }) =>
    api.post(`/agents-v2/feedback`, payload).then(r => r.data),
  listFeedback: (opts: { agent_ref?: string } = {}) =>
    api.get(`/agents-v2/feedback`, { params: opts }).then(r => r.data),
  feedbackSummary: (agentRef?: string) =>
    api.get(`/agents-v2/feedback/summary`, { params: { agent_ref: agentRef } }).then(r => r.data),
  // KB
  orgKb: () => api.get(`/agents-v2/kb/org`).then(r => r.data),
  orgKbUpload: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/agents-v2/kb/org/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  teamKb: (teamId: string) => api.get(`/agents-v2/kb/team/${teamId}`).then(r => r.data),
  teamKbUpload: (teamId: string, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/agents-v2/kb/team/${teamId}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  // Agent-scoped
  agentPermissions: (agentRef: string) =>
    api.get(`/agents-v2/${agentRef}/permissions`).then(r => r.data),
  agentKnowledge: (agentRef: string) =>
    api.get(`/agents-v2/${agentRef}/knowledge`).then(r => r.data),
  uploadAgentKnowledge: (agentRef: string, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/agents-v2/${agentRef}/knowledge/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  deleteAgentKnowledge: (agentRef: string, docId: string) =>
    api.delete(`/agents-v2/${agentRef}/knowledge/${docId}`).then(r => r.data),
  agentSchedules: (agentRef: string) =>
    api.get(`/agents-v2/${agentRef}/schedules`).then(r => r.data),
  // Catalogues
  autonomyCatalog: () => api.get(`/agents-v2/catalog/autonomy-levels`).then(r => r.data),
  modelsCatalog: () => api.get(`/agents-v2/catalog/models`).then(r => r.data),
  schedulesCatalog: () => api.get(`/agents-v2/catalog/schedules`).then(r => r.data),
});

// ── analyticsV2Api extension — analytics-v2 + analytics-v2-extras ────

Object.assign(analyticsV2Api, {
  // Org granular
  orgTasks: (orgId: ID, timeRange = "30d") =>
    api.get(`/analytics-v2/org/${orgId}/tasks`, { params: { time_range: timeRange } }).then(r => r.data),
  orgAgents: (orgId: ID, timeRange = "30d") =>
    api.get(`/analytics-v2/org/${orgId}/agents`, { params: { time_range: timeRange } }).then(r => r.data),
  orgMembers: (orgId: ID) =>
    api.get(`/analytics-v2/org/${orgId}/members`).then(r => r.data),
  orgDocuments: (orgId: ID) =>
    api.get(`/analytics-v2/org/${orgId}/documents`).then(r => r.data),
  orgBilling: (orgId: ID) =>
    api.get(`/analytics-v2/org/${orgId}/billing`).then(r => r.data),
  orgUsage: (orgId: ID, timeRange = "30d") =>
    api.get(`/analytics-v2/org/${orgId}/usage`, { params: { time_range: timeRange } }).then(r => r.data),
  orgForecast: (orgId: ID) =>
    api.get(`/analytics-v2/org/${orgId}/forecast`).then(r => r.data),
  orgRetention: (orgId: ID, timeRange = "90d") =>
    api.get(`/analytics-v2/org/${orgId}/retention`, { params: { time_range: timeRange } }).then(r => r.data),
  orgFunnel: (orgId: ID) =>
    api.get(`/analytics-v2/org/${orgId}/funnel`).then(r => r.data),
  orgCohorts: (orgId: ID) =>
    api.get(`/analytics-v2/org/${orgId}/cohorts`).then(r => r.data),
  orgTimeline: (orgId: ID, timeRange = "30d") =>
    api.get(`/analytics-v2/org/${orgId}/timeline`, { params: { time_range: timeRange } }).then(r => r.data),
  orgExport: (orgId: ID, payload: { kind: string; format?: string; filters?: any }) =>
    api.post(`/analytics-v2/org/${orgId}/export`, payload).then(r => r.data),
  // Team granular
  teamTasks: (teamId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/team/${teamId}/tasks`, { params: { time_range: timeRange } }).then(r => r.data),
  teamAgents: (teamId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/team/${teamId}/agents`, { params: { time_range: timeRange } }).then(r => r.data),
  teamThroughput: (teamId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/team/${teamId}/throughput`, { params: { time_range: timeRange } }).then(r => r.data),
  teamExport: (teamId: string, payload: { kind: string; format?: string }) =>
    api.post(`/analytics-v2/team/${teamId}/export`, payload).then(r => r.data),
  // Project granular
  projectCost: (projectId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/project/${projectId}/cost`, { params: { time_range: timeRange } }).then(r => r.data),
  projectAgentsAnalytics: (projectId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/project/${projectId}/agents`, { params: { time_range: timeRange } }).then(r => r.data),
  projectCycle: (projectId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/project/${projectId}/cycle-time`, { params: { time_range: timeRange } }).then(r => r.data),
  projectExport: (projectId: string, payload: { kind: string; format?: string }) =>
    api.post(`/analytics-v2/project/${projectId}/export`, payload).then(r => r.data),
  // Cost matrix
  costByAgent: (timeRange = "30d") =>
    api.get(`/analytics-v2/cost/agents`, { params: { time_range: timeRange } }).then(r => r.data),
  costByModel: (timeRange = "30d") =>
    api.get(`/analytics-v2/cost/models`, { params: { time_range: timeRange } }).then(r => r.data),
  costPerSeat: (timeRange = "30d") =>
    api.get(`/analytics-v2/cost/per-seat`, { params: { time_range: timeRange } }).then(r => r.data),
  costForecast: () => api.get(`/analytics-v2/cost/forecast`).then(r => r.data),
  // User
  userSummary: (userId: string) =>
    api.get(`/analytics-v2/user/${userId}/summary`).then(r => r.data),
  userAgents: (userId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/user/${userId}/agents`, { params: { time_range: timeRange } }).then(r => r.data),
  userTasks: (userId: string, timeRange = "30d") =>
    api.get(`/analytics-v2/user/${userId}/tasks`, { params: { time_range: timeRange } }).then(r => r.data),
  // Agent
  agentGlobal: (agentKey: string, timeRange = "30d") =>
    api.get(`/analytics-v2/agent/${agentKey}/global`, { params: { time_range: timeRange } }).then(r => r.data),
  agentByOrg: (agentKey: string) =>
    api.get(`/analytics-v2/agent/${agentKey}/by-org`).then(r => r.data),
  // Me
  me: () => api.get(`/analytics-v2/me`).then(r => r.data),
  // Audit
  getAuditExport: (orgId: ID, jobId: string) =>
    api.get(`/analytics-v2/org/${orgId}/audit/exports/${jobId}`).then(r => r.data),
});

// ── enterpriseApi extension ───────────────────────────────────────────

Object.assign(enterpriseApi, {
  webhookDeliveries: (orgId: ID, webhookId: string) =>
    api.get(`/enterprise/${orgId}/webhooks/${webhookId}/deliveries`).then(r => r.data),
  rotateWebhookSecret: (orgId: ID, webhookId: string) =>
    api.post(`/enterprise/${orgId}/webhooks/${webhookId}/rotate-secret`).then(r => r.data),
  scimScopes: () => api.get(`/enterprise/api-tokens/scopes`).then(r => r.data),
  residency: (orgId: ID) => api.get(`/enterprise/${orgId}/residency`).then(r => r.data),
  setResidency: (orgId: ID, payload: { region: string }) =>
    api.patch(`/enterprise/${orgId}/residency`, payload).then(r => r.data),
  ssoMetadata: () => api.get(`/enterprise/sso/metadata.xml`, { responseType: "text" }).then(r => r.data),
  jitGrant: (orgId: ID, payload: { user_id: string; role: string; expires_at?: string; reason?: string }) =>
    api.post(`/enterprise/${orgId}/jit/grant`, payload).then(r => r.data),
  jitGrants: (orgId: ID) => api.get(`/enterprise/${orgId}/jit/grants`).then(r => r.data),
});

// ── orgBillingApi extension ───────────────────────────────────────────

Object.assign(orgBillingApi, {
  changePlan: (orgId: ID, payload: { plan: string; cadence?: string }) =>
    api.post(`/org-billing/${orgId}/plan/change`, payload).then(r => r.data),
  changeCadence: (orgId: ID, payload: { cadence: string }) =>
    api.post(`/org-billing/${orgId}/cadence`, payload).then(r => r.data),
  cancel: (orgId: ID) => api.post(`/org-billing/${orgId}/cancel`).then(r => r.data),
  cancelNow: (orgId: ID) => api.post(`/org-billing/${orgId}/cancel-now`).then(r => r.data),
  uncancel: (orgId: ID) => api.post(`/org-billing/${orgId}/uncancel`).then(r => r.data),
  trialStatus: (orgId: ID) => api.get(`/org-billing/${orgId}/trial/status`).then(r => r.data),
  extendTrial: (orgId: ID, payload: { days: number }) =>
    api.post(`/org-billing/${orgId}/trial/extend`, payload).then(r => r.data),
  seatForecast: (orgId: ID) => api.get(`/org-billing/${orgId}/seats/forecast`).then(r => r.data),
  updateDetails: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/org-billing/${orgId}/details`, patch).then(r => r.data),
  talkToSales: (orgId: ID, payload: { contact_email?: string; message?: string; seats?: number }) =>
    api.post(`/org-billing/${orgId}/talk-to-sales`, payload).then(r => r.data),
  applyPromoCode: (orgId: ID, payload: { code: string }) =>
    api.post(`/org-billing/${orgId}/promo-code`, payload).then(r => r.data),
  // Credits
  credits: (orgId: ID) => api.get(`/org-billing/${orgId}/credits`).then(r => r.data),
  topupCredits: (orgId: ID, payload: { amount: number }) =>
    api.post(`/org-billing/${orgId}/credits/topup`, payload).then(r => r.data),
  creditsLedger: (orgId: ID, limit = 50) =>
    api.get(`/org-billing/${orgId}/credits/ledger`, { params: { limit } }).then(r => r.data),
  refundCredits: (orgId: ID, payload: { amount: number; reason?: string }) =>
    api.post(`/org-billing/${orgId}/credits/refund`, payload).then(r => r.data),
  // Promo
  promos: (orgId: ID) => api.get(`/org-billing/${orgId}/promo`).then(r => r.data),
  applyPromo: (orgId: ID, payload: { code: string }) =>
    api.post(`/org-billing/${orgId}/promo/apply`, payload).then(r => r.data),
  removePromo: (orgId: ID, code: string) =>
    api.delete(`/org-billing/${orgId}/promo/${code}`).then(r => r.data),
  // Contracts
  requestContract: (orgId: ID, payload: { seats?: number; duration_months?: number; notes?: string }) =>
    api.post(`/org-billing/${orgId}/contracts/request`, payload).then(r => r.data),
  contracts: (orgId: ID) => api.get(`/org-billing/${orgId}/contracts`).then(r => r.data),
  getContract: (orgId: ID, contractId: string) =>
    api.get(`/org-billing/${orgId}/contracts/${contractId}`).then(r => r.data),
  contractStatus: (orgId: ID, contractId: string) =>
    api.get(`/org-billing/${orgId}/contracts/${contractId}/status`).then(r => r.data),
  signContract: (orgId: ID, contractId: string, payload: { signed_by: string; signature?: string }) =>
    api.post(`/org-billing/${orgId}/contracts/${contractId}/sign`, payload).then(r => r.data),
  // Quotes
  createQuote: (orgId: ID, payload: { plan: string; seats: number; cadence?: string }) =>
    api.post(`/org-billing/${orgId}/quote`, payload).then(r => r.data),
  getQuote: (orgId: ID, quoteId: string) =>
    api.get(`/org-billing/${orgId}/quote/${quoteId}`).then(r => r.data),
  acceptQuote: (orgId: ID, quoteId: string) =>
    api.post(`/org-billing/${orgId}/quote/${quoteId}/accept`).then(r => r.data),
  // BYOK
  registerByokKey: (orgId: ID, payload: { provider: string; key_name: string; key_material: string }) =>
    api.post(`/org-billing/${orgId}/byok`, payload).then(r => r.data),
  listByokKeys: (orgId: ID) => api.get(`/org-billing/${orgId}/byok`).then(r => r.data),
  revokeByokKey: (orgId: ID, keyId: string) =>
    api.delete(`/org-billing/${orgId}/byok/${keyId}`).then(r => r.data),
  // Payment methods
  paymentMethods: (orgId: ID) =>
    api.get(`/org-billing/${orgId}/payment-methods`).then(r => r.data),
  setDefaultPaymentMethod: (orgId: ID, payload: { payment_method_id: string }) =>
    api.post(`/org-billing/${orgId}/payment-methods/default`, payload).then(r => r.data),
  upcomingInvoice: (orgId: ID) =>
    api.get(`/org-billing/${orgId}/upcoming-invoice`).then(r => r.data),
  // Alerts
  alerts: (orgId: ID) => api.get(`/org-billing/${orgId}/alerts`).then(r => r.data),
  dismissAlert: (orgId: ID, alertId: string) =>
    api.post(`/org-billing/${orgId}/alerts/dismiss/${alertId}`).then(r => r.data),
  // Misc setters
  setBillingEmail: (orgId: ID, payload: { email: string }) =>
    api.post(`/org-billing/${orgId}/billing-email`, payload).then(r => r.data),
  setTaxId: (orgId: ID, payload: { tax_id: string; country?: string }) =>
    api.post(`/org-billing/${orgId}/tax-id`, payload).then(r => r.data),
  setPoNumber: (orgId: ID, payload: { po_number: string }) =>
    api.post(`/org-billing/${orgId}/po-number`, payload).then(r => r.data),
  // Forecast
  forecastUsage: (orgId: ID) =>
    api.get(`/org-billing/${orgId}/forecast/usage`).then(r => r.data),
  forecastCost: (orgId: ID) =>
    api.get(`/org-billing/${orgId}/forecast/cost`).then(r => r.data),
});

// ── automationsApi extension ──────────────────────────────────────────

Object.assign(automationsApi, {
  testRun: (automationId: string, payload?: any) =>
    api.post(`/automations/${automationId}/test-run`, payload || {}).then(r => r.data),
  eventCatalogue: () => api.get(`/automations/event-catalogue`).then(r => r.data),
  runs: (limit = 50) =>
    api.get(`/automations/runs`, { params: { limit } }).then(r => r.data),
});

// ── remindersApi extension ────────────────────────────────────────────

Object.assign(remindersApi, {
  bulkSnooze: (payload: { reminder_ids: string[]; snooze_until: string }) =>
    api.post(`/reminders/bulk-snooze`, payload).then(r => r.data),
  bulkCreate: (payload: { reminders: Array<Partial<ReminderRow>> }) =>
    api.post(`/reminders/bulk-create`, payload).then(r => r.data),
  sendNow: (reminderId: string) =>
    api.post(`/reminders/${reminderId}/send-now`).then(r => r.data),
});

// ── commentsV2Api — comments-v2 router (reviews, shares, watches) ────

export const commentsV2Api = {
  requestReview: (payload: { resource_type: string; resource_id: string; reviewer_id: string; note?: string }) =>
    api.post(`/comments-v2/reviews/request`, payload).then(r => r.data),
  approveReview: (reviewId: string, payload?: { notes?: string }) =>
    api.post(`/comments-v2/reviews/${reviewId}/approve`, payload || {}).then(r => r.data),
  rejectReview: (reviewId: string, payload: { notes?: string }) =>
    api.post(`/comments-v2/reviews/${reviewId}/reject`, payload).then(r => r.data),
  pendingReviews: () => api.get(`/comments-v2/reviews/pending`).then(r => r.data),
  getReview: (reviewId: string) =>
    api.get(`/comments-v2/reviews/${reviewId}`).then(r => r.data),
  share: (payload: { resource_type: string; resource_id: string; share_with: string[]; permissions?: string[] }) =>
    api.post(`/comments-v2/shares`, payload).then(r => r.data),
  shares: () => api.get(`/comments-v2/shares`).then(r => r.data),
  deleteShare: (shareId: string) =>
    api.delete(`/comments-v2/shares/${shareId}`).then(r => r.data),
  counts: (params: { resource_type?: string; resource_id?: string } = {}) =>
    api.get(`/comments-v2/counts`, { params }).then(r => r.data),
  recent: (limit = 25) =>
    api.get(`/comments-v2/recent`, { params: { limit } }).then(r => r.data),
  unreadMentions: () => api.get(`/comments-v2/unread/mentions`).then(r => r.data),
  bulkResolve: (payload: { comment_ids: string[] }) =>
    api.post(`/comments-v2/bulk-resolve`, payload).then(r => r.data),
  bulkDelete: (payload: { comment_ids: string[] }) =>
    api.delete(`/comments-v2/bulk`, { data: payload }).then(r => r.data),
  watch: (payload: { resource_type: string; resource_id: string }) =>
    api.post(`/comments-v2/watch`, payload).then(r => r.data),
  unwatch: (payload: { resource_type: string; resource_id: string }) =>
    api.delete(`/comments-v2/watch`, { data: payload }).then(r => r.data),
};
