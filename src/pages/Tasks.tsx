import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  ListChecks, CheckCircle2, Loader2, Search,
  Clock, AlertCircle, X, ChevronRight,
  Circle, PlayCircle, CheckCircle, XCircle, PauseCircle,
  FileText, Filter, ArrowUpDown,
} from "lucide-react";
import { taskApi, TaskItem } from "@/services/api";

/* ── Config ────────────────────────────────────────────────── */

const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string; badgeCls: string }> = {
  todo:        { label: "To Do",       icon: Circle,      cls: "text-gray-400",    badgeCls: "bg-gray-100 text-gray-600 border-gray-200" },
  in_progress: { label: "In Progress", icon: PlayCircle,  cls: "text-blue-500",    badgeCls: "bg-blue-100 text-blue-600 border-blue-200" },
  completed:   { label: "Completed",   icon: CheckCircle, cls: "text-emerald-500",  badgeCls: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  cancelled:   { label: "Cancelled",   icon: XCircle,     cls: "text-red-400",     badgeCls: "bg-red-100 text-red-500 border-red-200" },
  blocked:     { label: "Blocked",     icon: PauseCircle, cls: "text-amber-500",   badgeCls: "bg-amber-100 text-amber-600 border-amber-200" },
  deferred:    { label: "Deferred",    icon: Clock,       cls: "text-slate-400",   badgeCls: "bg-slate-100 text-slate-500 border-slate-200" },
};

const priorityConfig: Record<string, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-red-100 text-red-700 border-red-200" },
  high:     { label: "High",     cls: "bg-orange-100 text-orange-700 border-orange-200" },
  medium:   { label: "Medium",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
  low:      { label: "Low",      cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

function getTaskName(task: TaskItem): string {
  return task.title || task.name || "Untitled Task";
}

function getTaskAssignee(task: TaskItem): string | null {
  // Check assigned_to field first, then metadata for name from document extraction
  if (task.metadata?.assigned_to_name) return task.metadata.assigned_to_name;
  if (task.metadata?.suggested_assignee) return task.metadata.suggested_assignee;
  if (task.assigned_to) return task.assigned_to;
  return null;
}

function getTaskPriority(task: TaskItem): string {
  if (typeof task.priority === "string") return task.priority.toLowerCase();
  if (typeof task.priority === "number") {
    if (task.priority >= 4) return "critical";
    if (task.priority >= 3) return "high";
    if (task.priority >= 2) return "medium";
    return "low";
  }
  return "medium";
}

/* ── Component ─────────────────────────────────────────────── */

const Tasks: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "priority" | "due">("created");

  const fetchTasks = useCallback(async () => {
    try {
      const result = await taskApi.getTasks({ limit: 200 });
      setTasks(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast({ title: "Error", description: "Could not load tasks", variant: "destructive" });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTasks().finally(() => setLoading(false));
  }, []);

  // Update selected task when tasks refresh
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }
  }, [tasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      toast({ title: "Task updated", description: `Status changed to ${statusConfig[newStatus]?.label || newStatus}` });
      await fetchTasks();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.response?.data?.detail || "Could not update task",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      toast({ title: "Task deleted" });
      if (selectedTask?.id === taskId) setSelectedTask(null);
      await fetchTasks();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  /* ── Filtering & Sorting ──────────────────────────────── */
  const filtered = tasks
    .filter(t => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = getTaskName(t).toLowerCase();
        const desc = (t.description || "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[getTaskPriority(a)] ?? 2) - (order[getTaskPriority(b)] ?? 2);
      }
      if (sortBy === "due") {
        const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return aDate - bDate;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  /* ── Stats ────────────────────────────────────────────── */
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === "todo").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <ListChecks size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-400">Manage tasks created from documents and agents</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: totalTasks, icon: ListChecks, color: "text-violet-500" },
            { label: "To Do", value: todoCount, icon: Circle, color: "text-gray-500" },
            { label: "In Progress", value: inProgressCount, icon: PlayCircle, color: "text-blue-500" },
            { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-emerald-500" },
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
          {/* ── Left: Task List ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Filters */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-8 h-8 text-sm border-gray-200 bg-gray-50/50"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={12} className="text-gray-400" />
                {["all", "todo", "in_progress", "completed", "blocked"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                      filterStatus === s
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {s === "all" ? "All" : statusConfig[s]?.label || s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={12} className="text-gray-400" />
                {(["created", "priority", "due"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      sortBy === s ? "bg-violet-100 text-violet-700" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {s === "created" ? "Newest" : s === "priority" ? "Priority" : "Due Date"}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">All Tasks</h3>
                <span className="text-xs text-gray-400">{filtered.length} of {totalTasks}</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={20} className="text-gray-300 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ListChecks size={32} className="opacity-20 mb-3" />
                  <p className="text-sm font-medium">
                    {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
                  </p>
                  <p className="text-xs mt-1">
                    {tasks.length === 0
                      ? "Tasks created from documents will appear here"
                      : "Try adjusting your search or filters"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <div className="divide-y divide-gray-50">
                    {filtered.map((task, i) => {
                      const si = statusConfig[task.status] || statusConfig.todo;
                      const pri = getTaskPriority(task);
                      const isSelected = selectedTask?.id === task.id;

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => setSelectedTask(task)}
                          className={`group p-3.5 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                            isSelected ? "bg-purple-50/50 border-l-2 border-l-purple-500" : ""
                          }`}
                        >
                          <si.icon size={18} className={si.cls} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${
                              task.status === "completed" ? "text-gray-400 line-through" : "text-gray-800"
                            }`}>
                              {getTaskName(task)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityConfig[pri]?.cls || priorityConfig.medium.cls}`}>
                                {priorityConfig[pri]?.label || "Medium"}
                              </Badge>
                              {task.due_date && (
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Clock size={10} /> {formatDate(task.due_date)}
                                </span>
                              )}
                              {getTaskAssignee(task) && (
                                <span className="text-[11px] text-violet-500 truncate max-w-[100px]">
                                  {getTaskAssignee(task)}
                                </span>
                              )}
                              {task.document_id && (
                                <FileText size={10} className="text-purple-300" />
                              )}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* ── Right: Task Detail ── */}
          <div className="lg:col-span-3">
            {selectedTask ? (
              <motion.div
                key={selectedTask.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${
                          priorityConfig[getTaskPriority(selectedTask)]?.cls || priorityConfig.medium.cls
                        }`}>
                          {priorityConfig[getTaskPriority(selectedTask)]?.label || "Medium"}
                        </Badge>
                        {(() => {
                          const si = statusConfig[selectedTask.status] || statusConfig.todo;
                          return (
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${si.badgeCls}`}>
                              <si.icon size={10} className="mr-1" />
                              {si.label}
                            </Badge>
                          );
                        })()}
                        {selectedTask.document_id && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 border-purple-200">
                            <FileText size={10} className="mr-1" />
                            From Document
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                        {getTaskName(selectedTask)}
                      </h2>
                    </div>
                    <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0">
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTask.metadata?.document_name && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Source Document</p>
                        <p className="text-sm text-purple-600 flex items-center gap-1">
                          <FileText size={12} />
                          {selectedTask.metadata.document_name}
                        </p>
                      </div>
                    )}
                    {selectedTask.due_date && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Due Date</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Clock size={13} className="text-gray-400" />
                          {formatDate(selectedTask.due_date)}
                        </div>
                      </div>
                    )}
                    {getTaskAssignee(selectedTask) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assigned To</p>
                        <p className="text-sm text-gray-700">{getTaskAssignee(selectedTask)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created</p>
                      <p className="text-sm text-gray-700">{formatDate(selectedTask.created_at)}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTask.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Change */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Change Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => handleStatusChange(selectedTask.id, key)}
                          disabled={updatingStatus || selectedTask.status === key}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-50 ${
                            selectedTask.status === key
                              ? config.badgeCls + " font-medium"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <config.icon size={12} />
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      className={`h-8 text-xs ${
                        selectedTask.status === "completed"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white`}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(
                        selectedTask.id,
                        selectedTask.status === "completed" ? "todo" : "completed"
                      )}
                    >
                      {updatingStatus ? (
                        <Loader2 size={12} className="mr-1.5 animate-spin" />
                      ) : selectedTask.status === "completed" ? (
                        <Circle size={12} className="mr-1.5" />
                      ) : (
                        <CheckCircle2 size={12} className="mr-1.5" />
                      )}
                      {selectedTask.status === "completed" ? "Reopen Task" : "Mark Complete"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(selectedTask.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <ListChecks size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600">Select a task</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Click on any task to view its full details, change status, or manage it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
