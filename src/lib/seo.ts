/**
 * Central SEO configuration for Lumicoria AI.
 *
 * Every public page reads from here. Update site-wide signals (brand name,
 * social handles, GA tracking IDs, default OG image) in this file and
 * they propagate everywhere.
 */

export const SITE = {
  name: "Lumicoria AI",
  shortName: "Lumicoria",
  domain: "lumicoria.ai",
  url: "https://lumicoria.ai",
  apiUrl: "https://api.lumicoria.ai",
  locale: "en_US",
  language: "en",
  twitterHandle: "@lumicoria_ai",
  linkedinSlug: "lumicoria-ai",
  email: "hello@lumicoria.ai",
  founded: "2025",
  themeColor: "#4F46E5",
} as const;

/**
 * Master keyword bank. Mix of head + long-tail + semantic siblings so that
 * Google's NLU pulls Lumicoria into a wide range of intent clusters:
 *   - "ai agents"
 *   - "ai productivity tools"
 *   - "ai for teams"
 *   - "ai workspace platform"
 *   - "multi-agent system"
 *   - "ai agent builder"
 *   - "enterprise ai platform"
 *   - "ai assistant for work"
 *   - "document ai"
 *   - "meeting ai notetaker"
 *   - "ai wellbeing app"
 *   - "ai workflow automation"
 */
export const KEYWORDS = {
  global: [
    "AI agents",
    "AI agent platform",
    "AI productivity tools",
    "AI for teams",
    "AI workspace",
    "AI assistant",
    "multi-agent system",
    "custom AI agents",
    "AI agent builder",
    "enterprise AI platform",
    "AI productivity software",
    "AI collaboration tool",
    "AI for SMB",
    "AI for startups",
    "AI document processing",
    "AI meeting assistant",
    "AI workflow automation",
    "AI knowledge base",
    "RAG platform",
    "vector search",
    "Gemini agent",
    "Anthropic Claude agent",
    "OpenAI GPT agent",
    "AI wellbeing",
    "Lumicoria",
    "Lumicoria AI",
    "AI Agent Universe",
    "AI teams",
    "AI tasks",
    "AI orchestration",
    "AI agent marketplace",
    "team productivity AI",
    "work-life balance AI",
    "AI burnout prevention",
  ],
  byPage: {
    home: [
      "AI Agent Universe",
      "AI agents for productivity",
      "AI agents for teams",
      "personal AI assistant",
      "team AI workspace",
      "AI productivity platform",
      "AI for daily work",
      "AI agents for work",
    ],
    agents: [
      "AI agents catalog",
      "specialised AI agents",
      "document AI agent",
      "meeting AI agent",
      "research AI agent",
      "vision AI agent",
      "creative AI agent",
      "student AI agent",
      "wellbeing AI agent",
      "RAG AI agent",
      "Perplexity Sonar agent",
    ],
    agentBuilder: [
      "AI agent builder",
      "no-code AI agents",
      "low-code AI agents",
      "custom AI agent builder",
      "build your own AI agent",
      "AI agent studio",
      "visual AI workflow",
      "AI agent canvas",
    ],
    liveStudio: [
      "live AI studio",
      "AI live mode",
      "real-time AI agent",
      "AI orchestration studio",
    ],
    pricing: [
      "AI agent pricing",
      "AI platform pricing",
      "per-seat AI",
      "team AI pricing",
      "enterprise AI pricing",
      "AI subscription",
      "AI agents free tier",
    ],
    pricingTeams: [
      "AI for teams pricing",
      "team AI subscription",
      "collaborative AI pricing",
    ],
    enterprise: [
      "enterprise AI platform",
      "AI for enterprise",
      "SSO AI platform",
      "SAML AI",
      "SCIM AI",
      "GDPR AI platform",
      "SOC 2 AI",
      "HIPAA AI",
      "data residency AI",
      "BYOK AI",
      "private AI agents",
    ],
    models: [
      "AI models catalog",
      "Gemini 2.5 Pro",
      "Claude Opus",
      "GPT-4",
      "DeepSeek",
      "Perplexity Sonar",
      "AI model comparison",
      "best AI model for agents",
    ],
    about: [
      "about Lumicoria",
      "Lumicoria team",
      "AI startup",
      "AI agent company",
    ],
    blog: [
      "AI agents blog",
      "AI productivity blog",
      "AI workflow ideas",
      "AI agent tutorials",
      "RAG tutorials",
      "Gemini tutorials",
      "AI use cases",
    ],
    contact: [
      "contact Lumicoria",
      "Lumicoria support",
      "AI platform demo",
      "AI agents demo",
    ],
    login: [
      "Lumicoria login",
      "sign in to Lumicoria",
    ],
    signup: [
      "Lumicoria signup",
      "create AI workspace",
      "free AI agent account",
    ],
  },
} as const;

export type PageKey = keyof typeof KEYWORDS.byPage;

