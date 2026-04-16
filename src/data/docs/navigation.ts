import type { SidebarNavGroup } from "./types";

export const docsNavigation: SidebarNavGroup[] = [
  {
    title: "Getting Started",
    slug: "getting-started",
    icon: "Rocket",
    expandable: false,
    children: [
      { title: "Introduction", slug: "getting-started" },
    ],
  },
  {
    title: "Agents",
    slug: "agents",
    icon: "Bot",
    expandable: true,
    children: [
      { title: "Agent Universe", slug: "agents", icon: "Globe" },
      { title: "Document Agent", slug: "agents/document", icon: "FileText" },
      { title: "Meeting Assistant", slug: "agents/meeting", icon: "Users" },
      { title: "Meeting Fact Checker", slug: "agents/meeting-fact-checker", icon: "Shield" },
      { title: "Vision Agent", slug: "agents/vision", icon: "Eye" },
      { title: "Research Agent", slug: "agents/research", icon: "Search" },
      { title: "Research Mentor", slug: "agents/research-mentor", icon: "GraduationCap" },
      { title: "Student Agent", slug: "agents/student", icon: "BookOpen" },
      { title: "Learning Coach", slug: "agents/learning-coach", icon: "Brain" },
      { title: "RAG Agent", slug: "agents/rag", icon: "Database" },
      { title: "Data Analysis Agent", slug: "agents/data-analysis", icon: "BarChart3" },
      { title: "Knowledge Graph Agent", slug: "agents/knowledge-graph", icon: "Network" },
      { title: "Legal Document Agent", slug: "agents/legal-document", icon: "Scale" },
      { title: "Ethics & Bias Agent", slug: "agents/ethics-bias", icon: "ShieldCheck" },
      { title: "Wellbeing Coach", slug: "agents/wellbeing", icon: "Heart" },
      { title: "Focus Flow Agent", slug: "agents/focus-flow", icon: "Target" },
      { title: "Workspace Ergonomics", slug: "agents/workspace-ergonomics", icon: "Monitor" },
      { title: "Creative Agent", slug: "agents/creative", icon: "Palette" },
      { title: "Social Media Agent", slug: "agents/social-media", icon: "Share2" },
      { title: "Translation Agent", slug: "agents/translation", icon: "Languages" },
      { title: "Customer Service Agent", slug: "agents/customer-service", icon: "Headphones" },
    ],
  },
  {
    title: "Platform",
    slug: "platform",
    icon: "Layers",
    expandable: true,
    children: [
      { title: "Available Models", slug: "available-models", icon: "Cpu" },
      { title: "Integrations", slug: "integrations", icon: "Plug" },
      { title: "How to Create Agents", slug: "how-to-create-agents", icon: "Wrench" },
    ],
  },
];
