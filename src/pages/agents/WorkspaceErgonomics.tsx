import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Armchair, Upload, Camera, Monitor, Lightbulb, AlertTriangle,
  CheckCircle2, Eye, Ruler, Lamp, Loader2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { workspaceErgonomicsApi } from "@/services/api";
import { toast } from "sonner";

interface CategoryScore { label: string; score: number; color: string; }
interface Issue { text: string; severity: string; icon: React.ElementType; }
interface Recommendation { before: string; after: string; priority: string; }

const HISTORY_KEY = "lumicoria.ergonomics.history.v1";
const SETUP_KEY = "lumicoria.ergonomics.setup.v1";

interface HistoryEntry {
  id: string;
  overall_score: number;
  categories: CategoryScore[];
  issues: Issue[];
  recommendations: Recommendation[];
  created_at: string;
}

interface SetupDescription {
  desk_type: string;
  chair_type: string;
  monitor_count: number;
  notes: string;
}

const DEFAULT_CATEGORIES: CategoryScore[] = [
  { label: "Posture", score: 0, color: "bg-emerald-400" },
  { label: "Lighting", score: 0, color: "bg-amber-400" },
  { label: "Screen Distance", score: 0, color: "bg-emerald-400" },
  { label: "Chair Height", score: 0, color: "bg-amber-400" },
  { label: "Desk Setup", score: 0, color: "bg-emerald-400" },
  { label: "Break Frequency", score: 0, color: "bg-red-400" },
];