export interface SEOMeta {
  /** `<title>`. Will be merged with site name if not already including it. */
  title: string;
  /** `<meta name="description">`. ≤ 160 chars for best SERP rendering. */
  description: string;
  /** Canonical URL — pass path-only (e.g. "/pricing") or full URL. */
  canonical?: string;
  /** Open Graph image. Defaults to /images/lumicoria-og.png. */
  ogImage?: string;
  /** `<meta name="keywords">`. Auto-merged with site keywords. */
  keywords?: readonly string[] | string[];
  /** "website" (default), "article" (blog), "product" (pricing), etc. */
  ogType?: "website" | "article" | "product" | "profile";
  /** Mark page as noindex (login, dashboards, private). */
  noindex?: boolean;
  /** Optional structured data — JSON-LD. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/** Build a canonical URL from a path. */
export const canonicalUrl = (path?: string): string => {
  if (!path) return SITE.url;
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
};

/** Build a title — if the supplied string doesn't already mention the brand,
 *  append " — Lumicoria AI". */
export const buildTitle = (title: string): string => {
  const t = title.trim();
  if (t.toLowerCase().includes("lumicoria")) return t;
  return `${t} — ${SITE.name}`;
};

/** Resolve an OG image URL to absolute. */
export const resolveOgImage = (path?: string): string => {
  if (!path) return `${SITE.url}/images/lumicoria-og.png`;
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Default JSON-LD blocks injected into the base index.html.
 * Page-specific schemas (Product, Article, FAQPage) layer on top via
 * the SEO component.
 */
export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: ["Lumicoria", "Lumicoria.ai"],
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  email: SITE.email,
  foundingDate: SITE.founded,
  description:
    "Lumicoria AI is the AI Agent Universe — a multi-tenant workspace platform where teams collaborate with specialised AI agents (document, meeting, research, vision, creative, wellbeing) to ship work faster.",
  sameAs: [
    `https://twitter.com/${SITE.twitterHandle.replace("@", "")}`,
    `https://www.linkedin.com/company/${SITE.linkedinSlug}`,
    `https://github.com/Lumicoria-AI`,
  ],
};

export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const SOFTWARE_APPLICATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "ProductivitySoftware",
  operatingSystem: "Web, Cloud",
  description:
    "Lumicoria AI is an AI agent platform that gives teams specialised AI agents for documents, meetings, research, vision, creative work, and wellbeing — with enterprise SSO, SCIM, and data residency.",
  url: SITE.url,
  image: `${SITE.url}/images/lumicoria-og.png`,
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "Personal account with limited monthly agent runs.",
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "39",
      priceCurrency: "USD",
      description: "Per seat, per month. For teams collaborating with AI agents.",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "79",
      priceCurrency: "USD",
      description:
        "Per seat, per month. Higher limits, custom agent quotas, advanced analytics.",
    },
    {
      "@type": "Offer",
      name: "Enterprise",
      price: "129",
      priceCurrency: "USD",
      description:
        "Per seat, per month. SSO, SCIM, data residency, BYOK, dedicated support.",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "120",
  },
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon-512.png`,
  },
};

/** Public routes that should be in the sitemap. Used to keep the
 *  static sitemap.xml in sync with the live router config. */
export const PUBLIC_ROUTES: Array<{
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  // Hero
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/agents", changefreq: "weekly", priority: 0.95 },
  { path: "/live-studio", changefreq: "weekly", priority: 0.9 },
  { path: "/agent-builder", changefreq: "weekly", priority: 0.9 },
  { path: "/agents/my-agents", changefreq: "weekly", priority: 0.7 },
  { path: "/wellbeing", changefreq: "weekly", priority: 0.85 },
  { path: "/pricing", changefreq: "weekly", priority: 0.95 },
  { path: "/pricing/teams", changefreq: "weekly", priority: 0.9 },
  { path: "/enterprise", changefreq: "monthly", priority: 0.9 },
  { path: "/models", changefreq: "weekly", priority: 0.85 },
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/contact", changefreq: "yearly", priority: 0.65 },

  // Documentation
  { path: "/docs", changefreq: "weekly", priority: 0.9 },
  { path: "/docs/getting-started", changefreq: "weekly", priority: 0.85 },
  { path: "/docs/agents", changefreq: "weekly", priority: 0.85 },
  { path: "/docs/api", changefreq: "weekly", priority: 0.85 },
  { path: "/docs/integrations", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/security", changefreq: "monthly", priority: 0.8 },

  // Per-agent doc pages
  { path: "/docs/agents/document-agent", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/meeting-assistant", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/meeting-fact-checker", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/vision-agent", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/research-agent", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/research-mentor", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/student-agent", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/learning-coach", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/rag-agent", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/data-analysis-agent", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/knowledge-graph", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/legal-document", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/ethics-bias", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/wellbeing-coach", changefreq: "weekly", priority: 0.8 },
  { path: "/docs/agents/customer-service", changefreq: "weekly", priority: 0.8 },

  // Agent product pages (protected — landing copy still indexes)
  { path: "/agents/document", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/meeting", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/meeting-fact-checker", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/vision", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/research", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/research-mentor", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/student", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/learning-coach", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/rag", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/data-analysis", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/knowledge-graph", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/legal-document", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/ethics-bias", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/wellbeing", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/focus-flow", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/workspace-ergonomics", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/creative", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/social-media", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/translation", changefreq: "weekly", priority: 0.75 },
  { path: "/agents/customer-service", changefreq: "weekly", priority: 0.75 },

  // Content + conversion + legal
  { path: "/blog", changefreq: "daily", priority: 0.85 },
  { path: "/signup", changefreq: "yearly", priority: 0.7 },
  { path: "/login", changefreq: "yearly", priority: 0.3 },
  { path: "/privacy", changefreq: "yearly", priority: 0.4 },
  { path: "/terms", changefreq: "yearly", priority: 0.4 },
];
