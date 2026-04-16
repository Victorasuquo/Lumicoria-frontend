import type { AgentDocEntry } from "../types";
import { documentAgent } from "./document-agent";
import { meetingAssistant } from "./meeting-assistant";
import { meetingFactChecker } from "./meeting-fact-checker";
import { researchAgent } from "./research-agent";
import { visionAgent } from "./vision-agent";
import { legalDocumentAgent } from "./legal-document";

// Add new agent doc imports here — one per agent, then add to the array below.

export const agentDocs: AgentDocEntry[] = [
  documentAgent,
  meetingAssistant,
  meetingFactChecker,
  visionAgent,
  researchAgent,
  legalDocumentAgent,
  // Add more agents as docs are written
];

export const getAgentDoc = (slug: string): AgentDocEntry | undefined =>
  agentDocs.find((a) => a.slug === slug);
