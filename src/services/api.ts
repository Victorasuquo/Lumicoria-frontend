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
    if (error.response?.status === 401 && !originalRequest._retry) {
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
    const response = await api.post<AuthResponse>('/auth/login', credentials);
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
  title: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
  user_id: string;
  status: string;
  extracted_items?: number;
  tasks_created?: number;
}

export interface DocumentUploadResponse {
  document: Document;
  message: string;
}

export const documentApi = {
  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<DocumentUploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  analyzeDocument: async (id: string): Promise<any> => {
    const response = await api.post<any>(`/documents/analyze`, { document_id: id });
    return response.data;
  },

  summarizeDocument: async (id: string): Promise<any> => {
    const response = await api.post<any>(`/documents/summarize`, { document_id: id });
    return response.data;
  }
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
  }
};

// Wellbeing API
export interface WellbeingMetric {
  id: string;
  type: string;
  value: number;
  timestamp: string;
  user_id: string;
}

export interface WellbeingGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface WellbeingRecommendation {
  id: string;
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export const wellbeingApi = {
  getMetrics: async (): Promise<WellbeingMetric[]> => {
    const response = await api.get<WellbeingMetric[]>('/wellbeing/metrics');
    return response.data;
  },

  submitMetric: async (data: Partial<WellbeingMetric>): Promise<WellbeingMetric> => {
    const response = await api.post<WellbeingMetric>('/wellbeing/metrics', data);
    return response.data;
  },

  getGoals: async (): Promise<WellbeingGoal[]> => {
    const response = await api.get<WellbeingGoal[]>('/wellbeing/goals');
    return response.data;
  },

  createGoal: async (data: Partial<WellbeingGoal>): Promise<WellbeingGoal> => {
    const response = await api.post<WellbeingGoal>('/wellbeing/goals', data);
    return response.data;
  },

  getRecommendations: async (): Promise<WellbeingRecommendation[]> => {
    const response = await api.get<WellbeingRecommendation[]>('/wellbeing/recommendations');
    return response.data;
  },

  getBreakRecommendation: async (): Promise<any> => {
    const response = await api.get<any>('/wellbeing/break-recommendation');
    return response.data;
  }
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

export const studentApi = {
  getAssignmentHelp: async (request: StudentRequest): Promise<any> => {
    const response = await api.post<any>('/student/assignment-help', request);
    return response.data;
  },

  getStudyPlan: async (request: StudentRequest): Promise<any> => {
    const response = await api.post<any>('/student/study-plan', request);
    return response.data;
  },

  explainConcept: async (request: StudentRequest): Promise<any> => {
    const response = await api.post<any>('/student/explain-concept', request);
    return response.data;
  },

  conductResearch: async (request: StudentRequest): Promise<any> => {
    const response = await api.post<any>('/student/research', request);
    return response.data;
  }
};

// Meeting agent API
export const meetingApi = {
  processMeeting: async (data: any): Promise<any> => {
    const response = await api.post<any>('/meeting/process', data);
    return response.data;
  },

  uploadMeetingRecording: async (file: File, metadata: any): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await api.post<any>('/meeting/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateStatusUpdate: async (data: any): Promise<any> => {
    const response = await api.post<any>('/meeting/status-update', data);
    return response.data;
  }
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

export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponseData> => {
    const response = await api.post<ChatResponseData>('/lumicoria/chat', data);
    return response.data;
  },

  listConversations: async (limit: number = 50, offset: number = 0): Promise<ConversationSummary[]> => {
    const response = await api.get<ConversationSummary[]>('/lumicoria/conversations', {
      params: { limit, offset },
    });
    return response.data;
  },

  getConversation: async (conversationId: string): Promise<any> => {
    const response = await api.get<any>(`/lumicoria/conversations/${conversationId}`);
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/lumicoria/conversations/${conversationId}`);
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
};

// Export the api instance for custom requests
export default api;