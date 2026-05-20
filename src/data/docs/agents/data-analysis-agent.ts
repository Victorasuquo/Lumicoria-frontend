import type { AgentDocEntry } from "../types";

export const dataAnalysisAgent: AgentDocEntry = {
  slug: "data-analysis",
  name: "Data Analysis Agent",
  tagline:
    "Drop in a spreadsheet, ask a question in plain English, and get back the chart, the number, and the narrative — the kind of analysis that used to take a full afternoon.",
  icon: "BarChart3",
  gradient: "from-blue-500 to-indigo-600",
  agentPath: "/agents/data-analysis",
  category: "data",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Data Analysis Agent", id: "overview" },
        {
          type: "paragraph",
          text: "Most teams have more data than they have time to analyse. A spreadsheet from finance, a CSV export from a tool, a survey response file someone shared. Each one might contain the answer you need, but opening them, cleaning them up, and pulling out the insight takes hours you do not have.",
        },
        {
          type: "paragraph",
          text: "The Data Analysis Agent shortens that work to a question. Upload a file, choose how deeply you want to look at it, and the agent reads it for you. You get clean charts, the key statistics, a written explanation of what stands out, and — when you want — a full narrative report ready to share. The work that used to require a spare afternoon and a comfortable seat at a desk becomes the work of a coffee break.",
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
            "A guided walkthrough of any spreadsheet or table, with no coding and no formulas to remember.",
            "Charts generated automatically based on what is actually interesting in the file — not on what you happen to ask for.",
            "Statistical checks that flag the numbers worth paying attention to, and confidence in those checks.",
            "A library of every analysis you have run, ready to revisit, compare, or share.",
            "A written report option that turns the analysis into a paragraph or two you can paste into a presentation.",
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
          text: "Anyone who works with data but does not want to live inside a BI tool. Founders looking at their own metrics. Operators making sense of a CSV from a vendor. Researchers sanity-checking survey results. Anyone who needs the answer in the file but does not have the time, or the patience, to write a query to find it.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Open the Data Analysis Agent. Click Upload, pick a CSV or spreadsheet from your computer, and choose Exploratory as the analysis mode. Within seconds you will see the size of the dataset, the columns it contains, and a first round of charts and summaries.",
        },
        {
          type: "live-link",
          label: "Open the Data Analysis Agent",
          href: "/agents/data-analysis",
          description: "Your in-house analyst, ready when you are.",
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
              title: "Exploratory analysis",
              description: "Drop in a file and get an instant overview — number of rows, columns, the type of each column, distributions, and a first cut of the most useful charts. The right place to begin when you do not yet know what you are looking for.",
            },
            {
              icon: "Sigma",
              title: "Statistical analysis",
              description: "Compare groups, check whether differences are meaningful, run the right test for the kind of data you have. The agent picks the appropriate technique and explains the result in plain language.",
            },
            {
              icon: "AlertTriangle",
              title: "Anomaly detection",
              description: "Surface rows, customers, transactions, or time periods that stand out against the rest. Useful for catching data quality issues and for finding the interesting story inside an otherwise normal-looking file.",
            },
            {
              icon: "TrendingUp",
              title: "Trend and time-series",
              description: "Point at a date column and a measure and the agent will show you how things have changed, whether the trend is statistically meaningful, and what the recent direction looks like.",
            },
            {
              icon: "BarChart3",
              title: "Visualisation only",
              description: "When all you want are the charts, choose visualisation mode. The agent picks the right chart types for the data and produces a clean, ready-to-paste deck.",
            },
            {
              icon: "FileText",
              title: "Narrative report",
              description: "Turn an analysis into a written report — a summary, the key findings, and the supporting charts woven together as paragraphs you can copy into a document.",
            },
            {
              icon: "Clock",
              title: "History and reuse",
              description: "Every analysis is saved in a history view, organised by recency. Reopen any past one to see the same charts and findings exactly as you saw them the first time.",
            },
          ],
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
          text: "Nothing to configure. Open the agent, pick the analysis mode that fits the question you have, and bring in the data.",
        },
        {
          type: "heading",
          level: 3,
          text: "What you can analyse",
          id: "what-to-analyse",
        },
        {
          type: "list",
          items: [
            "CSV files — the most common and best supported format.",
            "Excel spreadsheets (.xlsx).",
            "Tab-separated files (.tsv) and similar plain-text tables.",
            "Sheets you have pasted into a note inside Lumicoria — drop the table in and the agent treats it the same way.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Choosing a mode",
          id: "choosing-mode",
        },
        {
          type: "list",
          items: [
            "Exploratory — when you do not yet know what is interesting. Start here.",
            "Statistical — when you have a specific question about whether one group differs from another.",
            "Anomaly — when you want to catch outliers, bad rows, or unusual patterns.",
            "Trend — when you care about how something has changed over time.",
            "Visualisation — when you just want the charts.",
            "Report — when you want a written summary you can share with someone who will not open the data themselves.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "File size",
          text: "The agent handles spreadsheets up to several hundred thousand rows comfortably. For larger files, consider running an exploratory analysis first on a representative sample and going deeper from there.",
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
          text: "Step 1 — Choose the mode",
          id: "choose",
        },
        {
          type: "paragraph",
          text: "The mode tells the agent what kind of question you are asking. Exploratory is the most common starting point because it surfaces the obvious facts about the file before you commit to a deeper investigation.",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 2 — Bring in the data",
          id: "bring-data",
        },
        {
          type: "paragraph",
          text: "Upload your file, or paste a table directly. The agent reads the structure, understands the columns, and confirms what it sees before running the analysis.",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 3 — Add context if you have it",
          id: "context",
        },
        {
          type: "paragraph",
          text: "An optional text box lets you describe what the data is and what you care about. \"This is monthly revenue by region for last year\" gives the agent enough to choose the right approach. You can leave it blank — the agent will infer what it can.",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 4 — Read the result",
          id: "read",
        },
        {
          type: "paragraph",
          text: "The result appears below: a written summary at the top, charts in the middle, and the underlying numbers at the bottom. Everything is interactive — hover any chart to see the exact value, click any column header to sort the table.",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 5 — Turn it into a report",
          id: "report",
        },
        {
          type: "paragraph",
          text: "Once you are happy with the analysis, the Report option turns it into a few paragraphs of narrative that combine the charts and the findings into something you can paste into a deck or email. Keep, edit, or discard — it is your draft.",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 6 — Save or revisit",
          id: "history",
        },
        {
          type: "paragraph",
          text: "Every analysis is saved in your history. Reopen one any time and the original charts, numbers, and narrative appear exactly as they were. Delete an entry when it is no longer useful.",
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
          text: "Your data files belong to your workspace and are visible only to the members of that workspace. They are not used to train any external model and are not shared with anyone outside your organisation.",
        },
        {
          type: "list",
          items: [
            "Each workspace has its own private library of analyses. No cross-organisation visibility.",
            "Uploaded files are kept only as long as you need them. Delete one and it is removed from your workspace.",
            "The agent does not invent numbers. Every figure on a chart, every percentage in a paragraph, traces back to a row in your data.",
            "Statistical claims include confidence indicators, so you can tell which findings are robust and which are more tentative.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Sensitive data",
          text: "If your file contains personal information, consider whether the people in it would consent to the analysis. The agent treats data as confidential and does not surface it outside your workspace, but the responsibility for what you choose to upload remains yours.",
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
            "Start in Exploratory mode. It costs you nothing and gives you a foundation for every later question.",
            "Clean the obvious problems first. Remove or rename badly-labelled columns. The agent is robust to messy data but produces clearer results when the inputs are tidy.",
            "Give the agent a one-sentence description of the file in the context box. \"Monthly active users by plan\" beats no context at all.",
            "Save the analysis as a report when you reach a finding worth keeping. Reports are easier to share than a chart with no explanation.",
            "Use anomaly mode on customer-level data before quarterly reviews. It catches the rows your dashboards would average away.",
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
          text: "The agent could not read my file",
          id: "cannot-read",
        },
        {
          type: "paragraph",
          text: "Check that the file is a CSV, an Excel spreadsheet, or a similar tabular format. Files that mix headers, footers, and tables on the same sheet sometimes confuse the reader — copy just the table to a new sheet and upload that.",
        },
        {
          type: "heading",
          level: 3,
          text: "The analysis ran but the charts look wrong",
          id: "wrong-charts",
        },
        {
          type: "paragraph",
          text: "Usually a column was interpreted as the wrong kind of data — for example, a year being read as a number when you wanted it treated as a category. Provide a one-sentence description of the file in the context box and re-run; the agent uses that to set the right column types.",
        },
        {
          type: "heading",
          level: 3,
          text: "An anomaly check is flagging too much",
          id: "too-many-anomalies",
        },
        {
          type: "paragraph",
          text: "The data may genuinely be very noisy, or you may want a different sensitivity. Re-run in exploratory mode to see the distributions; if the spread is wide, the anomaly detector will naturally find more outliers.",
        },
        {
          type: "heading",
          level: 3,
          text: "I want to combine two files",
          id: "combine-files",
        },
        {
          type: "paragraph",
          text: "Merge them in a spreadsheet first and upload the combined file. The agent treats one analysis as one file; combining sources before upload keeps the result coherent.",
        },
      ],
    },
  ],
};
