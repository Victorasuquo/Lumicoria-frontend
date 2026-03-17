import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe, Search, BookOpen, FileText, TrendingUp, Clock,
  CheckCircle2, ExternalLink, Star, ChevronRight, Loader2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const mockResults = [
  { title: "AI-Driven Document Processing in Enterprise", source: "arxiv.org", type: "Academic", credibility: 94, snippet: "Recent advances in transformer architectures have significantly improved document understanding capabilities..." },
  { title: "The State of Intelligent Automation 2026", source: "mckinsey.com", type: "Industry", credibility: 91, snippet: "Organizations implementing AI-driven automation report 35% efficiency gains in document-heavy workflows..." },
  { title: "Neural OCR: Beyond Text Recognition", source: "nature.com", type: "Academic", credibility: 97, snippet: "Multi-modal vision-language models now achieve near-human accuracy on complex document layouts..." },
  { title: "Enterprise AI Adoption Trends", source: "gartner.com", type: "Report", credibility: 88, snippet: "By 2027, 60% of enterprises will have deployed at least one AI agent for document processing..." },
];

const mockHistory = [
  { query: "AI document processing trends 2026", date: "Mar 16", sources: 12, status: "Complete" },
  { query: "Vector database comparison for RAG", date: "Mar 14", sources: 8, status: "Complete" },
  { query: "Multi-agent system architectures", date: "Mar 12", sources: 15, status: "Complete" },
];

const researchModes = [
  { id: "web", label: "Web Research", icon: Globe, active: true },
  { id: "academic", label: "Academic", icon: BookOpen, active: false },
  { id: "internal", label: "Internal Docs", icon: FileText, active: false },
];

const typeColors: Record<string, string> = {
  Academic: "bg-blue-50 text-blue-600 border-blue-200",
  Industry: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Report: "bg-violet-50 text-violet-600 border-violet-200",
};

const ResearchAgent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState("web");
  const [isSearching, setIsSearching] = useState(false);

  return (
    <AgentPageLayout agentName="Research Agent" tagline="Deep-dive into any topic" icon={Globe} gradient="from-blue-500 to-indigo-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Researches", value: "47", icon: Search, color: "text-blue-500" },
          { label: "Sources Analyzed", value: "580", icon: Globe, color: "text-indigo-500" },
          { label: "Reports Generated", value: "32", icon: FileText, color: "text-emerald-500" },
          { label: "Avg. Time", value: "12s", icon: Clock, color: "text-amber-500" },
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
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What would you like to research?" className="text-sm h-11 border-gray-200 bg-gray-50/50 flex-1" />
          <Button onClick={() => setIsSearching(true)} className="bg-gray-900 hover:bg-gray-800 text-white h-11 px-6 text-sm shrink-0">
            <Search size={16} className="mr-2" /> Research
          </Button>
        </div>
        {/* Mode Tabs */}
        <div className="flex gap-2">
          {researchModes.map((mode) => (
            <button key={mode.id} onClick={() => setActiveMode(mode.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === mode.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
              <mode.icon size={12} /> {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-6">
              {["Searching", "Analyzing", "Compiling", "Done"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i <= 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    {i <= 3 ? <CheckCircle2 size={12} /> : (i + 1)}
                  </div>
                  <span className={`text-xs ${i <= 3 ? "text-gray-700 font-medium" : "text-gray-400"}`}>{step}</span>
                  {i < 3 && <div className={`w-8 h-0.5 ${i < 3 ? "bg-emerald-200" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Research Results</h3></div>
            <div className="divide-y divide-gray-50">
              {mockResults.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800 flex-1">{r.title}</h4>
                    <ExternalLink size={12} className="text-gray-300 shrink-0 ml-2 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.snippet}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{r.source}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[r.type]}`}>{r.type}</Badge>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={10} className="text-amber-400" />
                      <span className="text-[10px] text-gray-400">{r.credibility}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Findings</h3>
            <div className="space-y-2">
              {["AI document processing market growing 40% YoY", "Transformer models achieve 97% accuracy on complex layouts", "60% enterprise adoption expected by 2027"].map((f, i) => (
                <div key={i} className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /><p className="text-xs text-gray-600">{f}</p></div>
              ))}
            </div>
          </div>

          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs"><FileText size={14} className="mr-2" />Generate Report</Button>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Queries</h3></div>
            <div className="divide-y divide-gray-50">
              {mockHistory.map((h, i) => (
                <div key={i} className="p-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
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
