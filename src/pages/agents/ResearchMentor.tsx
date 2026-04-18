import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Lightbulb, Microscope, BookOpen, FlaskConical, Compass,
  Brain, Layers, Send, CheckCircle2, Loader2, Copy, Check,
  Clock, Trash2, Download, FileText, FileDown,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { researchMentorApi } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const modes = [
  { id: "problem", label: "Problem Analysis", icon: Microscope, description: "Break down complex problems into manageable components", color: "from-red-500 to-rose-600", apiMode: "problem_analysis" },
  { id: "planning", label: "Research Planning", icon: Compass, description: "Create structured research plans and methodologies", color: "from-blue-500 to-indigo-600", apiMode: "research_planning" },
  { id: "literature", label: "Literature Review", icon: BookOpen, description: "Guide through literature review with critical analysis", color: "from-emerald-500 to-teal-600", apiMode: "literature_review" },
  { id: "hypothesis", label: "Hypothesis Dev.", icon: FlaskConical, description: "Develop and refine research hypotheses", color: "from-violet-500 to-purple-600", apiMode: "hypothesis_development" },
  { id: "methodology", label: "Methodology", icon: Layers, description: "Guidance on research methodology and methods", color: "from-amber-500 to-orange-600", apiMode: "methodology_guidance" },
  { id: "evaluation", label: "Critical Evaluation", icon: Brain, description: "Evaluate research and evidence critically", color: "from-pink-500 to-rose-600", apiMode: "critical_evaluation" },
  { id: "synthesis", label: "Synthesis", icon: Lightbulb, description: "Synthesize research findings and insights", color: "from-cyan-500 to-blue-600", apiMode: "synthesis" },
];

const MODE_LABELS: Record<string, string> = {
  problem_analysis: "Problem Analysis",
  research_planning: "Research Planning",
  literature_review: "Literature Review",
  hypothesis_development: "Hypothesis Dev.",
  methodology_guidance: "Methodology",
  critical_evaluation: "Critical Evaluation",
  synthesis: "Synthesis",
};

