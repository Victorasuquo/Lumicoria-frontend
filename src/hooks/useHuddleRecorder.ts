/**
 * useHuddleRecorder — captures meeting audio+video on the host's
 * machine and streams 1 MB chunks to the backend.
 *
 * Strategy (Phase 1):
 *   - Ask the user for screen + system audio via getDisplayMedia.
 *   - Optionally combine with their mic stream so the host's voice is
 *     captured too (the Jitsi tab audio handles all other speakers).
 *   - MediaRecorder emits Blob chunks every 10s; each chunk → backend.
 *   - On stop, `huddleApi.finishRecording(totalChunks)` finalises the
 *     manifest object and returns playback URLs.
 *
 * Browser support: Chrome/Edge/Brave (getDisplayMedia + audio).
 * Firefox supports screen capture but not audio yet — we degrade
 * to mic-only with a toast warning.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { huddleApi } from "@/services/huddleApi";
import { toast } from "sonner";

export type RecorderState = "idle" | "requesting" | "recording" | "paused" | "stopping" | "stopped" | "error";

export interface UseHuddleRecorderOptions {
  huddleId: string;
  /** Combine the user's microphone with the captured tab audio. Defaults true. */
  includeMicrophone?: boolean;
  /** Chunk duration in milliseconds. Defaults to 10s. */
  chunkDurationMs?: number;
  /** Called when each chunk finishes uploading. */
  onChunkUploaded?: (index: number) => void;
  /** Called when recording stops + manifest is finalised. */
  onFinished?: (result: { playback_url?: string | null; chunk_urls?: string[]; manifest_key?: string }) => void;
  onError?: (message: string) => void;
}

export interface UseHuddleRecorder {
  state: RecorderState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  chunkCount: number;
  errorMessage: string | null;
}

const CONTENT_TYPE = "video/webm;codecs=vp8,opus";

export function useHuddleRecorder(opts: UseHuddleRecorderOptions): UseHuddleRecorder {
  const [state, setState] = useState<RecorderState>("idle");
  const [chunkCount, setChunkCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const indexRef = useRef(0);
  const inflightRef = useRef<Promise<unknown>[]>([]);
  const chunkMsRef = useRef(opts.chunkDurationMs ?? 10_000);

  const teardownStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => {
      try { t.stop(); } catch { /* */ }
    });
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (state === "recording" || state === "requesting") return;
    setErrorMessage(null);
    setState("requesting");

    try {
      const supported = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(CONTENT_TYPE);
      if (!supported) {
        throw new Error("Your browser doesn't support recording (try Chrome / Edge / Brave).");
      }

      // Screen + system audio
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 24 } as any,
        audio: true,
      });

      let combined: MediaStream = display;

      if (opts.includeMicrophone !== false) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();
          const sources: MediaStreamAudioSourceNode[] = [];
          const tryAddTrack = (stream: MediaStream) => {
            if (!stream.getAudioTracks().length) return;
            try {
              const src = ctx.createMediaStreamSource(stream);
              src.connect(dest);
              sources.push(src);
            } catch { /* */ }
          };
          tryAddTrack(display);
          tryAddTrack(mic);
          combined = new MediaStream();
          display.getVideoTracks().forEach((t) => combined.addTrack(t));
          dest.stream.getAudioTracks().forEach((t) => combined.addTrack(t));
        } catch (micErr) {
          toast.warning("Couldn't access microphone — recording screen audio only.");
        }
      }

      streamRef.current = combined;

      // Tell backend
      const startResp = await huddleApi.startRecording(opts.huddleId).catch((e) => ({ ok: false, error: e?.message }));
      if (!startResp.ok) {
        throw new Error(startResp.error || "Backend rejected recording start.");
      }

      const recorder = new MediaRecorder(combined, { mimeType: CONTENT_TYPE, bitsPerSecond: 1_500_000 });
      recorderRef.current = recorder;
      indexRef.current = 0;
      setChunkCount(0);

      recorder.ondataavailable = (e: BlobEvent) => {
        if (!e.data || e.data.size === 0) return;
        const idx = indexRef.current++;
        const upload = huddleApi
          .uploadRecordingChunk(opts.huddleId, idx, e.data, "video/webm")
          .then(() => {
            setChunkCount((n) => n + 1);
            opts.onChunkUploaded?.(idx);
          })
          .catch((err) => {
            console.warn("Chunk upload failed", err);
          });
        inflightRef.current.push(upload);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error", e);
        setErrorMessage("Recording error — stopping.");
        setState("error");
        opts.onError?.("Recording error — stopping.");
        try { recorder.stop(); } catch { /* */ }
      };

      // Auto-stop if the user revokes screen sharing
      combined.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          void stop();
        }
      });

      recorder.start(chunkMsRef.current);
      setState("recording");
    } catch (e: any) {
      const msg = e?.message || "Couldn't start recording";
      setErrorMessage(msg);
      setState("error");
      teardownStream();
      opts.onError?.(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.huddleId, opts.includeMicrophone, state]);

  const stop = useCallback(async () => {
    if (!recorderRef.current) return;
    setState("stopping");
    return new Promise<void>((resolve) => {
      const rec = recorderRef.current!;
      rec.onstop = async () => {
        teardownStream();
        await Promise.allSettled(inflightRef.current);
        inflightRef.current = [];
        try {
          const result = await huddleApi.finishRecording(opts.huddleId, indexRef.current, "video/webm");
          opts.onFinished?.({
            playback_url: result?.playback_url ?? null,
            chunk_urls: result?.chunk_urls,
            manifest_key: result?.manifest_key,
          });
        } catch (e: any) {
          console.warn("finishRecording failed", e);
        }
        setState("stopped");
        resolve();
      };
      try { rec.stop(); } catch { resolve(); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.huddleId]);

  // Tear down on unmount
  useEffect(() => () => {
    try { recorderRef.current?.stop(); } catch { /* */ }
    teardownStream();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, start, stop, chunkCount, errorMessage };
}
