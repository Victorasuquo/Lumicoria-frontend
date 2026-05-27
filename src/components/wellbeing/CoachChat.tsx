/**
 * CoachChat — conversational panel for the Well-being Coach.
 * Posts to `/wellbeing/chat`, which is Gemini-locked server-side.
 *
 * The response shape from the orchestrator:
 *   {
 *     response: string,
 *     follow_up_suggestions?: string[],
 *     action_buttons?: Array<{ label, action }>,
 *   }
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wellbeingApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Heart, Sparkles } from "lucide-react";

interface ChatTurn {
  role: "user" | "coach";
  content: string;
  followUps?: string[];
  ts: number;
}

const STARTER_PROMPTS = [
  "How am I doing this week?",
  "Suggest a quick reset",
  "I'm feeling drained — help?",
  "What should I focus on?",
];

export const CoachChat: React.FC = () => {
  const { toast } = useToast();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, sending]);

  const send = async (message?: string) => {
    const text = (message ?? draft).trim();
    if (!text || sending) return;
    setDraft("");
    setSending(true);

    const userTurn: ChatTurn = { role: "user", content: text, ts: Date.now() };
    setTurns((prev) => [...prev, userTurn]);

    try {
      const history = turns.slice(-8).map((t) => ({
        role: t.role === "coach" ? "assistant" : "user",
        content: t.content,
      }));
      const resp: any = await wellbeingApi.chatWithCoach({ message: text, history });
      const coachTurn: ChatTurn = {
        role: "coach",
        content: String(resp?.response || "I'm here. Tell me a bit more."),
        followUps: Array.isArray(resp?.follow_up_suggestions) ? resp.follow_up_suggestions : [],
        ts: Date.now(),
      };
      setTurns((prev) => [...prev, coachTurn]);
    } catch (e: any) {
      toast({
        title: "Couldn't reach the Coach",
        description: e?.response?.data?.detail || e?.message,
        variant: "destructive",
      });
      setTurns((prev) => [
        ...prev,
        {
          role: "coach",
          content: "I'm having trouble responding right now — please try again in a moment.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 border-b border-pink-100/60 flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-white/70 backdrop-blur-sm">
          <Heart size={16} className="text-rose-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[1.5px] text-rose-600 font-semibold">
            Live conversation
          </p>
          <p className="text-sm font-semibold text-gray-900">Chat with the Coach</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
        {turns.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 mb-3">
              <Sparkles size={20} className="text-rose-500" />
            </div>
            <p className="text-sm text-gray-700 font-medium mb-1">Say hi to your Coach</p>
            <p className="text-xs text-gray-500 mb-5">
              They've been watching your activity all day.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 font-medium transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {turns.map((t) => (
            <motion.div
              key={t.ts}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  t.role === "user"
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-md"
                    : "bg-gray-50 text-gray-800 rounded-tl-md"
                }`}
              >
                {t.content}
                {t.role === "coach" && t.followUps && t.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-gray-200/60">
                    {t.followUps.slice(0, 3).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => send(s)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 text-[11px] text-gray-700 font-medium transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-50 px-4 py-2.5 rounded-2xl rounded-tl-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-gray-50 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder="What's on your mind?"
            disabled={sending}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-400 max-h-32 px-2 py-1"
          />
          <button
            onClick={() => send()}
            disabled={sending || !draft.trim()}
            className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-rose-600 hover:to-pink-600 transition-colors"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
