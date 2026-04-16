import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsContentRenderer from "@/components/docs/DocsContentRenderer";
import DocsPagination from "@/components/docs/DocsPagination";
import { agentDocs, getAgentDoc } from "@/data/docs/agents";

const resolveIcon = (name: string) => {
  const Comp = (Icons as Record<string, React.FC<{ size?: number; className?: string }>>)[name];
  return Comp || Icons.Bot;
};

const DocsAgentPage: React.FC = () => {
  const { agentSlug, subpageSlug } = useParams<{ agentSlug: string; subpageSlug?: string }>();
  const agent = getAgentDoc(agentSlug || "");

  // Agent doc not written yet — show placeholder
  if (!agent) {
    return (
      <div className="max-w-3xl">
        <DocsBreadcrumb />
        <div className="text-center py-16">
          <Icons.FileQuestion size={32} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Documentation coming soon</h2>
          <p className="text-sm text-gray-400 mb-6">
            We're working on detailed documentation for this agent. Check back soon!
          </p>
          <Link
            to={`/agents/${agentSlug}`}
            className="inline-flex items-center gap-2 text-sm text-lumicoria-purple hover:underline"
          >
            Try the agent directly <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  // Resolve current subpage
  const currentSubpage = subpageSlug
    ? agent.subpages.find((s) => s.slug === subpageSlug)
    : agent.subpages[0];

  if (!currentSubpage) {
    return <Navigate to={`/docs/agents/${agent.slug}`} replace />;
  }

  const currentIndex = agent.subpages.indexOf(currentSubpage);
  const AgentIcon = resolveIcon(agent.icon);

  // Build pagination
  const prevSubpage = currentIndex > 0 ? agent.subpages[currentIndex - 1] : null;
  const nextSubpage = currentIndex < agent.subpages.length - 1 ? agent.subpages[currentIndex + 1] : null;

  // Cross-agent pagination (next/prev agent when at boundaries)
  const agentIndex = agentDocs.indexOf(agent);
  const prevAgent = !prevSubpage && agentIndex > 0 ? agentDocs[agentIndex - 1] : null;
  const nextAgent = !nextSubpage && agentIndex < agentDocs.length - 1 ? agentDocs[agentIndex + 1] : null;

  const prevLink = prevSubpage
    ? { label: prevSubpage.title, href: `/docs/agents/${agent.slug}/${prevSubpage.slug}` }
    : prevAgent
      ? { label: prevAgent.name, href: `/docs/agents/${prevAgent.slug}` }
      : null;

  const nextLink = nextSubpage
    ? { label: nextSubpage.title, href: `/docs/agents/${agent.slug}/${nextSubpage.slug}` }
    : nextAgent
      ? { label: nextAgent.name, href: `/docs/agents/${nextAgent.slug}` }
      : null;

  return (
    <div className="max-w-3xl">
      <DocsBreadcrumb />

      {/* Agent header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-sm`}>
          <AgentIcon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
          <p className="text-sm text-gray-400">{agent.tagline}</p>
        </div>
        <Link
          to={agent.agentPath}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-lumicoria-purple bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Try it <ArrowRight size={11} />
        </Link>
      </motion.div>

      {/* Subpage tabs */}
      {agent.subpages.length > 1 && (
        <div className="flex items-center gap-1 border-b border-gray-100 mb-8 overflow-x-auto">
          {agent.subpages.map((sp) => {
            const isActive = sp.slug === currentSubpage.slug;
            return (
              <Link
                key={sp.slug}
                to={`/docs/agents/${agent.slug}/${sp.slug}`}
                className={`px-3 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-lumicoria-purple text-lumicoria-purple"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                {sp.title}
              </Link>
            );
          })}
        </div>
      )}

      {/* Content */}
      <motion.div
        key={currentSubpage.slug}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <DocsContentRenderer blocks={currentSubpage.content} />
      </motion.div>

      {/* Pagination */}
      <DocsPagination prev={prevLink} next={nextLink} />
    </div>
  );
};

export default DocsAgentPage;
