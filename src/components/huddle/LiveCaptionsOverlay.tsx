/**
 * LiveCaptionsOverlay — floats over the Jitsi iframe at the bottom of
 * the room, showing the most recent translated caption in the user's
 * preferred language.
 *
 * Subscribes to:
 *   - WS transcript_chunk events (raw STT in source language)
 *   - WS agent_response events with agent_key="translation" — the
 *     dispatcher produces a dict of {lang: translated_text}; we render
 *     whichever lang the viewer picked.
 *
 * If the translation agent isn't attached, we just render the source
 * transcript chunk text. This means the overlay always shows something
 * useful even with no Translation agent in the call.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, X } from "lucide-react";
import type { AgentResponseEvent, TranscriptChunkEvent } from "@/hooks/useHuddleWebSocket";

interface LiveCaptionsOverlayProps {
  chunks: TranscriptChunkEvent["chunk"][];
  agentResponses: AgentResponseEvent[];
  /** Whether the translation agent is in the call. */
  translationAttached: boolean;
  /** Initial target language code (e.g. "en", "es", "fr"). */
  initialLanguage?: string;
  /** Optional close handler — if absent, the X button doesn't render. */
  onClose?: () => void;
}

const LANGUAGES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "es", label: "Spanish",   flag: "🇪🇸" },
  { code: "fr", label: "French",    flag: "🇫🇷" },
  { code: "de", label: "German",    flag: "🇩🇪" },
  { code: "zh", label: "Chinese",   flag: "🇨🇳" },
  { code: "ja", label: "Japanese",  flag: "🇯🇵" },
  { code: "ko", label: "Korean",    flag: "🇰🇷" },
  { code: "ar", label: "Arabic",    flag: "🇸🇦" },
  { code: "pt", label: "Portuguese",flag: "🇧🇷" },
  { code: "ru", label: "Russian",   flag: "🇷🇺" },
  { code: "hi", label: "Hindi",     flag: "🇮🇳" },
  { code: "it", label: "Italian",   flag: "🇮🇹" },
];

const CAPTION_TIMEOUT_MS = 7_000;

export const LiveCaptionsOverlay: React.FC<LiveCaptionsOverlayProps> = ({
  chunks,
  agentResponses,
  translationAttached,
  initialLanguage,
  onClose,
}) => {
  const [language, setLanguage] = useState(initialLanguage || "en");
  const [latestCaption, setLatestCaption] = useState<{ text: string; ts: number; speaker?: string } | null>(null);

  // Look up the most recent translation_response for the chosen language
  const latestTranslation = useMemo(() => {
    for (let i = agentResponses.length - 1; i >= 0; i--) {
      const r = agentResponses[i];
      if (r.agent_key === "translation" && r.ok && r.response && typeof r.response === "object") {
        const obj = r.response as Record<string, string>;
        const text = obj[language];
        if (text) return { text, ts: r.ts || Date.now() };
      }
    }
    return null;
  }, [agentResponses, language]);

  // When a new caption arrives (either translated or raw chunk), show it.
  useEffect(() => {
    if (translationAttached && latestTranslation) {
      setLatestCaption({ text: latestTranslation.text, ts: latestTranslation.ts });
      return;
    }
    const last = chunks[chunks.length - 1];
    if (last) setLatestCaption({ text: last.text, ts: Date.parse(last.ts || ""), speaker: last.speaker_name });
  }, [chunks, latestTranslation, translationAttached]);

  // Auto-clear stale captions
  useEffect(() => {
    if (!latestCaption) return;
    const id = setTimeout(() => setLatestCaption(null), CAPTION_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [latestCaption]);

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pointer-events-none pb-6 px-6 z-10">
      <div className="flex items-center gap-2 mb-2 pointer-events-auto bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
        <Globe size={11} className="text-white/70" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-white text-[11px] font-medium outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="text-black">
              {l.flag} {l.label}
            </option>
          ))}
        </select>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {latestCaption && (
          <motion.div
            key={latestCaption.ts}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="max-w-3xl w-full text-center pointer-events-auto"
          >
            <p className="bg-black/75 backdrop-blur text-white text-[15px] md:text-base leading-relaxed font-medium px-5 py-2.5 rounded-2xl inline-block shadow-2xl">
              {latestCaption.speaker && (
                <span className="text-white/60 text-[11px] uppercase tracking-wider mr-2">{latestCaption.speaker}</span>
              )}
              {latestCaption.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveCaptionsOverlay;
