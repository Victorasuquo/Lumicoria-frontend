import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    // AND the request itself is not a refresh attempt
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', null, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        const { access_token } = response.data;
        localStorage.setItem('accessToken', access_token);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  onboarding_completed?: boolean;
  job_title?: string;
  company?: string;
  timezone?: string;
  preferred_language?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  job_title?: string;
  company?: string;
  timezone: string;
  preferred_language: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  break_reminders: boolean;
  work_hours_start: string;
  work_hours_end: string;
  break_interval_minutes: number;
  break_duration_minutes: number;
  preferred_ai_model: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  refresh_token?: string;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Backend expects OAuth2PasswordRequestForm (form-data with username/password)
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // Map email to username
    formData.append('password', credentials.password);

    // Explicitly override Content-Type for this request
    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  googleSignIn: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', { id_token: idToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  getUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/me/profile');
    return response.data;
  },

  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/users/me/profile', data);
    return response.data;
  },

  getUserSettings: async (): Promise<UserSettings> => {
    const response = await api.get<UserSettings>('/users/me/settings');
    return response.data;
  },

  updateUserSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await api.put<UserSettings>('/users/me/settings', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Document API
export interface Document {
  id: string;
  name: string;
  description?: string;
  document_type: string;
  mime_type?: string;
  file_url?: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
  created_by: string;
  organization_id: string;
  status: string;
  metadata?: Record<string, any>;
  extraction_status?: string;
  extraction_result?: Record<string, any>;
}

export const documentApi = {
  uploadDocument: async (
    file: File,
    name?: string,
    documentType?: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('document_type', documentType || 'pdf');
    if (description) formData.append('description', description);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    const response = await api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocuments: async (): Promise<Document[]> => {
    const response = await api.get<Document[]>('/documents');
    return response.data;
  },

  getDocument: async (id: string): Promise<Document> => {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  getPresignedUrl: async (documentId: string): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>(`/documents/${documentId}/presigned-url`);
    return response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  extractDocument: async (id: string, config?: Record<string, any>): Promise<any> => {
    const response = await api.post<any>(`/documents/${id}/extract`, config || null);
    return response.data;
  },

  queryDocument: async (id: string, query: string): Promise<{
    query: string;
    response: string;
    document_id: string;
    document_name: string;
    citations?: any[];
    extracted_data?: Record<string, any>;
  }> => {
    const response = await api.post(`/documents/${id}/query`, { query });
    return response.data;
  },

  createTasksFromDocument: async (id: string, config?: {
    max_tasks?: number;
    focus_areas?: string[];
    priority_threshold?: string;
  }): Promise<{
    document_id: string;
    tasks_created: number;
    tasks: any[];
  }> => {
    const response = await api.post(`/documents/${id}/create-tasks`, config || null);
    return response.data;
  },

  getDocumentSummary: async (): Promise<{
    total_count: number;
    summary_by_status: any[];
    summary_by_type: any[];
  }> => {
    const response = await api.get('/documents/summary');
    return response.data;
  },

  searchDocuments: async (query?: string, status?: string, documentType?: string): Promise<Document[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    if (documentType) params.append('document_type', documentType);
    const response = await api.get<Document[]>(`/documents/search?${params}`);
    return response.data;
  },
};

// Task API
export interface TaskItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status: string;
  priority?: string | number;
  due_date?: string | null;
  assigned_to?: string | null;
  created_by: string;
  organization_id: string;
  document_id?: string | null;
  agent_id?: string | null;
  metadata?: Record<string, any>;
  tags?: string[];
  progress?: number;
  created_at: string;
  updated_at?: string;
}

export const taskApi = {
  getTasks: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<TaskItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', String(params.skip));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    const response = await api.get<TaskItem[]>(`/tasks/?${searchParams}`);
    return response.data;
  },

  getTask: async (taskId: string): Promise<TaskItem> => {
    const response = await api.get<TaskItem>(`/tasks/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string | null;
    assigned_to?: string | null;
    progress?: number;
  }): Promise<TaskItem> => {
    const response = await api.put<TaskItem>(`/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};

// Research API
export interface ResearchRequest {
  query: string;
  research_type?: string;
  depth?: string;
  focus_areas?: string[];
  model?: string;
  context?: {
    domain?: string;
    purpose?: string;
    time_scope?: string;
  };
}

export interface ResearchResponse {
  findings: {
    executive_summary?: string;
    key_findings?: string[];
    main_content?: Record<string, any>;
    perspectives?: string[];
    limitations?: string[];
    sources?: Array<{ title?: string; url?: string; snippet?: string; type?: string; credibility?: number }>;
  };
  raw_response?: string;
  processed_at: string;
  model_used: string;
  research_type: string;
  query: string;
  sub_questions?: string[];
  citations?: Array<{ url?: string; title?: string; text?: string }>;
}

export const researchApi = {
  query: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>('/research/query', data);
    return response.data;
  },

  topic: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>('/research/topic', { ...data, research_type: 'topic_research' });
    return response.data;
  },

  literatureReview: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>('/research/literature-review', { ...data, research_type: 'literature_review' });
    return response.data;
  },

  factCheck: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>('/research/fact-check', { ...data, research_type: 'fact_checking' });
    return response.data;
  },

  compareSources: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>('/research/compare-sources', { ...data, research_type: 'source_comparison' });
    return response.data;
  },

  comprehensive: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await api.post<ResearchResponse>('/research/comprehensive', { ...data, depth: 'deep' });
    return response.data;
  },
};

// Agent API
export interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at?: string;
  tasks_completed: number;
  tasks_pending: number;
  last_active: string;
}

