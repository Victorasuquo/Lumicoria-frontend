import type { DocSection } from "../types";

export const integrations: DocSection = {
  slug: "integrations",
  title: "Integrations",
  icon: "Plug",
  subpages: [
    {
      slug: "overview",
      title: "Overview",
      content: [
        {
          type: "heading",
          level: 2,
          text: "Integrations",
          id: "integrations",
        },
        {
          type: "paragraph",
          text: "Lumicoria connects with the tools your team already uses. Pull documents from Google Drive, receive notifications in Slack, sync contacts from Salesforce, and more — all from within the platform.",
        },
        {
          type: "heading",
          level: 3,
          text: "Available integrations",
          id: "available-integrations",
        },
        {
          type: "capabilities",
          items: [
            { icon: "FileText", title: "Google Workspace", description: "Import from Google Drive, Docs, Sheets. Export summaries and reports back to Drive." },
            { icon: "MessageSquare", title: "Slack", description: "Send agent results to channels, receive notifications, trigger agents from Slack commands." },
            { icon: "Users", title: "Salesforce", description: "Sync customer data, enrich CRM records with AI insights, automate follow-ups." },
            { icon: "Mail", title: "Email (Gmail / Outlook)", description: "Process email attachments, draft replies, summarize threads." },
            { icon: "Calendar", title: "Google Calendar", description: "Auto-create action items from meetings, schedule follow-ups." },
            { icon: "Github", title: "GitHub", description: "Analyze repositories, review PRs, generate documentation from code." },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Setting up an integration",
          id: "setup",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Navigate to **Settings > Integrations** or visit the [Integrations Hub](/integrations)",
            "Click the integration you want to enable",
            "Follow the OAuth flow to authorize Lumicoria",
            "Configure which agents can access the integration",
            "Start using the integration — data flows automatically",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Permissions",
          text: "Each integration requests only the minimum permissions needed. You can revoke access at any time from the Integrations Hub.",
        },
        {
          type: "live-link",
          label: "Open Integrations Hub",
          href: "/integrations",
          description: "Connect your tools and start automating workflows.",
        },
      ],
    },
  ],
};
