import type { AgentDocEntry } from "../types";

export const researchAgent: AgentDocEntry = {
  slug: "research",
  name: "Research Agent",
  tagline: "Deep research across academic, industry, and web sources — with citations and structured findings.",
  icon: "Search",
  gradient: "from-blue-500 to-indigo-600",
  agentPath: "/agents/research",
  category: "research",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Research Agent", id: "overview" },
        {
          type: "paragraph",
          text: "The Research Agent conducts deep, multi-source research on any topic. It searches academic papers, industry reports, news articles, and web sources — then synthesizes findings into structured, citation-backed reports. Think of it as a research assistant that never sleeps.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "Research is time-consuming. Finding relevant sources, reading through papers, cross-referencing data, and synthesizing findings can take days. The Research Agent compresses this into minutes — giving you a solid starting point with real citations that you can verify and build upon.",
        },
        {
          type: "list",
          items: [
            "**Multi-source research** — searches academic databases, industry reports, news, and web simultaneously",
            "**Structured output** — key findings, source cards with metadata, and synthesized conclusions",
            "**Multiple research modes** — quick search, deep dive, literature review, competitive analysis",
            "**Real citations** — every finding linked to its source with title, author, date, and URL",
            "**Progress tracking** — watch the agent work through search, analysis, and synthesis steps",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=700&fit=crop",
          alt: "Research Agent interface",
          caption: "Research results with source cards, key findings, and structured analysis",
        },
        {
          type: "live-link",
          label: "Try the Research Agent",
          href: "/agents/research",
          description: "Start researching any topic with AI-powered source discovery.",
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
            { icon: "BookOpen", title: "Academic Search", description: "Searches academic databases for peer-reviewed papers, meta-analyses, and research findings." },
            { icon: "Building2", title: "Industry Reports", description: "Finds industry analysis, market research, and sector reports from leading firms." },
            { icon: "Newspaper", title: "News & Current Events", description: "Searches recent news for the latest developments, announcements, and trends." },
            { icon: "Globe", title: "Web Research", description: "Broad web search for blogs, documentation, forums, and other online resources." },
            { icon: "GitBranch", title: "Competitive Analysis", description: "Compare companies, products, or technologies with structured side-by-side analysis." },
            { icon: "TrendingUp", title: "Trend Analysis", description: "Identify trends over time with data points, charts references, and expert opinions." },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Research modes",
          id: "modes",
        },
        {
          type: "list",
          items: [
            "**Quick Search** — fast, focused search on a specific question (30 seconds)",
            "**Deep Dive** — comprehensive research with multiple source types (2-3 minutes)",
            "**Literature Review** — academic-focused with paper citations and methodology notes",
            "**Competitive Analysis** — structured comparison of companies, products, or approaches",
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
          type: "list",
          ordered: true,
          items: [
            "Navigate to the **Research Agent** from the agents page",
            "Select a **research mode** (Quick Search, Deep Dive, Literature Review, or Competitive Analysis)",
            "Enter your research query in the search bar — be as specific as possible",
            "Click **Research** — watch the progress steps as the agent searches and analyzes",
            "Review the results: key findings sidebar, source cards with metadata, and synthesized analysis",
            "Click any source card to expand details or visit the original URL",
            "Use the copy button to export findings for your reports",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Better queries, better results",
          text: "Instead of \"AI trends\", try \"What are the top 3 enterprise AI adoption trends in financial services in 2025, backed by market research data?\" Specific queries with scope, timeframe, and desired evidence type produce dramatically better results.",
        },
        {
          type: "live-link",
          label: "Start researching",
          href: "/agents/research",
          description: "Enter a topic and get structured research with citations.",
        },
      ],
    },
  ],
};
