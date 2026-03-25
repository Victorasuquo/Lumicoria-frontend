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

// Export the api instance for custom requests
export default api;