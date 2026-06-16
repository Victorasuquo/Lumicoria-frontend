/**
 * notificationsV2Api — `/api/v1/notifications-v2/*`.  The v2 surface
 * adds rules engine + topics + devices + broadcast on top of the
 * baseline notificationApi (which stays for unread count + simple
 * read/dismiss flows).
 */

import api from "./api";

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  category?: string;
  channel: "email" | "push" | "in_app" | "webhook";
  condition?: any;
  created_at?: string;
}

export interface DeviceRow {
  id: string;
  platform: "ios" | "android" | "web";
  token: string;
  enabled: boolean;
  last_seen_at?: string;
}

export const notificationsV2Api = {
  // Rules
  listRules: () => api.get<NotificationRule[]>(`/notifications-v2/rules`).then(r => r.data),
  createRule: (payload: Partial<NotificationRule> & { name: string; channel: NotificationRule["channel"] }) =>
    api.post<NotificationRule>(`/notifications-v2/rules`, payload).then(r => r.data),
  updateRule: (ruleId: string, patch: Partial<NotificationRule>) =>
    api.patch<NotificationRule>(`/notifications-v2/rules/${ruleId}`, patch).then(r => r.data),
  deleteRule: (ruleId: string) =>
    api.delete(`/notifications-v2/rules/${ruleId}`).then(r => r.data),
  enableRule: (ruleId: string) =>
    api.post(`/notifications-v2/rules/${ruleId}/enable`).then(r => r.data),
  disableRule: (ruleId: string) =>
    api.post(`/notifications-v2/rules/${ruleId}/disable`).then(r => r.data),

  // Per-notification actions
  snooze: (notificationId: string, payload: { until: string }) =>
    api.post(`/notifications-v2/${notificationId}/snooze`, payload).then(r => r.data),
  unsubscribe: (token: string) =>
    api.post(`/notifications-v2/unsubscribe/${token}`).then(r => r.data),

  // Digest preview
  digestPreview: () => api.get(`/notifications-v2/digest/preview`).then(r => r.data),

  // Devices
  listDevices: () => api.get<DeviceRow[]>(`/notifications-v2/devices`).then(r => r.data),
  registerDevice: (payload: { platform: DeviceRow["platform"]; token: string; user_agent?: string }) =>
    api.post<DeviceRow>(`/notifications-v2/devices`, payload).then(r => r.data),
  deleteDevice: (deviceId: string) =>
    api.delete(`/notifications-v2/devices/${deviceId}`).then(r => r.data),
  testPush: (deviceId: string) =>
    api.post(`/notifications-v2/devices/${deviceId}/test-push`).then(r => r.data),

  // Topics
  listTopics: () => api.get<{ topics: string[] }>(`/notifications-v2/topics`).then(r => r.data),
  subscribeTopic: (topic: string) =>
    api.post(`/notifications-v2/topics/${topic}/subscribe`).then(r => r.data),
  unsubscribeTopic: (topic: string) =>
    api.delete(`/notifications-v2/topics/${topic}`).then(r => r.data),

  // Broadcast (admin)
  broadcast: (orgId: string, payload: { title: string; body: string; category?: string; channels?: string[] }) =>
    api.post(`/notifications-v2/broadcast/org/${orgId}`, payload).then(r => r.data),

  // Subscriptions (per-resource follow)
  listSubscriptions: () => api.get(`/notifications-v2/subscriptions`).then(r => r.data),
  createSubscription: (payload: { resource_type: string; resource_id: string }) =>
    api.post(`/notifications-v2/subscriptions`, payload).then(r => r.data),
  deleteSubscription: (subId: string) =>
    api.delete(`/notifications-v2/subscriptions/${subId}`).then(r => r.data),

  eventCatalogue: () => api.get(`/notifications-v2/event-catalogue`).then(r => r.data),

  unreadByCategory: () => api.get(`/notifications-v2/unread/by-category`).then(r => r.data),
  markAllRead: () => api.post(`/notifications-v2/mark-all-read`).then(r => r.data),
  bulkDelete: (payload: { notification_ids: string[] }) =>
    api.post(`/notifications-v2/bulk-delete`, payload).then(r => r.data),
};

export default notificationsV2Api;
