import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen, TrendingUp, Clock,
  FileText, BookMarked,
  Send, Loader2, Copy, Check, Trash2, Download, FileDown,
  CheckCircle2, GraduationCap, Brain, ListChecks, Compass,
  Sparkles,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { learningCoachApi } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const modes = [
  { id: "learning_path", label: "Learning Path", icon: Compass, description: "Create a personalized learning path based on your goals and current level", color: "from-teal-500 to-emerald-600" },
  { id: "quiz_generation", label: "Quiz Generator", icon: ListChecks, description: "Generate quizzes and exercises for knowledge retention", color: "from-blue-500 to-indigo-600" },
  { id: "concept_explanation", label: "Explain Concept", icon: Brain, description: "Get clear explanations of complex concepts with examples", color: "from-violet-500 to-purple-600" },
  { id: "progress_tracking", label: "Track Progress", icon: TrendingUp, description: "Track learning progress and get improvement suggestions", color: "from-amber-500 to-orange-600" },
  { id: "resource_recommendation", label: "Resources", icon: BookMarked, description: "Get recommended learning resources across different formats", color: "from-pink-500 to-rose-600" },
  { id: "adaptive_learning", label: "Adaptive Learning", icon: Sparkles, description: "Adapt content based on your performance and preferences", color: "from-cyan-500 to-blue-600" },
];

const MODE_LABELS: Record<string, string> = {
  learning_path: "Learning Path",
  quiz_generation: "Quiz Generator",
  concept_explanation: "Concept Explanation",
  progress_tracking: "Progress Tracking",
  resource_recommendation: "Resources",
  adaptive_learning: "Adaptive Learning",
};

