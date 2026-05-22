import type { AgentDocEntry } from "../types";

export const ethicsBiasAgent: AgentDocEntry = {
  slug: "ethics-bias",
  name: "Ethics & Bias Agent",
  tagline:
    "A second pair of eyes for anything you write — quietly checks your content for fairness, privacy, bias, and the rules you care about, then tells you in plain English what to fix.",
  icon: "Shield",
  gradient: "from-green-500 to-emerald-600",
  agentPath: "/agents/ethics-bias",
  category: "legal-ethics",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Ethics & Bias Agent", id: "overview" },
        {
          type: "paragraph",
          text: "Almost every piece of writing your team puts out — a job ad, a customer email, a policy, a research note, a snippet of code, even a dataset description — carries assumptions. Sometimes those assumptions land cleanly. Sometimes they quietly exclude people, leak personal information, lean on stereotypes you didn't notice, or fall out of step with the rules you're supposed to follow. The Ethics & Bias Agent reads what you wrote and tells you, in plain English, where the soft spots are and how to firm them up.",
        },
        {
          type: "paragraph",
          text: "It's not a gate. It's a thoughtful reviewer who has read more policy and style guides than anyone on your team — and who is happy to point out what looks fine, what could be sharper, and what would actually cause harm if it left the building.",
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
            "A clear list of issues in your content, each labelled with how serious it is and which area it falls under.",
            "Concrete suggestions for fixing each issue, written so a non-specialist can act on them.",
            "A score out of 100 that tells you, at a glance, how clean the content is.",
            "Compliance checks against the standards you care about — privacy, accessibility, inclusive language, AI transparency, anything you name.",
            "A library of references you can cite when you want to back up your decisions with real research.",
            "A history of every analysis you've run, so you can revisit a review or compare two versions of the same piece.",
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
          text: "Anyone who publishes, ships, or sends content that other people will rely on. Recruiters and people teams writing job descriptions. Marketing and product teams reviewing copy. Researchers checking their own framing. Developers asking whether a model card or a dataset description is balanced. Founders sense-checking a customer email before it goes out. Anyone who would rather catch a problem on their own screen than after the screenshot is on the internet.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the Ethics & Bias Agent. Paste a paragraph of writing — anything you've drafted recently. Click Analyse Content. Within a few seconds you'll see a list of issues, a score, and a suggestion for each. Read the highest-severity one and decide what to do.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Ethics & Bias Agent workspace",
          caption:
            "A quiet reviewer for the writing your team is about to publish.",
        },
        {
          type: "live-link",
          label: "Open the Ethics & Bias Agent",
          href: "/agents/ethics-bias",
          description: "Your second pair of eyes.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "capabilities",
      title: "What you can do",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Capabilities at a glance",
          id: "capabilities",
        },
        {
          type: "capabilities",
          items: [
            {
              icon: "Search",
              title: "Read and review",
              description:
                "Paste any piece of writing — short or long, formal or informal — and get a structured review back. The agent reads the whole thing, not just keywords, so it catches the kinds of issues a careful editor would catch.",
            },
            {
              icon: "AlertTriangle",
              title: "Flag what matters",
              description:
                "Every issue comes labelled with a severity (Critical / High / Medium / Low) and a category (fairness, privacy, transparency, accessibility, and so on). You always know what to look at first.",
            },
            {
              icon: "Lightbulb",
              title: "Suggest a fix",
              description:
                "Each issue arrives with a concrete suggestion. Not vague advice — a specific change you can make in the next minute.",
            },
            {
              icon: "CheckCircle2",
              title: "Check the rules",
              description:
                "Name the standards you care about — GDPR, WCAG, your company style guide, inclusive language — and the agent will mark each one passed or not, with a short note explaining why.",
            },
            {
              icon: "BookOpen",
              title: "Find the receipts",
              description:
                "When you need to back up a decision with research, ask for citations on a topic and get a curated list of papers, standards, and case studies you can read and quote.",
            },
            {
              icon: "TrendingUp",
              title: "See your score",
              description:
                "Every analysis produces a single number out of 100. It's a quick read on how clean your content is — and a useful way to track improvement as you revise.",
            },
            {
              icon: "Clock",
              title: "Keep a record",
              description:
                "Every review you run is saved. Reopen a past analysis, compare versions, or remove anything you no longer need.",
            },
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Issues list with severities and suggestions",
          caption:
            "Every issue carries a severity, a category, and a concrete suggestion — never just a label.",
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
          text: "Nothing to configure. Open the agent and bring in something to review.",
        },
        {
          type: "heading",
          level: 3,
          text: "What kinds of content it reads",
          id: "content-kinds",
        },
        {
          type: "paragraph",
          text: "There are four tabs above the input box — Text, Document, Code, and Dataset. They don't change what you can paste; you still type or paste into the same box. What changes is the lens the reviewer reads through. Think of it like asking an editor to look at your draft — you'd tell them what kind of thing it is first, so they know which pitfalls to look out for.",
        },
        {
          type: "heading",
          level: 4,
          text: "Text",
          id: "tab-text",
        },
        {
          type: "paragraph",
          text: "The default, and the right choice most of the time. Best for emails, ad copy, marketing pages, internal memos, customer messages, blog posts, social posts, FAQs — anything written for a reader. With this lens the reviewer pays close attention to tone, fairness in language, gendered phrasing, exclusion, accidental stereotypes, missing context, and how accessibly things are described.",
        },
        {
          type: "heading",
          level: 4,
          text: "Document",
          id: "tab-document",
        },
        {
          type: "paragraph",
          text: "Worth picking when you're pasting something long and structured: contracts, policies, handbooks, white papers, briefs, model cards, terms of service. The reviewer takes the time to read it as a coherent piece and looks for clauses that disadvantage one party, missing consent or disclosure, ambiguous obligations, accessibility statements, gaps in transparency, and regulatory exposure.",
        },
        {
          type: "heading",
          level: 4,
          text: "Code",
          id: "tab-code",
        },
        {
          type: "paragraph",
          text: "For code snippets, prompts, configuration files, and developer-facing comments. With this lens the reviewer looks for variable and function names that encode bias (the classic `master`/`slave` or `blacklist`/`whitelist` patterns), comments that lean on stereotypes, hardcoded defaults that exclude certain users, accessibility issues in any user-facing strings, assumptions baked into the logic (such as expecting a name to have exactly two parts), and missing input validation around sensitive fields.",
        },
        {
          type: "heading",
          level: 4,
          text: "Dataset",
          id: "tab-dataset",
        },
        {
          type: "paragraph",
          text: "For dataset descriptions, schemas, sample rows, data cards, feature lists, and survey questionnaires. The reviewer focuses on representation gaps (who is missing from the data), sampling bias, labels that carry assumptions, sensitive attributes used without justification, missing consent, how categories are defined, and whether what is collected matches what is actually needed.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Not sure which to pick?",
          text: "Text is the safe default — it covers most everyday content. Switch to Document for long structured prose, Code for anything developer-facing, and Dataset for descriptions of data you collect or train on. The same content reviewed under two different tabs will surface two different angles, so it's also fine to run a piece through more than one lens if you're being thorough.",
        },
        {
          type: "paragraph",
          text: "One thing the tab does not do: it does not change what you can paste, and it does not upload files. The textarea is the same in every tab; everything you want reviewed goes in there.",
        },
        {
          type: "heading",
          level: 3,
          text: "Pick the reviewer you want",
          id: "pick-reviewer",
        },
        {
          type: "paragraph",
          text: "At the top of the page there's a small chooser with three reviewers. Each has its own style. Pick whichever matches the work in front of you.",
        },
        {
          type: "list",
          items: [
            "Gemini — fast and well-rounded. The right default for most everyday reviews.",
            "Claude — careful and thorough. Worth picking when the content is sensitive or you want a more considered read.",
            "Perplexity — research-grade with live citations. Best when you want references to back up a finding.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Optional: tell it which rules matter",
          id: "guidelines",
        },
        {
          type: "paragraph",
          text: "Below the input box there's a small line where you can list the specific guidelines you care about — comma-separated. Anything from regulations (GDPR, HIPAA) to internal standards (your editorial style guide, your hiring playbook). When you run a guideline check, the agent reports back against exactly those.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Choose a reviewer and content type",
          caption:
            "Three reviewers, four content types, one optional list of rules — that's the whole setup.",
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
          type: "paragraph",
          text: "The page has four actions. They build on each other but you can use each one on its own.",
        },
        {
          type: "heading",
          level: 3,
          text: "Analyse content",
          id: "analyse",
        },
        {
          type: "paragraph",
          text: "The main one. Paste what you wrote into the big box, hit Analyse Content, and within a few seconds you have a list of issues. Each row tells you how serious it is, what it concerns, and how to fix it. The score on the right updates to reflect what was found.",
        },
        {
          type: "heading",
          level: 3,
          text: "Check guidelines",
          id: "check-guidelines",
        },
        {
          type: "paragraph",
          text: "Use this when you care about specific rules. Type the rules into the focus line (\"GDPR, WCAG, inclusive language\"), keep your content in the box, and click Check guidelines. You get back a checklist: each rule marked passed or not, with a short note on why.",
        },
        {
          type: "heading",
          level: 3,
          text: "Generate suggestions",
          id: "suggestions",
        },
        {
          type: "paragraph",
          text: "After an analysis, click Generate Suggestions to turn the issue list into a polished set of recommended edits. The output reads like a colleague's notes — \"replace this with that, here's why\" — rather than a diagnosis.",
        },
        {
          type: "heading",
          level: 3,
          text: "Get citations",
          id: "citations",
        },
        {
          type: "paragraph",
          text: "Type a topic in the small box at the bottom right (\"algorithmic bias in hiring\", \"data minimisation\", \"WCAG colour contrast\") and you'll get a curated list of references — papers, standards, case studies — you can read and cite. Useful when you need to back a recommendation with real research.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "A typical session",
          text: "Paste a job description → Analyse → see two issues → revise → re-analyse → score goes up → Generate Suggestions to get the recommended edits in one tidy list → optionally Get Citations on \"inclusive hiring language\" so you can cite the research. Five minutes.",
        },
        {
          type: "heading",
          level: 3,
          text: "Re-open a past review",
          id: "history",
        },
        {
          type: "paragraph",
          text: "Every analysis you run lives in the Recent Analyses panel on the right. Click any row to reopen it exactly as it was — same issues, same score, same suggestions. Hit the trash icon to remove one you no longer need.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Reviewing a result with the score panel",
          caption:
            "Run a review, read the issues, follow the suggestions. The score gives you a quick read on progress.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "reading-the-result",
      title: "Reading the result",
      content: [
        {
          type: "heading",
          level: 2,
          text: "How to read what you get back",
          id: "reading",
        },
        {
          type: "heading",
          level: 3,
          text: "The score",
          id: "score",
        },
        {
          type: "paragraph",
          text: "A single number from 0 to 100. Higher is cleaner. It's calculated from the issues found — each one takes a bite out of the total proportional to how serious it is. A score above 80 generally means the content is in good shape. Between 60 and 80 means it's workable but worth another pass. Below 60 means there's something material to address before you ship.",
        },
        {
          type: "heading",
          level: 3,
          text: "Severity colours",
          id: "severity",
        },
        {
          type: "list",
          items: [
            "Critical — likely to cause real harm or break a rule that has consequences. Fix before publishing.",
            "High — meaningful problem; address before the content reaches a wider audience.",
            "Medium — worth fixing during your normal revision pass.",
            "Low — a small improvement; nice to have, not urgent.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Issue categories",
          id: "categories",
        },
        {
          type: "paragraph",
          text: "Each issue carries a category — fairness, privacy, transparency, accountability, inclusion, safety, or one of several bias dimensions. You don't need to memorise the list. The labels are there so you can scan the result and quickly group things by theme.",
        },
        {
          type: "heading",
          level: 3,
          text: "The confidence figure",
          id: "confidence",
        },
        {
          type: "paragraph",
          text: "Each issue may show a small confidence percentage. It's the reviewer's sense of how sure it is about the call. High confidence means \"I'd bring this up with anyone\". Lower confidence means \"worth a look, but you may decide it's fine in context\". Use it to triage when the list is long.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1586953208270-767889db4b3e?w=1200&h=700&fit=crop",
          alt: "Severity colours and the score circle",
          caption:
            "A short list, clearly labelled, with a single number that summarises the whole.",
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
          text: "Your content and your analyses belong to your workspace. They are scoped to your organisation and never shared with anyone outside it. The agent is a reviewer, not a publisher — what you paste in doesn't go anywhere else.",
        },
        {
          type: "list",
          items: [
            "Each workspace has its own private history. No cross-organisation visibility.",
            "Every analysis is saved with a clear record of which reviewer ran it and when. You can reopen or remove any of them at any time.",
            "The agent is a second opinion, not a verdict. The judgement on what to ship — and what to ignore — remains yours.",
            "Citations, when offered, are pointers to verify, not stamps of approval. Read them yourself before you quote them.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Workspace-private history",
          caption:
            "Your reviews stay in your workspace. Other organisations never see them.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "best-practices",
      title: "Best practices",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Best practices",
          id: "best-practices",
        },
        {
          type: "list",
          items: [
            "Review one piece at a time. Pasting a whole document is fine, but the result is more actionable when each review covers a coherent passage rather than a mixed bag.",
            "Pick the right reviewer for the job. Gemini for everyday checks, Claude for sensitive or nuanced material, Perplexity when you want citations alongside the review.",
            "Don't chase a perfect score. A 90 with two intentional, defensible choices is often better than an 85 you spent an hour squeezing into a 100.",
            "Use Check guidelines when the standards matter more than the prose. It's the right tool for compliance reads.",
            "Use Generate Suggestions before you sit down to revise. It turns a list of issues into a list of edits, which is a much faster way to work.",
            "Trust your judgement. The reviewer will sometimes flag things that are correct in your context. That's normal — the point is to surface things you can decide on, not to make the decisions for you.",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=700&fit=crop",
          alt: "Working through a revision pass",
          caption:
            "A good revision pass is two reviews and one round of edits, not ten reviews and zero edits.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "troubleshooting",
      title: "Troubleshooting",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Troubleshooting",
          id: "troubleshooting",
        },
        {
          type: "heading",
          level: 3,
          text: "The review came back empty",
          id: "empty",
        },
        {
          type: "paragraph",
          text: "Either the content really is clean for the reviewer's lens, or the passage is too short to evaluate. For very short text, the reviewer often has nothing to comment on. Try a longer or more specific passage.",
        },
        {
          type: "heading",
          level: 3,
          text: "An issue feels wrong",
          id: "wrong",
        },
        {
          type: "paragraph",
          text: "Use the confidence figure as a signal. If the flag is low-confidence and you have a real reason it doesn't apply in your context, it's fine to move on. If it's high-confidence and surprising, try a second reviewer — Claude often catches different things than Gemini, and a small disagreement between them is usually informative.",
        },
        {
          type: "heading",
          level: 3,
          text: "I want citations but the list looks thin",
          id: "thin-citations",
        },
        {
          type: "paragraph",
          text: "Use Perplexity as the reviewer and ask for citations on a focused topic — \"facial recognition bias in law enforcement\" rather than \"AI ethics\". Narrow topics get richer reading lists.",
        },
        {
          type: "heading",
          level: 3,
          text: "The score moved in a direction I didn't expect",
          id: "score-direction",
        },
        {
          type: "paragraph",
          text: "Each revision is its own review, and the reviewer may notice something new the second time around. Open both runs from the history panel side by side — the rows tell you exactly what changed between them.",
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
          alt: "Comparing two reviews",
          caption:
            "Two reviews open side by side is usually the fastest way to understand a score change.",
        },
      ],
    },
  ],
};
