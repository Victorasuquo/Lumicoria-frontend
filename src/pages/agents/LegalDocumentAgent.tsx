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
  Download, Circle,
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

/* ── Progress stages ──────────────────────────────────────────────── */

interface Stage {
  label: string;
  hint: string;
}

const ANALYSIS_STAGES: Stage[] = [
  { label: "Reading your document", hint: "Pulling text from the file" },
  { label: "Asking the model", hint: "Sending the content for analysis" },
  { label: "Working through the details", hint: "The model is thinking" },
  { label: "Formatting the result", hint: "Almost done" },
];

const ProgressStepper: React.FC<{ index: number }> = ({ index }) => (
  <div className="w-full max-w-sm space-y-2">
    {ANALYSIS_STAGES.map((stage, i) => {
      const done = i < index;
      const active = i === index;
      return (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-0.5">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-300"
              }`}
            >
              {done ? (
                <CheckCircle2 size={11} />
              ) : active ? (
                <Loader2 size={9} className="animate-spin" />
              ) : (
                <Circle size={6} />
              )}
            </div>
            {i < ANALYSIS_STAGES.length - 1 && (
              <div
                className={`w-px h-5 mt-1 ${
                  done ? "bg-emerald-200" : "bg-gray-100"
                }`}
              />
            )}
          </div>
          <div className="flex-1 pb-3">
            <p
              className={`text-sm transition-colors ${
                done
                  ? "text-gray-500"
                  : active
                  ? "text-gray-900 font-medium"
                  : "text-gray-300"
              }`}
            >
              {stage.label}
            </p>
            {active && (
              <p className="text-[11px] text-gray-400 mt-0.5">{stage.hint}</p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

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

  // Processing + stage indicator.  We don't have real per-stage server
  // events yet — instead we drive the stepper from elapsed time so the
  // user always sees something moving while the LLM is thinking.
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

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
    setStageIndex(0);

    // Drive the progress stepper from elapsed time so the user sees
    // movement even though we don't have server-sent stage events.
    // Stages: 0 read → 1 send → 2 model thinking → 3 format.  We start
    // at "read" on the document path, skip directly to "send" when the
    // user pasted inline text.
    const hasDoc = !!libraryDocId.trim();
    const stageTimers: Array<ReturnType<typeof setTimeout>> = [];
    if (hasDoc) {
      stageTimers.push(setTimeout(() => setStageIndex(1), 1800));
      stageTimers.push(setTimeout(() => setStageIndex(2), 4500));
      stageTimers.push(setTimeout(() => setStageIndex(3), 25000));
    } else {
      setStageIndex(1);
      stageTimers.push(setTimeout(() => setStageIndex(2), 1500));
      stageTimers.push(setTimeout(() => setStageIndex(3), 20000));
    }

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
      stageTimers.forEach((t) => clearTimeout(t));
      setIsProcessing(false);
      setStageIndex(0);
    }
  };

  // ── Plain-English report writer (Copy / Export) ─────────────
  //
  // Build a narrative the user can paste into a deck, an email, or
  // open in Word.  Each mode gets its own writeup style so the export
  // reads like a person wrote it — not a JSON dump.

  const pct = (v: any): string => {
    if (typeof v !== "number") return "";
    const n = v >= 0 && v <= 1 ? Math.round(v * 100) : Math.round(v);
    return `${n}%`;
  };

  const cap = (s: string): string =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const sentence = (s: string): string => {
    if (!s) return "";
    const trimmed = s.trim();
    if (!trimmed) return "";
    return /[.!?]$/.test(trimmed) ? trimmed : trimmed + ".";
  };

  // Flatten any shape (string / array / nested object) into a list of
  // paragraph-sized strings.  The LLM sometimes hands us a nested
  // object for "summary" instead of a flat string — without this we
  // end up rendering "[object Object]" in the export.
  const flattenToParagraphs = (v: any): string[] => {
    if (v == null) return [];
    if (typeof v === "string") {
      return v.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
    }
    if (typeof v === "number" || typeof v === "boolean") {
      return [String(v)];
    }
    if (Array.isArray(v)) {
      const out: string[] = [];
      v.forEach((item) => out.push(...flattenToParagraphs(item)));
      return out;
    }
    if (typeof v === "object") {
      const out: string[] = [];
      Object.values(v).forEach((val) => out.push(...flattenToParagraphs(val)));
      return out;
    }
    return [];
  };

  type Section = { heading: string; paragraphs: string[] };

  // Build a structured report (list of sections, each a list of
  // narrative paragraphs).  This is the source of truth for both
  // Copy-as-text and Export-as-Word.
  // Generic walker — mirrors `renderResults` on the page so the
  // export shows exactly what the user sees, nothing more and nothing
  // less.  Every top-level key with content becomes a section; arrays
  // become numbered paragraphs; nested objects become "label: value"
  // lines; empty / N/A values are skipped at every depth.

  const friendly = (key: string): string =>
    cap(key.replace(/_/g, " "));

  // Turn one element of an array (string / number / object) into a
  // single paragraph string.
  const itemToParagraph = (item: any, index: number): string => {
    if (isEmptyValue(item)) return "";
    if (typeof item === "string" || typeof item === "number") {
      return `${index + 1}. ${item}`;
    }
    if (typeof item === "object" && item !== null) {
      const parts = Object.entries(item)
        .filter(([_, v]) => !isEmptyValue(v))
        .map(([k, v]) => {
          if (k === "confidence" || /_confidence$/.test(k)) {
            return `${friendly(k)}: ${pct(v)}`;
          }
          if (typeof v === "object") {
            return `${friendly(k)}: ${flattenToParagraphs(v).join(" ")}`;
          }
          return `${friendly(k)}: ${v}`;
        });
      return `${index + 1}. ${parts.join(". ")}`;
    }
    return "";
  };

  const buildReportSections = (): Section[] => {
    if (!result) return [];
    const data: any = result.results || {};
    const sections: Section[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (isEmptyValue(value)) return;

      const heading = friendly(key);

      if (Array.isArray(value)) {
        const paragraphs = value
          .map((item, i) => itemToParagraph(item, i))
          .filter((p) => p);
        if (paragraphs.length) {
          sections.push({ heading, paragraphs });
        }
        return;
      }

      if (typeof value === "string") {
        const paras = flattenToParagraphs(value);
        if (paras.length) sections.push({ heading, paragraphs: paras });
        return;
      }

      if (typeof value === "object" && value !== null) {
        // Object value: emit each non-empty field as one paragraph
        // like "Field name: value", preserving the same shape the
        // page shows in the gray panel.
        const lines = Object.entries(value as Record<string, any>)
          .filter(([_, v]) => !isEmptyValue(v))
          .map(([k, v]) => {
            if (k === "confidence" || /_confidence$/.test(k)) {
              return `${friendly(k)}: ${pct(v)}`;
            }
            if (typeof v === "object") {
              const inner = flattenToParagraphs(v).join(" ");
              return inner ? `${friendly(k)}: ${inner}` : "";
            }
            return `${friendly(k)}: ${v}`;
          })
          .filter((s) => s);
        if (lines.length) sections.push({ heading, paragraphs: lines });
        return;
      }

      // Scalar value (number / boolean).
      sections.push({ heading, paragraphs: [String(value)] });
    });

    return sections;
  };

  // Plain text version for clipboard.  Matches the page layout
  // exactly — same sections, same content, same order.
  const buildPlainTextReport = (): string => {
    const modeLabel = currentModeConf?.label || "Legal analysis";
    const sections = buildReportSections();
    const stamp = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const lines: string[] = [];
    lines.push("Lumicoria · Legal Agent");
    lines.push(modeLabel);
    lines.push(stamp);
    lines.push("");
    sections.forEach((s) => {
      lines.push(s.heading);
      lines.push("-".repeat(s.heading.length));
      s.paragraphs.forEach((p) => {
        lines.push(p);
        lines.push("");
      });
    });
    return lines.join("\n").replace(/\n{3,}/g, "\n\n");
  };

  // Word-compatible HTML.  Microsoft Word natively opens .doc files
  // that are actually HTML, with the MSO-compatible markup below.
  // No npm dependency needed and the resulting file opens cleanly in
  // Word, Google Docs (after upload), and Pages.
  const buildWordHtmlReport = (): string => {
    const modeLabel = currentModeConf?.label || "Legal analysis";
    const sections = buildReportSections();
    const stamp = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const escape = (s: string) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const bodyParts: string[] = [];

    // Minimal header: "Lumicoria · Legal Agent", the mode title, the date.
    bodyParts.push(`
      <p style="font-size:10pt;color:#555;margin:0 0 2pt 0;">
        Lumicoria · Legal Agent
      </p>
      <h1 style="font-size:20pt;margin:0 0 2pt 0;">${escape(modeLabel)}</h1>
      <p style="font-size:10pt;color:#555;margin:0 0 18pt 0;">${escape(stamp)}</p>
    `);

    sections.forEach((s) => {
      bodyParts.push(`<h2 style="font-size:13pt;margin:16pt 0 6pt 0;">${escape(s.heading)}</h2>`);
      s.paragraphs.forEach((p) => {
        if (!p) return;
        const formatted = escape(p).replace(
          /^(\d+\.)\s+/,
          '<strong>$1</strong> ',
        );
        bodyParts.push(`<p style="margin:0 0 8pt 0;">${formatted}</p>`);
      });
    });

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${escape(`Legal Agent — ${modeLabel}`)}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  @page Section1 { size: 8.5in 11.0in; margin: 1in 1in 1in 1in; }
  div.Section1 { page: Section1; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1f2937; line-height: 1.5; }
</style>
</head>
<body>
<div class="Section1">
${bodyParts.join("\n")}
</div>
</body>
</html>`;
  };

  const handleCopyResults = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildPlainTextReport());
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  const handleExportResults = () => {
    if (!result) return;
    const html = buildWordHtmlReport();
    const modeLabel = currentModeConf?.label || "legal-analysis";
    const filename = `${modeLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${new Date().toISOString().slice(0, 10)}.doc`;
    const blob = new Blob([html], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: filename });
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

  // Keys whose 0..1 values should be shown as a percentage instead of
  // a raw decimal — "extraction confidence: 0.85" is meaningless to
  // most people, "extraction confidence: 85%" is not.
  const CONFIDENCE_KEYS = new Set([
    "confidence",
    "extraction_confidence",
    "analysis_confidence",
    "compliance_confidence",
    "comparison_confidence",
    "summary_confidence",
    "score",
    "risk_threshold",
  ]);

  const isConfidenceKey = (key: string): boolean => {
    const k = key.toLowerCase();
    return CONFIDENCE_KEYS.has(k) || k.endsWith("_confidence");
  };

  const formatPercent = (v: number): string => {
    // Numbers between 0 and 1 are decimals, anything ≥ 1 is already
    // a percentage (e.g. the model wrote 85 instead of 0.85).
    const pct = v >= 0 && v <= 1 ? Math.round(v * 100) : Math.round(v);
    return `${pct}%`;
  };

  const renderScalar = (v: any, key?: string): React.ReactNode => {
    if (typeof v === "number" && key && isConfidenceKey(key)) {
      return formatPercent(v);
    }
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
  // JSON.stringify for nested structures.  `key` is the field name
  // when known, so confidence-style values can be formatted as %.
  const renderAny = (
    v: any,
    depth: number = 0,
    key?: string,
  ): React.ReactNode => {
    if (isEmptyValue(v)) return null;
    if (typeof v === "string") return <span>{v}</span>;
    if (typeof v === "number" || typeof v === "boolean") {
      return <span>{renderScalar(v, key)}</span>;
    }
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
                {renderAny(val, depth + 1, k)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <span>{renderScalar(v, key)}</span>;
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
                  {renderAny(value, 0, key)}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{renderScalar(value, key)}</p>
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
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-5">
                  {currentModeConf?.label || "Running analysis"}
                </p>
                <ProgressStepper index={stageIndex} />
                <p className="text-[10px] text-gray-300 mt-4">
                  Large documents take a little longer — feel free to grab a coffee.
                </p>
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResults}
                        className="h-7 px-2.5 text-[11px] text-gray-400 hover:text-gray-600"
                        title="Copy a readable summary to the clipboard"
                      >
                        <Copy size={12} className="mr-1.5" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExportResults}
                        className="h-7 px-2.5 text-[11px] text-gray-400 hover:text-gray-600"
                        title="Download as a Markdown file"
                      >
                        <Download size={12} className="mr-1.5" />
                        Export
                      </Button>
                    </div>
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
