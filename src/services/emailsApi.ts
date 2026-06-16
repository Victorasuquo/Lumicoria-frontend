/**
 * emailsApi — `/api/v1/emails/*`.  Powers Admin → Emails (templates +
 * sent log + branding + sending domains + deliverability + tracking).
 */

import api from "./api";

export type ID = string;

export interface EmailTemplate {
  key: string;
  category: string;
  subject: string;
  preview_text?: string;
  body_html?: string;
  body_text?: string;
  variables?: string[];
  updated_at?: string;
}

export interface SentEmailRow {
  id: string;
  to: string;
  subject: string;
  template_key?: string;
  status: "queued" | "sent" | "delivered" | "bounced" | "opened" | "clicked";
  sent_at: string;
  organization_id?: string;
  metadata?: any;
}

export const emailsApi = {
  // Templates
  templates: () => api.get<EmailTemplate[]>(`/emails/templates`).then(r => r.data),
  getTemplate: (key: string) =>
    api.get<EmailTemplate>(`/emails/templates/${key}`).then(r => r.data),
  previewWithSampleData: (key: string, payload?: { sample_data?: any }) =>
    api.post<{ html: string; text?: string; subject: string }>(
      `/emails/templates/${key}/preview-data`, payload || {},
    ).then(r => r.data),

  // Sent log
  sent: (params: { limit?: number; status?: string } = {}) =>
    api.get<SentEmailRow[]>(`/emails/sent`, { params }).then(r => r.data),
  getSent: (id: string) =>
    api.get<SentEmailRow>(`/emails/sent/${id}`).then(r => r.data),
  resend: (id: string) =>
    api.post(`/emails/resend/${id}`).then(r => r.data),

  // Branding
  getBranding: (orgId: ID) =>
    api.get(`/emails/branding/${orgId}`).then(r => r.data),
  updateBranding: (orgId: ID, patch: Record<string, any>) =>
    api.patch(`/emails/branding/${orgId}`, patch).then(r => r.data),

  // Test send
  testSend: (payload: { template_key: string; to: string; sample_data?: any }) =>
    api.post(`/emails/test-send`, payload).then(r => r.data),

  // Deliverability
  deliverability: (orgId: ID) =>
    api.get(`/emails/deliverability/${orgId}`).then(r => r.data),

  // Custom templates
  customTemplates: (orgId: ID) =>
    api.get<EmailTemplate[]>(`/emails/templates/custom/${orgId}`).then(r => r.data),
  createCustomTemplate: (orgId: ID, payload: Partial<EmailTemplate> & { key: string; subject: string }) =>
    api.post<EmailTemplate>(`/emails/templates/custom/${orgId}`, payload).then(r => r.data),
  deleteCustomTemplate: (orgId: ID, key: string) =>
    api.delete(`/emails/templates/custom/${orgId}/${key}`).then(r => r.data),

  // Sending domains
  sendingDomains: (orgId: ID) =>
    api.get(`/emails/sending-domains/${orgId}`).then(r => r.data),
  addSendingDomain: (orgId: ID, payload: { domain: string }) =>
    api.post(`/emails/sending-domains/${orgId}`, payload).then(r => r.data),
  verifySendingDomain: (orgId: ID, domain: string) =>
    api.post(`/emails/sending-domains/${orgId}/${domain}/verify`).then(r => r.data),
  deleteSendingDomain: (orgId: ID, domain: string) =>
    api.delete(`/emails/sending-domains/${orgId}/${domain}`).then(r => r.data),

  // Tracking opt-out
  getTrackingOptOut: (orgId: ID) =>
    api.get(`/emails/tracking-opt-out/${orgId}`).then(r => r.data),
  setTrackingOptOut: (orgId: ID, payload: { opted_out: boolean }) =>
    api.post(`/emails/tracking-opt-out/${orgId}`, payload).then(r => r.data),
};

export default emailsApi;
