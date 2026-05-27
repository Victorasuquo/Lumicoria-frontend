import type { AgentDocEntry } from "../types";

export const wellbeingCoachAgent: AgentDocEntry = {
  slug: "wellbeing-coach",
  name: "Well-being Coach",
  tagline:
    "A quiet companion that pays attention to how you work all day — your breaks, your mood, your focus, your energy — and gently nudges you toward the things that keep you well.",
  icon: "Heart",
  gradient: "from-rose-500 to-pink-600",
  agentPath: "/agents/wellbeing",
  category: "wellbeing",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Well-being Coach", id: "overview" },
        {
          type: "paragraph",
          text: "Productivity tools are happy to keep you busy. They aren't always interested in keeping you well. The Well-being Coach is the part of Lumicoria that is. It runs in the background while you use every other agent — reading your activity, your task progress, the breaks you take and the breaks you skip — and now and then it taps you on the shoulder with a small suggestion: rest your eyes, drink some water, take five minutes outside, you've been at this for ninety minutes.",
        },
        {
          type: "paragraph",
          text: "It isn't a wellness app you have to remember to open. It's always on, always with you, and it speaks up gently when it thinks you'd benefit from a pause. You can also walk up to it and chat — ask how your week is going, or what you should focus on, or what to do with the heavy feeling you've been carrying since the morning. It will answer in plain language, and it will know what you've actually been doing today.",
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
            "A live timer that counts down to your next recommended break, tuned to the work pattern in your settings.",
            "Quick check-ins for mood, energy, and stress — three taps, no friction, logged forever so you can look back.",
            "Personal recommendations that show up wherever you are on the platform, not buried inside one dashboard.",
            "A weekly wellness digest sent to your inbox every Monday with a reflection on how you actually spent your time.",
            "A full ledger of your wellbeing history — moods, sleep, activities, goals — that you can revisit and learn from.",
            "A chat panel where the Coach answers you using everything it knows about your week.",
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
          text: "Everyone on the platform. There is no opt-in and no way to switch the Coach off — your wellness is not a feature flag. You can snooze a reminder, dismiss a tip, change your break interval, or tell the Coach to leave you alone for an hour. But it stays there, watching quietly, ready to help when the next moment comes.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open Well-being Coach from the Agent Universe. Glance at the break timer — that's how long you have until the Coach thinks you should pause. Tap Quick check-in and tell it how your mood is right now. Then go back to whatever you were doing. The Coach will take it from there.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=700&fit=crop",
          alt: "Well-being Coach workspace",
          caption: "Always on, always with you, always gentle.",
        },
        {
          type: "live-link",
          label: "Open the Well-being Coach",
          href: "/agents/wellbeing",
          description: "Live break timer, recommendations, and chat.",
        },
        {
          type: "live-link",
          label: "Open the Well-being Dashboard",
          href: "/wellbeing",
          description: "Your full ledger of moods, goals, and activities.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "capabilities",
      title: "What it does",
      content: [
        { type: "heading", level: 2, text: "What the Coach does", id: "capabilities" },
        {
          type: "paragraph",
          text: "Six things, all the time, in the background.",
        },
        {
          type: "list",
          items: [
            "Watches your activity across every agent — the documents you upload, the meetings you transcribe, the legal clauses you review, the data you analyse — and counts them as work, so it has a real picture of how much you've done today.",
            "Tracks the breaks you actually take, the moods you actually log, and the goals you've set — building a personal baseline over time.",
            "Runs a live countdown to your next recommended break. The interval comes from your settings (default is sixty minutes of focused work). When the timer hits zero, it nudges you.",
            "Pops up a tiny check-in modal at random points across the day, on whichever page you're on, so you can log how you're feeling without breaking flow.",
            "Surfaces personalised recommendations on a floating card that follows you across the platform — drink water, stretch, take a walk, switch tasks. You can dismiss any one of them.",
            "Sends a weekly digest email every Monday with the Coach's reflection on your past week — what went well, what to watch, where to focus next.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "What it doesn't do",
          id: "what-it-doesnt",
        },
        {
          type: "list",
          items: [
            "It doesn't diagnose anything. It's not a medical tool.",
            "It doesn't share your mood logs with your team or your organisation.",
            "It doesn't interrupt you when you're in a meeting or focus block — it waits.",
            "It doesn't try to be motivational in the cringey way. No streaks-to-flex, no shame, no comparison to other users.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=700&fit=crop",
          alt: "Quiet companion",
          caption: "Quiet, present, never pushy.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "setup",
      title: "Setup and settings",
      content: [
        { type: "heading", level: 2, text: "What to set up", id: "setup" },
        {
          type: "paragraph",
          text: "Almost nothing. The Coach is enabled the moment you join the platform — your defaults are already sensible. You can change four things if you want to.",
        },
        {
          type: "list",
          items: [
            "Break interval: how many minutes of focused work before the Coach suggests a break. Default sixty.",
            "Break duration: how long a recommended break should be. Default five minutes.",
            "Work hours: the window in which the Coach is allowed to nudge you. Default 9 to 5, your local time.",
            "Email digest: whether the weekly Monday digest goes to your inbox. Default on.",
          ],
        },
        {
          type: "paragraph",
          text: "You'll find all four under Settings → Well-being. Changes take effect immediately — the live countdown re-tunes itself.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Not sure what to pick?",
          text: "Leave the defaults for the first week. Look at your Monday digest. If the Coach is nudging you too often, push the break interval to 90. If it isn't nudging you enough, drop it to 45. Tune from real data, not from a guess.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "how-to-use",
      title: "How to use it",
      content: [
        { type: "heading", level: 2, text: "How to use it", id: "how-to-use" },
        {
          type: "heading",
          level: 3,
          text: "Quick check-ins",
          id: "check-ins",
        },
        {
          type: "paragraph",
          text: "When the small mood-prompt card slides in from the bottom, pick a number between 1 and 10 for whichever metric is showing — mood, energy, or stress. That's it. Three seconds. It's logged. The Coach gets a better picture of your day every time you do it.",
        },
        {
          type: "heading",
          level: 3,
          text: "Taking a break",
          id: "breaks",
        },
        {
          type: "paragraph",
          text: "When the live countdown hits zero, a soft notification appears. Tap Take it now if you can — the countdown resets and your break is logged. Tap Snooze 15 if you're mid-thought. Either way, the Coach learns from the choice.",
        },
        {
          type: "heading",
          level: 3,
          text: "Setting a goal",
          id: "goals",
        },
        {
          type: "paragraph",
          text: "Open the Well-being Dashboard from the footer. Go to the Goals tab. Tap Set New Goal. Pick a goal type — daily mood, exercise minutes, mindfulness, fewer stressful days — and set a target. The Coach starts tracking your progress that day.",
        },
        {
          type: "heading",
          level: 3,
          text: "Chatting with the Coach",
          id: "chat",
        },
        {
          type: "paragraph",
          text: "From the Coach page, tap Talk to Coach. Ask anything — \"how am I doing this week\", \"I feel drained, what should I do\", \"what should I focus on tomorrow\". The reply uses your real activity, your real mood logs, and your real productivity — not generic advice.",
        },
        {
          type: "callout",
          variant: "info",
          title: "A typical day",
          text: "Sign in around 9. Coach starts the timer. You knock out two hours of work. A small mood prompt slides in — you tap an 8. At 11 the break notification fires; you stretch for five minutes. Lunch. Repeat in the afternoon. By Friday the Coach knows enough about your week to send you a Monday digest that actually reads like it was written by someone who watched you work.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200&h=700&fit=crop",
          alt: "A typical day with the Coach",
          caption: "Small nudges, big change over a week.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "reading-the-result",
      title: "Reading your data",
      content: [
        { type: "heading", level: 2, text: "Reading your data", id: "reading-the-result" },
        {
          type: "paragraph",
          text: "The Coach surface shows you four numbers that matter today, a timeline of what you did, a weekly chart of how mood has been trending, and a list of the Coach's current recommendations. The Dashboard shows you the full ledger — every metric, every goal, every activity — across whatever time window you choose.",
        },
        {
          type: "heading",
          level: 3,
          text: "The Mon–Sun chart",
          id: "weekly-chart",
        },
        {
          type: "paragraph",
          text: "Each bar is a day. The colour gets stronger when you logged more. Today's bar is highlighted. A flat row of grey means you haven't logged anything that week yet — that's fine. Logging once a day is enough for the chart to mean something.",
        },
        {
          type: "heading",
          level: 3,
          text: "The Monday digest",
          id: "digest",
        },
        {
          type: "paragraph",
          text: "Arrives in your inbox every Monday morning. Three numbers up top — tasks completed, agent runs, day streak. Then a paragraph from the Coach about how you actually spent your week, two short lists for what went well and what to watch, and a focus for the week ahead. Skim it on your phone. The work is done; you just read it.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "What the streak counts",
          text: "Any day on which you logged at least one mood, completed at least one task, or took at least one break. Skipping a day breaks it. The streak is for you to notice patterns, not for the Coach to scold you.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "trust-privacy",
      title: "Trust and privacy",
      content: [
        { type: "heading", level: 2, text: "Trust and privacy", id: "trust-privacy" },
        {
          type: "paragraph",
          text: "Your wellbeing data is the most personal data on the platform. It is treated that way.",
        },
        {
          type: "list",
          items: [
            "Mood, energy, stress, sleep, and activity logs are scoped to you and your organisation. Other members of your organisation cannot see your individual logs.",
            "Aggregate trends — averages across an organisation — are only shown to admins, and only when there are enough users to make them anonymous.",
            "The Coach's chat is not used to train models outside your organisation.",
            "You can export every wellbeing record we have on you. You can also delete the lot.",
            "The Monday digest goes to your inbox only. Your manager doesn't see it. No one else does.",
          ],
        },
        {
          type: "paragraph",
          text: "The LLM the Coach uses is Gemini, called server-side. The contents of your prompts and the Coach's responses are passed through the model provider for that single call and then dropped. We don't keep transcripts of your conversations beyond what you can see in the chat panel.",
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
            "Log a mood once in the morning and once in the afternoon for two weeks. After that, the Coach has enough to be useful.",
            "Take the breaks the Coach suggests, even when you don't want to. The data later is clearer when the breaks are real.",
            "Set one wellbeing goal at a time. Two is fine. Five and you'll ignore them all.",
            "Read the Monday digest on Mondays. Don't let it pile up — its value is in being timely.",
            "Use the chat panel like a friend, not a search engine. Ask open questions and follow the thread.",
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
          text: "The countdown isn't moving",
          id: "no-countdown",
        },
        {
          type: "paragraph",
          text: "The countdown only ticks while the platform tab is in the foreground — that's how the Coach knows you're actually working. If you've been in another tab or another window, switch back and give it a moment to catch up.",
        },
        {
          type: "heading",
          level: 3,
          text: "I'm not getting mood prompts",
          id: "no-prompts",
        },
        {
          type: "paragraph",
          text: "Prompts are deliberately random and infrequent — usually one every couple of hours. They're also paused during your meetings and outside your work hours. If you really want to log a mood now, tap Log mood from the Coach page or Quick check-in from the Dashboard.",
        },
        {
          type: "heading",
          level: 3,
          text: "My digest didn't arrive",
          id: "no-digest",
        },
        {
          type: "paragraph",
          text: "Check your spam folder first. Then check Settings → Well-being and confirm Email digest is on. The digest is sent every Monday around 9 AM in your timezone.",
        },
        {
          type: "heading",
          level: 3,
          text: "I want the Coach to be quieter",
          id: "snooze",
        },
        {
          type: "paragraph",
          text: "Raise your break interval in Settings → Well-being. Dismiss any recommendation you don't want by tapping the X on the floating card. You can also snooze a mood prompt for ninety minutes when it appears.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Why can't I turn it off entirely?",
          text: "Because your wellbeing isn't optional. The Coach is part of the platform. You can quieten it, but you can't disable it. We'd rather you push back at us than at yourself.",
        },
      ],
    },
  ],
};
