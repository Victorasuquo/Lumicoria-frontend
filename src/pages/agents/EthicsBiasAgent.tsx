import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Lightbulb,
  FileText, Code, Database, Send, BookOpen, Eye,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const contentTypes = [
  { id: "text", label: "Text", icon: FileText },
  { id: "document", label: "Document", icon: FileText },
  { id: "code", label: "Code", icon: Code },
  { id: "dataset", label: "Dataset", icon: Database },
];

const mockIssues = [
  { severity: "Critical", category: "Fairness", description: "Gender-biased language detected in job description section", suggestion: "Replace gendered terms with neutral alternatives" },
  { severity: "High", category: "Privacy", description: "Contains personally identifiable information without consent notice", suggestion: "Add data processing consent clause or anonymize PII" },
  { severity: "Medium", category: "Transparency", description: "AI-generated content not disclosed as such", suggestion: "Add disclosure about AI assistance in content generation" },
  { severity: "Low", category: "Accessibility", description: "Color-only indicators without text alternatives", suggestion: "Add text labels alongside color coding" },
];

const guidelines = [
  { name: "Equal Opportunity Compliance", passed: true },
  { name: "Data Protection (GDPR)", passed: false },
  { name: "AI Transparency Standards", passed: false },
  { name: "Accessibility (WCAG 2.1)", passed: true },
  { name: "Content Authenticity", passed: true },
  { name: "Inclusive Language", passed: false },
];

const sevColors: Record<string, { dot: string; badge: string }> = {
  Critical: { dot: "bg-red-500", badge: "bg-red-50 text-red-600 border-red-200" },
  High: { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-600 border-orange-200" },
  Medium: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  Low: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-600 border-blue-200" },
};

const EthicsBiasAgent: React.FC = () => {
  const [activeType, setActiveType] = useState("text");
  const [content, setContent] = useState("");
  const score = 68;

  return (
    <AgentPageLayout agentName="Ethics & Bias Agent" tagline="Fair and responsible AI" icon={Shield} gradient="from-green-500 to-emerald-600" status="beta">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Content Analysis</h3>
              <div className="flex gap-1">
                {contentTypes.map((t) => (
                  <button key={t.id} onClick={() => setActiveType(t.id)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeType === t.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste content to analyze for ethical issues and bias..." className="min-h-[140px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3" />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                <Send size={12} className="mr-1.5" /> Analyze Content
              </Button>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Issues Found</h3></div>
            <div className="divide-y divide-gray-50">
              {mockIssues.map((issue, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevColors[issue.severity].dot}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sevColors[issue.severity].badge}`}>{issue.severity}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{issue.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-800">{issue.description}</p>
                    </div>
                  </div>
                  <div className="ml-5 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start gap-2">
                    <Lightbulb size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700">{issue.suggestion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ethics Score</h3>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444"} strokeWidth="8" strokeDasharray={`${(score / 100) * 264} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{score}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">Out of 100 · 4 issues found</p>
          </div>

          {/* Guidelines */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Guidelines Compliance</h3>
            <div className="space-y-2">
              {guidelines.map((g, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {g.passed ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
                  <span className={`text-xs ${g.passed ? "text-gray-600" : "text-gray-800 font-medium"}`}>{g.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs"><Lightbulb size={14} className="mr-2" />Generate Suggestions</Button>
            <Button variant="outline" className="w-full border-gray-200 h-9 text-xs"><BookOpen size={14} className="mr-2" />Get Citations</Button>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default EthicsBiasAgent;
