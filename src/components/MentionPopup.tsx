import React, { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Globe, Brain, Search, BookOpen, Users, Check,
  Sparkles, Star, BarChart, Zap, Shield, Languages,
  MessageSquare, Smile, Music, Clock, StickyNote,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────── */
export interface MentionDocument {
  document_id: string;
  title: string;
  source: string;
  chunk_count?: number;
  mime_type?: string;
}

export interface MentionAgent {
  key: string;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

export type MentionItem =
  | { type: "document"; data: MentionDocument }
  | { type: "agent"; data: MentionAgent };

/* ─── Agent registry ──────────────────────────────────────────────────── */
export const AGENT_LIST: MentionAgent[] = [
  { key: "general", label: "General", description: "General-purpose assistant", color: "#6C4AB0", icon: <Brain size={14} /> },
  { key: "research", label: "Research", description: "Deep research & analysis", color: "#2563eb", icon: <Search size={14} /> },
  { key: "research_mentor", label: "Research Mentor", description: "Academic research guidance", color: "#7c3aed", icon: <BookOpen size={14} /> },
  { key: "document", label: "Document", description: "Document processing & summarization", color: "#0891b2", icon: <FileText size={14} /> },
  { key: "meeting", label: "Meeting", description: "Meeting notes & scheduling", color: "#0d9488", icon: <Users size={14} /> },
  { key: "meeting_fact_checker", label: "Fact Checker", description: "Verify claims & facts", color: "#059669", icon: <Check size={14} /> },
  { key: "creative", label: "Creative", description: "Creative writing & content", color: "#d946ef", icon: <Sparkles size={14} /> },
  { key: "social_media", label: "Social Media", description: "Social media posts & strategy", color: "#ec4899", icon: <Globe size={14} /> },
  { key: "student", label: "Student", description: "Study help & tutoring", color: "#f97316", icon: <BookOpen size={14} /> },
  { key: "learning_coach", label: "Learning Coach", description: "Personalized learning plans", color: "#eab308", icon: <Star size={14} /> },
  { key: "rag", label: "Knowledge Base", description: "Search your documents", color: "#06b6d4", icon: <Brain size={14} /> },
  { key: "data_analysis", label: "Data Analysis", description: "Data insights & visualization", color: "#8b5cf6", icon: <BarChart size={14} /> },
  { key: "knowledge_graph", label: "Knowledge Graph", description: "Connect concepts & ideas", color: "#14b8a6", icon: <Zap size={14} /> },
  { key: "legal_document", label: "Legal", description: "Legal document analysis", color: "#64748b", icon: <Shield size={14} /> },
  { key: "translation", label: "Translation", description: "Multi-language translation", color: "#3b82f6", icon: <Languages size={14} /> },
  { key: "customer_service", label: "Support", description: "Customer service & FAQ", color: "#10b981", icon: <MessageSquare size={14} /> },
  { key: "ethics_bias", label: "Ethics & Bias", description: "Ethics review & bias detection", color: "#f43f5e", icon: <Shield size={14} /> },
  { key: "wellbeing", label: "Wellbeing", description: "Mental health & wellness", color: "#22c55e", icon: <Smile size={14} /> },
  { key: "focus_flow", label: "Focus Flow", description: "Productivity & focus", color: "#a855f7", icon: <Music size={14} /> },
  { key: "workspace_ergonomics", label: "Ergonomics", description: "Workspace setup tips", color: "#78716c", icon: <Clock size={14} /> },
  { key: "vision", label: "Vision", description: "Image analysis & generation", color: "#0ea5e9", icon: <Globe size={14} /> },
];

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  upload: <FileText size={13} className="text-purple-500" />,
  web: <Globe size={13} className="text-emerald-500" />,
  manual_entry: <StickyNote size={13} className="text-amber-500" />,
  chat_history: <MessageSquare size={13} className="text-blue-500" />,
};

/* ─── Props ────────────────────────────────────────────────────────────── */
interface MentionPopupProps {
  isOpen: boolean;
  mode: "@" | "/";
  query: string;
  items: MentionItem[];
  selectedIndex: number;
  onSelect: (item: MentionItem) => void;
  position?: { bottom: number; left: number };
}

/* ─── Component ────────────────────────────────────────────────────────── */
const MentionPopup: React.FC<MentionPopupProps> = ({
  isOpen,
  mode,
  query,
  items,
  selectedIndex,
  onSelect,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen || items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className="absolute bottom-full left-0 right-0 mb-1 mx-3 z-[100]"
      >
        <div
          ref={listRef}
          className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden max-h-[280px] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/80 sticky top-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {mode === "@" ? "Mention a document" : "Select an agent"}
            </p>
          </div>

          {/* Items */}
          <div className="py-1">
            {items.map((item, i) => {
              const isSelected = i === selectedIndex;

              if (item.type === "document") {
                const doc = item.data;
                return (
                  <button
                    key={doc.document_id}
                    ref={isSelected ? selectedRef : undefined}
                    onClick={() => onSelect(item)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-purple-50 border-l-2 border-purple-400"
                        : "hover:bg-gray-50 border-l-2 border-transparent"
                    }`}
                  >
                    {SOURCE_ICONS[doc.source] || <FileText size={13} className="text-gray-400" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {doc.title}
                      </p>
                      {doc.chunk_count != null && (
                        <p className="text-[10px] text-gray-400">
                          {doc.chunk_count} chunks
                        </p>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-300 shrink-0 uppercase">
                      {doc.source === "web" ? "url" : doc.source === "manual_entry" ? "note" : doc.source}
                    </span>
                  </button>
                );
              }

              // Agent item
              const agent = item.data;
              return (
                <button
                  key={agent.key}
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => onSelect(item)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "bg-purple-50 border-l-2 border-purple-400"
                      : "hover:bg-gray-50 border-l-2 border-transparent"
                  }`}
                >
                  <span
                    className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
                    style={{ backgroundColor: agent.color + "18", color: agent.color }}
                  >
                    {agent.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{agent.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{agent.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50/60">
            <p className="text-[9px] text-gray-300">
              ↑↓ navigate · ↵ select · esc dismiss
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MentionPopup;
