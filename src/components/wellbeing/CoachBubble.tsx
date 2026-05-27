/**
 * CoachBubble — floating recommendation card that lives on every
 * agent page.  Surfaces the highest-priority active recommendation
 * from the Well-being Coach.  Dismissible per recommendation.
 *
 * Mounted once at the App root.  Hidden on the wellbeing pages
 * themselves (those surfaces already show the recommendation
 * inline, no need to duplicate).
 */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWellbeing } from "@/contexts/WellbeingContext";
import { Sparkles, X, ArrowRight } from "lucide-react";

const HIDE_ON_PATHS = ["/wellbeing", "/agents/wellbeing"];

const PRIORITY_TONE: Record<string, { bg: string; ring: string; text: string }> = {
  urgent: { bg: "from-rose-50 to-pink-50", ring: "ring-rose-200", text: "text-rose-700" },
  high: { bg: "from-amber-50 to-orange-50", ring: "ring-amber-200", text: "text-amber-700" },
  medium: { bg: "from-emerald-50 to-teal-50", ring: "ring-emerald-200", text: "text-emerald-700" },
  low: { bg: "from-sky-50 to-indigo-50", ring: "ring-sky-200", text: "text-sky-700" },
};

export const CoachBubble: React.FC = () => {
  const { topRecommendation, dismissRecommendation } = useWellbeing();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Hide on the wellbeing pages themselves.
  if (HIDE_ON_PATHS.some((p) => location.pathname.startsWith(p))) return null;
  if (!topRecommendation) return null;

  const priority = String(topRecommendation.priority || "medium").toLowerCase();
  const tone = PRIORITY_TONE[priority] || PRIORITY_TONE.medium;
  const title = String(topRecommendation.title || "Quick suggestion");
  const description = String(topRecommendation.description || "");
  const action = topRecommendation.suggested_activity
    ? String(topRecommendation.suggested_activity)
    : null;

  return (
    <AnimatePresence>
      <motion.div
        key={`rec-${topRecommendation.id || topRecommendation.title}`}
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.95 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="fixed bottom-6 right-6 z-[60] max-w-[340px] pointer-events-auto"
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br ${tone.bg} ${tone.ring} ring-1 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform`}
            style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}
          >
            <Sparkles size={14} className={tone.text} />
            <span className={`text-xs font-medium ${tone.text}`}>Coach tip</span>
          </button>
        ) : (
          <div
            className={`rounded-3xl bg-gradient-to-br ${tone.bg} ${tone.ring} ring-1 shadow-xl overflow-hidden`}
            style={{ boxShadow: "0 18px 48px rgba(15,23,42,0.14)" }}
          >
            <div className="p-4 backdrop-blur-sm bg-white/40">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded-lg bg-white/70 ${tone.text}`}>
                    <Sparkles size={12} />
                  </div>
                  <p className={`text-[10px] uppercase tracking-[1.5px] font-semibold ${tone.text}`}>
                    Well-being Coach
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setCollapsed(true)}
                    className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Minimize"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    onClick={dismissRecommendation}
                    className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1">
                {title}
              </h4>
              {description && (
                <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                  {description}
                </p>
              )}
              {action && (
                <p className="text-[11px] text-gray-500 italic mb-3">
                  Try: {action}
                </p>
              )}
              <button
                onClick={() => {
                  navigate("/agents/wellbeing");
                }}
                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/80 hover:bg-white text-xs font-medium ${tone.text} transition-colors`}
              >
                Open Coach
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
