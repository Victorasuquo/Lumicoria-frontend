import type { AgentDocEntry } from "../types";

export const knowledgeGraphAgent: AgentDocEntry = {
  slug: "knowledge-graph",
  name: "Knowledge Graph Agent",
  tagline:
    "Turn the documents, notes, and decisions scattered across your business into a single, living map of how everything connects.",
  icon: "Brain",
  gradient: "from-fuchsia-500 to-purple-600",
  agentPath: "/agents/knowledge-graph",
  category: "research",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Knowledge Graph Agent", id: "overview" },
        {
          type: "paragraph",
          text: "Most of what your team knows lives in a hundred different places. A spec from last quarter. A meeting note from a former colleague. A customer interview a teammate ran six months ago. Individually each piece is fine. Together they are the institutional memory you keep wishing you could search through. The Knowledge Graph Agent gives that memory a shape.",
        },
        {
          type: "paragraph",
          text: "Drop in a document, a paragraph, or a set of notes. The agent reads it, finds the people, products, projects, and ideas that appear in it, and connects them. Over time the graph fills in until you can ask plain questions: who works on what, what touches this project, what depends on what.",
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
            "A connected map of the people, projects, documents, and concepts that matter to your business.",
            "One place to search across everything you have added, instead of digging through folders and chat threads.",
            "A way to see the path between two ideas: who connects them, which documents discuss them, what they share.",
            "A view of what is missing: areas where your knowledge has a gap that is worth filling.",
            "A history of every extraction, so you can revisit what you fed in and roll back anything that does not belong.",
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
          text: "Teams that have outgrown a wiki. Researchers who want to keep their thinking organized as they read. Founders who want a single picture of how their business fits together. Anyone whose work depends on remembering the connections between things, and who would rather not rely on memory.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the Knowledge Graph Agent. Click Extract Knowledge. Paste a recent document — a strategy memo, a meeting note, a customer interview transcript — and submit. Within a few seconds the graph fills in and the new entities appear in the visualization.",
        },
        {
          type: "live-link",
          label: "Open the Knowledge Graph Agent",
          href: "/agents/knowledge-graph",
          description: "Your shared map of how everything in the business connects.",
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
              icon: "Zap",
              title: "Extract knowledge from anything",
              description: "Paste raw text or pull in a document you already uploaded. The agent identifies the people, projects, concepts, and events it contains and connects them automatically.",
            },
            {
              icon: "GitBranch",
              title: "Discover new relations",
              description: "Give the agent a few topics you care about and let it propose connections between them, drawing on everything else you have already added.",
            },
            {
              icon: "Layers",
              title: "Fill knowledge gaps",
              description: "Point the agent at an area you want to understand better and it will surface the missing concepts, the unanswered questions, and the connections you should investigate next.",
            },
            {
              icon: "Search",
              title: "Search and navigate",
              description: "Type a name or a phrase and jump to the matching nodes. From any node, see its neighbors. Between any two nodes, see the shortest path through your graph.",
            },
            {
              icon: "Eye",
              title: "See the whole picture",
              description: "An interactive view of the graph shows you the entire map at once, color coded by what each node represents. Hover any node to read its label.",
            },
            {
              icon: "Clock",
              title: "Track what you have added",
              description: "A running history of every extraction shows what you fed in, when, and how many new connections it created. Remove anything that does not belong.",
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
          text: "There is nothing to configure to begin. Open the page and the graph is ready for its first piece of content.",
        },
        {
          type: "heading",
          level: 3,
          text: "What the agent reads",
          id: "what-the-agent-reads",
        },
        {
          type: "list",
          items: [
            "Plain text you paste directly into the Extract Knowledge dialog.",
            "Documents you have already added to your Lumicoria library — supply the document identifier and the agent will use the same content the rest of the platform sees.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "What it produces",
          id: "what-it-produces",
        },
        {
          type: "list",
          items: [
            "Nodes — the entities found in the content. Each node has a type, such as person, project, concept, document, event, organization, location, or resource.",
            "Relations — labelled connections between nodes, such as related to, part of, created by, mentions, depends on, or similar to.",
            "An extraction record that captures the action you took, the content it was based on, and the new nodes and relations it produced.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Size limits",
          text: "Each extraction accepts up to about fifty thousand characters of text at a time, and up to twenty focus areas for a discovery or gap fill. For larger documents, split the content into themed sections and feed them in one at a time — the agent will join the pieces together as it goes.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "working-with-the-graph",
      title: "Working with the graph",
      content: [
        { type: "heading", level: 2, text: "Working with the graph", id: "working" },
        {
          type: "heading",
          level: 3,
          text: "Extract knowledge",
          id: "extract",
        },
        {
          type: "paragraph",
          text: "The most common starting point. Open the Extract Knowledge dialog, paste the content you want analyzed, and submit. The agent reads the content, identifies the entities it contains, draws the connections between them, and adds the result to your graph. The visualization re-renders so you can see what changed.",
        },
        {
          type: "heading",
          level: 3,
          text: "Discover relations",
          id: "discover",
        },
        {
          type: "paragraph",
          text: "Use this when you want the agent to study an area and propose new connections. Provide the focus areas — a list of topics, products, or names — and the agent will look at what it already knows about each and suggest the relationships it sees. A useful way to surface non-obvious patterns once you have fed in enough content.",
        },
        {
          type: "heading",
          level: 3,
          text: "Fill gaps",
          id: "fill-gaps",
        },
        {
          type: "paragraph",
          text: "Use this when you suspect your map of an area is incomplete. Provide the focus areas, and the agent will surface the missing concepts and the missing connections it would expect to find. The result is a set of new nodes and relations you can keep or remove.",
        },
        {
          type: "heading",
          level: 3,
          text: "Query",
          id: "query",
        },
        {
          type: "list",
          items: [
            "Search — type a label or phrase to find every matching node.",
            "Neighbors — supply a node identifier to see everything directly connected to it.",
            "Path — supply two node identifiers to see how, and whether, they are connected.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Refresh view",
          id: "refresh",
        },
        {
          type: "paragraph",
          text: "Recomputes the layout from your current data. Use it any time you want a clean snapshot of where things sit after a series of extractions.",
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
          text: "Your graph belongs to your workspace and is visible only to the members of that workspace. Nothing you add is shared with other organizations on Lumicoria. The history of every extraction is recorded so you always know what produced each node and relation, and any extraction can be removed if you change your mind.",
        },
        {
          type: "list",
          items: [
            "Each workspace has its own private graph. Other workspaces never see your nodes or relations.",
            "Every extraction is logged with the action it performed, the content it was based on, and the connections it produced.",
            "You can remove an extraction at any time. Removing the record stops it from appearing in your history and trail.",
            "Documents you supply by identifier are read only when the workspace that owns them runs the extraction.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Where the work happens",
          text: "All processing happens inside your Lumicoria workspace using your existing model preferences. Nothing leaves the platform.",
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
            "Start small. Feed in one document at a time so you can see how the graph grows and tune what you add next.",
            "Group by theme. Extractions work best when each piece of content is about a coherent subject — one project, one customer, one initiative.",
            "Use focus areas thoughtfully. Three to six well chosen focus terms beat twenty vague ones.",
            "Revisit the extraction history. The history is the easiest way to spot a piece of content that did not behave as expected.",
            "Refresh the view after a heavy editing session. It produces a cleaner layout for sharing with the rest of the team.",
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
          text: "The visualization is empty",
          id: "empty-viz",
        },
        {
          type: "paragraph",
          text: "Your graph has no nodes yet. Open Extract Knowledge and add a paragraph or two of content — the visualization will populate as soon as the first extraction finishes.",
        },
        {
          type: "heading",
          level: 3,
          text: "An extraction produced no new nodes",
          id: "no-new-nodes",
        },
        {
          type: "paragraph",
          text: "The content may already be reflected in your graph, or it may be too short to identify entities reliably. Try a longer or more specific piece of content, or use Discover Relations with explicit focus areas instead.",
        },
        {
          type: "heading",
          level: 3,
          text: "A query returns nothing",
          id: "empty-query",
        },
        {
          type: "paragraph",
          text: "Search matches on labels and may need a different phrasing. Neighbor and path queries require node identifiers, which you can copy from the search results panel. Try a search first to find the identifier you want, then run the neighbor or path query.",
        },
        {
          type: "heading",
          level: 3,
          text: "Too many actions in a row",
          id: "rate-limit",
        },
        {
          type: "paragraph",
          text: "If you fire many extractions in quick succession the workspace will pause briefly to keep the graph consistent. Wait a moment and the action will succeed.",
        },
      ],
    },
  ],
};