export const agentApi = {
  getAgents: async (): Promise<Agent[]> => {
    const response = await api.get<Agent[]>('/agents');
    return response.data;
  },

  getAgent: async (id: string): Promise<Agent> => {
    const response = await api.get<Agent>(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (data: any): Promise<Agent> => {
    const response = await api.post<Agent>('/agents', data);
    return response.data;
  },

  updateAgent: async (id: string, data: any): Promise<Agent> => {
    const response = await api.put<Agent>(`/agents/${id}`, data);
    return response.data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },

  testAgent: async (id: string, input: string): Promise<any> => {
    const response = await api.post(`/agents/${id}/test`, { input });
    return response.data;
  },

  chatWithAgent: async (id: string, message: string): Promise<any> => {
    const response = await api.post(`/agents/${id}/chat`, { message });
    return response.data;
  },
};

// Wellbeing API
export interface WellbeingMetric {
  id: string;
  user_id: string;
  organization_id: string;
  metric_type: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
  source: string;
}

export interface WellbeingGoal {
  id: string;
  user_id: string;
  organization_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
  metadata?: Record<string, any>;
}

export interface WellbeingRecommendation {
  id: string;
  user_id: string;
  organization_id: string;
  recommendation_type: string;
  content: string;
  priority: number;
  created_at: string;
  expires_at: string;
  metadata?: Record<string, any>;
}

export interface BreakRecommendation {
  break_type: string;
  duration_minutes: number;
  reason: string;
  suggested_activities: string[];
  metadata?: Record<string, any>;
}

export interface WellbeingStats {
  user_id: string;
  period_start: string;
  period_end: string;
  average_mood: number;
  average_energy: number;
  average_stress: number;
  average_sleep: number;
  total_records: number;
  mood_trend: number[];
  energy_trend: number[];
  stress_trend: number[];
  sleep_trend: number[];
}

export interface WellbeingRecord {
  user_id: string;
  timestamp: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  sleep_hours: number;
  notes?: string;
  activities: string[];
  tags: string[];
}

export interface WellbeingAnalytics {
  time_range: string;
  total_metrics: number;
  total_activities: number;
  metrics_summary: Record<string, {
    count: number;
    avg: number;
    min: number;
    max: number;
    trend: number[];
  }>;
  recent_activities: Array<{
    type: string;
    duration: number;
    timestamp: string;
  }>;
}

export const wellbeingApi = {
  getMetrics: async (params?: { metric_type?: string; start_date?: string; end_date?: string }): Promise<WellbeingMetric[]> => {
    const response = await api.get<WellbeingMetric[]>('/wellbeing/metrics', { params });
    return response.data;
  },

  submitMetric: async (data: { metric_type: string; value: number; source: string; metadata?: Record<string, any> }): Promise<WellbeingMetric> => {
    const response = await api.post<WellbeingMetric>('/wellbeing/metrics', data);
    return response.data;
  },

  getMetricsSummary: async (params?: { metric_type?: string; start_date?: string; end_date?: string }): Promise<any> => {
    const response = await api.get('/wellbeing/metrics/summary', { params });
    return response.data;
  },

  getGoals: async (status?: string): Promise<WellbeingGoal[]> => {
    const response = await api.get<WellbeingGoal[]>('/wellbeing/goals', { params: status ? { status } : {} });
    return response.data;
  },

  createGoal: async (data: { goal_type: string; target_value: number; start_date: string; end_date: string; metadata?: Record<string, any> }): Promise<WellbeingGoal> => {
    const response = await api.post<WellbeingGoal>('/wellbeing/goals', data);
    return response.data;
  },

  updateGoal: async (goalId: string, data: Record<string, any>): Promise<WellbeingGoal> => {
    const response = await api.put<WellbeingGoal>(`/wellbeing/goals/${goalId}`, data);
    return response.data;
  },

  getRecommendations: async (): Promise<WellbeingRecommendation[]> => {
    const response = await api.get<WellbeingRecommendation[]>('/wellbeing/recommendations');
    return response.data;
  },

  getBreakRecommendation: async (): Promise<BreakRecommendation> => {
    const response = await api.get<BreakRecommendation>('/wellbeing/break-recommendation');
    return response.data;
  },

  recordActivity: async (data: { activity_type: string; duration_minutes: number; metadata?: Record<string, any> }): Promise<any> => {
    const response = await api.post('/wellbeing/activity', null, { params: data });
    return response.data;
  },

  getAnalytics: async (timeRange?: string): Promise<WellbeingAnalytics> => {
    const response = await api.get<WellbeingAnalytics>('/wellbeing/analytics', { params: { time_range: timeRange || '7d' } });
    return response.data;
  },

  getStatus: async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/wellbeing/status');
    return response.data;
  },

  getStats: async (timeRange?: string): Promise<WellbeingStats> => {
    const response = await api.get<WellbeingStats>('/wellbeing/stats', { params: { time_range: timeRange || '7d' } });
    return response.data;
  },

  getHistory: async (timeRange?: string): Promise<WellbeingRecord[]> => {
    const response = await api.get<WellbeingRecord[]>('/wellbeing/history', { params: { time_range: timeRange || '7d' } });
    return response.data;
  },
};

// Student agent API
export interface StudentRequest {
  content: string;
  context?: {
    subject?: string;
    level?: string;
    deadline?: string;
    interests?: string[];
    background?: string;
    subjects?: string[];
    time_available?: string;
    learning_style?: string;
    focus?: string[];
    depth?: 'brief' | 'detailed' | 'comprehensive';
  };
  request_type?: string;
  model?: string;
  temperature?: number;
}

export interface StudentResponse {
  id?: string;
  response: Record<string, any>;
  raw_response?: string;
  processed_at: string;
  model_used: string;
  request_type: string;
  citations?: Array<Record<string, any>>;
  content?: string;
  created_at?: string;
}

export const studentApi = {
  getAssignmentHelp: async (request: StudentRequest): Promise<StudentResponse> => {
    const response = await api.post<StudentResponse>(
      "/student/assignment-help",
      request
    );
    return response.data;
  },

  getStudyPlan: async (request: StudentRequest): Promise<StudentResponse> => {
    const response = await api.post<StudentResponse>(
      "/student/study-plan",
      request
    );
    return response.data;
  },

  explainConcept: async (request: StudentRequest): Promise<StudentResponse> => {
    const response = await api.post<StudentResponse>(
      "/student/explain-concept",
      request
    );
    return response.data;
  },

  conductResearch: async (request: StudentRequest): Promise<StudentResponse> => {
    const response = await api.post<StudentResponse>(
      "/student/research",
      request
    );
    return response.data;
  },

  assist: async (request: StudentRequest): Promise<StudentResponse> => {
    const response = await api.post<StudentResponse>("/student/assist", request);
    return response.data;
  },

  getHistory: async (limit: number = 20, skip: number = 0): Promise<StudentResponse[]> => {
    const response = await api.get<StudentResponse[]>("/student/history", {
      params: { limit, skip },
    });
    return response.data;
  },

  followUp: (content: string, parentId: string, model?: string) =>
    api.post<StudentResponse>('/student/follow-up', { content, parent_id: parentId, model }),
};

// Meeting agent API — types
export interface MeetingParticipant {
  name: string;
  role?: string;
  email?: string;
}

export interface MeetingMetadata {
  id?: string;
  title?: string;
  date?: string;
  duration?: string;
  type: 'general' | 'status_update' | 'planning' | 'brainstorming' | 'decision_making' | 'problem_solving' | 'review' | 'team_building' | 'client';
  participants?: (string | MeetingParticipant)[];
}

export interface MeetingContext {
  project?: string;
  previous_meeting?: string;
  goals?: string[];
  team?: string;
  organization?: string;
}

export interface MeetingRequest {
  transcript: string;
  metadata: MeetingMetadata;
  context?: MeetingContext;
  model?: string;
}

export interface MeetingActionItem {
  task: string;
  assignee: string;
  deadline: string;
}

export interface MeetingResponse {
  meeting_id: string;
  summary: string;
  action_items: MeetingActionItem[];
  decisions: string[];
  key_points: string[];
  follow_ups: string[];
  processed_at: string;
  model_used: string;
  questions?: string[];
  concerns?: string[];
  raw_response?: string;
  citations?: Record<string, any>[];
  // Export fields (optional, present on export endpoints)
  notion_url?: string;
  notion_export_status?: string;
  google_doc_url?: string;
  google_doc_id?: string;
  google_export_status?: string;
}

// ── Meeting Library & Draft types ─────────────────────────────────
export interface MeetingLibraryItem {
  id: string;
  title: string | null;
  meeting_type: string;
  summary: string | null;
  action_items: MeetingActionItem[];
  decisions: string[];
  key_points: string[];
  follow_ups: string[];
  model_used: string | null;
  meeting_date: string | null;
  duration: string | null;
  participants: string[];
  source: string;
  processed_at: string | null;
  created_at: string;
}

export interface MeetingLibraryDetail extends MeetingLibraryItem {
  transcript: string;
  raw_response: string | null;
  questions: string[];
  concerns: string[];
  context: Record<string, any>;
  tags: string[];
}

export interface MeetingLibraryList {
  total: number;
  page: number;
  limit: number;
  meetings: MeetingLibraryItem[];
}

export interface MeetingDraftRequest {
  transcript: string;
  title?: string;
  meeting_type?: string;
  participants?: string[];
  context?: Record<string, any>;
}

export interface MeetingDraftResponse {
  id: string;
  transcript: string;
  title: string | null;
  meeting_type: string | null;
  participants: string[];
  context: Record<string, any>;
  updated_at: string;
}

export const meetingApi = {
  process: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/process', data);
    return response.data;
  },

  upload: async (file: File, metadata?: string, context?: string, model?: string): Promise<MeetingResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) formData.append('metadata', metadata);
    if (context) formData.append('context', context);
    if (model) formData.append('model', model);

    const response = await api.post<MeetingResponse>('/meeting/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  statusUpdate: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/status-update', data);
    return response.data;
  },

  planning: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/planning', data);
    return response.data;
  },

  decision: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/decision', data);
    return response.data;
  },

  client: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/client', data);
    return response.data;
  },

  brainstorming: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/brainstorming', data);
    return response.data;
  },

  problemSolving: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/problem-solving', data);
    return response.data;
  },

  exportToNotion: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/export-to-notion', data);
    return response.data;
  },

  exportToGoogleWorkspace: async (data: MeetingRequest): Promise<MeetingResponse> => {
    const response = await api.post<MeetingResponse>('/meeting/export-to-google-workspace', data);
    return response.data;
  },

  // ── Library (Postgres persistence) ──────────────────────────────
  getLibrary: async (params?: { page?: number; limit?: number; meeting_type?: string; search?: string }): Promise<MeetingLibraryList> => {
    const response = await api.get<MeetingLibraryList>('/meeting/library', { params });
    return response.data;
  },

  getMeeting: async (meetingId: string): Promise<MeetingLibraryDetail> => {
    const response = await api.get<MeetingLibraryDetail>(`/meeting/library/${meetingId}`);
    return response.data;
  },

  deleteMeeting: async (meetingId: string): Promise<void> => {
    await api.delete(`/meeting/library/${meetingId}`);
  },

  // ── Draft (auto-save transcript) ────────────────────────────────
  saveDraft: async (data: MeetingDraftRequest): Promise<MeetingDraftResponse> => {
    const response = await api.put<MeetingDraftResponse>('/meeting/draft', data);
    return response.data;
  },

  getDraft: async (): Promise<MeetingDraftResponse | null> => {
    try {
      const response = await api.get<MeetingDraftResponse>('/meeting/draft');
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  deleteDraft: async (): Promise<void> => {
    await api.delete('/meeting/draft');
  },
};

// Chat API — Lumicoria Chat with intent routing
export interface ChatRequest {
  query: string;
  conversation_id?: string;
  save_to_context?: boolean;
  include_sources?: string[];
  max_sources_per_type?: number;
}

export interface ChatResponseData {
  response: string;
  conversation_id: string;
  agent_used: string;
  route_confidence: number;
  sources: any[];
  processing_time_seconds: number;
  context_used: number;
  success: boolean;
}

export interface ConversationSummary {
  conversation_id: string;
  title: string;
  preview: string;
  created_at?: string;
  updated_at?: string;
  agents_used: string[];
}

export interface DocumentUploadResponse {
  message: string;
  status: string;
  filename: string;
  saved_as: string;
}

export interface DocumentListRequest {
  source_types?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface DocumentItem {
  document_id: string;
  title: string;
  source: string;
  created_at: string;
  tags?: string[];
  chunk_count?: number;
  mime_type?: string;
  file_url?: string;
}

export const chatApi = {
  // ── Chat ──────────────────────────────────────────────────────
  sendMessage: async (data: ChatRequest): Promise<ChatResponseData> => {
    const response = await api.post<ChatResponseData>('/chat/chat', data);
    return response.data;
  },

  // ── Conversations ─────────────────────────────────────────────
  listConversations: async (limit: number = 50, offset: number = 0): Promise<ConversationSummary[]> => {
    const response = await api.get<ConversationSummary[]>('/chat/conversations', {
      params: { limit, offset },
    });
    return response.data;
  },

  getConversation: async (conversationId: string): Promise<any> => {
    const response = await api.get<any>(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/chat/conversations/${conversationId}`);
  },

  // ── Documents ─────────────────────────────────────────────────
  uploadDocument: async (
    file: File,
    title?: string,
    tags?: string[]
  ): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (tags && tags.length > 0) formData.append('tags', JSON.stringify(tags));
    const response = await api.post<DocumentUploadResponse>('/chat/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addDocumentUrl: async (url: string, title?: string, tags?: string[]): Promise<any> => {
    const response = await api.post('/chat/documents/url', { url, title, tags });
    return response.data;
  },

  addDocumentText: async (text: string, title?: string, tags?: string[]): Promise<any> => {
    const response = await api.post('/chat/documents/text', { text, title, tags });
    return response.data;
  },

  addGoogleDriveDocument: async (driveFileId: string, title?: string, tags?: string[]): Promise<any> => {
    const response = await api.post('/chat/documents/google-drive', {
      drive_file_id: driveFileId, title, tags,
    });
    return response.data;
  },

  listDocuments: async (filters?: DocumentListRequest): Promise<{ documents: DocumentItem[]; total: number }> => {
    const response = await api.post('/chat/documents/list', filters || {});
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/chat/documents/${documentId}`);
  },

  // ── Context ───────────────────────────────────────────────────
  searchContext: async (query: string, maxResults?: number, includeSources?: string[]): Promise<any> => {
    const response = await api.post('/chat/context/search', null, {
      params: { query, max_results: maxResults, include_sources: includeSources },
    });
    return response.data;
  },

  combinedContextSearch: async (query: string, maxResultsPerSource?: number): Promise<any> => {
    const response = await api.post('/chat/context/combined-search', null, {
      params: { query, max_results_per_source: maxResultsPerSource },
    });
    return response.data;
  },
};

// ─── Billing API ───────────────────────────────────────────────────────────

export interface PlanInfo {
  plan: string;
  display_name: string;
  price_monthly: number | null;
  max_agents: number;
  max_agent_runs_per_month: number;
  max_documents_per_month: number;
  max_file_upload_mb: number;
  max_knowledge_base_queries: number;
  advanced_features: boolean;
  priority_support: boolean;
  api_access: boolean;
  custom_agent_templates: boolean;
}

export interface SubscriptionInfo {
  plan: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  is_active: boolean;
}

export interface UsageInfo {
  plan: string;
  month: number;
  year: number;
  agent_runs: number;
  agent_runs_limit: number;
  documents_processed: number;
  documents_limit: number;
  knowledge_base_queries: number;
  knowledge_base_queries_limit: number;
  usage_percent: number;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface PortalResponse {
  portal_url: string;
}

// ─── Invoice & Credit Types ───────────────────────────────────────────────

export interface InvoiceItem {
  invoice_id: string;
  invoice_number: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_date: string;
  paid_at: string | null;
  invoice_pdf_url: string | null;
  hosted_invoice_url: string | null;
  line_items: Array<{ description: string; amount: number; currency: string; quantity: number }>;
}

export interface InvoiceListResponse {
  invoices: InvoiceItem[];
  total_count: number;
}

export interface CreditBalance {
  user_id: string;
  balance: number;
  currency: string;
}

export interface CreditTransaction {
  transaction_type: 'credit' | 'debit' | 'refund' | 'adjustment' | 'bonus';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface CreditLedgerResponse {
  balance: number;
  transactions: CreditTransaction[];
  total_count: number;
  page: number;
  page_size: number;
}

export const billingApi = {
  getPlans: async (): Promise<PlanInfo[]> => {
    const response = await api.get<PlanInfo[]>('/billing/plans');
    return response.data;
  },

  getSubscription: async (): Promise<SubscriptionInfo> => {
    const response = await api.get<SubscriptionInfo>('/billing/subscription');
    return response.data;
  },

  getUsage: async (): Promise<UsageInfo> => {
    const response = await api.get<UsageInfo>('/billing/usage');
    return response.data;
  },

  createCheckout: async (data: { price_id: string; success_url?: string; cancel_url?: string }): Promise<CheckoutResponse> => {
    const response = await api.post<CheckoutResponse>('/billing/checkout', data);
    return response.data;
  },

  createPortalSession: async (data?: { return_url?: string }): Promise<PortalResponse> => {
    const response = await api.post<PortalResponse>('/billing/portal', data || {});
    return response.data;
  },

  // ─── Invoices ───────────────────────────────────────────────────────

  getInvoices: async (params?: { limit?: number; skip?: number; status?: string }): Promise<InvoiceListResponse> => {
    const response = await api.get<InvoiceListResponse>('/billing/invoices', { params });
    return response.data;
  },

  getInvoicePdf: async (invoiceId: string): Promise<{ pdf_url: string }> => {
    const response = await api.get<{ pdf_url: string }>(`/billing/invoices/${invoiceId}/pdf`);
    return response.data;
  },

  exportInvoice: async (invoiceId: string): Promise<Record<string, unknown>> => {
    const response = await api.get(`/billing/invoices/${invoiceId}/export`);
    return response.data;
  },

  // ─── Credits ────────────────────────────────────────────────────────

  getCreditBalance: async (): Promise<CreditBalance> => {
    const response = await api.get<CreditBalance>('/billing/credits/balance');
    return response.data;
  },

  getCreditLedger: async (params?: { limit?: number; skip?: number }): Promise<CreditLedgerResponse> => {
    const response = await api.get<CreditLedgerResponse>('/billing/credits/ledger', { params });
    return response.data;
  },
};

// Notification API
export enum NotificationType {
  SYSTEM = "system",
  TASK = "task",
  DOCUMENT = "document",
  AUTH = "auth",
  BILLING = "billing",
  WELLBEING = "wellbeing",
  EMAIL = "email"
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent"
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  content: string;
  priority: NotificationPriority;
  read: boolean;
  metadata?: any;
  created_at: string;
}

export const notificationApi = {
  getNotifications: async (unreadOnly: boolean = false, limit: number = 50, skip: number = 0): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/', {
      params: { unread_only: unreadOnly, limit, skip }
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await api.get<{ unread_count: number }>('/notifications/unread/count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read/all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  }
};

// ─── Projects API ─────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  color: string;
  tasks: any[];
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateData {
  title: string;
  description?: string;
  due_date?: string;
  status?: string;
  color?: string;
}

export const projectApi = {
  list: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects/projects');
    return response.data;
  },

  create: async (data: ProjectCreateData): Promise<Project> => {
    const response = await api.post<Project>('/projects/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProjectCreateData>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/projects/${id}`);
  },

  addTask: async (projectId: string, task: { title: string; description?: string; due_date?: string; priority?: string; status?: string }): Promise<Project> => {
    const response = await api.post<Project>(`/projects/projects/${projectId}/tasks`, task);
    return response.data;
  },
};

// ─── Onboarding API ────────────────────────────────────────────────────────────

export const onboardingApi = {
  complete: async (data: {
    full_name?: string;
    job_title?: string;
    company?: string;
    avatar_url?: string;
    timezone?: string;
    preferred_language?: string;
  }): Promise<any> => {
    const response = await api.post('/onboarding/complete', data);
    return response.data;
  },
};

// ─── Research Mentor API ────────────────────────────────────────────────────

export const researchMentorApi = {
  analyzeProblem: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/analyze-problem', data);
    return response.data;
  },
  planResearch: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/plan-research', data);
    return response.data;
  },
  reviewLiterature: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/review-literature', data);
    return response.data;
  },
  developHypothesis: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/develop-hypothesis', data);
    return response.data;
  },
  guideMethodology: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/guide-methodology', data);
    return response.data;
  },
  evaluateCritically: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/evaluate-critically', data);
    return response.data;
  },
  synthesize: async (data: any): Promise<any> => {
    const response = await api.post('/research-mentor/synthesize', data);
    return response.data;
  },
};

