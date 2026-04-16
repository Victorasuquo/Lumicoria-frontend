import type { AgentDocEntry } from "../types";

export const visionAgent: AgentDocEntry = {
  slug: "vision",
  name: "Vision Agent",
  tagline: "AI-powered image analysis — describe, extract text, identify objects, and answer visual questions.",
  icon: "Eye",
  gradient: "from-purple-500 to-violet-600",
  agentPath: "/agents/vision",
  category: "data",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Vision Agent", id: "overview" },
        {
          type: "paragraph",
          text: "The Vision Agent brings AI-powered image understanding to Lumicoria. Upload any image — a screenshot, chart, diagram, document scan, or photograph — and the agent analyzes it with detailed descriptions, text extraction (OCR), object identification, and visual question answering.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "Visual information is everywhere — dashboards, charts, handwritten notes, product mockups, whiteboard sketches. The Vision Agent lets you extract structured data from images, ask questions about visual content, and convert visual information into text that other agents can process.",
        },
        {
          type: "list",
          items: [
            "**Image description** — get detailed, natural language descriptions of any image",
            "**OCR / text extraction** — extract text from screenshots, documents, and handwritten notes",
            "**Visual Q&A** — ask specific questions about image content and get precise answers",
            "**Chart analysis** — interpret graphs, charts, and data visualizations",
            "**Multi-format** — supports PNG, JPG, WebP, GIF, and more",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=700&fit=crop",
          alt: "Vision Agent interface",
          caption: "Upload an image and get AI-powered analysis",
        },
        {
          type: "live-link",
          label: "Try the Vision Agent",
          href: "/agents/vision",
          description: "Upload an image and see AI vision in action.",
        },
      ],
    },
    {
      slug: "capabilities",
      title: "Capabilities",
      content: [
        { type: "heading", level: 2, text: "Capabilities", id: "capabilities" },
        {
          type: "capabilities",
          items: [
            { icon: "ScanText", title: "OCR & Text Extraction", description: "Extracts text from images with high accuracy — screenshots, documents, signs, handwriting." },
            { icon: "ImageIcon", title: "Image Description", description: "Generates detailed, natural language descriptions of image content, composition, and context." },
            { icon: "MessageCircleQuestion", title: "Visual Q&A", description: "Ask specific questions about image content — \"What color is the car?\" \"How many people are in the photo?\"" },
            { icon: "BarChart3", title: "Chart Interpretation", description: "Reads charts, graphs, and data visualizations — extracts data points and describes trends." },
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
            "Navigate to the **Vision Agent** from the agents page",
            "**Upload an image** — drag and drop or click to browse (PNG, JPG, WebP, GIF supported)",
            "Optionally enter a **question** about the image (e.g. \"What text is in this screenshot?\")",
            "Click **Analyze** — the agent processes the image and returns results",
            "Review the analysis — description, extracted text, and answers to your questions",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Combine with other agents",
          text: "Extract text from a whiteboard photo with the Vision Agent, then paste it into the Meeting Assistant to get structured action items. Chain agents together for powerful workflows.",
        },
        {
          type: "live-link",
          label: "Try it now",
          href: "/agents/vision",
          description: "Upload an image and see what the Vision Agent finds.",
        },
      ],
    },
  ],
};
