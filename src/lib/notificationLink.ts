/**
 * Map a notification → app route.
 *
 * Backend Notifications carry a `metadata` blob that contains zero-to-many
 * of the following keys depending on the trigger:
 *   - action_url           // explicit override
 *   - task_id / project_id / team_id / org_id / document_id /
 *     meeting_id / agent_key / automation_id / webhook_id / invoice_id
 *
 * Prefer an explicit `action_url`, then fall back to inferring from
 * notification_type + scope ids.  Returns `/notifications?id=<id>` as a
 * conservative last resort so the click never dead-ends.
 */

import type { Notification } from "@/services/api";

type Meta = Record<string, any>;

const stringOrNull = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
};

export function notificationLink(n: Notification): string {
  const meta: Meta = (n?.metadata as Meta) || {};
  const explicit = stringOrNull(meta.action_url) || stringOrNull(meta.url) || stringOrNull(meta.deep_link);
  if (explicit) {
    // Treat backend-relative paths as router routes; absolute http(s) URLs
    // get opened as external links by the caller.
    return explicit;
  }

  const t = String(n?.notification_type || "").toLowerCase();

  // Direct resource ids first — these are the most specific.
  const taskId = stringOrNull(meta.task_id) || stringOrNull(meta.related_resource_id && meta.related_resource_type === "task" ? meta.related_resource_id : null);
  const projectId = stringOrNull(meta.project_id);
  const teamId = stringOrNull(meta.team_id);
  const documentId = stringOrNull(meta.document_id);
  const meetingId = stringOrNull(meta.meeting_id);
  const agentKey = stringOrNull(meta.agent_key) || stringOrNull(meta.agent_slug);
  const automationId = stringOrNull(meta.automation_id);
  const webhookId = stringOrNull(meta.webhook_id);
  const invoiceId = stringOrNull(meta.invoice_id);
  const inviteToken = stringOrNull(meta.invite_token);

  if (taskId) return `/tasks?focus=${encodeURIComponent(taskId)}`;
  if (projectId) return `/workspace/projects/${projectId}`;
  if (teamId) return `/workspace/teams/${teamId}`;
  if (meetingId) return `/agents/meeting?focus=${encodeURIComponent(meetingId)}`;
  if (documentId) return `/documents?focus=${encodeURIComponent(documentId)}`;
  if (agentKey) return `/agents/${agentKey}`;
  if (automationId) return `/workspace/automations?focus=${encodeURIComponent(automationId)}`;
  if (webhookId) return `/workspace/admin/webhooks`;
  if (invoiceId) return `/billing`;
  if (inviteToken) return `/invitations/${inviteToken}`;

  // Type-only fallbacks
  if (t === "task") return "/tasks";
  if (t === "document") return "/documents";
  if (t === "wellbeing") return "/wellbeing";
  if (t === "billing") return "/billing";
  if (t === "auth") return "/profile";
  if (t === "email") return "/agents/email";

  // Last resort
  return `/notifications?id=${encodeURIComponent(n.id)}`;
}

export function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
