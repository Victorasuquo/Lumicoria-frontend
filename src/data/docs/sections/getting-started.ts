import type { DocSection } from "../types";

export const gettingStarted: DocSection = {
  slug: "getting-started",
  title: "Getting Started",
  icon: "Rocket",
  subpages: [
    {
      slug: "introduction",
      title: "Introduction",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Welcome to Lumicoria AI",
          id: "welcome",
        },
        {
          type: "paragraph",
          text: "Lumicoria AI is an intelligent agent platform that brings the power of specialized AI agents to professionals, students, researchers, and teams. Each agent is purpose-built for a specific domain — from document analysis and meeting transcription to legal review and creative writing.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "New here?",
          text: "Start by exploring the [Agent Universe](/agents) to see all available agents, then try one that matches your workflow. No setup required — just sign in and start using any agent.",
        },
        {
          type: "heading",
          level: 3,
          text: "What makes Lumicoria different",
          id: "what-makes-lumicoria-different",
        },
        {
          type: "list",
          items: [
            "**21 specialized agents** — each fine-tuned for its domain, not a generic chatbot",
            "**Multi-model architecture** — agents use the best LLM for their task (Gemini, GPT-4, Claude, Perplexity, DeepSeek)",
            "**Persistent memory** — your work is saved to the cloud, survives browser refresh, accessible across devices",
            "**Real integrations** — Google Workspace, Slack, Salesforce, and more built-in",
            "**Privacy-first** — your data stays in your workspace, never used for training",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Platform overview",
          id: "platform-overview",
        },
        {
          type: "paragraph",
          text: "The platform is organized into several key areas:",
        },
        {
          type: "capabilities",
          items: [
            {
              icon: "Bot",
              title: "AI Agents",
              description: "21 specialized agents across productivity, research, creativity, wellbeing, and more.",
            },
            {
              icon: "MessageSquare",
              title: "Chat",
              description: "Conversational interface to interact with any agent using natural language.",
            },
            {
              icon: "FileText",
              title: "Documents",
              description: "Upload, analyze, and manage documents with AI-powered insights.",
            },
            {
              icon: "Workflow",
              title: "Agent Builder",
              description: "Create custom agents with your own prompts, tools, and workflows.",
            },
            {
              icon: "Plug",
              title: "Integrations",
              description: "Connect Google Drive, Slack, Salesforce, and other tools you already use.",
            },
            {
              icon: "BarChart3",
              title: "Dashboard",
              description: "Track usage, monitor agent performance, and manage your workspace.",
            },
          ],
        },
        {
          type: "live-link",
          label: "Explore all agents",
          href: "/agents",
          description: "Browse the Agent Universe to find the right agent for your task.",
        },
      ],
    },
  ],
};
