import type { AgentDocEntry } from "../types";
import { documentAgent } from "./document-agent";
import { meetingAssistant } from "./meeting-assistant";
import { meetingFactChecker } from "./meeting-fact-checker";
import { researchAgent } from "./research-agent";
import { visionAgent } from "./vision-agent";
import { legalDocumentAgent } from "./legal-document";
import { customerServiceAgent } from "./customer-service";
import { knowledgeGraphAgent } from "./knowledge-graph";
import { ragAgent } from "./rag-agent";
import { dataAnalysisAgent } from "./data-analysis-agent";
import { researchMentor } from "./research-mentor";
import { learningCoach } from "./learning-coach";
import { studentAgent } from "./student-agent";

// Add new agent doc imports here. One per agent, then add to the array below.

export const agentDocs: AgentDocEntry[] = [
  documentAgent,
  meetingAssistant,
  meetingFactChecker,
  visionAgent,
  researchAgent,
  researchMentor,
  studentAgent,
  learningCoach,
  legalDocumentAgent,
  customerServiceAgent,
  ragAgent,
  dataAnalysisAgent,
  knowledgeGraphAgent,
  // Add more agents as docs are written
];

export const getAgentDoc = (slug: string): AgentDocEntry | undefined =>
  agentDocs.find((a) => a.slug === slug);
