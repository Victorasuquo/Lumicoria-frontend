import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target, Play, Pause, RotateCcw, Clock, AlertTriangle,
  TrendingUp, Bell, BellOff, Volume2, VolumeX, Moon,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { focusFlowApi } from "@/services/api";
import { toast } from "sonner";

const TECHNIQUE_DURATION: Record<string, number> = {
  pomodoro: 25 * 60,
  timeblock: 60 * 60,
  deepwork: 90 * 60,
  flowtime: 50 * 60,
};

const DEFAULT_TECHNIQUES = [
  { id: "pomodoro", label: "Pomodoro" },
  { id: "timeblock", label: "Time Blocking" },
  { id: "deepwork", label: "Deep Work" },
  { id: "flowtime", label: "Flowtime" },
];

const DEFAULT_FOCUS_STATES = [
  { label: "Deep Focus", color: "bg-violet-500" },
  { label: "Flow State", color: "bg-emerald-500" },
  { label: "Light Focus", color: "bg-blue-400" },
  { label: "Break", color: "bg-amber-400" },
];

const HISTORY_KEY = "lumicoria.focusflow.history.v1";

interface DistractionLog {
  id: string;
  type: string;
  source: string;
  impact: number;
  ts: string;
}

interface SessionLog {
  id: string;
  technique: string;
  started_at: string;
  ended_at?: string;
  duration_sec: number;
  distractions: number;
  productivity: number | null;
}

function loadSessions(): SessionLog[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveSessions(s: SessionLog[]): void {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(s.slice(0, 100))); } catch { /* quota */ }
}

