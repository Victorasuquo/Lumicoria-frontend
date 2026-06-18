import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Languages, ArrowRightLeft, Copy, Volume2, FileText,
  Globe, BookOpen, Briefcase, Pen, Loader2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { translationApi } from "@/services/api";
import { toast } from "sonner";

const DEFAULT_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
];

const translationModes = [
  { id: "document", label: "Document", icon: FileText },
  { id: "conversation", label: "Conversation", icon: Globe },
  { id: "cultural", label: "Cultural", icon: BookOpen },
  { id: "technical", label: "Technical", icon: Briefcase },
  { id: "literary", label: "Literary", icon: Pen },
] as const;

const HISTORY_KEY = "lumicoria.translation.history.v1";

interface HistoryEntry {
  id: string;
  source_lang: string;
  target_lang: string;
  source_text: string;
  translated_text: string;
  mode: string;
  word_count: number;
  created_at: string;
}

function loadHistory(): HistoryEntry[] {
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveHistory(entries: HistoryEntry[]): void {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50))); } catch { /* quota */ }
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

const TranslationAgent: React.FC = () => {
  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [activeMode, setActiveMode] = useState<string>("document");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [culturalNotes, setCulturalNotes] = useState<Array<{ text: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    // Fetch languages from backend; fall back to bundled list on failure.
    translationApi.getLanguages()
      .then(list => {
        if (Array.isArray(list) && list.length) {
          const normalised = list.map((l: any) => ({
            code: l.code || l.language_code || l.id,
            label: l.label || l.name || l.language_name || l.code,
            flag: l.flag || "🌐",
          })).filter(l => l.code && l.label);
          if (normalised.length) setLanguages(normalised);
        }
      })
      .catch(() => { /* keep bundled list */ });
  }, []);

  const swap = () => { setSourceLang(targetLang); setTargetLang(sourceLang); };

  const translate = async () => {
    if (!sourceText.trim()) { toast.error("Enter text to translate first."); return; }
    setLoading(true);
    setTranslatedText("");
    setConfidence(null);
    setCulturalNotes([]);
    try {
      const payload = {
        content: sourceText.trim(),
        source_language: sourceLang,
        target_language: targetLang,
        mode: activeMode,
      };
      let res: any;
      switch (activeMode) {
        case "document":     res = await translationApi.translateDocument(payload); break;
        case "conversation": res = await translationApi.translateConversation(payload); break;
        case "cultural":     res = await translationApi.adaptCulturally(payload); break;
        case "technical":    res = await translationApi.translateTechnical(payload); break;
        case "literary":     res = await translationApi.translateLiterary(payload); break;
        default:             res = await translationApi.translate(payload);
      }
      const out = res?.translated_text ?? res?.text ?? res?.result ?? res?.output ?? res?.translation ?? "";
      setTranslatedText(typeof out === "string" ? out : JSON.stringify(out));
      const conf = res?.confidence ?? res?.confidence_score ?? res?.score;
      if (typeof conf === "number") setConfidence(conf > 1 ? conf : Math.round(conf * 100));
      const notes = res?.cultural_notes || res?.notes || res?.linguistic_notes;
      if (Array.isArray(notes)) {
        setCulturalNotes(notes.map((n: any) => ({
          text: typeof n === "string" ? n : (n.text || n.note || n.message || ""),
          type: typeof n === "string" ? "note" : (n.type || n.category || "note"),
        })).filter(n => n.text));
      }

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        source_lang: sourceLang, target_lang: targetLang,
        source_text: sourceText.trim().slice(0, 200),
        translated_text: typeof out === "string" ? out : "",
        mode: activeMode,
        word_count: sourceText.trim().split(/\s+/).filter(Boolean).length,
        created_at: new Date().toISOString(),
      };
      const next = [entry, ...history].slice(0, 50);
      setHistory(next); saveHistory(next);
    } catch (e: any) {
      const msg = e?.response?.data?.detail?.message || e?.response?.data?.detail || e?.message || "Translation failed";
      toast.error(typeof msg === "string" ? msg : "Translation failed");
    } finally { setLoading(false); }
  };

  const copyTranslation = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText).then(() => toast.success("Copied to clipboard"));
  };

  const speak = (text: string, lang: string) => {
    if (!text || !("speechSynthesis" in window)) { toast.error("Speech not supported"); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    window.speechSynthesis.speak(utter);
  };

  const replayEntry = (e: HistoryEntry) => {
    setSourceLang(e.source_lang);
    setTargetLang(e.target_lang);
    setSourceText(e.source_text);
    setTranslatedText(e.translated_text);
    setActiveMode(e.mode);
  };

  const labelOf = (code: string) => languages.find(l => l.code === code)?.label || code;

  return (
    <AgentPageLayout agentName="Translation Agent" tagline="Multilingual translation & cultural adaptation" icon={Languages} gradient="from-cyan-500 to-blue-600">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {translationModes.map((m) => (
          <button key={m.id} onClick={() => setActiveMode(m.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeMode === m.id ? "bg-gray-900 text-white" : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"}`}>
            <m.icon size={12} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Language Selector Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-200">
              {languages.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          <button onClick={swap} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0">
            <ArrowRightLeft size={16} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-200">
              {languages.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Source */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Source · {labelOf(sourceLang)}</span>
                <Button variant="ghost" size="sm" onClick={() => speak(sourceText, sourceLang)} disabled={!sourceText} className="h-6 px-2 text-gray-400"><Volume2 size={12} /></Button>
              </div>
              <div className="p-3">
                <Textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Enter text to translate..." className="min-h-[180px] text-sm border-0 bg-transparent resize-none p-0 focus-visible:ring-0" />
              </div>
              <div className="px-3 pb-3">
                <Button onClick={translate} disabled={loading || !sourceText.trim()} className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs">
                  {loading ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Languages size={12} className="mr-1.5" />}
                  {loading ? "Translating..." : "Translate"}
                </Button>
              </div>
            </div>

            {/* Target */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Translation · {labelOf(targetLang)}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => speak(translatedText, targetLang)} disabled={!translatedText} className="h-6 px-2 text-gray-400"><Volume2 size={12} /></Button>
                  <Button variant="ghost" size="sm" onClick={copyTranslation} disabled={!translatedText} className="h-6 px-2 text-gray-400"><Copy size={12} /></Button>
                </div>
              </div>
              <div className="p-3">
                {loading && !translatedText ? (
                  <div className="space-y-2 min-h-[180px]">
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-11/12 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-10/12 animate-pulse" />
                  </div>
                ) : (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-700 leading-relaxed min-h-[180px] whitespace-pre-line">
                    {translatedText || <span className="text-gray-300 text-xs">Translation will appear here…</span>}
                  </motion.p>
                )}
              </div>
              {confidence !== null && (
                <div className="px-3 pb-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-[10px] text-gray-400">{confidence}% confidence</span>
                </div>
              )}
            </div>
          </div>

          {culturalNotes.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Cultural & Linguistic Notes</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {culturalNotes.map((note, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 flex items-start gap-3">
                    <BookOpen size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{note.text}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-cyan-200 text-cyan-600 shrink-0">{note.type}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Active mode summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Settings</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Mode</span><span className="font-medium text-gray-700 capitalize">{activeMode}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Source</span><span className="font-medium text-gray-700">{labelOf(sourceLang)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="font-medium text-gray-700">{labelOf(targetLang)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Languages loaded</span><span className="font-medium text-gray-700">{languages.length}</span></div>
            </div>
          </div>

          {/* Recent */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Translations</h3>
              {history.length > 0 && <button onClick={() => { setHistory([]); saveHistory([]); }} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>}
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <p className="p-4 text-xs text-gray-400">No translations yet.</p>
              ) : history.map((t) => (
                <div key={t.id} onClick={() => replayEntry(t)} className="p-3 flex items-center gap-3 hover:bg-gray-50/30 cursor-pointer transition-colors">
                  <Languages size={14} className="text-cyan-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{labelOf(t.source_lang)} → {labelOf(t.target_lang)}</p>
                    <p className="text-[10px] text-gray-400 truncate">{t.word_count} words · {relativeTime(t.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-gray-300 transition-colors">
            <FileText size={18} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Upload Document</p>
            <p className="text-xs text-gray-400">Paste long-form content into the source panel for now. Document upload coming soon.</p>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default TranslationAgent;
