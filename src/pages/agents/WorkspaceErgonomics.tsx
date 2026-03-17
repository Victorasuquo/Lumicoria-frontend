import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Armchair, Upload, Camera, Monitor, Lightbulb, AlertTriangle,
  CheckCircle2, Eye, Ruler, Lamp, ChevronDown,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const categories = [
  { label: "Posture", score: 82, color: "bg-emerald-400" },
  { label: "Lighting", score: 68, color: "bg-amber-400" },
  { label: "Screen Distance", score: 91, color: "bg-emerald-400" },
  { label: "Chair Height", score: 75, color: "bg-amber-400" },
  { label: "Desk Setup", score: 88, color: "bg-emerald-400" },
  { label: "Break Frequency", score: 55, color: "bg-red-400" },
];

const issues = [
  { text: "Monitor glare detected — adjust screen angle or lighting", severity: "Warning", icon: Monitor },
  { text: "Break frequency below recommended level", severity: "Critical", icon: AlertTriangle },
  { text: "Desk height within optimal range", severity: "Good", icon: CheckCircle2 },
  { text: "Chair lumbar support position needs adjustment", severity: "Warning", icon: Armchair },
];

const recommendations = [
  { before: "Monitor at eye level causing neck strain", after: "Lower monitor 2 inches to align with natural gaze", priority: "High" },
  { before: "Overhead light creating screen glare", after: "Add desk lamp for indirect lighting", priority: "Medium" },
  { before: "Keyboard too far from body", after: "Move keyboard closer, keep elbows at 90°", priority: "Low" },
];

const equipment = [
  { name: "Standing Desk", status: true },
  { name: "Ergonomic Chair", status: true },
  { name: "External Monitor", status: true },
  { name: "Keyboard Tray", status: false },
  { name: "Monitor Arm", status: false },
  { name: "Desk Lamp", status: true },
];

const sevColors: Record<string, string> = {
  Critical: "text-red-500", Warning: "text-amber-500", Good: "text-emerald-500",
};

const WorkspaceErgonomics: React.FC = () => {
  const [monitoring, setMonitoring] = useState(false);
  const overallScore = 78;

  return (
    <AgentPageLayout agentName="Workspace Ergonomics" tagline="Optimize your setup" icon={Armchair} gradient="from-lime-500 to-green-600" status="beta">
      {/* Upload / Camera */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition-colors">
          <Upload size={18} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600 mb-1">Upload Workspace Photo</p>
          <p className="text-xs text-gray-400">Get instant ergonomic analysis</p>
        </div>
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition-colors">
          <Camera size={18} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600 mb-1">Live Camera Analysis</p>
          <p className="text-xs text-gray-400">Real-time posture monitoring</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Score + Categories */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Ergonomic Health Score</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Monitoring</span>
                <button onClick={() => setMonitoring(!monitoring)} className={`w-9 h-5 rounded-full transition-colors ${monitoring ? "bg-green-500" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${monitoring ? "ml-[18px]" : "ml-[2px]"}`} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-8 mb-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={overallScore > 80 ? "#10b981" : overallScore > 60 ? "#f59e0b" : "#ef4444"} strokeWidth="8" strokeDasharray={`${(overallScore / 100) * 251} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{overallScore}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {categories.map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 w-28">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.score}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${c.color}`} />
                      </div>
                      <span className="text-[10px] text-gray-400 w-8 text-right">{c.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Current Issues</h3></div>
            <div className="divide-y divide-gray-50">
              {issues.map((issue, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 flex items-start gap-3">
                  <issue.icon size={16} className={`shrink-0 mt-0.5 ${sevColors[issue.severity]}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{issue.text}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${
                    issue.severity === "Critical" ? "border-red-200 text-red-600 bg-red-50" :
                    issue.severity === "Warning" ? "border-amber-200 text-amber-600 bg-amber-50" :
                    "border-emerald-200 text-emerald-600 bg-emerald-50"
                  }`}>{issue.severity}</Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recommendations</h3></div>
            <div className="p-4 space-y-3">
              {recommendations.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${r.priority === "High" ? "border-red-200 text-red-600" : r.priority === "Medium" ? "border-amber-200 text-amber-600" : "border-gray-200 text-gray-500"}`}>{r.priority}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-red-50/50 rounded-lg border border-red-100">
                      <p className="text-[10px] text-red-500 font-medium mb-0.5">Before</p>
                      <p className="text-xs text-gray-600">{r.before}</p>
                    </div>
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] text-emerald-500 font-medium mb-0.5">After</p>
                      <p className="text-xs text-gray-600">{r.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipment Checklist</h3>
            <div className="space-y-2">
              {equipment.map((e) => (
                <div key={e.name} className="flex items-center gap-2.5">
                  {e.status ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
                  <span className={`text-xs ${e.status ? "text-gray-600" : "text-gray-400"}`}>{e.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Guidelines</h3>
            <div className="space-y-2">
              {[
                { icon: Eye, text: "Screen 20-26 inches from eyes" },
                { icon: Ruler, text: "Top of monitor at eye level" },
                { icon: Armchair, text: "Feet flat on floor, knees at 90°" },
                { icon: Lamp, text: "Avoid direct light on screen" },
                { icon: Lightbulb, text: "Take breaks every 30-60 minutes" },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/50">
                  <g.icon size={14} className="text-green-500 shrink-0" />
                  <span className="text-xs text-gray-600">{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default WorkspaceErgonomics;
