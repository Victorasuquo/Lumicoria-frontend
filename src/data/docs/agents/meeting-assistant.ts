import type { AgentDocEntry } from "../types";

export const meetingAssistant: AgentDocEntry = {
  slug: "meeting",
  name: "Meeting Assistant",
  tagline: "Transform meeting recordings and transcripts into actionable summaries, decisions, and follow-ups.",
  icon: "Users",
  gradient: "from-violet-500 to-purple-600",
  agentPath: "/agents/meeting",
  category: "productivity",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Meeting Assistant", id: "overview" },
        {
          type: "paragraph",
          text: "The Meeting Assistant turns chaotic meetings into structured output. Paste a transcript, upload an audio file, or record live — the agent extracts summaries, action items, decisions, key points, follow-ups, and concerns automatically.",
        },
        {
          type: "heading",
          level: 3,
          text: "Why we built it",
          id: "why-we-built-it",
        },
        {
          type: "paragraph",
          text: "After every meeting, someone has to write up notes, assign action items, and chase follow-ups. This manual process is slow, inconsistent, and often gets skipped entirely. The Meeting Assistant automates it — paste or record any meeting and get structured, actionable output in seconds.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text: "Paste a meeting transcript into the text area, select the meeting type (standup, board meeting, brainstorm, etc.), and click **Generate Summary**. You'll get action items, decisions, and key points in seconds.",
        },
        {
          type: "list",
          items: [
            "**Live recording** — click Start to transcribe from your microphone in real-time using Whisper STT",
            "**Meeting mode** — capture remote speakers on Google Meet, Zoom, or Teams via tab audio sharing",
            "**Audio upload** — upload MP3, WAV, M4A files for automatic transcription",
            "**Persistent library** — all processed meetings saved to Postgres, searchable and accessible anytime",
            "**Auto-save drafts** — your transcript is saved as you type, recoverable if you close the browser",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=700&fit=crop",
          alt: "Meeting Assistant interface",
          caption: "The Meeting Assistant workspace with live transcription and summary output",
        },
        {
          type: "live-link",
          label: "Try the Meeting Assistant",
          href: "/agents/meeting",
          description: "Process your next meeting transcript or start a live recording.",
        },
      ],
    },
    {
      slug: "capabilities",
      title: "Capabilities",
      content: [
        { type: "heading", level: 2, text: "Capabilities & Features", id: "capabilities" },
        {
          type: "capabilities",
          items: [
            {
              icon: "Mic",
              title: "Live Transcription",
              description: "Record meetings directly from your browser using Whisper speech-to-text. Works with any microphone.",
            },
            {
              icon: "Monitor",
              title: "Remote Meeting Mode",
              description: "Capture audio from Google Meet, Zoom, or Teams tabs. Mixes remote speakers with your mic for complete transcription.",
            },
            {
              icon: "Upload",
              title: "Audio File Upload",
              description: "Upload MP3, WAV, M4A, OGG, or FLAC files. The agent transcribes and processes them automatically.",
            },
            {
              icon: "ListChecks",
              title: "Action Item Extraction",
              description: "Automatically identifies tasks, assignees, and deadlines from meeting conversations.",
            },
            {
              icon: "GitBranch",
              title: "Decision Tracking",
              description: "Captures decisions made during the meeting with context about who decided and why.",
            },
            {
              icon: "AlertCircle",
              title: "Concerns & Follow-ups",
              description: "Flags unresolved concerns, open questions, and items needing follow-up.",
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Meeting types",
          id: "meeting-types",
        },
        {
          type: "list",
          items: [
            "**General** — standard meeting with balanced extraction",
            "**Standup / Daily Sync** — focused on blockers, progress, and next steps",
            "**Board Meeting** — emphasis on decisions, votes, and strategic items",
            "**Brainstorm** — captures ideas, themes, and creative proposals",
            "**1-on-1** — focused on feedback, goals, and personal action items",
            "**Client Call** — tracks commitments, requirements, and follow-up tasks",
          ],
        },
        {
          type: "screenshot",
          url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=700&fit=crop",
          alt: "Meeting output with action items",
          caption: "Structured output: summary, action items, decisions, and key points",
        },
      ],
    },
    {
      slug: "how-to-use",
      title: "How to Use",
      content: [
        { type: "heading", level: 2, text: "How to Use", id: "how-to-use" },
        {
          type: "heading",
          level: 3,
          text: "Option 1: Paste a transcript",
          id: "paste-transcript",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Navigate to **Meeting Assistant** from the agents page",
            "Paste your meeting transcript into the text area",
            "Select the **meeting type** from the dropdown (standup, board, brainstorm, etc.)",
            "Click **Generate Summary**",
            "Review the structured output — summary, action items, decisions, key points",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Option 2: Live recording",
          id: "live-recording",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Click the **Start** button to begin recording from your microphone",
            "For remote meetings, click the platform button (Google Meet / Zoom / Teams) to also capture tab audio",
            "Speak naturally — text appears in real-time every ~4 seconds",
            "Click **Stop** when the meeting ends",
            "Edit the transcript if needed, then click **Generate Summary**",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Browser permissions",
          text: "You'll need to grant microphone access when prompted. For meeting mode, you'll also need to select which browser tab to share audio from.",
        },
        {
          type: "heading",
          level: 3,
          text: "Option 3: Upload audio",
          id: "upload-audio",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Click the **upload** button or drag an audio file into the upload area",
            "Supported formats: MP3, WAV, M4A, OGG, FLAC, WebM",
            "The agent transcribes the audio using Whisper, then processes it automatically",
            "Review and edit the results",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Draft auto-save",
          text: "Your transcript is automatically saved as a draft every 2 seconds. If you close the browser or navigate away, your work is preserved — just come back and it'll be right where you left it.",
        },
        {
          type: "live-link",
          label: "Try the Meeting Assistant",
          href: "/agents/meeting",
          description: "Process your next meeting now.",
        },
      ],
    },
  ],
};
