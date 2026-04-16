import type { DocSection } from "../types";

export const agentUniverse: DocSection = {
  slug: "agents",
  title: "Agent Universe",
  icon: "Globe",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Agent Universe",
          id: "agent-universe",
        },
        {
          type: "paragraph",
          text: "The Agent Universe is Lumicoria's collection of 21 purpose-built AI agents. Each agent is specialized for a specific domain and equipped with the right tools, prompts, and LLM to deliver expert-level results.",
        },
        {
          type: "heading",
          level: 3,
          text: "Agent categories",
          id: "categories",
        },
        {
          type: "paragraph",
          text: "Agents are organized into functional categories:",
        },
        {
          type: "capabilities",
          items: [
            { icon: "FileText", title: "Productivity & Workflow", description: "Document Agent, Meeting Assistant, Meeting Fact Checker, RAG Agent" },
            { icon: "Search", title: "Research & Learning", description: "Research Agent, Research Mentor, Student Agent, Learning Coach" },
            { icon: "BarChart3", title: "Intelligence & Analysis", description: "Data Analysis, Knowledge Graph, Vision Agent, Ethics & Bias" },
            { icon: "Scale", title: "Legal & Compliance", description: "Legal Document Agent" },
            { icon: "Heart", title: "Wellbeing & Focus", description: "Wellbeing Coach, Focus Flow, Workspace Ergonomics" },
            { icon: "Palette", title: "Creative & Communication", description: "Creative Agent, Social Media, Translation, Customer Service" },
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Multi-model powered",
          text: "Each agent automatically selects the best LLM for its task. Research agents use Perplexity for live web search, creative agents use GPT-4 for nuanced writing, and analysis agents use Gemini for structured reasoning.",
        },
        {
          type: "heading",
          level: 3,
          text: "How to get started with an agent",
          id: "get-started",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Navigate to the [Agent Universe](/agents) from the main navigation",
            "Browse agents by category or search for a specific capability",
            "Click any agent card to see its description and features",
            "Click **Open Agent** to launch the agent's workspace",
            "Follow the on-screen prompts — each agent guides you through its workflow",
          ],
        },
        {
          type: "live-link",
          label: "Open Agent Universe",
          href: "/agents",
          description: "Browse all 21 agents and find the right one for your task.",
        },
      ],
    },
  ],
};
