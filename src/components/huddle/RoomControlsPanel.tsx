/**
 * RoomControlsPanel — power-user controls that fire Jitsi External API
 * executeCommand under the hood.
 *
 * Surfaces:
 *   - Raise hand (toggle)
 *   - Reactions (👍 ❤️ 👏 🎉 🤔 😂)
 *   - Toggle tile view
 *   - Toggle chat
 *   - Start screen share / stop
 *   - Start poll
 *   - Breakout rooms create/join (Jitsi-side)
 *
 * The Jitsi External API instance is held by JitsiEmbed and passed
 * back via onApiReady. We accept it as a ref-style prop.
 */

import React, { useEffect, useState } from "react";
import {
  Hand, ThumbsUp, Heart, Sparkles, PartyPopper, Brain, Laugh,
  LayoutGrid, MessageCircle, ScreenShare, BarChart3, Users2, Mic, MicOff,
  Video, VideoOff, MicVocal, VideoOff as VideoOffIcon, Lock, Circle, Square,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Cmd = (name: string, ...args: any[]) => void;

interface RoomControlsPanelProps {
  /** The Jitsi External API instance. */
  api: any | null;
  isHost?: boolean;
}

const REACTIONS: Array<{ icon: React.ElementType; label: string; reaction: string }> = [
  { icon: ThumbsUp,     label: "Like",   reaction: "thumbs-up" },
  { icon: Heart,        label: "Love",   reaction: "heart"     },
  { icon: Sparkles,     label: "Wow",    reaction: "clap"      },
  { icon: PartyPopper,  label: "Party",  reaction: "party"     },
  { icon: Brain,        label: "Think",  reaction: "thinking"  },
  { icon: Laugh,        label: "Laugh",  reaction: "laughing"  },
];

export const RoomControlsPanel: React.FC<RoomControlsPanelProps> = ({ api, isHost = false }) => {
  const [handRaised, setHandRaised] = useState(false);
  const [tileView, setTileView] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const exec: Cmd = (name, ...args) => {
    try { api?.executeCommand(name, ...args); } catch { /* */ }
  };

  const toggleHand = () => {
    setHandRaised((v) => !v);
    exec("toggleRaiseHand");
  };

  const sendReaction = (r: string) => {
    // Jitsi reactions API
    exec("sendReaction", r);
  };

  const toggleTile = () => {
    setTileView((v) => !v);
    exec("toggleTileView");
  };

  const toggleChat = () => {
    setChatOpen((v) => !v);
    exec("toggleChat");
  };

  const toggleShare = () => {
    exec("toggleShareScreen");
  };

  const toggleAudio = () => {
    setMuted((v) => !v);
    exec("toggleAudio");
  };

  const toggleVideo = () => {
    setVideoOff((v) => !v);
    exec("toggleVideo");
  };

  const startPoll = () => {
    // Jitsi has built-in polls — opening the panel works on web client.
    exec("toggleParticipantsPane");
  };

  const breakoutRoom = () => {
    // Opens the breakout-rooms moderator UI overlay.
    exec("toggleParticipantsPane");
  };

  if (!api) {
    return (
      <div className="text-xs text-gray-400 italic text-center py-6">
        Connect to the meeting first to access room controls.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quick toggles */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">My state</p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={toggleAudio} variant={muted ? "default" : "outline"} size="sm" className={`text-xs h-9 ${muted ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}>
            {muted ? <MicOff size={12} className="mr-1.5" /> : <Mic size={12} className="mr-1.5" />}
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button onClick={toggleVideo} variant={videoOff ? "default" : "outline"} size="sm" className={`text-xs h-9 ${videoOff ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}>
            {videoOff ? <VideoOff size={12} className="mr-1.5" /> : <Video size={12} className="mr-1.5" />}
            {videoOff ? "Start cam" : "Stop cam"}
          </Button>
        </div>
      </div>

      {/* Raise hand + reactions */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Engage</p>
        <Button
          onClick={toggleHand}
          className={`w-full h-10 text-sm ${handRaised ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
        >
          <Hand size={14} className="mr-2" />
          {handRaised ? "Hand raised" : "Raise hand"}
        </Button>

        <div className="grid grid-cols-6 gap-1.5 mt-2">
          {REACTIONS.map((r) => (
            <button
              key={r.reaction}
              onClick={() => sendReaction(r.reaction)}
              title={r.label}
              className="aspect-square flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-purple-50 transition"
            >
              <r.icon size={14} className="text-gray-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Room layout */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">View</p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={toggleTile} variant="outline" size="sm" className="text-xs h-9">
            <LayoutGrid size={12} className="mr-1.5" /> Tile view
          </Button>
          <Button onClick={toggleChat} variant="outline" size="sm" className="text-xs h-9">
            <MessageCircle size={12} className="mr-1.5" /> Chat
          </Button>
          <Button onClick={toggleShare} variant="outline" size="sm" className="text-xs h-9">
            <ScreenShare size={12} className="mr-1.5" /> Share screen
          </Button>
          <Button onClick={startPoll} variant="outline" size="sm" className="text-xs h-9">
            <BarChart3 size={12} className="mr-1.5" /> Poll
          </Button>
        </div>
      </div>

      {/* Moderator-only */}
      {isHost && <HostControls api={api} />}
    </div>
  );
};


// ── Moderator panel ───────────────────────────────────────────────────


interface HostControlsProps {
  api: any;
}

const HostControls: React.FC<HostControlsProps> = ({ api }) => {
  const [roomLocked, setRoomLocked] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onRec = (ev: { on: boolean; mode?: string }) => setRecording(!!ev.on);
    try { api.addEventListener("recordingStatusChanged", onRec); } catch { /* */ }
    return () => {
      try { api.removeEventListener("recordingStatusChanged", onRec); } catch { /* */ }
    };
  }, [api]);

  const exec = (name: string, ...args: any[]) => {
    try { api?.executeCommand(name, ...args); } catch { /* */ }
  };

  const muteEveryone = () => {
    if (!confirm("Mute every other participant's microphone?")) return;
    exec("muteEveryone", "audio");
  };
  const stopEveryoneVideo = () => {
    if (!confirm("Stop every other participant's camera?")) return;
    exec("muteEveryone", "video");
  };
  const toggleLock = () => {
    exec("toggleLobby", !roomLocked);
    setRoomLocked((v) => !v);
  };
  const toggleRecording = () => {
    if (recording) {
      if (!confirm("Stop the recording? The file will be processed and emailed when ready.")) return;
      exec("stopRecording", "file");
    } else {
      if (!confirm("Start recording? All participants will be notified.")) return;
      exec("startRecording", { mode: "file" });
    }
  };
  const showSecurityDialog = () => {
    // Opens Jitsi's built-in security panel (lobby, password).
    exec("toggleSecurityDialog");
  };

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-amber-600 font-semibold mb-2 flex items-center gap-1">
        <Shield size={10} /> Host controls
      </p>
      {/* Recording — most prominent */}
      <Button
        onClick={toggleRecording}
        className={`w-full h-10 text-sm mb-2 ${
          recording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
      >
        {recording ? <Square size={14} className="mr-2" /> : <Circle size={14} className="mr-2 fill-current" />}
        {recording ? "Stop recording" : "Record meeting"}
      </Button>
      {/* Mute everyone / stop video / lock */}
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={muteEveryone} variant="outline" size="sm" className="text-xs h-9 border-amber-300 text-amber-700 hover:bg-amber-50">
          <MicOff size={12} className="mr-1.5" /> Mute all
        </Button>
        <Button onClick={stopEveryoneVideo} variant="outline" size="sm" className="text-xs h-9 border-amber-300 text-amber-700 hover:bg-amber-50">
          <VideoOffIcon size={12} className="mr-1.5" /> Stop cams
        </Button>
        <Button
          onClick={toggleLock}
          variant="outline"
          size="sm"
          className={`text-xs h-9 ${roomLocked ? "bg-amber-50 border-amber-300 text-amber-700" : "border-gray-300"}`}
        >
          <Lock size={12} className="mr-1.5" /> {roomLocked ? "Unlock" : "Lock room"}
        </Button>
        <Button onClick={showSecurityDialog} variant="outline" size="sm" className="text-xs h-9 border-gray-300">
          <Shield size={12} className="mr-1.5" /> Security
        </Button>
      </div>
    </div>
  );
};


export default RoomControlsPanel;
