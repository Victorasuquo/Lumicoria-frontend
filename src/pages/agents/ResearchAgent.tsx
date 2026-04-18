import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe, Search, BookOpen, FileText, Clock,
  CheckCircle2, ExternalLink, ChevronRight, Loader2,
  Copy, AlertTriangle, Trash2, GitCompareArrows, Layers, Lightbulb,
  Download, FileDown,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { researchApi, ResearchResponse, ResearchHistoryItem, ResearchStats } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const researchModes = [
  { id: "web", label: "Web Research", icon: Globe, apiMethod: "query" as const },
  { id: "topic", label: "Topic", icon: Lightbulb, apiMethod: "topic" as const },
  { id: "academic", label: "Academic", icon: BookOpen, apiMethod: "literatureReview" as const },
  { id: "factcheck", label: "Fact Check", icon: AlertTriangle, apiMethod: "factCheck" as const },
  { id: "compare", label: "Compare Sources", icon: GitCompareArrows, apiMethod: "compareSources" as const },
  { id: "deep", label: "Deep Research", icon: Layers, apiMethod: "comprehensive" as const },
];

const typeLabels: Record<string, string> = {
  general: "Web",
  topic_research: "Topic",
  literature_review: "Academic",
  fact_checking: "Fact Check",
  source_comparison: "Compare",
  comprehensive: "Deep",
};

