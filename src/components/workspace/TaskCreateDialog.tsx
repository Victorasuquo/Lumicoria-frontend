/**
 * TaskCreateDialog — opens from a project board column or detail page.
 *
 * Posts to /api/v1/tasks with project_id + initial status pre-filled.
 * Optionally assigns the task to one of the project's attached agents —
 * previously this dialog had no agent field at all, so project-level
 * agent attachment was decorative (agents only ever ran via the global
 * Tasks page). The backend already fires the executor immediately when
 * `assigned_to_agent` is set at create time (tasks.py's Phase-6 kickoff).
 */

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { projectV2Api, type ProjectAgent } from "@/services/workspaceApi";

interface Props {
  open: boolean;
  onClose: () => void;
  orgId?: string;
  projectId: string;
  defaultStatus?: string;
  onCreated?: (taskId: string) => void;
}

export const TaskCreateDialog: React.FC<Props> = ({
  open, onClose, orgId, projectId, defaultStatus = "todo", onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState(defaultStatus);
  const [dueDate, setDueDate] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("");
  const [projectAgents, setProjectAgents] = useState<ProjectAgent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !orgId) return;
    projectV2Api.agents(orgId, projectId)
      .then(list => setProjectAgents((list || []).filter(a => a.enabled && a.agent_key)))
      .catch(() => setProjectAgents([]));
  }, [open, orgId, projectId]);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim()) { setError("Give the task a title."); return; }
    setBusy(true); setError(null);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description || undefined,
        priority, status,
        project_id: projectId,
      };
      if (dueDate) payload.due_date = new Date(dueDate).toISOString();
      if (assignedAgent) payload.assigned_to_agent = assignedAgent;
      const { data } = await api.post("/tasks", payload);
      onCreated?.(data?.id || data?._id || "");
      onClose();
      setTitle(""); setDescription(""); setDueDate(""); setAssignedAgent("");
    } catch (e: any) {
      setError(e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Could not create task");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">New task</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</span>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submit(); }}
              placeholder="What needs to happen?"
              className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30 focus:border-[#6C4AB0]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional notes, context, or links."
              className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30 resize-none"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</span>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
              />
            </label>
          </div>
          {projectAgents.length > 0 && (
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assign to agent</span>
              <select
                value={assignedAgent}
                onChange={e => setAssignedAgent(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
              >
                <option value="">— No agent (manual task) —</option>
                {projectAgents.map(a => (
                  <option key={a.id} value={a.agent_key || ""}>
                    {a.agent_key}{a.autonomy_level === "auto-execute" ? " (auto-execute)" : ""}
                  </option>
                ))}
              </select>
              {assignedAgent && (
                <p className="mt-1 text-[11px] text-slate-400">
                  The agent runs as soon as this task is created.
                </p>
              )}
            </label>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy || !title.trim()}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-[#6C4AB0] text-white hover:bg-[#5b3d99] disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreateDialog;
