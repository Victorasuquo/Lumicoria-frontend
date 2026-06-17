import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Copy, RefreshCw, Wand2, BookOpen, Megaphone,
  PenTool, FileText, ShoppingBag, Hash, Type, Sliders, Loader2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { creativeApi } from "@/services/api";
import { toast } from "sonner";

const contentTypes = [
  { id: "marketing", label: "Marketing Copy", icon: Megaphone },
  { id: "story", label: "Storytelling", icon: BookOpen },
  { id: "poetry", label: "Poetry", icon: PenTool },
  { id: "script", label: "Script", icon: FileText },
  { id: "product", label: "Product", icon: ShoppingBag },
  { id: "social_media", label: "Social Post", icon: Hash },
  { id: "blog", label: "Blog Post", icon: Type },
] as const;

const tones = ["Professional", "Casual", "Witty", "Inspirational", "Formal", "Playful"] as const;
const lengths = ["Short", "Medium", "Long"] as const;

const HISTORY_KEY = "lumicoria.creative.history.v1";

interface HistoryEntry {
  id: string;
  type: string;
  prompt: string;
  output: string;
  tone: string;
  length: string;
  created_at: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch { return []; }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch { /* quota — drop silently */ }
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readability(text: string): string {
  const words = wordCount(text);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const avgWordsPerSentence = words / sentences;
  if (avgWordsPerSentence < 12) return "Grade 6-8";
  if (avgWordsPerSentence < 18) return "Grade 9-10";
  if (avgWordsPerSentence < 24) return "Grade 11-12";
  return "College";
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const CreativeAgent: React.FC = () => {
  const [activeType, setActiveType] = useState<string>("marketing");
  const [activeTone, setActiveTone] = useState<string>("Professional");
  const [activeLength, setActiveLength] = useState<string>("Medium");
  const [prompt, setPrompt] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [outputTitle, setOutputTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const generate = async () => {
    if (!prompt.trim()) { toast.error("Describe what you want to create first."); return; }
    setLoading(true);
    setOutput("");
    setOutputTitle("");
    try {
      const payload = {
        prompt: prompt.trim(),
        tone: activeTone.toLowerCase(),
        length: activeLength.toLowerCase(),
        content_type: activeType,
      };
      let res: any;
      switch (activeType) {
        case "marketing":     res = await creativeApi.generateMarketing(payload); break;
        case "story":         res = await creativeApi.generateStory(payload); break;
        case "blog":          res = await creativeApi.generateBlog(payload); break;
        case "social_media":  res = await creativeApi.generateSocialMedia(payload); break;
        default:              res = await creativeApi.generate(payload);
      }
      const text =
        res?.content ?? res?.output ?? res?.text ?? res?.result?.content ?? res?.data?.content ?? "";
      const title =
        res?.title ?? `Generated ${contentTypes.find(t => t.id === activeType)?.label || "Content"}`;
      setOutput(typeof text === "string" ? text : JSON.stringify(text, null, 2));
      setOutputTitle(title);

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        type: contentTypes.find(t => t.id === activeType)?.label || activeType,
        prompt: prompt.trim().slice(0, 120),
        output: typeof text === "string" ? text : JSON.stringify(text),
        tone: activeTone, length: activeLength,
        created_at: new Date().toISOString(),
      };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next); saveHistory(next);
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Generation failed";
      toast.error(typeof msg === "string" ? msg : "Generation failed");
    } finally { setLoading(false); }
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => toast.success("Copied to clipboard"));
  };

  const replayEntry = (e: HistoryEntry) => {
    setPrompt(e.prompt);
    setActiveTone(e.tone);
    setActiveLength(e.length);
    setOutput(e.output);
    setOutputTitle(`Generated ${e.type}`);
  };

  const outWords = output ? wordCount(output) : 0;

  return (
    <AgentPageLayout agentName="Creative Agent" tagline="Generate compelling content" icon={Sparkles} gradient="from-fuchsia-500 to-purple-600">
      {/* Content Type Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {contentTypes.map((t) => (
          <button key={t.id} onClick={() => setActiveType(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeType === t.id ? "bg-gray-900 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"}`}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Creative Brief</h3>
            </div>
            <div className="p-4">
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe what you want to create... e.g., 'Write a compelling product launch email for an AI-powered productivity tool'" className="min-h-[120px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3" />
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">Tone</p>
                  <div className="flex gap-1 flex-wrap">
                    {tones.map((t) => (
                      <button key={t} onClick={() => setActiveTone(t)} className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${activeTone === t ? "bg-fuchsia-100 text-fuchsia-700" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">Length</p>
                  <div className="flex gap-1">
                    {lengths.map((l) => (
                      <button key={l} onClick={() => setActiveLength(l)} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${activeLength === l ? "bg-fuchsia-100 text-fuchsia-700" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={generate} disabled={loading || !prompt.trim()} className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                {loading ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Wand2 size={12} className="mr-1.5" />}
                {loading ? "Generating..." : "Generate Content"}
              </Button>
            </div>
          </div>

          {/* Output */}
          {(output || loading) && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">{outputTitle || "Generating..."}</h3>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output} className="h-7 px-2 text-gray-400 hover:text-gray-600"><Copy size={12} /></Button>
                  <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="h-7 px-2 text-gray-400 hover:text-gray-600"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /></Button>
                </div>
              </div>
              <div className="p-5">
                {loading && !output ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-11/12 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-10/12 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-9/12 animate-pulse" />
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{output}</p>
                  </motion.div>
                )}
                {output && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                    {[
                      { label: "Words", value: outWords },
                      { label: "Readability", value: readability(output) },
                      { label: "Tone", value: activeTone },
                    ].map((m) => (
                      <div key={m.label} className="px-3 py-1.5 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400">{m.label}</p>
                        <p className="text-xs font-medium text-gray-700">{m.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Style Controls (visual only — surfaces tone + length to user) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sliders size={14} className="text-fuchsia-500" />
              <h3 className="text-sm font-semibold text-gray-900">Active Style</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-gray-500">Format</span><span className="font-medium text-gray-700">{contentTypes.find(t => t.id === activeType)?.label}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Tone</span><span className="font-medium text-gray-700">{activeTone}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Length</span><span className="font-medium text-gray-700">{activeLength}</span></div>
            </div>
          </div>

          {/* Recent Generations */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Generations</h3>
              {history.length > 0 && (
                <button onClick={() => { setHistory([]); saveHistory([]); }} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>
              )}
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <p className="p-4 text-xs text-gray-400">No generations yet. Your runs will appear here.</p>
              ) : history.map((g) => (
                <div key={g.id} onClick={() => replayEntry(g)} className="p-3 flex items-center gap-3 hover:bg-gray-50/30 cursor-pointer transition-colors">
                  <Sparkles size={14} className="text-fuchsia-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{g.type}</p>
                    <p className="text-[10px] text-gray-400 truncate">{g.prompt}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 shrink-0">{relativeTime(g.created_at)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Templates</h3>
            <div className="space-y-2">
              {[
                "Product launch email for our new AI agent platform",
                "Twitter thread on the future of AI agents at work",
                "Blog introduction about multi-agent systems",
                "Short ad copy: 'Lumicoria - AI Agent Universe'",
              ].map((t) => (
                <button key={t} onClick={() => setPrompt(t)} className="w-full text-left p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <span className="text-xs text-gray-600">{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default CreativeAgent;
