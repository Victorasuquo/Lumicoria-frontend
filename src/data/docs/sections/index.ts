import type { DocSection } from "../types";
import { gettingStarted } from "./getting-started";
import { agentUniverse } from "./agent-universe";
import { availableModels } from "./available-models";
import { integrations } from "./integrations";
import { howToCreateAgents } from "./how-to-create-agents";

export const docSections: DocSection[] = [
  gettingStarted,
  agentUniverse,
  availableModels,
  integrations,
  howToCreateAgents,
];

export const getSection = (slug: string): DocSection | undefined =>
  docSections.find((s) => s.slug === slug);
