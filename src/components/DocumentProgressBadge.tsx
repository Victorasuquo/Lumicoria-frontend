import React from "react";
import { Loader2 } from "lucide-react";
import { useIngestProgress, type IngestStage } from "@/hooks/useIngestProgress";

interface Props {
  documentId: string;
  /** Fired exactly once when the stream terminates (ready / error / cancelled). */
  onTerminal?: (stage: IngestStage) => void;
}

const STAGE_LABEL: Partial<Record<IngestStage, string>> = {
  downloading: "Downloading",
  fetching: "Fetching",
  parsing: "Parsing",
  chunking: "Chunking",
  embedding: "Embedding",
  storing: "Storing",
};

/**
 * Tiny inline badge that subscribes to a single document's ingest-progress
 * SSE stream and renders the current stage + an optional processed/total
 * counter.  Auto-unmounts work when the parent stops rendering it (which
 * happens as soon as the doc flips to `ready` in the list refetch).
 *
 * One EventSource per mounted badge — trivially scales to dozens of
 * concurrent ingests without server changes since each stream terminates
 * itself on the first `ready|error|cancelled` event.
 */
const DocumentProgressBadge: React.FC<Props> = ({ documentId, onTerminal }) => {
  const { event, done } = useIngestProgress(documentId, {
    onEvent: (e) => {
      if (e.stage === "ready" || e.stage === "error" || e.stage === "cancelled") {
        onTerminal?.(e.stage);
      }
    },
  });

  // Before any event arrives we fall back to a neutral "Processing" label
  // — the badge should never flicker empty.
  const stage = event?.stage;
  const label = (stage && STAGE_LABEL[stage]) || "Processing";
  const counter =
    event?.total && event?.processed !== undefined
      ? ` ${event.processed}/${event.total}`
      : "";

  // Once the stream ends but the parent hasn't re-fetched yet, keep showing
  // the last stage rather than nothing.
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
      title={done ? "Finishing up…" : `Stage: ${stage || "processing"}`}
    >
      <Loader2 size={9} className="animate-spin" />
      {label}
      {counter}
    </span>
  );
};

export default DocumentProgressBadge;
