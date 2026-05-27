/**
 * LogActivityDialog — log a wellbeing activity (break, exercise,
 * mindfulness, walk, etc.).  Used by the Coach quick actions and
 * the dashboard's "Log activity" button.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wellbeingApi } from "@/services/api";
import { useWellbeing } from "@/contexts/WellbeingContext";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  X,
  Loader2,
  Coffee,
  Dumbbell,
  Brain,
  Footprints,
  Moon,
  Apple,
  Droplet,
} from "lucide-react";

interface LogActivityDialogProps {
  open: boolean;
  onClose: () => void;
  defaultActivity?: string;
  onLogged?: () => void;
}

const ACTIVITY_OPTIONS: Array<{
  value: string;
  label: string;
  icon: React.ElementType;
  defaultMinutes: number;
  tone: string;
}> = [
  { value: "break", label: "Break", icon: Coffee, defaultMinutes: 5, tone: "from-amber-50 to-orange-50" },
  { value: "exercise", label: "Exercise", icon: Dumbbell, defaultMinutes: 30, tone: "from-rose-50 to-pink-50" },
  { value: "meditation", label: "Mindfulness", icon: Brain, defaultMinutes: 10, tone: "from-purple-50 to-violet-50" },
  { value: "walking", label: "Walk", icon: Footprints, defaultMinutes: 20, tone: "from-emerald-50 to-teal-50" },
  { value: "sleep", label: "Sleep", icon: Moon, defaultMinutes: 480, tone: "from-indigo-50 to-blue-50" },
  { value: "nutrition", label: "Nutrition", icon: Apple, defaultMinutes: 15, tone: "from-lime-50 to-green-50" },
  { value: "hydration", label: "Hydration", icon: Droplet, defaultMinutes: 1, tone: "from-sky-50 to-cyan-50" },
];

export const LogActivityDialog: React.FC<LogActivityDialogProps> = ({
  open,
  onClose,
  defaultActivity = "break",
  onLogged,
}) => {
  const { toast } = useToast();
  const { refresh } = useWellbeing();
  const [activity, setActivity] = useState(defaultActivity);
  const [minutes, setMinutes] = useState<number>(
    ACTIVITY_OPTIONS.find((a) => a.value === defaultActivity)?.defaultMinutes ?? 10,
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSelectActivity = (value: string) => {
    setActivity(value);
    const a = ACTIVITY_OPTIONS.find((x) => x.value === value);
    if (a) setMinutes(a.defaultMinutes);
  };

  const submit = async () => {
    if (!minutes || minutes <= 0) {
      toast({ title: "Pick a duration", description: "Must be greater than zero.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await wellbeingApi.recordActivity({
        activity_type: activity,
        duration_minutes: minutes,
        metadata: notes ? { notes } : undefined,
      });
      toast({ title: "Activity logged", description: `${minutes} min ${activity}` });
      onLogged?.();
      refresh();
      onClose();
    } catch (e: any) {
      toast({
        title: "Could not log activity",
        description: e?.response?.data?.detail || e?.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selected = ACTIVITY_OPTIONS.find((a) => a.value === activity) || ACTIVITY_OPTIONS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            key="card"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 28px 64px rgba(15,23,42,0.18)" }}
          >
            <div className={`bg-gradient-to-br ${selected.tone} p-6 relative transition-colors`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-sm">
                  <Activity size={22} className="text-gray-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Log an activity</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track what you just did — feeds the dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Activity</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ACTIVITY_OPTIONS.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.value}
                        onClick={() => onSelectActivity(a.value)}
                        className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                          activity === a.value
                            ? "bg-gradient-to-br from-gray-50 to-white ring-2 ring-gray-200 shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} className="text-gray-700" />
                        <span className="text-[11px] text-gray-700 font-medium">{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Duration (minutes)</p>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-gray-200 outline-none text-sm"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Notes (optional)</p>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Felt good after a short walk."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-gray-200 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium shadow-sm transition-all disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
                Log activity
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
