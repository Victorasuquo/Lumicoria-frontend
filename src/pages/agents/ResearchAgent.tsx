import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe, Search, BookOpen, FileText, Clock,
  CheckCircle2, ExternalLink, Star, ChevronRight, Loader2,
  Copy, AlertTriangle,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { researchApi, ResearchResponse } from "@/services/api";

const researchModes = [
  { id: "web", label: "Web Research", icon: Globe, apiMethod: "query" as const },
  { id: "academic", label: "Academic", icon: BookOpen, apiMethod: "literatureReview" as const },
  { id: "factcheck", label: "Fact Check", icon: AlertTriangle, apiMethod: "factCheck" as const },
];

const typeColors: Record<string, string> = {
  Academic: "bg-blue-50 text-blue-600 border-blue-200",
  Industry: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Report: "bg-violet-50 text-violet-600 border-violet-200",
  Web: "bg-amber-50 text-amber-600 border-amber-200",
};

interface HistoryItem {
  query: string;
  date: string;
  sources: number;
  status: string;
}

const ResearchAgent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState("web");
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState({ researches: 0, sources: 0, reports: 0 });

  const handleResearch = useCallback(async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);

    try {
      const mode = researchModes.find((m) => m.id === activeMode);
      const method = mode?.apiMethod || "query";

      // Simulate step progression while waiting for API
      const stepTimer = setInterval(() => {
        setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 2000);

      const response = await researchApi[method]({
        query: query.trim(),
        depth: "comprehensive",
      });

      clearInterval(stepTimer);
      setCurrentStep(3); // Done
      setResult(response);

      // Update stats
      const sourceCount = response.findings?.sources?.length || response.citations?.length || 0;
      setStats((prev) => ({
        researches: prev.researches + 1,
        sources: prev.sources + sourceCount,
        reports: prev.reports + 1,
      }));

      // Add to history
      setHistory((prev) => [
        {
          query: query.trim(),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          sources: sourceCount,
          status: "Complete",
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Research failed");
      setCurrentStep(-1);
    } finally {
      setIsSearching(false);
    }
  }, [query, activeMode, isSearching]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleResearch();
    }
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Extract sources from result
  const sources = result?.findings?.sources || [];
  const citations = result?.citations || [];
  const keyFindings = result?.findings?.key_findings || [];
  const executiveSummary = result?.findings?.executive_summary || "";
  const subQuestions = result?.sub_questions || [];

  return (
    <AgentPageLayout agentName="Research Agent" tagline="Deep-dive into any topic" icon={Globe} gradient="from-blue-500 to-indigo-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Researches", value: stats.researches.toString(), icon: Search, color: "text-blue-500" },
          { label: "Sources Analyzed", value: stats.sources.toString(), icon: Globe, color: "text-indigo-500" },
          { label: "Reports Generated", value: stats.reports.toString(), icon: FileText, color: "text-emerald-500" },
          { label: "Model", value: result?.model_used?.split("-")[0] || "—", icon: Clock, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex gap-3 mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to research?"
            className="text-sm h-11 border-gray-200 bg-gray-50/50 flex-1"
            disabled={isSearching}
          />
          <Button
            onClick={handleResearch}
            disabled={isSearching || !query.trim()}
            className="bg-gray-900 hover:bg-gray-800 text-white h-11 px-6 text-sm shrink-0"
          >
            {isSearching ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Search size={16} className="mr-2" />}
            {isSearching ? "Researching..." : "Research"}
          </Button>
        </div>
        {/* Mode Tabs */}
        <div className="flex gap-2">
          {researchModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === mode.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              <mode.icon size={12} /> {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress */}
          {currentStep >= 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-6">
                {["Searching", "Analyzing", "Compiling", "Done"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      i < currentStep ? "bg-emerald-100 text-emerald-600" :
                      i === currentStep ? (i === 3 ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600") :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {i < currentStep || (i === currentStep && i === 3) ? (
                        <CheckCircle2 size={12} />
                      ) : i === currentStep ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-xs ${i <= currentStep ? "text-gray-700 font-medium" : "text-gray-400"}`}>{step}</span>
                    {i < 3 && <div className={`w-8 h-0.5 ${i < currentStep ? "bg-emerald-200" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Summary */}
          {executiveSummary && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Executive Summary</h3>
                <button onClick={() => copyText(executiveSummary)} className="text-gray-300 hover:text-gray-500 transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{executiveSummary}</p>
            </motion.div>
          )}

          {/* Results — sources from API */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">
                Research Results {sources.length > 0 && <span className="text-gray-400 font-normal">· {sources.length} sources</span>}
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {sources.length === 0 && !isSearching && (
                <div className="p-8 text-center">
                  <Globe size={24} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Enter a query to start researching</p>
                </div>
              )}
              {isSearching && sources.length === 0 && (
                <div className="p-8 text-center">
                  <Loader2 size={24} className="text-blue-400 mx-auto mb-2 animate-spin" />
                  <p className="text-xs text-gray-400">Searching across the web...</p>
                </div>
              )}
              {sources.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800 flex-1">{r.title || `Source ${i + 1}`}</h4>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 shrink-0 ml-2 mt-0.5">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {r.snippet && <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.snippet}</p>}
                  <div className="flex items-center gap-2">
                    {r.url && <span className="text-[10px] text-gray-400">{new URL(r.url).hostname}</span>}
                    {r.type && (
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[r.type] || typeColors.Web}`}>
                        {r.type}
                      </Badge>
                    )}
                    {r.credibility && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Star size={10} className="text-amber-400" />
                        <span className="text-[10px] text-gray-400">{r.credibility}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {/* Show citations if no sources but citations exist */}
              {sources.length === 0 && citations.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800 flex-1">{c.title || `Citation ${i + 1}`}</h4>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 shrink-0 ml-2 mt-0.5">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {c.text && <p className="text-xs text-gray-500 leading-relaxed mb-2">{c.text}</p>}
                  {c.url && <span className="text-[10px] text-gray-400">{new URL(c.url).hostname}</span>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sub-questions */}
          {subQuestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Questions</h3>
              <div className="space-y-2">
                {subQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleHistoryClick(q)}
                    className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Search size={12} className="text-gray-300 group-hover:text-blue-500 shrink-0" />
                    <span className="text-xs text-gray-600 group-hover:text-gray-800">{q}</span>
                    <ChevronRight size={12} className="text-gray-200 ml-auto shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Key Findings + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Findings */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Findings</h3>
            <div className="space-y-2">
              {keyFindings.length === 0 && (
                <p className="text-xs text-gray-400">Findings will appear here after research</p>
              )}
              {keyFindings.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">{f}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Generate Report */}
          {result?.raw_response && (
            <Button
              onClick={() => copyText(result.raw_response || "")}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs"
            >
              <Copy size={14} className="mr-2" />Copy Full Report
            </Button>
          )}

          {/* Recent Queries */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Queries</h3></div>
            <div className="divide-y divide-gray-50">
              {history.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-400">No queries yet</p>
                </div>
              )}
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => handleHistoryClick(h.query)}
                  className="p-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <Search size={14} className="text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{h.query}</p>
                    <p className="text-[10px] text-gray-400">{h.date} · {h.sources} sources</p>
                  </div>
                  <ChevronRight size={12} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default ResearchAgent;
