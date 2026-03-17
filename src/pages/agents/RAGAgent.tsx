import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Database, Search, FileText, Globe, StickyNote, Upload,
  Link2, Type, Clock, Layers, ChevronRight, Star,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const sourceFilters = [
  { id: "all", label: "All", active: true },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "urls", label: "URLs", icon: Globe },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "drive", label: "Google Drive", icon: Layers },
];

const mockResults = [
  { title: "Q2 Product Strategy Document", source: "PDF", relevance: 96, snippet: "The primary objective for Q2 is to expand the agent marketplace to support third-party integrations...", citations: 3 },
  { title: "Architecture Decision Record #15", source: "Document", relevance: 89, snippet: "We chose Weaviate as our primary vector store due to its hybrid search capabilities and schema flexibility...", citations: 2 },
  { title: "Team Meeting Notes — March 8", source: "Note", relevance: 82, snippet: "Discussion about migrating from Chroma to Qdrant for improved performance at scale...", citations: 1 },
  { title: "API Design Guidelines", source: "URL", relevance: 78, snippet: "All endpoints should follow RESTful conventions with consistent error handling patterns...", citations: 4 },
];

const mockQueries = [
  { query: "vector store migration plan", date: "Mar 16", results: 8 },
  { query: "agent marketplace architecture", date: "Mar 15", results: 12 },
  { query: "authentication flow documentation", date: "Mar 14", results: 6 },
];

const sourceColors: Record<string, string> = {
  PDF: "bg-red-50 text-red-600", Document: "bg-blue-50 text-blue-600",
  Note: "bg-amber-50 text-amber-600", URL: "bg-emerald-50 text-emerald-600",
};

const RAGAgent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <AgentPageLayout agentName="RAG Agent" tagline="Knowledge at your fingertips" icon={Database} gradient="from-purple-500 to-fuchsia-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Documents", value: "156", icon: FileText, color: "text-purple-500" },
          { label: "Chunks Indexed", value: "4.2K", icon: Layers, color: "text-fuchsia-500" },
          { label: "Queries", value: "328", icon: Search, color: "text-blue-500" },
          { label: "Last Updated", value: "2h ago", icon: Clock, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your knowledge base..." className="text-sm h-11 pl-10 border-gray-200 bg-gray-50/50" />
          </div>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white h-11 px-6 text-sm shrink-0">Search</Button>
        </div>
        <div className="flex gap-2">
          {sourceFilters.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === f.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Results</h3>
              <span className="text-xs text-gray-400">{mockResults.length} matches</span>
            </div>
            <div className="divide-y divide-gray-50">
              {mockResults.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 hover:bg-gray-50/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800">{r.title}</h4>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Star size={10} className="text-amber-400" />
                      <span className="text-[10px] text-gray-400">{r.relevance}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.snippet}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sourceColors[r.source]}`}>{r.source}</Badge>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Link2 size={9} />{r.citations} citations</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add to Knowledge Base */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add to Knowledge Base</h3>
            <div className="space-y-2">
              {[
                { label: "Upload File", icon: Upload, color: "text-violet-500" },
                { label: "Add URL", icon: Globe, color: "text-blue-500" },
                { label: "Add Text", icon: Type, color: "text-emerald-500" },
              ].map((a) => (
                <button key={a.label} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors text-left">
                  <a.icon size={16} className={a.color} />
                  <span className="text-xs font-medium text-gray-700">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Queries */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Queries</h3></div>
            <div className="divide-y divide-gray-50">
              {mockQueries.map((q, i) => (
                <div key={i} className="p-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <Search size={12} className="text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{q.query}</p>
                    <p className="text-[10px] text-gray-400">{q.date} · {q.results} results</p>
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

export default RAGAgent;
