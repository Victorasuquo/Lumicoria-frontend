import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Target, TrendingUp, Award, Clock, Play,
  Video, FileText, Globe, BookMarked, ChevronRight, Zap,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const skills = [
  { name: "React & TypeScript", level: "Advanced", progress: 85, lessons: 24, color: "bg-blue-400" },
  { name: "System Design", level: "Intermediate", progress: 62, lessons: 18, color: "bg-violet-400" },
  { name: "Machine Learning", level: "Beginner", progress: 28, lessons: 32, color: "bg-emerald-400" },
  { name: "Data Structures", level: "Advanced", progress: 91, lessons: 15, color: "bg-amber-400" },
];

const gaps = [
  { topic: "Distributed Systems", priority: "High", reason: "Prerequisite for System Design advanced topics" },
  { topic: "Statistical Methods", priority: "Medium", reason: "Needed for ML model evaluation" },
  { topic: "Graph Algorithms", priority: "Low", reason: "Useful for knowledge graph work" },
];

const resources = [
  { title: "Building Scalable Systems", type: "Course", source: "Coursera", duration: "8 weeks" },
  { title: "React Patterns for Production", type: "Article", source: "blog.dev", duration: "15 min" },
  { title: "ML Fundamentals Crash Course", type: "Video", source: "YouTube", duration: "2 hours" },
  { title: "Designing Data-Intensive Apps", type: "Book", source: "O'Reilly", duration: "~40 hours" },
];

const typeIcons: Record<string, React.ElementType> = {
  Course: Globe, Article: FileText, Video: Video, Book: BookMarked,
};

const typeColors: Record<string, string> = {
  Course: "bg-blue-50 text-blue-600", Article: "bg-emerald-50 text-emerald-600",
  Video: "bg-red-50 text-red-600", Book: "bg-amber-50 text-amber-600",
};

const difficultyLevels = ["Easy", "Medium", "Hard", "Expert"];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekScores = [72, 85, 68, 91, 78, 45, 60];

const LearningCoach: React.FC = () => {
  const [currentDifficulty] = useState(2);

  return (
    <AgentPageLayout agentName="Learning Coach" tagline="Master any skill faster" icon={BookOpen} gradient="from-teal-500 to-emerald-600">
      {/* Current Learning Path */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Current Path: Full-Stack Engineering</h3>
            <p className="text-xs text-gray-400 mt-0.5">12 of 20 modules completed · 60% done</p>
          </div>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">
            <Play size={12} className="mr-1.5" /> Continue
          </Button>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Skills */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Skills Progress</h3></div>
            <div className="p-4 space-y-4">
              {skills.map((skill, i) => (
                <motion.div key={skill.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{skill.level}</Badge>
                    </div>
                    <span className="text-xs text-gray-400">{skill.lessons} lessons · {skill.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${skill.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className={`h-full rounded-full ${skill.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Knowledge Gaps */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Knowledge Gaps</h3></div>
            <div className="p-4 space-y-3">
              {gaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl">
                  <Target size={14} className={`shrink-0 mt-0.5 ${gap.priority === "High" ? "text-red-500" : gap.priority === "Medium" ? "text-amber-500" : "text-gray-400"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-800">{gap.topic}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${gap.priority === "High" ? "border-red-200 text-red-500 bg-red-50" : gap.priority === "Medium" ? "border-amber-200 text-amber-500 bg-amber-50" : "border-gray-200 text-gray-500"}`}>{gap.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{gap.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recommended Resources</h3></div>
            <div className="divide-y divide-gray-50">
              {resources.map((r, i) => {
                const TypeIcon = typeIcons[r.type] || FileText;
                return (
                  <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeColors[r.type]}`}>
                      <TypeIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                      <p className="text-[10px] text-gray-400">{r.source} · {r.duration}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[r.type]}`}>{r.type}</Badge>
                    <ChevronRight size={12} className="text-gray-300" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Difficulty */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Adaptive Difficulty</h3>
            <div className="flex gap-1">
              {difficultyLevels.map((level, i) => (
                <div key={level} className={`flex-1 py-2 rounded-lg text-center text-xs font-medium transition-colors ${i === currentDifficulty ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400"}`}>
                  {level}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Difficulty adjusts based on your performance</p>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Weekly Progress</h3>
            <div className="flex items-end gap-2 h-24">
              {weekDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${weekScores[i]}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className={`w-full rounded-t-md ${weekScores[i] > 80 ? "bg-emerald-400" : weekScores[i] > 60 ? "bg-blue-400" : "bg-gray-300"}`}
                  />
                  <span className="text-[10px] text-gray-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Hours Learned", value: "48", icon: Clock, color: "text-teal-500" },
              { label: "Skills Mastered", value: "6", icon: Award, color: "text-amber-500" },
              { label: "Current Streak", value: "9 days", icon: Zap, color: "text-orange-500" },
              { label: "Improvement", value: "+23%", icon: TrendingUp, color: "text-emerald-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <s.icon size={14} className={`${s.color} mb-1`} />
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default LearningCoach;
