import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Headphones, Send, Clock, CheckCircle2, AlertCircle, MessageSquare,
  BarChart3, Users, Zap, Star, ArrowUpRight, Filter,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const stats = [
  { label: "Open Tickets", value: "23", icon: AlertCircle, color: "text-amber-500", trend: "-8%" },
  { label: "Avg Response", value: "2.4m", icon: Clock, color: "text-blue-500", trend: "-15%" },
  { label: "Resolved Today", value: "47", icon: CheckCircle2, color: "text-emerald-500", trend: "+12%" },
  { label: "Satisfaction", value: "94%", icon: Star, color: "text-violet-500", trend: "+3%" },
];

const tickets = [
  { id: "TK-1042", subject: "Unable to access dashboard after update", customer: "Alex Chen", priority: "High", status: "Open", time: "5 min ago", category: "technical_support" },
  { id: "TK-1041", subject: "Billing discrepancy on March invoice", customer: "Sarah Kim", priority: "Medium", status: "In Progress", time: "22 min ago", category: "billing_issue" },
  { id: "TK-1040", subject: "Request for API rate limit increase", customer: "Mike Torres", priority: "Low", status: "Open", time: "1 hour ago", category: "feature_request" },
  { id: "TK-1039", subject: "Integration with Slack not syncing", customer: "Lisa Park", priority: "High", status: "In Progress", time: "2 hours ago", category: "technical_support" },
  { id: "TK-1038", subject: "Positive feedback on new agent features", customer: "David Liu", priority: "Low", status: "Resolved", time: "3 hours ago", category: "general_feedback" },
];

const quickReplies = [
  { label: "Acknowledge Issue", text: "Thank you for reaching out. I'm looking into this now..." },
  { label: "Request Details", text: "Could you provide more details about the issue?..." },
  { label: "Escalate", text: "I'm escalating this to our specialist team..." },
  { label: "Resolution", text: "Great news — this issue has been resolved..." },
];

const sentimentBreakdown = [
  { label: "Positive", value: 62, color: "bg-emerald-400" },
  { label: "Neutral", value: 28, color: "bg-gray-300" },
  { label: "Negative", value: 10, color: "bg-red-400" },
];

const priorityColors: Record<string, string> = {
  High: "border-red-200 text-red-600 bg-red-50",
  Medium: "border-amber-200 text-amber-600 bg-amber-50",
  Low: "border-gray-200 text-gray-500 bg-gray-50",
};

const statusColors: Record<string, string> = {
  Open: "border-blue-200 text-blue-600 bg-blue-50",
  "In Progress": "border-amber-200 text-amber-600 bg-amber-50",
  Resolved: "border-emerald-200 text-emerald-600 bg-emerald-50",
};

const CustomerServiceAgent: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>("TK-1042");
  const [reply, setReply] = useState("");

  const activeTicket = tickets.find(t => t.id === selectedTicket);

  return (
    <AgentPageLayout agentName="Customer Service Agent" tagline="Intelligent support & satisfaction" icon={Headphones} gradient="from-indigo-500 to-blue-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
              <span className={`text-[10px] ${s.trend.startsWith("+") ? "text-emerald-500" : "text-blue-500"}`}>{s.trend}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Ticket Queue */}
        <div className="lg:col-span-3 space-y-6">
          {/* Ticket List */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Ticket Queue</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400"><Filter size={12} /></Button>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{tickets.length} tickets</Badge>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {tickets.map((ticket, i) => (
                <motion.div key={ticket.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedTicket(ticket.id)}
                  className={`p-4 cursor-pointer transition-colors ${selectedTicket === ticket.id ? "bg-indigo-50/30 border-l-2 border-l-indigo-400" : "hover:bg-gray-50/30"}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-gray-400">{ticket.id}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[ticket.priority]}`}>{ticket.priority}</Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[ticket.status]}`}>{ticket.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-800 font-medium truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users size={10} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400">{ticket.customer}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{ticket.time}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-gray-300 shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reply Composer */}
          {activeTicket && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Reply to {activeTicket.id}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{activeTicket.subject}</p>
              </div>
              <div className="p-4">
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {quickReplies.map((qr) => (
                    <button key={qr.label} onClick={() => setReply(qr.text)} className="px-2.5 py-1 rounded-lg bg-gray-50 text-[10px] font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                      {qr.label}
                    </button>
                  ))}
                </div>
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your response..." className="min-h-[100px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3" />
                <div className="flex gap-2">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                    <Send size={12} className="mr-1.5" /> Send Reply
                  </Button>
                  <Button variant="outline" className="border-gray-200 h-9 px-4 text-xs">
                    <Zap size={12} className="mr-1.5" /> AI Draft
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sentiment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900">Customer Sentiment</h3>
            </div>
            <div className="space-y-2">
              {sentimentBreakdown.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-[10px] text-gray-400">{s.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${s.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ticket Categories</h3>
            <div className="space-y-2">
              {[
                { label: "Technical Support", count: 12, color: "bg-blue-400" },
                { label: "Billing Issues", count: 5, color: "bg-amber-400" },
                { label: "Feature Requests", count: 8, color: "bg-violet-400" },
                { label: "General Feedback", count: 3, color: "bg-emerald-400" },
                { label: "Bug Reports", count: 4, color: "bg-red-400" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
                  <span className="text-xs text-gray-600 flex-1">{c.label}</span>
                  <span className="text-[10px] text-gray-400">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs">
              <Zap size={14} className="mr-2" /> Generate FAQ from Tickets
            </Button>
            <Button variant="outline" className="w-full border-gray-200 h-9 text-xs">
              <MessageSquare size={14} className="mr-2" /> Create Response Template
            </Button>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default CustomerServiceAgent;
