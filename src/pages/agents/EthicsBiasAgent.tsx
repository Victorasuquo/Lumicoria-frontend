import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  Code,
  Database,
  Send,
  BookOpen,
  Bot,
  Clock,
  Trash2,
  RefreshCw,
  Sparkles,
  Loader2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { useToast } from "@/hooks/use-toast";
import {
  ethicsBiasApi,
  type EthicsBiasResponse,
  type EthicsHistoryItem,
  type EthicsIssue,
  type BiasIssue,
  type EthicsProvider,
  type EthicsSeverity,
} from "@/services/api";

/* ── Constants ─────────────────────────────────────────────────────── */

const CONTENT_TYPES = [
  { id: "text", label: "Text", icon: FileText },
  { id: "document", label: "Document", icon: FileText },
  { id: "code", label: "Code", icon: Code },
  { id: "dataset", label: "Dataset", icon: Database },
];

const PROVIDER_OPTIONS: Array<{
  value: EthicsProvider;
  label: string;
  hint: string;
}> = [
  { value: "gemini", label: "Gemini", hint: "Fast, well-rounded analysis" },
  { value: "anthropic", label: "Claude", hint: "Careful, thorough reasoning" },
  {
    value: "perplexity",
    label: "Perplexity",
    hint: "Research-grade with live citations",
  },
];

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
  info: "bg-gray-400",
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-blue-50 text-blue-600 border-blue-200",
  info: "bg-gray-50 text-gray-500 border-gray-200",
};

