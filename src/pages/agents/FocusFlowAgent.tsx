import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target, Play, Pause, RotateCcw, Clock, Zap, AlertTriangle,
  TrendingUp, Bell, BellOff, Volume2, VolumeX, Moon,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const techniques = [
  { id: "pomodoro", label: "Pomodoro", active: true },
  { id: "timeblock", label: "Time Blocking", active: false },
  { id: "deepwork", label: "Deep Work", active: false },
  { id: "flowtime", label: "Flowtime", active: false },
];

const focusStates = [
  { label: "Deep Focus", color: "bg-violet-500", active: false },
  { label: "Flow State", color: "bg-emerald-500", active: true },
  { label: "Light Focus", color: "bg-blue-400", active: false },
  { label: "Break", color: "bg-amber-400", active: false },
];

const mockDistractions = [
  { type: "Notification", source: "Slack", impact: 3, time: "2:15 PM" },
  { type: "Social Media", source: "Twitter", impact: 5, time: "1:45 PM" },
  { type: "Email", source: "Gmail", impact: 2, time: "11:30 AM" },
];

const hourBlocks = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i + 8}:00`,
  score: [40, 55, 78, 92, 85, 45, 30, 65, 88, 95, 72, 50][i],
}));

const FocusFlowAgent: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTechnique, setActiveTechnique] = useState("pomodoro");
  const [notifications, setNotifications] = useState(false);
  const [sound, setSound] = useState(true);

  return (
    <AgentPageLayout agentName="Focus & Flow" tagline="Achieve deep work" icon={Target} gradient="from-orange-500 to-red-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Sessions Today", value: "6", icon: Target, color: "text-orange-500" },
          { label: "Focus Time", value: "4h 12m", icon: Clock, color: "text-blue-500" },
          { label: "Distractions", value: "3", icon: AlertTriangle, color: "text-red-500" },
          { label: "Productivity", value: "87%", icon: TrendingUp, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Timer */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 text-center">
              {/* Current State */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {focusStates.map((s) => (
                  <Badge key={s.label} variant="outline" className={`text-[10px] px-2 py-0.5 ${s.active ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-400"}`}>
                    {s.active && <span className={`w-1.5 h-1.5 rounded-full ${s.color} mr-1.5 inline-block`} />}
                    {s.label}
                  </Badge>
                ))}
              </div>

              {/* Timer Display */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                  <motion.circle cx="100" cy="100" r="85" fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round"
                    initial={{ strokeDasharray: "0 534" }}
                    animate={{ strokeDasharray: isRunning ? "400 534" : "0 534" }}
                    transition={{ duration: isRunning ? 25 * 60 : 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-gray-900 font-mono">25:00</p>
                  <p className="text-xs text-gray-400 mt-1">{isRunning ? "Focus Session" : "Ready"}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" className="w-10 h-10 rounded-full p-0 border-gray-200">
                  <RotateCcw size={16} className="text-gray-400" />
                </Button>
                <Button onClick={() => setIsRunning(!isRunning)} className={`w-14 h-14 rounded-full p-0 ${isRunning ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"} text-white`}>
                  {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </Button>
                <Button variant="outline" size="sm" className="w-10 h-10 rounded-full p-0 border-gray-200">
                  <Target size={16} className="text-gray-400" />
                </Button>
              </div>
            </div>

            {/* Technique Selector */}
            <div className="border-t border-gray-50 p-3 flex justify-center gap-2">
              {techniques.map((t) => (
                <button key={t.id} onClick={() => setActiveTechnique(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTechnique === t.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Productivity Heatmap */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Productivity Patterns</h3>
            <div className="flex gap-1">
              {hourBlocks.map((block, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-8 rounded-md ${block.score > 80 ? "bg-orange-400" : block.score > 60 ? "bg-orange-200" : block.score > 40 ? "bg-orange-100" : "bg-gray-100"}`} title={`${block.hour}: ${block.score}%`} />
                  <span className="text-[8px] text-gray-400">{block.hour.split(":")[0]}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <span className="text-[10px] text-gray-400">Low</span>
              <div className="flex gap-0.5">{["bg-gray-100", "bg-orange-100", "bg-orange-200", "bg-orange-400"].map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}</div>
              <span className="text-[10px] text-gray-400">High</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Environment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Environment</h3>
            <div className="space-y-3">
              {[
                { label: "Notifications", on: notifications, toggle: () => setNotifications(!notifications), iconOn: Bell, iconOff: BellOff },
                { label: "Sound", on: sound, toggle: () => setSound(!sound), iconOn: Volume2, iconOff: VolumeX },
                { label: "DND Mode", on: true, toggle: () => {}, iconOn: Moon, iconOff: Moon },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {setting.on ? <setting.iconOn size={14} className="text-gray-500" /> : <setting.iconOff size={14} className="text-gray-400" />}
                    <span className="text-xs text-gray-600">{setting.label}</span>
                  </div>
                  <button onClick={setting.toggle} className={`w-9 h-5 rounded-full transition-colors ${setting.on ? "bg-orange-500" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.on ? "translate-x-4.5 ml-[18px]" : "translate-x-0.5 ml-[2px]"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Distractions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Distractions</h3>
              <Button variant="ghost" size="sm" className="text-[10px] text-gray-400 h-6">Log New</Button>
            </div>
            <div className="divide-y divide-gray-50">
              {mockDistractions.map((d, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <AlertTriangle size={14} className={`shrink-0 ${d.impact > 3 ? "text-red-400" : "text-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{d.source}</p>
                    <p className="text-[10px] text-gray-400">{d.type} · {d.time}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, j) => (
                      <div key={j} className={`w-1.5 h-3 rounded-sm ${j < d.impact ? "bg-red-400" : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default FocusFlowAgent;