// ─── Ethics & Bias API ──────────────────────────────────────────────────────

export const ethicsBiasApi = {
  analyzeContent: async (data: any): Promise<any> => {
    const response = await api.post('/ethics-bias/analyze', data);
    return response.data;
  },
  checkGuidelines: async (data: any): Promise<any> => {
    const response = await api.post('/ethics-bias/check-guidelines', data);
    return response.data;
  },
  generateSuggestions: async (data: any): Promise<any> => {
    const response = await api.post('/ethics-bias/generate-suggestions', data);
    return response.data;
  },
  getCitations: async (data: any): Promise<any> => {
    const response = await api.post('/ethics-bias/get-citations', data);
    return response.data;
  },
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/ethics-bias/ethics-categories');
    return response.data;
  },
  getBiasTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/ethics-bias/bias-types');
    return response.data;
  },
  getSeverityLevels: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/ethics-bias/severity-levels');
    return response.data;
  },
};

// ─── Knowledge Graph API ────────────────────────────────────────────────────

export const knowledgeGraphApi = {
  extractKnowledge: async (data: any): Promise<any> => {
    const response = await api.post('/knowledge-graph/extract', data);
    return response.data;
  },
  discoverRelations: async (data: any): Promise<any> => {
    const response = await api.post('/knowledge-graph/discover-relations', data);
    return response.data;
  },
  fillGaps: async (data: any): Promise<any> => {
    const response = await api.post('/knowledge-graph/fill-gaps', data);
    return response.data;
  },
  queryGraph: async (data: any): Promise<any> => {
    const response = await api.post('/knowledge-graph/query', data);
    return response.data;
  },
  visualize: async (data: any): Promise<any> => {
    const response = await api.post('/knowledge-graph/visualize', data);
    return response.data;
  },
  getStats: async (): Promise<any> => {
    const response = await api.get('/knowledge-graph/stats');
    return response.data;
  },
  getNodeTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/knowledge-graph/node-types');
    return response.data;
  },
  getRelationTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/knowledge-graph/relation-types');
    return response.data;
  },
};

