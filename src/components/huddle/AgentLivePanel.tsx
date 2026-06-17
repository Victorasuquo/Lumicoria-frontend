/**
 * AgentLivePanel — renders live AI agent responses streaming in via
 * the Huddle WebSocket. One card per response, grouped by agent_key.
 */

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AgentResponseEvent } from "@/hooks/useHuddleWebSocket";

interface AgentLivePanelProps {
  agentsAttached: string[];
  agentResponses: AgentResponseEvent[];
  connected: boolean;
}

const LABEL_BY_KEY: Record<string, string> = {
  meeting: "Meeting Notes",
  research: "Research",
  translation: "Translation",
  document: "Document",
  vision: "Vision",
  wellbeing: "Wellbeing",
  creative: "Creative",
  social_media: "Social Media",
  focus_flow: "Focus Coach",
  workspace_ergonomics: "Ergonomics",
};

function labelOf(key: string): string {
  return LABEL_BY_KEY[key] || key.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());
}

export const AgentLivePanel: React.FC<AgentLivePanelProps> = ({ agentsAttached, agentResponses, connected }) => {
  const latestByAgent = useMemo(() => {
    const map = new Map<string, AgentResponseEvent>();
    for (const r of agentResponses) map.set(r.agent_key, r);
    return map;
  }, [agentResponses]);

  if (agentsAttached.length === 0) {
    return (
      <div className="text-center py-10 px-2">
        <Bot size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-xs text-gray-500">No agents attached yet. Open the Agents tab to add Meeting Notes, Research, Translation, or others.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Live AI</p>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-[10px] text-gray-400">{connected ? "Streaming" : "Offline"}</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {agentsAttached.map((key) => {
          const latest = latestByAgent.get(key);
          const waiting = !latest;
          const failed = latest && !latest.ok;
          const text = latest?.response || "";

          return (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center">
                  <Bot size={12} />
                </span>
                <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{labelOf(key)}</span>
                {failed && (
                  <Badge variant="outline" className="text-[10px] border-red-200 text-red-600 bg-red-50">Error</Badge>
                )}
                {!failed && latest?.latency_ms && (
                  <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500">
                    {Math.round(latest.latency_ms)}ms
                  </Badge>
                )}
              </div>

              {waiting && (
                <p className="text-[11px] text-gray-400 italic flex items-center gap-1.5">
                  <Loader2 size={10} className="animate-spin" /> Waiting for the first chunk…
                </p>
              )}

              {failed && (
                <p className="text-[11px] text-red-500 flex items-start gap-1.5">
                  <AlertCircle size={11} className="shrink-0 mt-0.5" />
                  {latest?.error || "Couldn't reach this agent."}
                </p>
              )}

              {!waiting && !failed && (
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {text || <span className="text-gray-400 italic">No response yet.</span>}
                </p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AgentLivePanel;
