/**
 * Agent Documentation Template
 *
 * Copy this file, rename to {agent-slug}.ts, and fill in the content.
 * Then import and add it to the array in agents/index.ts.
 *
 * Subpages: minimum 3 (Overview, Capabilities, How to Use)
 * Screenshots: use external URLs, 2-5 per agent
 * Live links: point to the agent's actual page (e.g. /agents/document)
 */

import type { AgentDocEntry } from "../types";

export const templateAgent: AgentDocEntry = {
  slug: "agent-slug",              // URL slug — must match the route in App.tsx
  name: "Agent Display Name",
  tagline: "One-line description of what this agent does.",
  icon: "LucideIconName",          // e.g. FileText, Search, Scale
  gradient: "from-purple-500 to-indigo-600",  // tailwind gradient
  agentPath: "/agents/agent-slug", // link to the live agent page
  category: "productivity",        // productivity | research | data | legal-ethics | wellbeing | creative | communication
  subpages: [
    // ── Subpage 1: Overview (always first) ────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Agent Display Name", id: "overview" },
        {
          type: "paragraph",
          text: "Describe the agent — what it does, who it's for, and what problems it solves.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "Explain the motivation. What gap does this agent fill? What was the pain point?",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Brief instructions to get started immediately.",
        },
        {
          type: "screenshot",
          url: "https://placeholder.com/agent-overview.png",
          alt: "Agent overview screenshot",
          caption: "The agent's main interface",
        },
        {
          type: "live-link",
          label: "Try Agent Display Name",
          href: "/agents/agent-slug",
          description: "Open the agent and start working.",
        },
      ],
    },
    // ── Subpage 2: Capabilities ───────────────────────────────────
    {
      slug: "capabilities",
      title: "Capabilities",
      content: [
        { type: "heading", level: 2, text: "Capabilities & Features", id: "capabilities" },
        {
          type: "capabilities",
          items: [
            { icon: "Sparkles", title: "Feature 1", description: "Description of feature 1." },
            { icon: "Zap", title: "Feature 2", description: "Description of feature 2." },
            { icon: "Shield", title: "Feature 3", description: "Description of feature 3." },
            { icon: "Globe", title: "Feature 4", description: "Description of feature 4." },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Supported formats",
          id: "formats",
        },
        {
          type: "list",
          items: [
            "Format 1",
            "Format 2",
            "Format 3",
          ],
        },
        {
          type: "screenshot",
          url: "https://placeholder.com/agent-capabilities.png",
          alt: "Agent capabilities",
          caption: "Feature in action",
        },
      ],
    },
    // ── Subpage 3: How to Use ─────────────────────────────────────
    {
      slug: "how-to-use",
      title: "How to Use",
      content: [
        { type: "heading", level: 2, text: "How to Use", id: "how-to-use" },
        {
          type: "list",
          ordered: true,
          items: [
            "Step 1: Navigate to the agent page",
            "Step 2: Enter your input",
            "Step 3: Click the action button",
            "Step 4: Review the results",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Pro tip",
          text: "A useful tip for getting better results.",
        },
        {
          type: "screenshot",
          url: "https://placeholder.com/agent-usage.png",
          alt: "Step-by-step usage",
          caption: "Following the workflow",
        },
        {
          type: "live-link",
          label: "Try it now",
          href: "/agents/agent-slug",
          description: "Open the agent and follow these steps.",
        },
      ],
    },
  ],
};
