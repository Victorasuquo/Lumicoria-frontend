import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Scale, Upload, AlertTriangle, CheckCircle2, FileText,
  ChevronRight, ChevronDown, Eye, Shield, Loader2, Copy, ArrowRightLeft,
  BookOpen, Gavel, X, Sparkles, Bot, Clock, Trash2, RefreshCw,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import {
  legalApi,
  chatApi,
  LegalDocumentResponse,
  LegalHistoryItem,
  LegalProvider,
} from "@/services/api";

/* ── Provider toggle ────────────────────────────────────────────── */

interface ProviderOption {
  value: LegalProvider;
  label: string;
  hint: string;
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    value: "gemini",
    label: "Gemini",
    hint: "Fast, well-rounded summaries",
  },
  {
    value: "anthropic",
    label: "Claude",
    hint: "Thorough, careful legal reasoning",
  },
];

function relativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.max(0, (Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function modeKeyToAnalysisMode(mode: string): AnalysisMode | null {
  switch (mode) {
    case "clause_extraction":
      return "clauses";
    case "risk_analysis":
      return "risks";
    case "plain_language":
      return "plain";
    case "compliance_check":
      return "compliance";
    case "version_comparison":
      return "compare";
    default:
      return null;
  }
}

/* ── Analysis Modes ────────────────────────────────────────────────── */

type AnalysisMode =
  | "clauses"
  | "risks"
  | "plain"
  | "compliance"
  | "compare";

interface ModeConfig {
  key: AnalysisMode;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const modes: ModeConfig[] = [
  {
    key: "clauses",
    label: "Extract Clauses",
    description: "Identify obligations, deadlines & key terms",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "risks",
    label: "Risk Assessment",
    description: "Flag high-risk clauses & unusual terms",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    key: "plain",
    label: "Plain Language",
    description: "Translate legal jargon into clear English",
    icon: Eye,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "compliance",
    label: "Compliance Check",
    description: "Verify regulatory & contractual compliance",
    icon: Shield,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    key: "compare",
    label: "Compare Versions",
    description: "Diff two versions to track changes",
    icon: ArrowRightLeft,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

/* ── Severity helpers ──────────────────────────────────────────────── */

const severityColors: Record<string, string> = {
  critical: "bg-red-50 text-red-600 border-red-200",
  high: "bg-red-50 text-red-600 border-red-200",
  High: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Low: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const severityDots: Record<string, string> = {
  critical: "bg-red-600",
  high: "bg-red-500",
  High: "bg-red-500",
  medium: "bg-amber-500",
  Medium: "bg-amber-500",
  low: "bg-emerald-500",
  Low: "bg-emerald-500",
};

/* ── Component ─────────────────────────────────────────────────────── */

const LegalDocumentAgent: React.FC = () => {
  const { toast } = useToast();

  // Input state
  const [documentText, setDocumentText] = useState("");
  const [compareOld, setCompareOld] = useState("");
  const [compareNew, setCompareNew] = useState("");
  const [selectedMode, setSelectedMode] = useState<AnalysisMode | null>(null);
  const [jurisdiction, setJurisdiction] = useState("global");
  // When the user uploads a file we store the resulting document id
  // (returned by the platform's ingestion pipeline) and the filename
  // so we can show it in the UI.  The id is sent to the backend as
  // `rag_document_id` when the analysis is run.
  const [libraryDocId, setLibraryDocId] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [provider, setProvider] = useState<LegalProvider>("gemini");

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Results + history (server-persisted)
  const [result, setResult] = useState<LegalDocumentResponse | null>(null);
  const [history, setHistory] = useState<LegalHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);

  /* ── File upload ──────────────────────────────────────────── */

  const handleFilePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Reset the input so picking the same file twice still triggers
      // onChange.
      if (e.target) e.target.value = "";
      if (!file) return;
      try {
        setIsUploading(true);
        const res = await chatApi.uploadDocument(file, file.name);
        const docId = res?.document_id;
        if (!docId) {
          throw new Error("Upload did not return a document id");
        }
        setLibraryDocId(docId);
        setUploadedFilename(file.name);
        toast({
          title: "Document uploaded",
          description: `${file.name} is ready to analyse.`,
        });
      } catch (err: any) {
        toast({
          title: "Upload failed",
          description: err?.response?.data?.detail || err?.message,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast],
  );

  const clearUploadedFile = useCallback(() => {
    setLibraryDocId("");
    setUploadedFilename(null);
  }, []);

  /* ── History loaders ───────────────────────────────────────── */

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await legalApi.listHistory({ limit: 25 });
      setHistory(data.analyses || []);
    } catch (e: any) {
      // History is non-blocking; surface only on first load failure.
      console.warn("legal history load failed", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const openHistoryItem = useCallback(
    async (id: string) => {
      try {
        const detail = await legalApi.getHistoryItem(id);
        const targetMode = modeKeyToAnalysisMode(detail.mode);
        if (targetMode) setSelectedMode(targetMode);
        // Server stores the full result body under `result`; the
        // analyze endpoints return { results, metadata }, so reshape
        // to match.
        const reshaped: LegalDocumentResponse = {
          results: (detail.result?.results as Record<string, any>) || {},
          metadata: {
            ...(detail.result?.metadata as Record<string, any> || {}),
            analysis_id: detail.id,
            model_provider: detail.model_provider || undefined,
            model_name: detail.model_name || undefined,
          },
        };
        setResult(reshaped);
        setActiveHistoryId(id);
        if (detail.content_preview) {
          setDocumentText(detail.content_preview);
        }
        if (detail.model_provider === "anthropic" || detail.model_provider === "gemini") {
          setProvider(detail.model_provider as LegalProvider);
        }
      } catch (e: any) {
        toast({
          title: "Could not open analysis",
          description: e?.response?.data?.detail || e?.message,
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const deleteHistoryItem = useCallback(
    async (id: string) => {
      try {
        await legalApi.deleteHistoryItem(id);
        setHistory((prev) => prev.filter((h) => h.id !== id));
        if (activeHistoryId === id) {
          setActiveHistoryId(null);
          setResult(null);
        }
        toast({ title: "Analysis removed" });
      } catch (e: any) {
        toast({
          title: "Delete failed",
          description: e?.response?.data?.detail || e?.message,
          variant: "destructive",
        });
      }
    },
    [activeHistoryId, toast],
  );

  /* ── API calls ─────────────────────────────────────────────── */

  const handleAnalyze = async () => {
    if (!selectedMode) return;

    // Compare needs two bodies; everything else needs at least one.
    if (selectedMode === "compare") {
      if (!compareOld.trim() || !compareNew.trim()) {
        toast({ title: "Paste both document versions", variant: "destructive" });
        return;
      }
    } else if (!documentText.trim() && !libraryDocId.trim()) {
      toast({
        title: "Bring in your document",
        description: "Paste the text or supply a library document id.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setActiveHistoryId(null);

    const base = {
      content: documentText.trim() || undefined,
      rag_document_id: libraryDocId.trim() || undefined,
      provider,
    };

    try {
      let response: LegalDocumentResponse;

      switch (selectedMode) {
        case "clauses":
          response = await legalApi.extractClauses({
            ...base,
            include_metadata: true,
            highlight_obligations: true,
            extract_dates: true,
          });
          break;

        case "risks":
          response = await legalApi.analyzeRisks({
            ...base,
            risk_threshold: 0.7,
            include_recommendations: true,
            categorize_risks: true,
          });
          break;

        case "plain":
          response = await legalApi.plainLanguage({
            ...base,
            simplify_terms: true,
            include_examples: true,
            maintain_legal_accuracy: true,
          });
          break;

        case "compliance":
          response = await legalApi.checkCompliance({
            ...base,
            jurisdiction,
            industry_specific: true,
            include_citations: true,
          });
          break;

        case "compare":
          response = await legalApi.compareVersions({
            provider,
            old_version: compareOld,
            new_version: compareNew,
            track_changes: true,
            summarize_changes: true,
          });
          break;

        default:
          return;
      }

      setResult(response);
      const newId = response.metadata?.analysis_id || null;
      setActiveHistoryId(newId);

      const modeConf = modes.find((m) => m.key === selectedMode)!;
      toast({
        title: `${modeConf.label} complete`,
        description: response.metadata?.model_name
          ? `Powered by ${response.metadata.model_name}`
          : undefined,
      });

      // Refresh the persisted history so the new run shows up.
      loadHistory();
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyResults = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.results, null, 2));
    toast({ title: "Results copied to clipboard" });
  };

  const handleClear = () => {
    setSelectedMode(null);
    setDocumentText("");
    setCompareOld("");
    setCompareNew("");
    setResult(null);
  };

  /* ── Render helpers ────────────────────────────────────────── */

  // Values like "N/A", "Unknown", null, undefined, "" should not be
  // shown — they're placeholders the LLM emits when a field genuinely
  // doesn't apply.  Keep numbers (including zero) since "0 critical
  // issues" is a real statement.
  const isEmptyValue = (v: any): boolean => {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") {
      const t = v.trim().toLowerCase();
      return (
        t === "" ||
        t === "n/a" ||
        t === "na" ||
        t === "none" ||
        t === "null" ||
        t === "undefined" ||
        t === "unknown"
      );
    }
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object")
      return Object.values(v).every((x) => isEmptyValue(x));
    return false;
  };

  const renderScalar = (v: any) => {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
      return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return "";
    }
  };

  // Heuristic: a nested object that maps severity labels to counts
  // ({"critical":0,"high":0,"medium":2,"low":1}) is best shown as
  // colored pills, not raw JSON.
  const SEVERITY_COLORS: Record<string, string> = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const isSeverityCountObject = (v: any) =>
    v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v).some((k) => k.toLowerCase() in SEVERITY_COLORS) &&
    Object.values(v).every((x) => typeof x === "number");

  const renderSeverityCounts = (v: Record<string, number>) => (
    <div className="flex flex-wrap gap-1.5">
      {(["critical", "high", "medium", "low"] as const).map((level) => {
        if (v[level] === undefined) return null;
        return (
          <span
            key={level}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${SEVERITY_COLORS[level]}`}
          >
            {v[level]} {level}
          </span>
        );
      })}
    </div>
  );

  // Recursively render any value as a small DOM tree.  Used inside
  // arrays and inside object-typed values so we never fall through to
  // JSON.stringify for nested structures.
  const renderAny = (v: any, depth: number = 0): React.ReactNode => {
    if (isEmptyValue(v)) return null;
    if (typeof v === "string") return <span>{v}</span>;
    if (typeof v === "number" || typeof v === "boolean")
      return <span>{String(v)}</span>;
    if (Array.isArray(v)) {
      return (
        <div className="space-y-1">
          {v.map((item, i) =>
            isEmptyValue(item) ? null : (
              <div key={i} className="text-xs text-gray-700">
                {renderAny(item, depth + 1)}
              </div>
            ),
          )}
        </div>
      );
    }
    if (typeof v === "object" && v !== null) {
      if (isSeverityCountObject(v))
        return renderSeverityCounts(v as Record<string, number>);
      const entries = Object.entries(v).filter(([_, x]) => !isEmptyValue(x));
      if (entries.length === 0) return null;
      return (
        <div className="space-y-1">
          {entries.map(([k, val]) => (
            <div key={k} className="flex items-start gap-2">
              <span className="text-[10px] font-medium text-gray-400 uppercase min-w-[80px] shrink-0 mt-0.5">
                {k.replace(/_/g, " ")}
              </span>
              <div className="text-xs text-gray-700 flex-1 min-w-0">
                {renderAny(val, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <span>{renderScalar(v)}</span>;
  };

  const renderResults = () => {
    if (!result) return null;
    const data = result.results;

    if (typeof data === "object" && data !== null) {
      // Filter out top-level keys whose values are empty.  No more
      // "Citation: N/A" or "Document Type: Unknown".
      const entries = Object.entries(data).filter(
        ([_, value]) => !isEmptyValue(value),
      );
      if (entries.length === 0) {
        return (
          <p className="text-sm text-gray-400">
            No structured results to display.
          </p>
        );
      }
      return (
        <div className="space-y-4">
          {entries.map(([key, value]) => (
            <div key={key}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {key.replace(/_/g, " ")}
              </h4>
              {Array.isArray(value) ? (
                <div className="space-y-2">
                  {value.map((item: any, i: number) =>
                    isEmptyValue(item) ? null : (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700"
                      >
                        {renderAny(item)}
                      </motion.div>
                    ),
                  )}
                </div>
              ) : typeof value === "string" ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                  {value}
                </p>
              ) : isSeverityCountObject(value) ? (
                <div className="bg-gray-50 rounded-xl p-3">
                  {renderSeverityCounts(value as Record<string, number>)}
                </div>
              ) : typeof value === "object" && value !== null ? (
                <div className="bg-gray-50 rounded-xl p-3">
                  {renderAny(value)}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{renderScalar(value)}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-sm text-gray-600 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</p>;
  };

  const currentModeConf = selectedMode ? modes.find((m) => m.key === selectedMode) : null;

  /* ── Landing state (no mode selected) ──────────────────────── */

  if (!selectedMode) {
    return (
      <AgentPageLayout
        agentName="Legal Document Agent"
        tagline="Legal clarity simplified"
        icon={Scale}
        gradient="from-slate-500 to-gray-600"
      >
        {/* Intro */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Paste any contract, agreement, or legal document below, then choose an analysis type to get started.
          </p>
        </div>

        {/* Model toggle */}
        <div className="max-w-3xl mx-auto mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Bot size={13} className="text-gray-400" />
            <span>Powered by</span>
            <div className="inline-flex rounded-md border border-gray-200 bg-gray-50/60 p-0.5">
              {PROVIDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProvider(opt.value)}
                  title={opt.hint}
                  className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                    provider === opt.value
                      ? "bg-white shadow-sm text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 max-w-[260px] text-right">
            {PROVIDER_OPTIONS.find((p) => p.value === provider)?.hint}
          </p>
        </div>

        {/* Document Input */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-3 max-w-3xl mx-auto">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Your Document</h3>
            </div>
            {documentText.length > 0 && (
              <span className="text-[10px] text-gray-300">{documentText.length.toLocaleString()} chars</span>
            )}
          </div>
          <Textarea
            placeholder="Paste your legal document, contract, or agreement here…"
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            className="border-0 rounded-none min-h-[180px] resize-none text-sm text-gray-700 placeholder:text-gray-300 focus-visible:ring-0 p-4 leading-relaxed"
          />
        </div>

        {/* File upload — sends through the platform's document ingestion */}
        <div className="max-w-3xl mx-auto mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleFilePick}
            disabled={isUploading}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed shadow-sm transition-colors text-left ${
              uploadedFilename
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
            }`}
          >
            {isUploading ? (
              <Loader2 size={16} className="text-gray-500 animate-spin shrink-0" />
            ) : uploadedFilename ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <Upload size={16} className="text-gray-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {uploadedFilename ? (
                <>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {uploadedFilename}
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    Ready to analyse — click below to run a mode.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    {isUploading ? "Uploading…" : "Upload a document"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Click to choose a PDF, Word, or text file from your computer.
                  </p>
                </>
              )}
            </div>
            {uploadedFilename && !isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearUploadedFile();
                }}
                className="p-1 text-gray-300 hover:text-red-500"
                title="Remove"
              >
                <X size={14} />
              </button>
            )}
          </button>
        </div>

        {/* Analysis Modes */}
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">What would you like to do?</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setSelectedMode(mode.key)}
                className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
              >
                <div className={`w-9 h-9 rounded-lg ${mode.bg} flex items-center justify-center mb-3`}>
                  <mode.icon size={16} className={mode.color} />
                </div>
                <p className="text-sm font-medium text-gray-800 mb-0.5">{mode.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Analyses
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadHistory}
                disabled={historyLoading}
                className="text-xs text-gray-400 h-7 px-2"
                title="Refresh"
              >
                <RefreshCw
                  size={12}
                  className={historyLoading ? "animate-spin" : ""}
                />
              </Button>
            </div>
            {historyLoading && history.length === 0 ? (
              <div className="p-6 flex items-center justify-center text-xs text-gray-400 gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center">
                <Sparkles size={20} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500">
                  No analyses yet. Run one above and it will land here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.slice(0, 8).map((h) => {
                  const ui = modeKeyToAnalysisMode(h.mode);
                  const mc = ui ? modes.find((m) => m.key === ui)! : null;
                  return (
                    <div
                      key={h.id}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${
                          mc?.bg || "bg-gray-50"
                        } flex items-center justify-center shrink-0`}
                      >
                        {mc ? (
                          <mc.icon size={14} className={mc.color} />
                        ) : (
                          <FileText size={14} className="text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openHistoryItem(h.id)}
                        className="flex-1 min-w-0 text-left"
                        title="Reopen this analysis"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {h.title || mc?.label || h.mode}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <Clock size={9} />
                          {relativeTime(h.created_at)}
                          {h.model_provider && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="capitalize">
                                {h.model_provider === "anthropic"
                                  ? "Claude"
                                  : h.model_provider}
                              </span>
                            </>
                          )}
                          {h.status === "error" && (
                            <Badge
                              variant="outline"
                              className="h-4 text-[9px] border-red-200 text-red-500 ml-1"
                            >
                              error
                            </Badge>
                          )}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(h.id);
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AgentPageLayout>
    );
  }

  /* ── Active analysis state ─────────────────────────────────── */

  return (
    <AgentPageLayout
      agentName="Legal Document Agent"
      tagline="Legal clarity simplified"
      icon={Scale}
      gradient="from-slate-500 to-gray-600"
    >
      {/* Hidden file input used by the upload button below */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mode header bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
          Back
        </button>
        <div className="h-4 w-px bg-gray-200" />
        {currentModeConf && (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${currentModeConf.bg} flex items-center justify-center`}>
              <currentModeConf.icon size={13} className={currentModeConf.color} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{currentModeConf.label}</span>
          </div>
        )}
        {/* Provider toggle (compact) */}
        <div className="ml-auto flex items-center gap-1.5">
          <Bot size={12} className="text-gray-400" />
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50/60 p-0.5">
            {PROVIDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setProvider(opt.value)}
                title={opt.hint}
                className={`px-2 py-0.5 rounded transition-colors text-[10px] ${
                  provider === opt.value
                    ? "bg-white shadow-sm text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode switcher pills */}
        <div className="flex gap-1.5">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setSelectedMode(m.key);
                setResult(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedMode === m.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Input */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMode === "compare" ? (
            <>
              {/* Version A */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-3 border-b border-gray-50">
                  <h3 className="text-xs font-semibold text-gray-900">Version A (Old)</h3>
                </div>
                <Textarea
                  placeholder="Paste the previous version…"
                  value={compareOld}
                  onChange={(e) => setCompareOld(e.target.value)}
                  className="border-0 rounded-none min-h-[160px] resize-none text-sm text-gray-700 placeholder:text-gray-300 focus-visible:ring-0 p-4 leading-relaxed"
                />
              </div>

              {/* Version B */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-3 border-b border-gray-50">
                  <h3 className="text-xs font-semibold text-gray-900">Version B (New)</h3>
                </div>
                <Textarea
                  placeholder="Paste the new version…"
                  value={compareNew}
                  onChange={(e) => setCompareNew(e.target.value)}
                  className="border-0 rounded-none min-h-[160px] resize-none text-sm text-gray-700 placeholder:text-gray-300 focus-visible:ring-0 p-4 leading-relaxed"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-3 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">Document</h3>
                  {documentText.length > 0 && (
                    <span className="text-[10px] text-gray-300">{documentText.length.toLocaleString()} chars</span>
                  )}
                </div>
                <Textarea
                  placeholder="Paste your legal document, contract, or agreement here…"
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  className="border-0 rounded-none min-h-[340px] resize-none text-sm text-gray-700 placeholder:text-gray-300 focus-visible:ring-0 p-4 leading-relaxed"
                />
              </div>
              <button
                type="button"
                onClick={handleFilePick}
                disabled={isUploading}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-dashed shadow-sm transition-colors text-left ${
                  uploadedFilename
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                {isUploading ? (
                  <Loader2 size={13} className="text-gray-500 animate-spin shrink-0" />
                ) : uploadedFilename ? (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <Upload size={13} className="text-gray-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {uploadedFilename ? (
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {uploadedFilename}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {isUploading ? "Uploading…" : "Or upload a file"}
                    </p>
                  )}
                </div>
                {uploadedFilename && !isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearUploadedFile();
                    }}
                    className="p-1 text-gray-300 hover:text-red-500"
                    title="Remove"
                  >
                    <X size={11} />
                  </button>
                )}
              </button>
            </>
          )}

          {/* Compliance: Jurisdiction selector */}
          {selectedMode === "compliance" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <label className="text-xs font-medium text-gray-500 mb-2 block">Jurisdiction</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="global">Global</option>
                <option value="us">United States</option>
                <option value="eu">European Union (GDPR)</option>
                <option value="uk">United Kingdom</option>
                <option value="nigeria">Nigeria</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
              </select>
            </div>
          )}

          {/* Analyze button */}
          <Button
            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-10 text-sm font-medium"
            disabled={isProcessing}
            onClick={handleAnalyze}
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                {currentModeConf && <currentModeConf.icon size={14} className="mr-2" />}
                Run {currentModeConf?.label}
              </>
            )}
          </Button>

          {/* History sidebar */}
          {history.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900">History</h3>
                <button
                  onClick={loadHistory}
                  disabled={historyLoading}
                  className="text-gray-300 hover:text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    size={11}
                    className={historyLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
              <div className="divide-y divide-gray-50 max-h-[260px] overflow-y-auto">
                {history.map((h) => {
                  const ui = modeKeyToAnalysisMode(h.mode);
                  const mc = ui ? modes.find((m) => m.key === ui)! : null;
                  const isActive = activeHistoryId === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`p-3 flex items-center gap-2.5 transition-colors ${
                        isActive ? "bg-gray-50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md ${
                          mc?.bg || "bg-gray-50"
                        } flex items-center justify-center shrink-0`}
                      >
                        {mc ? (
                          <mc.icon size={11} className={mc.color} />
                        ) : (
                          <FileText size={11} className="text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openHistoryItem(h.id)}
                        className="flex-1 min-w-0 text-left"
                        title="Reopen this analysis"
                      >
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {h.title || mc?.label || h.mode}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {relativeTime(h.created_at)}
                          {h.model_provider && (
                            <>
                              {" · "}
                              <span className="capitalize">
                                {h.model_provider === "anthropic"
                                  ? "Claude"
                                  : h.model_provider}
                              </span>
                            </>
                          )}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(h.id);
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center"
              >
                <Loader2 size={24} className="text-gray-300 animate-spin mb-3" />
                <p className="text-sm text-gray-400">Analyzing your document…</p>
                <p className="text-[11px] text-gray-300 mt-1">This may take a moment</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Results header */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Analysis Results</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyResults}
                      className="h-7 px-2.5 text-[11px] text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={12} className="mr-1.5" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-4">{renderResults()}</div>
                </div>

                {/* Run details — diagnostic metadata, hidden by default */}
                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowMetadata((v) => !v)}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronDown
                        size={11}
                        className={`transition-transform ${
                          showMetadata ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                      {showMetadata ? "Hide run details" : "Show run details"}
                    </button>
                    {showMetadata && (
                      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mt-2">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.metadata).map(([k, v]) => (
                            <Badge
                              key={k}
                              variant="outline"
                              className="text-[10px] px-2 py-0.5 border-gray-200 text-gray-500"
                            >
                              {k.replace(/_/g, " ")}:{" "}
                              {typeof v === "string" || typeof v === "number"
                                ? String(v)
                                : "…"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center"
              >
                {currentModeConf && (
                  <>
                    <div className={`w-12 h-12 rounded-xl ${currentModeConf.bg} flex items-center justify-center mb-3`}>
                      <currentModeConf.icon size={20} className={currentModeConf.color} />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{currentModeConf.label}</p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                      {currentModeConf.description}. Paste your document on the left and click analyze to get started.
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default LegalDocumentAgent;