// ─── Workspace Ergonomics API ───────────────────────────────────────────────

export const workspaceErgonomicsApi = {
  analyzeWorkspace: async (data: any): Promise<any> => {
    const response = await api.post('/workspace-ergonomics/analyze', data);
    return response.data;
  },
  analyzeImage: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/workspace-ergonomics/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  monitorWorkspace: async (data: any): Promise<any> => {
    const response = await api.post('/workspace-ergonomics/monitor', data);
    return response.data;
  },
  getRecommendations: async (data: any): Promise<any> => {
    const response = await api.post('/workspace-ergonomics/get-recommendations', data);
    return response.data;
  },
  getGuidelines: async (data: any): Promise<any> => {
    const response = await api.post('/workspace-ergonomics/get-guidelines', data);
    return response.data;
  },
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/workspace-ergonomics/ergonomic-categories');
    return response.data;
  },
  getSeverityLevels: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/workspace-ergonomics/issue-severity-levels');
    return response.data;
  },
};

// ─── Focus Flow API ─────────────────────────────────────────────────────────

export const focusFlowApi = {
  monitorFocus: async (data: any): Promise<any> => {
    const response = await api.post('/focus-flow/monitor', data);
    return response.data;
  },
  analyzePatterns: async (data: any): Promise<any> => {
    const response = await api.post('/focus-flow/analyze-patterns', data);
    return response.data;
  },
  getRecommendations: async (data: any): Promise<any> => {
    const response = await api.post('/focus-flow/get-recommendations', data);
    return response.data;
  },
  trackDistraction: async (data: any): Promise<any> => {
    const response = await api.post('/focus-flow/track-distraction', data);
    return response.data;
  },
  endSession: async (data: any): Promise<any> => {
    const response = await api.post('/focus-flow/end-session', data);
    return response.data;
  },
  getFocusStates: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/focus-flow/focus-states');
    return response.data;
  },
  getDistractionTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/focus-flow/distraction-types');
    return response.data;
  },
  getProductivityTechniques: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/focus-flow/productivity-techniques');
    return response.data;
  },
};