const ResearchMentor: React.FC = () => {
  const [activeMode, setActiveMode] = useState("problem");
  const [input, setInput] = useState("");
  const [field, setField] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [_result, setResult] = useState<any>(null);
  const [rawContent, setRawContent] = useState("");
  const [resultMetadata, setResultMetadata] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const [completedModes, setCompletedModes] = useState<Set<string>>(new Set());

  // Load history and stats on mount
  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await researchMentorApi.getHistory(20, 0);
      setHistory(data);
      // Track which modes have been used for the checklist
      const usedModes = new Set<string>(data.map((h: any) => h.mode));
      setCompletedModes(usedModes);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await researchMentorApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const extractContent = (result: any): string => {
    const results = result?.results || {};
    const contentKeys = ["analysis", "plan", "review", "hypothesis", "methodology", "evaluation", "synthesis"];
    for (const key of contentKeys) {
      const val = results[key];
      if (val) {
        return typeof val === "string" ? val : val.content || JSON.stringify(val);
      }
    }
    return result?.raw_content || "";
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setRawContent("");

    const currentMode = modes.find(m => m.id === activeMode);
    if (!currentMode) return;

    const researchContext = {
      research_level: experienceLevel,
      field: field || "general",
      user_experience: experienceLevel,
    };

    try {
      let response: any;
      const basePayload = { research_context: researchContext, parameters: {} };

      switch (currentMode.apiMode) {
        case "problem_analysis":
          response = await researchMentorApi.analyzeProblem({
            problem: input,
            context: {},
            constraints: {},
            objectives: [],
            ...basePayload,
          });
          break;
        case "research_planning":
          response = await researchMentorApi.planResearch({
            research_question: input,
            objectives: [],
            constraints: {},
            timeline: {},
            ...basePayload,
          });
          break;
        case "literature_review":
          response = await researchMentorApi.reviewLiterature({
            topic: input,
            scope: {},
            sources: [],
            focus_areas: [],
            ...basePayload,
          });
          break;
        case "hypothesis_development":
          response = await researchMentorApi.developHypothesis({
            research_question: input,
            background: {},
            variables: [],
            constraints: {},
            ...basePayload,
          });
          break;
        case "methodology_guidance":
          response = await researchMentorApi.guideMethodology({
            research_type: input,
            objectives: [],
            constraints: {},
            resources: {},
            ...basePayload,
          });
          break;
        case "critical_evaluation":
          response = await researchMentorApi.evaluateCritically({
            research: { content: input },
            criteria: [],
            context: {},
            focus_areas: [],
            ...basePayload,
          });
          break;
        case "synthesis":
          response = await researchMentorApi.synthesize({
            findings: [{ content: input }],
            context: {},
            objectives: [],
            constraints: {},
            ...basePayload,
          });
          break;
      }

      setResult(response);
      const content = extractContent(response);
      setRawContent(content);
      // Store response metadata (scores, counts, etc.)
      const resMeta = response?.results?.metadata || {};
      setResultMetadata(resMeta);
      // Mark this mode as completed in checklist
      setCompletedModes(prev => new Set([...prev, currentMode.apiMode]));
      // Refresh history after new result
      loadHistory();
      loadStats();
    } catch (err: any) {
      console.error("Research mentor request failed:", err);
      setRawContent(`Error: ${err?.response?.data?.detail || err.message || "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      const data = await researchMentorApi.getDetail(sessionId);
      setResult(data);
      const content = extractContent(data);
      setRawContent(content);
      // Set active mode to match
      const modeMatch = modes.find(m => m.apiMode === data.mode);
      if (modeMatch) setActiveMode(modeMatch.id);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await researchMentorApi.deleteSession(sessionId);
      setHistory(prev => prev.filter(h => h.id !== sessionId));
      loadStats();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF();
    const modeLabel = modes.find(m => m.id === activeMode)?.label || "Research Mentor";
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    const maxY = pageHeight - margin;

    // Title
    doc.setFontSize(16);
    doc.text(modeLabel, margin, margin);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Research Mentor — ${new Date().toLocaleDateString()}`, margin, margin + 8);
    doc.setTextColor(0);

    // Body with multi-page support
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(rawContent, 170);
    let y = margin + 18;

    for (const line of lines) {
      if (y + lineHeight > maxY) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(`research-mentor-${activeMode}.pdf`);
    setShowExport(false);
  };

  const exportDOCX = async () => {
    const modeLabel = modes.find(m => m.id === activeMode)?.label || "Research Mentor";
    const paragraphs: any[] = [
      new Paragraph({ children: [new TextRun({ text: modeLabel, bold: true, size: 32 })] }),
      new Paragraph({ children: [new TextRun({ text: `Research Mentor — ${new Date().toLocaleDateString()}`, size: 18, color: "888888" })] }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
    ];

    for (const line of rawContent.split("\n")) {
      if (line.startsWith("### ")) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.replace(/^###\s*/, ""), bold: true, size: 24 })] }));
      } else if (line.startsWith("## ")) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.replace(/^##\s*/, ""), bold: true, size: 28 })] }));
      } else if (line.startsWith("# ")) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.replace(/^#\s*/, ""), bold: true, size: 32 })] }));
      } else if (line.match(/^\s*[-*]\s/)) {
        const text = line.replace(/^\s*[-*]\s*/, "");
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: `  •  ${text}`, size: 22 })],
        }));
      } else if (line.match(/^\s*\d+[\.\)]\s/)) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: `  ${line.trim()}`, size: 22 })] }));
      } else if (line.trim() === "") {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
      } else {
        // Handle **bold** within lines
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const runs = parts.map(part => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return new TextRun({ text: part.slice(2, -2), bold: true, size: 22 });
          }
          return new TextRun({ text: part, size: 22 });
        });
        paragraphs.push(new Paragraph({ children: runs }));
      }
    }

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `research-mentor-${activeMode}.docx`);
    setShowExport(false);
  };

  const exportMarkdown = () => {
    const blob = new Blob([rawContent], { type: "text/markdown" });
    saveAs(blob, `research-mentor-${activeMode}.md`);
    setShowExport(false);
  };

  return (
    <AgentPageLayout agentName="Research Mentor" tagline="Guided research excellence" icon={Lightbulb} gradient="from-yellow-500 to-amber-600">
      {/* Mode Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`group relative bg-white border rounded-xl p-3 transition-all text-left ${
              activeMode === mode.id ? "border-gray-900 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center text-white mb-2`}>
              <mode.icon size={14} />
            </div>
            <p className="text-[11px] font-medium text-gray-700 leading-tight">{mode.label}</p>
            {activeMode === mode.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-900" />}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input Area */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{modes.find(m => m.id === activeMode)?.label}</h3>
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-200 text-gray-500">Active</Badge>
              </div>
            </div>
            <div className="p-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeMode === "problem" ? "Describe the problem you want to analyze..." :
                  activeMode === "planning" ? "What is your main research question?" :
                  activeMode === "literature" ? "What topic would you like to review?" :
                  activeMode === "hypothesis" ? "Describe your research question and background..." :
                  activeMode === "methodology" ? "What type of research are you conducting?" :
                  activeMode === "evaluation" ? "Paste the research or evidence to evaluate..." :
                  "Share the findings you want to synthesize..."
                }
                className="min-h-[140px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setExperienceLevel(level)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors capitalize ${
                        experienceLevel === level
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading}
                  className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs"
                >
                  {loading ? (
                    <><Loader2 size={12} className="mr-1.5 animate-spin" /> Processing...</>
                  ) : (
                    <><Send size={12} className="mr-1.5" /> Get Guidance</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Guidance Results */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Mentor Guidance</h3>
              {rawContent && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400" />}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowExport(!showExport)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Export"
                    >
                      <Download size={14} className="text-gray-400" />
                    </button>
                    {showExport && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                        <button onClick={exportPDF} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2">
                          <FileText size={12} /> Export PDF
                        </button>
                        <button onClick={exportDOCX} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2">
                          <FileDown size={12} /> Export DOCX
                        </button>
                        <button onClick={exportMarkdown} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2">
                          <FileText size={12} /> Export Markdown
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-amber-500 mr-3" />
                  <span className="text-sm text-gray-500">Analyzing your research query...</span>
                </div>
              ) : rawContent ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rawContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Lightbulb size={32} className="mx-auto mb-3 text-amber-300" />
                  <p className="text-sm">Select a mode and describe your research query to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Context & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Research Context */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Research Context</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Field</label>
                <Input
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="mt-1 text-sm h-8 border-gray-200 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Experience Level</label>
                <div className="flex gap-2 mt-1">
                  {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setExperienceLevel(l)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors capitalize ${
                        experienceLevel === l ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Description */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">About this Mode</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{modes.find(m => m.id === activeMode)?.description}</p>
          </div>

          {/* Stats */}
          {stats && stats.total_sessions > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Usage Stats</h3>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Total sessions: <span className="font-medium text-gray-700">{stats.total_sessions}</span></p>
                {stats.mode_counts && Object.entries(stats.mode_counts).map(([mode, count]) => (
                  <p key={mode}>{MODE_LABELS[mode] || mode}: <span className="font-medium text-gray-700">{count as number}</span></p>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Sessions</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => handleLoadSession(item.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-gray-200 text-gray-500">
                        {MODE_LABELS[item.mode] || item.mode}
                      </Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">{item.input_summary || "Session"}</p>
                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={8} /> {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Progress Checklist — dynamic based on modes used */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Research Progress</h3>
            <div className="space-y-2">
              {[
                { label: "Analyze problem", mode: "problem_analysis" },
                { label: "Plan research", mode: "research_planning" },
                { label: "Review literature", mode: "literature_review" },
                { label: "Develop hypothesis", mode: "hypothesis_development" },
                { label: "Choose methodology", mode: "methodology_guidance" },
                { label: "Evaluate critically", mode: "critical_evaluation" },
                { label: "Synthesize findings", mode: "synthesis" },
              ].map((item) => {
                const done = completedModes.has(item.mode);
                return (
                  <div key={item.mode} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${done ? "border-emerald-400 bg-emerald-400" : "border-gray-200"}`}>
                      {done && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs ${done ? "text-gray-400 line-through" : "text-gray-600"}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">{completedModes.size}/7 steps completed</p>
          </div>

          {/* Response Metadata — shown after a result */}
          {resultMetadata && Object.keys(resultMetadata).length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Analysis Details</h3>
              <div className="space-y-1.5">
                {Object.entries(resultMetadata).map(([key, value]) => {
                  if (value === "" || value === 0 || value === null) return null;
                  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length === 0) return null;
                  if (Array.isArray(value) && value.length === 0) return null;
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

                  // Format the display value
                  let displayValue: string;
                  if (typeof value === "number") {
                    displayValue = value % 1 === 0 ? String(value) : (value as number).toFixed(2);
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(", ");
                  } else if (typeof value === "object" && value !== null) {
                    // Nested object (e.g. bias assessment) — show key details
                    const obj = value as Record<string, any>;
                    if (obj.risk_level) {
                      displayValue = `${obj.risk_level} (${obj.bias_count || 0} found)`;
                    } else {
                      displayValue = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(", ");
                    }
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-700 text-right max-w-[60%] truncate" title={displayValue}>{displayValue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default ResearchMentor;
