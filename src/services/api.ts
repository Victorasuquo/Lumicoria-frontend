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
  id?: string;
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

export interface ResearchHistoryItem {
  id: string;
  query: string;
  research_type: string;
  depth: string;
  sources_count: number;
  created_at: string;
}

export interface ResearchStats {
  total_researches: number;
  total_sources: number;
  research_types: Record<string, number>;
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

  getHistory: async (limit = 20, skip = 0): Promise<ResearchHistoryItem[]> => {
    const response = await api.get<ResearchHistoryItem[]>('/research/history', { params: { limit, skip } });
    return response.data;
  },

  getDetail: async (id: string): Promise<ResearchResponse> => {
    const response = await api.get<ResearchResponse>(`/research/history/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ResearchStats> => {
    const response = await api.get<ResearchStats>('/research/stats');
    return response.data;
  },

  deleteResearch: async (id: string): Promise<void> => {
    await api.delete(`/research/history/${id}`);
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
  saved_as?: string;
  document_id?: string;
  s3_key?: string;
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
  source_url?: string;
  s3_key?: string;
  size_bytes?: number;
  status?: string;
  filename?: string;
  original_filename?: string;
}

export interface DocumentPresignedUrl {
  url: string;
  document_id: string;
  filename: string;
  original_filename?: string | null;
  mime_type?: string;
  title?: string;
  source?: string;
  source_url?: string | null;
}

export interface DocumentContent {
  document_id: string;
  title?: string;
  mime_type?: string;
  source?: string;
  chunk_count: number;
  content: string;
}

export type XlsxSheet = {
  name: string;
  headers: (string | number | null)[];
  rows: (string | null)[][];
  truncated?: boolean;
};

// Discriminated union returned by GET /chat/documents/{id}/preview.
// Matches the shape built in backend/api/v1/endpoints/lumicoria_chat.py.
export type DocumentPreviewDescriptor = {
  document_id: string;
  canonical_document_id: string;
  type: "pdf" | "image" | "html" | "xlsx" | "markdown" | "text" | "code" | "download";
  mime_type: string;
  title?: string | null;
  filename?: string | null;
  source_url?: string | null;
  url?: string;                 // pdf | image | html | xlsx | download
  data?: string | { sheets: XlsxSheet[] };   // markdown | text | code | (inline xlsx)
  language?: string;            // code
};

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

  getDocumentFileUrl: async (documentId: string): Promise<DocumentPresignedUrl> => {
    const response = await api.get<DocumentPresignedUrl>(`/chat/documents/${documentId}/presigned-url`);
    return response.data;
  },

  getDocumentContent: async (documentId: string): Promise<DocumentContent> => {
    const response = await api.get<DocumentContent>(`/chat/documents/${documentId}/content`);
    return response.data;
  },

  getDocumentPreview: async (documentId: string): Promise<DocumentPreviewDescriptor> => {
    const response = await api.get<DocumentPreviewDescriptor>(`/chat/documents/${documentId}/preview`);
    return response.data;
  },

  cancelDocumentIngest: async (documentId: string): Promise<{ status: string; document_id: string }> => {
    const response = await api.post(`/chat/documents/${documentId}/cancel`);
    return response.data;
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

// ─── Learning Coach API ────────────────────────────────────────────────────

// ─── RAG API ───────────────────────────────────────────────────────────────

export const ragApi = {
  ask: async (data: { query: string; conversation_id?: string; save_to_context?: boolean; include_sources?: string[] }): Promise<any> => {
    const response = await api.post('/rag/ask', data);
    return response.data;
  },
  getHistory: async (limit = 20, skip = 0): Promise<any> => {
    const response = await api.get('/rag/history', { params: { limit, skip } });
    return response.data;
  },
  getDetail: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/rag/history/${sessionId}`);
    return response.data;
  },
  getStats: async (): Promise<any> => {
    const response = await api.get('/rag/stats');
    return response.data;
  },
  deleteSession: async (sessionId: string): Promise<any> => {
    const response = await api.delete(`/rag/history/${sessionId}`);
    return response.data;
  },
};

