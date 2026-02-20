import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { chatApi, ConversationSummary } from '../services/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
    Send,
    Plus,
    Trash2,
    Loader2,
    Sparkles,
    AlertTriangle,
    X,
    PaperclipIcon,
    Link as LinkIcon,
    FileText as FileTextIcon,
    ChevronDown,
    ChevronRight,
    Search,
    MessageSquare,
    Zap,
    Brain,
    Globe,
    BookOpen,
    Users,
    Shield,
    Smile,
    Music,
    BarChart,
    Languages,
    Clock,
    Star,
    PanelLeftClose,
    PanelLeft,
    Check,
    Copy,
    ThumbsUp,
    FileDown,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agent?: string;
    timestamp: string;
    sources?: any[];
    processing_time?: number;
}

interface FileAttachment {
    file: File;
    id: string;
    name: string;
    size: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AGENT_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    general: { label: 'General', color: '#6C4AB0', icon: <Brain size={11} /> },
    research: { label: 'Research', color: '#2563eb', icon: <Search size={11} /> },
    research_mentor: { label: 'Research Mentor', color: '#7c3aed', icon: <BookOpen size={11} /> },
    document: { label: 'Document', color: '#0891b2', icon: <FileTextIcon size={11} /> },
    meeting: { label: 'Meeting', color: '#0d9488', icon: <Users size={11} /> },
    meeting_fact_checker: { label: 'Fact Checker', color: '#059669', icon: <Check size={11} /> },
    creative: { label: 'Creative', color: '#d946ef', icon: <Sparkles size={11} /> },
    social_media: { label: 'Social Media', color: '#ec4899', icon: <Globe size={11} /> },
    student: { label: 'Student', color: '#f97316', icon: <BookOpen size={11} /> },
    learning_coach: { label: 'Learning Coach', color: '#eab308', icon: <Star size={11} /> },
    rag: { label: 'Knowledge Base', color: '#06b6d4', icon: <Brain size={11} /> },
    data_analysis: { label: 'Data Analysis', color: '#8b5cf6', icon: <BarChart size={11} /> },
    knowledge_graph: { label: 'Knowledge Graph', color: '#14b8a6', icon: <Zap size={11} /> },
    legal_document: { label: 'Legal', color: '#64748b', icon: <Shield size={11} /> },
    translation: { label: 'Translation', color: '#3b82f6', icon: <Languages size={11} /> },
    customer_service: { label: 'Support', color: '#10b981', icon: <MessageSquare size={11} /> },
    ethics_bias: { label: 'Ethics & Bias', color: '#f43f5e', icon: <Shield size={11} /> },
    wellbeing: { label: 'Wellbeing', color: '#22c55e', icon: <Smile size={11} /> },
    focus_flow: { label: 'Focus Flow', color: '#a855f7', icon: <Music size={11} /> },
    workspace_ergonomics: { label: 'Ergonomics', color: '#78716c', icon: <Clock size={11} /> },
    vision: { label: 'Vision', color: '#0ea5e9', icon: <Globe size={11} /> },
};

const SUGGESTION_PROMPTS = [
    { icon: <FileTextIcon size={14} />, text: 'Summarize a document for me', color: '#6C4AB0' },
    { icon: <Search size={14} />, text: 'Help me research a topic', color: '#0EA5E9' },
    { icon: <Sparkles size={14} />, text: 'Write a LinkedIn post', color: '#d946ef' },
    { icon: <BookOpen size={14} />, text: 'Create a study plan', color: '#f97316' },
    { icon: <BarChart size={14} />, text: 'Analyze this data', color: '#8b5cf6' },
    { icon: <Globe size={14} />, text: 'Translate this to Spanish', color: '#0891b2' },
];

// ─── Date grouping helpers ────────────────────────────────────────────────────

