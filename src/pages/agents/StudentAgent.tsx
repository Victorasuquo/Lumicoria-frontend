import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, BookOpen, Brain, Search, CalendarDays,
  Flame, Send, Loader2, AlertCircle, ChevronDown, ChevronUp,
  FileText, CheckCircle2, Lightbulb, BookMarked, ExternalLink,
  RefreshCw, Copy, Check, FileDown, History, MessageSquare,
  Clock,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { studentApi, StudentResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type ActionId = "assignment" | "study" | "explain" | "research" | "assist";

interface QuickAction {
  id: ActionId;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  placeholder: string;
  showSubject: boolean;
  showLevel: boolean;
}

/* ─── Config ─────────────────────────────────────────────────────────────── */

const quickActions: QuickAction[] = [
  {
    id: "assignment",
    label: "Assignment Help",
    icon: BookOpen,
    color: "from-indigo-500 to-blue-600",
    description: "Get help with any assignment",
    placeholder: "Describe your assignment — include topic, deadline, and any specific requirements...",
    showSubject: true,
    showLevel: true,
  },
  {
    id: "study",
    label: "Study Plan",
    icon: CalendarDays,
    color: "from-emerald-500 to-teal-600",
    description: "Create a personalised schedule",
    placeholder: "Tell me what you need to study, time available, and your learning goals...",
    showSubject: false,
    showLevel: false,
  },
  {
    id: "explain",
    label: "Explain Concept",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    description: "Understand difficult topics",
    placeholder: "What concept do you want explained? (e.g. quantum entanglement, neural networks, supply & demand)",
    showSubject: true,
    showLevel: true,
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    color: "from-amber-500 to-orange-600",
    description: "Deep academic research",
    placeholder: "Enter your research topic or question — I'll find key findings, theories and sources...",
    showSubject: false,
    showLevel: false,
  },
  {
    id: "assist",
    label: "General Help",
    icon: GraduationCap,
    color: "from-rose-500 to-pink-600",
    description: "Any academic question",
    placeholder: "Ask me anything about your studies, exams, academic writing, or university life...",
    showSubject: false,
    showLevel: false,
  },
];

const SUBJECTS = ["Mathematics", "Computer Science", "Physics", "Chemistry", "Biology", "Literature", "History", "Economics", "Psychology", "Philosophy", "Law", "Medicine", "Engineering", "Other"];
const LEVELS = ["High School", "Undergraduate", "Graduate", "PhD", "Professional"];

const MODEL_OPTIONS: { value: string; label: string; provider: string }[] = [
  { value: "",                    label: "System Default (Gemini)", provider: "gemini" },
  { value: "gemini-2.5-flash",    label: "Gemini 2.5 Flash",       provider: "gemini" },
  { value: "sonar-large-online",  label: "Perplexity Sonar",       provider: "perplexity" },
  { value: "gpt-4o-mini",         label: "GPT-4o Mini",            provider: "openai" },
  { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet", provider: "anthropic" },
];

/* ─── Response Renderer ─────────────────────────────────────────────────── */

function ResponseSection({ label, items, icon: Icon }: { label: string; items: string[]; icon: React.ElementType }) {
  const [expanded, setExpanded] = useState(true);
  if (!items || items.length === 0) return null;
  return (
    <div className="border border-white/40 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-3 bg-indigo-50/30 hover:bg-indigo-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">{label}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-100 text-indigo-400 bg-white/50">{items.length}</Badge>
        </div>
        {expanded ? <ChevronUp size={14} className="text-indigo-400" /> : <ChevronDown size={14} className="text-indigo-400" />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="p-3 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div className="leading-relaxed ai-markdown flex-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {item}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RawResponseCard({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.slice(0, 300);
  return (
    <div className="border border-white/40 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between p-3 bg-gray-50/50 text-left">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full AI Analysis</span>
        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      <div className="px-3 pb-3">
        <div className="ai-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {expanded ? text : (text.length > 300 ? preview + "..." : text)}
          </ReactMarkdown>
        </div>
        {text.length > 300 && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs text-indigo-500 mt-2 hover:underline font-medium">
            {expanded ? "Show less" : "Read more analysis"}
          </button>
        )}
      </div>
    </div>
  );
}

function AgentResponse({ 
  result, 
  followUp, 
  setFollowUp, 
  isFollowingUp, 
  handleFollowUp,
  error,
  setError
}: { 
  result: StudentResponse,
  followUp: string,
  setFollowUp: (v: string) => void,
  isFollowingUp: boolean,
  handleFollowUp: (e: React.FormEvent) => void,
  error: string | null,
  setError: (v: string | null) => void
}) {
  const resp = result.response as Record<string, any>;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = result.raw_response || JSON.stringify(result.response);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportWord = () => {
    if (!result) return;
    const content = result.response.content || result.raw_response || JSON.stringify(result.response);
    
    // Basic export logic (matching Chat.tsx style)
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_response_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Map all known response shape keys → display config
  const sections: Array<{ key: string; label: string; icon: React.ElementType }> = [
    { key: "steps", label: "Steps", icon: CheckCircle2 },
    { key: "outline", label: "Outline", icon: FileText },
    { key: "key_concepts", label: "Key Concepts", icon: Brain },
    { key: "resources", label: "Resources", icon: BookMarked },
    { key: "schedule", label: "Schedule", icon: CalendarDays },
    { key: "techniques", label: "Study Techniques", icon: Lightbulb },
    { key: "tracking_methods", label: "Progress Tracking", icon: CheckCircle2 },
    { key: "breaks_and_recovery", label: "Breaks & Recovery", icon: Flame },
    { key: "definition", label: "Definition", icon: BookOpen },
    { key: "examples", label: "Examples", icon: Lightbulb },
    { key: "related_concepts", label: "Related Concepts", icon: Brain },
    { key: "misconceptions", label: "Common Misconceptions", icon: AlertCircle },
    { key: "formulas", label: "Formulas & Frameworks", icon: FileText },
    { key: "key_findings", label: "Key Findings", icon: Search },
    { key: "theories", label: "Theories & Frameworks", icon: Brain },
    { key: "developments", label: "Recent Developments", icon: RefreshCw },
    { key: "viewpoints", label: "Different Perspectives", icon: Lightbulb },
    { key: "applications", label: "Practical Applications", icon: CheckCircle2 },
    { key: "sources", label: "Sources", icon: ExternalLink },
    { key: "main_points", label: "Main Points", icon: CheckCircle2 },
    { key: "recommendations", label: "Recommendations", icon: Lightbulb },
  ];

  // definition is a string, handle specially
  const definitionStr: string | undefined = typeof resp.definition === "string" ? resp.definition : undefined;
  const renderedSections = sections.filter(s => {
    const val = resp[s.key];
    return Array.isArray(val) && val.length > 0;
  });
  const hasStructured = renderedSections.length > 0 || definitionStr;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
          <GraduationCap size={16} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">Student Intelligence</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-100 text-indigo-500 bg-indigo-50/30">
              {result.model_used || "AI Agent"}
            </Badge>
            <span className="text-[10px] text-gray-400 tabular-nums">{new Date(result.processed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-500" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-500" onClick={handleExportWord}>
            <FileDown size={14} />
          </Button>
        </div>
      </div>

      {/* Query Preview (if it's from history) */}
      {result.content && (
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Question</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 italic">"{result.content}"</p>
        </div>
      )}

      {/* Definition (string) */}
      {definitionStr && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 rounded-xl p-4 shadow-sm">
          <div className="ai-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {definitionStr}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Structured sections */}
      {hasStructured ? (
        <div className="space-y-3">
          {renderedSections.map(s => (
            <ResponseSection key={s.key} label={s.label} items={resp[s.key]} icon={s.icon} />
          ))}
        </div>
      ) : (
        /* Fallback: raw text */
        result.raw_response && <RawResponseCard text={result.raw_response} />
      )}

      {/* Raw text toggle if structured also present */}
      {hasStructured && result.raw_response && (
        <RawResponseCard text={result.raw_response} />
      )}

      {/* Citations Grid */}
      {result.citations && result.citations.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sources & Citations</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.citations.map((cite, i) => (
              <a
                key={i}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 bg-gray-50/50 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-indigo-200 transition-colors">
                    <History size={14} className="text-gray-400 group-hover:text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-900 truncate mb-0.5">{cite.title || 'Source'}</p>
                    <p className="text-[9px] text-gray-400 truncate uppercase tracking-tighter">
                      {cite.url ? new URL(cite.url).hostname : 'Reference'}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Question Input */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <form onSubmit={handleFollowUp} className="relative">
          <textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Ask a follow-up question..."
            rows={2}
            className="w-full bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4 pr-16 text-xs text-gray-700 placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none shadow-inner"
          />
          <div className="absolute right-2 bottom-2">
            <Button 
                type="submit" 
                size="icon" 
                disabled={!followUp.trim() || isFollowingUp}
                className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              {isFollowingUp ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
          The agent remembers this session's context for better follow-up responses
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

const StudentAgentPage: React.FC = () => {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<ActionId>("assignment");
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [selectedModel, setSelectedModel] = useState("");  // empty = system default
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<StudentResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [isFollowingUp, setIsFollowingUp] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await studentApi.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const activeConfig = quickActions.find(a => a.id === activeAction)!;

  const handleActionSwitch = (id: ActionId) => {
    setActiveAction(id);
    setResult(null);
    setError(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) {
      toast({ title: "Please enter your question", variant: "destructive" });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      const context = {
        ...(subject ? { subject } : {}),
        ...(level ? { level } : {}),
      };

      const payload = {
        content: input.trim(),
        context: Object.keys(context).length > 0 ? context : undefined,
        ...(selectedModel ? { model: selectedModel } : {}),
      };

      switch (activeAction) {
        case "assignment": data = await studentApi.getAssignmentHelp(payload); break;
        case "study":      data = await studentApi.getStudyPlan(payload); break;
        case "explain":    data = await studentApi.explainConcept(payload); break;
        case "research":   data = await studentApi.conductResearch(payload); break;
        case "assist":
        default:           data = await studentApi.assist(payload); break;
      }
      setResult(data);
      if (input) {
        fetchHistory(); // Refresh history
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      setError(msg);
      toast({ title: "Request failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [activeAction, input, subject, level, selectedModel, toast, fetchHistory]);

  const handleFollowUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || !result || !result.id || isFollowingUp) return;

    setIsFollowingUp(true);
    setError(null);

    try {
      const response = await studentApi.followUp(followUp, result.id, selectedModel);
      setResult(response.data);
      setFollowUp("");
      fetchHistory(); // Refresh history
      toast({ title: "Response updated", description: "The agent has processed your follow-up." });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Follow-up failed";
      setError(msg);
      toast({ title: "Follow-up failed", description: msg, variant: "destructive" });
    } finally {
      setIsFollowingUp(false);
    }
  }, [followUp, result, isFollowingUp, selectedModel, fetchHistory, toast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <AgentPageLayout
      agentName="Student Agent"
      tagline="Your academic companion — assignments, study plans, concepts & research"
      icon={GraduationCap}
      gradient="from-indigo-500 to-blue-600"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionSwitch(action.id)}
            className={`group bg-white border rounded-xl p-4 transition-all text-left ${
              activeAction === action.id
                ? "border-gray-900 shadow-md"
                : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3`}>
              <action.icon size={17} />
            </div>
            <p className="text-sm font-medium text-gray-800 leading-tight">{action.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{action.description}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left: Input + Response ───────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Input Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{activeConfig.label}</h3>
              <span className="text-[11px] text-gray-400">⌘+Enter to submit</span>
            </div>
            <div className="p-4 space-y-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeConfig.placeholder}
                className="min-h-[120px] text-sm border-gray-200 bg-gray-50/50 resize-none focus:ring-1 focus:ring-indigo-300"
                disabled={loading}
              />
              <div className="flex items-center gap-2 flex-wrap">
                {activeConfig.showSubject && (
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="text-xs h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    disabled={loading}
                  >
                    <option value="">Subject (optional)</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {activeConfig.showLevel && (
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="text-xs h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    disabled={loading}
                  >
                    <option value="">Level (optional)</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                )}
                {/* Model selector */}
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="text-xs h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  disabled={loading}
                >
                  {MODEL_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  className="ml-auto bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs"
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <><Loader2 size={12} className="mr-1.5 animate-spin" />Thinking...</>
                  ) : (
                    <><Send size={12} className="mr-1.5" />Submit</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* New: History Section for Mobile (Quick access) */}
          <div className="lg:hidden">
            <HistorySection 
              history={history} 
              loading={loadingHistory} 
              onSelect={(item) => {
                setResult(item);
                setInput(item.content || "");
                // Scroll to result
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }} 
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700">Request failed</p>
                  <p className="text-xs text-red-500 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Skeleton */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Loader2 size={14} className="text-indigo-500 animate-spin" />
                  </div>
                  <span className="text-sm text-gray-500">Agent is thinking...</span>
                </div>
                {[80, 60, 90, 40].map((w, i) => (
                  <div key={i} className={`h-3 bg-gray-100 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
              >
                {/* Decorative background gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/20 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/20 blur-3xl -ml-24 -mb-24 rounded-full pointer-events-none" />
                {result ? (
            <AgentResponse 
              result={result} 
              followUp={followUp}
              setFollowUp={setFollowUp}
              isFollowingUp={isFollowingUp}
              handleFollowUp={handleFollowUp}
              error={error}
              setError={setError}
            />
          ) : (
            null
          )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} className="text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to assist your learning</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                Choose a mode above, type your academic query, and let Lumicoria Intelligence guide you.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Info Panel ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Mode Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeConfig.color} flex items-center justify-center text-white mb-3`}>
              <activeConfig.icon size={18} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{activeConfig.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{activeConfig.description}</p>
          </div>

          {/* Capabilities */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Capabilities</h3>
            <ul className="space-y-2">
              {[
                "Assignment guidance & step-by-step breakdowns",
                "Personalised study plans with schedules",
                "Concept explanations with examples",
                "Academic research with citations",
                "Adaptive to your level & background",
              ].map((cap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700">Pro tip</span>
            </div>
            <p className="text-xs text-indigo-600 leading-relaxed">
              The more context you give (subject, level, deadline), the more tailored and useful the response will be.
            </p>
          </div>

          {/* Powered by */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-2">Active Model</p>
            <p className="text-sm font-medium text-gray-800">
              {MODEL_OPTIONS.find(m => m.value === selectedModel)?.label || "System Default (Gemini)"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedModel === "sonar-large-online" ? "Real-time web search + academic sources" :
               selectedModel.startsWith("gemini") || selectedModel === "" ? "Google Gemini — fast & capable" :
               selectedModel.startsWith("gpt") ? "OpenAI — GPT family" :
               selectedModel.startsWith("claude") ? "Anthropic — Claude family" :
               "AI model"}
            </p>
          </div>

          {/* Desktop History Dashboard */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Recent Sessions</h3>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500">{history.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                  <Loader2 size={20} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-gray-400">Loading history...</span>
                </div>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <button
                    key={item.id || Math.random()}
                    onClick={() => {
                      setResult(item);
                      setInput(item.content || "");
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all border group",
                      result?.id === item.id 
                        ? "bg-indigo-50 border-indigo-100 shadow-sm" 
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={10} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">
                        {item.request_type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-300 ml-auto">
                        {new Date(item.created_at || item.processed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.content || "Previous Request"}
                    </p>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40">
                  <MessageSquare size={32} className="text-gray-300 mb-2" />
                  <p className="text-xs font-medium text-gray-500">No sessions yet</p>
                </div>
              )}
            </div>
            {history.length > 0 && (
              <div className="p-3 border-t border-gray-50 bg-gray-50/20">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="w-full text-[10px] h-7 text-gray-400 hover:text-indigo-500"
                   onClick={() => setInput("")}
                >
                  Start New Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

/* ─── Shared Components ─────────────────────────────────────────────────── */

function HistorySection({ history, loading, onSelect }: { 
  history: StudentResponse[], 
  loading: boolean, 
  onSelect: (item: StudentResponse) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0 && !loading) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <History size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="text-[10px]">{history.length}</Badge>
           {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-50"
          >
            <div className="p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 size={16} className="animate-spin mx-auto text-indigo-500" />
                </div>
              ) : (
                history.slice(0, 5).map((item) => (
                  <button
                    key={item.id || Math.random()}
                    onClick={() => onSelect(item)}
                    className="w-full p-3 rounded-xl text-left hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <p className="text-xs text-gray-700 font-medium line-clamp-1">
                      {item.content || "Previous Request"}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.created_at || item.processed_at).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentAgentPage;
