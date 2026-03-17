import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, BookOpen, Brain, Search, CalendarDays,
  Trophy, Flame, Clock, CheckCircle2, ChevronRight, Send,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const quickActions = [
  { id: "assignment", label: "Assignment Help", icon: BookOpen, color: "from-indigo-500 to-blue-600", description: "Get help with any assignment" },
  { id: "study", label: "Study Plan", icon: CalendarDays, color: "from-emerald-500 to-teal-600", description: "Create a study schedule" },
  { id: "explain", label: "Explain Concept", icon: Brain, color: "from-violet-500 to-purple-600", description: "Understand difficult topics" },
  { id: "research", label: "Research", icon: Search, color: "from-amber-500 to-orange-600", description: "Academic research help" },
];

const mockTimeline = [
  { week: "Week 1", title: "Foundations", tasks: 5, done: 5, status: "complete" },
  { week: "Week 2", title: "Core Concepts", tasks: 6, done: 4, status: "active" },
  { week: "Week 3", title: "Advanced Topics", tasks: 4, done: 0, status: "upcoming" },
  { week: "Week 4", title: "Review & Practice", tasks: 8, done: 0, status: "upcoming" },
];

const subjects = [
  { name: "Mathematics", progress: 78, color: "bg-blue-400" },
  { name: "Computer Science", progress: 92, color: "bg-violet-400" },
  { name: "Physics", progress: 65, color: "bg-amber-400" },
  { name: "Literature", progress: 45, color: "bg-emerald-400" },
];

const StudentAgent: React.FC = () => {
  const [activeAction, setActiveAction] = useState("assignment");
  const [input, setInput] = useState("");

  return (
    <AgentPageLayout agentName="Student Agent" tagline="Your academic companion" icon={GraduationCap} gradient="from-indigo-500 to-blue-600">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveAction(action.id)}
            className={`group bg-white border rounded-xl p-4 transition-all text-left ${
              activeAction === action.id ? "border-gray-900 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3`}>
              <action.icon size={18} />
            </div>
            <p className="text-sm font-medium text-gray-800">{action.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{action.description}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Input + Response */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">{quickActions.find(a => a.id === activeAction)?.label}</h3>
            </div>
            <div className="p-4">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your assignment or concept..." className="min-h-[120px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3" />
              <div className="flex items-center gap-3">
                <select className="text-xs h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-600">
                  <option>Select Subject</option>
                  <option>Mathematics</option>
                  <option>Computer Science</option>
                  <option>Physics</option>
                  <option>Literature</option>
                </select>
                <select className="text-xs h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-600">
                  <option>Level</option>
                  <option>High School</option>
                  <option>Undergraduate</option>
                  <option>Graduate</option>
                  <option>PhD</option>
                </select>
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs ml-auto">
                  <Send size={12} className="mr-1.5" /> Submit
                </Button>
              </div>
            </div>
          </div>

          {/* Response Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center"><GraduationCap size={14} className="text-indigo-600" /></div>
              <span className="text-sm font-medium text-gray-800">Student Agent</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400">Response</Badge>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>To solve this quadratic equation, let's break it down step by step:</p>
              <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-700">
                x = (-b ± √(b² - 4ac)) / 2a<br />
                x = (-6 ± √(36 - 16)) / 4<br />
                x = (-6 ± √20) / 4
              </div>
              <p>The discriminant (b² - 4ac = 20) is positive, so we have two real solutions.</p>
            </div>
          </div>

          {/* Study Plan Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Study Plan</h3></div>
            <div className="p-4">
              <div className="space-y-4">
                {mockTimeline.map((week, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${week.status === "complete" ? "bg-emerald-400" : week.status === "active" ? "bg-blue-400 animate-pulse" : "bg-gray-200"}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800">{week.week}: {week.title}</p>
                        <span className="text-[10px] text-gray-400">{week.done}/{week.tasks} tasks</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${week.status === "complete" ? "bg-emerald-400" : week.status === "active" ? "bg-blue-400" : "bg-gray-200"}`} style={{ width: `${(week.done / week.tasks) * 100}%` }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Streak */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <Flame size={24} className="text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-400">Day Streak</p>
          </div>

          {/* Subject Progress */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Subject Progress</h3>
            <div className="space-y-3">
              {subjects.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Achievements</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Trophy, label: "First A+", color: "text-amber-400 bg-amber-50" },
                { icon: Flame, label: "7-Day Streak", color: "text-orange-400 bg-orange-50" },
                { icon: Brain, label: "Quick Learner", color: "text-violet-400 bg-violet-50" },
              ].map((a, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50/50">
                  <div className={`w-8 h-8 rounded-full ${a.color} flex items-center justify-center`}><a.icon size={14} /></div>
                  <span className="text-[10px] text-gray-500">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default StudentAgent;
