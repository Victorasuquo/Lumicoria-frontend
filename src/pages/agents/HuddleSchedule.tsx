/**
 * HuddleSchedule — schedule a future Lumicoria Huddle.
 *
 * - Title, start, end (defaults to "now + 1h", "+1h" duration)
 * - Attendee emails (comma-separated)
 * - Agent picker
 * - Recording toggle + retention
 * - "Send Google Calendar invite" — pushes a calendar event with the
 *   share URL into the host's Google Workspace (if connected).
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Users, Bot, Video, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { huddleApi } from "@/services/huddleApi";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { isPlanCapError, showPlanCapToast } from "@/components/workspace/PlanCapToast";

const AGENT_CATALOG = [
  { key: "meeting", label: "Meeting Notes", desc: "Decisions + action items" },
  { key: "research", label: "Research", desc: "Cites sources live" },
  { key: "translation", label: "Translation", desc: "Multi-language captions" },
  { key: "document", label: "Document", desc: "Cross-refs your KB" },
  { key: "vision", label: "Vision", desc: "Reads shared screens" },
  { key: "wellbeing", label: "Wellbeing", desc: "Watches fatigue" },
];

function defaultStart(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
}
function defaultEnd(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  d.setHours(d.getHours() + 2);
  return d.toISOString().slice(0, 16);
}

const HuddleSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useWorkspace();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(defaultStart());
  const [end, setEnd] = useState(defaultEnd());
  const [attendeeList, setAttendeeList] = useState("");
  const [agentKeys, setAgentKeys] = useState<string[]>(["meeting"]);
  const [recording, setRecording] = useState(false);
  const [retention, setRetention] = useState(30);
  const [description, setDescription] = useState("");
  const [sendCalendar, setSendCalendar] = useState(true);
  const [busy, setBusy] = useState(false);

  const toggleAgent = (k: string) => {
    setAgentKeys((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  const submit = async () => {
    if (!title.trim()) { toast.error("Add a title."); return; }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!(endDate > startDate)) { toast.error("End must be after start."); return; }

    setBusy(true);
    try {
      const huddle = await huddleApi.create({
        title: title.trim(),
        meeting_type: "scheduled",
        organization_id: activeOrgId || undefined,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        agent_keys: agentKeys,
        recording_enabled: recording,
        recording_retention_days: retention,
      });

      const attendees = attendeeList
        .split(/[\s,;]+/)
        .map((e) => e.trim())
        .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));

      // Send email invites in parallel with calendar export
      if (attendees.length > 0) {
        try { await huddleApi.invite(huddle.id, attendees, description || undefined); }
        catch { /* fall through */ }
      }

      if (sendCalendar) {
        try {
          const r = await huddleApi.exportToCalendar(huddle.id, {
            attendees,
            description: description || undefined,
          });
          if (r.ok) {
            toast.success("Meeting scheduled and added to your calendar.");
          } else {
            toast.warning("Meeting scheduled. Calendar export skipped (connect Google Workspace to enable).");
          }
        } catch {
          toast.warning("Meeting scheduled. Calendar export failed.");
        }
      } else {
        toast.success("Meeting scheduled.");
      }

      navigate(`/agents/meeting`);
    } catch (e: any) {
      if (isPlanCapError(e)) {
        showPlanCapToast(e, navigate);
      } else {
        const detail = e?.response?.data?.detail;
        const msg = typeof detail === "string" ? detail : detail?.message || "Couldn't schedule the meeting.";
        toast.error(msg);
      }
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5 mb-4">
          <ArrowLeft size={12} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-purple-500" />
            <p className="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">Lumicoria Huddle</p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Schedule a meeting</h1>
          <p className="text-sm text-gray-500 mb-6">Pick a time, invite people, and choose which AI agents should join.</p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Engineering planning"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold flex items-center gap-1"><Clock size={10} />Start</label>
                <input
                  type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold flex items-center gap-1"><Clock size={10} />End</label>
                <input
                  type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold flex items-center gap-1"><Users size={10} />Attendees</label>
              <input
                value={attendeeList} onChange={(e) => setAttendeeList(e.target.value)}
                placeholder="alex@example.com, sam@example.com"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Agenda / notes (optional)</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Short context for attendees + the AI agents…"
                rows={3}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold flex items-center gap-1 mb-2"><Bot size={10} />AI agents in the call</label>
              <div className="grid grid-cols-2 gap-2">
                {AGENT_CATALOG.map((a) => {
                  const on = agentKeys.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      onClick={() => toggleAgent(a.key)}
                      type="button"
                      className={`text-left p-2.5 rounded-lg border transition ${on ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Bot size={11} className={on ? "text-purple-600" : "text-gray-400"} />
                        <span className="text-xs font-semibold text-gray-800">{a.label}</span>
                        {on && <Badge variant="outline" className="ml-auto text-[10px] border-purple-300 text-purple-700">On</Badge>}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{a.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/40">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" checked={recording} onChange={(e) => setRecording(e.target.checked)} />
                Record this meeting
              </label>
              {recording && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <span>Retention:</span>
                  <input
                    type="number" min={1} max={365} value={retention}
                    onChange={(e) => setRetention(Number(e.target.value) || 30)}
                    className="w-20 border border-gray-200 rounded-md px-2 py-1 text-xs"
                  />
                  <span>days</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/40">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" checked={sendCalendar} onChange={(e) => setSendCalendar(e.target.checked)} />
                <Calendar size={12} />
                Send Google Calendar invites
              </label>
              <p className="text-[10px] text-gray-400 mt-1">Requires the host to have Google Workspace connected.</p>
            </div>
          </div>

          <Button onClick={submit} disabled={busy} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white h-11">
            {busy ? <Loader2 size={14} className="animate-spin mr-2" /> : <Video size={14} className="mr-2" />}
            {busy ? "Scheduling…" : "Schedule meeting"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HuddleSchedule;
