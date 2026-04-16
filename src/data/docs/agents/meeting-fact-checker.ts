import type { AgentDocEntry } from "../types";

export const meetingFactChecker: AgentDocEntry = {
  slug: "meeting-fact-checker",
  name: "Meeting Fact Checker",
  tagline: "Real-time claim verification with live web search — truth in every statement.",
  icon: "Shield",
  gradient: "from-red-500 to-rose-600",
  agentPath: "/agents/meeting-fact-checker",
  category: "productivity",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Meeting Fact Checker", id: "overview" },
        {
          type: "paragraph",
          text: "The Meeting Fact Checker is Lumicoria's real-time verification agent. During meetings, people cite statistics, reference data, and make claims that may or may not be accurate. This agent verifies each claim against live web sources, providing confidence scores, citations, and corrections — all in seconds.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "Misinformation in meetings leads to bad decisions. A CEO might cite a revenue figure from memory, a marketer might reference industry stats that are outdated, or a team lead might claim a competitor launched a feature that doesn't exist. The Fact Checker catches these in real-time, before they become the basis for strategic decisions.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Powered by Perplexity",
          text: "This is the only agent that exclusively uses **Perplexity Sonar** — a model with live web search built in. Unlike other LLMs that rely on training data, Perplexity searches the web in real-time to verify claims against current information.",
        },
        {
          type: "list",
          items: [
            "**Live web verification** — every claim checked against current web sources in real-time",
            "**Clickable citations** — real URLs to sources, not hallucinated references",
            "**Confidence scoring** — 0-100% confidence for each verification",
            "**Session-based workflow** — start a session, verify claims during the meeting, get a summary at the end",
            "**Persistent history** — all sessions and claims saved to Postgres",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&h=700&fit=crop",
          alt: "Fact Checker dashboard",
          caption: "The Fact Checker dashboard with live verification stats and claims feed",
        },
        {
          type: "live-link",
          label: "Try the Fact Checker",
          href: "/agents/meeting-fact-checker",
          description: "Start a fact-checking session and verify claims in real-time.",
        },
      ],
    },
    {
      slug: "capabilities",
      title: "Capabilities",
      content: [
        { type: "heading", level: 2, text: "Capabilities & Features", id: "capabilities" },
        {
          type: "capabilities",
          items: [
            {
              icon: "Globe",
              title: "Live Web Search",
              description: "Powered by Perplexity Sonar — searches the internet in real-time to find current data, press releases, SEC filings, and news articles.",
            },
            {
              icon: "CheckCircle2",
              title: "Multi-Status Verification",
              description: "Claims are rated as Verified, Partially True, Disputed, or Unverifiable — with detailed explanations for each verdict.",
            },
            {
              icon: "Link",
              title: "Clickable Citations",
              description: "Every verification includes real, clickable URLs to the sources used. Expand the sources panel to see all references.",
            },
            {
              icon: "Gauge",
              title: "Confidence Scoring",
              description: "Each claim gets a 0-100% confidence score based on source quality, consensus, and data recency.",
            },
            {
              icon: "AlertTriangle",
              title: "Severity Classification",
              description: "Claims are classified by severity — critical, high, medium, low, or info — based on potential impact if wrong.",
            },
            {
              icon: "FileText",
              title: "Session Summaries",
              description: "End a session to get a comprehensive summary with verification stats, key findings, and corrections.",
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Verification statuses",
          id: "statuses",
        },
        {
          type: "list",
          items: [
            "**Verified** — claim confirmed by multiple reliable sources",
            "**Partially True** — claim is partly accurate but contains inaccuracies or missing context",
            "**Disputed** — claim contradicted by reliable sources",
            "**Unverifiable** — insufficient data available to verify or refute the claim",
          ],
        },
      ],
    },
    {
      slug: "how-to-use",
      title: "How to Use",
      content: [
        { type: "heading", level: 2, text: "How to Use", id: "how-to-use" },
        {
          type: "heading",
          level: 3,
          text: "Step-by-step workflow",
          id: "workflow",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Navigate to **Meeting Fact Checker** from the agents page",
            "Enter a **session title** (e.g. \"Board Meeting Q2 Review\")",
            "Click **Start Session** — the live verification indicator appears",
            "Type or paste a claim in the input box (e.g. \"Our revenue grew 40% last quarter\")",
            "Enter the **speaker's name** (e.g. \"CEO\")",
            "Click **Verify** or press **Cmd+Enter** — the agent checks the claim in real-time",
            "Review the result: verification status, confidence, summary, and expandable sources",
            "Continue verifying claims throughout the meeting",
            "When done, click **End Session** to generate a comprehensive summary",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Best practices",
          text: "Be specific with claims. \"Revenue is up\" is hard to verify. \"Q2 2025 revenue was $4.2B, up 40% year-over-year\" gives the agent concrete facts to check against real data.",
        },
        {
          type: "heading",
          level: 3,
          text: "Viewing past sessions",
          id: "past-sessions",
        },
        {
          type: "paragraph",
          text: "All sessions are saved automatically. The session history panel on the right shows all your past sessions with claim counts and verification stats. Click any session to review its claims and summary.",
        },
        {
          type: "heading",
          level: 3,
          text: "Understanding sources",
          id: "sources",
        },
        {
          type: "paragraph",
          text: "Each verified claim shows a \"sources\" link. Click it to expand the citations panel — you'll see numbered URLs that you can click to open in a new tab and verify yourself. The agent always provides the actual URLs it found during web search.",
        },
        {
          type: "live-link",
          label: "Start fact-checking",
          href: "/agents/meeting-fact-checker",
          description: "Open the Fact Checker and verify your first claim.",
        },
      ],
    },
  ],
};
