/**
 * Lumicoria Huddle — live meeting API client.
 *
 * Mounts on top of the shared `api` axios instance from services/api.ts.
 */

import api from "@/services/api";

export type HuddleStatus = "scheduled" | "live" | "ended" | "cancelled";
export type HuddleMeetingType = "instant" | "scheduled" | "recurring";
export type HuddleRole = "host" | "cohost" | "participant" | "guest" | "agent";

export interface Huddle {
  id: string;
  room_name: string;
  share_token: string;
  title: string;
  meeting_type: HuddleMeetingType;
  status: HuddleStatus;
  host_user_id: string;
  organization_id: string;
  team_id: string | null;
  project_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_sec: number | null;
  participant_count_peak: number;
  agent_keys: string[];
  custom_agent_ids: string[];
  recording_enabled: boolean;
  recording_url: string | null;
  recording_retention_days: number;
  recording_expires_at: string | null;
  lobby_enabled: boolean;
  require_sso: boolean;
  e2ee_enabled: boolean;
  data_residency: string;
  transcript_text: string | null;
  processed_meeting_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  /** Self-hosted Jitsi domain. "meet.jit.si" when not configured. */
  jitsi_domain?: string;
  /** Per-user signed JWT for self-hosted Jitsi rooms. Null on public Jitsi. */
  jitsi_jwt?: string | null;
  /** browser | jibri | compliance */
  recording_mode?: string;
}

export interface HuddlePublic {
  id: string;
  room_name: string;
  title: string;
  status: HuddleStatus;
  agent_keys: string[];
  started_at: string | null;
  lobby_enabled: boolean;
  e2ee_enabled: boolean;
  jitsi_domain?: string;
  jitsi_jwt?: string | null;
}

export interface HuddleParticipant {
  id: string;
  huddle_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  agent_key: string | null;
  custom_agent_id: string | null;
  role: HuddleRole;
  joined_at: string | null;
  left_at: string | null;
}

export interface HuddleTranscriptChunk {
  id: string;
  huddle_id: string;
  speaker_user_id: string | null;
  speaker_name: string;
  text: string;
  ts: string;
  agent_responses: Array<{ agent_key: string; response: string; citations?: any[] }>;
}

export interface CreateHuddleInput {
  title?: string;
  meeting_type?: HuddleMeetingType;
  team_id?: string | null;
  project_id?: string | null;
  agent_keys?: string[];
  custom_agent_ids?: string[];
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  recording_enabled?: boolean;
  recording_retention_days?: number;
  lobby_enabled?: boolean;
  require_sso?: boolean;
  e2ee_enabled?: boolean;
  data_residency?: string;
  metadata?: Record<string, unknown>;
}

export interface PatchHuddleInput {
  title?: string;
  agent_keys?: string[];
  custom_agent_ids?: string[];
  recording_enabled?: boolean;
  recording_retention_days?: number;
  lobby_enabled?: boolean;
  require_sso?: boolean;
  e2ee_enabled?: boolean;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
}

export interface JoinInput {
  guest_name?: string;
  guest_email?: string;
  role?: HuddleRole;
}

export interface InviteResult {
  share_url: string;
  delivered: string[];
  skipped: string[];
}

export interface RecordingPlayback {
  ok: boolean;
  manifest_url?: string;
  playback_url?: string | null;
  chunk_urls?: string[];
  content_type?: string;
  error?: string;
}