function groupConversationsByDate(convs: ConversationSummary[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);

    const groups: Record<string, ConversationSummary[]> = {
        Today: [],
        Yesterday: [],
        'Previous 7 Days': [],
        Older: [],
    };

    for (const c of convs) {
        const d = c.updated_at ? new Date(c.updated_at) : null;
        if (!d) { groups['Older'].push(c); continue; }
        if (d >= today) groups['Today'].push(c);
        else if (d >= yesterday) groups['Yesterday'].push(c);
        else if (d >= sevenDaysAgo) groups['Previous 7 Days'].push(c);
        else groups['Older'].push(c);
    }
    return groups;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const AgentBadge: React.FC<{ agent: string }> = ({ agent }) => {
    const meta = AGENT_META[agent] ?? { label: agent, color: '#6C4AB0', icon: <Brain size={11} /> };
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border mb-1.5"
            style={{
                color: meta.color,
                borderColor: `${meta.color}33`,
                background: `${meta.color}10`,
            }}
        >
            {meta.icon}
            {meta.label}
        </span>
    );
};

const TypingIndicator: React.FC<{ agent: string }> = ({ agent }) => {
    return (
        <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm bg-gray-900 overflow-hidden border border-gray-800/20">
                <img
                    src="/images/lumicoria-logo-mono.png"
                    alt="Lumicoria"
                    className="w-5 h-5 object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <AgentBadge agent={agent} />
                <div className="flex items-center gap-1 ml-1">
                    {[0, 150, 300].map((delay) => (
                        <span
                            key={delay}
                            className="w-1.5 h-1.5 bg-lumicoria-purple/50 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChatBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const meta = AGENT_META[msg.agent ?? 'general'] ?? AGENT_META['general'];
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);

    const handleCopy = () => {
        const text = msg.content;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            // Modern API (iOS 14.5+, Chrome, Firefox)
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text: string) => {
        // Legacy execCommand fallback for older iOS Safari
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* silent — clipboard unavailable */ }
    };

    const handleExportWord = () => {
        const titleRaw = msg.content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 80) || 'Lumicoria Response';
        const safeTitle = titleRaw.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
        const body = msg.content
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            .replace(/\n{2,}/g, '</p><p>');
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;margin:2cm}h1{font-size:16pt}h2{font-size:13pt}h3{font-size:12pt}code{font-family:Consolas,monospace;background:#f0f0f0;padding:2px 4px}li{margin-bottom:4px}</style></head><body><p>${body}</p></body></html>`;
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titleRaw.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'lumicoria-response'}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isUser) {
        return (
            <div className="flex items-end justify-end">
                <div className="flex flex-col items-end max-w-[75%] md:max-w-[60%]">
                    <div
                        className="px-4 py-3 rounded-2xl rounded-br-sm text-white text-sm leading-relaxed shadow-md"
                        style={{ background: 'linear-gradient(135deg, #6C4AB0 0%, #9B87F5 100%)' }}
                    >
                        <p className="whitespace-pre-wrap break-words font-normal tracking-tight">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mr-1 tabular-nums">{time}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[70%] group">
            {/* AI avatar — BW mono logo */}
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-0.5 bg-gray-900 overflow-hidden border border-gray-800/20">
                <img
                    src="/images/lumicoria-logo-mono.png"
                    alt="Lumicoria"
                    className="w-5 h-5 object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
            </div>

            <div className="flex flex-col items-start min-w-0 flex-1">
                {msg.agent && <AgentBadge agent={msg.agent} />}

                {msg.content === '' ? (
                    /* Pure floating indicator — no card, just text + dots */
                    <div className="flex items-center gap-2 mt-1 ml-1">
                        <span className="text-[12px] text-gray-400 font-medium">Thinking</span>
                        {[0, 160, 320].map((delay) => (
                            <span
                                key={delay}
                                className="w-1.5 h-1.5 rounded-full bg-lumicoria-purple/50 animate-bounce"
                                style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 w-full">
                        <div className="ai-markdown">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >{msg.content}</ReactMarkdown>
                        </div>

                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1.5">Sources</p>
                                <div className="flex flex-wrap gap-1">
                                    {msg.sources.slice(0, 3).map((s: any, i: number) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-[10px] text-gray-600"
                                        >
                                            <LinkIcon size={9} />
                                            {s.title ?? s.source ?? `Source ${i + 1}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action bar — appears on hover */}
                <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                        onClick={handleCopy}
                        title={copied ? 'Copied!' : 'Copy response'}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-700 hover:bg-white/70 border border-transparent hover:border-gray-200 transition-all"
                    >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                        onClick={() => setLiked((p) => !p)}
                        title={liked ? 'Unlike' : 'Like this response'}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all ${liked
                            ? 'text-green-600 bg-green-50 border-green-200'
                            : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-white/70 hover:border-gray-200'
                            }`}
                    >
                        <ThumbsUp size={12} />
                        <span>{liked ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                        onClick={handleExportWord}
                        title="Export as Word document"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                    >
                        <FileDown size={12} />
                        <span>Export</span>
                    </button>

                    <span className="text-[10px] text-gray-300 ml-2">{time}</span>
                    {msg.processing_time != null && (
                        <span className="text-[10px] text-gray-300">· {msg.processing_time}s</span>
                    )}
                </div>
            </div>
        </div>
    );
};


// ─── Main Component ───────────────────────────────────────────────────────────

const Chat: React.FC = () => {
    const { user } = useAuth();

    // Core state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentAgent, setCurrentAgent] = useState<string>('general');
    const [error, setError] = useState<string | null>(null);

    // Attachment state
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isAddingUrl, setIsAddingUrl] = useState(false);

    // Sidebar section collapse state
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    // Auto-scroll
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachBtnRef = useRef<HTMLButtonElement>(null);

    // ── Data loading ──────────────────────────────────────────────────────────

    const loadConversations = useCallback(async () => {
        try {
            const data = await chatApi.listConversations(50);
            // Deduplicate by conversation_id — prevents double-highlight if API returns duplicates
            const seen = new Set<string>();
            const unique = data.filter((c: ConversationSummary) => {
                if (seen.has(c.conversation_id)) return false;
                seen.add(c.conversation_id);
                return true;
            });
            setConversations(unique);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    // ── Auto-scroll ───────────────────────────────────────────────────────────

    const scrollToBottom = useCallback((force = false) => {
        const el = messagesAreaRef.current;
        if (!el) return;
        if (force || !userScrolledUp) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
    }, [userScrolledUp]);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const handleMessagesScroll = useCallback(() => {
        const el = messagesAreaRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        setUserScrolledUp(!atBottom);
    }, []);

    // ── Textarea auto-resize ──────────────────────────────────────────────────

    const adjustTextarea = useCallback(() => {
        const ta = inputRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }, []);

    useEffect(() => { adjustTextarea(); }, [input, adjustTextarea]);

    // ── Conversation management ───────────────────────────────────────────────

    const startNewConversation = useCallback(() => {
        setConversationId(null);
        setMessages([]);
        setCurrentAgent('general');
        setError(null);
        setAttachments([]);
        setInput('');
        setUserScrolledUp(false);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const loadConversation = useCallback(async (convId: string) => {
        try {
            setError(null);
            const data = await chatApi.getConversation(convId);
            setConversationId(convId);
            setMessages(
                (data.messages ?? [])
                    .filter((m: any) => m.content && m.content.trim().length > 0)
                    .map((m: any, idx: number) => ({
                        id: `${convId}-${idx}`,
                        role: m.role,
                        content: m.content,
                        agent: m.agent,
                        timestamp: m.timestamp ?? new Date().toISOString(),
                    }))
            );
            const lastAgent = data.agent_history?.[data.agent_history.length - 1];
            if (lastAgent) setCurrentAgent(lastAgent);
            setUserScrolledUp(false);
        } catch {
            setError('Failed to load conversation.');
        }
    }, []);

    const deleteConversation = useCallback(async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await chatApi.deleteConversation(convId);
            setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
            if (conversationId === convId) startNewConversation();
        } catch {
            setError('Failed to delete conversation.');
        }
    }, [conversationId, startNewConversation]);

    // ── File attachment ───────────────────────────────────────────────────────

    const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newAttachments: FileAttachment[] = files.map((f) => ({
            file: f,
            id: `${Date.now()}-${f.name}`,
            name: f.name,
            size: f.size,
            status: 'pending',
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
        setIsAttachMenuOpen(false);
        e.target.value = '';
    }, []);

    const removeAttachment = useCallback((id: string) => {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const uploadAttachments = useCallback(async (attachs: FileAttachment[]) => {
        const pending = attachs.filter((a) => a.status === 'pending');
        for (const att of pending) {
            setAttachments((prev) =>
                prev.map((a) => (a.id === att.id ? { ...a, status: 'uploading' } : a))
            );
            try {
                await chatApi.uploadDocument(att.file);
                setAttachments((prev) =>
                    prev.map((a) => (a.id === att.id ? { ...a, status: 'done' } : a))
                );
            } catch {
                setAttachments((prev) =>
                    prev.map((a) => (a.id === att.id ? { ...a, status: 'error', error: 'Upload failed' } : a))
                );
            }
        }
    }, []);

    const handleAddUrl = useCallback(async () => {
        const url = urlInput.trim();
        if (!url) return;
        setIsAddingUrl(true);
        try {
            await chatApi.addDocumentUrl(url);
            setUrlInput('');
            setIsAttachMenuOpen(false);
        } catch {
            setError('Failed to add URL.');
        } finally {
            setIsAddingUrl(false);
        }
    }, [urlInput]);

    // ── Send message ───────────────────────────────────────────────────────────

    const sendMessage = useCallback(async () => {
        const trimmed = input.trim();
        if ((!trimmed && attachments.filter((a) => a.status === 'pending').length === 0) || isLoading) return;

        setError(null);
        setUserScrolledUp(false);
        setTimeout(() => {
            const el = messagesAreaRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }, 80);

        if (attachments.some((a) => a.status === 'pending')) {
            await uploadAttachments(attachments);
        }

        if (!trimmed) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        if (inputRef.current) inputRef.current.style.height = 'auto';

        const assistantId = `assistant-${Date.now()}`;
        const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api/v1';
        const token = localStorage.getItem('accessToken');

        try {
            const res = await fetch(`${BASE}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    query: trimmed,
                    conversation_id: conversationId ?? undefined,
                    save_to_context: true,
                }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error((errJson as any)?.detail ?? `HTTP ${res.status}`);
            }

            if (!res.body) throw new Error('No stream body from server');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';

            // Immediately flush loading state and insert blank assistant placeholder
            setIsLoading(false);
            setMessages((prev) => [
                ...prev,
                { id: assistantId, role: 'assistant' as const, content: '', agent: 'general', timestamp: new Date().toISOString() },
            ]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6).trim();
                    if (!raw) continue;
                    try {
                        const frame = JSON.parse(raw);
                        if (frame.type === 'meta') {
                            if (!conversationId) setConversationId(frame.conversation_id);
                            setCurrentAgent(frame.agent_used ?? 'general');
                            setMessages((prev) =>
                                prev.map((m) => m.id === assistantId ? { ...m, agent: frame.agent_used ?? 'general' } : m)
                            );
                        } else if (frame.type === 'delta') {
                            const chunk: string = frame.text ?? '';
                            setMessages((prev) =>
                                prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
                            );
                            const el = messagesAreaRef.current;
                            if (el) el.scrollTo({ top: el.scrollHeight });
                        } else if (frame.type === 'done') {
                            setMessages((prev) =>
                                prev.map((m) => m.id === assistantId ? { ...m, processing_time: frame.processing_time } : m)
                            );
                            loadConversations();
                        } else if (frame.type === 'error') {
                            setError(frame.message ?? 'Stream error');
                        }
                    } catch { /* skip malformed frames */ }
                }
            }
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong.');
            setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.content === '')));
        } finally {
            setIsLoading(false);
        }
    }, [input, attachments, isLoading, conversationId, uploadAttachments, loadConversations]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // ── Grouped conversations ─────────────────────────────────────────────────

    const groupedConversations = useMemo(
        () => groupConversationsByDate(conversations),
        [conversations]
    );

    const toggleGroup = (label: string) =>
        setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));

    const agentMeta = AGENT_META[currentAgent] ?? AGENT_META['general'];

    const firstNameOfUser = user?.full_name?.split(' ')[0] ?? 'there';

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 overflow-hidden" style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}>

            {/* ══════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════ */}
            <aside
                className={cn(
                    'flex flex-col flex-shrink-0 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-sm transition-all duration-300 overflow-hidden',
                    isSidebarOpen ? 'w-72' : 'w-0'
                )}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100/80">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lumicoria-purple to-lumicoria-lightPurple flex items-center justify-center shadow-sm">
                            <MessageSquare size={13} color="white" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-800 tracking-tight">Conversations</h2>
                    </div>
                    <button
                        onClick={startNewConversation}
                        title="New Chat"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-lumicoria-purple bg-lumicoria-purple/10 hover:bg-lumicoria-purple/15 rounded-full transition-colors border border-lumicoria-purple/20"
                    >
                        <Plus size={13} />
                        New
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                    {conversations.length === 0 && (
                        <div className="py-12 text-center">
                            <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-xs text-gray-400 font-medium">No conversations yet</p>
                            <p className="text-[11px] text-gray-300 mt-1">Start chatting to see your history</p>
                        </div>
                    )}

                    {(Object.entries(groupedConversations) as [string, ConversationSummary[]][]).map(
                        ([label, items]) => {
                            if (!items.length) return null;
                            const collapsed = collapsedGroups[label];
                            return (
                                <div key={label} className="mb-1">
                                    <button
                                        onClick={() => toggleGroup(label)}
                                        className="flex items-center gap-1 w-full px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-500 transition-colors"
                                    >
                                        {collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                                        {label}
                                    </button>

                                    {!collapsed && items.map((conv) => (
                                        <button
                                            key={conv.conversation_id}
                                            onClick={() => loadConversation(conv.conversation_id)}
                                            className={cn(
                                                'group flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150',
                                                conversationId === conv.conversation_id
                                                    ? 'bg-lumicoria-purple/10 border border-lumicoria-purple/20'
                                                    : 'hover:bg-gray-50/80 border border-transparent'
                                            )}
                                        >
                                            <div
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{
                                                    background: conversationId === conv.conversation_id
                                                        ? '#6C4AB0'
                                                        : '#D1D5DB',
                                                }}
                                            />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium truncate leading-snug',
                                                        conversationId === conv.conversation_id
                                                            ? 'text-lumicoria-purple'
                                                            : 'text-gray-700'
                                                    )}
                                                >
                                                    {conv.title || 'New conversation'}
                                                </span>
                                                {conv.preview && (
                                                    <span className="text-[10px] text-gray-400 truncate leading-snug mt-0.5">
                                                        {conv.preview}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => deleteConversation(conv.conversation_id, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </button>
                                    ))}
                                </div>
                            );
                        }
                    )}
                </div>
            </aside>

            {/* ══════════════════════════════════════════════════
          MAIN CHAT AREA
      ══════════════════════════════════════════════════ */}
            <main className="flex flex-1 flex-col min-w-0 overflow-hidden">

                {/* Top Bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-xl border-b border-white/50 flex-shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen((v) => !v)}
                        className="p-2 rounded-xl text-gray-500 hover:text-lumicoria-purple hover:bg-lumicoria-purple/10 transition-all duration-150"
                        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                    </button>

                    {/* Current agent pill */}
                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                        style={{
                            color: agentMeta.color,
                            borderColor: `${agentMeta.color}33`,
                            background: `${agentMeta.color}10`,
                        }}
                    >
                        {agentMeta.icon}
                        <span>
                            {messages.length === 0 ? 'Lumicoria AI' : agentMeta.label}
                        </span>
                    </div>

                    <div className="flex-1" />
                </div>

                {/* Messages Area */}
                <div
                    ref={messagesAreaRef}
                    onScroll={handleMessagesScroll}
                    className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-6 space-y-5"
                >

                    {/* ── Empty State ── */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 space-y-6">
                            {/* Logo / hero — gradient logo, large */}
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-3xl bg-white shadow-2xl shadow-gray-200/60 border border-gray-100 flex items-center justify-center overflow-hidden">
                                    <img
                                        src="/images/lumicoria-logo-gradient.png"
                                        alt="Lumicoria AI"
                                        className="w-20 h-20 object-contain"
                                        onError={(e) => {
                                            const el = e.currentTarget as HTMLImageElement;
                                            el.style.display = 'none';
                                            el.parentElement!.classList.add('bg-gradient-to-br', 'from-lumicoria-purple', 'to-lumicoria-lightPurple');
                                        }}
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Hi {firstNameOfUser}, I'm{' '}
                                    <span className="gradient-text">Lumicoria</span>
                                </h2>
                                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                                    Ask me anything — I'll automatically route your request to the best specialist AI agent for the job.
                                </p>
                            </div>

                            {/* Suggestion chips */}
                            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                                {SUGGESTION_PROMPTS.map((s) => (
                                    <button
                                        key={s.text}
                                        onClick={() => {
                                            setInput(s.text);
                                            setTimeout(() => inputRef.current?.focus(), 50);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-gray-700 hover:text-lumicoria-purple hover:border-lumicoria-purple/30"
                                    >
                                        <span style={{ color: s.color }}>{s.icon}</span>
                                        {s.text}
                                    </button>
                                ))}
                            </div>

                            {/* Capabilities */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mt-4 w-full">
                                {[
                                    { icon: <FileTextIcon size={14} />, text: 'Document analysis', color: '#0891b2' },
                                    { icon: <Search size={14} />, text: 'Deep research', color: '#2563eb' },
                                    { icon: <Sparkles size={14} />, text: 'Creative writing', color: '#d946ef' },
                                    { icon: <BarChart size={14} />, text: 'Data insights', color: '#8b5cf6' },
                                    { icon: <Globe size={14} />, text: 'Translation', color: '#0d9488' },
                                    { icon: <Smile size={14} />, text: 'Wellbeing support', color: '#22c55e' },
                                ].map((cap) => (
                                    <div
                                        key={cap.text}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm text-xs text-gray-600"
                                    >
                                        <span style={{ color: cap.color }}>{cap.icon}</span>
                                        {cap.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Messages ── */}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex',
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <ChatBubble msg={msg} />
                        </div>
                    ))}

                    {/* ── Typing Indicator ── */}
                    {isLoading && <TypingIndicator agent={currentAgent} />}

                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll-to-bottom button */}
                {userScrolledUp && messages.length > 0 && (
                    <div className="flex justify-center pb-1">
                        <button
                            onClick={() => {
                                setUserScrolledUp(false);
                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/80 backdrop-blur-sm border border-gray-200/80 shadow-sm rounded-full text-gray-600 hover:text-lumicoria-purple hover:border-lumicoria-purple/20 transition-all"
                        >
                            <ChevronDown size={13} />
                            Jump to latest
                        </button>
                    </div>
                )}

                {/* ── Error Banner ── */}
                {error && (
                    <div className="mx-4 md:mx-8 lg:mx-16 mb-2 flex items-center gap-2.5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        <AlertTriangle size={15} className="flex-shrink-0" />
                        <span className="flex-1 text-xs">{error}</span>
                        <button onClick={() => setError(null)} className="p-0.5 hover:bg-red-100 rounded transition-colors">
                            <X size={13} />
                        </button>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
            INPUT AREA
        ══════════════════════════════════════════════════ */}
                <div className="px-4 md:px-8 lg:px-16 pb-4 space-y-2 flex-shrink-0">

                    {/* Pending Attachments */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-1">
                            {attachments.map((att) => (
                                <div
                                    key={att.id}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl text-[11px] text-gray-600 shadow-sm"
                                >
                                    {att.status === 'uploading' ? (
                                        <Loader2 size={11} className="animate-spin text-lumicoria-purple" />
                                    ) : att.status === 'done' ? (
                                        <Check size={11} className="text-green-500" />
                                    ) : att.status === 'error' ? (
                                        <AlertTriangle size={11} className="text-red-400" />
                                    ) : (
                                        <PaperclipIcon size={11} className="text-lumicoria-purple" />
                                    )}
                                    <span className="max-w-[120px] truncate">{att.name}</span>
                                    {att.status !== 'uploading' && (
                                        <button
                                            onClick={() => removeAttachment(att.id)}
                                            className="ml-0.5 hover:text-red-400 transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main input box */}
                    <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-gray-900/5 rounded-2xl overflow-visible">

                        {/* Attach menu rendered via portal → bypasses overflow-hidden on <main> */}
                        {isAttachMenuOpen && (() => {
                            const rect = attachBtnRef.current?.getBoundingClientRect();
                            const bottom = rect ? window.innerHeight - rect.top + 8 : 120;
                            const left = rect ? rect.left : 80;
                            return ReactDOM.createPortal(
                                <div
                                    className="fixed w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 space-y-2"
                                    style={{ bottom, left, zIndex: 9999 }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Add to context</p>

                                    {/* Upload file */}
                                    <button
                                        type="button"
                                        onClick={() => { fileInputRef.current?.click(); setIsAttachMenuOpen(false); }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left cursor-pointer"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-lumicoria-purple/10 flex items-center justify-center flex-shrink-0">
                                            <FileTextIcon size={13} className="text-lumicoria-purple" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">Upload file</p>
                                            <p className="text-[10px] text-gray-400">PDF, Word, Image, CSV…</p>
                                        </div>
                                    </button>

                                    {/* Add URL */}
                                    <div>
                                        <div className="flex items-center gap-2.5 px-3 pt-2 pb-1">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <LinkIcon size={13} className="text-lumicoria-blue" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-700">Add webpage URL</p>
                                        </div>
                                        <div className="px-3 pb-2.5 flex gap-2">
                                            <input
                                                type="url"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                                                placeholder="https://…"
                                                className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-lumicoria-purple/50 focus:ring-1 focus:ring-lumicoria-purple/20 bg-white"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddUrl}
                                                disabled={!urlInput.trim() || isAddingUrl}
                                                className="px-3 py-1.5 text-xs font-semibold bg-lumicoria-purple text-white rounded-lg disabled:opacity-40 hover:bg-lumicoria-deepPurple transition-colors"
                                            >
                                                {isAddingUrl ? <Loader2 size={11} className="animate-spin" /> : 'Add'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-2">
                                        <p className="text-[10px] text-gray-400 px-3 pb-1">Documents are added to your knowledge base for context</p>
                                    </div>
                                </div>,
                                document.body
                            );
                        })()}

                        {/* Textarea row */}
                        <div className="flex items-end gap-2 px-3 py-2.5">
                            {/* Attach button */}
                            <button
                                ref={attachBtnRef}
                                onClick={() => setIsAttachMenuOpen((v) => !v)}
                                title="Attach file or URL"
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 flex-shrink-0 mb-0.5',
                                    isAttachMenuOpen
                                        ? 'bg-lumicoria-purple text-white shadow-sm'
                                        : 'text-gray-400 hover:text-lumicoria-purple hover:bg-lumicoria-purple/10'
                                )}
                            >
                                <PaperclipIcon size={16} />
                            </button>

                            {/* Textarea */}
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Lumicoria anything…"
                                rows={1}
                                disabled={isLoading}
                                className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed py-1 max-h-40 overflow-y-auto"
                                style={{ minHeight: '32px' }}
                            />

                            {/* Send button */}
                            <button
                                onClick={sendMessage}
                                disabled={(!input.trim() && attachments.filter((a) => a.status === 'pending').length === 0) || isLoading}
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 mb-0.5 transition-all duration-200',
                                    (input.trim() || attachments.some((a) => a.status === 'pending')) && !isLoading
                                        ? 'bg-gradient-to-br from-lumicoria-purple to-lumicoria-lightPurple text-white shadow-md shadow-lumicoria-purple/30 hover:shadow-lg hover:scale-105'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                )}
                            >
                                {isLoading
                                    ? <Loader2 size={15} className="animate-spin" />
                                    : <Send size={15} />
                                }
                            </button>
                        </div>

                        {/* Hint row */}
                        <div className="flex items-center justify-between px-4 pb-2">
                            <p className="text-[10px] text-gray-300 tracking-wide">
                                ↵ Send · ⇧↵ New line
                            </p>
                            <p className="text-[10px] text-gray-300">
                                Powered by Lumicoria AI · 21 specialist agents
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.json,.md,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                onChange={handleFilePick}
            />

            {/* Click-outside overlay (z-9998, below menu at z-9999) */}
            {isAttachMenuOpen && (
                <div
                    className="fixed inset-0"
                    style={{ zIndex: 9998 }}
                    onClick={() => setIsAttachMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Chat;
