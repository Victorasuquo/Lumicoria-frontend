import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi, ConversationSummary } from '../services/api';
import {
    Send,
    Plus,
    MessageSquare,
    Trash2,
    Bot,
    User,
    Loader2,
    PanelLeftClose,
    PanelLeft,
    Sparkles,
    AlertTriangle,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   Chat Page — The primary user-facing experience
   ═══════════════════════════════════════════════════ */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agent?: string;
    timestamp: string;
}

const AGENT_COLORS: Record<string, string> = {
    general: '#6366f1',
    research: '#2563eb',
    research_mentor: '#7c3aed',
    document: '#0891b2',
    meeting: '#0d9488',
    meeting_fact_checker: '#059669',
    creative: '#d946ef',
    social_media: '#ec4899',
    student: '#f97316',
    learning_coach: '#eab308',
    rag: '#06b6d4',
    data_analysis: '#8b5cf6',
    knowledge_graph: '#14b8a6',
    legal_document: '#64748b',
    translation: '#3b82f6',
    customer_service: '#10b981',
    ethics_bias: '#f43f5e',
    wellbeing: '#22c55e',
    focus_flow: '#a855f7',
    workspace_ergonomics: '#78716c',
    vision: '#0ea5e9',
};

const AGENT_LABELS: Record<string, string> = {
    general: 'General',
    research: 'Research',
    research_mentor: 'Research Mentor',
    document: 'Document',
    meeting: 'Meeting',
    meeting_fact_checker: 'Fact Checker',
    creative: 'Creative',
    social_media: 'Social Media',
    student: 'Student',
    learning_coach: 'Learning Coach',
    rag: 'Knowledge Base',
    data_analysis: 'Data Analysis',
    knowledge_graph: 'Knowledge Graph',
    legal_document: 'Legal',
    translation: 'Translation',
    customer_service: 'Customer Service',
    ethics_bias: 'Ethics & Bias',
    wellbeing: 'Wellbeing',
    focus_flow: 'Focus Flow',
    workspace_ergonomics: 'Ergonomics',
    vision: 'Vision',
};

