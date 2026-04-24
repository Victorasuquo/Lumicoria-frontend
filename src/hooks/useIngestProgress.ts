import { useEffect, useRef, useState } from "react";

export type IngestStage =
  | "downloading"
  | "fetching"
  | "parsing"
  | "chunking"
  | "embedding"
  | "storing"
  | "ready"
  | "error"
  | "cancelled"
  | "heartbeat";

export interface IngestProgressEvent {
  document_id: string;
  stage: IngestStage;
  total?: number;
  processed?: number;
  chunk_count?: number;
  message?: string;
  code?: string;
}

interface Options {
  /** Pause subscription without tearing the hook down. */
  enabled?: boolean;
  /** Called once for each non-heartbeat event. */
  onEvent?: (event: IngestProgressEvent) => void;
  /** Max reconnect attempts after a transport-level error.  Default 3. */
  maxRetries?: number;
}

/**
 * Subscribe to `GET /chat/documents/{id}/progress` as an SSE stream.
 *
 * Returns the latest event (convenient for a progress bar) plus the
 * connection state. Closes automatically once a terminal event
 * (`ready`, `error`, `cancelled`) is seen.  Heartbeat events are
 * consumed internally and never bubble up.
 */
export function useIngestProgress(
  documentId: string | null | undefined,
  opts: Options = {},
): {
  event: IngestProgressEvent | null;
  connected: boolean;
  error: string | null;
  done: boolean;
} {
  const { enabled = true, onEvent, maxRetries = 3 } = opts;

  const [event, setEvent] = useState<IngestProgressEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Stable ref to avoid re-subscribing every render when caller
  // inlines a new onEvent lambda.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!documentId || !enabled) return;

    // Reset state for a new subscription.
    setEvent(null);
    setConnected(false);
    setError(null);
    setDone(false);

    let retries = 0;
    let es: EventSource | null = null;
    let cancelled = false;

    const baseURL =
      (import.meta.env.VITE_API_URL as string) ||
      "http://localhost:8000/api/v1";
    const url = `${baseURL}/chat/documents/${documentId}/progress`;

    const connect = () => {
      if (cancelled) return;
      // `withCredentials` so the browser sends the auth cookie.
      es = new EventSource(url, { withCredentials: true });

      es.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        setError(null);
      };

      es.onmessage = (msg) => {
        if (cancelled) return;
        let data: IngestProgressEvent;
        try {
          data = JSON.parse(msg.data);
        } catch {
          return;
        }
        if (data.stage === "heartbeat") return;
        setEvent(data);
        onEventRef.current?.(data);
        if (
          data.stage === "ready" ||
          data.stage === "error" ||
          data.stage === "cancelled"
        ) {
          setDone(true);
          es?.close();
        }
      };

      es.onerror = () => {
        if (cancelled) return;
        setConnected(false);
        es?.close();
        if (retries < maxRetries) {
          retries += 1;
          // Exponential backoff: 1s, 2s, 4s.
          setTimeout(connect, 1000 * 2 ** (retries - 1));
        } else {
          setError("Progress stream disconnected");
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      es?.close();
      setConnected(false);
    };
  }, [documentId, enabled, maxRetries]);

  return { event, connected, error, done };
}
