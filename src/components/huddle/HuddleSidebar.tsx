/**
 * HuddleSidebar — the 25% right-rail next to the Jitsi iframe.
 *
 * Tabs: Transcript · Agents · Participants · Invite · Settings
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot, MessageSquare, Users, Sparkles, Share2, Settings as SettingsIcon,
  Circle, StopCircle, PhoneOff, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { huddleApi, type Huddle, type HuddleParticipant, type HuddleTranscriptChunk } from "@/services/huddleApi";
import { useHuddleRecorder } from "@/hooks/useHuddleRecorder";
import { useHuddleWebSocket } from "@/hooks/useHuddleWebSocket";
import InvitePanel from "./InvitePanel";
import AgentLivePanel from "./AgentLivePanel";

type TabKey = "transcript" | "agents" | "live" | "participants" | "invite" | "settings";

interface HuddleSidebarProps {
  huddle: Huddle;
  isHost: boolean;
  onEnded: () => void;
  /** Optional: a live transcript line being typed by the user-side STT. */
  liveTranscript?: string;
}

const AGENT_CATALOG: Array<{ key: string; label: string; desc: string }> = [
  { key: "meeting", label: "Meeting Notes", desc: "Captures decisions + action items" },
  { key: "research", label: "Research", desc: "Resolves factual questions with citations" },
  { key: "translation", label: "Translation", desc: "Multi-language captions" },
  { key: "document", label: "Document", desc: "Cross-refs live talk against your KB" },
  { key: "vision", label: "Vision", desc: "Reads shared screens + whiteboards" },
  { key: "wellbeing", label: "Wellbeing", desc: "Watches fatigue + suggests breaks" },
];

