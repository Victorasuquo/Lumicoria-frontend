/**
 * MoodPromptModal — global "quick check-in" modal that appears at
 * random intervals (server-scheduled) across every page.  Lets the
 * user log a mood / energy / stress score in one tap.
 *
 * Mounted once at the App root; visible only when the
 * WellbeingContext flips `moodPromptOpen` true.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellbeing } from "@/contexts/WellbeingContext";
import { wellbeingApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Heart, Battery, BrainCircuit, X, Loader2 } from "lucide-react";

type MetricType = "mood" | "energy" | "stress";

const METRIC_OPTIONS: Array<{
  type: MetricType;
  label: string;
  icon: React.ElementType;
  hint: string;
  scale: string;
}> = [
  { type: "mood", label: "Mood", icon: Heart, hint: "1 = rough · 10 = great", scale: "How are you feeling?" },
  { type: "energy", label: "Energy", icon: Battery, hint: "1 = drained · 10 = full", scale: "How's your energy?" },
  { type: "stress", label: "Stress", icon: BrainCircuit, hint: "1 = calm · 10 = overwhelmed", scale: "How stressed are you?" },
];

interface MoodPromptModalProps {
  /** Controlled-open override.  When undefined, the modal opens
   *  off the WellbeingContext (random server-scheduled prompt). */
  open?: boolean;
  /** Controlled-close handler.  When provided, dismissing the modal
   *  calls this instead of the context's snooze API. */
  onClose?: () => void;
  /** Default metric to pre-select. */
  defaultMetric?: MetricType;
  /** Where the log is coming from — written into the metric source. */
  source?: string;
}

export const MoodPromptModal: React.FC<MoodPromptModalProps> = ({
  open: controlledOpen,
  onClose,
  defaultMetric = "mood",
  source = "quick_prompt",
}) => {
  const { moodPromptOpen, dismissMoodPrompt, closeMoodPrompt, refresh } = useWellbeing();
  const { toast } = useToast();
  const [metric, setMetric] = useState<MetricType>(defaultMetric);
  const [submitting, setSubmitting] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? !!controlledOpen : moodPromptOpen;

  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      closeMoodPrompt();
    }
  };

  const handleDismiss = (snoozeMinutes: number = 90) => {
    if (isControlled) {
      onClose?.();
    } else {
      dismissMoodPrompt(snoozeMinutes);
    }
  };

  const log = async (value: number) => {
    setSubmitting(true);
    try {
      await wellbeingApi.submitMetric({
        metric_type: metric,
        value,
        source,
      });
      toast({ title: "Logged", description: `${metric}: ${value}/10` });
      handleClose();
      refresh();
    } catch (e: any) {
      toast({
        title: "Could not save",
        description: e?.response?.data?.detail || e?.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const current = METRIC_OPTIONS.find((m) => m.type === metric)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => handleDismiss()}
        >
          <motion.div
            key="card"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.18)" }}
          >
            <div className="p-5 border-b border-gray-50 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[1.5px] text-emerald-600 font-semibold mb-1">
                  Well-being Coach
                </p>
                <h3 className="text-lg font-semibold text-gray-900">Quick check-in</h3>
                <p className="text-xs text-gray-400 mt-0.5">Takes about three seconds.</p>
              </div>
              <button
                onClick={() => handleDismiss()}
                className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Metric tabs */}
            <div className="px-5 pt-4">
              <div className="inline-flex rounded-xl border border-gray-100 bg-gray-50/60 p-0.5 w-full">
                {METRIC_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setMetric(opt.type)}
                      disabled={submitting}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        metric === opt.type
                          ? "bg-white shadow-sm text-gray-900 font-medium"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon size={12} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scale 1..10 */}
            <div className="p-5">
              <p className="text-sm font-medium text-gray-800 mb-1">{current.scale}</p>
              <p className="text-xs text-gray-400 mb-4">{current.hint}</p>
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                  <button
                    key={v}
                    onClick={() => log(v)}
                    disabled={submitting}
                    className="aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => handleDismiss(90)}
                  disabled={submitting}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Snooze 90 min
                </button>
                {submitting && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Loader2 size={12} className="animate-spin" />
                    Saving…
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
