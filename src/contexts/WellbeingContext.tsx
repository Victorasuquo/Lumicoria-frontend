/**
 * WellbeingContext — global presence layer for the Well-being module.
 *
 * Once mounted at the App root, it:
 *   - pings the backend heartbeat every 30s while the tab is focused
 *     (drives the live break countdown + break-reminder cron)
 *   - polls for pending mood prompts every 2 min
 *   - drives a live countdown to the next break (interval from
 *     UserSettings, tick locally so we don't round-trip every second)
 *   - surfaces the latest recommendation across every page
 *
 * Consumers use `useWellbeing()` to read the live state.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { wellbeingApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

/* ── Types ───────────────────────────────────────────────────────── */

export interface CoachStateSnapshot {
  metrics: Record<string, any>;
  productivity: Record<string, any>;
  breakTimer: {
    intervalMinutes: number;
    durationMinutes: number;
    secondsUntilBreak: number;
    secondsSinceBreak: number;
  };
  todayTimeline: Array<Record<string, any>>;
  recommendations: Array<Record<string, any>>;
  weekSeries: Array<number | null>;
  generatedAt: string;
}

interface WellbeingContextValue {
  /** Live snapshot from /wellbeing/coach-state.  Refetched every 90s. */
  state: CoachStateSnapshot | null;
  /** Locally-ticking seconds-until-next-break (decrements every second). */
  secondsUntilBreak: number;
  /** True when the mood-prompt modal should be open. */
  moodPromptOpen: boolean;
  /** Top recommendation, if any, for the floating CoachBubble. */
  topRecommendation: Record<string, any> | null;
  /** Manual refresh — pages can call after they cause a change. */
  refresh: () => Promise<void>;
  /** Close + snooze the mood prompt. */
  dismissMoodPrompt: (snoozeMinutes?: number) => Promise<void>;
  /** Mark the mood prompt as handled (after the user actually logs). */
  closeMoodPrompt: () => void;
  /** Snooze the break countdown by N minutes. */
  snoozeBreak: (minutes?: number) => Promise<void>;
  /** Dismiss the floating recommendation card. */
  dismissRecommendation: () => void;
}

const WellbeingContext = createContext<WellbeingContextValue | undefined>(undefined);

const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const COACH_STATE_REFRESH_MS = 90 * 1000;
const MOOD_POLL_INTERVAL_MS = 2 * 60 * 1000;
const COUNTDOWN_TICK_MS = 1000;

/* ── Provider ────────────────────────────────────────────────────── */

export const WellbeingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<CoachStateSnapshot | null>(null);
  const [secondsUntilBreak, setSecondsUntilBreak] = useState<number>(0);
  const [moodPromptOpen, setMoodPromptOpen] = useState(false);
  const [dismissedRecId, setDismissedRecId] = useState<string | null>(null);

  // Track tab visibility so we don't hammer the backend while hidden.
  const [tabVisible, setTabVisible] = useState<boolean>(
    typeof document !== "undefined" ? !document.hidden : true,
  );

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  // ── Coach-state fetcher ──
  const fetchState = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await wellbeingApi.getCoachState();
      const reshaped: CoachStateSnapshot = {
        metrics: snap.metrics || {},
        productivity: snap.productivity || {},
        breakTimer: {
          intervalMinutes: snap.break_timer?.interval_minutes ?? 60,
          durationMinutes: snap.break_timer?.duration_minutes ?? 5,
          secondsUntilBreak: snap.break_timer?.seconds_until_break ?? 0,
          secondsSinceBreak: snap.break_timer?.seconds_since_break ?? 0,
        },
        todayTimeline: snap.today_timeline || [],
        recommendations: snap.recommendations || [],
        weekSeries: snap.week_series || [null, null, null, null, null, null, null],
        generatedAt: snap.generated_at,
      };
      setState(reshaped);
      setSecondsUntilBreak(reshaped.breakTimer.secondsUntilBreak);
    } catch {
      // Best-effort.  Reuse existing state if the fetch fails.
    }
  }, [user]);

  // Initial load + periodic refresh.
  useEffect(() => {
    if (!user) return;
    fetchState();
    const id = setInterval(() => {
      if (tabVisible) fetchState();
    }, COACH_STATE_REFRESH_MS);
    return () => clearInterval(id);
  }, [user, fetchState, tabVisible]);

  // ── Heartbeat ──
  useEffect(() => {
    if (!user) return;
    const ping = async () => {
      try {
        await wellbeingApi.heartbeat();
      } catch {
        /* best-effort */
      }
    };
    if (tabVisible) ping();
    const id = setInterval(() => {
      if (tabVisible) ping();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user, tabVisible]);

  // ── Local countdown tick ──
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      setSecondsUntilBreak((v) => (v > 0 ? v - 1 : 0));
    }, COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [user]);

  // ── Mood prompt poller ──
  const pollingRef = useRef(false);
  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      if (pollingRef.current || moodPromptOpen) return;
      pollingRef.current = true;
      try {
        const { prompt } = await wellbeingApi.pollMoodPrompt();
        if (prompt) setMoodPromptOpen(true);
      } catch {
        /* best-effort */
      } finally {
        pollingRef.current = false;
      }
    };
    if (tabVisible) poll();
    const id = setInterval(() => {
      if (tabVisible) poll();
    }, MOOD_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user, tabVisible, moodPromptOpen]);

  // ── Public handlers ──
  const dismissMoodPrompt = useCallback(async (snoozeMinutes: number = 90) => {
    try {
      await wellbeingApi.dismissMoodPrompt(snoozeMinutes);
    } catch {
      /* best-effort */
    }
    setMoodPromptOpen(false);
  }, []);

  const closeMoodPrompt = useCallback(() => {
    setMoodPromptOpen(false);
  }, []);

  const snoozeBreak = useCallback(async (minutes: number = 15) => {
    try {
      await wellbeingApi.snoozeBreak(minutes);
    } catch {
      /* best-effort */
    }
    setSecondsUntilBreak((v) => v + minutes * 60);
  }, []);

  const dismissRecommendation = useCallback(() => {
    const top = state?.recommendations?.[0];
    if (top?.id || top?.title) {
      setDismissedRecId(String(top.id || top.title));
    }
  }, [state]);

  const topRecommendation = useMemo(() => {
    const list = state?.recommendations || [];
    for (const rec of list) {
      const key = String(rec.id || rec.title || "");
      if (key && key !== dismissedRecId) {
        return rec;
      }
    }
    return null;
  }, [state, dismissedRecId]);

  const value: WellbeingContextValue = {
    state,
    secondsUntilBreak,
    moodPromptOpen,
    topRecommendation,
    refresh: fetchState,
    dismissMoodPrompt,
    closeMoodPrompt,
    snoozeBreak,
    dismissRecommendation,
  };

  return <WellbeingContext.Provider value={value}>{children}</WellbeingContext.Provider>;
};

/* ── Hook ────────────────────────────────────────────────────────── */

export const useWellbeing = (): WellbeingContextValue => {
  const ctx = useContext(WellbeingContext);
  if (!ctx) {
    // Safe fallback when used outside the provider — e.g. in tests.
    return {
      state: null,
      secondsUntilBreak: 0,
      moodPromptOpen: false,
      topRecommendation: null,
      refresh: async () => {},
      dismissMoodPrompt: async () => {},
      closeMoodPrompt: () => {},
      snoozeBreak: async () => {},
      dismissRecommendation: () => {},
    };
  }
  return ctx;
};
