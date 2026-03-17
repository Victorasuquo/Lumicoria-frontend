import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Lightbulb, Microscope, BookOpen, FlaskConical, Compass,
  Brain, Layers, ArrowRight, Send, CheckCircle2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const modes = [
  { id: "problem", label: "Problem Analysis", icon: Microscope, description: "Break down complex problems into manageable components", color: "from-red-500 to-rose-600" },
  { id: "planning", label: "Research Planning", icon: Compass, description: "Create structured research plans and methodologies", color: "from-blue-500 to-indigo-600" },
  { id: "literature", label: "Literature Review", icon: BookOpen, description: "Guide through literature review with critical analysis", color: "from-emerald-500 to-teal-600" },
  { id: "hypothesis", label: "Hypothesis Dev.", icon: FlaskConical, description: "Develop and refine research hypotheses", color: "from-violet-500 to-purple-600" },
  { id: "methodology", label: "Methodology", icon: Layers, description: "Guidance on research methodology and methods", color: "from-amber-500 to-orange-600" },
  { id: "evaluation", label: "Critical Evaluation", icon: Brain, description: "Evaluate research and evidence critically", color: "from-pink-500 to-rose-600" },
  { id: "synthesis", label: "Synthesis", icon: Lightbulb, description: "Synthesize research findings and insights", color: "from-cyan-500 to-blue-600" },
];

const mockGuidance = [
  { title: "Problem Decomposition", content: "Break your research question into three sub-questions: (1) What factors influence X? (2) How does X relate to Y? (3) Under what conditions does the relationship change?" },
  { title: "Variable Identification", content: "Your independent variable is clearly defined. Consider adding a moderating variable to strengthen the model. The dependent variable measurement needs operationalization." },
  { title: "Literature Gap", content: "The existing literature covers A and B extensively, but the intersection of A+B in the context of C remains unexplored. This represents your contribution." },
];

const ResearchMentor: React.FC = () => {
  const [activeMode, setActiveMode] = useState("problem");
  const [input, setInput] = useState("");

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
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button key={level} className="px-3 py-1 rounded-lg text-[10px] font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                      {level}
                    </button>
                  ))}
                </div>
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">
                  <Send size={12} className="mr-1.5" /> Get Guidance
                </Button>
              </div>
            </div>
          </div>

          {/* Guidance Results */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Mentor Guidance</h3>
            </div>
            <div className="p-4 space-y-4">
              {mockGuidance.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-amber-500" />
                    <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.content}</p>
                </motion.div>
              ))}
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
                <Input placeholder="e.g., Computer Science" className="mt-1 text-sm h-8 border-gray-200 bg-gray-50/50" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Experience Level</label>
                <div className="flex gap-2 mt-1">
                  {["Beginner", "Intermediate", "Advanced"].map((l) => (
                    <button key={l} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${l === "Advanced" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
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

          {/* Checklist */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Research Checklist</h3>
            <div className="space-y-2">
              {["Define research question", "Review existing literature", "Identify variables", "Choose methodology", "Collect data", "Analyze results", "Write conclusions"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${i < 3 ? "border-emerald-400 bg-emerald-400" : "border-gray-200"}`}>
                    {i < 3 && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className={`text-xs ${i < 3 ? "text-gray-400 line-through" : "text-gray-600"}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default ResearchMentor;
