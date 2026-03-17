import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Languages, ArrowRightLeft, Copy, Volume2, FileText,
  Globe, BookOpen, Briefcase, Pen, ChevronDown, Zap, Clock,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const languages = [
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
];

const mockTranslation = {
  source: "Artificial intelligence is transforming how we work and live. The integration of AI agents into daily workflows enables unprecedented productivity gains while maintaining the human touch that makes great work possible.",
  target: "La inteligencia artificial está transformando cómo trabajamos y vivimos. La integración de agentes de IA en los flujos de trabajo diarios permite ganancias de productividad sin precedentes, manteniendo el toque humano que hace posible un gran trabajo.",
  confidence: 96,
  culturalNotes: [
    { text: "\"human touch\" translated as \"toque humano\" — direct equivalent widely used in Spanish business context", type: "idiom" },
    { text: "\"unprecedented\" → \"sin precedentes\" — formal register maintained", type: "register" },
  ],
};

const recentTranslations = [
  { from: "English", to: "Spanish", words: 2400, time: "10 min ago" },
  { from: "French", to: "English", words: 850, time: "1 hour ago" },
  { from: "English", to: "Japanese", words: 1200, time: "3 hours ago" },
  { from: "German", to: "English", words: 3100, time: "Yesterday" },
];

const TranslationAgent: React.FC = () => {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [activeMode, setActiveMode] = useState("document");
  const [sourceText, setSourceText] = useState("");

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <AgentPageLayout agentName="Translation Agent" tagline="Multilingual translation & cultural adaptation" icon={Languages} gradient="from-cyan-500 to-blue-600">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
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
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
          <button onClick={swapLanguages} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0">
            <ArrowRightLeft size={16} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-200">
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Translation Panels */}
        <div className="lg:col-span-3 space-y-6">
          {/* Source & Target */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Source */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Source</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-400"><Volume2 size={12} /></Button>
              </div>
              <div className="p-3">
                <Textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Enter text to translate..." className="min-h-[180px] text-sm border-0 bg-transparent resize-none p-0 focus-visible:ring-0" />
              </div>
              <div className="px-3 pb-3">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs">
                  <Languages size={12} className="mr-1.5" /> Translate
                </Button>
              </div>
            </div>

            {/* Target */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Translation</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-400"><Volume2 size={12} /></Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-400"><Copy size={12} /></Button>
                </div>
              </div>
              <div className="p-3">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-700 leading-relaxed min-h-[180px]">
                  {mockTranslation.target}
                </motion.p>
              </div>
              <div className="px-3 pb-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${mockTranslation.confidence}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-cyan-400" />
                </div>
                <span className="text-[10px] text-gray-400">{mockTranslation.confidence}% confidence</span>
              </div>
            </div>
          </div>

          {/* Cultural Notes */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Cultural & Linguistic Notes</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {mockTranslation.culturalNotes.map((note, i) => (
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
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Options */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Translation Options</h3>
            <div className="space-y-3">
              {[
                { label: "Preserve Formatting", enabled: true },
                { label: "Include Cultural Context", enabled: true },
                { label: "Handle Idioms", enabled: true },
                { label: "Formal Register", enabled: false },
              ].map((opt) => (
                <div key={opt.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{opt.label}</span>
                  <div className={`w-9 h-5 rounded-full transition-colors ${opt.enabled ? "bg-cyan-500" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${opt.enabled ? "ml-[18px]" : "ml-[2px]"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Recent Translations</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTranslations.map((t, i) => (
                <div key={i} className="p-3 flex items-center gap-3 hover:bg-gray-50/30 cursor-pointer transition-colors">
                  <Languages size={14} className="text-cyan-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{t.from} → {t.to}</p>
                    <p className="text-[10px] text-gray-400">{t.words} words · {t.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-gray-300 transition-colors">
            <FileText size={18} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Upload Document</p>
            <p className="text-xs text-gray-400">Translate entire documents with format preservation</p>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default TranslationAgent;