const Chat: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentAgent, setCurrentAgent] = useState<string>('general');
    const [error, setError] = useState<string | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await chatApi.listConversations();
            setConversations(data);
        } catch (e) {
            console.error('Failed to load conversations:', e);
        }
    };

    const startNewConversation = () => {
        setConversationId(null);
        setMessages([]);
        setCurrentAgent('general');
        setError(null);
        inputRef.current?.focus();
    };

    const loadConversation = async (convId: string) => {
        try {
            const data = await chatApi.getConversation(convId);
            setConversationId(convId);
            setMessages(
                (data.messages || []).map((msg: any, idx: number) => ({
                    id: `${convId}-${idx}`,
                    role: msg.role,
                    content: msg.content,
                    agent: msg.agent,
                    timestamp: msg.timestamp || '',
                }))
            );
            const lastAgent = data.agent_history?.[data.agent_history.length - 1];
            if (lastAgent) setCurrentAgent(lastAgent);
            setError(null);
        } catch (e) {
            console.error('Failed to load conversation:', e);
            setError('Failed to load conversation');
        }
    };

    const deleteConversation = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await chatApi.deleteConversation(convId);
            setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
            if (conversationId === convId) {
                startNewConversation();
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
        }
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        setError(null);

        // Add user message immediately
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage({
                query: trimmed,
                conversation_id: conversationId || undefined,
            });

            // Save the conversation ID
            if (!conversationId) {
                setConversationId(response.conversation_id);
            }

            // Update agent info
            setCurrentAgent(response.agent_used);

            // Add assistant response
            const assistantMsg: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response.response,
                agent: response.agent_used,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);

            // Refresh conversation list
            loadConversations();
        } catch (err: any) {
            const detail = err?.response?.data?.detail || err?.message || 'Something went wrong';
            setError(detail);
            // Remove the user message if we got a rate limit or injection error
            if (err?.response?.status === 429 || err?.response?.status === 400) {
                setMessages((prev) => prev.slice(0, -1));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const agentColor = AGENT_COLORS[currentAgent] || '#6366f1';
    const agentLabel = AGENT_LABELS[currentAgent] || currentAgent;

    return (
        <div style={styles.container}>
            {/* == Sidebar == */}
            <div style={{
                ...styles.sidebar,
                ...(isSidebarOpen ? {} : { width: 0, padding: 0, overflow: 'hidden', borderRight: 'none' }),
            }}>
                <div style={styles.sidebarHeader}>
                    <h2 style={styles.sidebarTitle}>Conversations</h2>
                    <button onClick={startNewConversation} style={styles.newChatBtn} title="New Chat">
                        <Plus size={18} />
                    </button>
                </div>

                <div style={styles.conversationList}>
                    {conversations.length === 0 ? (
                        <p style={styles.noConversations}>No conversations yet</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.conversation_id}
                                onClick={() => loadConversation(conv.conversation_id)}
                                style={{
                                    ...styles.conversationItem,
                                    ...(conversationId === conv.conversation_id ? styles.conversationItemActive : {}),
                                }}
                            >
                                <MessageSquare size={14} style={{ minWidth: 14, opacity: 0.6 }} />
                                <div style={styles.conversationItemText}>
                                    <span style={styles.conversationTitle}>{conv.title || 'Untitled'}</span>
                                    <span style={styles.conversationPreview}>{conv.preview?.slice(0, 40)}</span>
                                </div>
                                <button
                                    onClick={(e) => deleteConversation(conv.conversation_id, e)}
                                    style={styles.deleteBtn}
                                    title="Delete"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* == Main Chat Area == */}
            <div style={styles.main}>
                {/* Top Bar */}
                <div style={styles.topBar}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={styles.toggleSidebarBtn}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                    </button>

                    <div style={styles.agentBadge}>
                        <Sparkles size={14} color={agentColor} />
                        <span style={{ color: agentColor, fontWeight: 600, fontSize: '13px' }}>
                            {agentLabel}
                        </span>
                    </div>
                </div>

                {/* Messages */}
                <div style={styles.messagesArea}>
                    {messages.length === 0 ? (
                        <div style={styles.emptyState}>
                            <Bot size={48} color="#6366f1" />
                            <h3 style={styles.emptyTitle}>Welcome to Lumicoria</h3>
                            <p style={styles.emptySubtitle}>
                                Ask me anything — I'll route your question to the best specialist agent.
                            </p>
                            <div style={styles.suggestions}>
                                {[
                                    'Help me write a LinkedIn post about AI',
                                    'Analyze the sentiment of this tweet',
                                    'Create a study plan for calculus',
                                    'Translate this to Spanish',
                                ].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                        style={styles.suggestionChip}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    ...styles.messageBubbleRow,
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        ...styles.avatar,
                                        background: `linear-gradient(135deg, ${AGENT_COLORS[msg.agent || 'general'] || '#6366f1'}, ${AGENT_COLORS[msg.agent || 'general'] || '#6366f1'}88)`,
                                    }}>
                                        <Bot size={16} color="white" />
                                    </div>
                                )}
                                <div
                                    style={{
                                        ...styles.bubble,
                                        ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble),
                                    }}
                                >
                                    {msg.agent && msg.role === 'assistant' && (
                                        <span style={{
                                            ...styles.agentTag,
                                            color: AGENT_COLORS[msg.agent] || '#6366f1',
                                            borderColor: `${AGENT_COLORS[msg.agent] || '#6366f1'}33`,
                                        }}>
                                            {AGENT_LABELS[msg.agent] || msg.agent}
                                        </span>
                                    )}
                                    <div style={styles.messageText}>{msg.content}</div>
                                </div>
                                {msg.role === 'user' && (
                                    <div style={{ ...styles.avatar, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                        <User size={16} color="white" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div style={{ ...styles.messageBubbleRow, justifyContent: 'flex-start' }}>
                            <div style={{ ...styles.avatar, background: `linear-gradient(135deg, ${agentColor}, ${agentColor}88)` }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} color={agentColor} />
                                <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '8px' }}>Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={styles.errorBanner}>
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} style={styles.dismissError}>✕</button>
                    </div>
                )}

                {/* Input Area */}
                <div style={styles.inputArea}>
                    <div style={styles.inputWrapper}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            style={styles.textarea}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            style={{
                                ...styles.sendBtn,
                                opacity: input.trim() && !isLoading ? 1 : 0.4,
                                background: agentColor,
                            }}
                        >
                            <Send size={18} color="white" />
                        </button>
                    </div>
                    <p style={styles.disclaimer}>
                        Lumicoria AI routes your message to the best specialist agent automatically.
                    </p>
                </div>
            </div>

            {/* Keyframe for spin animation */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   Inline Styles (no tailwind dependency)
   ═══════════════════════════════════════════════════ */

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        height: 'calc(100vh - 64px)',
        background: '#0f172a',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, sans-serif",
    },
    // Sidebar
    sidebar: {
        width: '280px',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
        transition: 'width 0.2s ease, padding 0.2s ease',
    },
    sidebarHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid #1e293b',
    },
    sidebarTitle: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#f1f5f9',
        margin: 0,
    },
    newChatBtn: {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
    },
    conversationList: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '8px',
    },
    noConversations: {
        color: '#475569',
        fontSize: '13px',
        textAlign: 'center' as const,
        padding: '24px 0',
    },
    conversationItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '2px',
        transition: 'background 0.15s',
    },
    conversationItemActive: {
        background: '#1e293b',
    },
    conversationItemText: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column' as const,
    },
    conversationTitle: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#e2e8f0',
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    conversationPreview: {
        fontSize: '11px',
        color: '#64748b',
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        color: '#475569',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        opacity: 0.5,
    },
    // Main area
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        background: '#0f172a',
    },
    topBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: '1px solid #1e293b',
    },
    toggleSidebarBtn: {
        background: 'transparent',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
    },
    agentBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: '#1e293b',
        borderRadius: '20px',
        border: '1px solid #334155',
    },
    // Messages
    messagesArea: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '12px',
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#f1f5f9',
        margin: 0,
    },
    emptySubtitle: {
        fontSize: '14px',
        color: '#94a3b8',
        textAlign: 'center' as const,
        maxWidth: 400,
    },
    suggestions: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '8px',
        marginTop: '16px',
        justifyContent: 'center',
        maxWidth: 500,
    },
    suggestionChip: {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '20px',
        color: '#94a3b8',
        fontSize: '13px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
    },
    messageBubbleRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        maxWidth: '85%',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
    },
    bubble: {
        padding: '12px 16px',
        borderRadius: '16px',
        fontSize: '14px',
        lineHeight: '1.6',
        maxWidth: '600px',
        wordBreak: 'break-word' as const,
    },
    userBubble: {
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#ffffff',
        borderBottomRightRadius: '4px',
    },
    assistantBubble: {
        background: '#1e293b',
        color: '#e2e8f0',
        borderBottomLeftRadius: '4px',
        border: '1px solid #334155',
    },
    agentTag: {
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '10px',
        border: '1px solid',
        marginBottom: '6px',
        display: 'inline-block',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    messageText: {
        whiteSpace: 'pre-wrap' as const,
    },
    // Error
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: '#450a0a',
        color: '#fca5a5',
        fontSize: '13px',
        borderTop: '1px solid #7f1d1d',
    },
    dismissError: {
        marginLeft: 'auto',
        background: 'transparent',
        border: 'none',
        color: '#fca5a5',
        cursor: 'pointer',
        fontSize: '16px',
    },
    // Input
    inputArea: {
        padding: '16px',
        borderTop: '1px solid #1e293b',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        background: '#1e293b',
        borderRadius: '16px',
        border: '1px solid #334155',
        padding: '8px 12px',
    },
    textarea: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#e2e8f0',
        fontSize: '14px',
        lineHeight: '1.5',
        resize: 'none' as const,
        maxHeight: '120px',
        fontFamily: "'Inter', -apple-system, sans-serif",
    },
    sendBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.15s',
        minWidth: '36px',
    },
    disclaimer: {
        fontSize: '11px',
        color: '#475569',
        textAlign: 'center' as const,
        marginTop: '8px',
    },
};

export default Chat;
