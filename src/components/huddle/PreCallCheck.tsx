/**
 * PreCallCheck — mic + camera preview before joining a Huddle.
 *
 * Shows live video, lets the user select devices, and reports whether
 * permissions were granted. Calls onReady when the user clicks "Join".
 */

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreCallCheckProps {
  defaultName?: string;
  onReady: (input: { displayName: string; audioMuted: boolean; videoMuted: boolean }) => void;
  joinLabel?: string;
}

export const PreCallCheck: React.FC<PreCallCheckProps> = ({
  defaultName = "",
  onReady,
  joinLabel = "Join meeting",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState(defaultName);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRequesting(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          void videoRef.current.play().catch(() => {});
        }
        setRequesting(false);
      })
      .catch((e) => {
        setPermissionError(e?.message || "Allow camera + microphone access to join.");
        setRequesting(false);
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleAudio = () => {
    setAudioMuted((m) => {
      const next = !m;
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  };
  const toggleVideo = () => {
    setVideoMuted((m) => {
      const next = !m;
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-lg">
        {videoMuted ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Camera off</div>
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        )}
        {requesting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <Loader2 size={20} className="animate-spin mr-2" /> Checking your devices…
          </div>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={toggleAudio}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${audioMuted ? "bg-red-500 text-white" : "bg-white/95 text-gray-800"}`}
          >
            {audioMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${videoMuted ? "bg-red-500 text-white" : "bg-white/95 text-gray-800"}`}
          >
            {videoMuted ? <VideoOff size={16} /> : <VideoIcon size={16} />}
          </button>
        </div>
      </div>

      {permissionError && (
        <p className="text-xs text-red-500 mt-3">{permissionError}</p>
      )}

      <div className="mt-5">
        <label className="text-[10px] uppercase tracking-wide text-gray-400">Your name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <Button
        onClick={() => onReady({ displayName: displayName.trim() || "Guest", audioMuted, videoMuted })}
        disabled={!!permissionError || requesting}
        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white h-10"
      >
        {joinLabel}
      </Button>
    </div>
  );
};

export default PreCallCheck;
