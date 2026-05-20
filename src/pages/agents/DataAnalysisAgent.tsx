import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Upload, TrendingUp, AlertTriangle, Sigma,
  PieChart as PieIcon, LineChart as LineIcon, ScatterChart as ScatterIcon,
  Send, Table as TableIcon, Loader2, Trash2, Sparkles, FileSpreadsheet,
  RefreshCw, Bot, FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import AgentPageLayout from "@/components/AgentPageLayout";
import { toast } from "@/hooks/use-toast";
import {
  dataAnalysisApi,
  type DataAnalysisRun,
  type DataAnalysisRunListItem,
  type DataAnalysisMode,
  type DataAnalysisQuestionTurn,
  type DataAnalysisVisualization,
} from "@/services/api";

// ─── Static UI metadata ──────────────────────────────────────────────

const MODE_TABS: Array<{
  id: DataAnalysisMode;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}> = [
  { id: "exploratory", label: "Exploratory", icon: Sigma, color: "from-blue-500 to-indigo-600", description: "Quick summary and distributions" },
  { id: "statistical", label: "Statistical", icon: Sigma, color: "from-indigo-500 to-violet-600", description: "Hypothesis tests and significance" },
  { id: "anomaly", label: "Anomaly", icon: AlertTriangle, color: "from-red-500 to-rose-600", description: "Outlier detection" },
  { id: "trend", label: "Trend", icon: TrendingUp, color: "from-emerald-500 to-teal-600", description: "Time series and direction" },
  { id: "visualization", label: "Visualization", icon: BarChart3, color: "from-amber-500 to-orange-600", description: "Charts only" },
  { id: "report", label: "Report", icon: FileText, color: "from-violet-500 to-purple-600", description: "Full narrative report" },
];

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899"];

const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".json"];

const QUICK_QUESTIONS = [
  "What's the most important pattern in this data?",
  "Find any outliers I should be aware of",
  "Which column has the strongest trend?",
];

// ─── Helpers ─────────────────────────────────────────────────────────

function formatNumber(value: any): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      const abs = Math.abs(value);
      if (abs >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
      if (abs >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    return "—";
  }
  const num = Number(value);
  if (Number.isFinite(num)) return formatNumber(num);
  return String(value);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const hr = Math.floor(diffMin / 60);
  if (hr < 24) return `${hr}h ago`;
  return d.toLocaleDateString();
}

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

// ─── Component ───────────────────────────────────────────────────────