const sevColors: Record<string, string> = {
  Critical: "text-red-500", critical: "text-red-500", high: "text-red-500",
  Warning: "text-amber-500", warning: "text-amber-500", medium: "text-amber-500",
  Good: "text-emerald-500", info: "text-emerald-500", low: "text-emerald-500",
};

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(e: HistoryEntry[]): void {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(e.slice(0, 25))); } catch { /* quota */ }
}
function loadSetup(): SetupDescription {
  try {
    const raw = localStorage.getItem(SETUP_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { desk_type: "Standing", chair_type: "Ergonomic", monitor_count: 1, notes: "" };
}
function saveSetup(s: SetupDescription): void {
  try { localStorage.setItem(SETUP_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

const colorFor = (score: number): string =>
  score > 80 ? "bg-emerald-400" : score > 60 ? "bg-amber-400" : "bg-red-400";

const WorkspaceErgonomics: React.FC = () => {
  const [monitoring, setMonitoring] = useState(false);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryScore[]>(DEFAULT_CATEGORIES);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [setup, setSetup] = useState<SetupDescription>(loadSetup());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ergonomicCategories, setErgonomicCategories] = useState<string[]>([]);
  const [severityLevels, setSeverityLevels] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
    workspaceErgonomicsApi.getErgonomicCategories()
      .then(setErgonomicCategories).catch(() => {});
    workspaceErgonomicsApi.getIssueSeverityLevels()
      .then(setSeverityLevels).catch(() => {});
    workspaceErgonomicsApi.getGuidelines({})
      .catch(() => {});
  }, []);

  const applyAnalysis = (res: any) => {
    const score = res?.overall_score ?? res?.score ?? res?.health_score;
    if (typeof score === "number") setOverallScore(Math.round(score));

    const cats = res?.categories || res?.category_scores;
    if (Array.isArray(cats) && cats.length) {
      const next: CategoryScore[] = cats.slice(0, 10).map((c: any) => ({
        label: c.label || c.name || c.category || "Category",
        score: Math.round(c.score ?? c.value ?? 0),
        color: colorFor(c.score ?? c.value ?? 0),
      }));
      setCategories(next);
    }

    const iconForCat = (s: string): React.ElementType => {
      const x = s.toLowerCase();
      if (x.includes("monitor") || x.includes("screen")) return Monitor;
      if (x.includes("chair") || x.includes("posture")) return Armchair;
      if (x.includes("light") || x.includes("lamp")) return Lamp;
      if (x.includes("ok") || x.includes("good")) return CheckCircle2;
      return AlertTriangle;
    };

    const issueList = res?.issues || res?.findings;
    if (Array.isArray(issueList) && issueList.length) {
      setIssues(issueList.slice(0, 12).map((it: any) => ({
        text: typeof it === "string" ? it : (it.text || it.description || it.message || ""),
        severity: typeof it === "string" ? "Warning" : (it.severity || it.level || "Warning"),
        icon: iconForCat(typeof it === "string" ? it : (it.category || it.text || "")),
      })));
    }

    const recs = res?.recommendations || res?.suggestions;
    if (Array.isArray(recs) && recs.length) {
      setRecommendations(recs.slice(0, 8).map((r: any) => ({
        before: r.before || r.issue || r.current || "Current setup",
        after: r.after || r.fix || r.recommendation || r.suggestion || "",
        priority: r.priority || r.severity || "Medium",
      })));
    }

    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      overall_score: typeof score === "number" ? Math.round(score) : overallScore,
      categories: Array.isArray(cats) ? cats : categories,
      issues: Array.isArray(issueList) ? issueList : issues,
      recommendations: Array.isArray(recs) ? recs : recommendations,
      created_at: new Date().toISOString(),
    };
    const next = [entry, ...history].slice(0, 25);
    setHistory(next); saveHistory(next);
  };

  const analyzeSetup = async () => {
    setAnalyzing(true);
    try {
      const res: any = await workspaceErgonomicsApi.analyze({
        desk_type: setup.desk_type,
        chair_type: setup.chair_type,
        monitor_count: setup.monitor_count,
        notes: setup.notes,
      });
      applyAnalysis(res);
      toast.success("Workspace analyzed");
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Analysis failed";
      toast.error(typeof msg === "string" ? msg : "Analysis failed");
    } finally { setAnalyzing(false); }
  };

  const analyzeImage = async (file: File) => {
    setImageAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res: any = await workspaceErgonomicsApi.analyzeImage(formData);
      applyAnalysis(res);
      toast.success("Photo analyzed");
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Image analysis failed";
      toast.error(typeof msg === "string" ? msg : "Image analysis failed");
    } finally { setImageAnalyzing(false); }
  };

  const monitor = async () => {
    setMonitoring(m => !m);
    if (monitoring) return;
    try {
      await workspaceErgonomicsApi.monitor({
        active: true,
        setup,
      });
      toast.success("Monitoring started");
    } catch { /* offline ok */ }
  };

  const refreshRecommendations = async () => {
    try {
      const res: any = await workspaceErgonomicsApi.getRecommendations({
        setup,
        current_score: overallScore,
        active_issues: issues.map(i => i.text),
      });
      const recs = res?.recommendations || res?.suggestions;
      if (Array.isArray(recs) && recs.length) {
        setRecommendations(recs.slice(0, 8).map((r: any) => ({
          before: r.before || r.issue || "Current setup",
          after: r.after || r.fix || r.recommendation || r.suggestion || "",
          priority: r.priority || r.severity || "Medium",
        })));
        toast.success("Recommendations updated");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not fetch recommendations");
    }
  };

  const updateSetup = (patch: Partial<SetupDescription>) => {
    const next = { ...setup, ...patch };
    setSetup(next); saveSetup(next);
  };

  const ringColor = overallScore > 80 ? "#10b981" : overallScore > 60 ? "#f59e0b" : "#ef4444";

  return (
    <AgentPageLayout agentName="Workspace Ergonomics" tagline="Optimize your setup" icon={Armchair} gradient="from-lime-500 to-green-600" status="beta">
      {/* Upload / Camera */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={imageAnalyzing}
          className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-green-300 transition-colors disabled:opacity-50"
        >
          {imageAnalyzing ? <Loader2 size={18} className="text-green-500 mx-auto mb-2 animate-spin" /> : <Upload size={18} className="text-gray-400 mx-auto mb-2" />}
          <p className="text-sm font-medium text-gray-600 mb-1">{imageAnalyzing ? "Analyzing…" : "Upload Workspace Photo"}</p>
          <p className="text-xs text-gray-400">Get instant ergonomic analysis</p>
          <input
            ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void analyzeImage(f); }}
          />
        </button>
        <button
          onClick={analyzeSetup}
          disabled={analyzing}
          className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-green-300 transition-colors disabled:opacity-50"
        >
          {analyzing ? <Loader2 size={18} className="text-green-500 mx-auto mb-2 animate-spin" /> : <Camera size={18} className="text-gray-400 mx-auto mb-2" />}
          <p className="text-sm font-medium text-gray-600 mb-1">{analyzing ? "Analyzing…" : "Describe & Analyze Setup"}</p>
          <p className="text-xs text-gray-400">Uses your saved setup notes — no camera required</p>
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Score + Categories */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Ergonomic Health Score</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Monitoring</span>
                <button onClick={() => void monitor()} className={`w-9 h-5 rounded-full transition-colors ${monitoring ? "bg-green-500" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${monitoring ? "ml-[18px]" : "ml-[2px]"}`} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-8 mb-2 flex-wrap">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="40" fill="none" stroke={ringColor} strokeWidth="8"
                      strokeDasharray={`${(overallScore / 100) * 251} 251`} strokeLinecap="round"
                      initial={{ strokeDasharray: "0 251" }} animate={{ strokeDasharray: `${(overallScore / 100) * 251} 251` }} transition={{ duration: 0.6 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{overallScore || "—"}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                  {categories.map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 w-28">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.score}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${c.color}`} />
                      </div>
                      <span className="text-[10px] text-gray-400 w-8 text-right">{c.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Current Issues</h3></div>
              <div className="divide-y divide-gray-50">
                {issues.map((issue, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 flex items-start gap-3">
                    <issue.icon size={16} className={`shrink-0 mt-0.5 ${sevColors[issue.severity] || "text-gray-400"}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{issue.text}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      ["Critical", "critical", "high"].includes(issue.severity) ? "border-red-200 text-red-600 bg-red-50" :
                      ["Warning", "warning", "medium"].includes(issue.severity) ? "border-amber-200 text-amber-600 bg-amber-50" :
                      "border-emerald-200 text-emerald-600 bg-emerald-50"
                    }`}>{issue.severity}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Recommendations</h3>
                <Button variant="ghost" size="sm" onClick={refreshRecommendations} className="text-[10px] text-green-600 h-6">Refresh</Button>
              </div>
              <div className="p-4 space-y-3">
                {recommendations.map((r, i) => (
                  <div key={i} className="p-3 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${r.priority === "High" || r.priority === "high" ? "border-red-200 text-red-600" : r.priority === "Medium" || r.priority === "medium" ? "border-amber-200 text-amber-600" : "border-gray-200 text-gray-500"}`}>{r.priority}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-red-50/50 rounded-lg border border-red-100">
                        <p className="text-[10px] text-red-500 font-medium mb-0.5">Before</p>
                        <p className="text-xs text-gray-600">{r.before}</p>
                      </div>
                      <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <p className="text-[10px] text-emerald-500 font-medium mb-0.5">After</p>
                        <p className="text-xs text-gray-600">{r.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {issues.length === 0 && recommendations.length === 0 && !analyzing && !imageAnalyzing && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <Armchair size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Describe your setup on the right and click <span className="font-semibold">Describe & Analyze Setup</span> above, or upload a photo. Your ergonomic score, issues and recommendations will appear here.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Setup notes */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Setup</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Desk type</label>
                <input value={setup.desk_type} onChange={(e) => updateSetup({ desk_type: e.target.value })} className="mt-1 w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Chair type</label>
                <input value={setup.chair_type} onChange={(e) => updateSetup({ chair_type: e.target.value })} className="mt-1 w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Monitors</label>
                <input type="number" min={1} max={4} value={setup.monitor_count} onChange={(e) => updateSetup({ monitor_count: Number(e.target.value) || 1 })} className="mt-1 w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wide">Notes</label>
                <textarea value={setup.notes} onChange={(e) => updateSetup({ notes: e.target.value })} placeholder="Anything else: lighting, breaks, posture concerns…" className="mt-1 w-full min-h-[70px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs resize-none" />
              </div>
            </div>
          </div>

          {/* Categories from backend */}
          {ergonomicCategories.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories Tracked</h3>
              <div className="flex flex-wrap gap-1.5">
                {ergonomicCategories.slice(0, 12).map((c, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-green-200 text-green-700">{c}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Guidelines</h3>
            <div className="space-y-2">
              {[
                { icon: Eye, text: "Screen 20-26 inches from eyes" },
                { icon: Ruler, text: "Top of monitor at eye level" },
                { icon: Armchair, text: "Feet flat on floor, knees at 90°" },
                { icon: Lamp, text: "Avoid direct light on screen" },
                { icon: Lightbulb, text: "Take breaks every 30-60 minutes" },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/50">
                  <g.icon size={14} className="text-green-500 shrink-0" />
                  <span className="text-xs text-gray-600">{g.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past scans */}
          {history.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Past Scans</h3>
                <button onClick={() => { setHistory([]); saveHistory([]); }} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {history.slice(0, 10).map((h) => (
                  <div key={h.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Score: {h.overall_score}</p>
                      <p className="text-[10px] text-gray-400">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${h.overall_score > 80 ? "border-emerald-200 text-emerald-600" : h.overall_score > 60 ? "border-amber-200 text-amber-600" : "border-red-200 text-red-600"}`}>{h.overall_score > 80 ? "Good" : h.overall_score > 60 ? "Fair" : "Low"}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {severityLevels.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Severity Levels</h3>
              <div className="flex flex-wrap gap-1.5">
                {severityLevels.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-gray-200 text-gray-500">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default WorkspaceErgonomics;
