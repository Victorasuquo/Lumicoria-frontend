import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Scale, Upload, AlertTriangle, CheckCircle2, FileText,
  ChevronRight, Eye, Shield, Loader2, Copy, ArrowRightLeft,
  BookOpen, Gavel, X,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { legalApi, LegalDocumentResponse } from "@/services/api";

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

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Results
  const [result, setResult] = useState<LegalDocumentResponse | null>(null);
  const [history, setHistory] = useState<
    Array<{ mode: AnalysisMode; label: string; timestamp: string; result: LegalDocumentResponse }>
  >([]);

  /* ── API calls ─────────────────────────────────────────────── */

  const handleAnalyze = async () => {
    if (!selectedMode) return;

    if (selectedMode === "compare") {
      if (!compareOld.trim() || !compareNew.trim()) {
        toast({ title: "Paste both document versions", variant: "destructive" });
        return;
      }
    } else {
      if (!documentText.trim()) {
        toast({ title: "Paste or type your legal document first", variant: "destructive" });
        return;
      }
    }

    setIsProcessing(true);
    setResult(null);

    try {
      let response: LegalDocumentResponse;

      switch (selectedMode) {
        case "clauses":
          response = await legalApi.extractClauses({
            data: { document_text: documentText },
            include_metadata: true,
            highlight_obligations: true,
            extract_dates: true,
          });
          break;

        case "risks":
          response = await legalApi.analyzeRisks({
            data: { document_text: documentText },
            risk_threshold: 0.7,
            include_recommendations: true,
            categorize_risks: true,
          });
          break;

        case "plain":
          response = await legalApi.plainLanguage({
            data: { document_text: documentText },
            simplify_terms: true,
            include_examples: true,
            maintain_legal_accuracy: true,
          });
          break;

        case "compliance":
          response = await legalApi.checkCompliance({
            data: { document_text: documentText },
            jurisdiction,
            industry_specific: true,
            include_citations: true,
          });
          break;

        case "compare":
          response = await legalApi.compareVersions({
            data: {},
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

      const modeConf = modes.find((m) => m.key === selectedMode)!;
      setHistory((prev) => [
        {
          mode: selectedMode,
          label: modeConf.label,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          result: response,
        },
        ...prev,
      ]);

      toast({ title: `${modeConf.label} complete` });
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

  const renderResults = () => {
    if (!result) return null;
    const data = result.results;

    // Try to render structured results intelligently
    if (typeof data === "object" && data !== null) {
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {key.replace(/_/g, " ")}
              </h4>
              {Array.isArray(value) ? (
                <div className="space-y-2">
                  {value.map((item: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700"
                    >
                      {typeof item === "string" ? (
                        <p>{item}</p>
                      ) : typeof item === "object" ? (
                        <div className="space-y-1">
                          {Object.entries(item).map(([k, v]) => (
                            <div key={k} className="flex items-start gap-2">
                              <span className="text-[10px] font-medium text-gray-400 uppercase min-w-[80px] shrink-0 mt-0.5">
                                {k.replace(/_/g, " ")}
                              </span>
                              <span className="text-xs text-gray-700">
                                {typeof v === "string" || typeof v === "number"
                                  ? String(v)
                                  : JSON.stringify(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{String(item)}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : typeof value === "string" ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                  {value}
                </p>
              ) : typeof value === "object" && value !== null ? (
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  {Object.entries(value).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="text-[10px] font-medium text-gray-400 uppercase min-w-[80px] shrink-0 mt-0.5">
                        {k.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-700">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{String(value)}</p>
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

        {/* Document Input */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6 max-w-3xl mx-auto">
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
        {history.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Recent Analyses</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {history.slice(0, 5).map((h, i) => {
                  const mc = modes.find((m) => m.key === h.mode)!;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedMode(h.mode);
                        setResult(h.result);
                      }}
                      className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${mc.bg} flex items-center justify-center shrink-0`}>
                        <mc.icon size={14} className={mc.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{h.label}</p>
                        <p className="text-[11px] text-gray-400">{h.timestamp}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
        {/* Mode switcher pills */}
        <div className="flex gap-1.5 ml-auto">
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
              <div className="p-3 border-b border-gray-50">
                <h3 className="text-xs font-semibold text-gray-900">History</h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
                {history.map((h, i) => {
                  const mc = modes.find((m) => m.key === h.mode)!;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedMode(h.mode);
                        setResult(h.result);
                      }}
                      className="p-3 flex items-center gap-2.5 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <div className={`w-6 h-6 rounded-md ${mc.bg} flex items-center justify-center shrink-0`}>
                        <mc.icon size={11} className={mc.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{h.label}</p>
                        <p className="text-[10px] text-gray-400">{h.timestamp}</p>
                      </div>
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

                {/* Metadata */}
                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mt-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">Metadata</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.metadata).map(([k, v]) => (
                        <Badge
                          key={k}
                          variant="outline"
                          className="text-[10px] px-2 py-0.5 border-gray-200 text-gray-500"
                        >
                          {k.replace(/_/g, " ")}: {typeof v === "string" || typeof v === "number" ? String(v) : "…"}
                        </Badge>
                      ))}
                    </div>
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
