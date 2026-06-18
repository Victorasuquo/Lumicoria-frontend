/**
 * MeetingRoom — the Lumicoria Huddle live meeting page.
 *
 * Layout: full-viewport. Jitsi iframe on the left (75% w), sidebar on the
 * right (25% w). Mobile collapses to stacked layout (Jitsi on top, sidebar
 * scrolls below).
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, Captions, CaptionsOff } from "lucide-react";
import JitsiEmbed from "@/components/huddle/JitsiEmbed";
import HuddleSidebar from "@/components/huddle/HuddleSidebar";
import LiveCaptionsOverlay from "@/components/huddle/LiveCaptionsOverlay";
import { Button } from "@/components/ui/button";
import { huddleApi, type Huddle } from "@/services/huddleApi";
import { useAuth } from "@/contexts/AuthContext";
import { useTranscription } from "@/hooks/useTranscription";
import { useHuddleWebSocket } from "@/hooks/useHuddleWebSocket";
import { useVirtualAgentSpeaker } from "@/hooks/useVirtualAgentSpeaker";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { toast } from "sonner";

const DEFAULT_JITSI_DOMAIN = (import.meta as any).env?.VITE_JITSI_DOMAIN || "meet.jit.si";

const MeetingRoom: React.FC = () => {
  const { huddleId } = useParams<{ huddleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [huddle, setHuddle] = useState<Huddle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [jitsiApi, setJitsiApi] = useState<any | null>(null);
  const [captionsOn, setCaptionsOn] = useState(true);
  const jitsiApiRef = useRef<any | null>(null);

  // WS is also used by the sidebar — sharing one connection keeps the
  // backend's room subscription count down.
  const ws = useHuddleWebSocket({ huddleId: huddleId || "" });
  const speaker = useVirtualAgentSpeaker({ huddleId: huddleId || "", jitsiApi });

  // When an agent response arrives and that agent has voice enabled,
  // speak it. Tracks last-seen agent_response id to avoid replaying.
  const lastSpokenIndexRef = useRef(0);
  useEffect(() => {
    if (!speaker.enabled || speaker.speakingAgents.size === 0) return;
    for (let i = lastSpokenIndexRef.current; i < ws.agentResponses.length; i++) {
      const r = ws.agentResponses[i];
      if (!r.ok) continue;
      if (!speaker.speakingAgents.has(r.agent_key)) continue;
      const text = typeof r.response === "string" ? r.response : "";
      if (text) void speaker.speak(text);
    }
    lastSpokenIndexRef.current = ws.agentResponses.length;
  }, [ws.agentResponses, speaker]);

  // In-browser transcription — chunks into backend on stop.
  const transcription = useTranscription({
    userId: user?.id ? String(user.id) : undefined,
    mode: "mic",
    onChunk: (text) => {
      setLiveTranscript(text);
      if (huddleId && text.trim()) {
        void huddleApi
          .appendTranscript(huddleId, text, (user as any)?.full_name || (user as any)?.email || "Speaker")
          .catch(() => { /* */ });
      }
    },
  });

  useEffect(() => {
    if (!huddleId) return;
    setLoading(true);
    huddleApi
      .get(huddleId)
      .then((h) => {
        setHuddle(h);
        setError(null);
      })
      .catch((e) => {
        setError(e?.response?.data?.detail || "Couldn't load the meeting.");
      })
      .finally(() => setLoading(false));
  }, [huddleId]);

  // Register join + auto-start STT.
  useEffect(() => {
    if (!huddle || hasJoined) return;
    void huddleApi
      .join(huddle.id, { role: user ? "participant" : "guest" })
      .then(() => setHasJoined(true))
      .catch(() => setHasJoined(true));
  }, [huddle, hasJoined, user]);

  useEffect(() => () => {
    if (huddle && hasJoined) {
      void huddleApi.leave(huddle.id).catch(() => { /* */ });
    }
    try { void transcription.stopRecording(); } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHost = !!user && !!huddle && String((user as any).id) === huddle.host_user_id;

  const handleEnded = () => {
    toast.success("Meeting ended. Generating summary…");
    navigate("/agents/meeting");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading meeting…
      </div>
    );
  }

  if (error || !huddle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-8 text-center">
        <p className="text-base mb-4">{error || "Meeting not found"}</p>
        <Button onClick={() => navigate("/agents/meeting")} variant="outline" className="bg-transparent text-white border-white/40">
          <ArrowLeft size={14} className="mr-1.5" /> Back to meetings
        </Button>
      </div>
    );
  }

  const layout = isMobile
    ? { wrap: "flex flex-col h-screen", main: "h-[60vh]", side: "flex-1 min-h-0" }
    : { wrap: "flex h-screen", main: "flex-1", side: "w-[380px] shrink-0" };

  return (
    <div className={`bg-black text-white ${layout.wrap}`}>
      <div className={`relative ${layout.main}`}>
        <JitsiEmbed
          roomName={huddle.room_name}
          domain={huddle.jitsi_domain || DEFAULT_JITSI_DOMAIN}
          jwt={huddle.jitsi_jwt || undefined}
          subject={huddle.title}
          user={{
            displayName: (user as any)?.full_name || (user as any)?.email || "Guest",
            email: (user as any)?.email,
          }}
          e2ee={huddle.e2ee_enabled}
          startWithAudioMuted={false}
          startWithVideoMuted={false}
          onApiReady={(api) => { jitsiApiRef.current = api; setJitsiApi(api); }}
          onJoined={() => {
            try { void transcription.startRecording(); } catch { /* */ }
          }}
          onReadyToClose={() => {
            try { void transcription.stopRecording(); } catch { /* */ }
            handleEnded();
          }}
          onVideoConferenceLeft={() => {
            try { void transcription.stopRecording(); } catch { /* */ }
          }}
        />
        {captionsOn && (
          <LiveCaptionsOverlay
            chunks={ws.chunks}
            agentResponses={ws.agentResponses}
            translationAttached={(huddle.agent_keys || []).includes("translation")}
          />
        )}
        {/* Captions toggle */}
        <button
          onClick={() => setCaptionsOn((v) => !v)}
          title={captionsOn ? "Hide captions" : "Show captions"}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/55 backdrop-blur hover:bg-black/75 text-white flex items-center justify-center"
        >
          {captionsOn ? <Captions size={14} /> : <CaptionsOff size={14} />}
        </button>
      </div>
      <div className={layout.side}>
        <HuddleSidebar
          huddle={huddle}
          isHost={isHost}
          onEnded={handleEnded}
          liveTranscript={liveTranscript}
          jitsiApi={jitsiApi}
        />
      </div>
    </div>
  );
};

export default MeetingRoom;
