import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale, Upload, AlertTriangle, CheckCircle2, FileText,
  Users, CalendarDays, DollarSign, ChevronRight, Eye, Shield,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const quickActions = [
  { label: "Analyze Contract", icon: Scale, color: "from-slate-500 to-gray-600" },
  { label: "Extract Clauses", icon: FileText, color: "from-blue-500 to-indigo-600" },
  { label: "Risk Assessment", icon: AlertTriangle, color: "from-red-500 to-rose-600" },
  { label: "Plain-language Summary", icon: Eye, color: "from-emerald-500 to-teal-600" },
];

const mockRisks = [
  { text: "Non-compete clause extends 24 months post-termination", severity: "High", clause: "Section 8.2" },
  { text: "Unlimited liability for indirect damages", severity: "High", clause: "Section 12.1" },
  { text: "Auto-renewal with 90-day notice period", severity: "Medium", clause: "Section 3.4" },
  { text: "Governing law in unfamiliar jurisdiction", severity: "Medium", clause: "Section 15.1" },
  { text: "Standard data protection provisions", severity: "Low", clause: "Section 9.3" },
];

const mockClauses = [
  { type: "Termination", section: "8.1", summary: "Either party may terminate with 30 days written notice" },
  { type: "Payment", section: "5.2", summary: "Net-30 payment terms, 1.5% monthly late fee" },
  { type: "IP Rights", section: "7.1", summary: "All work product owned by Client upon full payment" },
  { type: "Confidentiality", section: "9.1", summary: "5-year confidentiality period from disclosure date" },
  { type: "Indemnification", section: "11.1", summary: "Mutual indemnification for third-party claims" },
];

const mockEntities = [
  { type: "Party", value: "Acme Corporation", icon: Users },
  { type: "Party", value: "Lumicoria Inc.", icon: Users },
  { type: "Effective Date", value: "April 1, 2026", icon: CalendarDays },
  { type: "Term", value: "24 months", icon: CalendarDays },
  { type: "Value", value: "$240,000", icon: DollarSign },
];

const severityColors: Record<string, string> = {
  High: "bg-red-50 text-red-600 border-red-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  Low: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const severityDots: Record<string, string> = { High: "bg-red-500", Medium: "bg-amber-500", Low: "bg-emerald-500" };

const LegalDocumentAgent: React.FC = () => {
  return (
    <AgentPageLayout agentName="Legal Document Agent" tagline="Legal clarity simplified" icon={Scale} gradient="from-slate-500 to-gray-600">
      {/* Upload */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center mb-6 hover:border-gray-300 transition-colors">
        <Upload size={20} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 mb-1">Upload Contract or Legal Document</p>
        <p className="text-xs text-gray-400 mb-3">PDF, DOCX — up to 50MB</p>
        <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">Browse Files</Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickActions.map((a) => (
          <button key={a.label} className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-white mb-2`}><a.icon size={14} /></div>
            <p className="text-xs font-medium text-gray-700">{a.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Risk Assessment */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Risk Assessment</h3>
              <div className="flex gap-2">
                {["High", "Medium", "Low"].map((s) => (
                  <div key={s} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${severityDots[s]}`} /><span className="text-[10px] text-gray-400">{mockRisks.filter(r => r.severity === s).length}</span></div>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {mockRisks.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityDots[r.severity]}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{r.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${severityColors[r.severity]}`}>{r.severity}</Badge>
                      <span className="text-[10px] text-gray-400">{r.clause}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Clauses */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Key Clauses</h3></div>
            <div className="divide-y divide-gray-50">
              {mockClauses.map((c, i) => (
                <div key={i} className="p-4 flex items-start gap-3 hover:bg-gray-50/30 cursor-pointer transition-colors">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500 shrink-0">{c.section}</Badge>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{c.type}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.summary}</p>
                  </div>
                  <ChevronRight size={12} className="text-gray-300 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plain-language Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={14} className="text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900">Plain-Language Summary</h3>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs text-gray-600 leading-relaxed space-y-2">
              <p>This is a 2-year service agreement between Acme Corporation and Lumicoria Inc. worth $240,000.</p>
              <p>Either side can end it with 30 days notice. All work created belongs to the client once paid. There's a strong non-compete clause that lasts 2 years after the contract ends.</p>
              <p><span className="font-medium text-red-600">Watch out:</span> The liability section doesn't cap indirect damages, which could be risky.</p>
            </div>
          </div>

          {/* Extracted Entities */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Extracted Entities</h3>
            <div className="space-y-2">
              {mockEntities.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50">
                  <e.icon size={14} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400">{e.type}</p>
                    <p className="text-xs font-medium text-gray-700">{e.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compare */}
          <Button variant="outline" className="w-full border-gray-200 h-9 text-xs">
            <Scale size={14} className="mr-2" /> Compare Documents
          </Button>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default LegalDocumentAgent;
