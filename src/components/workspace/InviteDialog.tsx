/**
 * InviteDialog — one dialog, three scopes (org / team / project).
 *
 * Hits the right backend endpoint based on `scope`:
 *   - org:     POST /api/v1/organizations/{org_id}/invites
 *   - team:    POST /api/v1/organizations/{org_id}/teams/{team_id}/invites
 *   - project: POST /api/v1/invites with metadata.project_id
 */

import React, { useState } from "react";
import api from "@/services/api";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  scope: "org" | "team" | "project";
  orgId: string;
  teamId?: string;
  projectId?: string;
  onInvited?: () => void;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({
  open, onClose, scope, orgId, teamId, projectId, onInvited,
}) => {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState("member");
  const [teamRole, setTeamRole] = useState("editor");
  const [projectRole, setProjectRole] = useState("editor");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);

  if (!open) return null;

  const submit = async () => {
    const list = emails
      .split(/[\s,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (list.length === 0) { setError("Enter at least one valid email."); return; }
    setBusy(true); setError(null);
    try {
      if (scope === "team" && teamId) {
        for (const email of list) {
          await api.post(`/organizations/${orgId}/teams/${teamId}/invites`, {
            email, role, team_role: teamRole, message: message || undefined,
          });
        }
      } else if (scope === "project" && projectId) {
        for (const email of list) {
          await api.post(`/invites?organization_id=${orgId}`, {
            email, role, scope: "project",
            project_id: projectId,
            message: message || undefined,
            metadata: { project_id: projectId, project_role: projectRole },
          });
        }
      } else {
        // org
        await api.post(`/organizations/${orgId}/invites`, {
          emails: list, role, message: message || undefined,
        });
      }
      setSent(list);
      setEmails("");
      onInvited?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Send failed");
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
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {scope === "org" ? "Invite to workspace" : scope === "team" ? "Invite to team" : "Invite to project"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            They'll get an email with a link to accept and join.
          </p>
        </div>

        {sent.length > 0 ? (
          <div className="px-6 py-6">
            <div className="text-sm font-semibold text-emerald-700 mb-2">Invitations sent.</div>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              {sent.map(e => <li key={e}>{e}</li>)}
            </ul>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => { setSent([]); }}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Invite more
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-[#6C4AB0] text-white hover:bg-[#5b3d99]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email addresses</span>
              <textarea
                value={emails}
                onChange={e => setEmails(e.target.value)}
                rows={3}
                placeholder="One per line, or comma-separated"
                className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30 focus:border-[#6C4AB0] resize-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Workspace role</span>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              {scope === "team" && (
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Team role</span>
                  <select
                    value={teamRole}
                    onChange={e => setTeamRole(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="editor">Editor</option>
                    <option value="team_admin">Team admin</option>
                  </select>
                </label>
              )}
              {scope === "project" && (
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project role</span>
                  <select
                    value={projectRole}
                    onChange={e => setProjectRole(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                    <option value="lead">Lead</option>
                  </select>
                </label>
              )}
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Personal note (optional)</span>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="Say hi or share why you're inviting them."
                className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4AB0]/30 focus:border-[#6C4AB0] resize-none"
              />
            </label>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-[#6C4AB0] text-white hover:bg-[#5b3d99] disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send invites"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteDialog;
