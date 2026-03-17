import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brain, Search, Layers, GitBranch, Zap, Eye,
  Circle, Clock, ChevronRight, Send,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const nodeTypes = [
  { label: "Person", color: "bg-blue-400", count: 42 },
  { label: "Organization", color: "bg-violet-400", count: 18 },
  { label: "Concept", color: "bg-emerald-400", count: 65 },
  { label: "Document", color: "bg-amber-400", count: 31 },
  { label: "Event", color: "bg-pink-400", count: 12 },
];

const actions = [
  { label: "Extract Knowledge", icon: Zap, color: "from-fuchsia-500 to-purple-600" },
  { label: "Discover Relations", icon: GitBranch, color: "from-blue-500 to-indigo-600" },
  { label: "Fill Gaps", icon: Layers, color: "from-emerald-500 to-teal-600" },
  { label: "Visualize", icon: Eye, color: "from-amber-500 to-orange-600" },
];

const mockExtractions = [
  { content: "Machine Learning fundamentals", nodes: 8, relations: 12, date: "Mar 16" },
  { content: "Product architecture document", nodes: 5, relations: 7, date: "Mar 15" },
  { content: "Team structure overview", nodes: 14, relations: 19, date: "Mar 14" },
];

const KnowledgeGraphAgent: React.FC = () => {
  const [query, setQuery] = useState("");

  return (
    <AgentPageLayout agentName="Knowledge Graph" tagline="Connect the dots" icon={Brain} gradient="from-fuchsia-500 to-purple-600" status="beta">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Nodes", value: "168", icon: Circle, color: "text-fuchsia-500" },
          { label: "Relations", value: "243", icon: GitBranch, color: "text-blue-500" },
          { label: "Node Types", value: "5", icon: Layers, color: "text-emerald-500" },
          { label: "Last Updated", value: "1h ago", icon: Clock, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {actions.map((a) => (
          <button key={a.label} className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-white mb-2`}><a.icon size={14} /></div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{a.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Graph Viz */}
        <div className="lg:col-span-3 space-y-6">
          {/* Graph Visualization */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Graph Visualization</h3>
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 h-7">Fullscreen</Button>
            </div>
            <div className="relative bg-gray-950 min-h-[320px] p-8 overflow-hidden">
              {/* Mock graph nodes */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="30%" y1="30%" x2="60%" y2="25%" className="stroke-gray-600" strokeWidth="1" />
                <line x1="60%" y1="25%" x2="75%" y2="55%" className="stroke-gray-600" strokeWidth="1" />
                <line x1="30%" y1="30%" x2="25%" y2="65%" className="stroke-gray-600" strokeWidth="1" />
                <line x1="25%" y1="65%" x2="55%" y2="70%" className="stroke-gray-600" strokeWidth="1" />
                <line x1="55%" y1="70%" x2="75%" y2="55%" className="stroke-gray-600" strokeWidth="1" />
                <line x1="30%" y1="30%" x2="55%" y2="70%" className="stroke-gray-700" strokeWidth="1" strokeDasharray="4" />
              </svg>
              {[
                { x: "30%", y: "30%", color: "bg-blue-400", label: "AI Agent", size: "w-12 h-12" },
                { x: "60%", y: "25%", color: "bg-violet-400", label: "Lumicoria", size: "w-14 h-14" },
                { x: "75%", y: "55%", color: "bg-emerald-400", label: "RAG", size: "w-10 h-10" },
                { x: "25%", y: "65%", color: "bg-amber-400", label: "Documents", size: "w-11 h-11" },
                { x: "55%", y: "70%", color: "bg-pink-400", label: "Users", size: "w-10 h-10" },
              ].map((node, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className={`absolute ${node.size} ${node.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                  style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
                >
                  <span className="text-[8px] font-bold text-white">{node.label.slice(0, 3)}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Query */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Query Graph</h3>
            <div className="flex gap-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find connections between..." className="text-sm h-9 border-gray-200 bg-gray-50/50" />
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0"><Send size={14} /></Button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Node Types Legend */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Node Types</h3>
            <div className="space-y-2">
              {nodeTypes.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${t.color}`} />
                    <span className="text-xs text-gray-600">{t.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Extractions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Extractions</h3></div>
            <div className="divide-y divide-gray-50">
              {mockExtractions.map((e, i) => (
                <div key={i} className="p-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <Brain size={14} className="text-fuchsia-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{e.content}</p>
                    <p className="text-[10px] text-gray-400">{e.date} · {e.nodes} nodes · {e.relations} relations</p>
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

export default KnowledgeGraphAgent;