export const huddleApi = {
  create: async (input: CreateHuddleInput): Promise<Huddle> => {
    const { data } = await api.post<Huddle>("/huddles/", input);
    return data;
  },

  list: async (params?: { status?: string; limit?: number }): Promise<{ items: Huddle[]; total: number }> => {
    const { data } = await api.get<{ items: Huddle[]; total: number }>("/huddles/", { params });
    return data;
  },

  get: async (huddleId: string): Promise<Huddle> => {
    const { data } = await api.get<Huddle>(`/huddles/${huddleId}`);
    return data;
  },

  getPublic: async (shareToken: string): Promise<HuddlePublic> => {
    const { data } = await api.get<HuddlePublic>(`/huddles/share/${shareToken}`);
    return data;
  },

  patch: async (huddleId: string, input: PatchHuddleInput): Promise<Huddle> => {
    const { data } = await api.patch<Huddle>(`/huddles/${huddleId}`, input);
    return data;
  },

  start: async (huddleId: string): Promise<Huddle> => {
    const { data } = await api.post<Huddle>(`/huddles/${huddleId}/start`);
    return data;
  },

  end: async (huddleId: string, finalTranscript?: string): Promise<Huddle> => {
    const { data } = await api.post<Huddle>(`/huddles/${huddleId}/end`, {
      final_transcript: finalTranscript,
    });
    return data;
  },

  join: async (huddleId: string, input?: JoinInput): Promise<HuddleParticipant> => {
    const { data } = await api.post<HuddleParticipant>(`/huddles/${huddleId}/join`, input || {});
    return data;
  },

  leave: async (huddleId: string): Promise<{ ok: boolean }> => {
    const { data } = await api.post<{ ok: boolean }>(`/huddles/${huddleId}/leave`);
    return data;
  },

  appendTranscript: async (huddleId: string, text: string, speakerName: string = "Speaker"): Promise<HuddleTranscriptChunk> => {
    const { data } = await api.post<HuddleTranscriptChunk>(`/huddles/${huddleId}/transcript`, {
      text, speaker_name: speakerName,
    });
    return data;
  },

  getTranscript: async (huddleId: string): Promise<{ chunks: HuddleTranscriptChunk[]; total: number }> => {
    const { data } = await api.get<{ chunks: HuddleTranscriptChunk[]; total: number }>(`/huddles/${huddleId}/transcript`);
    return data;
  },

  attachAgent: async (huddleId: string, agentKey?: string, customAgentId?: string): Promise<Huddle> => {
    const { data } = await api.post<Huddle>(`/huddles/${huddleId}/agents`, {
      agent_key: agentKey,
      custom_agent_id: customAgentId,
    });
    return data;
  },

  detachAgent: async (huddleId: string, ref: string, custom: boolean = false): Promise<Huddle> => {
    const { data } = await api.delete<Huddle>(`/huddles/${huddleId}/agents/${ref}`, { params: { custom } });
    return data;
  },

  invite: async (huddleId: string, emails: string[], message?: string): Promise<InviteResult> => {
    const { data } = await api.post<InviteResult>(`/huddles/${huddleId}/invite`, { emails, message });
    return data;
  },

  startRecording: async (huddleId: string): Promise<{ ok: boolean; error?: string }> => {
    const { data } = await api.post<{ ok: boolean; error?: string }>(`/huddles/${huddleId}/recording/start`);
    return data;
  },

  uploadRecordingChunk: async (
    huddleId: string,
    chunkIndex: number,
    blob: Blob,
    contentType: string = "video/webm",
  ): Promise<{ ok: boolean; key?: string; size?: number; error?: string }> => {
    const fd = new FormData();
    fd.append("file", blob, `chunk-${chunkIndex}.webm`);
    fd.append("chunk_index", String(chunkIndex));
    fd.append("content_type", contentType);
    const { data } = await api.post<{ ok: boolean; key?: string; size?: number; error?: string }>(
      `/huddles/${huddleId}/recording/chunk`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  finishRecording: async (
    huddleId: string,
    totalChunks: number,
    contentType: string = "video/webm",
  ): Promise<{ ok: boolean; manifest_key?: string; playback_url?: string; chunk_urls?: string[]; expires_at?: string; error?: string }> => {
    const { data } = await api.post(`/huddles/${huddleId}/recording/finish`, {
      total_chunks: totalChunks,
      content_type: contentType,
    });
    return data;
  },

  getRecordingUrl: async (huddleId: string): Promise<RecordingPlayback> => {
    const { data } = await api.get<RecordingPlayback>(`/huddles/${huddleId}/recording`);
    return data;
  },

  exportToCalendar: async (
    huddleId: string,
    input: { attendees?: string[]; description?: string; calendar_id?: string },
  ): Promise<{ ok: boolean; share_url: string; event?: any; error?: string }> => {
    const { data } = await api.post(`/huddles/${huddleId}/calendar-export`, {
      attendees: input.attendees || [],
      description: input.description,
      calendar_id: input.calendar_id || "primary",
    });
    return data;
  },
};