const DataAnalysisAgent: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<DataAnalysisMode>("exploratory");
  const [activeRun, setActiveRun] = useState<DataAnalysisRun | null>(null);
  const [runs, setRuns] = useState<DataAnalysisRunListItem[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Q&A
  const [nlQuery, setNlQuery] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [conversation, setConversation] = useState<DataAnalysisQuestionTurn[]>([]);

  // Visualization picker (only switches between charts the run produced).
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  // ─── Loaders ───────────────────────────────────────────────────────
  const loadRuns = useCallback(async () => {
    setRunsLoading(true);
    try {
      const result = await dataAnalysisApi.listRuns({ limit: 30 });
      setRuns(result.runs || []);
    } catch (err: any) {
      console.error("Failed to load runs", err);
      if (err?.response?.status !== 403) {
        toast({
          title: "Couldn't load past runs",
          description: err?.response?.data?.detail || err?.message,
          variant: "destructive",
        });
      }
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  // Load conversation history whenever the active run changes.
  useEffect(() => {
    setConversation(activeRun?.question_history || []);
    setActiveChartIndex(0);
  }, [activeRun?.id]);

  // ─── Upload ────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File) => {
    if (!isAllowedFile(file)) {
      toast({
        title: "Unsupported file",
        description: "Upload a CSV, XLSX, XLS, or JSON file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum upload size is 100 MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const run = await dataAnalysisApi.upload(file, mode);
      setActiveRun(run);
      toast({
        title: "Analysis ready",
        description: `${file.name} processed in ${
          run.processing_time_ms ? `${(run.processing_time_ms / 1000).toFixed(1)}s` : "a moment"
        }.`,
      });
      loadRuns();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.response?.data?.detail || err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [mode, loadRuns]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // ─── Regenerate / Delete / Open ───────────────────────────────────
  const handleRegenerate = useCallback(async (overrideMode?: DataAnalysisMode) => {
    if (!activeRun) return;
    const targetMode = overrideMode || mode;
    setRegenerating(true);
    try {
      const updated = await dataAnalysisApi.regenerate(activeRun.id, targetMode);
      setActiveRun(updated);
      setMode(targetMode);
      toast({ title: `Re-ran as ${targetMode}` });
      loadRuns();
    } catch (err: any) {
      toast({
        title: "Regenerate failed",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  }, [activeRun, mode, loadRuns]);

  const [generatingReport, setGeneratingReport] = useState(false);
  const handleGenerateAiReport = useCallback(async () => {
    if (!activeRun) return;
    setGeneratingReport(true);
    try {
      const updated = await dataAnalysisApi.regenerate(activeRun.id, "report");
      setActiveRun(updated);
      setMode("report");
      toast({
        title: "AI Report generated",
        description: updated.ai_summary ? "Scroll to the AI Report panel." : "Report ran but produced no narrative — check provider config.",
      });
      loadRuns();
    } catch (err: any) {
      toast({
        title: "Report failed",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  }, [activeRun, loadRuns]);

  const handleOpenRun = useCallback(async (id: string) => {
    try {
      const run = await dataAnalysisApi.getRun(id);
      setActiveRun(run);
      setMode(run.mode);
    } catch (err: any) {
      toast({
        title: "Failed to open run",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    }
  }, []);

  const handleDeleteRun = useCallback(async (id: string) => {
    if (!window.confirm("Delete this analysis? You can re-upload the file later if needed.")) return;
    try {
      await dataAnalysisApi.deleteRun(id);
      if (activeRun?.id === id) setActiveRun(null);
      loadRuns();
      toast({ title: "Run deleted" });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    }
  }, [activeRun, loadRuns]);

  // ─── Ask About Your Data ──────────────────────────────────────────
  const handleAsk = useCallback(async (question?: string) => {
    const q = (question ?? nlQuery).trim();
    if (!q) return;
    if (!activeRun) {
      toast({
        title: "Upload a file first",
        description: "Drop a file above so the agent has data to answer questions about.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic append.
    const placeholder: DataAnalysisQuestionTurn = {
      question: q,
      answer: "",
      asked_at: new Date().toISOString(),
    };
    setConversation((prev) => [...prev, placeholder]);
    setNlQuery("");
    setAskLoading(true);

    try {
      const turn = await dataAnalysisApi.askAboutData(activeRun.id, q);
      setConversation((prev) => {
        const next = [...prev];
        next[next.length - 1] = turn;
        return next;
      });
    } catch (err: any) {
      setConversation((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          ...placeholder,
          answer:
            err?.response?.data?.detail ||
            err?.message ||
            "Could not generate an answer.",
        };
        return next;
      });
      toast({
        title: "Ask failed",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    } finally {
      setAskLoading(false);
    }
  }, [activeRun, nlQuery]);

  // ─── Derived state ────────────────────────────────────────────────
  const summaryStats = activeRun?.summary_stats;
  const headlineStats = useMemo(() => {
    if (!summaryStats) return null;
    return [
      { label: "Mean", value: summaryStats.mean },
      { label: "Median", value: summaryStats.median },
      { label: "Std Dev", value: summaryStats.std },
      { label: "Min", value: summaryStats.min },
      { label: "Max", value: summaryStats.max },
      { label: "Count", value: summaryStats.count },
    ];
  }, [summaryStats]);

  const visualizations = activeRun?.visualizations || [];
  const activeViz = visualizations[Math.min(activeChartIndex, visualizations.length - 1)];

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <AgentPageLayout
      agentName="Data Analysis Agent"
      tagline="Insights from your data"
      icon={BarChart3}
      gradient="from-blue-500 to-violet-600"
    >
      {/* ── Drop zone ─────────────────────────────────────────────── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white border-2 border-dashed rounded-2xl p-6 text-center mb-6 transition-colors ${
          dragOver ? "border-indigo-400 bg-indigo-50/30" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileInput}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={20} className="text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Analyzing your file...</p>
            <p className="text-xs text-gray-400">This usually takes a few seconds.</p>
          </div>
        ) : (
          <>
            <Upload size={20} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">
              {dragOver ? "Drop to upload" : "Drop your data file here"}
            </p>
            <p className="text-xs text-gray-400 mb-3">CSV, Excel, JSON. Up to 100 MB.</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs"
            >
              Browse Files
            </Button>
          </>
        )}
      </div>

      {/* ── Mode tabs (control current upload + regenerate) ──────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {MODE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            title={t.description}
            className={`group bg-white border rounded-xl p-3 transition-all text-left ${
              mode === t.id ? "border-gray-900 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white mb-2`}>
              <t.icon size={14} />
            </div>
            <p className="text-xs font-medium text-gray-700">{t.label}</p>
          </button>
        ))}
      </div>

      {activeRun && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm flex items-center gap-2">
            <FileSpreadsheet size={13} className="text-indigo-500" />
            <span className="text-xs font-medium text-gray-700">{activeRun.original_filename || activeRun.filename}</span>
            <span className="text-[10px] text-gray-400">
              · {activeRun.row_count?.toLocaleString() || "?"} rows · {activeRun.column_count || "?"} cols
            </span>
          </div>
          <Button
            onClick={() => handleRegenerate()}
            disabled={regenerating || generatingReport || activeRun.mode === mode}
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs border-gray-200"
          >
            {regenerating ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <RefreshCw size={12} className="mr-1.5" />}
            Re-run as {mode}
          </Button>
          <Button
            onClick={handleGenerateAiReport}
            disabled={regenerating || generatingReport}
            size="sm"
            className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            title="Calls the AI to generate a narrative report (slower, ~10-30s)"
          >
            {generatingReport ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Sparkles size={12} className="mr-1.5" />}
            {generatingReport ? "Generating..." : "Generate AI Report"}
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left column ──────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary stats */}
          {headlineStats ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {headlineStats.map((m) => (
                <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center">
                  <p className="text-lg font-bold text-gray-900">{formatNumber(m.value)}</p>
                  <p className="text-[10px] text-gray-400">{m.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCard icon={Sigma} title="Summary stats" body="Upload data to see mean, median, distribution, and counts." />
          )}

          {/* Visualization */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Visualization</h3>
              {visualizations.length > 0 && (
                <div className="flex gap-1">
                  {visualizations.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveChartIndex(i)}
                      title={v.title}
                      className={`p-1.5 rounded-md transition-colors ${
                        activeChartIndex === i ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {iconForVizType(v.type)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 min-h-[280px]">
              {activeViz ? (
                <>
                  <p className="text-xs font-medium text-gray-600 mb-2">{activeViz.title}</p>
                  <div className="h-[260px]">
                    <ChartFromSpec viz={activeViz} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[240px]">
                  <BarChart3 size={40} className="text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 mb-1">Visualization will appear here</p>
                  <p className="text-xs text-gray-300">Upload data to generate charts</p>
                </div>
              )}
            </div>
          </div>

          {/* Ask About Your Data */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ask About Your Data</h3>

            {conversation.length > 0 && (
              <div className="space-y-3 mb-3 max-h-[320px] overflow-y-auto pr-1">
                {conversation.map((turn, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-semibold shrink-0">You</div>
                      <p className="text-xs text-gray-800 leading-relaxed pt-0.5">{turn.question}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Bot size={11} />
                      </div>
                      <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap pt-0.5 flex-1">
                        {turn.answer || (
                          <span className="text-gray-400 inline-flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" /> Thinking...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
              className="flex gap-2"
            >
              <Input
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                disabled={askLoading || !activeRun}
                placeholder={activeRun ? "e.g., What's the top selling product?" : "Upload data to enable this"}
                className="text-sm h-9 border-gray-200 bg-gray-50/50"
              />
              <Button
                type="submit"
                disabled={askLoading || !activeRun || !nlQuery.trim()}
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0"
              >
                {askLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </form>
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  disabled={!activeRun || askLoading}
                  onClick={() => handleAsk(q)}
                  className="px-2 py-1 rounded-md bg-gray-50 text-[10px] text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Past runs */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Past Runs</h3>
              <button onClick={loadRuns} className="text-gray-400 hover:text-gray-700">
                {runsLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              </button>
            </div>
            {runs.length === 0 ? (
              <div className="p-6 text-center">
                <FileSpreadsheet size={20} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">No analyses yet</p>
                <p className="text-[11px] text-gray-400 mt-1">Upload a file to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[280px] overflow-y-auto">
                {runs.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 cursor-pointer transition-colors group flex items-start gap-2 ${
                      activeRun?.id === r.id ? "bg-indigo-50/40 border-l-2 border-l-indigo-400" : "hover:bg-gray-50/40"
                    }`}
                    onClick={() => handleOpenRun(r.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {r.original_filename || r.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          r.status === "ready" ? "bg-emerald-50 text-emerald-700" :
                          r.status === "error" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {r.status}
                        </span>
                        <span className="text-[10px] text-gray-400">{r.mode}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{formatBytes(r.size_bytes)}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{formatRelativeTime(r.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteRun(r.id); }}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data preview */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Data Preview</h3>
              {activeRun?.row_count !== undefined && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Showing first {Math.min(activeRun.preview_rows.length, activeRun.row_count || 0).toLocaleString()} of {activeRun.row_count?.toLocaleString()} rows
                </p>
              )}
            </div>
            {activeRun && activeRun.preview_rows.length > 0 ? (
              <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50/90 backdrop-blur z-10">
                    <tr className="border-b border-gray-100">
                      {activeRun.columns.map((c) => (
                        <th key={c.name} className="p-2 text-left text-gray-400 font-medium whitespace-nowrap">
                          {c.name}
                          <span className="text-[9px] text-gray-300 ml-1">{c.dtype}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeRun.preview_rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {activeRun.columns.map((c) => (
                          <td key={c.name} className="p-2 text-gray-700 whitespace-nowrap">
                            {row[c.name] === null || row[c.name] === undefined ? (
                              <span className="text-gray-300">null</span>
                            ) : typeof row[c.name] === "number" ? (
                              formatNumber(row[c.name])
                            ) : (
                              String(row[c.name])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <TableIcon size={20} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Preview rows will appear here after upload.</p>
              </div>
            )}
          </div>

          {/* Auto Insights */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900">Auto Insights</h3>
            </div>
            {activeRun && activeRun.insights.length > 0 ? (
              <div className="space-y-2">
                {activeRun.insights.map((ins, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      ins.type === "positive" ? "bg-emerald-50 text-emerald-700" :
                      ins.type === "negative" ? "bg-red-50 text-red-700" :
                      "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {ins.text}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">Insights generated by the agent will appear here.</p>
            )}
          </div>

          {/* AI Report panel — only when ai_summary exists (mode=report) */}
          {activeRun?.ai_summary && (
            <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900">AI Report</h3>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {activeRun.mode}
                </span>
              </div>
              <div className="prose prose-sm max-w-none text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                {activeRun.ai_summary}
              </div>
            </div>
          )}

          {/* Anomalies panel */}
          {activeRun?.anomalies && Object.keys(activeRun.anomalies.by_column || {}).length > 0 && (
            <AnomaliesPanel anomalies={activeRun.anomalies} />
          )}

          {/* Trends panel */}
          {activeRun?.trends && Object.keys(activeRun.trends).length > 0 && (
            <TrendsPanel trends={activeRun.trends} />
          )}

          {/* Statistical panel */}
          {activeRun?.statistical_results && Object.keys(activeRun.statistical_results.per_column || {}).length > 0 && (
            <StatisticalPanel stats={activeRun.statistical_results} />
          )}
        </div>
      </div>
    </AgentPageLayout>
  );
};

// ─── Sub components ──────────────────────────────────────────────────

const EmptyCard: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  body: string;
}> = ({ icon: Icon, title, body }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
    <Icon size={20} className="text-gray-300 mx-auto mb-2" />
    <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
    <p className="text-xs text-gray-400">{body}</p>
  </div>
);

const ChartFromSpec: React.FC<{ viz: DataAnalysisVisualization }> = ({ viz }) => {
  const data = (viz.data || []).map((d, idx) => ({
    name: d.name ?? d.x ?? idx,
    value: typeof d.value !== "undefined" ? d.value : d.y,
    x: d.x,
    y: d.y,
  }));

  const numericData = data.filter((d) => typeof d.value === "number" || typeof d.y === "number");

  switch (viz.type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip />
            <Bar dataKey={data[0] && "value" in data[0] && data[0].value !== undefined ? "value" : "y"} fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip />
            <Area type="monotone" dataKey="y" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case "scatter":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="x" stroke="#94a3b8" fontSize={11} />
            <YAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data as any} fill="#6366f1" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    case "pie":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie data={numericData} dataKey="value" nameKey="name" outerRadius={90} label={false}>
              {numericData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return (
        <div className="text-xs text-gray-400 text-center p-6">
          Chart type "{viz.type}" not supported yet.
        </div>
      );
  }
};

// ─── Anomalies / Trends / Statistical panels ────────────────────────

const AnomaliesPanel: React.FC<{
  anomalies: NonNullable<DataAnalysisRun["anomalies"]>;
}> = ({ anomalies }) => {
  const total = anomalies.summary?.total_z_outliers ?? 0;
  const byCol = anomalies.by_column || {};
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-red-500" />
        <h3 className="text-sm font-semibold text-gray-900">Anomalies</h3>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-700">
          {total} flagged
        </span>
      </div>
      {Object.entries(byCol).map(([col, info]) => (
        <div key={col} className="border-b border-gray-50 last:border-0 py-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-800">{col}</p>
            <span className="text-[10px] text-gray-400">
              {info.z_outlier_count ?? 0} z-score · {info.iqr_outlier_count ?? 0} IQR
            </span>
          </div>
          {info.samples && info.samples.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {info.samples.map((s, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded"
                  title={`row ${s.row}`}
                >
                  {formatNumber(s.value)}
                </span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-1">
            Normal range: {formatNumber(info.iqr_lower)} to {formatNumber(info.iqr_upper)}
          </p>
        </div>
      ))}
    </div>
  );
};

const TrendsPanel: React.FC<{
  trends: NonNullable<DataAnalysisRun["trends"]>;
}> = ({ trends }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-emerald-500" />
        <h3 className="text-sm font-semibold text-gray-900">Trends</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(trends).map(([col, info]) => {
          const color =
            info.direction === "increasing" ? "text-emerald-600 bg-emerald-50" :
            info.direction === "decreasing" ? "text-red-600 bg-red-50" :
            "text-gray-500 bg-gray-50";
          const sparkData = (info.rolling_average || []).map((y, x) => ({ x, y }));
          return (
            <div key={col} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-800">{col}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${color}`}>
                  {info.direction}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-1">
                <span>start avg {formatNumber(info.first_quarter_mean)}</span>
                <span>·</span>
                <span>end avg {formatNumber(info.last_quarter_mean)}</span>
                <span>·</span>
                <span>delta {formatNumber(info.delta)}</span>
              </div>
              {sparkData.length > 1 && (
                <div className="h-[40px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke={info.direction === "decreasing" ? "#ef4444" : "#10b981"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatisticalPanel: React.FC<{
  stats: NonNullable<DataAnalysisRun["statistical_results"]>;
}> = ({ stats }) => {
  const tests = (stats.tests || []).filter((t) => !t.warning);
  const warning = (stats.tests || []).find((t) => t.warning)?.warning;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sigma size={14} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-900">Statistical Analysis</h3>
      </div>
      {warning && (
        <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1.5 rounded mb-3">
          {warning}
        </p>
      )}
      {Object.keys(stats.per_column || {}).length > 0 && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400">
                <th className="text-left p-1.5">Column</th>
                <th className="text-right p-1.5">Mean</th>
                <th className="text-right p-1.5">Median</th>
                <th className="text-right p-1.5">Std</th>
                <th className="text-right p-1.5">Skew</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.per_column || {}).map(([col, s]) => (
                <tr key={col} className="border-b border-gray-50">
                  <td className="p-1.5 text-gray-700 font-medium">{col}</td>
                  <td className="p-1.5 text-right text-gray-600">{formatNumber(s.mean)}</td>
                  <td className="p-1.5 text-right text-gray-600">{formatNumber(s.median)}</td>
                  <td className="p-1.5 text-right text-gray-600">{formatNumber(s.std)}</td>
                  <td className="p-1.5 text-right text-gray-600">{formatNumber(s.skew)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tests.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5 font-medium">Hypothesis tests</p>
          <div className="space-y-1">
            {tests.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-600 flex-1">{t.column} ({t.test})</span>
                <span className="font-mono text-gray-500">p={formatNumber(t.p_value)}</span>
                {t.significant_at_0_05 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    significant
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function iconForVizType(type: string): React.ReactNode {
  switch (type) {
    case "bar":
      return <BarChart3 size={14} />;
    case "line":
      return <LineIcon size={14} />;
    case "scatter":
      return <ScatterIcon size={14} />;
    case "pie":
      return <PieIcon size={14} />;
    default:
      return <BarChart3 size={14} />;
  }
}

export default DataAnalysisAgent;
