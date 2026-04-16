import type { AgentDocEntry } from "../types";

export const legalDocumentAgent: AgentDocEntry = {
  slug: "legal-document",
  name: "Legal Document Agent",
  tagline: "AI-powered legal analysis — review contracts, identify risks, and ensure compliance.",
  icon: "Scale",
  gradient: "from-slate-500 to-gray-600",
  agentPath: "/agents/legal-document",
  category: "legal-ethics",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Legal Document Agent", id: "overview" },
        {
          type: "paragraph",
          text: "The Legal Document Agent is Lumicoria's specialized tool for legal analysis. Upload contracts, agreements, policies, or any legal text — the agent identifies risks, analyzes clauses, checks compliance, and provides structured legal insights. It's like having a first-pass legal review available 24/7.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "Legal review is one of the biggest bottlenecks in business. Contracts sit in review queues for weeks. Employees sign agreements without fully understanding the terms. The Legal Document Agent doesn't replace lawyers — it accelerates their work by flagging issues, summarizing terms, and identifying risks before human review.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Not legal advice",
          text: "This agent provides AI-assisted analysis to help you understand legal documents. It does not constitute legal advice. Always consult a qualified attorney for legal decisions.",
        },
        {
          type: "list",
          items: [
            "**Risk identification** — flags problematic clauses, missing protections, and unusual terms",
            "**5 analysis modes** — contract review, compliance check, clause comparison, risk assessment, plain language summary",
            "**Jurisdiction awareness** — analysis considers the applicable legal jurisdiction",
            "**Severity ratings** — issues rated critical, high, medium, low with explanations",
            "**Side-by-side comparison** — compare two documents to find differences in terms",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=700&fit=crop",
          alt: "Legal Document Agent interface",
          caption: "Contract analysis with risk identification and clause-by-clause review",
        },
        {
          type: "live-link",
          label: "Try the Legal Document Agent",
          href: "/agents/legal-document",
          description: "Upload a contract and get AI-powered legal analysis.",
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
            { icon: "FileSearch", title: "Contract Review", description: "Comprehensive review of contracts with clause-by-clause analysis, risk flags, and plain language explanations." },
            { icon: "ShieldCheck", title: "Compliance Check", description: "Check documents against regulatory requirements (GDPR, SOX, HIPAA, etc.) and flag non-compliance." },
            { icon: "GitCompare", title: "Clause Comparison", description: "Compare clauses across two documents to identify differences, missing terms, and contradictions." },
            { icon: "AlertTriangle", title: "Risk Assessment", description: "Identify and rate legal risks by severity — critical, high, medium, low — with remediation suggestions." },
            { icon: "BookOpen", title: "Plain Language Summary", description: "Convert complex legal language into clear, understandable summaries for non-lawyers." },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Supported jurisdictions",
          id: "jurisdictions",
        },
        {
          type: "list",
          items: [
            "**United States** — federal and state-level analysis",
            "**European Union** — GDPR, EU contract law",
            "**United Kingdom** — UK contract and employment law",
            "**International** — cross-border agreement analysis",
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
            "Navigate to the **Legal Document Agent** from the agents page",
            "Select an **analysis mode** — Contract Review, Compliance Check, Risk Assessment, etc.",
            "Paste your legal text or upload a document (PDF, DOCX supported)",
            "Select the applicable **jurisdiction** from the dropdown",
            "Click **Analyze** — the agent processes the document and generates results",
            "Review findings: risk flags with severity ratings, clause analysis, and recommendations",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "For comparison mode",
          text: "To compare two documents, select the **Clause Comparison** mode. You'll get two text areas — paste both documents and the agent highlights every difference with context.",
        },
        {
          type: "live-link",
          label: "Analyze a legal document",
          href: "/agents/legal-document",
          description: "Upload a contract and get AI-powered risk analysis.",
        },
      ],
    },
  ],
};
