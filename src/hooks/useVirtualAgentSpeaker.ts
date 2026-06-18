/**
 * useVirtualAgentSpeaker — turns AI agent text into voice that everyone
 * else in the Jitsi call hears.
 *
 * Strategy (no server-side audio mixer required):
 *   1. Capture the host's microphone via getUserMedia.
 *   2. Create a Web Audio context with two sources:
 *        - mic input
 *        - TTS playback (HTMLAudioElement → MediaElementSource)
 *      Mix them into a single MediaStreamDestination.
 *   3. Replace the Jitsi local audio track with the mixed stream so
 *      remote participants hear BOTH the host's voice AND the TTS audio.
 *   4. When an enabled agent emits a response on the WS, fetch TTS
 *      from /huddles/{id}/tts and play it.
 *
 * The user can toggle which agents have voice. Local speaker also
 * plays the TTS (via the standard <audio> path) so the host hears it
 * — that's intentional, otherwise you'd be talking over a silent AI.
 *
 * Failure modes are silent — when TTS isn't configured server-side,
 * the call just continues without voice and the sidebar still shows
 * the text response.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { huddleApi } from "@/services/huddleApi";

type Cmd = "enable" | "disable";

interface UseVirtualAgentSpeakerOptions {
  huddleId: string;
  /** Jitsi External API instance. Required to replace the mic track. */
  jitsiApi: any | null;
  /** Voice id (see huddleApi.ttsVoices). */
  voice?: string;
}

export interface UseVirtualAgentSpeaker {
  enabled: boolean;
  start: () => Promise<void>;
  stop: () => void;
  speak: (text: string) => Promise<void>;
  voice: string;
  setVoice: (v: string) => void;
  /** Agent keys that should auto-speak when a response arrives. */
  speakingAgents: Set<string>;
  toggleAgentVoice: (agentKey: string, cmd?: Cmd) => void;
  /** True while a TTS audio chunk is currently being played. */
  speaking: boolean;
}

export function useVirtualAgentSpeaker(opts: UseVirtualAgentSpeakerOptions): UseVirtualAgentSpeaker {
  const [enabled, setEnabled] = useState(false);
  const [voice, setVoice] = useState(opts.voice || "warm");
  const [speakingAgents, setSpeakingAgents] = useState<Set<string>>(new Set());
  const [speaking, setSpeaking] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const ttsBufferUrlRef = useRef<string | null>(null);
  const speakingQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const teardown = useCallback(() => {
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* */ }
    micStreamRef.current = null;
    try { audioCtxRef.current?.close(); } catch { /* */ }
    audioCtxRef.current = null;
    destinationRef.current = null;
    if (ttsBufferUrlRef.current) {
      try { URL.revokeObjectURL(ttsBufferUrlRef.current); } catch { /* */ }
      ttsBufferUrlRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (enabled) return;
    if (!opts.jitsiApi) return;
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = mic;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const dest = ctx.createMediaStreamDestination();
      destinationRef.current = dest;

      // Wire mic → destination
      const micSrc = ctx.createMediaStreamSource(mic);
      micSrc.connect(dest);

      // Replace Jitsi's mic with the mixed stream
      try {
        const mixedTrack = dest.stream.getAudioTracks()[0];
        if (mixedTrack && opts.jitsiApi?.replaceTrack) {
          await opts.jitsiApi.replaceTrack({ newTrack: mixedTrack, oldTrack: null });
        }
      } catch { /* */ }

      setEnabled(true);
    } catch (e) {
      console.warn("useVirtualAgentSpeaker.start failed", e);
      teardown();
    }
  }, [enabled, opts.jitsiApi, teardown]);

  const stop = useCallback(() => {
    teardown();
    setEnabled(false);
    setSpeakingAgents(new Set());
  }, [teardown]);

  const playBlob = useCallback(async (blob: Blob) => {
    if (!audioCtxRef.current || !destinationRef.current) return;
    const url = URL.createObjectURL(blob);
    if (ttsBufferUrlRef.current) {
      try { URL.revokeObjectURL(ttsBufferUrlRef.current); } catch { /* */ }
    }
    ttsBufferUrlRef.current = url;
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    try {
      const elSrc = audioCtxRef.current.createMediaElementSource(audio);
      // Connect to BOTH:
      //  - the mixed destination (so remote participants hear it via Jitsi)
      //  - the AudioContext's default output (so the host hears it too)
      elSrc.connect(destinationRef.current);
      elSrc.connect(audioCtxRef.current.destination);
    } catch { /* */ }
    setSpeaking(true);
    await new Promise<void>((resolve) => {
      audio.onended = () => { resolve(); };
      audio.onerror = () => { resolve(); };
      void audio.play().catch(() => resolve());
    });
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!enabled || !text || !text.trim()) return;
    // Serialize TTS playback — never overlap two clips.
    speakingQueueRef.current = speakingQueueRef.current.then(async () => {
      try {
        const blob = await huddleApi.tts(opts.huddleId, text.trim().slice(0, 1500), voice, "standard");
        await playBlob(blob);
      } catch (e) {
        console.warn("TTS playback failed", e);
      }
    });
    return speakingQueueRef.current as unknown as Promise<void>;
  }, [enabled, voice, opts.huddleId, playBlob]);

  const toggleAgentVoice = useCallback((agentKey: string, cmd?: Cmd) => {
    setSpeakingAgents((prev) => {
      const next = new Set(prev);
      const has = next.has(agentKey);
      if (cmd === "enable") { next.add(agentKey); return next; }
      if (cmd === "disable") { next.delete(agentKey); return next; }
      if (has) next.delete(agentKey); else next.add(agentKey);
      return next;
    });
  }, []);

  useEffect(() => () => { teardown(); }, [teardown]);

  return useMemo<UseVirtualAgentSpeaker>(() => ({
    enabled,
    start,
    stop,
    speak,
    voice,
    setVoice,
    speakingAgents,
    toggleAgentVoice,
    speaking,
  }), [enabled, start, stop, speak, voice, speakingAgents, toggleAgentVoice, speaking]);
}
