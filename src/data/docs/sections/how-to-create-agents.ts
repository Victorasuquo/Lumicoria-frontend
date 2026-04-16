import type { DocSection } from "../types";

export const howToCreateAgents: DocSection = {
  slug: "how-to-create-agents",
  title: "How to Create Agents",
  icon: "Wrench",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        {
          type: "heading",
          level: 2,
          text: "How to Create Custom Agents",
          id: "create-agents",
        },
        {
          type: "paragraph",
          text: "Beyond the 21 built-in agents, Lumicoria lets you create your own custom agents using the Agent Builder. Define custom prompts, select models, configure tools, and share agents with your team.",
        },
        {
          type: "heading",
          level: 3,
          text: "Using the Agent Builder",
          id: "agent-builder",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Navigate to the [Agent Builder](/agent-builder) from the sidebar or agents page",
            "Give your agent a **name**, **description**, and **icon**",
            "Write a **system prompt** that defines your agent's personality and expertise",
            "Select the **base model** (Gemini, GPT-4, Claude, etc.)",
            "Configure **tools** your agent can access (web search, file access, code execution)",
            "Set **parameters** like temperature, max tokens, and response format",
            "Test your agent in the preview panel",
            "Click **Publish** to make it available in your workspace",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Best practices",
          text: "Be specific in your system prompt. Instead of \"You are a helpful assistant\", try \"You are a senior tax accountant specializing in US corporate tax law. Always cite IRC sections.\" The more context you give, the better the agent performs.",
        },
        {
          type: "heading",
          level: 3,
          text: "Agent capabilities",
          id: "capabilities",
        },
        {
          type: "capabilities",
          items: [
            { icon: "MessageSquare", title: "Custom System Prompts", description: "Define exactly how your agent should behave, respond, and what expertise it should demonstrate." },
            { icon: "Cpu", title: "Model Selection", description: "Choose from 5+ LLM providers. Pick the best model for your agent's specific task." },
            { icon: "Wrench", title: "Tool Access", description: "Enable web search, file upload, code execution, and API integrations for your agent." },
            { icon: "Share2", title: "Team Sharing", description: "Publish agents to your organization so your entire team can use them." },
          ],
        },
        {
          type: "live-link",
          label: "Open Agent Builder",
          href: "/agent-builder",
          description: "Start building your own custom AI agent in minutes.",
        },
      ],
    },
  ],
};
