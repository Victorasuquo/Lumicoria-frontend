import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  FileText,
  Heart,
  Camera,
  Calendar,
  Sparkles,
  GraduationCap,
  Database,
  Shield,
  Globe,
  Lightbulb,
  BookOpen,
  Scale,
  Brain,
  Target,
  Armchair,
  Languages,
  Headphones,
  BarChart3,
  Share2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Play,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface AgentDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  features: string[];
  status: "stable" | "beta";
}

interface AgentGroup {
  id: string;
  title: string;
  subtitle: string;
  agents: AgentDef[];
}

/* ═══════════════════════════════════════════════════════════════════
   Agent data — grouped by domain
   ═══════════════════════════════════════════════════════════════════ */

const agentGroups: AgentGroup[] = [
  {
    id: "productivity",
    title: "Productivity & Workflow",
    subtitle: "Automate the tedious. Focus on what matters.",
    agents: [
      {
        id: "document",
        name: "Document Agent",
        tagline: "Intelligent document processing",
        description:
          "Automatically extract, classify, and process information from any document format. Creates tasks, calendar events, and structured data from unstructured content.",
        icon: FileText,
        gradient: "from-violet-500 to-purple-600",
        accentColor: "text-violet-500",
        features: ["OCR & Data Extraction", "Task Generation", "Calendar Integration", "Smart Classification", "Multi-format Support"],
        status: "stable",
      },
      {
        id: "meeting",
        name: "Meeting Assistant",
        tagline: "Never miss a detail",
        description:
          "Captures meeting notes in real-time, extracts action items, identifies key decisions, and automatically schedules follow-ups with full context.",
        icon: Calendar,
        gradient: "from-emerald-500 to-teal-600",
        accentColor: "text-emerald-500",
        features: ["Live Transcription", "Action Item Extraction", "Decision Tracking", "Follow-up Scheduling", "Meeting Analytics"],
        status: "stable",
      },
      {
        id: "meeting-fact-checker",
        name: "Fact Checker",
        tagline: "Truth in every statement",
        description:
          "Real-time fact verification during meetings and content review. Cross-references claims against trusted sources and flags inaccuracies instantly.",
        icon: Shield,
        gradient: "from-red-500 to-rose-600",
        accentColor: "text-red-500",
        features: ["Real-time Verification", "Source Cross-referencing", "Confidence Scoring", "Claim Tracking", "Report Generation"],
        status: "stable",
      },
      {
        id: "vision",
        name: "Vision Agent",
        tagline: "See and understand the world",
        description:
          "Real-time camera-based analysis for document scanning, workspace monitoring, object recognition, and instant intelligent task creation from visual input.",
        icon: Camera,
        gradient: "from-sky-500 to-cyan-600",
        accentColor: "text-sky-500",
        features: ["Live Scanning", "Object Recognition", "Workspace Analysis", "Visual Q&A", "Real-time Processing"],
        status: "stable",
      },
    ],
  },
  {
    id: "research",
    title: "Research & Learning",
    subtitle: "From curiosity to mastery, accelerated by AI.",
    agents: [
      {
        id: "research",
        name: "Research Agent",
        tagline: "Deep-dive into any topic",
        description:
          "Autonomous research agent that scours the web, academic databases, and internal documents to compile comprehensive, structured research reports.",
        icon: Globe,
        gradient: "from-blue-500 to-indigo-600",
        accentColor: "text-blue-500",
        features: ["Web Research", "Academic Search", "Report Generation", "Source Evaluation", "Trend Analysis"],
        status: "stable",
      },
      {
        id: "research-mentor",
        name: "Research Mentor",
        tagline: "Guided research excellence",
        description:
          "Expert research methodology guide that helps frame hypotheses, design studies, evaluate sources, and structure findings for publication.",
        icon: Lightbulb,
        gradient: "from-yellow-500 to-amber-600",
        accentColor: "text-yellow-500",
        features: ["Methodology Guidance", "Hypothesis Framing", "Source Evaluation", "Writing Assistance", "Peer Review Prep"],
        status: "stable",
      },
      {
        id: "student",
        name: "Student Agent",
        tagline: "Your academic companion",
        description:
          "Personalized learning assistant that adapts to your study style, creates flashcards, generates practice quizzes, and tracks academic progress.",
        icon: GraduationCap,
        gradient: "from-indigo-500 to-blue-600",
        accentColor: "text-indigo-500",
        features: ["Adaptive Learning", "Flashcard Generation", "Quiz Creation", "Progress Tracking", "Study Planning"],
        status: "stable",
      },
      {
        id: "learning-coach",
        name: "Learning Coach",
        tagline: "Master any skill faster",
        description:
          "Adaptive learning coach that creates personalized curricula, identifies knowledge gaps, and dynamically adjusts difficulty based on your progress.",
        icon: BookOpen,
        gradient: "from-teal-500 to-emerald-600",
        accentColor: "text-teal-500",
        features: ["Personalized Curriculum", "Gap Analysis", "Adaptive Difficulty", "Progress Metrics", "Resource Curation"],
        status: "stable",
      },
    ],
  },
  {
    id: "analysis",
    title: "Intelligence & Analysis",
    subtitle: "Turn raw data into decisions.",
    agents: [
      {
        id: "rag",
        name: "RAG Agent",
        tagline: "Knowledge at your fingertips",
        description:
          "Retrieval-Augmented Generation agent that searches your private knowledge base to deliver accurate, contextual, citation-backed answers.",
        icon: Database,
        gradient: "from-purple-500 to-fuchsia-600",
        accentColor: "text-purple-500",
        features: ["Semantic Search", "Citation Tracking", "Context Windows", "Multi-source Fusion", "Knowledge Indexing"],
        status: "stable",
      },
      {
        id: "data-analysis",
        name: "Data Analysis Agent",
        tagline: "Insights from your data",
        description:
          "Transforms raw data into actionable insights with automated visualization, statistical analysis, anomaly detection, and natural language reporting.",
        icon: BarChart3,
        gradient: "from-blue-500 to-violet-600",
        accentColor: "text-blue-500",
        features: ["Auto Visualization", "Statistical Analysis", "Anomaly Detection", "NL Reporting", "Data Cleaning"],
        status: "stable",
      },
      {
        id: "knowledge-graph",
        name: "Knowledge Graph",
        tagline: "Connect the dots",
        description:
          "Builds and navigates knowledge graphs from your data, revealing hidden connections, dependencies, and insights across your information ecosystem.",
        icon: Brain,
        gradient: "from-fuchsia-500 to-purple-600",
        accentColor: "text-fuchsia-500",
        features: ["Graph Construction", "Relationship Mapping", "Pattern Discovery", "Visual Exploration", "Query Interface"],
        status: "beta",
      },
      {
        id: "legal-document",
        name: "Legal Document Agent",
        tagline: "Legal clarity simplified",
        description:
          "Analyzes contracts, identifies key clauses, flags potential risks, and generates plain-language summaries of complex legal documents.",
        icon: Scale,
        gradient: "from-slate-500 to-gray-600",
        accentColor: "text-slate-500",
        features: ["Contract Analysis", "Risk Identification", "Clause Extraction", "Plain-language Summary", "Comparison Tools"],
        status: "stable",
      },
      {
        id: "ethics-bias",
        name: "Ethics & Bias Agent",
        tagline: "Fair and responsible AI",
        description:
          "Audits content, datasets, and AI outputs for ethical concerns, bias patterns, and fairness issues with actionable mitigation recommendations.",
        icon: Shield,
        gradient: "from-green-500 to-emerald-600",
        accentColor: "text-green-500",
        features: ["Bias Detection", "Fairness Auditing", "Content Screening", "Impact Assessment", "Compliance Checks"],
        status: "beta",
      },
    ],
  },
  {
    id: "wellbeing",
    title: "Well-being & Focus",
    subtitle: "Work better by feeling better.",
    agents: [
      {
        id: "wellbeing",
        name: "Well-being Coach",
        tagline: "Your personal wellness guardian",
        description:
          "Monitors your workload patterns, screen time, and posture to deliver personalized breaks, guided exercises, and proactive well-being recommendations.",
        icon: Heart,
        gradient: "from-rose-500 to-pink-600",
        accentColor: "text-rose-500",
        features: ["Activity Monitoring", "Break Reminders", "Guided Exercises", "Workload Analysis", "Stress Detection"],
        status: "stable",
      },
      {
        id: "focus-flow",
        name: "Focus & Flow",
        tagline: "Achieve deep work",
        description:
          "Optimizes your work environment for deep focus sessions. Manages distractions, schedules flow blocks, and tracks your productivity patterns.",
        icon: Target,
        gradient: "from-orange-500 to-red-600",
        accentColor: "text-orange-500",
        features: ["Distraction Blocking", "Flow Scheduling", "Focus Analytics", "Environment Tuning", "Session Reports"],
        status: "stable",
      },
      {
        id: "workspace-ergonomics",
        name: "Workspace Ergonomics",
        tagline: "Optimize your setup",
        description:
          "Monitors and improves your physical workspace setup with posture corrections, desk arrangement tips, and ergonomic health scoring.",
        icon: Armchair,
        gradient: "from-lime-500 to-green-600",
        accentColor: "text-lime-500",
        features: ["Posture Monitoring", "Desk Setup Analysis", "Health Scoring", "Equipment Recs", "Habit Tracking"],
        status: "beta",
      },
    ],
  },
  {
    id: "communication",
    title: "Creative & Communication",
    subtitle: "Create, translate, and connect — effortlessly.",
    agents: [
      {
        id: "creative",
        name: "Creative Agent",
        tagline: "Amplify your creativity",
        description:
          "AI-powered creative partner for brainstorming, content generation, visual ideation, and iterative refinement of creative projects across any medium.",
        icon: Sparkles,
        gradient: "from-amber-500 to-orange-600",
        accentColor: "text-amber-500",
        features: ["Content Generation", "Brainstorming", "Style Transfer", "Iterative Refinement", "Multi-modal Output"],
        status: "stable",
      },
      {
        id: "social-media",
        name: "Social Media Agent",
        tagline: "Engage your audience",
        description:
          "Multi-platform social media manager that drafts posts, analyzes engagement, suggests optimal posting times, and maintains brand voice consistency.",
        icon: Share2,
        gradient: "from-pink-500 to-rose-600",
        accentColor: "text-pink-500",
        features: ["Content Drafting", "Engagement Analytics", "Scheduling", "Brand Voice", "Multi-platform Support"],
        status: "stable",
      },
      {
        id: "translation",
        name: "Translation Agent",
        tagline: "Break language barriers",
        description:
          "Context-aware translation across 100+ languages with tone preservation, domain-specific terminology, and real-time conversation translation.",
        icon: Languages,
        gradient: "from-cyan-500 to-blue-600",
        accentColor: "text-cyan-500",
        features: ["100+ Languages", "Context Preservation", "Domain Terminology", "Real-time Mode", "Tone Matching"],
        status: "stable",
      },
      {
        id: "customer-service",
        name: "Customer Service",
        tagline: "Delight every customer",
        description:
          "Intelligent customer support agent that handles inquiries, routes complex issues, maintains conversation history, and continuously learns from interactions.",
        icon: Headphones,
        gradient: "from-violet-500 to-indigo-600",
        accentColor: "text-violet-500",
        features: ["Auto-response", "Smart Routing", "Sentiment Analysis", "Knowledge Base", "Escalation Rules"],
        status: "stable",
      },
    ],
  },
];

