import type { AgentDocEntry } from "../types";

export const studentAgent: AgentDocEntry = {
  slug: "student",
  name: "Student Agent",
  tagline:
    "A study companion who actually helps — works through assignments alongside you, builds the right study plan for your week, and explains what does not yet make sense in language you can follow.",
  icon: "GraduationCap",
  gradient: "from-blue-500 to-indigo-600",
  agentPath: "/agents/student",
  category: "research",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Student Agent", id: "overview" },
        {
          type: "paragraph",
          text: "School and university hand you more to do than there are hours in the day, and almost no one tells you how to prioritise. The Student Agent is the patient companion who has been through it: it helps you make sense of an assignment before you start it, builds a study plan that fits your actual week, explains the parts of a lecture you did not catch, and steps in for the times you would otherwise be alone with the work.",
        },
        {
          type: "paragraph",
          text: "It is not a tool for cheating. It is a tool for learning faster and feeling less alone with hard material. The point is the moment when something finally makes sense, and the relief of a calendar that respects what you actually have to do.",
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
            "Step-by-step help with assignments — broken down, explained, and worked through alongside you, not handed to you on a plate.",
            "A study schedule built around your real week, your deadlines, and the way you learn best.",
            "Explanations of difficult concepts in plain language, with multiple angles until one makes sense.",
            "Research help for term papers and projects, with sources you can verify.",
            "A general help mode for everything else — quick questions, formatting issues, the small confusions that pile up.",
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
          text: "High school and university students. People studying part-time alongside work. Anyone returning to study after time away who needs a steady, patient companion to make the workload feel manageable. The agent treats serious students seriously.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the Student Agent and pick the mode that matches what you need right now. Assignment Help for a piece of work in front of you. Study Plan to map out the week. Explain Concept for a topic that has not landed. Research for a paper. General Help for anything else.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Student Agent workspace",
          caption: "Assignments, study plans, concept explanations, and research — under one roof.",
        },
        {
          type: "live-link",
          label: "Open the Student Agent",
          href: "/agents/student",
          description: "Your study companion — the kind that genuinely helps.",
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
              icon: "FileText",
              title: "Assignment help",
              description: "Paste in the assignment prompt or describe what is due. The agent helps you understand exactly what is being asked, breaks it into manageable parts, and works through the difficult bits with you — never instead of you.",
            },
            {
              icon: "Calendar",
              title: "Study plan",
              description: "Tell the agent what you have due and when, plus how much time you have. It builds a schedule that fits your real week, distributes effort sensibly, and leaves room for the small emergencies a week always brings.",
            },
            {
              icon: "Brain",
              title: "Explain concept",
              description: "Type in a topic you do not yet understand and the agent explains it in plain English. Ask for a different explanation if the first one does not click — a smaller example, a metaphor, a different starting point.",
            },
            {
              icon: "BookOpen",
              title: "Research",
              description: "For papers and projects, the agent helps you find credible sources, summarise them, and weave them into an argument that is yours, not a generic essay.",
            },
            {
              icon: "MessageSquare",
              title: "General help",
              description: "The catch-all mode for the small things — formatting a citation, understanding a piece of feedback, deciding which of two assignments to start with. Quick, useful, no setup.",
            },
            {
              icon: "Sparkles",
              title: "Multiple models, picked for the job",
              description: "Different kinds of help call for different kinds of thinking. The agent uses the right approach for the task — careful and methodical for working through a problem, faster and lighter for quick questions.",
            },
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Five focused modes",
          caption: "Assignment Help, Study Plan, Explain Concept, Research, General Help.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "setup",
      title: "Getting started",
      content: [
        { type: "heading", level: 2, text: "Getting started", id: "setup" },
        {
          type: "paragraph",
          text: "There is nothing to configure. Open the agent and choose the mode that fits your task. The agent will ask the right follow-up questions; you do not need to prepare anything.",
        },
        {
          type: "heading",
          level: 3,
          text: "Picking a mode",
          id: "picking-mode",
        },
        {
          type: "list",
          items: [
            "Assignment Help — when you have a specific piece of work to do.",
            "Study Plan — when you want to organise your week or a longer stretch.",
            "Explain Concept — when a particular topic is not yet making sense.",
            "Research — when you are gathering material for a paper or project.",
            "General Help — when you have a quick question and none of the above fit.",
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
            "The actual assignment prompt or your professor's instructions, when you have them. Specific beats general every time.",
            "The textbook chapter or lecture notes you are working from, if you have them.",
            "A clear sense of what you have already tried — \"I read the chapter and I still don't get X\" is more useful than \"I don't get X.\"",
            "Your deadlines and the time you have available, for study-plan sessions.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Choosing the right mode",
          caption: "Match the mode to the task in front of you — the rest follows.",
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
          text: "Assignment help that does not do the work for you",
          id: "assignment",
        },
        {
          type: "paragraph",
          text: "The agent is designed to help you learn, not to write your assignment. When you paste in a prompt, it begins by helping you understand what is actually being asked — most students lose marks because they answered the wrong question. From there, it breaks the work into steps, walks through the difficult parts with you, and stops short of writing the finished product. The final piece is always yours.",
        },
        {
          type: "heading",
          level: 3,
          text: "Study plans for the week you actually have",
          id: "study-plan",
        },
        {
          type: "paragraph",
          text: "Tell the agent what is due, when, and how much time you can give it. The plan that comes back will be honest about what fits and what does not. Better to know on Sunday that Thursday is going to be tight than to discover it Wednesday night.",
        },
        {
          type: "heading",
          level: 3,
          text: "Concept explanations that respect your time",
          id: "explain",
        },
        {
          type: "paragraph",
          text: "Explanations are short by default. If the first version does not land, ask for a different one. The agent will try a metaphor, a small worked example, or a step-back to the pre-requisite you might be missing. The point is the moment of clicking, not the volume of words.",
        },
        {
          type: "heading",
          level: 3,
          text: "Research with real sources",
          id: "research",
        },
        {
          type: "paragraph",
          text: "When you ask for research help, the agent surfaces sources you can verify. Every claim it makes points back to something you can read. Use the sources to build your own argument; do not paste them in unchanged.",
        },
        {
          type: "heading",
          level: 3,
          text: "General help for everything else",
          id: "general",
        },
        {
          type: "paragraph",
          text: "Short questions, format checks, the kind of confusion you would normally ask a friend about. General Help is the catch-all. Use it freely.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "A typical session",
          caption: "Bring the prompt, your notes, and what you've already tried — the agent does the rest with you.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "academic-integrity",
      title: "Academic integrity",
      content: [
        { type: "heading", level: 2, text: "Academic integrity", id: "academic-integrity" },
        {
          type: "paragraph",
          text: "The agent is a study companion. It is not a replacement for your own thinking, and it is not designed to produce finished work you would submit unchanged. Most universities now have clear rules on what kinds of AI assistance are allowed; the agent's job is to fit comfortably within those rules.",
        },
        {
          type: "list",
          items: [
            "Use the agent to understand, plan, and check — the same way you would use a study group or office hours.",
            "Do not submit the agent's words as your own. The point of every assignment is your own grasp of the material; the agent helps you build that grasp.",
            "Be transparent with your institution. If your course allows AI assistance with a citation, cite it.",
            "When research help produces sources, read them yourself. Do not cite a source you have not opened.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Honest study practice",
          caption: "Help understanding, planning, and checking — never a substitute for your own work.",
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
            "Read the assignment prompt twice before opening the agent. Your version of the question is the most useful starting point.",
            "When stuck, say what you have already tried. \"I read the chapter and I still don't see why X follows from Y\" gets a much better response than \"I don't understand X.\"",
            "Use Study Plan at the start of the week, not Wednesday night. The plan is most useful while you still have time to act on it.",
            "When an explanation does not land, ask for a different one. There is no limit on how many attempts you can ask for.",
            "Treat research help as a starting point. The agent finds the sources; you read them and build the argument.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Steady study habits",
          caption: "Sunday plans, weekday execution, weekly check-ins — the rhythm that builds up.",
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
          text: "The agent will not just write my essay",
          id: "write-essay",
        },
        {
          type: "paragraph",
          text: "Correct — by design. The agent helps you understand, plan, draft, and revise. Ask for what you actually need: an outline, an explanation of a difficult section, feedback on a draft you have written.",
        },
        {
          type: "heading",
          level: 3,
          text: "The study plan is unrealistic",
          id: "unrealistic-plan",
        },
        {
          type: "paragraph",
          text: "Tell the agent. It will rework the plan with the time you actually have, even if that means saying out loud that something will not fit. Better to know.",
        },
        {
          type: "heading",
          level: 3,
          text: "I do not understand the explanation",
          id: "still-confused",
        },
        {
          type: "paragraph",
          text: "Ask for a different version, or for the agent to step back to a simpler topic that comes before it. Most confusion is not about the current concept but about a step before it that was glossed over.",
        },
        {
          type: "heading",
          level: 3,
          text: "The sources in my research look thin",
          id: "thin-sources",
        },
        {
          type: "paragraph",
          text: "Ask the agent for higher-quality sources — peer-reviewed papers, primary documents, textbooks. The default is breadth; you can ask for depth.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "When study hits a wall",
          caption: "Be specific about what you've tried — that's the fastest way to a better answer.",
        },
      ],
    },
  ],
};