const LearningCoach: React.FC = () => {
  const [activeMode, setActiveMode] = useState("learning_path");
  const [input, setInput] = useState("");
  const [learningLevel, setLearningLevel] = useState("beginner");
  const [learningStyle, setLearningStyle] = useState("visual");
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
      const data = await learningCoachApi.getHistory(20, 0);
      setHistory(data);
      const usedModes = new Set<string>(data.map((h: any) => h.mode));
      setCompletedModes(usedModes);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await learningCoachApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const extractContent = (result: any): string => {
    const results = result?.results || {};
    const contentKeys = ["learning_path", "quiz", "explanation", "progress", "recommendations", "adaptations", "analysis"];
    for (const key of contentKeys) {
      const val = results[key];
      if (val) {
        if (typeof val === "string") return val;
        if (Array.isArray(val)) {
          // e.g. recommendations: [{"content": "..."}]
          return val.map((item: any) => (typeof item === "string" ? item : item.content || JSON.stringify(item))).join("\n\n");
        }
        return val.content || JSON.stringify(val);
      }
    }
    return result?.raw_content || "";
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setRawContent("");
    setResultMetadata(null);

    try {
      let response: any;

      switch (activeMode) {
        case "learning_path":
          response = await learningCoachApi.createLearningPath({
            data: {
              goals: [input],
              current_level: learningLevel,
              preferences: { learning_style: learningStyle },
              constraints: {},
            },
            goals: [input],
            current_level: learningLevel,
            preferences: { learning_style: learningStyle },
            constraints: {},
            context: {},
            parameters: {},
          });
          break;
        case "quiz_generation":
          response = await learningCoachApi.generateQuiz({
            data: {
              topic: input,
              subtopics: [],
              previous_performance: {},
              learning_style: learningStyle,
            },
            topic: input,
            subtopics: [],
            previous_performance: {},
            learning_style: learningStyle,
            context: {},
            parameters: {},
          });
          break;
        case "concept_explanation":
          response = await learningCoachApi.explainConcept({
            data: {
              concept: input,
              prerequisites: [],
              learning_style: learningStyle,
              current_understanding: learningLevel,
            },
            concept: input,
            prerequisites: [],
            learning_style: learningStyle,
            current_understanding: learningLevel,
            context: {},
            parameters: {},
          });
          break;
        case "progress_tracking":
          response = await learningCoachApi.trackProgress({
            data: {
              learning_history: [{ topic: input, status: "in_progress" }],
              assessment_results: [],
              goals: [input],
              time_spent: {},
            },
            learning_history: [{ topic: input, status: "in_progress" }],
            assessment_results: [],
            goals: [input],
            time_spent: {},
            context: {},
            parameters: {},
          });
          break;
        case "resource_recommendation":
          response = await learningCoachApi.recommendResources({
            data: {
              topics: [input],
              learning_style: learningStyle,
              difficulty_level: learningLevel,
              preferred_formats: [],
            },
            topics: [input],
            learning_style: learningStyle,
            difficulty_level: learningLevel,
            preferred_formats: [],
            context: {},
            parameters: {},
          });
          break;
        case "adaptive_learning":
          response = await learningCoachApi.adaptLearning({
            data: {
              performance_data: { current_topic: input, level: learningLevel },
              learning_style: learningStyle,
              current_content: { topic: input },
              goals: [input],
            },
            performance_data: { current_topic: input, level: learningLevel },
            learning_style: learningStyle,
            current_content: { topic: input },
            goals: [input],
            context: {},
            parameters: {},
          });
          break;
      }

      setResult(response);
      const content = extractContent(response);
      setRawContent(content);
      const resMeta = response?.results?.metadata || response?.metadata || {};
      setResultMetadata(resMeta);
      setCompletedModes(prev => new Set([...prev, activeMode]));
      loadHistory();
      loadStats();
    } catch (err: any) {
      console.error("Learning coach request failed:", err);
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
      const data = await learningCoachApi.getDetail(sessionId);
      setResult(data);
      const content = extractContent(data);
      setRawContent(content);
      setResultMetadata(data?.metadata || {});
      if (data.mode) setActiveMode(data.mode);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await learningCoachApi.deleteSession(sessionId);
      setHistory(prev => prev.filter(h => h.id !== sessionId));
      loadStats();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF();
    const modeLabel = MODE_LABELS[activeMode] || "Learning Coach";
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    const maxY = pageHeight - margin;

    doc.setFontSize(16);
    doc.text(modeLabel, margin, margin);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Learning Coach — ${new Date().toLocaleDateString()}`, margin, margin + 8);
    doc.setTextColor(0);

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

    doc.save(`learning-coach-${activeMode}.pdf`);
    setShowExport(false);
  };

  const exportDOCX = async () => {
    const modeLabel = MODE_LABELS[activeMode] || "Learning Coach";
    const paragraphs: any[] = [
      new Paragraph({ children: [new TextRun({ text: modeLabel, bold: true, size: 32 })] }),
      new Paragraph({ children: [new TextRun({ text: `Learning Coach — ${new Date().toLocaleDateString()}`, size: 18, color: "888888" })] }),
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
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: `  •  ${text}`, size: 22 })] }));
      } else if (line.match(/^\s*\d+[\.\)]\s/)) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: `  ${line.trim()}`, size: 22 })] }));
      } else if (line.trim() === "") {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
      } else {
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
    saveAs(blob, `learning-coach-${activeMode}.docx`);
    setShowExport(false);
  };

  const exportMarkdown = () => {
    const blob = new Blob([rawContent], { type: "text/markdown" });
    saveAs(blob, `learning-coach-${activeMode}.md`);
    setShowExport(false);
  };

  const getPlaceholder = (): string => {
    switch (activeMode) {
      case "learning_path": return "What do you want to learn? (e.g., Machine Learning, Web Development, Data Science)";
      case "quiz_generation": return "Enter a topic to generate a quiz on (e.g., React hooks, SQL joins, Python OOP)";
      case "concept_explanation": return "What concept would you like explained? (e.g., recursion, neural networks, REST APIs)";
      case "progress_tracking": return "Describe your learning goals and what you've covered so far...";
      case "resource_recommendation": return "What topics do you need resources for? (e.g., Docker, Kubernetes, DevOps)";
      case "adaptive_learning": return "Describe your current learning content and goals for adaptation...";
      default: return "Describe what you'd like help with...";
    }
  };

  return (
    <AgentPageLayout agentName="Learning Coach" tagline="Master any skill faster" icon={BookOpen} gradient="from-teal-500 to-emerald-600">
      {/* Mode Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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
                <h3 className="text-sm font-semibold text-gray-900">{MODE_LABELS[activeMode]}</h3>
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-200 text-gray-500">Active</Badge>
              </div>
            </div>
            <div className="p-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholder()}
                className="min-h-[140px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setLearningLevel(level)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors capitalize ${
                        learningLevel === level
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

          {/* Results */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Coach Response</h3>
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
                  <Loader2 size={24} className="animate-spin text-teal-500 mr-3" />
                  <span className="text-sm text-gray-500">Your learning coach is preparing guidance...</span>
                </div>
              ) : rawContent ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
                        {rawContent.replace(/<\/summary>\s*(?!\n\n)/g, "</summary>\n\n")}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <GraduationCap size={32} className="mx-auto mb-3 text-teal-300" />
                  <p className="text-sm">Select a mode and describe what you'd like to learn</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Context & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Context */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Learning Preferences</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Learning Style</label>
                <div className="flex gap-2 mt-1">
                  {(["visual", "reading", "hands-on", "auditory"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setLearningStyle(style)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors capitalize ${
                        learningStyle === style ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Current Level</label>
                <div className="flex gap-2 mt-1">
                  {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLearningLevel(l)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors capitalize ${
                        learningLevel === l ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
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

          {/* Learning Progress Checklist */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Learning Journey</h3>
            <div className="space-y-2">
              {[
                { label: "Create learning path", mode: "learning_path" },
                { label: "Take a quiz", mode: "quiz_generation" },
                { label: "Explain a concept", mode: "concept_explanation" },
                { label: "Track progress", mode: "progress_tracking" },
                { label: "Get resources", mode: "resource_recommendation" },
                { label: "Adapt learning", mode: "adaptive_learning" },
              ].map((item) => {
                const done = completedModes.has(item.mode);
                return (
                  <div key={item.mode} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${done ? "border-teal-400 bg-teal-400" : "border-gray-200"}`}>
                      {done && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs ${done ? "text-gray-400 line-through" : "text-gray-600"}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">{completedModes.size}/6 steps completed</p>
          </div>

          {/* Response Metadata */}
          {resultMetadata && Object.keys(resultMetadata).length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Analysis Details</h3>
              <div className="space-y-1.5">
                {Object.entries(resultMetadata).map(([key, value]) => {
                  if (value === "" || value === 0 || value === null || value === undefined) return null;
                  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length === 0) return null;
                  if (Array.isArray(value) && value.length === 0) return null;
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

                  let displayValue: string;
                  if (typeof value === "number") {
                    displayValue = value % 1 === 0 ? String(value) : (value as number).toFixed(2);
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(", ");
                  } else if (typeof value === "object" && value !== null) {
                    const obj = value as Record<string, any>;
                    displayValue = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(", ");
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">{displayValue}</span>
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

export default LearningCoach;
