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

// Backend is the single source of truth for the Jitsi domain via
// huddle.jitsi_domain. The env var is a last-resort dev fallback only —
// it should never be hit in production.
const DEV_FALLBACK_JITSI_DOMAIN = (import.meta as any).env?.VITE_JITSI_DOMAIN || "meet.lumicoria.ai";

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
  // Refs mirror state for the unmount cleanup — an empty-deps effect
  // closes over the INITIAL values (huddle=null, hasJoined=false), so
  // reading state directly there means `leave` never fires and
  // participants stay "open" in the DB forever.
  const huddleRef = useRef<Huddle | null>(null);
  const hasJoinedRef = useRef(false);
  useEffect(() => { huddleRef.current = huddle; }, [huddle]);
  useEffect(() => { hasJoinedRef.current = hasJoined; }, [hasJoined]);

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
    // Read via refs — see comment on huddleRef above.
    const h = huddleRef.current;
    if (h && hasJoinedRef.current) {
      void huddleApi.leave(h.id).catch(() => { /* */ });
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

  // Layout: outer wrap is a Lumicoria-branded gradient page (purple →
  // fuchsia → indigo). The Jitsi iframe sits INSIDE a rounded card with
  // some breathing room so it doesn't overflow the viewport, and the
  // sidebar sits alongside on desktop / below on mobile.
  const layout = isMobile
    ? {
        wrap: "flex flex-col min-h-screen",
        main: "h-[58vh] p-3",
        side: "flex-1 min-h-0 px-3 pb-3",
      }
    : {
        wrap: "flex h-screen",
        main: "flex-1 p-4",
        side: "w-[380px] shrink-0 py-4 pr-4",
      };

  return (
    <div
      className={`text-white ${layout.wrap}`}
      style={{
        // Lumicoria signature — purple → fuchsia → indigo diagonal.
        background:
          "radial-gradient(1200px 800px at 15% 5%, rgba(147, 51, 234, 0.55), transparent 60%)," +
          "radial-gradient(1000px 700px at 90% 100%, rgba(236, 72, 153, 0.45), transparent 60%)," +
          "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 45%, #831843 100%)",
      }}
    >
      <div className={`relative ${layout.main}`}>
        {/* Framed iframe card */}
        <div
          className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10"
          style={{
            background: "#0F172A",
            boxShadow:
              "0 40px 90px -30px rgba(76, 29, 149, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.06)",
          }}
        >
          <JitsiEmbed
            roomName={huddle.room_name}
            domain={huddle.jitsi_domain || DEV_FALLBACK_JITSI_DOMAIN}
            jwt={huddle.jitsi_jwt || undefined}
            branding={huddle.jitsi_branding ?? undefined}
            isHost={huddle.jitsi_is_host ?? isHost}
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
          {/* Captions toggle — floats over the frame */}
          <button
            onClick={() => setCaptionsOn((v) => !v)}
            title={captionsOn ? "Hide captions" : "Show captions"}
            className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-black/50 backdrop-blur hover:bg-black/75 text-white flex items-center justify-center transition-colors"
          >
            {captionsOn ? <Captions size={16} /> : <CaptionsOff size={16} />}
          </button>
        </div>
      </div>
      <div className={layout.side}>
        {/* Sidebar sits in its own frosted card so it visually matches */}
        <div
          className="h-full rounded-3xl overflow-hidden ring-1 ring-white/10 backdrop-blur-xl"
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            boxShadow: "0 25px 60px -25px rgba(0, 0, 0, 0.45)",
          }}
        >
          <HuddleSidebar
            huddle={huddle}
            isHost={isHost}
            onEnded={handleEnded}
            liveTranscript={liveTranscript}
            jitsiApi={jitsiApi}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
