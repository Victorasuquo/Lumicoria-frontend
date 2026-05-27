/**
 * GoalCreateDialog — real goal-creation form.  Replaces the
 * placeholder toast on the Well-being dashboard.
 *
 * Apple-iOS visual: bottom-sheet on mobile, centered card on
 * desktop, rounded 24px corners, soft pastel gradient header.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wellbeingApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Target, X, Loader2 } from "lucide-react";

interface GoalCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const GOAL_TYPES: Array<{ value: string; label: string; unit: string; defaultTarget: number }> = [
  { value: "mood", label: "Daily mood", unit: "score (1–10)", defaultTarget: 7 },
  { value: "energy", label: "Daily energy", unit: "score (1–10)", defaultTarget: 7 },
  { value: "stress", label: "Lower stress", unit: "score (1–10)", defaultTarget: 4 },
  { value: "sleep", label: "Sleep quality", unit: "hours", defaultTarget: 7 },
  { value: "exercise", label: "Exercise", unit: "minutes / day", defaultTarget: 30 },
  { value: "mindfulness", label: "Mindfulness", unit: "minutes / day", defaultTarget: 10 },
  { value: "work_life_balance", label: "Work-life balance", unit: "score (1–10)", defaultTarget: 7 },
  { value: "productivity", label: "Productivity", unit: "score (1–10)", defaultTarget: 7 },
];

const isoToday = () => new Date().toISOString().slice(0, 10);
const isoInDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const GoalCreateDialog: React.FC<GoalCreateDialogProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { toast } = useToast();
  const [goalType, setGoalType] = useState(GOAL_TYPES[0].value);
  const [targetValue, setTargetValue] = useState<number>(GOAL_TYPES[0].defaultTarget);
  const [startDate, setStartDate] = useState(isoToday());
  const [endDate, setEndDate] = useState(isoInDays(28));
  const [submitting, setSubmitting] = useState(false);

  const selected = GOAL_TYPES.find((g) => g.value === goalType) || GOAL_TYPES[0];

  const onSelectType = (value: string) => {
    setGoalType(value);
    const g = GOAL_TYPES.find((x) => x.value === value);
    if (g) setTargetValue(g.defaultTarget);
  };

  const submit = async () => {
    if (!targetValue || targetValue <= 0) {
      toast({
        title: "Pick a target",
        description: "Target value must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await wellbeingApi.createGoal({
        goal_type: goalType,
        target_value: targetValue,
        start_date: startDate,
        end_date: endDate,
      });
      toast({
        title: "Goal created",
        description: `${selected.label} → ${targetValue} ${selected.unit}`,
      });
      onCreated?.();
      onClose();
    } catch (e: any) {
      toast({
        title: "Could not create goal",
        description: e?.response?.data?.detail || e?.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-sm">
                  <Target size={22} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New well-being goal</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tell the Coach what you'd like to work on.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Goal type */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Goal type</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TYPES.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => onSelectType(g.value)}
                      className={`p-3 rounded-2xl text-left transition-all ${
                        goalType === g.value
                          ? "bg-gradient-to-br from-purple-50 to-pink-50 ring-2 ring-purple-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{g.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{g.unit}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Target ({selected.unit})
                </p>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all text-sm"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Start</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">End</p>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
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
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium shadow-sm transition-all disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
                Create goal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
