import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar, Upload, Video, Mic, Users, Clock, CheckCircle2,
  ListChecks, FileText, Play, Square, ChevronRight, MessageSquare,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const mockTranscript = [
  { time: "00:02", speaker: "Sarah", text: "Let's start with the Q2 roadmap review." },
  { time: "00:15", speaker: "Mike", text: "We're on track with the frontend redesign, should be done by March 28." },
  { time: "00:34", speaker: "Sarah", text: "Good. What about the API migration?" },
  { time: "00:45", speaker: "Alex", text: "We hit a blocker with the auth service. Need 2 more days." },
  { time: "01:02", speaker: "Sarah", text: "Okay, let's prioritize that. Mike, can you help Alex?" },
  { time: "01:15", speaker: "Mike", text: "Sure, I'll pair with Alex tomorrow morning." },
];

const mockActionItems = [
  { text: "Complete frontend redesign", assignee: "Mike", due: "Mar 28", done: false },
  { text: "Resolve auth service blocker", assignee: "Alex", due: "Mar 18", done: false },
  { text: "Pair programming session on auth", assignee: "Mike + Alex", due: "Mar 17", done: false },
  { text: "Send Q2 roadmap update to stakeholders", assignee: "Sarah", due: "Mar 16", done: true },
];

const mockMeetings = [
  { title: "Q2 Roadmap Review", date: "Mar 16", participants: 4, duration: "45 min", actions: 4 },
  { title: "Client Sync — Acme Corp", date: "Mar 14", participants: 6, duration: "30 min", actions: 3 },
  { title: "Sprint Retrospective", date: "Mar 13", participants: 8, duration: "60 min", actions: 7 },
  { title: "Design Review", date: "Mar 11", participants: 3, duration: "25 min", actions: 2 },
];

const platforms = [
  { name: "Google Meet", icon: Video, color: "text-green-600", bg: "bg-green-50" },
  { name: "Zoom", icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Microsoft Teams", icon: Video, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const MeetingAssistant: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <AgentPageLayout
      agentName="Meeting Assistant"
      tagline="Never miss a detail"
      icon={Calendar}
      gradient="from-emerald-500 to-teal-600"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Meetings", value: "38", icon: Video, color: "text-emerald-500" },
          { label: "Action Items", value: "124", icon: ListChecks, color: "text-blue-500" },
          { label: "Decisions", value: "56", icon: CheckCircle2, color: "text-violet-500" },
          { label: "Hours Saved", value: "18h", icon: Clock, color: "text-amber-500" },
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

      {/* Platform Integration Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {platforms.map((p) => (
          <button
            key={p.name}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center`}>
              <p.icon size={18} className={p.color} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">{p.name}</p>
              <p className="text-[11px] text-gray-400">Connect</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Transcription */}
        <div className="lg:col-span-3 space-y-6">
          {/* Live Session */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Live Transcription</h3>
                {isRecording && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-500 font-medium">Recording</span>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`h-8 px-3 text-xs ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {isRecording ? <Square size={12} className="mr-1.5" /> : <Play size={12} className="mr-1.5" />}
                  {isRecording ? "Stop" : "Start"}
                </Button>
              </div>
            </div>

            <div className="bg-gray-950 p-4 max-h-[320px] overflow-y-auto space-y-3">
              {mockTranscript.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-3"
                >
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 shrink-0 w-10">{line.time}</span>
                  <div>
                    <span className="text-xs font-medium text-emerald-400">{line.speaker}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{line.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upload Recording */}
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition-colors">
            <Upload size={18} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Upload Meeting Recording</p>
            <p className="text-xs text-gray-400">MP3, MP4, WAV, M4A — up to 500MB</p>
          </div>

          {/* Meeting History */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Meeting History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {mockMeetings.map((meeting, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Video size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{meeting.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{meeting.date}</span>
                      <span>·</span>
                      <Users size={10} /> <span>{meeting.participants}</span>
                      <span>·</span>
                      <Clock size={10} /> <span>{meeting.duration}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-200 text-gray-500">
                    {meeting.actions} actions
                  </Badge>
                  <ChevronRight size={14} className="text-gray-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Action Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Action Items</h3>
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-emerald-200 text-emerald-600 bg-emerald-50">
                {mockActionItems.filter(a => !a.done).length} pending
              </Badge>
            </div>
            <div className="p-4 space-y-3">
              {mockActionItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    item.done ? "bg-gray-50/50 border-gray-100" : "bg-white border-gray-100"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    item.done ? "border-emerald-400 bg-emerald-400" : "border-gray-300"
                  }`}>
                    {item.done && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{item.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{item.assignee}</span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">{item.due}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Decisions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Decisions</h3>
            <div className="space-y-2">
              {[
                "Prioritize auth service blocker resolution",
                "Mike to pair with Alex on auth fixes",
                "Frontend redesign deadline stays March 28",
              ].map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Summary */}
          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs">
            <FileText size={14} className="mr-2" />
            Generate Meeting Summary
          </Button>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default MeetingAssistant;
