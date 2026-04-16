import type { DocSection } from "../types";

export const availableModels: DocSection = {
  slug: "available-models",
  title: "Available Models",
  icon: "Cpu",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Available Models",
          id: "available-models",
        },
        {
          type: "paragraph",
          text: "Lumicoria AI uses a multi-model architecture. Instead of relying on a single LLM, each agent is configured with the model that performs best for its specific domain. You can also switch models in settings.",
        },
        {
          type: "heading",
          level: 3,
          text: "Supported providers",
          id: "providers",
        },
        {
          type: "capabilities",
          items: [
            { icon: "Sparkles", title: "Google Gemini", description: "Default model for most agents. Excellent at structured analysis, document processing, and general reasoning." },
            { icon: "Brain", title: "OpenAI GPT-4", description: "Used for creative writing, nuanced language tasks, and complex instruction following." },
            { icon: "MessageSquare", title: "Anthropic Claude", description: "Strong at analysis, safety-aware tasks, and long-context processing." },
            { icon: "Globe", title: "Perplexity Sonar", description: "The only model with live web search — used exclusively by the Fact Checker agent for real-time verification." },
            { icon: "Cpu", title: "DeepSeek", description: "Cost-effective model for high-volume tasks and code-related operations." },
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Automatic model selection",
          text: "You don't need to choose a model manually. Each agent comes pre-configured with the optimal model for its task. The platform handles routing, fallbacks, and API key management.",
        },
        {
          type: "live-link",
          label: "View all models",
          href: "/models",
          description: "See detailed specs, pricing, and capabilities for each model.",
        },
      ],
    },
  ],
};