export const learningCoachApi = {
  analyze: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/analyze', data);
    return response.data;
  },
  createLearningPath: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/create/learning-path', data);
    return response.data;
  },
  generateQuiz: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/generate/quiz', data);
    return response.data;
  },
  explainConcept: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/explain/concept', data);
    return response.data;
  },
  trackProgress: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/track/progress', data);
    return response.data;
  },
  recommendResources: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/recommend/resources', data);
    return response.data;
  },
  adaptLearning: async (data: any): Promise<any> => {
    const response = await api.post('/learning-coach/adapt/learning', data);
    return response.data;
  },
  getAnalytics: async (timeRange = '7d'): Promise<any> => {
    const response = await api.get('/learning-coach/analytics', { params: { time_range: timeRange } });
    return response.data;
  },
  getHistory: async (limit = 20, skip = 0, mode?: string): Promise<any> => {
    const params: any = { limit, skip };
    if (mode) params.mode = mode;
    const response = await api.get('/learning-coach/history', { params });
    return response.data;
  },
  getDetail: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/learning-coach/history/${sessionId}`);
    return response.data;
  },
  getStats: async (): Promise<any> => {
    const response = await api.get('/learning-coach/stats');
    return response.data;
  },
  deleteSession: async (sessionId: string): Promise<any> => {
    const response = await api.delete(`/learning-coach/history/${sessionId}`);
    return response.data;
  },
};

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
  getHistory: async (limit = 20, skip = 0, mode?: string): Promise<any> => {
    const params: any = { limit, skip };
    if (mode) params.mode = mode;
    const response = await api.get('/research-mentor/history', { params });
    return response.data;
  },
  getDetail: async (sessionId: string): Promise<any> => {
    const response = await api.get(`/research-mentor/history/${sessionId}`);
    return response.data;
  },
  getStats: async (): Promise<any> => {
    const response = await api.get('/research-mentor/stats');
    return response.data;
  },
  deleteSession: async (sessionId: string): Promise<any> => {
    const response = await api.delete(`/research-mentor/history/${sessionId}`);
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

export type LegalProvider =
  | "gemini"
  | "anthropic"
  | "claude"
  | "perplexity"
  | "openai"
  | "mistral"
  | "deepseek";

export type LegalMode =
  | "clause_extraction"
  | "risk_analysis"
  | "version_comparison"
  | "plain_language"
  | "compliance_check";

export interface LegalDocumentResponse {
  results: Record<string, any>;
  metadata: {
    analysis_id?: string;
    model_provider?: string;
    model_name?: string;
    processing_time_ms?: number;
    source_kind?: "inline" | "rag_document" | null;
    source_ref?: string | null;
    [key: string]: any;
  };
}

export interface LegalHistoryItem {
  id: string;
  organization_id: string;
  user_id: string;
  mode: LegalMode;
  status: "running" | "ready" | "error";
  title?: string | null;
  content_preview?: string | null;
  source_kind?: "inline" | "rag_document" | null;
  source_ref?: string | null;
  model_provider?: string | null;
  model_name?: string | null;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
  processing_time_ms?: number | null;
  error_message?: string | null;
  created_at: string;
}

export interface LegalHistoryDetail extends LegalHistoryItem {
  result?: Record<string, any>;
}

export interface LegalAnalytics {
  time_range: string;
  total_analyses: number;
  by_mode: Record<string, number>;
  by_model: Array<{ provider: string; model: string; count: number }>;
  average_processing_time_ms: number;
  success_count: number;
  error_count: number;
  success_rate: number;
}

// Shared input shape — every mode takes the same base fields plus a
// few mode-specific toggles.  Drop the old { data: {...} } wrapper.
interface BaseLegalInput {
  content?: string;
  rag_document_id?: string;
  context?: Record<string, any>;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
  provider?: LegalProvider;
  model?: string;
}

export const legalApi = {
  /** Mode-routed entry point. */
  analyze: async (
    payload: BaseLegalInput & { mode: LegalMode }
  ): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>(
      "/legal/analyze",
      payload,
      { timeout: 5 * 60 * 1000 }
    );
    return response.data;
  },

  /** Extract clauses, obligations, deadlines. */
  extractClauses: async (
    payload: BaseLegalInput & {
      include_metadata?: boolean;
      highlight_obligations?: boolean;
      extract_dates?: boolean;
    }
  ): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>(
      "/legal/analyze/clauses",
      payload,
      { timeout: 5 * 60 * 1000 }
    );
    return response.data;
  },

  /** Identify and categorise risks. */
  analyzeRisks: async (
    payload: BaseLegalInput & {
      risk_threshold?: number;
      include_recommendations?: boolean;
      categorize_risks?: boolean;
    }
  ): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>(
      "/legal/analyze/risks",
      payload,
      { timeout: 5 * 60 * 1000 }
    );
    return response.data;
  },

  /** Compare two document versions. */
  compareVersions: async (
    payload: BaseLegalInput & {
      old_version: string;
      new_version: string;
      track_changes?: boolean;
      summarize_changes?: boolean;
    }
  ): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>(
      "/legal/compare/versions",
      payload,
      { timeout: 5 * 60 * 1000 }
    );
    return response.data;
  },

  /** Plain-language summary. */
  plainLanguage: async (
    payload: BaseLegalInput & {
      simplify_terms?: boolean;
      include_examples?: boolean;
      maintain_legal_accuracy?: boolean;
    }
  ): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>(
      "/legal/summarize/plain",
      payload,
      { timeout: 5 * 60 * 1000 }
    );
    return response.data;
  },

  /** Regulatory / contractual compliance check. */
  checkCompliance: async (
    payload: BaseLegalInput & {
      jurisdiction?: string;
      industry_specific?: boolean;
      include_citations?: boolean;
    }
  ): Promise<LegalDocumentResponse> => {
    const response = await api.post<LegalDocumentResponse>(
      "/legal/check/compliance",
      payload,
      { timeout: 5 * 60 * 1000 }
    );
    return response.data;
  },

  /** History (recent analyses for this workspace). */
  listHistory: async (params?: {
    mode?: LegalMode;
    time_range?: "1d" | "7d" | "30d" | "90d" | "1y";
    limit?: number;
    offset?: number;
  }): Promise<{
    analyses: LegalHistoryItem[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await api.get("/legal/history", { params });
    return response.data;
  },

  /** Reopen a past analysis with its full result body. */
  getHistoryItem: async (id: string): Promise<LegalHistoryDetail> => {
    const response = await api.get<LegalHistoryDetail>(`/legal/history/${id}`);
    return response.data;
  },

  /** Soft-delete a past analysis. */
  deleteHistoryItem: async (id: string): Promise<void> => {
    await api.delete(`/legal/history/${id}`);
  },

  /** Workspace analytics powered by real history data. */
  getAnalytics: async (timeRange?: string): Promise<LegalAnalytics> => {
    const response = await api.get<LegalAnalytics>("/legal/analytics", {
      params: { time_range: timeRange || "7d" },
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

// ─── Customer Service API ─────────────────────────────────────────────────

/**
 * Mirrors `backend/api/v1/endpoints/customer_service.py`.  All request
 * routes use `request_type` to dispatch inside a single agent; the
 * specialised endpoints below set it implicitly so callers don't have to.
 */

export type CustomerServiceRequestType =
  | "generate_response"
  | "analyze_feedback"
  | "generate_faq"
  | "create_template"
  | "satisfaction_strategy";

export interface CustomerServiceResponse {
  response: Record<string, any>;
  raw_response: string;
  processed_at: string;
  model_used: string;
  request_type: string;
}

export interface CustomerServiceTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  variables: string[];
  created_at: string;
}

export interface CustomerServiceAnalytics {
  time_range: string;
  total_requests: number;
  average_response_time: number;
  satisfaction_rate: number;
  common_issues: { issue: string; count: number }[];
  template_usage: Record<string, number>;
  feedback_trends: { positive: number; neutral: number; negative: number };
}

export type CustomerServiceTimeRange = "1d" | "7d" | "30d" | "90d" | "1y";

export const customerServiceApi = {
  /** Generic request — content + request_type explicit. Used by AI Draft. */
  process: async (
    content: string,
    request_type: CustomerServiceRequestType,
    context?: Record<string, any>,
    model?: string,
  ): Promise<CustomerServiceResponse> => {
    const response = await api.post<CustomerServiceResponse>(
      "/customer-service/process",
      { content, request_type, context, model },
    );
    return response.data;
  },

  analyzeFeedback: async (params: {
    content: string;
    categories?: string[];
    include_sentiment?: boolean;
    context?: Record<string, any>;
    model?: string;
  }): Promise<CustomerServiceResponse> => {
    const response = await api.post<CustomerServiceResponse>(
      "/customer-service/analyze-feedback",
      {
        content: params.content,
        request_type: "analyze_feedback",
        categories: params.categories,
        include_sentiment: params.include_sentiment ?? true,
        context: params.context,
        model: params.model,
      },
    );
    return response.data;
  },

  generateFaq: async (params: {
    content: string;
    topic: string;
    target_audience?: string;
    style?: string;
    context?: Record<string, any>;
    model?: string;
  }): Promise<CustomerServiceResponse> => {
    const response = await api.post<CustomerServiceResponse>(
      "/customer-service/generate-faq",
      {
        content: params.content,
        request_type: "generate_faq",
        topic: params.topic,
        target_audience: params.target_audience,
        style: params.style ?? "professional",
        context: params.context,
        model: params.model,
      },
    );
    return response.data;
  },

  aiCreateTemplate: async (params: {
    content: string;
    template_category: string;
    variables?: string[];
    tone?: string;
    context?: Record<string, any>;
    model?: string;
  }): Promise<CustomerServiceResponse> => {
    const response = await api.post<CustomerServiceResponse>(
      "/customer-service/create-template",
      {
        content: params.content,
        request_type: "create_template",
        template_category: params.template_category,
        variables: params.variables,
        tone: params.tone ?? "professional_friendly",
        context: params.context,
        model: params.model,
      },
    );
    return response.data;
  },

  satisfactionStrategy: async (params: {
    content: string;
    focus_areas?: string[];
    timeframe?: string;
    priority_level?: string;
    context?: Record<string, any>;
    model?: string;
  }): Promise<CustomerServiceResponse> => {
    const response = await api.post<CustomerServiceResponse>(
      "/customer-service/satisfaction-strategy",
      {
        content: params.content,
        request_type: "satisfaction_strategy",
        focus_areas: params.focus_areas,
        timeframe: params.timeframe,
        priority_level: params.priority_level ?? "medium",
        context: params.context,
        model: params.model,
      },
    );
    return response.data;
  },

  listTemplates: async (
    category?: string,
  ): Promise<CustomerServiceTemplate[]> => {
    const response = await api.get<CustomerServiceTemplate[]>(
      "/customer-service/templates",
      { params: category ? { category } : undefined },
    );
    return response.data;
  },

  getAnalytics: async (
    time_range: CustomerServiceTimeRange = "7d",
  ): Promise<CustomerServiceAnalytics> => {
    const response = await api.get<CustomerServiceAnalytics>(
      "/customer-service/analytics",
      { params: { time_range } },
    );
    return response.data;
  },

  // ─── Tickets (operator-facing, auth required) ─────────────────────────

  listTickets: async (params?: {
    status?: string;
    priority?: string;
    category?: string;
    channel?: string;
    assigned_to_me?: boolean;
    search?: string;
    time_range?: CustomerServiceTimeRange;
    limit?: number;
    offset?: number;
  }): Promise<{ tickets: SupportTicket[]; total: number; limit: number; offset: number }> => {
    const response = await api.get("/customer-service/tickets", { params });
    return response.data;
  },

  getTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await api.get<SupportTicket>(`/customer-service/tickets/${ticketId}`);
    return response.data;
  },

  createTicket: async (payload: {
    customer_email: string;
    customer_name?: string;
    subject: string;
    body: string;
    priority?: "High" | "Medium" | "Low";
    category?: string;
    channel?: string;
    meta?: Record<string, any>;
  }): Promise<SupportTicket> => {
    const response = await api.post<SupportTicket>("/customer-service/tickets", payload);
    return response.data;
  },

  updateTicket: async (
    ticketId: string,
    fields: {
      status?: string;
      priority?: string;
      category?: string;
      assigned_user_id?: string | null;
    },
  ): Promise<SupportTicket> => {
    const response = await api.patch<SupportTicket>(
      `/customer-service/tickets/${ticketId}`,
      fields,
    );
    return response.data;
  },

  deleteTicket: async (ticketId: string): Promise<void> => {
    await api.delete(`/customer-service/tickets/${ticketId}`);
  },

  replyToTicket: async (
    ticketId: string,
    payload: { body: string; template_id?: string; transition_status?: string },
  ): Promise<TicketReply> => {
    const response = await api.post<TicketReply>(
      `/customer-service/tickets/${ticketId}/reply`,
      payload,
    );
    return response.data;
  },

  aiDraft: async (ticketId: string): Promise<{
    ticket_id: string;
    draft: string;
    model_used?: string | null;
    citations: Array<{
      title?: string;
      document_id?: string;
      page_number?: number;
      source?: string;
    }>;
    prior_tickets_used: Array<{ ticket_id?: string; subject?: string }>;
    matching_template_id?: string | null;
  }> => {
    const response = await api.post(`/customer-service/tickets/${ticketId}/ai-draft`);
    return response.data;
  },

  // ─── Templates CRUD ────────────────────────────────────────────────────

  createTemplate: async (payload: {
    name: string;
    category: string;
    body: string;
    tone?: string;
    description?: string;
    variables?: string[];
  }): Promise<CustomerServiceTemplate> => {
    const response = await api.post<CustomerServiceTemplate>(
      "/customer-service/templates",
      payload,
    );
    return response.data;
  },

  updateTemplate: async (
    templateId: string,
    fields: Partial<{
      name: string;
      category: string;
      body: string;
      tone: string;
      description: string;
      variables: string[];
    }>,
  ): Promise<CustomerServiceTemplate> => {
    const response = await api.patch<CustomerServiceTemplate>(
      `/customer-service/templates/${templateId}`,
      fields,
    );
    return response.data;
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    await api.delete(`/customer-service/templates/${templateId}`);
  },

  markTemplateUsed: async (templateId: string): Promise<void> => {
    await api.post(`/customer-service/templates/${templateId}/use`);
  },

  // ─── Branding ──────────────────────────────────────────────────────────

  getBranding: async (): Promise<OrgBranding> => {
    const response = await api.get<OrgBranding>("/customer-service/branding");
    return response.data;
  },

  updateBranding: async (
    payload: Partial<OrgBranding>,
  ): Promise<OrgBranding> => {
    const response = await api.put<OrgBranding>("/customer-service/branding", payload);
    return response.data;
  },

  // ─── FAQ → Knowledge Base ────────────────────────────────────────────

  saveFaqToKnowledgeBase: async (payload: {
    topic: string;
    content: string;
    target_audience?: string;
    tags?: string[];
    publish_as_article?: boolean;
    article_category?: string;
  }): Promise<{
    rag_document_id?: string | null;
    rag_status?: string | null;
    article?: SupportArticle | null;
    topic: string;
  }> => {
    const response = await api.post(
      "/customer-service/faq/save-to-knowledge-base",
      payload,
    );
    return response.data;
  },

  // ─── Help-center articles (operator-side) ────────────────────────────

  listArticles: async (params?: {
    published?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ articles: SupportArticle[]; total: number; limit: number; offset: number }> => {
    const response = await api.get("/customer-service/articles", { params });
    return response.data;
  },

  getArticle: async (articleId: string): Promise<SupportArticle> => {
    const response = await api.get<SupportArticle>(`/customer-service/articles/${articleId}`);
    return response.data;
  },

  createArticle: async (payload: {
    title: string;
    body: string;
    summary?: string;
    category?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
  }): Promise<SupportArticle> => {
    const response = await api.post<SupportArticle>("/customer-service/articles", payload);
    return response.data;
  },

  updateArticle: async (
    articleId: string,
    fields: Partial<{
      title: string;
      body: string;
      summary: string;
      category: string;
      tags: string[];
      slug: string;
      published: boolean;
      featured: boolean;
    }>,
  ): Promise<SupportArticle> => {
    const response = await api.patch<SupportArticle>(
      `/customer-service/articles/${articleId}`,
      fields,
    );
    return response.data;
  },

  deleteArticle: async (articleId: string): Promise<void> => {
    await api.delete(`/customer-service/articles/${articleId}`);
  },
};

// ─── Public (anonymous) portal API ──────────────────────────────────────
// Used by the hosted support portal at /portal/:slug.  These endpoints
// are mounted under /public/* on the backend and require NO auth.  We
// build a fresh axios instance here so we don't accidentally attach
// the Authorization header.

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export const customerServicePublicApi = {
  getBranding: async (slug: string): Promise<PublicBranding> => {
    const response = await publicApi.get<PublicBranding>(
      `/public/portal/${encodeURIComponent(slug)}/branding`,
    );
    return response.data;
  },

  createTicket: async (
    slug: string,
    payload: {
      customer_email: string;
      customer_name?: string;
      subject: string;
      body: string;
      priority?: "High" | "Medium" | "Low";
      category?: string;
      captcha_token?: string;
    },
  ): Promise<{ ticket_id: string; status: string; status_url: string; created_at: string }> => {
    const response = await publicApi.post(
      `/public/portal/${encodeURIComponent(slug)}/tickets`,
      payload,
    );
    return response.data;
  },

  getTicketStatus: async (
    slug: string,
    ticketId: string,
    email: string,
  ): Promise<PublicTicketStatus> => {
    const response = await publicApi.get<PublicTicketStatus>(
      `/public/portal/${encodeURIComponent(slug)}/tickets/${encodeURIComponent(ticketId)}/status`,
      { params: { email } },
    );
    return response.data;
  },

  postCustomerReply: async (
    slug: string,
    ticketId: string,
    payload: { customer_email: string; body: string },
  ): Promise<{ id: string; created_at: string }> => {
    const response = await publicApi.post(
      `/public/portal/${encodeURIComponent(slug)}/tickets/${encodeURIComponent(ticketId)}/replies`,
      payload,
    );
    return response.data;
  },

  // ─── Help center (anonymous) ──────────────────────────────────────────

  listHelpArticles: async (
    slug: string,
    params?: { category?: string; limit?: number },
  ): Promise<{ branding: PublicBranding; articles: PublicSupportArticle[] }> => {
    const response = await publicApi.get(
      `/public/portal/${encodeURIComponent(slug)}/help`,
      { params },
    );
    return response.data;
  },

  getHelpArticle: async (
    slug: string,
    articleSlug: string,
  ): Promise<{ branding: PublicBranding; article: PublicSupportArticle }> => {
    const response = await publicApi.get(
      `/public/portal/${encodeURIComponent(slug)}/help/${encodeURIComponent(articleSlug)}`,
    );
    return response.data;
  },

  voteHelpArticle: async (
    slug: string,
    articleSlug: string,
    helpful: boolean,
  ): Promise<void> => {
    await publicApi.post(
      `/public/portal/${encodeURIComponent(slug)}/help/${encodeURIComponent(articleSlug)}/vote`,
      null,
      { params: { helpful } },
    );
  },
};

// ─── Customer Service types ─────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  organization_id: string;
  customer_email: string;
  customer_name?: string | null;
  subject: string;
  body: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Cancelled";
  category?: string | null;
  channel: string;
  sentiment_score?: number | null;
  assigned_user_id?: string | null;
  submitter_user_id?: string | null;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  replies?: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  organization_id: string;
  author_type: "operator" | "customer" | "agent_ai";
  author_user_id?: string | null;
  author_display_name?: string | null;
  body: string;
  template_id?: string | null;
  ai_draft_meta?: Record<string, any> | null;
  created_at: string;
}

export interface OrgBranding {
  organization_id?: string;
  slug: string;
  display_name: string;
  logo_url?: string | null;
  primary_color: string;
  accent_color: string;
  hero_copy?: string | null;
  support_email?: string | null;
  sla_response_minutes: number;
  captcha_enabled: boolean;
  public_categories: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PublicBranding {
  slug: string;
  display_name: string;
  logo_url?: string | null;
  primary_color: string;
  accent_color: string;
  hero_copy?: string | null;
  support_email?: string | null;
  sla_response_minutes: number;
  captcha_enabled: boolean;
  public_categories: string[];
}

export interface PublicTicketReplyView {
  author_type: "operator" | "agent_ai";
  author_display_name?: string | null;
  body: string;
  created_at: string;
  is_ai: boolean;
}

export interface PublicTicketStatus {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  replies: PublicTicketReplyView[];
}

export interface SupportArticle {
  id: string;
  organization_id?: string;
  slug: string;
  title: string;
  summary?: string | null;
  body: string;
  category?: string | null;
  tags: string[];
  published: boolean;
  featured: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count?: number;
  rag_document_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
}

// Public-facing variant (operator-only fields stripped server-side).
export interface PublicSupportArticle {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  body: string;
  category?: string | null;
  tags: string[];
  published: boolean;
  featured: boolean;
  view_count: number;
  helpful_count: number;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
}

// ─── Data Analysis Agent ──────────────────────────────────────────────

export type DataAnalysisMode =
  | "exploratory"
  | "statistical"
  | "visualization"
  | "anomaly"
  | "trend"
  | "report";

export type DataAnalysisStatus = "pending" | "processing" | "ready" | "error";

export type DataAnalysisTimeRange = "1d" | "7d" | "30d" | "90d" | "1y";

export interface DataAnalysisColumn {
  name: string;
  dtype: string;
  null_count?: number;
  unique_count?: number;
}

export interface DataAnalysisInsight {
  text: string;
  type?: "positive" | "negative" | "neutral";
}

export type DataAnalysisChartType = "bar" | "line" | "pie" | "area" | "scatter";

export interface DataAnalysisVisualization {
  type: DataAnalysisChartType | string;
  title: string;
  x_axis: string;
  y_axis: string;
  data: Array<{ x?: any; y?: any; name?: any; value?: any }>;
}

export interface DataAnalysisSummaryStats {
  count: number;
  primary_column?: string;
  mean?: number | string | null;
  median?: number | string | null;
  std?: number | string | null;
  min?: number | string | null;
  max?: number | string | null;
  per_column?: Record<string, {
    mean?: number | string | null;
    median?: number | string | null;
    std?: number | string | null;
    min?: number | string | null;
    max?: number | string | null;
    count?: number;
  }>;
}

export interface DataAnalysisQuestionTurn {
  question: string;
  answer: string;
  model_used?: string | null;
  asked_at: string;
}

export interface DataAnalysisRun {
  id: string;
  organization_id: string;
  user_id: string;
  mode: DataAnalysisMode;
  status: DataAnalysisStatus;
  s3_key: string;
  filename: string;
  original_filename?: string | null;
  content_type?: string | null;
  size_bytes: number;
  row_count?: number | null;
  column_count?: number | null;
  columns: DataAnalysisColumn[];
  preview_rows: Array<Record<string, any>>;
  summary_stats?: DataAnalysisSummaryStats | null;
  visualizations: DataAnalysisVisualization[];
  anomalies?: {
    by_column?: Record<string, {
      mean?: number | null;
      std?: number | null;
      z_outlier_count?: number;
      iqr_outlier_count?: number;
      z_threshold?: number;
      iqr_lower?: number | null;
      iqr_upper?: number | null;
      samples?: Array<{ row: number; value: any }>;
    }>;
    summary?: { total_z_outliers?: number; columns_checked?: number };
  } | null;
  trends?: Record<string, {
    rolling_window?: number;
    rolling_average?: number[];
    first_quarter_mean?: number | null;
    last_quarter_mean?: number | null;
    delta?: number | null;
    direction?: "increasing" | "decreasing" | "flat";
  }> | null;
  statistical_results?: {
    per_column?: Record<string, {
      mean?: number | null;
      median?: number | null;
      std?: number | null;
      min?: number | null;
      max?: number | null;
      skew?: number | null;
      kurtosis?: number | null;
      count?: number;
    }>;
    tests?: Array<{
      test?: string;
      column?: string;
      t_statistic?: number | null;
      p_value?: number | null;
      significant_at_0_05?: boolean;
      warning?: string;
    }>;
  } | null;
  insights: DataAnalysisInsight[];
  ai_summary?: string | null;
  question_history?: DataAnalysisQuestionTurn[];
  processing_time_ms?: number | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

// Lighter shape returned by GET /runs (omits heavy JSONB fields).
export interface DataAnalysisRunListItem {
  id: string;
  organization_id: string;
  user_id: string;
  mode: DataAnalysisMode;
  status: DataAnalysisStatus;
  filename: string;
  original_filename?: string | null;
  content_type?: string | null;
  size_bytes: number;
  row_count?: number | null;
  column_count?: number | null;
  processing_time_ms?: number | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataAnalysisAnalytics {
  time_range: string;
  total_analyses: number;
  average_processing_time: number;
  mode_usage: Record<string, number>;
  file_types: Record<string, number>;
  error_rate: number;
  quality_metrics: {
    ready: number;
    error: number;
    processing: number;
    pending: number;
  };
}

export const dataAnalysisApi = {
  /**
   * Upload a CSV / XLSX / JSON file. The backend persists it to object
   * storage, creates a run row, and runs the analysis pipeline
   * synchronously, returning the full run dict with results populated.
   */
  upload: async (
    file: File,
    mode: DataAnalysisMode = "exploratory",
  ): Promise<DataAnalysisRun> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<DataAnalysisRun>(
      "/data-analysis/upload",
      formData,
      {
        params: { mode },
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 5 * 60 * 1000, // 5 minutes for large uploads + analysis
      },
    );
    return response.data;
  },

  listRuns: async (params?: {
    status?: DataAnalysisStatus;
    mode?: DataAnalysisMode;
    time_range?: DataAnalysisTimeRange;
    limit?: number;
    offset?: number;
  }): Promise<{
    runs: DataAnalysisRunListItem[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await api.get("/data-analysis/runs", { params });
    return response.data;
  },

  getRun: async (runId: string): Promise<DataAnalysisRun> => {
    const response = await api.get<DataAnalysisRun>(
      `/data-analysis/runs/${runId}`,
    );
    return response.data;
  },

  deleteRun: async (runId: string): Promise<void> => {
    await api.delete(`/data-analysis/runs/${runId}`);
  },

  askAboutData: async (
    runId: string,
    question: string,
  ): Promise<DataAnalysisQuestionTurn> => {
    const response = await api.post<DataAnalysisQuestionTurn>(
      `/data-analysis/runs/${runId}/ask`,
      { question },
    );
    return response.data;
  },

  regenerate: async (
    runId: string,
    mode: DataAnalysisMode,
  ): Promise<DataAnalysisRun> => {
    const response = await api.post<DataAnalysisRun>(
      `/data-analysis/runs/${runId}/regenerate`,
      { mode },
      { timeout: 5 * 60 * 1000 },
    );
    return response.data;
  },

  getAnalytics: async (
    time_range: DataAnalysisTimeRange = "7d",
  ): Promise<DataAnalysisAnalytics> => {
    const response = await api.get<DataAnalysisAnalytics>(
      "/data-analysis/analytics",
      { params: { time_range } },
    );
    return response.data;
  },
};

// ─── Knowledge Graph ──────────────────────────────────────────────────

export type KGNodeType =
  | "concept"
  | "person"
  | "project"
  | "document"
  | "event"
  | "organization"
  | "location"
  | "resource";

export type KGRelationType =
  | "related_to"
  | "part_of"
  | "created_by"
  | "mentions"
  | "influences"
  | "collaborates_with"
  | "occurs_in"
  | "references"
  | "similar_to"
  | "depends_on";

export type KGActionLabel = "extract" | "discover" | "fill_gaps";
export type KGExtractionStatus = "ready" | "error";

export interface KGStats {
  node_count: number;
  edge_count: number;
  node_types: Record<string, number>;
  relation_types: Record<string, number>;
  last_updated_at?: string | null;
}

export interface KGExtraction {
  id: string;
  organization_id: string;
  user_id: string;
  action: KGActionLabel;
  status: KGExtractionStatus;
  title?: string | null;
  source_kind?: string | null;
  source_ref?: string | null;
  content_preview?: string | null;
  node_ids: string[];
  edge_ids: string[];
  node_count: number;
  edge_count: number;
  processing_time_ms?: number | null;
  error_message?: string | null;
  created_at: string;
}

export interface KGVisualizationNode {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  properties?: Record<string, any>;
}

export interface KGVisualizationEdge {
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export interface KGVisualization {
  visualization: {
    nodes: KGVisualizationNode[];
    edges: KGVisualizationEdge[];
  };
  metadata: {
    node_count: number;
    edge_count: number;
    generated_at: string;
    extraction_id?: string;
    added_node_count?: number;
    added_edge_count?: number;
    processing_time_ms?: number;
  };
}

export interface KGAgentResult<T = any> {
  results: T;
  metadata: {
    action?: string;
    timestamp?: string;
    graph_stats?: KGStats;
    parameters?: Record<string, any>;
    extraction_id?: string;
    added_node_count?: number;
    added_edge_count?: number;
    added_node_ids?: string[];
    added_edge_ids?: string[];
    processing_time_ms?: number;
  };
}

export const knowledgeGraphApi = {
  /**
   * Extract knowledge from inline text OR an already-uploaded RAG
   * document. Exactly one of `content` / `rag_document_id` is required.
   */
  extract: async (params: {
    content?: string;
    rag_document_id?: string;
    source?: Record<string, any>;
    metadata?: Record<string, any>;
    context?: Record<string, any>;
    parameters?: Record<string, any>;
  }): Promise<KGAgentResult> => {
    const response = await api.post<KGAgentResult>(
      "/knowledge-graph/extract",
      params,
      { timeout: 5 * 60 * 1000 }, // 5 min ceiling for very long extractions
    );
    return response.data;
  },

  discoverRelations: async (params: {
    focus: string[];
    context?: Record<string, any>;
    constraints?: Record<string, any>;
    parameters?: Record<string, any>;
  }): Promise<KGAgentResult> => {
    const response = await api.post<KGAgentResult>(
      "/knowledge-graph/discover-relations",
      params,
      { timeout: 5 * 60 * 1000 },
    );
    return response.data;
  },

  fillGaps: async (params: {
    focus: string[];
    context?: Record<string, any>;
    parameters?: Record<string, any>;
  }): Promise<KGAgentResult> => {
    const response = await api.post<KGAgentResult>(
      "/knowledge-graph/fill-gaps",
      params,
      { timeout: 5 * 60 * 1000 },
    );
    return response.data;
  },

  query: async (params: {
    query_type: "path" | "neighbors" | "search" | "subgraph";
    query: Record<string, any>;
    parameters?: Record<string, any>;
  }): Promise<KGAgentResult> => {
    const response = await api.post<KGAgentResult>(
      "/knowledge-graph/query",
      params,
    );
    return response.data;
  },

  visualize: async (params?: {
    focus?: string[];
    parameters?: Record<string, any>;
  }): Promise<KGVisualization> => {
    const response = await api.post<KGAgentResult<KGVisualization>>(
      "/knowledge-graph/visualize",
      params || {},
    );
    // The agent returns { results: { visualization, metadata } }.
    // Flatten to a more direct shape for the frontend.
    const inner = response.data.results as any;
    return {
      visualization: inner?.visualization || { nodes: [], edges: [] },
      metadata: { ...(inner?.metadata || {}), ...(response.data.metadata || {}) },
    };
  },

  getStats: async (): Promise<KGStats> => {
    const response = await api.get<KGStats>("/knowledge-graph/stats");
    return response.data;
  },

  getNodeTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>("/knowledge-graph/node-types");
    return response.data;
  },

  getRelationTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>("/knowledge-graph/relation-types");
    return response.data;
  },

  listExtractions: async (params?: {
    action?: KGActionLabel;
    time_range?: "1d" | "7d" | "30d" | "90d" | "1y";
    limit?: number;
    offset?: number;
  }): Promise<{
    extractions: KGExtraction[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await api.get("/knowledge-graph/extractions", { params });
    return response.data;
  },

  deleteExtraction: async (extractionId: string): Promise<void> => {
    await api.delete(`/knowledge-graph/extractions/${extractionId}`);
  },
};

// Export the api instance for custom requests
export default api;