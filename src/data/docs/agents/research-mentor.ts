import type { AgentDocEntry } from "../types";

export const researchMentor: AgentDocEntry = {
  slug: "research-mentor",
  name: "Research Mentor",
  tagline:
    "A patient, structured guide for serious research projects — the kind of thinking partner who helps you frame the question, choose the right method, and pressure-test the answer before anyone else sees it.",
  icon: "Lightbulb",
  gradient: "from-yellow-500 to-amber-600",
  agentPath: "/agents/research-mentor",
  category: "research",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Research Mentor", id: "overview" },
        {
          type: "paragraph",
          text: "Real research is rarely about finding facts. It is about asking the right question, choosing the right way to answer it, and being honest with yourself about what your evidence does and does not say. The Research Mentor is the partner who helps you do all three. It is not a search engine and it is not a writing tool. It is a thinking companion that asks the questions a thoughtful advisor would ask, and helps you arrive at conclusions you can defend.",
        },
        {
          type: "paragraph",
          text: "Whether you are starting a PhD chapter, writing a strategy memo, scoping a product investigation, or trying to make sense of a complex domain you are new to, the Research Mentor walks you through it in stages: break the problem down, plan the work, review what is already known, frame your own hypothesis, choose the right method, evaluate the evidence, and synthesise the answer.",
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
            "A structured way to break a vague question into investigable parts.",
            "A coherent research plan with the right sequence of steps and clear milestones.",
            "Guided literature review that helps you sort signal from noise in a busy field.",
            "Help framing testable hypotheses that move you forward instead of going in circles.",
            "Advice on the right method for the question you are actually asking.",
            "A critical eye on your evidence — what it supports, what it doesn't, what you still need.",
            "A synthesis step that turns a pile of findings into one clear, defensible argument.",
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
          text: "Graduate students working on a thesis or dissertation. Analysts and strategists tackling open-ended business questions. Product researchers framing user studies. Anyone doing serious investigative work who has felt the difference between a search tool and a thinking partner, and wants the second one.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the Research Mentor. Choose the Problem Analysis stage. Type the question you are trying to answer in your own words, even if it is still messy. The mentor will help you break it into parts and decide which one to start with.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Research Mentor workspace",
          caption: "A thinking partner who walks the project with you, stage by stage.",
        },
        {
          type: "live-link",
          label: "Open the Research Mentor",
          href: "/agents/research-mentor",
          description: "Your thinking partner for any serious investigation.",
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
              icon: "Microscope",
              title: "Problem analysis",
              description: "Take a vague or sprawling question and break it down into the specific sub-questions that, answered well, would resolve it. The first step that protects you from wasting weeks on the wrong investigation.",
            },
            {
              icon: "Compass",
              title: "Research planning",
              description: "Turn the problem breakdown into a sequenced plan — what to do first, what to do next, and what to leave until the answers from earlier stages are in. Includes realistic milestones.",
            },
            {
              icon: "BookOpen",
              title: "Literature review",
              description: "Guided reading of what others have written on the topic, with the mentor helping you separate established results from contested ones and asking the questions a peer reviewer would.",
            },
            {
              icon: "FlaskConical",
              title: "Hypothesis development",
              description: "Move from a feeling about what is happening to a testable claim. The mentor sharpens your hypothesis until it is specific enough to be wrong, which is the only way it can be useful.",
            },
            {
              icon: "Layers",
              title: "Methodology guidance",
              description: "Choose the right approach — qualitative, quantitative, mixed — for the question you are actually asking. Includes the trade-offs, the threats to validity, and the practical constraints.",
            },
            {
              icon: "Brain",
              title: "Critical evaluation",
              description: "A second pair of eyes on your evidence. The mentor probes alternative explanations, identifies what the evidence does not yet show, and tells you what would be needed to settle a doubt.",
            },
            {
              icon: "Sparkles",
              title: "Synthesis",
              description: "Pull the threads together at the end. The mentor helps you write a single, clear argument that does justice to what you found without overclaiming or hedging unnecessarily.",
            },
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Seven stages of the research arc",
          caption: "From a vague question to a defensible argument, one stage at a time.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "setup",
      title: "How sessions work",
      content: [
        { type: "heading", level: 2, text: "How sessions work", id: "setup" },
        {
          type: "paragraph",
          text: "The Research Mentor works in stages, each one a small focused conversation. You pick the stage you are at and the mentor adjusts its style — fewer answers, more questions, when you are at the framing end; more structure and synthesis, when you are pulling things together.",
        },
        {
          type: "heading",
          level: 3,
          text: "The stages",
          id: "stages",
        },
        {
          type: "list",
          items: [
            "Problem Analysis — break the question into investigable parts.",
            "Research Planning — sequence the work into a coherent plan.",
            "Literature Review — make sense of what is already known.",
            "Hypothesis Development — sharpen a feeling into a testable claim.",
            "Methodology — choose the right approach for your question.",
            "Critical Evaluation — pressure-test your findings against alternatives.",
            "Synthesis — write the single, clear argument.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "What to bring",
          id: "what-to-bring",
        },
        {
          type: "list",
          items: [
            "A draft of the question you are trying to answer — messy is fine.",
            "Any context that bounds the investigation: time, audience, constraints.",
            "Pieces of evidence or sources you have already encountered, if any.",
            "Where in the process you currently feel stuck — \"I cannot pick a method,\" \"I have too many papers and they all say something different,\" \"I cannot tell if my hypothesis is too narrow.\"",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Starting a session",
          caption: "Pick the stage you're at — the mentor adjusts its style accordingly.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "workflow",
      title: "Working with the mentor",
      content: [
        { type: "heading", level: 2, text: "Working with the mentor", id: "workflow" },
        {
          type: "heading",
          level: 3,
          text: "Begin where you actually are",
          id: "begin",
        },
        {
          type: "paragraph",
          text: "If your question is fuzzy, start at Problem Analysis. If your literature is a pile, start at Literature Review. The stages are independent; you do not have to begin at the top. The mentor adapts to where you are.",
        },
        {
          type: "heading",
          level: 3,
          text: "Treat it as a back-and-forth",
          id: "back-and-forth",
        },
        {
          type: "paragraph",
          text: "The mentor's most useful turns are the ones that push a question back to you. \"What would have to be true for that to fail?\" is more valuable than a paragraph of background. Sit with the questions; the answers in your own words are what move the work forward.",
        },
        {
          type: "heading",
          level: 3,
          text: "Bring evidence in",
          id: "bring-evidence",
        },
        {
          type: "paragraph",
          text: "Paste excerpts, summaries, or links to material you are working with. The mentor will help you weigh them against each other, point out where they agree and disagree, and identify what they are silent on.",
        },
        {
          type: "heading",
          level: 3,
          text: "Move stages when you are ready",
          id: "move-stages",
        },
        {
          type: "paragraph",
          text: "You do not finish a stage in a single sitting. Save your session, come back, and pick the stage you need next. The mentor keeps the thread of your work without forcing you to recap everything from scratch.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "A back-and-forth session",
          caption: "The most useful turns are the ones that hand a question back to you.",
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
            "Write your draft question in one sentence before you start. The act of compressing it tells you what is missing.",
            "Spend time in Problem Analysis. Most research projects fail because the question was wrong, not because the methods were.",
            "When the mentor asks a question, answer it before moving on. The questions are the work.",
            "Keep a running list of decisions you have made and why. The mentor will help you make them; capturing them is your job.",
            "Use Critical Evaluation more than once. Once when your first round of evidence is in, once before you write up.",
            "Synthesise out loud. The act of writing the argument almost always reveals which parts are still soft.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Disciplined research habits",
          caption: "Compress the question into one sentence. Revisit the framing whenever you feel lost.",
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
          text: "Your sessions belong to you. They are scoped to your workspace and not visible to anyone outside it. The mentor is a thinking partner; the conclusions you reach are yours.",
        },
        {
          type: "list",
          items: [
            "Sessions are private to your workspace.",
            "The mentor does not act as an authority on what is correct. It points to considerations and helps you reason; the judgement remains yours.",
            "Citations, when offered, are pointers to verify, not stamps of approval. The instruction is always to check.",
            "Material you paste in is treated as confidential and is not used to train any external model.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Private sessions",
          caption: "Your sessions and the material you paste in stay inside your workspace.",
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
          text: "The mentor is too vague",
          id: "too-vague",
        },
        {
          type: "paragraph",
          text: "Give it more to work with. \"I am writing about climate adaptation\" is the start of a project; \"I am evaluating whether seawall investments in coastal cities have produced measurable property-value retention in flood-prone neighbourhoods\" is something the mentor can act on.",
        },
        {
          type: "heading",
          level: 3,
          text: "I get the same questions back every time",
          id: "loops",
        },
        {
          type: "paragraph",
          text: "That usually means an earlier stage is still soft. If the mentor keeps asking about scope, your scope is not yet decided. Go back to Problem Analysis, write the answer down, then return.",
        },
        {
          type: "heading",
          level: 3,
          text: "The mentor takes a position I disagree with",
          id: "disagree",
        },
        {
          type: "paragraph",
          text: "Push back. Explain why. The mentor is at its best when it is being challenged with specifics. The point is to sharpen your thinking, not to win an argument.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "When things get stuck",
          caption: "Vague questions, looping advice — usually an earlier stage that's still soft.",
        },
      ],
    },
  ],
};
