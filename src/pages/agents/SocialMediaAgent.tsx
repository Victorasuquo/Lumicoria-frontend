import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Share2, Send, TrendingUp, Heart, MessageCircle, Eye,
  Calendar, BarChart3, Hash, Clock, Globe, Zap,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const platforms = [
  { id: "twitter", label: "X (Twitter)", color: "bg-gray-900", maxChars: 280 },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-600", maxChars: 3000 },
  { id: "instagram", label: "Instagram", color: "bg-pink-500", maxChars: 2200 },
  { id: "facebook", label: "Facebook", color: "bg-blue-500", maxChars: 63206 },
];

const modes = [
  { id: "content_generation", label: "Generate", icon: Zap },
  { id: "trend_analysis", label: "Trends", icon: TrendingUp },
  { id: "scheduling", label: "Schedule", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const mockPosts = [
  { platform: "X (Twitter)", content: "Just shipped our AI agent platform 🚀 20 specialized agents that actually understand your workflow. Not just another chatbot.", likes: 142, comments: 23, views: "4.2K", time: "2h ago", status: "Published" },
  { platform: "LinkedIn", content: "Excited to announce Lumicoria's latest milestone — our multi-agent system now processes 10M+ requests daily...", likes: 89, comments: 12, views: "1.8K", time: "5h ago", status: "Published" },
  { platform: "Instagram", content: "Behind the scenes of building the future of AI agents ✨ #AI #Startup #Innovation", likes: 256, comments: 34, views: "6.1K", time: "1d ago", status: "Published" },
];

const scheduledPosts = [
  { platform: "X (Twitter)", content: "Thread: 5 ways AI agents are transforming...", date: "Mar 17", time: "10:00 AM" },
  { platform: "LinkedIn", content: "Our approach to responsible AI...", date: "Mar 18", time: "9:00 AM" },
  { platform: "Instagram", content: "Team spotlight: Meet our ML engineers...", date: "Mar 19", time: "12:00 PM" },
];

const trendingTopics = [
  { tag: "#AIAgents", posts: "12.4K", trend: "+45%" },
  { tag: "#ProductivityAI", posts: "8.2K", trend: "+32%" },
  { tag: "#FutureOfWork", posts: "24.1K", trend: "+18%" },
  { tag: "#MachineLearning", posts: "45.3K", trend: "+12%" },
];

const SocialMediaAgent: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState("twitter");
  const [activeMode, setActiveMode] = useState("content_generation");
  const [postContent, setPostContent] = useState("");
  const currentPlatform = platforms.find(p => p.id === activePlatform)!;

  return (
    <AgentPageLayout agentName="Social Media Agent" tagline="Create & manage social content" icon={Share2} gradient="from-pink-500 to-rose-600">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Reach", value: "24.8K", icon: Eye, color: "text-blue-500" },
          { label: "Engagement", value: "8.2%", icon: Heart, color: "text-rose-500" },
          { label: "Posts This Week", value: "12", icon: Send, color: "text-emerald-500" },
          { label: "Scheduled", value: "5", icon: Calendar, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {modes.map((m) => (
          <button key={m.id} onClick={() => setActiveMode(m.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeMode === m.id ? "bg-gray-900 text-white" : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"}`}>
            <m.icon size={12} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Composer */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Post Composer</h3>
              <div className="flex gap-1">
                {platforms.map((p) => (
                  <button key={p.id} onClick={() => setActivePlatform(p.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${activePlatform === p.id ? `${p.color} text-white` : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={`Write your ${currentPlatform.label} post...`} className="min-h-[120px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-2" />
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] ${postContent.length > currentPlatform.maxChars ? "text-red-500" : "text-gray-400"}`}>{postContent.length} / {currentPlatform.maxChars}</span>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-[10px] border-gray-200">
                    <Zap size={10} className="mr-1" /> AI Enhance
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-[10px] border-gray-200">
                    <Hash size={10} className="mr-1" /> Hashtags
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                  <Send size={12} className="mr-1.5" /> Publish Now
                </Button>
                <Button variant="outline" className="border-gray-200 h-9 px-4 text-xs">
                  <Calendar size={12} className="mr-1.5" /> Schedule
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Posts</h3></div>
            <div className="divide-y divide-gray-50">
              {mockPosts.map((post, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{post.platform}</Badge>
                    <span className="text-[10px] text-gray-400">{post.time}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 text-emerald-600 bg-emerald-50 ml-auto">{post.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{post.content}</p>
                  <div className="flex gap-4">
                    {[
                      { icon: Heart, value: post.likes },
                      { icon: MessageCircle, value: post.comments },
                      { icon: Eye, value: post.views },
                    ].map((m, j) => (
                      <div key={j} className="flex items-center gap-1 text-gray-400">
                        <m.icon size={12} />
                        <span className="text-[10px]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trending */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-pink-500" />
              <h3 className="text-sm font-semibold text-gray-900">Trending Topics</h3>
            </div>
            <div className="space-y-2">
              {trendingTopics.map((t, i) => (
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

          {/* Scheduled */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Scheduled</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{scheduledPosts.length} upcoming</Badge>
            </div>
            <div className="divide-y divide-gray-50">
              {scheduledPosts.map((p, i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <Clock size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{p.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{p.platform}</span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">{p.date} at {p.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Times */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Best Posting Times</h3>
            <div className="space-y-2">
              {[
                { day: "Tuesday", time: "10:00 AM", engagement: "High" },
                { day: "Thursday", time: "2:00 PM", engagement: "High" },
                { day: "Saturday", time: "11:00 AM", engagement: "Medium" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-gray-400" />
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
