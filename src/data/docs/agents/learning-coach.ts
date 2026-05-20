import type { AgentDocEntry } from "../types";

export const learningCoach: AgentDocEntry = {
  slug: "learning-coach",
  name: "Learning Coach",
  tagline:
    "A personal coach for any skill you want to learn — designs a path that fits your goal and your level, adapts as you progress, and keeps the work focused on what will actually move you forward.",
  icon: "BookOpen",
  gradient: "from-teal-500 to-emerald-600",
  agentPath: "/agents/learning-coach",
  category: "research",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Learning Coach", id: "overview" },
        {
          type: "paragraph",
          text: "Learning anything new on your own is mostly a problem of focus. There is more material than you can read, more advice than you can follow, and no one to tell you whether what you are doing this week is the right thing to be doing. Most people lose months to wandering, and quietly stop.",
        },
        {
          type: "paragraph",
          text: "The Learning Coach removes that drag. Tell it what you want to be able to do — write SQL, speak conversational Japanese, understand options trading, design a logo, give a talk — and it builds you a clear path. It picks the right next concept, generates exercises to test what you have absorbed, explains the parts you struggle with in different ways until one lands, and adjusts the difficulty so you are always working at the edge of your ability rather than at the bottom or the impossible top.",
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
            "A personalised curriculum tailored to your goal, your background, and the time you have.",
            "Explanations of difficult concepts written in plain English with examples, analogies, and counter-examples until the idea sticks.",
            "Quizzes and exercises generated on demand to test whether you actually understand a topic, not just whether you read it.",
            "Honest progress tracking — what you know, what you are shaky on, what you have not yet tackled.",
            "Recommended resources across formats — articles, videos, courses, books — chosen for where you are in the path, not based on popularity.",
            "Adaptive difficulty so the work always meets you where you are, rather than where the textbook assumes you are.",
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
          text: "Anyone teaching themselves something new. Career switchers learning a new craft. Engineers picking up an adjacent skill. Founders learning a discipline they used to outsource. Lifelong learners who want their evenings to add up to something more than scrolling.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the Learning Coach. Choose Learning Path. Type your goal — \"be able to read a financial statement,\" \"feel comfortable in a beginner pottery class,\" \"write a clean unit test\" — and your current level. Within seconds you will have a structured path you can begin today.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Learning Coach workspace",
          caption: "A path that fits your goal, your starting point, and the time you actually have.",
        },
        {
          type: "live-link",
          label: "Open the Learning Coach",
          href: "/agents/learning-coach",
          description: "A coach that respects your time and your goal.",
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
              icon: "Compass",
              title: "Learning path",
              description: "Tell the coach what you want to learn and where you are starting from, and it produces a structured plan — milestones, the order to tackle them, and an honest estimate of effort.",
            },
            {
              icon: "ListChecks",
              title: "Quiz generation",
              description: "Generate quizzes and exercises on any concept the coach has covered. Multiple-choice, short answer, applied problems — the right format for the topic.",
            },
            {
              icon: "Brain",
              title: "Concept explanation",
              description: "Ask for an explanation of any idea and the coach writes one in plain English. Ask for a different explanation and it tries another angle — a metaphor, a smaller example, a different starting point — until something clicks.",
            },
            {
              icon: "TrendingUp",
              title: "Progress tracking",
              description: "A clear view of where you are on the path. What you are solid on, what you are shaky on, what you have not yet started. Includes specific suggestions for what to do next based on your weak spots.",
            },
            {
              icon: "BookMarked",
              title: "Resource recommendations",
              description: "Recommended articles, videos, books, and courses chosen for where you are in your path. Free and paid options are flagged separately so you can decide what to commit to.",
            },
            {
              icon: "Sparkles",
              title: "Adaptive difficulty",
              description: "The coach watches how you do on quizzes and exercises and adjusts. Too easy and you are nudged forward; too hard and the next exercise pulls back to the part you missed. Always at the productive edge.",
            },
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Six learning modes",
          caption: "Path, explanations, quizzes, progress, resources, and difficulty — all in one place.",
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
          text: "Open the agent and choose Learning Path. The coach asks three things: what you want to be able to do, what you already know, and how much time you can give it each week. With those three answers it builds the rest.",
        },
        {
          type: "heading",
          level: 3,
          text: "Describing your goal",
          id: "describing-goal",
        },
        {
          type: "paragraph",
          text: "Goals work best when they are specific and verifiable. \"Learn machine learning\" is too broad to plan for. \"Be able to fit a regression model to a real dataset and explain what the coefficients mean\" is a goal the coach can build a path toward. If you cannot make it that specific, the coach will ask follow-up questions until it can.",
        },
        {
          type: "heading",
          level: 3,
          text: "Describing your level",
          id: "describing-level",
        },
        {
          type: "paragraph",
          text: "Be honest. The coach is not impressed by claims; it produces a better path when you tell it the truth. \"I have written a few Python scripts but never used pandas\" is exactly the right kind of starting point.",
        },
        {
          type: "heading",
          level: 3,
          text: "Choosing your pace",
          id: "pace",
        },
        {
          type: "paragraph",
          text: "Three hours a week and three hours a day produce very different paths. The coach respects whatever pace you give it. You can change it later as your schedule shifts; the path adjusts.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Opening a learning path",
          caption: "Tell the coach your goal, your level, and your time — it builds the rest.",
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
          text: "Follow the path, but do not be a slave to it",
          id: "follow-path",
        },
        {
          type: "paragraph",
          text: "The path is a recommendation, not a rule. If a topic captures your interest, dwell on it; the coach will adjust the milestones. If a topic bores you, ask the coach why it is in the path before skipping it. Sometimes the answer changes your mind.",
        },
        {
          type: "heading",
          level: 3,
          text: "Use quizzes to test, not to grade",
          id: "use-quizzes",
        },
        {
          type: "paragraph",
          text: "After every chunk of material, run a quiz. The point is not the score. The point is to find out which parts you absorbed and which parts only felt like you absorbed them. Wrong answers are the most useful information you get.",
        },
        {
          type: "heading",
          level: 3,
          text: "Ask for a different explanation",
          id: "different-explanation",
        },
        {
          type: "paragraph",
          text: "If a concept will not land, ask the coach to explain it differently. A metaphor, a counter-example, a worked example, a visualisation. There is no fixed limit. The right explanation for you depends on the analogies you already carry; the coach is happy to try several.",
        },
        {
          type: "heading",
          level: 3,
          text: "Track progress weekly",
          id: "track-weekly",
        },
        {
          type: "paragraph",
          text: "A short weekly look at progress is more valuable than a long monthly one. The coach surfaces where you are slipping while there is still time to recover, and tells you what to revisit before moving forward.",
        },
        {
          type: "heading",
          level: 3,
          text: "Treat resources as supplements",
          id: "resources",
        },
        {
          type: "paragraph",
          text: "The recommended resources are paired to where you are in your path. They are not replacements for the work the coach is guiding; they are second voices on the same material. Use them when an explanation needs a different angle.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Following a path",
          caption: "Quiz often. Ask for a different explanation when one doesn't click.",
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
            "Decide your goal in one specific sentence before you start. Vague goals produce vague paths.",
            "Spend the same amount of time practising as you do studying. Reading without doing is the most expensive way to learn.",
            "Quiz yourself the day after, not the same day. Sleep tests retention; same-day quizzes test short-term memory.",
            "When a concept will not click, stop pushing. Ask for a different explanation. If it still will not click, ask for a smaller pre-requisite topic instead.",
            "Schedule a regular weekly slot. Consistency beats intensity over the months it takes to build a real skill.",
            "Tell the coach about projects you are working on. The path adapts to make what you are learning immediately useful.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Habits that compound",
          caption: "Consistency beats intensity over the months it takes to build a real skill.",
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
          text: "Your sessions, your progress, and your path live inside your workspace. They are not shared with anyone outside it and are not used to train any external model.",
        },
        {
          type: "list",
          items: [
            "Progress data is private to your workspace.",
            "Recommended resources are chosen for what you are learning, not for any commercial relationship.",
            "The coach makes judgements about what to study next, but the decisions remain yours.",
            "You can reset, delete, or change any part of your path at any time.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Private progress data",
          caption: "Your progress and your path stay inside your workspace.",
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
          text: "The path feels too long",
          id: "too-long",
        },
        {
          type: "paragraph",
          text: "Tell the coach. \"This is more material than I have time for\" is information the coach can use. It will rework the path to focus on the parts most central to your stated goal, or break the goal into a smaller first version.",
        },
        {
          type: "heading",
          level: 3,
          text: "The quizzes are too easy",
          id: "too-easy",
        },
        {
          type: "paragraph",
          text: "Tell the coach. The adaptive difficulty will respond, but a direct nudge gets you to the right level faster than waiting for the algorithm to catch up.",
        },
        {
          type: "heading",
          level: 3,
          text: "I am stuck on one topic",
          id: "stuck",
        },
        {
          type: "paragraph",
          text: "Ask for a different explanation, and if that does not work, ask the coach what pre-requisite might be missing. Most stuck moments are not because the current topic is too hard, but because a step before it was glossed over.",
        },
        {
          type: "heading",
          level: 3,
          text: "I want to learn something completely different",
          id: "switch",
        },
        {
          type: "paragraph",
          text: "Start a new path. The coach keeps old paths in your history; you can return to them later. There is no penalty for branching out.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Working through common snags",
          caption: "When something isn't working, tell the coach. A direct nudge beats waiting it out.",
        },
      ],
    },
  ],
};