// ─── Meeting Fact Checker API ───────────────────────────────────────────────

export interface FactCheckSessionItem {
  id: string;
  title: string;
  participants: string[];
  summary: string | null;
  verification_stats: Record<string, any>;
  total_claims: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface FactCheckClaimItem {
  id: string;
  content: string;
  speaker: string;
  claim_type: string;
  verification_status: string;
  confidence: number;
  severity: string;
  citations: string[];
  corrections: string[];
  summary: string | null;
  created_at: string;
}

export interface FactCheckSessionDetail extends FactCheckSessionItem {
  claims: FactCheckClaimItem[];
}

export interface FactCheckSessionList {
  total: number;
  page: number;
  limit: number;
  sessions: FactCheckSessionItem[];
}

export const meetingFactCheckerApi = {
  verifyClaim: async (data: any): Promise<any> => {
    const response = await api.post('/meeting-fact-checker/verify-claim', data);
    return response.data;
  },
  startSession: async (data: any): Promise<any> => {
    const response = await api.post('/meeting-fact-checker/start-session', data);
    return response.data;
  },
  endSession: async (data: any): Promise<any> => {
    const response = await api.post('/meeting-fact-checker/end-session', data);
    return response.data;
  },
  getSummary: async (data: any): Promise<any> => {
    const response = await api.post('/meeting-fact-checker/get-summary', data);
    return response.data;
  },
  getClaimTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/meeting-fact-checker/claim-types');
    return response.data;
  },
  getVerificationStatuses: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/meeting-fact-checker/verification-statuses');
    return response.data;
  },
  getClaimSeverities: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/meeting-fact-checker/claim-severities');
    return response.data;
  },

  // ── Library (Postgres persistence) ────────────────────────────
  getSessions: async (params?: { page?: number; limit?: number }): Promise<FactCheckSessionList> => {
    const response = await api.get<FactCheckSessionList>('/meeting-fact-checker/sessions', { params });
    return response.data;
  },
  getSession: async (sessionId: string): Promise<FactCheckSessionDetail> => {
    const response = await api.get<FactCheckSessionDetail>(`/meeting-fact-checker/sessions/${sessionId}`);
    return response.data;
  },
  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/meeting-fact-checker/sessions/${sessionId}`);
  },
};

// Activity API
export interface ActivityEntry {
  id: string;
  user_id: string;
  organization_id: string;
  activity_type: string;
  timestamp: string;
  details: Record<string, any>;
  related_resource_type?: string;
  related_resource_id?: string;
}

export interface ActivitySummary {
  total_events: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  time_range: { start?: string; end?: string };
}

export const activityApi = {
  getRecent: async (limit = 20, skip = 0, activityType?: string, agentId?: string): Promise<ActivityEntry[]> => {
    const params: Record<string, any> = { limit, skip };
    if (activityType) params.activity_type = activityType;
    if (agentId) params.agent_id = agentId;
    const response = await api.get<ActivityEntry[]>('/activity/recent', { params });
    return response.data;
  },

  getByAgent: async (agentId: string, limit = 20, skip = 0): Promise<ActivityEntry[]> => {
    const response = await api.get<ActivityEntry[]>(`/activity/by-agent/${agentId}`, { params: { limit, skip } });
    return response.data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<ActivitySummary> => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ActivitySummary>('/activity/summary', { params });
    return response.data;
  },

  logInternal: async (activityType: string, details: Record<string, any>, agentId?: string, agentName?: string): Promise<any> => {
    const response = await api.post('/activity/internal/log', {
      activity_type: activityType,
      details,
      agent_id: agentId,
      agent_name: agentName,
    });
    return response.data;
  },
};

// Security API
export interface SecurityOverview {
  two_factor_enabled: boolean;
  email_verified: boolean;
  last_login?: string;
  login_count: number;
  failed_login_attempts: number;
  last_failed_login?: string;
  last_password_change?: string;
  active_sessions: number;
  account_created?: string;
}

export interface LoginEvent {
  id: string;
  timestamp: string;
  ip_address?: string;
  device?: string;
  location?: string;
  status: string;
  method: string;
  activity_type: string;
  description: string;
}

export interface LoginActivityResponse {
  events: LoginEvent[];
  total: number;
  limit: number;
  skip: number;
}

export interface SessionInfo {
  session_id: string;
  device: string;
  ip_address?: string;
  location?: string;
  last_active: string;
  is_current: boolean;
  created_at: string;
}

export const securityApi = {
  getOverview: async (): Promise<SecurityOverview> => {
    const response = await api.get<SecurityOverview>('/security/overview');
    return response.data;
  },

  getActivity: async (limit = 20, skip = 0): Promise<LoginActivityResponse> => {
    const response = await api.get<LoginActivityResponse>('/security/activity', {
      params: { limit, skip },
    });
    return response.data;
  },

  getSessions: async (): Promise<SessionInfo[]> => {
    const response = await api.get<SessionInfo[]>('/security/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await api.post(`/security/sessions/${sessionId}/revoke`);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/security/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  revokeAllSessions: async (): Promise<{ message: string; new_refresh_token: string }> => {
    const response = await api.post('/security/revoke-all-sessions');
    return response.data;
  },
};

// ── Agent Studio API ──

export interface StudioComponent {
  id: string;
  name: string;
  type: 'input' | 'processor' | 'output' | 'integration' | 'condition' | 'loop' | 'transform';
  category: 'document' | 'wellbeing' | 'vision' | 'meeting' | 'creative' | 'student' | 'general';
  description: string;
  config_schema: Record<string, any>;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  icon: string;
  version: string;
  is_beta: boolean;
  requires_auth: boolean;
}

export interface ComponentInstance {
  id: string;
  component_id: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: { target: string }[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  components: ComponentInstance[];
  created_at: string;
  updated_at: string;
  created_by: string;
  version: string;
  is_public: boolean;
  tags: string[];
}

export interface WorkflowSummary {
  total: number;
  public_count: number;
  private_count: number;
  by_status: Record<string, number>;
}

export interface ExecutionResponse {
  execution_id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'canceled';
  started_at: string;
  completed_at?: string;
  results?: Record<string, any>;
}

export interface ExecutionStatus {
  execution_id: string;
  workflow_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  node_statuses: Record<string, {
    name: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    execution_order: number;
    has_result: boolean;
  }>;
}

export const agentStudioApi = {
  // Components
  getComponents: async (category?: string, type?: string): Promise<StudioComponent[]> => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (type) params.type = type;
    const response = await api.get('/agent-studio/components', { params });
    return response.data;
  },

  getComponent: async (componentId: string): Promise<StudioComponent> => {
    const response = await api.get(`/agent-studio/components/${componentId}`);
    return response.data;
  },

  // Workflows
  getWorkflows: async (): Promise<Workflow[]> => {
    const response = await api.get('/agent-studio/workflows');
    return response.data;
  },

  getWorkflow: async (workflowId: string): Promise<Workflow> => {
    const response = await api.get(`/agent-studio/workflows/${workflowId}`);
    return response.data;
  },

  getWorkflowSummary: async (): Promise<WorkflowSummary> => {
    const response = await api.get('/agent-studio/workflows/summary');
    return response.data;
  },

  createWorkflow: async (data: {
    name: string;
    description: string;
    components: ComponentInstance[];
    is_public?: boolean;
    tags?: string[];
  }): Promise<Workflow> => {
    const response = await api.post('/agent-studio/workflows', data);
    return response.data;
  },

  updateWorkflow: async (workflowId: string, data: {
    name?: string;
    description?: string;
    components?: ComponentInstance[];
    is_public?: boolean;
    tags?: string[];
  }): Promise<Workflow> => {
    const response = await api.put(`/agent-studio/workflows/${workflowId}`, data);
    return response.data;
  },

  deleteWorkflow: async (workflowId: string): Promise<void> => {
    await api.delete(`/agent-studio/workflows/${workflowId}`);
  },

  validateWorkflow: async (workflowId: string): Promise<{ valid: boolean; errors: string[] }> => {
    const response = await api.post(`/agent-studio/workflows/${workflowId}/validate`);
    return response.data;
  },

  deployWorkflow: async (workflowId: string): Promise<{ agent_id: string; status: string }> => {
    const response = await api.post(`/agent-studio/workflows/${workflowId}/deploy`);
    return response.data;
  },

  // Execution
  executeWorkflow: async (workflowId: string, inputData: Record<string, any>): Promise<ExecutionResponse> => {
    const response = await api.post('/workflows/execute', {
      workflow_id: workflowId,
      input_data: inputData,
    });
    return response.data;
  },

  getExecution: async (executionId: string): Promise<ExecutionResponse> => {
    const response = await api.get(`/workflows/executions/${executionId}`);
    return response.data;
  },

  getExecutionStatus: async (executionId: string): Promise<ExecutionStatus> => {
    const response = await api.get(`/workflows/executions/${executionId}/status`);
    return response.data;
  },

  cancelExecution: async (executionId: string): Promise<void> => {
    await api.delete(`/workflows/executions/${executionId}`);
  },
};

// ── Integration API ───────────────────────────────────────────────────────────

export interface IntegrationItem {
  id: string;
  name: string;
  type: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  status: string;
  config?: Record<string, any>;
  sync_status?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IntegrationCatalogItem {
  type: string;
  name: string;
  description: string;
  icon: string;
  available_actions: string[];
  is_configured: boolean;
  status: string;
  category: string;
}

export interface IntegrationCatalogDetail extends IntegrationCatalogItem {
  credential_fields: Array<{
    key: string;
    label: string;
    type: string;
  }>;
}

export interface IntegrationHealth {
  status?: string;
  last_sync?: string;
  error_rate: number;
  recent_errors: number;
  active_webhooks: number;
  webhook_success_rate: number;
}

export interface IntegrationActionResult {
  success: boolean;
  result?: Record<string, any>;
  error?: string;
}

export const integrationApi = {
  getCatalog: async (): Promise<IntegrationCatalogItem[]> => {
    const response = await api.get<IntegrationCatalogItem[]>('/integrations/catalog');
    return response.data;
  },

  getCatalogDetail: async (type: string): Promise<IntegrationCatalogDetail> => {
    const response = await api.get<IntegrationCatalogDetail>(`/integrations/catalog/${type}`);
    return response.data;
  },

  connect: async (data: {
    type: string;
    name: string;
    credentials: Record<string, any>;
    config?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<IntegrationItem> => {
    const response = await api.post<IntegrationItem>('/integrations/connect', data);
    return response.data;
  },

  disconnect: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/integrations/${id}/disconnect`);
    return response.data;
  },

  reconnect: async (id: string, credentials: Record<string, any>): Promise<IntegrationItem> => {
    const response = await api.post<IntegrationItem>(`/integrations/${id}/reconnect`, credentials);
    return response.data;
  },

  executeAction: async (id: string, action: string, data?: Record<string, any>): Promise<IntegrationActionResult> => {
    const response = await api.post<IntegrationActionResult>(`/integrations/${id}/execute`, { action, data: data || {} });
    return response.data;
  },

  getActions: async (id: string): Promise<{ integration_id: string; type: string; actions: string[] }> => {
    const response = await api.get(`/integrations/${id}/actions`);
    return response.data;
  },

  getHealth: async (id: string): Promise<IntegrationHealth> => {
    const response = await api.get<IntegrationHealth>(`/integrations/${id}/health`);
    return response.data;
  },

  triggerSync: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/integrations/${id}/sync`);
    return response.data;
  },

  list: async (type?: string, status?: string): Promise<IntegrationItem[]> => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (status) params.status = status;
    const response = await api.get<IntegrationItem[]>('/integrations/', { params });
    return response.data;
  },

  get: async (id: string): Promise<IntegrationItem> => {
    const response = await api.get<IntegrationItem>(`/integrations/${id}`);
    return response.data;
  },

  update: async (id: string, data: Record<string, any>): Promise<IntegrationItem> => {
    const response = await api.put<IntegrationItem>(`/integrations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/integrations/${id}`);
  },

  getStats: async (): Promise<Record<string, any>> => {
    const response = await api.get('/integrations/stats/overview');
    return response.data;
  },

  // ── OAuth flow ─────────────────────────────────────────────────────────

  /** Get the OAuth authorization URL for a provider (opens in popup). */
  getOAuthUrl: async (provider: string): Promise<{ auth_url: string; state: string }> => {
    const response = await api.get(`/integrations/oauth/${provider}/authorize`);
    return response.data;
  },

  /** Exchange the authorization code for tokens after OAuth callback. */
  handleOAuthCallback: async (data: {
    code: string;
    state: string;
    provider: string;
  }): Promise<IntegrationItem> => {
    const response = await api.post<IntegrationItem>('/integrations/oauth/callback', data);
    return response.data;
  },
};

// ─── Legal Document API ─────────────────────────────────────────────────────

export interface LegalDocumentResponse {
  results: Record<string, any>;
  metadata: Record<string, any>;
}

export const legalApi = {
  /** General-purpose legal document analysis. */
  analyze: async (data: {
    data: Record<string, any>;
    mode?: string;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
    model?: string;
  }): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>('/legal/analyze', data);
    return response.data;
  },

  /** Extract clauses, obligations, and deadlines. */
  extractClauses: async (data: {
    data: Record<string, any>;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
    model?: string;
    include_metadata?: boolean;
    highlight_obligations?: boolean;
    extract_dates?: boolean;
  }): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>('/legal/analyze/clauses', data);
    return response.data;
  },

  /** Identify and categorize risks. */
  analyzeRisks: async (data: {
    data: Record<string, any>;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
    model?: string;
    risk_threshold?: number;
    include_recommendations?: boolean;
    categorize_risks?: boolean;
  }): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>('/legal/analyze/risks', data);
    return response.data;
  },

  /** Compare two document versions. */
  compareVersions: async (data: {
    data: Record<string, any>;
    old_version: string;
    new_version: string;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
    model?: string;
    track_changes?: boolean;
    summarize_changes?: boolean;
  }): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>('/legal/compare/versions', data);
    return response.data;
  },

  /** Generate plain-language summary of a legal document. */
  plainLanguage: async (data: {
    data: Record<string, any>;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
    model?: string;
    simplify_terms?: boolean;
    include_examples?: boolean;
    maintain_legal_accuracy?: boolean;
  }): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>('/legal/summarize/plain', data);
    return response.data;
  },

  /** Check regulatory compliance. */
  checkCompliance: async (data: {
    data: Record<string, any>;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
    model?: string;
    jurisdiction?: string;
    industry_specific?: boolean;
    include_citations?: boolean;
  }): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>('/legal/check/compliance', data);
    return response.data;
  },

  /** Get legal document analytics. */
  getAnalytics: async (timeRange?: string): Promise<Record<string, any>> => {
    const response = await api.get('/legal/analytics', {
      params: { time_range: timeRange || '7d' },
    });
    return response.data;
  },
};

// ── Blog Types ─────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  author_id: string;
  author_type: "team" | "individual" | "ai_agent";
  author_name: string;
  author_avatar_url?: string;
  author_title?: string;
  cover_image_url?: string;
  category?: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  collaborator_ids: string[];
  featured: boolean;
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostList {
  posts: BlogPost[];
  total: number;
  page: number;
  page_size: number;
}

export interface BlogCategory {
  category: string;
  count: number;
}

export interface UploadResult {
  key: string;
  url: string;
  content_type: string;
  size: number;
}

// ── Upload API ─────────────────────────────────────────────────────

export const uploadApi = {
  upload: async (file: File, folder: string = "uploads"): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<UploadResult>(`/upload?folder=${encodeURIComponent(folder)}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

