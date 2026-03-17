import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, TrendingUp, TrendingDown, Coffee, Brain, Battery,
  Zap, Clock, Sun, Moon, Pause, Smile, Activity,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const metrics = [
  { label: "Stress Level", value: "Low", icon: Activity, color: "text-emerald-500", trend: "down", trendLabel: "-12%" },
  { label: "Focus Time", value: "5.2h", icon: Brain, color: "text-blue-500", trend: "up", trendLabel: "+18%" },
  { label: "Break Adherence", value: "82%", icon: Coffee, color: "text-amber-500", trend: "up", trendLabel: "+5%" },
  { label: "Energy Level", value: "High", icon: Battery, color: "text-violet-500", trend: "up", trendLabel: "+8%" },
];

const timeline = [
  { time: "9:00 AM", event: "Work session started", type: "work", icon: Sun },
  { time: "10:30 AM", event: "Break taken — 10 min walk", type: "break", icon: Coffee },
  { time: "10:40 AM", event: "Deep focus session", type: "focus", icon: Brain },
  { time: "12:00 PM", event: "Lunch break — 45 min", type: "break", icon: Coffee },
  { time: "12:45 PM", event: "Light tasks & emails", type: "work", icon: Sun },
  { time: "2:30 PM", event: "Stretch reminder", type: "reminder", icon: Activity },
  { time: "3:00 PM", event: "Afternoon focus block", type: "focus", icon: Zap },
];

const timelineColors: Record<string, string> = {
  work: "bg-blue-100 text-blue-600", break: "bg-emerald-100 text-emerald-600",
  focus: "bg-violet-100 text-violet-600", reminder: "bg-amber-100 text-amber-600",
};

const recommendations = [
  { text: "Take a 5-minute eye rest — you've been on screen for 90 min", priority: "High" },
  { text: "Hydration reminder — drink a glass of water", priority: "Medium" },
  { text: "Consider a standing desk session for the next hour", priority: "Low" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekScores = [78, 85, 72, 88, 82, 60, 55];

const WellbeingCoach: React.FC = () => {
  return (
    <AgentPageLayout agentName="Well-being Coach" tagline="Your personal wellness guardian" icon={Heart} gradient="from-rose-500 to-pink-600">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><m.icon size={14} className={m.color} /><span className="text-xs text-gray-400">{m.label}</span></div>
              <div className={`flex items-center gap-0.5 text-[10px] ${m.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                {m.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {m.trendLabel}
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Break Reminder */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Time for a Break</h3>
                <p className="text-xs text-gray-500">You've been working for 87 minutes straight</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-rose-600 font-mono">03:24</p>
                <p className="text-[10px] text-gray-400">until next break</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-8 px-4 text-xs">
                <Pause size={12} className="mr-1.5" /> Take a Break
              </Button>
              <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 h-8 px-4 text-xs hover:bg-rose-50">
                Snooze 15 min
              </Button>
            </div>
          </div>

          {/* Daily Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Today's Wellness Timeline</h3></div>
            <div className="p-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {timeline.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${timelineColors[item.type]}`}>
                        <item.icon size={14} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-xs font-medium text-gray-800">{item.event}</p>
                        <p className="text-[10px] text-gray-400">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendations */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommendations</h3>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className={`p-3 rounded-xl border ${r.priority === "High" ? "bg-rose-50/50 border-rose-100" : r.priority === "Medium" ? "bg-amber-50/50 border-amber-100" : "bg-gray-50/50 border-gray-100"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${r.priority === "High" ? "border-rose-200 text-rose-600" : r.priority === "Medium" ? "border-amber-200 text-amber-600" : "border-gray-200 text-gray-500"}`}>{r.priority}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Weekly Wellness</h3>
            <div className="flex items-end gap-2 h-20">
              {weekDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${weekScores[i]}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                    className={`w-full rounded-t-md ${weekScores[i] > 80 ? "bg-emerald-400" : weekScores[i] > 60 ? "bg-amber-400" : "bg-gray-300"}`} />
                  <span className="text-[10px] text-gray-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Log Mood", icon: Smile, color: "text-amber-500" },
              { label: "View Metrics", icon: Activity, color: "text-blue-500" },
              { label: "Start Break", icon: Coffee, color: "text-emerald-500" },
              { label: "Get Tips", icon: Heart, color: "text-rose-500" },
            ].map((a) => (
              <button key={a.label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-2">
                <a.icon size={14} className={a.color} />
                <span className="text-xs font-medium text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default WellbeingCoach;
