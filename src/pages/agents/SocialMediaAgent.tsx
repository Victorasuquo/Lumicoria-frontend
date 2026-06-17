import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Share2, Send, TrendingUp, Heart, MessageCircle, Eye,
  Calendar, BarChart3, Hash, Clock, Globe, Zap, Loader2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { socialMediaApi } from "@/services/api";
import { toast } from "sonner";

const platforms = [
  { id: "twitter", label: "X (Twitter)", color: "bg-gray-900", maxChars: 280 },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-600", maxChars: 3000 },
  { id: "instagram", label: "Instagram", color: "bg-pink-500", maxChars: 2200 },
  { id: "facebook", label: "Facebook", color: "bg-blue-500", maxChars: 63206 },
] as const;

const modes = [
  { id: "content_generation", label: "Generate", icon: Zap },
  { id: "trend_analysis", label: "Trends", icon: TrendingUp },
  { id: "sentiment", label: "Sentiment", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

const HISTORY_KEY = "lumicoria.socialmedia.history.v1";

interface HistoryEntry {
  id: string;
  platform: string;
  content: string;
  status: "Draft" | "Generated" | "Analyzed";
  created_at: string;
  metrics?: { likes?: number; comments?: number; views?: number | string };
}

function loadHistory(): HistoryEntry[] {
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveHistory(e: HistoryEntry[]): void {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(e.slice(0, 50))); } catch { /* quota */ }
}
function relativeTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) === 1 ? "" : "s"} ago`;
}

const SocialMediaAgent: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<string>("twitter");
  const [activeMode, setActiveMode] = useState<string>("content_generation");
  const [postContent, setPostContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<any>(null);
  const [trends, setTrends] = useState<Array<{ tag: string; posts: string; trend: string }>>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentPlatform = platforms.find(p => p.id === activePlatform)!;

  useEffect(() => {
    setHistory(loadHistory());
    socialMediaApi.getAnalytics("7d").then((d) => setAnalytics(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeMode === "trend_analysis") {
      socialMediaApi.analyzeTrends({ platform: activePlatform })
        .then((res: any) => {
          const list = res?.trends || res?.topics || res?.items || [];
          if (Array.isArray(list) && list.length) {
            setTrends(list.slice(0, 8).map((t: any) => ({
              tag: t.tag || t.topic || t.name || "#trend",
              posts: t.posts || t.volume || t.count || "—",
              trend: t.trend || t.change || t.delta || "+",
            })));
          }
        })
        .catch(() => {});
    }
  }, [activeMode, activePlatform]);

  const generate = async () => {
    if (!postContent.trim() && activeMode === "content_generation") {
      toast.error("Add a topic or prompt to generate from.");
      return;
    }
    setGenerating(true);
    try {
      const res = await socialMediaApi.generateContent({
        platform: activePlatform,
        topic: postContent.trim() || "general announcement",
        max_chars: currentPlatform.maxChars,
        tone: "engaging",
      });
      const text = res?.content ?? res?.text ?? res?.output ?? res?.post ?? "";
      if (typeof text === "string" && text) {
        setPostContent(text);
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          platform: currentPlatform.label,
          content: text,
          status: "Generated",
          created_at: new Date().toISOString(),
        };
        const next = [entry, ...history].slice(0, 50);
        setHistory(next); saveHistory(next);
        toast.success("Draft generated");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Generation failed";
      toast.error(typeof msg === "string" ? msg : "Generation failed");
    } finally { setGenerating(false); }
  };

  const analyzeSentiment = async () => {
    if (!postContent.trim()) { toast.error("Write or paste content to analyze first."); return; }
    setAnalyzing(true); setSentiment(null);
    try {
      const res = await socialMediaApi.analyzeSentiment({ text: postContent.trim(), platform: activePlatform });
      setSentiment(res);
      toast.success("Sentiment ready");
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Analysis failed";
      toast.error(typeof msg === "string" ? msg : "Analysis failed");
    } finally { setAnalyzing(false); }
  };

  const saveDraft = () => {
    if (!postContent.trim()) { toast.error("Nothing to save."); return; }
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      platform: currentPlatform.label,
      content: postContent.trim(),
      status: "Draft",
      created_at: new Date().toISOString(),
    };
    const next = [entry, ...history].slice(0, 50);
    setHistory(next); saveHistory(next);
    toast.success("Draft saved");
  };

  const stats = [
    { label: "Total Reach", value: analytics?.total_reach ?? analytics?.reach ?? "—", icon: Eye, color: "text-blue-500" },
    { label: "Engagement", value: analytics?.engagement_rate ? `${analytics.engagement_rate}%` : analytics?.engagement || "—", icon: Heart, color: "text-rose-500" },
    { label: "Posts This Week", value: analytics?.posts_count ?? history.length, icon: Send, color: "text-emerald-500" },
    { label: "Drafts", value: history.filter(h => h.status === "Draft").length, icon: Calendar, color: "text-amber-500" },
  ];

  return (
    <AgentPageLayout agentName="Social Media Agent" tagline="Create & manage social content" icon={Share2} gradient="from-pink-500 to-rose-600">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setActiveMode(m.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeMode === m.id ? "bg-gray-900 text-white" : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"}`}>
            <m.icon size={12} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Composer */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Post Composer</h3>
              <div className="flex gap-1 flex-wrap">
                {platforms.map((p) => (
                  <button key={p.id} onClick={() => setActivePlatform(p.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${activePlatform === p.id ? `${p.color} text-white` : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={`Write your ${currentPlatform.label} post — or describe a topic and click Generate.`} className="min-h-[120px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-2" />
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] ${postContent.length > currentPlatform.maxChars ? "text-red-500" : "text-gray-400"}`}>{postContent.length} / {currentPlatform.maxChars}</span>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={generate} disabled={generating} className="h-7 px-2.5 text-[10px] border-gray-200">
                    {generating ? <Loader2 size={10} className="mr-1 animate-spin" /> : <Zap size={10} className="mr-1" />} AI Generate
                  </Button>
                  <Button variant="outline" size="sm" onClick={analyzeSentiment} disabled={analyzing || !postContent} className="h-7 px-2.5 text-[10px] border-gray-200">
                    {analyzing ? <Loader2 size={10} className="mr-1 animate-spin" /> : <Heart size={10} className="mr-1" />} Sentiment
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveDraft} disabled={!postContent.trim()} className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                  <Send size={12} className="mr-1.5" /> Save Draft
                </Button>
                <Button variant="outline" onClick={() => setPostContent("")} className="border-gray-200 h-9 px-4 text-xs">
                  Clear
                </Button>
              </div>
              {sentiment && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Sentiment analysis</p>
                  <pre className="text-[10px] text-gray-600 whitespace-pre-wrap font-mono">{JSON.stringify(sentiment, null, 2)}</pre>
                </motion.div>
              )}
            </div>
          </div>

          {/* Recent / History */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Posts & Drafts</h3>
              {history.length > 0 && <button onClick={() => { setHistory([]); saveHistory([]); }} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>}
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="p-4 text-xs text-gray-400">No drafts yet. Your generated posts and drafts will appear here.</p>
              ) : history.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{post.platform}</Badge>
                    <span className="text-[10px] text-gray-400">{relativeTime(post.created_at)}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ml-auto ${post.status === "Draft" ? "border-amber-200 text-amber-600 bg-amber-50" : "border-emerald-200 text-emerald-600 bg-emerald-50"}`}>{post.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-3 cursor-pointer" onClick={() => setPostContent(post.content)}>{post.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-pink-500" />
                <h3 className="text-sm font-semibold text-gray-900">Trending Topics</h3>
              </div>
              <button onClick={() => setActiveMode("trend_analysis")} className="text-[10px] text-pink-500 hover:underline">Refresh</button>
            </div>
            <div className="space-y-2">
              {trends.length === 0 ? (
                <p className="text-xs text-gray-400">Switch to Trends mode or click Refresh.</p>
              ) : trends.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{t.tag}</p>
                    <p className="text-[10px] text-gray-400">{t.posts} posts</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 text-emerald-600">{t.trend}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-2">
              {[
                "Launch announcement for our new AI feature",
                "Founder story for LinkedIn",
                "Twitter thread about multi-agent systems",
                "Customer success story",
              ].map((t) => (
                <button key={t} onClick={() => setPostContent(t)} className="w-full text-left p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <span className="text-xs text-gray-600">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Best Posting Times</h3>
            <div className="space-y-2">
              {(analytics?.best_times || [
                { day: "Tuesday", time: "10:00 AM", engagement: "High" },
                { day: "Thursday", time: "2:00 PM", engagement: "High" },
                { day: "Saturday", time: "11:00 AM", engagement: "Medium" },
              ]).slice(0, 5).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-600">{t.day} · {t.time}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${t.engagement === "High" ? "border-emerald-200 text-emerald-600" : "border-amber-200 text-amber-600"}`}>{t.engagement}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default SocialMediaAgent;