const ResearchAgent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState("web");
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [stats, setStats] = useState<ResearchStats>({ total_researches: 0, total_sources: 0, research_types: {} });

  // Load history + stats on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [h, s] = await Promise.all([researchApi.getHistory(), researchApi.getStats()]);
        setHistory(h);
        setStats(s);
      } catch {
        // silent — history/stats are non-critical
      }
    };
    load();
  }, []);

  const handleResearch = useCallback(async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);

    try {
      const mode = researchModes.find((m) => m.id === activeMode);
      const method = mode?.apiMethod || "query";

      const stepTimer = setInterval(() => {
        setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 2000);

      const response = await researchApi[method]({
        query: query.trim(),
        depth: "comprehensive",
      });

      clearInterval(stepTimer);
      setCurrentStep(3);
      setResult(response);

      // Refresh history + stats from DB
      const [h, s] = await Promise.all([researchApi.getHistory(), researchApi.getStats()]);
      setHistory(h);
      setStats(s);
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

  const handleHistoryClick = async (item: ResearchHistoryItem) => {
    try {
      const detail = await researchApi.getDetail(item.id);
      setResult(detail);
      setQuery(item.query);
      setCurrentStep(3);
    } catch {
      // If fetch fails just populate the query
      setQuery(item.query);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await researchApi.deleteResearch(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      const s = await researchApi.getStats();
      setStats(s);
    } catch {
      // silent
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getExportFilename = () => {
    const slug = (result?.query || "research").slice(0, 40).replace(/[^a-zA-Z0-9]+/g, "_");
    return `Lumicoria_Research_${slug}`;
  };

  const exportAsText = () => {
    if (!rawResponse) return;
    const blob = new Blob([rawResponse], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getExportFilename()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsPDF = async () => {
    if (!rawResponse) return;
    setShowExportMenu(false);
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(result?.query || "Research Report", maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 4;

    // Meta line
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Model: ${result?.model_used || "—"}  |  Type: ${result?.research_type || "—"}  |  ${new Date().toLocaleDateString()}`, margin, y);
    y += 8;
    doc.setTextColor(0, 0, 0);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Body — strip markdown syntax for clean PDF
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const cleanText = rawResponse
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
    const bodyLines = doc.splitTextToSize(cleanText, maxWidth);

    for (const line of bodyLines) {
      if (y > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, margin, y);
      y += 5;
    }

    // Citations
    if (citations.length > 0) {
      if (y > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); y = 15; }
      y += 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Sources", margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 180);
      for (const c of citations) {
        if (y > doc.internal.pageSize.getHeight() - 10) { doc.addPage(); y = 15; }
        const label = c.title || c.url || "Source";
        const cLines = doc.splitTextToSize(`• ${label}`, maxWidth);
        doc.text(cLines, margin, y);
        y += cLines.length * 4.5 + 1;
      }
    }

    doc.save(`${getExportFilename()}.pdf`);
  };

  const exportAsDocx = async () => {
    if (!rawResponse) return;
    setShowExportMenu(false);
    const docx = await import("docx");
    const { saveAs } = await import("file-saver");

    const children: any[] = [];

    // Title
    children.push(
      new docx.Paragraph({
        children: [new docx.TextRun({ text: result?.query || "Research Report", bold: true, size: 32 })],
        spacing: { after: 200 },
      })
    );

    // Meta
    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Model: ${result?.model_used || "—"}  |  Type: ${result?.research_type || "—"}  |  ${new Date().toLocaleDateString()}`,
            size: 18,
            color: "888888",
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Body — split by lines, detect markdown headings
    for (const line of rawResponse.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        children.push(new docx.Paragraph({ spacing: { after: 100 } }));
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        children.push(
          new docx.Paragraph({
            children: [new docx.TextRun({ text: headingMatch[2], bold: true, size: level === 1 ? 28 : level === 2 ? 24 : 22 })],
            spacing: { before: 200, after: 100 },
          })
        );
      } else {
        // Strip inline markdown
        const clean = trimmed
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/`([^`]+)`/g, "$1");
        const isBullet = /^[-•*]\s/.test(clean);
        children.push(
          new docx.Paragraph({
            children: [new docx.TextRun({ text: isBullet ? clean.replace(/^[-•*]\s/, "") : clean, size: 22 })],
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { after: 60 },
          })
        );
      }
    }

    // Citations section
    if (citations.length > 0) {
      children.push(
        new docx.Paragraph({
          children: [new docx.TextRun({ text: "Sources", bold: true, size: 26 })],
          spacing: { before: 300, after: 100 },
        })
      );
      for (const c of citations) {
        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: c.title || c.url || "Source", size: 20 }),
              ...(c.url ? [new docx.TextRun({ text: `  ${c.url}`, size: 18, color: "4466CC" })] : []),
            ],
            bullet: { level: 0 },
            spacing: { after: 40 },
          })
        );
      }
    }

    const doc = new docx.Document({
      sections: [{ properties: {}, children }],
    });

    const blob = await docx.Packer.toBlob(doc);
    saveAs(blob, `${getExportFilename()}.docx`);
  };

  const citations = result?.citations || [];
  const keyFindings = result?.findings?.key_findings || [];
  const subQuestions = result?.sub_questions || [];
  const rawResponse = result?.raw_response || "";

  return (
    <AgentPageLayout agentName="Research Agent" tagline="Deep-dive into any topic" icon={Globe} gradient="from-blue-500 to-indigo-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Researches", value: stats.total_researches.toString(), icon: Search, color: "text-blue-500" },
          { label: "Sources Found", value: stats.total_sources.toString(), icon: Globe, color: "text-indigo-500" },
          { label: "Reports", value: stats.total_researches.toString(), icon: FileText, color: "text-emerald-500" },
          { label: "Model", value: result?.model_used || "—", icon: Clock, color: "text-amber-500" },
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

          {/* Research Report Content */}
          {rawResponse ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50/60 to-sky-50 border border-blue-100/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-blue-100/40 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Research Report</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => copyText(rawResponse)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors" title="Copy to clipboard">
                      <Copy size={14} />
                    </button>
                    <div className="relative" ref={exportRef}>
                      <button
                        onClick={() => setShowExportMenu((v) => !v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
                        title="Export report"
                      >
                        <Download size={14} />
                      </button>
                      <AnimatePresence>
                        {showExportMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[160px]"
                          >
                            <button onClick={exportAsPDF} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                              <FileDown size={13} className="text-red-400" /> Export as PDF
                            </button>
                            <button onClick={exportAsDocx} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                              <FileText size={13} className="text-blue-400" /> Export as DOCX
                            </button>
                            <button onClick={exportAsText} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                              <FileDown size={13} className="text-gray-400" /> Export as Markdown
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="p-5 max-h-[600px] overflow-y-auto prose prose-sm max-w-none text-[13px] leading-relaxed
                      prose-headings:text-gray-900 prose-headings:font-semibold
                      prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                      prose-p:text-gray-700 prose-p:mb-3
                      prose-li:text-gray-700 prose-li:marker:text-blue-400
                      prose-strong:text-gray-900
                      prose-code:text-indigo-700 prose-code:bg-indigo-100/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-blue-300 prose-blockquote:text-gray-600 prose-blockquote:bg-blue-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-3
                      prose-hr:border-blue-100
                      prose-table:text-xs
                      prose-th:text-gray-800 prose-th:bg-blue-50/70
                      prose-td:text-gray-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {rawResponse}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : !isSearching ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
              <Globe size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Enter a query to start researching</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
              <Loader2 size={24} className="text-blue-400 mx-auto mb-2 animate-spin" />
              <p className="text-xs text-gray-400">Searching across the web...</p>
            </div>
          )}

          {/* Sources / Citations */}
          {citations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  Sources <span className="text-gray-400 font-normal">· {citations.length}</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {citations.map((c, i) => {
                  let hostname = "";
                  try { if (c.url) hostname = new URL(c.url).hostname; } catch { /* invalid url */ }
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="p-3 hover:bg-gray-50/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-medium shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-700 truncate">{c.title || hostname || `Source ${i + 1}`}</h4>
                          {c.url && <p className="text-[10px] text-gray-400 truncate">{c.url}</p>}
                        </div>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 shrink-0">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      {c.text && <p className="text-[11px] text-gray-500 mt-1 pl-7 line-clamp-2">{c.text}</p>}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Related Questions */}
          {subQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-violet-50 border border-purple-100/60 shadow-sm overflow-hidden"
            >
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Lightbulb size={12} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Related Questions</h3>
              </div>
              <div className="px-3 pb-3 space-y-1.5">
                {subQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setQuery(q)}
                    className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-purple-100/40 hover:border-purple-200 transition-all group"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-xs text-gray-700 leading-relaxed group-hover:text-gray-900 prose prose-sm prose-strong:text-purple-700 prose-strong:font-semibold max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{q}</ReactMarkdown>
                    </span>
                    <ChevronRight size={13} className="text-purple-200 group-hover:text-purple-500 shrink-0 mt-0.5 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Key Findings + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Findings */}
          {keyFindings.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Findings</h3>
              <div className="space-y-2">
                {keyFindings.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">{f}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Queries — from MongoDB */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Queries</h3></div>
            <div className="divide-y divide-gray-50">
              {history.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-400">No queries yet</p>
                </div>
              )}
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => handleHistoryClick(h)}
                  className="p-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                >
                  <Search size={14} className="text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{h.query}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" · "}{h.sources_count} sources
                      {" · "}<span className="text-blue-400">{typeLabels[h.research_type] || h.research_type}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(h.id, e)}
                    className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight size={12} className="text-gray-300 shrink-0" />
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
