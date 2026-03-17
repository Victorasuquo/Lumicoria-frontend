import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Upload, Search, Sparkles, Clock, CheckCircle2,
  File, FileImage, FileSpreadsheet, MoreHorizontal, ArrowRight,
  Zap, ListChecks, CalendarDays, Tag,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const mockDocuments = [
  { id: "1", name: "Q2 Project Proposal.pdf", type: "PDF", size: "2.4 MB", date: "Mar 14, 2026", status: "Processed", extracted: 12, tasks: 4 },
  { id: "2", name: "Invoice #4288.xlsx", type: "Excel", size: "340 KB", date: "Mar 13, 2026", status: "Processed", extracted: 8, tasks: 2 },
  { id: "3", name: "Client Meeting Notes.docx", type: "Word", size: "128 KB", date: "Mar 12, 2026", status: "Processing", extracted: 0, tasks: 0 },
  { id: "4", name: "Team Roadmap.pdf", type: "PDF", size: "5.1 MB", date: "Mar 11, 2026", status: "Uploaded", extracted: 0, tasks: 0 },
];

const mockExtractions = [
  { type: "Date", value: "March 30, 2026", context: "Project deadline" },
  { type: "Amount", value: "$45,000", context: "Total budget allocation" },
  { type: "Person", value: "Sarah Chen", context: "Project lead" },
  { type: "Action", value: "Submit phase 1 deliverables", context: "By March 20" },
  { type: "Organization", value: "Acme Corp", context: "Client partner" },
];

const typeIcons: Record<string, React.ElementType> = {
  PDF: FileText, Excel: FileSpreadsheet, Word: File, Image: FileImage,
};

const statusColors: Record<string, string> = {
  Processed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Processing: "bg-amber-50 text-amber-600 border-amber-200",
  Uploaded: "bg-gray-50 text-gray-500 border-gray-200",
};

const extractionColors: Record<string, string> = {
  Date: "bg-blue-50 text-blue-600", Amount: "bg-emerald-50 text-emerald-600",
  Person: "bg-violet-50 text-violet-600", Action: "bg-orange-50 text-orange-600",
  Organization: "bg-pink-50 text-pink-600",
};

const DocumentAgent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  return (
    <AgentPageLayout
      agentName="Document Agent"
      tagline="Intelligent document processing"
      icon={FileText}
      gradient="from-violet-500 to-purple-600"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Documents", value: "24", icon: FileText, color: "text-violet-500" },
          { label: "Items Extracted", value: "186", icon: Tag, color: "text-blue-500" },
          { label: "Tasks Created", value: "42", icon: ListChecks, color: "text-emerald-500" },
          { label: "Avg. Time", value: "3.2s", icon: Clock, color: "text-amber-500" },
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
        {/* Left: Upload + Documents */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
            className={`bg-white border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              isDragging ? "border-lumicoria-purple bg-lumicoria-purple/5" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400 mb-4">PDF, DOCX, XLSX, Images — up to 50MB</p>
            <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">
              Browse Files
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Upload", icon: Upload, color: "from-violet-500 to-purple-600" },
              { label: "Extract", icon: Zap, color: "from-blue-500 to-indigo-600" },
              { label: "Analyze", icon: Search, color: "from-emerald-500 to-teal-600" },
              { label: "Summarize", icon: Sparkles, color: "from-amber-500 to-orange-600" },
            ].map((action) => (
              <button
                key={action.label}
                className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-2`}>
                  <action.icon size={14} />
                </div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{action.label}</p>
              </button>
            ))}
          </div>

          {/* Document List */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Documents</h3>
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 h-7">View all</Button>
            </div>
            <div className="divide-y divide-gray-50">
              {mockDocuments.map((doc, i) => {
                const Icon = typeIcons[doc.type] || File;
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.size} · {doc.date}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusColors[doc.status]}`}>
                      {doc.status}
                    </Badge>
                    {doc.extracted > 0 && (
                      <span className="text-[10px] text-gray-400">{doc.extracted} items</span>
                    )}
                    <MoreHorizontal size={14} className="text-gray-300" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Extraction Results + Query */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Document */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Query Document</h3>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about the document..."
                className="text-sm h-9 border-gray-200 bg-gray-50/50"
              />
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0">
                <Search size={14} />
              </Button>
            </div>
          </div>

          {/* Extraction Results */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Extracted Data</h3>
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-200 text-gray-500">
                Q2 Project Proposal
              </Badge>
            </div>
            <div className="p-4 space-y-3">
              {mockExtractions.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <Badge className={`text-[10px] px-2 py-0 shrink-0 mt-0.5 ${extractionColors[item.type]}`}>
                    {item.type}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                    <p className="text-xs text-gray-400">{item.context}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs">
              <ListChecks size={14} className="mr-2" />
              Create Tasks from Document
            </Button>
            <Button variant="outline" className="w-full border-gray-200 h-9 text-xs">
              <CalendarDays size={14} className="mr-2" />
              Add Dates to Calendar
            </Button>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default DocumentAgent;
