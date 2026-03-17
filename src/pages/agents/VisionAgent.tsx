import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Camera, Upload, Eye, FileText, Image, Scan, MessageSquare,
  Box, Type, Layers, Clock, ChevronRight, Send,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const mockDetections = [
  { type: "Text", value: "Invoice #4288 — Total: $12,450.00", confidence: 97 },
  { type: "Object", value: "Laptop (MacBook Pro)", confidence: 94 },
  { type: "Object", value: "Coffee mug", confidence: 89 },
  { type: "Text", value: "Due Date: March 30, 2026", confidence: 95 },
  { type: "Scene", value: "Office workspace with monitor and desk", confidence: 91 },
];

const mockHistory = [
  { type: "Document Scan", date: "Mar 16", description: "Invoice #4288 scanned" },
  { type: "Workspace", date: "Mar 15", description: "Desk setup analysis" },
  { type: "Object", date: "Mar 14", description: "Product label recognition" },
  { type: "Text", date: "Mar 13", description: "Whiteboard notes captured" },
];

const quickActions = [
  { label: "Scan Document", icon: FileText, color: "from-violet-500 to-purple-600" },
  { label: "Analyze Workspace", icon: Layers, color: "from-emerald-500 to-teal-600" },
  { label: "Recognize Objects", icon: Box, color: "from-blue-500 to-indigo-600" },
  { label: "Read Text", icon: Type, color: "from-amber-500 to-orange-600" },
];

const VisionAgent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("upload");
  const [question, setQuestion] = useState("");

  return (
    <AgentPageLayout
      agentName="Vision Agent"
      tagline="See and understand the world"
      icon={Camera}
      gradient="from-sky-500 to-cyan-600"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Scans", value: "89", icon: Scan, color: "text-sky-500" },
          { label: "Objects Found", value: "342", icon: Box, color: "text-violet-500" },
          { label: "Text Extracted", value: "1.2K", icon: Type, color: "text-emerald-500" },
          { label: "Avg. Time", value: "1.8s", icon: Clock, color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-2`}>
              <action.icon size={14} />
            </div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{action.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Camera / Upload + Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Toggle */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-50">
              {(["camera", "upload"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-medium transition-colors ${
                    activeTab === tab ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "camera" ? "Camera" : "Upload"}
                </button>
              ))}
            </div>

            {activeTab === "camera" ? (
              <div className="p-8 flex flex-col items-center justify-center bg-gray-950 min-h-[280px]">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Camera size={28} className="text-white/60" />
                </div>
                <p className="text-sm text-white/50 mb-4">Camera preview will appear here</p>
                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8 px-4 text-xs">
                  <Camera size={12} className="mr-1.5" />
                  Activate Camera
                </Button>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 m-4 rounded-xl min-h-[240px] hover:border-gray-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Upload size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Drop an image here</p>
                <p className="text-xs text-gray-400 mb-4">PNG, JPG, WEBP — up to 20MB</p>
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Analysis Results</h3>
            </div>
            <div className="p-4 space-y-3">
              {mockDetections.map((det, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl"
                >
                  <Badge className={`text-[10px] px-2 py-0 shrink-0 ${
                    det.type === "Text" ? "bg-blue-50 text-blue-600" :
                    det.type === "Object" ? "bg-violet-50 text-violet-600" :
                    "bg-emerald-50 text-emerald-600"
                  }`}>
                    {det.type}
                  </Badge>
                  <p className="text-sm text-gray-700 flex-1">{det.value}</p>
                  <span className="text-[10px] text-gray-400 shrink-0">{det.confidence}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Visual Q&A + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Q&A */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Visual Q&A</h3>
            <p className="text-xs text-gray-400 mb-3">Ask questions about the analyzed image</p>

            <div className="bg-gray-50 rounded-xl p-3 mb-3 min-h-[100px]">
              <p className="text-xs text-gray-400 italic">Upload an image and ask questions about it...</p>
            </div>

            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you see in this image?"
                className="text-sm h-9 border-gray-200 bg-gray-50/50"
              />
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0">
                <Send size={14} />
              </Button>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Recent Analyses</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {mockHistory.map((item, i) => (
                <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Eye size={16} className="text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200">{item.type}</Badge>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default VisionAgent;