const totalAgents = agentGroups.reduce((sum, g) => sum + g.agents.length, 0);

/* ═══════════════════════════════════════════════════════════════════
   Reusable animation wrapper — fades in when scrolled into view
   ═══════════════════════════════════════════════════════════════════ */

function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Single agent card
   ═══════════════════════════════════════════════════════════════════ */

function AgentCard({
  agent,
  index,
  onSelect,
}: {
  agent: AgentDef;
  index: number;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      onClick={onSelect}
      className="group relative cursor-pointer"
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80">
        {/* Icon + status */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white shadow-sm`}
          >
            <agent.icon size={20} />
          </div>
          {agent.status === "beta" && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 border-amber-300 text-amber-600 bg-amber-50 font-medium"
            >
              Beta
            </Badge>
          )}
        </div>

        {/* Name + tagline */}
        <h3 className="text-[15px] font-semibold text-gray-900 mb-1 group-hover:text-lumicoria-purple transition-colors">
          {agent.name}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {agent.tagline}
        </p>

        {/* Features — 3 max */}
        <div className="flex flex-wrap gap-1.5">
          {agent.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-[11px] px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Hover arrow */}
        <div className="absolute bottom-6 right-6 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight size={16} className="text-lumicoria-purple" />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Scrollable side navigation
   ═══════════════════════════════════════════════════════════════════ */

function SideNav({ groups }: { groups: AgentGroup[] }) {
  return (
    <nav className="hidden lg:block sticky top-24 self-start w-48 shrink-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Categories
      </p>
      <ul className="space-y-1">
        {groups.map((g) => (
          <li key={g.id}>
            <a
              href={`#${g.id}`}
              className="block text-[13px] text-gray-500 hover:text-lumicoria-purple py-1.5 px-3 rounded-lg hover:bg-lumicoria-purple/5 transition-colors"
            >
              {g.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

const AgentsUniverse: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-lumicoria-purple/[0.03] blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-5 px-3.5 py-1 text-xs font-medium border-gray-200 text-gray-600 bg-white"
            >
              {totalAgents} purpose-built agents
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl md:text-[56px] font-bold tracking-tight leading-[1.1] text-gray-900 mb-5"
          >
            AI agents that{" "}
            <span className="gradient-text">actually work</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Deploy specialized agents that think, learn, and execute —
            turning hours of manual work into seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 text-sm font-medium"
              onClick={() => navigate("/dashboard")}
            >
              Get started
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 px-8 h-12 text-sm font-medium"
              onClick={() => {
                document.getElementById("productivity")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore agents
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─────────── AGENT GROUPS WITH SIDE NAV ─────────── */}
      <div className="container mx-auto px-4 pb-32">
        <div className="flex gap-12">
          <SideNav groups={agentGroups} />

          <div className="flex-1 min-w-0 space-y-28">
            {agentGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <FadeInSection>
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                      {group.title}
                    </h2>
                    <p className="text-gray-500 mt-2 text-[15px]">
                      {group.subtitle}
                    </p>
                  </div>
                  <Separator className="mb-8 bg-gray-100" />
                </FadeInSection>

                <div
                  className={`grid gap-4 ${
                    group.agents.length <= 3
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                  }`}
                >
                  {group.agents.map((agent, i) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      index={i}
                      onSelect={() => setSelectedAgent(agent)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────── INTERACTIVE DEMO TEASER ─────────── */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <FadeInSection>
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                {/* Left — text */}
                <div className="flex-1 text-center md:text-left">
                  <Badge
                    variant="outline"
                    className="mb-4 text-xs border-gray-200 text-gray-500 bg-white"
                  >
                    <Zap size={12} className="mr-1.5" />
                    Interactive
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                    See agents in action
                  </h2>
                  <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                    Click on any agent above to see a detailed breakdown of its capabilities,
                    features, and how it fits into your workflow. Or jump straight into the dashboard
                    to deploy one.
                  </p>
                  <Button
                    className="bg-gray-900 hover:bg-gray-800 text-white h-11 px-6 text-sm"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Play size={16} className="mr-2" />
                    Try in Dashboard
                  </Button>
                </div>

                {/* Right — mini preview cards stack */}
                <div className="flex-1 max-w-sm w-full">
                  <div className="relative">
                    {[agentGroups[0].agents[0], agentGroups[1].agents[0], agentGroups[2].agents[0]].map(
                      (agent, i) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.5 }}
                          className="relative mb-3 last:mb-0"
                        >
                          <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-4 shadow-sm">
                            <div
                              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white shrink-0`}
                            >
                              <agent.icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {agent.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {agent.tagline}
                              </p>
                            </div>
                            <div className="ml-auto shrink-0">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            </div>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─────────── BUILD YOUR OWN CTA ─────────── */}
      <section className="border-t border-gray-100">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <FadeInSection>
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-6">
                <Bot size={24} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Build your own agent
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-8 max-w-lg mx-auto">
                Use our no-code Agent Builder to design, train, and deploy custom AI agents
                tailored to your unique workflows — no engineering team required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white h-12 px-8 text-sm font-medium"
                  onClick={() => navigate("/agent-builder")}
                >
                  <Sparkles size={16} className="mr-2" />
                  Open Agent Builder
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 h-12 px-8 text-sm font-medium"
                  onClick={() => navigate("/docs")}
                >
                  Read the docs
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════ AGENT DETAIL DIALOG ═══════════ */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        {selectedAgent && (
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${selectedAgent.gradient} p-6`}>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <selectedAgent.icon size={24} />
                  </div>
                  <div>
                    <DialogTitle className="text-white text-lg">
                      {selectedAgent.name}
                    </DialogTitle>
                    <p className="text-white/70 text-sm mt-0.5">
                      {selectedAgent.tagline}
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-5">
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedAgent.description}
              </p>

              <Separator />

              {/* Features */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Capabilities
                </p>
                <div className="space-y-2">
                  {selectedAgent.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-10 text-sm"
                  onClick={() => {
                    setSelectedAgent(null);
                    navigate("/dashboard");
                  }}
                >
                  <Play size={15} className="mr-2" />
                  Deploy
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 h-10 text-sm"
                  onClick={() => setSelectedAgent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AgentsUniverse;
