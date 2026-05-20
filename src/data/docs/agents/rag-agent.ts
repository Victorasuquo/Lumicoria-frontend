import type { AgentDocEntry } from "../types";

export const ragAgent: AgentDocEntry = {
  slug: "rag-agent",
  name: "RAG Agent",
  tagline:
    "Turn every document, link, and note your team has ever collected into one searchable, citable brain that answers questions with the exact sources behind every line.",
  icon: "Database",
  gradient: "from-purple-500 to-fuchsia-600",
  agentPath: "/agents/rag",
  category: "data",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "RAG Agent", id: "overview" },
        {
          type: "paragraph",
          text: "Most of what you and your team know lives somewhere you can't easily search. A long PDF a colleague shared. A web article you bookmarked. A page of notes from a workshop. A conversation that produced a brilliant idea you cannot quite recall the wording of. The RAG Agent pulls all of that into one place, then lets you ask plain questions and get answers grounded in your own material, with the sources cited so you always know where every line came from.",
        },
        {
          type: "paragraph",
          text: "The result is a private knowledge base that grows quietly in the background and pays you back the moment you ask it something. Instead of switching between Drive, your inbox, three browser tabs, and a folder of PDFs, you ask once and get a complete, sourced answer.",
        },
        {
          type: "heading",
          level: 3,
          text: "What it gives you",
          id: "what-it-gives",
        },
        {
          type: "list",
          items: [
            "A single home for documents, web pages, and free-form notes you want to be able to search later.",
            "Plain-language search that understands meaning, not just keywords — ask in your own words and the right material surfaces.",
            "Answers written in full sentences with citations to the exact source they came from, so you can verify before you trust.",
            "A running record of every question you have asked and every answer you have received, ready to revisit.",
            "Quiet improvement: the more you add, the sharper its answers become.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Who it is built for",
          id: "who-its-for",
        },
        {
          type: "paragraph",
          text: "Anyone whose work depends on remembering, finding, and citing information. Consultants who keep a library of past engagements. Founders who collect competitive intelligence. Researchers and analysts who comb through long documents. Operators who want a single place to ask, \"what did we decide last quarter about X?\" and get a real answer.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the RAG Agent. Upload a PDF, paste a URL, or drop in some plain text. Wait a few seconds for it to be indexed. Then type a question about it in the search box at the top — your answer appears with the exact passages it drew from, ready to click and read.",
        },
        {
          type: "live-link",
          label: "Open the RAG Agent",
          href: "/agents/rag",
          description: "Your private, sourced knowledge base.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "capabilities",
      title: "What you can do",
      content: [
        { type: "heading", level: 2, text: "Capabilities at a glance", id: "capabilities" },
        {
          type: "capabilities",
          items: [
            {
              icon: "Upload",
              title: "Bring in anything",
              description: "Upload PDFs, Word documents, slide decks, spreadsheets, and images. Paste a web link to capture an article. Drop in raw text from your notes. Everything you bring is added to a single library you control.",
            },
            {
              icon: "Search",
              title: "Ask in your own words",
              description: "Forget keywords. Ask the same way you would ask a colleague — \"what did the customer survey say about pricing?\" — and the most relevant passages come back, even when the words you typed do not appear in the document.",
            },
            {
              icon: "BookOpen",
              title: "Answers with sources",
              description: "Every answer arrives with the passages it drew from. Click any citation to jump straight to the source. No more wondering whether the answer is trustworthy.",
            },
            {
              icon: "Sparkles",
              title: "Synthesised, not stitched",
              description: "Instead of returning a list of search results, the agent reads what it found and writes a clean, summarised answer in full sentences, joining ideas across multiple sources where it makes sense.",
            },
            {
              icon: "Clock",
              title: "Searchable history",
              description: "Every question and answer is kept in a history view, organised by recency. Revisit a past conversation, build on it, or share the link.",
            },
            {
              icon: "Filter",
              title: "Filter by source type",
              description: "Narrow your library to documents, web articles, or your own notes when you want to scope a search to a particular kind of material.",
            },
            {
              icon: "Shield",
              title: "Stays private",
              description: "Your library is visible only inside your workspace. Other organisations on the platform never see what you have uploaded.",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "setup",
      title: "Setup and inputs",
      content: [
        { type: "heading", level: 2, text: "Setup and inputs", id: "setup" },
        {
          type: "paragraph",
          text: "There is nothing to configure to begin. The library is ready the moment you open the agent. Add your first piece of material and you can start asking questions about it within seconds.",
        },
        {
          type: "heading",
          level: 3,
          text: "What you can add",
          id: "what-to-add",
        },
        {
          type: "list",
          items: [
            "Documents — PDFs, Word files, spreadsheets, slide decks, and images with text in them. Drag-and-drop in the upload panel or pick from your computer.",
            "Web pages — paste a URL and the agent fetches the article, the documentation page, or the blog post. A title and tags are optional but help you find it later.",
            "Notes — paste a block of text directly. Useful for meeting notes, a summary you wrote yourself, or anything else that does not live in a file.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "What you get back",
          id: "what-you-get",
        },
        {
          type: "list",
          items: [
            "A written answer to your question, in full sentences, drawn from the material you have added.",
            "Citations that show exactly which passages the answer is based on. Click any of them to read the source.",
            "A confidence indicator on each citation so you can quickly tell which sources contributed most.",
            "A running count of how many documents, passages, and questions live in your library.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Size and patience",
          text: "Long documents take a few seconds to index after upload. Most articles and short PDFs are ready within five seconds; very long books may take a minute. While indexing is happening, the document is visible in your library with a status indicator so you know it is on the way.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "workflow",
      title: "How to use it",
      content: [
        { type: "heading", level: 2, text: "How to use it", id: "workflow" },
        {
          type: "heading",
          level: 3,
          text: "Build the library",
          id: "build-library",
        },
        {
          type: "paragraph",
          text: "Open the agent and use the upload panel on the right. Pick the kind of source you are adding (a document, a URL, or a note), add it, and you are done. The library grows organically as you work. Most people add a few things at a time as material comes up, rather than uploading everything they own on day one.",
        },
        {
          type: "heading",
          level: 3,
          text: "Ask a question",
          id: "ask",
        },
        {
          type: "paragraph",
          text: "Type your question in the search box at the top. Be specific where you can — \"what does the Q3 report say about churn?\" is better than \"churn\" — but you do not have to be careful with wording. The agent understands meaning. Press enter and the answer appears below in a few seconds, with citations underneath each claim.",
        },
        {
          type: "heading",
          level: 3,
          text: "Read the sources",
          id: "sources",
        },
        {
          type: "paragraph",
          text: "Every citation is clickable. Open one to read the exact passage that informed the answer, in context. If the citation points to a PDF, the page opens to the right paragraph. If it is a web page, the original link opens in a new tab. The intent is that you never have to trust an answer blindly.",
        },
        {
          type: "heading",
          level: 3,
          text: "Revisit history",
          id: "history",
        },
        {
          type: "paragraph",
          text: "Every question you have asked is saved in a side panel, organised by recency. Open one to see the full answer and its sources again. You can delete any entry from your history at any time.",
        },
        {
          type: "heading",
          level: 3,
          text: "Curate the library",
          id: "curate",
        },
        {
          type: "paragraph",
          text: "Old material can be removed from the library at any time. Removing a document also removes it from future answers, so the library stays current as your knowledge changes.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "trust-privacy",
      title: "Trust and privacy",
      content: [
        { type: "heading", level: 2, text: "Trust and privacy", id: "trust" },
        {
          type: "paragraph",
          text: "Your library belongs to your workspace. It is not visible to other organisations on the platform, and it is not used to train any external model. Every search and every answer is scoped to your workspace's material.",
        },
        {
          type: "list",
          items: [
            "Each workspace has its own private library. No cross-organisation visibility.",
            "Every answer is built only from material you have added. The agent does not invent sources.",
            "Citations are always shown so you can verify any claim before you act on it.",
            "Removing a document removes it from future answers immediately. There is no shadow copy.",
            "All processing happens inside your Lumicoria workspace.",
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "best-practices",
      title: "Best practices",
      content: [
        { type: "heading", level: 2, text: "Best practices", id: "best-practices" },
        {
          type: "list",
          items: [
            "Start with the material you already know you will ask about. Ten well-chosen documents beat a hundred uploaded \"just in case.\"",
            "Tag URL and note uploads with a short topic label. It makes the library easier to scan and lets you filter later.",
            "Ask follow-up questions in the same session — the agent remembers what you have just discussed and builds on it.",
            "If an answer feels thin, look at the citations. Either the source material doesn't contain what you need, in which case you can add more, or the agent missed a passage, in which case rephrasing usually resolves it.",
            "Remove documents that have gone stale. Outdated material can pull answers in the wrong direction.",
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "troubleshooting",
      title: "Troubleshooting",
      content: [
        { type: "heading", level: 2, text: "Troubleshooting", id: "troubleshooting" },
        {
          type: "heading",
          level: 3,
          text: "The answer says it cannot find the information",
          id: "no-info",
        },
        {
          type: "paragraph",
          text: "Either the topic is not in your library yet, or the answer relies on wording very different from what your sources use. Add a document or a note that covers the topic, or rephrase your question using different terms.",
        },
        {
          type: "heading",
          level: 3,
          text: "A document I uploaded is not showing up in the answer",
          id: "missing-source",
        },
        {
          type: "paragraph",
          text: "Check that the document has finished indexing — the upload panel shows the current status. Very large files take longer. If a document has been processing for several minutes, remove it and re-upload.",
        },
        {
          type: "heading",
          level: 3,
          text: "I am getting too many citations",
          id: "many-citations",
        },
        {
          type: "paragraph",
          text: "That is the agent being thorough. If you only need the top sources, the citation list is ordered by relevance — the first few are the strongest. You can also filter your library to a single source type to narrow the field.",
        },
        {
          type: "heading",
          level: 3,
          text: "An answer references a removed document",
          id: "stale-cite",
        },
        {
          type: "paragraph",
          text: "Your history is preserved even when a document is removed. New questions will not see the removed material; only the historical record references it. If that is a problem, the history entry can be deleted.",
        },
      ],
    },
  ],
};