const formatMMSS = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const relativeTime = (iso: string): string => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const FocusFlowAgent: React.FC = () => {
  const [activeTechnique, setActiveTechnique] = useState("pomodoro");
  const [techniques, setTechniques] = useState(DEFAULT_TECHNIQUES);
  const [focusStates, setFocusStates] = useState(DEFAULT_FOCUS_STATES);
  const [distractionTypes, setDistractionTypes] = useState<string[]>(["Notification", "Social Media", "Email", "Other"]);
  const [activeStateLabel, setActiveStateLabel] = useState("Flow State");

  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(TECHNIQUE_DURATION.pomodoro);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [distractions, setDistractions] = useState<DistractionLog[]>([]);
  const [history, setHistory] = useState<SessionLog[]>([]);
  const [patterns, setPatterns] = useState<number[]>([40, 55, 78, 92, 85, 45, 30, 65, 88, 95, 72, 50]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const [notifications, setNotifications] = useState(false);
  const [sound, setSound] = useState(true);
  const [dnd, setDnd] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalDuration = TECHNIQUE_DURATION[activeTechnique] || 25 * 60;

  // Load metadata + history on mount.
  useEffect(() => {
    setHistory(loadSessions());
    focusFlowApi.getFocusStates()
      .then((states) => {
        if (Array.isArray(states) && states.length) {
          const palette = ["bg-violet-500", "bg-emerald-500", "bg-blue-400", "bg-amber-400", "bg-cyan-400"];
          setFocusStates(states.slice(0, 5).map((label, i) => ({ label: String(label), color: palette[i % palette.length] })));
        }
      })
      .catch(() => {});
    focusFlowApi.getDistractionTypes()
      .then((types) => { if (Array.isArray(types) && types.length) setDistractionTypes(types.map(String)); })
      .catch(() => {});
    focusFlowApi.getProductivityTechniques()
      .then((items) => {
        if (Array.isArray(items) && items.length) {
          setTechniques(items.slice(0, 6).map(s => ({ id: String(s).toLowerCase().replace(/[^a-z]/g, ""), label: String(s) })));
        }
      })
      .catch(() => {});
    focusFlowApi.analyzePatterns({ time_range: "7d" })
      .then((res: any) => {
        const arr = res?.hourly || res?.heatmap || res?.scores;
        if (Array.isArray(arr) && arr.length === 12) setPatterns(arr.map(Number));
      })
      .catch(() => {});
  }, []);

  // Reset timer when technique changes mid-rest.
  useEffect(() => {
    if (!isRunning) setRemaining(TECHNIQUE_DURATION[activeTechnique] || 25 * 60);
  }, [activeTechnique, isRunning]);

  // Tick.
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { void completeSession(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const startSession = async () => {
    setIsRunning(true);
    const startedAt = new Date().toISOString();
    setSessionStart(startedAt);
    try {
      const res = await focusFlowApi.monitorFocus({
        technique: activeTechnique,
        focus_state: activeStateLabel,
        started_at: startedAt,
      });
      const id = res?.session_id || res?.id || `local-${Date.now()}`;
      setSessionId(id);
    } catch {
      setSessionId(`local-${Date.now()}`);
    }
  };

  const pauseSession = () => { setIsRunning(false); };

  const resetTimer = () => {
    setIsRunning(false);
    setRemaining(TECHNIQUE_DURATION[activeTechnique] || 25 * 60);
    setSessionId(null);
    setSessionStart(null);
    setDistractions([]);
  };

  const completeSession = async (auto = false) => {
    setIsRunning(false);
    if (!sessionStart) return;
    const endedAt = new Date().toISOString();
    const durationSec = totalDuration - remaining;
    let productivity: number | null = null;
    try {
      const res: any = await focusFlowApi.endSession({
        session_id: sessionId,
        technique: activeTechnique,
        started_at: sessionStart,
        ended_at: endedAt,
        duration_sec: durationSec,
        distractions: distractions.length,
        focus_state: activeStateLabel,
      });
      productivity = res?.productivity_score ?? res?.score ?? null;
      const recs = res?.recommendations || res?.suggestions;
      if (Array.isArray(recs) && recs.length) setRecommendations(recs.map(String));
    } catch {/* offline fallback */}

    const entry: SessionLog = {
      id: sessionId || `local-${Date.now()}`,
      technique: activeTechnique,
      started_at: sessionStart,
      ended_at: endedAt,
      duration_sec: durationSec,
      distractions: distractions.length,
      productivity,
    };
    const next = [entry, ...history].slice(0, 100);
    setHistory(next); saveSessions(next);
    setSessionId(null); setSessionStart(null); setDistractions([]);
    setRemaining(TECHNIQUE_DURATION[activeTechnique] || 25 * 60);
    if (auto) toast.success("Session complete");
  };

  const logDistraction = async (type: string) => {
    const entry: DistractionLog = {
      id: crypto.randomUUID(),
      type,
      source: type,
      impact: Math.max(1, Math.min(5, Math.round(Math.random() * 4 + 1))),
      ts: new Date().toISOString(),
    };
    setDistractions(prev => [entry, ...prev].slice(0, 20));
    try {
      await focusFlowApi.trackDistraction({
        session_id: sessionId,
        distraction_type: type,
        timestamp: entry.ts,
      });
    } catch { /* fire and forget */ }
  };

  const getRecommendations = async () => {
    try {
      const res: any = await focusFlowApi.getRecommendations({
        technique: activeTechnique,
        focus_state: activeStateLabel,
        recent_distractions: distractions.length,
      });
      const recs = res?.recommendations || res?.suggestions || res?.items;
      if (Array.isArray(recs) && recs.length) {
        setRecommendations(recs.map(String));
        toast.success("Recommendations updated");
      } else {
        toast.info("No new recommendations right now.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not fetch recommendations");
    }
  };

  const todayMinutes = history
    .filter(h => h.started_at.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((acc, h) => acc + Math.round(h.duration_sec / 60), 0);
  const todaySessions = history.filter(h => h.started_at.startsWith(new Date().toISOString().slice(0, 10))).length;
  const avgProductivity = history.length
    ? Math.round(history.filter(h => h.productivity !== null).reduce((acc, h) => acc + (h.productivity || 0), 0) / Math.max(history.filter(h => h.productivity !== null).length, 1))
    : 0;

  const stats = [
    { label: "Sessions Today", value: String(todaySessions), icon: Target, color: "text-orange-500" },
    { label: "Focus Time", value: `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`, icon: Clock, color: "text-blue-500" },
    { label: "Distractions", value: String(distractions.length), icon: AlertTriangle, color: "text-red-500" },
    { label: "Productivity", value: avgProductivity ? `${avgProductivity}%` : "—", icon: TrendingUp, color: "text-emerald-500" },
  ];

  const progress = isRunning ? 1 - remaining / totalDuration : 0;

  return (
    <AgentPageLayout agentName="Focus & Flow" tagline="Achieve deep work" icon={Target} gradient="from-orange-500 to-red-600">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Timer */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                {focusStates.map((s) => (
                  <Badge
                    key={s.label}
                    onClick={() => setActiveStateLabel(s.label)}
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 cursor-pointer ${s.label === activeStateLabel ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-400"}`}
                  >
                    {s.label === activeStateLabel && <span className={`w-1.5 h-1.5 rounded-full ${s.color} mr-1.5 inline-block`} />}
                    {s.label}
                  </Badge>
                ))}
              </div>

              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                  <motion.circle cx="100" cy="100" r="85" fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round"
                    initial={{ strokeDasharray: "0 534" }}
                    animate={{ strokeDasharray: `${progress * 534} 534` }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-gray-900 font-mono">{formatMMSS(remaining)}</p>
                  <p className="text-xs text-gray-400 mt-1">{isRunning ? "Focus Session" : sessionStart ? "Paused" : "Ready"}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={resetTimer} className="w-10 h-10 rounded-full p-0 border-gray-200">
                  <RotateCcw size={16} className="text-gray-400" />
                </Button>
                <Button
                  onClick={() => {
                    if (isRunning) pauseSession();
                    else if (sessionStart) setIsRunning(true);
                    else void startSession();
                  }}
                  className={`w-14 h-14 rounded-full p-0 ${isRunning ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"} text-white`}
                >
                  {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => void completeSession(false)} disabled={!sessionStart} className="w-10 h-10 rounded-full p-0 border-gray-200">
                  <Target size={16} className="text-gray-400" />
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-50 p-3 flex justify-center gap-2 flex-wrap">
              {techniques.map((t) => (
                <button key={t.id} onClick={() => setActiveTechnique(t.id)} disabled={isRunning} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTechnique === t.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"} ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Productivity Heatmap */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Productivity Patterns</h3>
            <div className="flex gap-1">
              {patterns.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-8 rounded-md ${score > 80 ? "bg-orange-400" : score > 60 ? "bg-orange-200" : score > 40 ? "bg-orange-100" : "bg-gray-100"}`} title={`${i + 8}:00 · ${score}%`} />
                  <span className="text-[8px] text-gray-400">{i + 8}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <span className="text-[10px] text-gray-400">Low</span>
              <div className="flex gap-0.5">{["bg-gray-100", "bg-orange-100", "bg-orange-200", "bg-orange-400"].map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}</div>
              <span className="text-[10px] text-gray-400">High</span>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Recommendations</h3>
              <ul className="space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-orange-500">→</span> {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Environment</h3>
            <div className="space-y-3">
              {[
                { label: "Notifications", on: notifications, toggle: () => setNotifications(!notifications), iconOn: Bell, iconOff: BellOff },
                { label: "Sound", on: sound, toggle: () => setSound(!sound), iconOn: Volume2, iconOff: VolumeX },
                { label: "DND Mode", on: dnd, toggle: () => setDnd(!dnd), iconOn: Moon, iconOff: Moon },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {setting.on ? <setting.iconOn size={14} className="text-gray-500" /> : <setting.iconOff size={14} className="text-gray-400" />}
                    <span className="text-xs text-gray-600">{setting.label}</span>
                  </div>
                  <button onClick={setting.toggle} className={`w-9 h-5 rounded-full transition-colors ${setting.on ? "bg-orange-500" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.on ? "ml-[18px]" : "ml-[2px]"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Distractions</h3>
              <Button onClick={getRecommendations} variant="ghost" size="sm" className="text-[10px] text-orange-500 h-6">Get tips</Button>
            </div>
            <div className="px-4 pb-3 flex flex-wrap gap-1">
              {distractionTypes.slice(0, 6).map((type) => (
                <button key={type} onClick={() => logDistraction(type)} className="px-2 py-1 rounded-md text-[10px] font-medium bg-gray-50 text-gray-500 hover:bg-gray-100">
                  +{type}
                </button>
              ))}
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {distractions.length === 0 ? (
                <p className="p-4 text-xs text-gray-400">No distractions logged this session.</p>
              ) : distractions.map((d) => (
                <div key={d.id} className="p-3 flex items-center gap-3">
                  <AlertTriangle size={14} className={`shrink-0 ${d.impact > 3 ? "text-red-400" : "text-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{d.source}</p>
                    <p className="text-[10px] text-gray-400">{d.type} · {relativeTime(d.ts)}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, j) => (
                      <div key={j} className={`w-1.5 h-3 rounded-sm ${j < d.impact ? "bg-red-400" : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Past Sessions</h3>
                <button onClick={() => { setHistory([]); saveSessions([]); }} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {history.slice(0, 10).map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700 capitalize">{s.technique}</p>
                      <p className="text-[10px] text-gray-400">{relativeTime(s.started_at)} · {Math.round(s.duration_sec / 60)}min · {s.distractions} dx</p>
                    </div>
                    {s.productivity !== null && <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">{s.productivity}%</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default FocusFlowAgent;