export const HuddleSidebar: React.FC<HuddleSidebarProps> = ({ huddle, isHost, onEnded, liveTranscript }) => {
  const [tab, setTab] = useState<TabKey>("live");
  const [initialChunks, setInitialChunks] = useState<HuddleTranscriptChunk[]>([]);
  const [agentsAttached, setAgentsAttached] = useState<string[]>(huddle.agent_keys || []);
  const [ending, setEnding] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const recorder = useHuddleRecorder({
    huddleId: huddle.id,
    includeMicrophone: true,
  });

  const ws = useHuddleWebSocket({ huddleId: huddle.id });

  // One-shot initial fetch — WS delivers everything new after.
  useEffect(() => {
    huddleApi.getTranscript(huddle.id).then((t) => setInitialChunks(t.chunks)).catch(() => {});
  }, [huddle.id]);

  // Stitch initial chunks + WS chunks together, dedupe by id.
  const chunks = useMemo<HuddleTranscriptChunk[]>(() => {
    const map = new Map<string, HuddleTranscriptChunk>();
    for (const c of initialChunks) map.set(c.id, c as HuddleTranscriptChunk);
    for (const c of ws.chunks) {
      // Cast: WS chunk shape lacks agent_responses (added when persisted) — fine for display.
      map.set(c.id, c as unknown as HuddleTranscriptChunk);
    }
    return Array.from(map.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  }, [initialChunks, ws.chunks]);

  // Auto-scroll transcript to bottom on update
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chunks.length, liveTranscript]);

  // Sync attached agents when huddle prop changes
  useEffect(() => { setAgentsAttached(huddle.agent_keys || []); }, [huddle.agent_keys]);

  const toggleAgent = async (key: string) => {
    try {
      if (agentsAttached.includes(key)) {
        const updated = await huddleApi.detachAgent(huddle.id, key, false);
        setAgentsAttached(updated.agent_keys || []);
      } else {
        const updated = await huddleApi.attachAgent(huddle.id, key);
        setAgentsAttached(updated.agent_keys || []);
      }
    } catch (e: any) {
      // surface error
      console.error(e);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      if (recorder.state === "recording") {
        await recorder.stop();
      }
      await huddleApi.end(huddle.id);
      onEnded();
    } catch (e: any) {
      setEnding(false);
    }
  };

  // Participants come from WS push (joined/left events). Fall back to
  // the initial roster baked into the huddle prop's host etc. is fine —
  // the WS will catch us up to current.
  const participants: HuddleParticipant[] = ws.participants as HuddleParticipant[];

  const tabs: Array<{ id: TabKey; label: string; icon: React.ElementType }> = [
    { id: "live", label: "AI", icon: Sparkles },
    { id: "transcript", label: "Transcript", icon: MessageSquare },
    { id: "agents", label: "Add", icon: Bot },
    { id: "participants", label: "People", icon: Users },
    { id: "invite", label: "Invite", icon: Share2 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-gray-800 truncate flex-1">{huddle.title}</h2>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
          {huddle.status === "live" ? "Live" : huddle.status} · {huddle.participant_count_peak} peak
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition ${
              tab === t.id ? "text-purple-700 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "live" && (
          <AgentLivePanel
            agentsAttached={agentsAttached}
            agentResponses={ws.agentResponses}
            connected={ws.connected}
          />
        )}

        {tab === "transcript" && (
          <div className="flex flex-col gap-2">
            {chunks.length === 0 && !liveTranscript ? (
              <p className="text-xs text-gray-400 text-center py-8">No transcript yet — start speaking and chunks will appear here.</p>
            ) : (
              <>
                {chunks.map((c) => (
                  <div key={c.id} className="text-xs">
                    <span className="font-semibold text-gray-700">{c.speaker_name}: </span>
                    <span className="text-gray-600">{c.text}</span>
                  </div>
                ))}
                {liveTranscript && (
                  <div className="text-xs italic text-gray-400">{liveTranscript}…</div>
                )}
              </>
            )}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {tab === "agents" && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">In this call</p>
            {AGENT_CATALOG.map((a) => {
              const on = agentsAttached.includes(a.key);
              return (
                <button
                  key={a.key}
                  onClick={() => void toggleAgent(a.key)}
                  className={`text-left p-2.5 rounded-lg border transition ${on ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <Bot size={12} className={on ? "text-purple-600" : "text-gray-400"} />
                    <span className="text-xs font-semibold text-gray-800">{a.label}</span>
                    {on && <Badge variant="outline" className="ml-auto text-[10px] border-purple-300 text-purple-700">Active</Badge>}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{a.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {tab === "participants" && (
          <div className="flex flex-col gap-2">
            {participants.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Waiting for others to join…</p>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 text-white flex items-center justify-center text-[10px] font-bold">
                    {(p.guest_name || p.user_id || p.agent_key || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.guest_name || p.user_id || p.agent_key || "Participant"}</p>
                    <p className="text-[10px] text-gray-400">{p.role}{p.left_at ? " · left" : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "invite" && (
          <InvitePanel huddleId={huddle.id} shareToken={huddle.share_token} />
        )}

        {tab === "settings" && (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-gray-500">Room ID: <span className="text-gray-700 font-mono">{huddle.room_name}</span></p>
            <p className="text-gray-500">Recording: <span className="text-gray-700">{recorder.state === "recording" ? "On" : "Off"}</span></p>
            <p className="text-gray-500">E2EE: <span className="text-gray-700">{huddle.e2ee_enabled ? "Enabled" : "Disabled"}</span></p>
            <p className="text-gray-500">Region: <span className="text-gray-700">{huddle.data_residency.toUpperCase()}</span></p>
            <p className="text-gray-500">Retention: <span className="text-gray-700">{huddle.recording_retention_days} days</span></p>
          </div>
        )}
      </div>

      {/* Footer controls */}
      {isHost && (
        <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
          {recorder.state !== "recording" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void recorder.start()}
              disabled={recorder.state === "requesting" || recorder.state === "stopping"}
              className="flex-1 text-xs h-9 border-red-200 text-red-600 hover:bg-red-50"
            >
              {recorder.state === "requesting" ? <Loader2 size={12} className="animate-spin mr-1" /> : <Circle size={10} className="fill-current mr-1.5" />}
              Record
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void recorder.stop()}
              className="flex-1 text-xs h-9 border-red-300 text-red-700 bg-red-50"
            >
              <StopCircle size={12} className="mr-1.5" /> Stop ({recorder.chunkCount})
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => void handleEnd()}
            disabled={ending}
            className="flex-1 text-xs h-9 bg-red-600 hover:bg-red-700 text-white"
          >
            <PhoneOff size={12} className="mr-1.5" />
            {ending ? "Ending…" : "End"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HuddleSidebar;