const sevKey = (s?: string) => (s || "medium").toLowerCase();
const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function relativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const sec = Math.max(0, (Date.now() - then) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 7 * 86400) return `${Math.floor(sec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ── Component ─────────────────────────────────────────────────────── */

const EthicsBiasAgent: React.FC = () => {
  const { toast } = useToast();

  // Input state
  const [activeType, setActiveType] = useState<string>("text");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [guidelinesFocus, setGuidelinesFocus] = useState("");
  const [provider, setProvider] = useState<EthicsProvider>("gemini");

  // Result + processing
  const [result, setResult] = useState<EthicsBiasResponse | null>(null);
  const [busy, setBusy] = useState<null | "analyze" | "suggest" | "citations" | "guidelines">(null);

  // History
  const [history, setHistory] = useState<EthicsHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  /* ── Loaders ─────────────────────────────────────────────── */

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await ethicsBiasApi.listHistory({ limit: 20 });
      setHistory(data.analyses || []);
    } catch (e: any) {
      console.warn("ethics history load failed", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* ── Helpers ─────────────────────────────────────────────── */

  const errorDetail = (e: any): string =>
    e?.response?.data?.detail || e?.message || "Something went wrong";

  // Combine ethics + bias issues for unified display.
  const unifiedIssues = useMemo(() => {
    const r = result?.results;
    if (!r) return [] as Array<EthicsIssue | (BiasIssue & { _category: string })>;
    const ethics = (r.ethics_issues || []).map((i) => ({
      ...i,
      _kind: "ethics" as const,
      _label: cap(i.category) || "Ethics",
    }));
    const bias = (r.bias_issues || []).map((i) => ({
      ...i,
      _kind: "bias" as const,
      _label: `${cap(i.type) || "Bias"} bias`,
    }));
    // Severity order: critical → low → info.
    const order: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    };
    return [...ethics, ...bias].sort(
      (a, b) =>
        (order[sevKey(a.severity)] ?? 5) - (order[sevKey(b.severity)] ?? 5),
    );
  }, [result]);

  const ethicsScore = result?.metadata?.ethics_score;
  const issueCount = unifiedIssues.length || result?.metadata?.issue_count || 0;

  /* ── Actions ─────────────────────────────────────────────── */

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({
        title: "Paste content first",
        description: "Add some text to analyse for ethical issues and bias.",
        variant: "destructive",
      });
      return;
    }
    setBusy("analyze");
    setResult(null);
    setActiveHistoryId(null);
    try {
      const res = await ethicsBiasApi.analyzeContent({
        content,
        content_type: activeType,
        provider,
      });
      setResult(res);
      setActiveHistoryId(res.metadata?.analysis_id || null);
      toast({
        title: "Analysis complete",
        description: res.metadata?.model_name
          ? `Powered by ${res.metadata.model_name}`
          : undefined,
      });
      loadHistory();
    } catch (e: any) {
      toast({
        title: "Analysis failed",
        description: errorDetail(e),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleCheckGuidelines = async () => {
    if (!content.trim()) {
      toast({
        title: "Paste content first",
        description: "Add some text to check against guidelines.",
        variant: "destructive",
      });
      return;
    }
    setBusy("guidelines");
    try {
      const focus = guidelinesFocus
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await ethicsBiasApi.checkGuidelines({
        content,
        guidelines_focus: focus,
        provider,
      });
      setResult(res);
      setActiveHistoryId(res.metadata?.analysis_id || null);
      toast({ title: "Guidelines checked" });
      loadHistory();
    } catch (e: any) {
      toast({
        title: "Check failed",
        description: errorDetail(e),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!unifiedIssues.length) {
      toast({
        title: "No issues yet",
        description: "Run an analysis first to generate suggestions for the issues found.",
        variant: "destructive",
      });
      return;
    }
    setBusy("suggest");
    try {
      // Send the raw issue objects, but pruned to the fields the
      // suggestion prompt actually needs.
      const issues = unifiedIssues.map((i: any) => ({
        kind: i._kind,
        category: i.category,
        type: i.type,
        description: i.description,
        severity: i.severity,
      }));
      const res = await ethicsBiasApi.generateSuggestions({
        issues,
        content,
        provider,
      });
      setResult(res);
      setActiveHistoryId(res.metadata?.analysis_id || null);
      toast({ title: "Suggestions generated" });
      loadHistory();
    } catch (e: any) {
      toast({
        title: "Suggestion generation failed",
        description: errorDetail(e),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleGetCitations = async () => {
    const t = topic.trim();
    if (!t) {
      toast({
        title: "Pick a topic",
        description: "Enter what you want citations for.",
        variant: "destructive",
      });
      return;
    }
    setBusy("citations");
    try {
      const res = await ethicsBiasApi.getCitations({ topic: t, provider });
      setResult(res);
      setActiveHistoryId(res.metadata?.analysis_id || null);
      toast({ title: "Citations ready" });
      loadHistory();
    } catch (e: any) {
      toast({
        title: "Citation lookup failed",
        description: errorDetail(e),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const openHistoryItem = async (id: string) => {
    try {
      const detail = await ethicsBiasApi.getHistoryItem(id);
      const reshaped: EthicsBiasResponse = {
        results: (detail.result?.results as any) || {},
        metadata: {
          ...((detail.result?.metadata as Record<string, any>) || {}),
          analysis_id: detail.id,
          model_provider: detail.model_provider || undefined,
          model_name: detail.model_name || undefined,
          ethics_score: detail.ethics_score ?? undefined,
          issue_count: detail.issue_count,
        },
      };
      setResult(reshaped);
      setActiveHistoryId(id);
      if (detail.content_preview) setContent(detail.content_preview);
      if (detail.content_type) setActiveType(detail.content_type);
      if (
        detail.model_provider === "anthropic" ||
        detail.model_provider === "gemini" ||
        detail.model_provider === "perplexity"
      ) {
        setProvider(detail.model_provider as EthicsProvider);
      }
    } catch (e: any) {
      toast({
        title: "Could not open analysis",
        description: errorDetail(e),
        variant: "destructive",
      });
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await ethicsBiasApi.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (activeHistoryId === id) {
        setActiveHistoryId(null);
        setResult(null);
      }
      toast({ title: "Analysis removed" });
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: errorDetail(e),
        variant: "destructive",
      });
    }
  };

  /* ── Derived UI bits ─────────────────────────────────────── */

  const compliance = result?.results?.compliance;
  const violations = result?.results?.violations || [];
  const suggestions = result?.results?.suggestions || [];
  const citations = result?.results?.citations || [];
  const summary = result?.results?.summary;

  const scoreColor =
    (ethicsScore ?? 100) > 80
      ? "#10b981"
      : (ethicsScore ?? 100) > 60
      ? "#f59e0b"
      : "#ef4444";

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <AgentPageLayout
      agentName="Ethics & Bias Agent"
      tagline="Fair and responsible AI"
      icon={Shield}
      gradient="from-green-500 to-emerald-600"
      status="beta"
    >
      {/* Provider toggle bar */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: input + issues */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900">
                Content Analysis
              </h3>
              <div className="flex gap-1">
                {CONTENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveType(t.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeType === t.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste content to analyse for ethical issues and bias…"
                className="min-h-[160px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={busy !== null}
                  className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs"
                >
                  {busy === "analyze" ? (
                    <>
                      <Loader2 size={12} className="mr-1.5 animate-spin" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      <Send size={12} className="mr-1.5" /> Analyse Content
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCheckGuidelines}
                  disabled={busy !== null}
                  variant="outline"
                  className="border-gray-200 h-9 px-3 text-xs"
                >
                  {busy === "guidelines" ? (
                    <Loader2 size={12} className="mr-1.5 animate-spin" />
                  ) : (
                    <Shield size={12} className="mr-1.5" />
                  )}
                  Check guidelines
                </Button>
              </div>
              <Input
                value={guidelinesFocus}
                onChange={(e) => setGuidelinesFocus(e.target.value)}
                placeholder="Optional: guidelines focus (e.g. GDPR, WCAG, inclusive language)"
                className="mt-2 h-8 text-xs border-gray-200 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                Summary
              </p>
              <p className="text-sm text-emerald-900 leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Issues */}
          {(unifiedIssues.length > 0 || busy === "analyze") && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Issues Found
                </h3>
                {result?.metadata?.ethics_score !== undefined && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-gray-200 text-gray-500"
                  >
                    Score {result.metadata.ethics_score}/100
                  </Badge>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {busy === "analyze" && unifiedIssues.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : unifiedIssues.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle2
                      size={20}
                      className="mx-auto text-emerald-400 mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      No issues detected for this content.
                    </p>
                  </div>
                ) : (
                  unifiedIssues.map((issue: any, i: number) => {
                    const sev = sevKey(issue.severity);
                    return (
                      <motion.div
                        key={`${issue._kind}-${i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[sev]}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${SEVERITY_BADGE[sev]}`}
                              >
                                {cap(sev)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500"
                              >
                                {issue._label}
                              </Badge>
                              {typeof issue.confidence === "number" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400"
                                >
                                  {Math.round(issue.confidence * 100)}% confident
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">
                              {issue.description}
                            </p>
                            {issue.impact && (
                              <p className="text-xs text-gray-500 mt-1">
                                Impact: {issue.impact}
                              </p>
                            )}
                          </div>
                        </div>
                        {(issue.suggestions || []).slice(0, 3).map(
                          (s: string, j: number) => (
                            <div
                              key={j}
                              className="ml-5 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start gap-2 mt-1.5"
                            >
                              <Lightbulb
                                size={12}
                                className="text-emerald-500 shrink-0 mt-0.5"
                              />
                              <p className="text-xs text-emerald-700">{s}</p>
                            </div>
                          ),
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Suggestions block */}
          {suggestions.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  Mitigation suggestions
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          SEVERITY_BADGE[sevKey(s.priority)]
                        }`}
                      >
                        {cap(sevKey(s.priority))} priority
                      </Badge>
                      <p className="text-sm font-medium text-gray-800">
                        {s.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 ml-1">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Violations block */}
          {violations.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  Guideline violations
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {violations.map((v, i) => {
                  const sev = sevKey(v.severity);
                  return (
                    <div key={i} className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${SEVERITY_BADGE[sev]}`}
                        >
                          {cap(sev)}
                        </Badge>
                        <p className="text-sm font-medium text-gray-800">
                          {v.guideline}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 ml-1">
                        {v.description}
                      </p>
                      {v.recommendation && (
                        <p className="text-[11px] text-emerald-700 mt-1.5 ml-1">
                          → {v.recommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Citations block */}
          {citations.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  Citations & references
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {citations.map((c: any, i: number) => (
                  <div key={i} className="p-3">
                    <p className="text-sm font-medium text-gray-800">
                      {c.title || c.name || "Untitled source"}
                    </p>
                    {c.summary && (
                      <p className="text-xs text-gray-600 mt-1">{c.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {c.type && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-gray-200 text-gray-500"
                        >
                          {c.type}
                        </Badge>
                      )}
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Open source ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Ethics Score
            </h3>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg
                className="w-28 h-28 -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeDasharray={`${
                    ((ethicsScore ?? 0) / 100) * 264
                  } 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {ethicsScore ?? "—"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {ethicsScore == null
                ? "Run an analysis to see your score"
                : `Out of 100 · ${issueCount} issue${issueCount === 1 ? "" : "s"} found`}
            </p>
          </div>

          {/* Guidelines compliance */}
          {compliance && Object.keys(compliance).length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Guidelines Compliance
              </h3>
              <div className="space-y-2">
                {Object.entries(compliance).map(([name, data]) => (
                  <div key={name} className="flex items-start gap-2.5">
                    {data.passed ? (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500 shrink-0 mt-0.5"
                      />
                    ) : (
                      <XCircle
                        size={14}
                        className="text-red-400 shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs ${
                          data.passed
                            ? "text-gray-600"
                            : "text-gray-800 font-medium"
                        }`}
                      >
                        {name}
                      </p>
                      {data.notes && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {data.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="space-y-2">
            <Button
              onClick={handleGenerateSuggestions}
              disabled={busy !== null}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs"
            >
              {busy === "suggest" ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <Lightbulb size={14} className="mr-2" />
              )}
              Generate Suggestions
            </Button>
            <div className="bg-white border border-gray-100 rounded-2xl p-3">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic to find citations for…"
                className="h-8 text-xs border-gray-200 bg-gray-50/50 mb-2"
              />
              <Button
                onClick={handleGetCitations}
                disabled={busy !== null}
                variant="outline"
                className="w-full border-gray-200 h-9 text-xs"
              >
                {busy === "citations" ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <BookOpen size={14} className="mr-2" />
                )}
                Get Citations
              </Button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-900">
                Recent Analyses
              </h3>
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
            {historyLoading && history.length === 0 ? (
              <div className="p-6 flex items-center justify-center text-xs text-gray-400 gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center">
                <Sparkles
                  size={20}
                  className="mx-auto text-gray-300 mb-2"
                />
                <p className="text-xs text-gray-500">
                  No analyses yet. Run one above and it will land here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                {history.map((h) => {
                  const isActive = activeHistoryId === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`p-3 flex items-center gap-2.5 transition-colors ${
                        isActive ? "bg-emerald-50/60" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <AlertTriangle
                        size={13}
                        className={
                          isActive ? "text-emerald-600" : "text-gray-300"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => openHistoryItem(h.id)}
                        className="flex-1 min-w-0 text-left"
                        title="Reopen this analysis"
                      >
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {h.title || h.action}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                          <Clock size={9} />
                          {relativeTime(h.created_at)}
                          {typeof h.ethics_score === "number" && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span>Score {h.ethics_score}</span>
                            </>
                          )}
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
                              className="ml-1 h-4 text-[9px] border-red-200 text-red-500"
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
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default EthicsBiasAgent;
