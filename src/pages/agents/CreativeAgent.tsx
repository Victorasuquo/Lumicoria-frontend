import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Send, Copy, RefreshCw, Wand2, BookOpen, Megaphone,
  PenTool, FileText, ShoppingBag, Hash, Type, Sliders,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const contentTypes = [
  { id: "marketing", label: "Marketing Copy", icon: Megaphone },
  { id: "storytelling", label: "Storytelling", icon: BookOpen },
  { id: "poetry", label: "Poetry", icon: PenTool },
  { id: "scriptwriting", label: "Script", icon: FileText },
  { id: "product_description", label: "Product", icon: ShoppingBag },
  { id: "social_media", label: "Social Post", icon: Hash },
  { id: "blog_post", label: "Blog Post", icon: Type },
];

const tones = ["Professional", "Casual", "Witty", "Inspirational", "Formal", "Playful"];
const lengths = ["Short", "Medium", "Long"];

const mockOutput = {
  title: "Generated Marketing Copy",
  content: `Introducing Lumicoria — where artificial intelligence meets human ambition.\n\nIn a world drowning in data, we don't just process information. We transform it into insight, turning complexity into clarity with AI agents that think alongside you.\n\n✦ Smart enough to understand context\n✦ Fast enough to keep up with your ideas\n✦ Intuitive enough to feel like a teammate\n\nYour work deserves an AI that works as hard as you do.\nStart building with Lumicoria today.`,
  wordCount: 68,
  readability: "Grade 8",
  sentiment: "Positive",
};

const recentGenerations = [
  { type: "Marketing Copy", topic: "SaaS product launch", time: "2 min ago" },
  { type: "Blog Post", topic: "Future of AI agents", time: "15 min ago" },
  { type: "Product Description", topic: "Smart home device", time: "1 hour ago" },
  { type: "Social Post", topic: "Company milestone", time: "3 hours ago" },
];

const CreativeAgent: React.FC = () => {
  const [activeType, setActiveType] = useState("marketing");
  const [activeTone, setActiveTone] = useState("Professional");
  const [activeLength, setActiveLength] = useState("Medium");
  const [prompt, setPrompt] = useState("");

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
                  <div className="flex gap-1">
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
              <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                <Wand2 size={12} className="mr-1.5" /> Generate Content
              </Button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{mockOutput.title}</h3>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-gray-600"><Copy size={12} /></Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-gray-600"><RefreshCw size={12} /></Button>
              </div>
            </div>
            <div className="p-5">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{mockOutput.content}</p>
              </motion.div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                {[
                  { label: "Words", value: mockOutput.wordCount },
                  { label: "Readability", value: mockOutput.readability },
                  { label: "Sentiment", value: mockOutput.sentiment },
                ].map((m) => (
                  <div key={m.label} className="px-3 py-1.5 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-400">{m.label}</p>
                    <p className="text-xs font-medium text-gray-700">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Style Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sliders size={14} className="text-fuchsia-500" />
              <h3 className="text-sm font-semibold text-gray-900">Style Controls</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Creativity", value: 75 },
                { label: "Formality", value: 60 },
                { label: "Specificity", value: 45 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-[10px] text-gray-400">{s.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-fuchsia-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Generations */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Recent Generations</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentGenerations.map((g, i) => (
                <div key={i} className="p-3 flex items-center gap-3 hover:bg-gray-50/30 cursor-pointer transition-colors">
                  <Sparkles size={14} className="text-fuchsia-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{g.type}</p>
                    <p className="text-[10px] text-gray-400 truncate">{g.topic}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 shrink-0">{g.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Templates</h3>
            <div className="space-y-2">
              {["Product Launch Email", "Social Media Campaign", "Blog Introduction", "Ad Copy"].map((t) => (
                <button key={t} className="w-full text-left p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
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
