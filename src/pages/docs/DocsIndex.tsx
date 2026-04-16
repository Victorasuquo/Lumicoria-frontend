import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot, Rocket, Layers, Plug, Cpu, Wrench, FileText, Search,
  Shield, Eye, Scale, Heart, Palette, ArrowRight,
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    description: "Learn the basics of Lumicoria AI and set up your workspace.",
    icon: Rocket,
    href: "/docs/getting-started",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Agents",
    description: "Explore all 21 AI agents — what they do, how to use them, and when to use each one.",
    icon: Bot,
    href: "/docs/agents",
    color: "from-lumicoria-purple to-indigo-600",
  },
  {
    title: "Available Models",
    description: "Gemini, GPT-4, Claude, Perplexity, DeepSeek — understand the models powering each agent.",
    icon: Cpu,
    href: "/docs/available-models",
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Integrations",
    description: "Connect Google Workspace, Slack, Salesforce, and other tools to your agents.",
    icon: Plug,
    href: "/docs/integrations",
    color: "from-orange-500 to-amber-600",
  },
  {
    title: "How to Create Agents",
    description: "Build custom agents with the Agent Builder — define prompts, tools, and workflows.",
    icon: Wrench,
    href: "/docs/how-to-create-agents",
    color: "from-pink-500 to-rose-600",
  },
];

const featuredAgents = [
  { name: "Document Agent", icon: FileText, slug: "document", color: "text-blue-500" },
  { name: "Research Agent", icon: Search, slug: "research", color: "text-indigo-500" },
  { name: "Vision Agent", icon: Eye, slug: "vision", color: "text-purple-500" },
  { name: "Fact Checker", icon: Shield, slug: "meeting-fact-checker", color: "text-red-500" },
  { name: "Legal Agent", icon: Scale, slug: "legal-document", color: "text-slate-500" },
  { name: "Wellbeing Coach", icon: Heart, slug: "wellbeing", color: "text-pink-500" },
  { name: "Creative Agent", icon: Palette, slug: "creative", color: "text-fuchsia-500" },
];

const DocsIndex: React.FC = () => {
  return (
    <div className="max-w-4xl">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Lumicoria AI Documentation
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Everything you need to know about our AI agent platform — from getting started to advanced customization.
        </p>
      </motion.div>

      {/* Section cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {sections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={section.href}
              className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                <section.icon size={18} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-lumicoria-purple transition-colors">
                {section.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{section.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Featured agents */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular agents</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredAgents.map((agent) => (
            <Link
              key={agent.slug}
              to={`/docs/agents/${agent.slug}`}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <agent.icon size={15} className={agent.color} />
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 truncate">
                {agent.name}
              </span>
              <ArrowRight size={10} className="text-gray-300 ml-auto shrink-0 group-hover:text-gray-500" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DocsIndex;
