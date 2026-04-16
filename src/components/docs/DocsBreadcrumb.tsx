import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { agentDocs } from "@/data/docs/agents";
import { docSections } from "@/data/docs/sections/index";

// Build display names for path segments
const getDisplayName = (segment: string, fullPath: string): string => {
  // Check agent docs
  const agent = agentDocs.find((a) => a.slug === segment);
  if (agent) return agent.name;

  // Check section docs
  const section = docSections.find((s) => s.slug === segment);
  if (section) return section.title;

  // Check agent subpages
  if (fullPath.includes("/agents/")) {
    const parts = fullPath.split("/");
    const agentSlug = parts[parts.indexOf("agents") + 1];
    const agentDoc = agentDocs.find((a) => a.slug === agentSlug);
    const subpage = agentDoc?.subpages.find((s) => s.slug === segment);
    if (subpage) return subpage.title;
  }

  // Fallback: format slug
  const names: Record<string, string> = {
    docs: "Docs",
    agents: "Agents",
    "getting-started": "Getting Started",
    "available-models": "Available Models",
    integrations: "Integrations",
    "how-to-create-agents": "How to Create Agents",
  };
  return names[segment] || segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const DocsBreadcrumb: React.FC = () => {
  const { pathname } = useLocation();
  const segments = pathname.replace("/docs", "").split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-6 flex-wrap">
      <Link to="/docs" className="hover:text-lumicoria-purple transition-colors flex items-center gap-1">
        <Home size={12} />
        <span>Docs</span>
      </Link>
      {segments.map((seg, i) => {
        const path = "/docs/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const name = getDisplayName(seg, pathname);

        return (
          <React.Fragment key={path}>
            <ChevronRight size={11} className="text-gray-300" />
            {isLast ? (
              <span className="text-gray-700 font-medium">{name}</span>
            ) : (
              <Link to={path} className="hover:text-lumicoria-purple transition-colors">{name}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default DocsBreadcrumb;
