import type { AgentDocEntry } from "../types";

export const documentAgent: AgentDocEntry = {
  slug: "document",
  name: "Document Agent",
  tagline: "AI-powered document intelligence — analyze, summarize, and extract insights from any document.",
  icon: "FileText",
  gradient: "from-blue-500 to-indigo-600",
  agentPath: "/agents/document",
  category: "productivity",
  subpages: [
    // ── Overview ──────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Document Agent", id: "overview" },
        {
          type: "paragraph",
          text: "The Document Agent is Lumicoria's flagship productivity tool. It processes PDFs, Word documents, text files, and more — extracting key insights, generating summaries, answering questions about content, and helping you work through documents faster than ever.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "Professionals spend an average of 2.5 hours per day reading and processing documents. The Document Agent was built to cut that time dramatically. Instead of reading a 50-page report cover to cover, upload it and ask specific questions — the agent finds the answers instantly with citations pointing to the exact page and paragraph.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Upload a PDF or paste text, select an analysis mode (Summary, Q&A, Extract, or Compare), and click **Analyze**. Results appear in seconds with citations to source material.",
        },
        {
          type: "heading",
          level: 3,
          text: "Key value propositions",
          id: "value-props",
        },
        {
          type: "list",
          items: [
            "**10x faster document review** — get summaries, key points, and action items in seconds",
            "**Citation-backed answers** — every insight links back to the source paragraph and page",
            "**Multi-format support** — PDFs, DOCX, TXT, and more with automatic format detection",
            "**RAG-powered Q&A** — ask natural language questions and get precise, contextual answers",
            "**Persistent library** — all processed documents are saved and searchable",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Document Agent main interface",
          caption: "The Document Agent workspace — upload, analyze, and explore your documents",
        },
        {
          type: "live-link",
          label: "Try the Document Agent",
          href: "/agents/document",
          description: "Upload a document and see AI-powered analysis in action.",
        },
      ],
    },
    // ── Capabilities ──────────────────────────────────────────────
    {
      slug: "capabilities",
      title: "Capabilities",
      content: [
        { type: "heading", level: 2, text: "Capabilities & Features", id: "capabilities" },
        {
          type: "paragraph",
          text: "The Document Agent combines multiple AI techniques to deliver comprehensive document intelligence. Here's everything it can do:",
        },
        {
          type: "capabilities",
          items: [
            {
              icon: "FileSearch",
              title: "Smart Summarization",
              description: "Generate concise summaries of any length document. Choose between brief overviews or detailed section-by-section breakdowns.",
            },
            {
              icon: "MessageSquare",
              title: "Q&A with Citations",
              description: "Ask natural language questions about your document. The agent answers with direct citations to paragraphs and page numbers.",
            },
            {
              icon: "ListChecks",
              title: "Key Point Extraction",
              description: "Automatically identifies the most important points, decisions, action items, and takeaways from any document.",
            },
            {
              icon: "GitCompare",
              title: "Document Comparison",
              description: "Compare two documents side-by-side. The agent highlights differences, contradictions, and complementary information.",
            },
            {
              icon: "Database",
              title: "RAG Pipeline",
              description: "Documents are chunked, embedded, and stored in a vector database for semantic search — enabling precise, context-aware retrieval.",
            },
            {
              icon: "Eye",
              title: "PDF Viewer with Highlights",
              description: "View the original PDF alongside AI analysis. Citations are clickable — jump directly to the referenced section.",
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Supported file formats",
          id: "formats",
        },
        {
          type: "list",
          items: [
            "**PDF** — native rendering with page-level citation support",
            "**DOCX / DOC** — Microsoft Word documents with formatting preserved",
            "**TXT / MD** — plain text and Markdown files",
            "**CSV / XLSX** — tabular data with automatic structure detection",
            "**HTML** — web page content extraction",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Analysis modes",
          id: "modes",
        },
        {
          type: "list",
          items: [
            "**Summary** — condensed overview of the entire document",
            "**Q&A** — ask specific questions and get cited answers",
            "**Extract** — pull out action items, decisions, dates, names, numbers",
            "**Compare** — analyze differences between two documents",
            "**Custom** — write your own analysis prompt for specialized tasks",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Document analysis results",
          caption: "Analysis results with citations, key points, and action items",
        },
      ],
    },
    // ── How to Use ────────────────────────────────────────────────
    {
      slug: "how-to-use",
      title: "How to Use",
      content: [
        { type: "heading", level: 2, text: "How to Use the Document Agent", id: "how-to-use" },
        {
          type: "heading",
          level: 3,
          text: "Step-by-step guide",
          id: "step-by-step",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Navigate to **AI Agents > Document Agent** from the sidebar, or visit [the agent page](/agents/document) directly",
            "**Upload a document** — drag and drop a file into the upload area, or click to browse. Supported formats: PDF, DOCX, TXT, CSV",
            "**Select an analysis mode** — choose Summary, Q&A, Extract, Compare, or Custom from the mode selector",
            "Click **Analyze** — the agent processes your document through the RAG pipeline and generates results",
            "**Review results** — summaries, key points, and citations appear in the results panel. Click any citation to jump to the source in the document viewer",
            "**Ask follow-up questions** — use the Q&A input to dig deeper into specific sections",
            "**Save or export** — results are automatically saved to your document library. Export as PDF or copy to clipboard",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Pro tip: Be specific with questions",
          text: "Instead of asking \"What is this document about?\", try \"What are the three key financial metrics mentioned in section 2?\" — specific questions get precise, citation-backed answers.",
        },
        {
          type: "heading",
          level: 3,
          text: "Example prompts",
          id: "examples",
        },
        {
          type: "list",
          items: [
            "\"Summarize the key decisions from this board meeting transcript\"",
            "\"Extract all action items with assignees and deadlines\"",
            "\"What does section 4.2 say about data retention policies?\"",
            "\"Compare these two contracts and highlight the differences in liability clauses\"",
            "\"List all financial figures mentioned in this quarterly report\"",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Tips for best results",
          id: "tips",
        },
        {
          type: "callout",
          variant: "info",
          title: "Document quality matters",
          text: "The agent works best with well-formatted documents. Scanned PDFs (images) may have lower accuracy — consider running OCR first for scanned documents.",
        },
        {
          type: "list",
          items: [
            "**Shorter documents** (under 50 pages) process faster and produce more accurate results",
            "**Use Q&A mode** for specific questions rather than re-running the full summary",
            "**Check citations** — always verify AI-generated insights against the source material",
            "**Combine with Chat** — for complex analysis, switch to the Chat interface where you can have a longer conversation about the document",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Document analysis workflow",
          caption: "The complete workflow: upload, analyze, and explore with citations",
        },
        {
          type: "live-link",
          label: "Try the Document Agent now",
          href: "/agents/document",
          description: "Upload your first document and experience AI-powered analysis.",
        },
      ],
    },
  ],
};