// ── Blog API ───────────────────────────────────────────────────────

export const blogApi = {
  list: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
  }): Promise<BlogPostList> => {
    const response = await api.get<BlogPostList>("/blog", { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get<BlogPost>(`/blog/${slug}`);
    return response.data;
  },

  getCategories: async (): Promise<BlogCategory[]> => {
    const response = await api.get<BlogCategory[]>("/blog/categories");
    return response.data;
  },

  getMyPosts: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<BlogPostList> => {
    const response = await api.get<BlogPostList>("/blog/my-posts", { params });
    return response.data;
  },

  create: async (data: {
    title: string;
    subtitle?: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    category?: string;
    tags?: string[];
    status?: "draft" | "published";
    author_type?: "team" | "individual" | "ai_agent";
    featured?: boolean;
  }): Promise<BlogPost> => {
    const response = await api.post<BlogPost>("/blog", data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      title?: string;
      subtitle?: string;
      content?: string;
      excerpt?: string;
      cover_image_url?: string;
      category?: string;
      tags?: string[];
      status?: "draft" | "published" | "archived";
      featured?: boolean;
    }
  ): Promise<BlogPost> => {
    const response = await api.put<BlogPost>(`/blog/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/blog/${id}`);
  },

  addCollaborator: async (postId: string, userId: string): Promise<BlogPost> => {
    const response = await api.post<BlogPost>(`/blog/${postId}/collaborators`, {
      user_id: userId,
    });
    return response.data;
  },

  aiGenerate: async (data: {
    topic: string;
    category?: string;
    auto_publish?: boolean;
    cover_image_url?: string;
  }): Promise<BlogPost> => {
    const response = await api.post<BlogPost>("/blog/ai-generate", data);
    return response.data;
  },
};

// ── Comment Types ──────────────────────────────────────────────────

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar_url?: string;
  content: string;
  mentions: { type: string; id: string; name: string }[];
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCommentList {
  comments: BlogComment[];
  total: number;
}

export interface BlogAnalytics {
  post_id: string;
  title: string;
  view_count: number;
  comment_count: number;
  published_at?: string;
}

// ── Comment API ────────────────────────────────────────────────────

export const commentApi = {
  list: async (postId: string): Promise<BlogCommentList> => {
    const response = await api.get<BlogCommentList>(`/blog/${postId}/comments`);
    return response.data;
  },

  create: async (
    postId: string,
    data: {
      content: string;
      mentions?: { type: string; id: string; name: string }[];
      parent_id?: string;
    }
  ): Promise<BlogComment> => {
    const response = await api.post<BlogComment>(`/blog/${postId}/comments`, data);
    return response.data;
  },

  delete: async (postId: string, commentId: string): Promise<void> => {
    await api.delete(`/blog/${postId}/comments/${commentId}`);
  },

  getAnalytics: async (postId: string): Promise<BlogAnalytics> => {
    const response = await api.get<BlogAnalytics>(`/blog/${postId}/analytics`);
    return response.data;
  },
};

// ── Vision API ────────────────────────────────────────────────────

export interface VisionAnalysis {
  id: string;
  description: string;
  structured_analysis: {
    detected_objects?: string[];
    detected_text?: string[];
    scene_type?: string;
    people_count?: number;
    colors?: string[];
    themes?: string[];
    raw_description?: string;
  };
  image_url?: string;
  processed_at: string;
  model_used?: string;
  citations?: Array<{ text?: string; url?: string; title?: string }>;
  analysis_type: string;
}

export interface VisionHistoryItem {
  id: string;
  analysis_type: string;
  description: string;
  image_url?: string;
  created_at: string;
  summary: string;
}

export interface VisionStats {
  total_scans: number;
  objects_found: number;
  text_extracted: number;
  avg_processing_time: number;
}

export interface VisualQAResponse {
  answer: string;
  analysis_id: string;
  question: string;
  answered_at: string;
}

export interface VisionAnalysisDetail {
  _id: string;
  user_id: string;
  analysis_type: string;
  source: string;
  filename?: string;
  image_url?: string;
  description: string;
  structured_analysis: VisionAnalysis["structured_analysis"];
  model_used?: string;
  citations?: VisionAnalysis["citations"];
  objects_count: number;
  text_count: number;
  processed_at: string;
  created_at: string;
  conversations: Array<{ question: string; answer: string; answered_at: string }>;
}

export const visionApi = {
  analyze: async (file: File, options?: { prompt?: string; analysis_tasks?: string[] }): Promise<VisionAnalysis> => {
    const formData = new FormData();
    formData.append("file", file);
    if (options) {
      formData.append("options", JSON.stringify(options));
    }
    const response = await api.post<VisionAnalysis>("/vision/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  analyzeUrl: async (url: string, options?: { prompt?: string }): Promise<VisionAnalysis> => {
    const response = await api.post<VisionAnalysis>("/vision/analyze-url", { url, options });
    return response.data;
  },

  ocr: async (file: File): Promise<VisionAnalysis> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<VisionAnalysis>("/vision/ocr", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  query: async (analysisId: string, question: string): Promise<VisualQAResponse> => {
    const response = await api.post<VisualQAResponse>("/vision/query", {
      analysis_id: analysisId,
      question,
    });
    return response.data;
  },

  getHistory: async (params?: { limit?: number; skip?: number; analysis_type?: string }): Promise<VisionHistoryItem[]> => {
    const response = await api.get<VisionHistoryItem[]>("/vision/history", { params });
    return response.data;
  },

  getDetail: async (analysisId: string): Promise<VisionAnalysisDetail> => {
    const response = await api.get<VisionAnalysisDetail>(`/vision/history/${analysisId}`);
    return response.data;
  },

  getStats: async (): Promise<VisionStats> => {
    const response = await api.get<VisionStats>("/vision/stats");
    return response.data;
  },

  deleteAnalysis: async (analysisId: string): Promise<void> => {
    await api.delete(`/vision/history/${analysisId}`);
  },
};

// Export the api instance for custom requests
export default api;