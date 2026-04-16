import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Real-time speech-to-text hook using MediaRecorder + WebSocket.
 *
 * Audio is captured from the microphone as WebM/Opus (1-second chunks),
 * sent as binary frames over a WebSocket to the backend STT service,
 * and partial transcripts are returned in real-time.
 */

interface UseTranscriptionOptions {
  /** User ID for the WebSocket path */
  userId?: string;
  /** Language code (ISO 639-1), default "en" */
  language?: string;
  /**
   * "mic" = microphone only (default, good for solo dictation).
   * "meeting" = mic + tab audio mixed (captures remote speakers on
   *             Google Meet / Zoom / Teams — user picks the tab to share).
   */
  mode?: "mic" | "meeting";
  /** Called on each new transcript chunk */
  onChunk?: (text: string, chunkIndex: number) => void;
  /** Called when transcription stops with the full transcript */
  onComplete?: (fullTranscript: string) => void;
  /** Called on errors */
  onError?: (error: string) => void;
}

interface UseTranscriptionReturn {
  isRecording: boolean;
  isConnected: boolean;
  liveText: string;
  fullTranscript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
}

function getWsUrl(userId: string, token: string): string {
  const apiUrl =
    (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000/api/v1";

  if (apiUrl.startsWith("http")) {
    const wsScheme = apiUrl.startsWith("https") ? "wss" : "ws";
    return (
      apiUrl.replace(/^http(s)?/, wsScheme) +
      `/ws/transcribe/${userId}?token=${token}`
    );
  }
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${window.location.host}${apiUrl}/ws/transcribe/${userId}?token=${token}`;
}

function pickMimeType(): string {
  // Prefer WebM/Opus (Chrome, Firefox, Edge) — fall back to mp4 (Safari)
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

export function useTranscription(
  options: UseTranscriptionOptions = {}
): UseTranscriptionReturn {
  const { language = "en", mode = "mic", onChunk, onComplete, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Extra refs for meeting mode (tab audio + audio mixing)
  const tabStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Stable refs for callbacks so we don't re-render on option changes
  const onChunkRef = useRef(onChunk);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onChunkRef.current = onChunk;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onChunk, onComplete, onError]);

  const cleanup = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Clean up tab audio stream (meeting mode)
    if (tabStreamRef.current) {
      tabStreamRef.current.getTracks().forEach((t) => t.stop());
      tabStreamRef.current = null;
    }

    // Close AudioContext used for mixing
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setIsRecording(false);
    setIsConnected(false);
    setLiveText("");
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const startRecording = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const userId = options.userId;

    if (!userId || !token) {
      const msg = "Authentication required for transcription";
      onErrorRef.current?.(msg);
      return;
    }

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Microphone access not supported in this browser";
      onErrorRef.current?.(msg);
      return;
    }

    const mimeType = pickMimeType();
    if (!mimeType) {
      const msg = "No supported audio recording format found";
      onErrorRef.current?.(msg);
      return;
    }

    try {
      // ── Acquire audio stream(s) ────────────────────────────────
      let recordingStream: MediaStream;

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = micStream;

      if (mode === "meeting") {
        // Ask user to share the meeting tab — this captures remote speakers
        try {
          const tabStream = await navigator.mediaDevices.getDisplayMedia({
            video: false,  // we only need audio
            audio: true,
          } as any);

          // If the browser gave us video tracks (some do), stop them
          tabStream.getVideoTracks().forEach((t) => t.stop());

          const tabAudioTracks = tabStream.getAudioTracks();
          if (tabAudioTracks.length === 0) {
            // User shared screen but didn't check "Share tab audio"
            onErrorRef.current?.(
              "No tab audio detected — make sure you select a browser tab and check \"Share tab audio\"."
            );
            tabStream.getTracks().forEach((t) => t.stop());
            cleanup();
            return;
          }

          tabStreamRef.current = tabStream;

          // Mix mic + tab audio into a single stream via AudioContext
          const ctx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = ctx;

          const micSource = ctx.createMediaStreamSource(micStream);
          const tabSource = ctx.createMediaStreamSource(tabStream);
          const dest = ctx.createMediaStreamDestination();

          micSource.connect(dest);
          tabSource.connect(dest);

          recordingStream = dest.stream;

          // If user stops sharing the tab, auto-stop recording
          tabAudioTracks[0].addEventListener("ended", () => {
            cleanup();
          });
        } catch (err: any) {
          // User cancelled the tab picker — fall back to mic-only
          if (err.name === "NotAllowedError") {
            onErrorRef.current?.(
              "Tab sharing cancelled. Recording with microphone only."
            );
          }
          recordingStream = micStream;
        }
      } else {
        recordingStream = micStream;
      }

      // Open WebSocket
      const wsUrl = getWsUrl(userId, token);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ type: "start_transcription", language }));

        // Start MediaRecorder with the (possibly mixed) stream
        const recorder = new MediaRecorder(recordingStream, {
          mimeType,
          audioBitsPerSecond: 32000,
        });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };

        recorder.start(1000); // 1-second timeslice
        setIsRecording(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "final_transcript":
              setLiveText("");
              setFullTranscript((prev) => {
                const updated = prev
                  ? prev + " " + data.text
                  : data.text;
                return updated;
              });
              onChunkRef.current?.(data.text, data.chunk_index);
              break;

            case "transcription_stopped":
              if (data.full_transcript) {
                setFullTranscript(data.full_transcript);
                onCompleteRef.current?.(data.full_transcript);
              }
              break;

            case "transcription_started":
              // Ack from server
              break;

            case "error":
              onErrorRef.current?.(data.message || "Transcription error");
              break;

            case "ping":
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "pong" }));
              }
              break;
          }
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        onErrorRef.current?.("WebSocket connection error");
        cleanup();
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        if (event.code === 4001) {
          onErrorRef.current?.("Unauthorized — please log in again");
        }
        // Stop recorder if still active
        if (recorderRef.current?.state !== "inactive") {
          recorderRef.current?.stop();
        }
        setIsRecording(false);
      };
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        onErrorRef.current?.(
          "Microphone access denied. Please allow microphone in browser settings."
        );
      } else {
        onErrorRef.current?.(err.message || "Failed to start recording");
      }
      cleanup();
    }
  }, [options.userId, language, cleanup]);

  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Stop tab audio stream (meeting mode)
    if (tabStreamRef.current) {
      tabStreamRef.current.getTracks().forEach((t) => t.stop());
      tabStreamRef.current = null;
    }

    // Close audio mixer
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    // Tell server to stop transcription
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "stop_transcription" })
      );
      // Close WS after a short delay to receive the final response
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
        setIsConnected(false);
      }, 3000);
    }

    setIsRecording(false);
    setLiveText("");
  }, []);

  const resetTranscript = useCallback(() => {
    setFullTranscript("");
    setLiveText("");
  }, []);

  return {
    isRecording,
    isConnected,
    liveText,
    fullTranscript,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}
