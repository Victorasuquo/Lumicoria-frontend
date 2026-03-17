import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield, Play, Square, Users, Clock, CheckCircle2, XCircle,
  AlertTriangle, HelpCircle, Link, ChevronRight, Plus,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const statusConfig: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  Verified: { color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200" },
  Disputed: { color: "text-red-600", icon: XCircle, bg: "bg-red-50 border-red-200" },
  "Partially True": { color: "text-amber-600", icon: AlertTriangle, bg: "bg-amber-50 border-amber-200" },
  Unverified: { color: "text-gray-500", icon: HelpCircle, bg: "bg-gray-50 border-gray-200" },
};

const mockClaims = [
  { claim: "Our revenue grew 40% last quarter", speaker: "CEO", status: "Verified", confidence: 92, sources: 3 },
  { claim: "We have 10,000 active users", speaker: "PM", status: "Partially True", confidence: 65, sources: 2 },
  { claim: "The competitor launched a similar feature last week", speaker: "CTO", status: "Disputed", confidence: 28, sources: 4 },
  { claim: "Customer satisfaction is at an all-time high", speaker: "Support Lead", status: "Verified", confidence: 88, sources: 2 },
  { claim: "We reduced server costs by 60%", speaker: "DevOps", status: "Unverified", confidence: 0, sources: 0 },
];

const mockSessions = [
  { title: "Board Meeting Q2", date: "Mar 16", claims: 12, verified: 9 },
  { title: "Product Sync", date: "Mar 14", claims: 8, verified: 6 },
  { title: "All Hands", date: "Mar 12", claims: 15, verified: 11 },
];

const MeetingFactChecker: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");

  const totalClaims = mockClaims.length;
  const verified = mockClaims.filter(c => c.status === "Verified").length;

  return (
    <AgentPageLayout
      agentName="Fact Checker"
      tagline="Truth in every statement"
      icon={Shield}
      gradient="from-red-500 to-rose-600"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Claims", value: totalClaims.toString(), icon: Shield, color: "text-red-500" },
          { label: "Verified", value: `${Math.round((verified / totalClaims) * 100)}%`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Disputed", value: mockClaims.filter(c => c.status === "Disputed").length.toString(), icon: XCircle, color: "text-amber-500" },
          { label: "Sources Checked", value: mockClaims.reduce((a, c) => a + c.sources, 0).toString(), icon: Link, color: "text-blue-500" },
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Claims Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Session Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Session title..."
                className="text-sm h-9 border-gray-200 bg-gray-50/50 flex-1"
              />
              <Button
                size="sm"
                onClick={() => setIsActive(!isActive)}
                className={`h-9 px-4 text-xs shrink-0 ${
                  isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {isActive ? <Square size={12} className="mr-1.5" /> : <Play size={12} className="mr-1.5" />}
                {isActive ? "End Session" : "Start Session"}
              </Button>
            </div>
            {isActive && (
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-medium">Live verification active</span>
              </div>
            )}
          </div>

          {/* Claims */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Claims Feed</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {mockClaims.map((claim, i) => {
                const config = statusConfig[claim.status];
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 hover:bg-gray-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <StatusIcon size={16} className={`${config.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">"{claim.claim}"</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-400">— {claim.speaker}</span>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${config.bg}`}>
                            {claim.status}
                          </Badge>
                          {claim.confidence > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    claim.confidence > 75 ? "bg-emerald-400" : claim.confidence > 50 ? "bg-amber-400" : "bg-red-400"
                                  }`}
                                  style={{ width: `${claim.confidence}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">{claim.confidence}%</span>
                            </div>
                          )}
                          {claim.sources > 0 && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Link size={9} /> {claim.sources} sources
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sessions & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Verification Summary</h3>
            <div className="space-y-3">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = mockClaims.filter(c => c.status === status).length;
                const pct = Math.round((count / totalClaims) * 100);
                return (
                  <div key={status} className="flex items-center gap-3">
                    <config.icon size={14} className={config.color} />
                    <span className="text-xs text-gray-600 w-24">{status}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === "Verified" ? "bg-emerald-400" : status === "Disputed" ? "bg-red-400" : status === "Partially True" ? "bg-amber-400" : "bg-gray-300"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session History */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Session History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {mockSessions.map((session, i) => (
                <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Shield size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{session.title}</p>
                    <p className="text-xs text-gray-400">{session.date} · {session.claims} claims · {session.verified} verified</p>
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

export default MeetingFactChecker;
