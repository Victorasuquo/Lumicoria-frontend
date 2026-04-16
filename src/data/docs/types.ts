// ── Documentation content block types ────────────────────────────

export type DocContentBlock =
  | { type: "heading"; level: 2 | 3 | 4; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; variant: "info" | "warning" | "tip"; title: string; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "screenshot"; url: string; alt: string; caption?: string }
  | { type: "capabilities"; items: { icon: string; title: string; description: string }[] }
  | { type: "live-link"; label: string; href: string; description: string }
  | { type: "divider" };

// ── Subpage (a single page within a doc entry) ───────────────────

export interface DocSubpage {
  slug: string;
  title: string;
  content: DocContentBlock[];
}

// ── Agent documentation entry ────────────────────────────────────

export type AgentCategory =
  | "productivity"
  | "research"
  | "data"
  | "legal-ethics"
  | "wellbeing"
  | "creative"
  | "communication";

export interface AgentDocEntry {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  gradient: string;
  agentPath: string;
  category: AgentCategory;
  subpages: DocSubpage[];
}

// ── Generic doc section (non-agent pages) ────────────────────────

export interface DocSection {
  slug: string;
  title: string;
  icon: string;
  subpages: DocSubpage[];
}

// ── Sidebar navigation ──────────────────────────────────────────

export interface SidebarNavItem {
  title: string;
  slug: string;
  icon?: string;
}

export interface SidebarNavGroup {
  title: string;
  slug: string;
  icon: string;
  expandable: boolean;
  children: SidebarNavItem[];
}
