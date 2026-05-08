import type { AgentDocEntry } from "../types";

export const customerServiceAgent: AgentDocEntry = {
  slug: "customer-service",
  name: "Customer Service Agent",
  tagline:
    "A complete customer support workspace with a branded public help page, a smart draft assistant, and a self serve knowledge base that grows with every reply.",
  icon: "Headphones",
  gradient: "from-indigo-500 to-blue-600",
  agentPath: "/agents/customer-service",
  category: "communication",
  subpages: [
    // ─────────────────────────────────────────────────────────────────
    {
      slug: "overview",
      title: "Overview",
      content: [
        { type: "heading", level: 2, text: "Customer Service Agent", id: "overview" },
        {
          type: "paragraph",
          text:
            "The Customer Service Agent gives your business a clean, professional way to handle customer questions. Your customers reach you through a single branded page that lives at your own short web address. Your team handles every request from one focused inbox. Replies get drafted in your voice, customers stay informed by email, and your team stays informed inside the app.",
        },
        {
          type: "paragraph",
          text:
            "The result is a support experience that feels considered, not improvised. Customers know where to go when they have a question. Your team knows where to find every conversation. And the work of writing thoughtful replies gets faster the more you use the workspace.",
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
            "A branded public page where your customers can submit questions in seconds, no account needed.",
            "A help center on the same page where customers can read answers to common questions before they file a request.",
            "A focused inbox where your team works through requests, sees full conversation history, and replies in a few clicks.",
            "A draft assistant that writes a suggested reply for any open request, ready for an operator to review and send.",
            "Reusable reply templates so common cases get answered consistently and quickly.",
            "Email confirmation to customers on every step, sent in your brand voice.",
            "Real time alerts to your team whenever a new request arrives.",
            "A simple analytics view that shows volume, response time, satisfaction, and the topics your customers ask about most.",
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
          text:
            "This workspace is designed for any business that wants to give its customers a serious, branded support experience without standing up an enterprise help desk. It works for solo founders who want to look credible, for small support teams that want to move faster, and for companies that have outgrown shared inboxes but are not ready to commit to traditional ticketing systems with their cost and complexity.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text:
            "Open the Customer Service Agent. Click Branding, set your name, your colors, and your short web address. Click Copy portal URL and open the link in a new tab to preview what your customers will see. Submit a test request. It will appear in your inbox within seconds.",
        },
        {
          type: "live-link",
          label: "Open the Customer Service Agent",
          href: "/agents/customer-service",
          description: "Your support workspace.",
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
              icon: "Globe",
              title: "Branded public page",
              description:
                "Share one short web address with your customers. The page wears your colors, your logo, and your tone, and works equally well on a desktop, a phone, or as a link in an email signature.",
            },
            {
              icon: "MessageSquare",
              title: "Single focused inbox",
              description:
                "Every request lands in one place. Filter by status, priority, or category. Click into any request to see the full conversation, the customer profile, and a reply box that is always ready.",
            },
            {
              icon: "Sparkles",
              title: "Smart draft suggestions",
              description:
                "When you need help phrasing a reply, the workspace can draft one for you in your brand voice. Review the draft, edit a sentence or two, and send.",
            },
            {
              icon: "BookOpen",
              title: "Self serve help center",
              description:
                "Publish answers to common questions on the same branded page. Customers find their answer themselves, you reduce inbound volume, and the people who do reach out are the ones who really need a human.",
            },
            {
              icon: "Palette",
              title: "Brand controls",
              description:
                "Choose your colors, your logo, your tagline, your published response time, and the topics your customers can pick from. Everything they see reflects your business.",
            },
            {
              icon: "Bell",
              title: "Smart notifications",
              description:
                "Customers receive clean professional emails on submission and on every reply. Your team receives instant alerts in the app and as native browser notifications, so nothing important slips through.",
            },
            {
              icon: "BarChart3",
              title: "Live analytics",
              description:
                "See your volume, your average response time, your satisfaction rate, and the categories your customers ask about most. Switch the time range to see how your numbers move over a day, a week, a month, a quarter, or a year.",
            },
            {
              icon: "Shield",
              title: "Enterprise grade safety",
              description:
                "Your data stays private to your business. Public submissions are protected against abuse. Customer information is handled with care at every step.",
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Reply templates that come ready to use",
          id: "default-templates",
        },
        {
          type: "paragraph",
          text:
            "Every workspace begins with a set of professionally written reply templates. They cover the patterns your team will use most often, so you can be productive on day one. You can use them as they are, edit them to match your voice more precisely, or write your own from scratch.",
        },
        {
          type: "list",
          items: [
            "Acknowledge Inquiry. A polite first response that reassures the customer their request was received and is being looked at.",
            "Request More Details. A friendly prompt that asks the customer for the specific information your team needs to investigate properly.",
            "Technical Resolution. A clear confirmation that an issue has been fixed, with placeholders for what changed and what the customer should do next.",
            "Billing Inquiry Response. A neutral, factual reply for billing questions, designed to address the issue without escalating tone.",
            "Escalation Notice. A handoff message that tells the customer their request has been routed to a specialist and sets clear expectations for the next reply.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Templates as one click replies",
          text:
            "Each template appears as a clickable label above the reply box. One click drops the body into the reply, ready to personalize and send. The templates you use most often get tracked so you can see what is pulling weight.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "setup-and-branding",
      title: "Setup and branding",
      content: [
        { type: "heading", level: 2, text: "Make the support page yours", id: "setup-and-branding" },
        {
          type: "paragraph",
          text:
            "Before you share anything with customers, take a few minutes to set up your branding. The settings here drive every customer facing surface in the workspace, from the public page to the from name on the confirmation email. You only do this once.",
        },
        {
          type: "heading",
          level: 3,
          text: "Open Branding",
          id: "open-branding",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "From the workspace, click the Branding button at the top right.",
            "Choose your short web address. Pick something short, recognisable, and stable. Customers will read this in emails and click on it, so it should reflect your business name.",
            "Set your display name. This appears in the header of your public page, in the from name on the confirmation email, and in the email signature.",
            "Add your logo. Any HTTPS image link works. Square logos look best.",
            "Pick a primary color and an accent color. The two combine into the gradient at the top of your public page. The primary color is also used on the submit button.",
            "Write your tagline. The first line becomes the headline customers see, the rest is supporting copy.",
            "Set your published response time. The page will display this prominently, so set it to something you can confidently meet.",
            "Add your support email if you have one. It will appear as a fallback on the page and as the reply to address on outbound mail.",
            "List the topics your customers can choose from when they submit a request. These become friendly buttons on the form and help your team route work.",
            "Click Save branding. Your settings take effect immediately on the public page.",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Choose your short address carefully",
          text:
            "Once you start sharing your support page, the short address becomes part of every printed link, business card, and email signature. Changing it later can break those links. Pick a value you are happy to live with.",
        },
        {
          type: "heading",
          level: 3,
          text: "Preview the page",
          id: "preview",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Click Copy portal URL in the top toolbar.",
            "Paste the link into a private window so you see exactly what an unauthenticated visitor sees.",
            "Confirm your colors, logo, headline, and topic list look right.",
            "Submit a test request to see the full path a customer experiences.",
            "Watch the request appear in your inbox, write a reply, and send it.",
            "Check the email that arrives at the test address. Confirm the wording, the from name, and the signature look professional.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Iterate freely",
          text:
            "You can revisit Branding at any time. Color tweaks, logo changes, and tagline edits take effect on the next page load. Customers in flight on the old version simply see the new one when they refresh.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "operator-inbox",
      title: "Working in the inbox",
      content: [
        { type: "heading", level: 2, text: "Handling a request", id: "operator-inbox" },
        {
          type: "paragraph",
          text:
            "The inbox is where your team spends most of its time. Every request your customers submit, however they reach you, lands in this single view. The flow from arrival to resolution is short and unfussy.",
        },
        {
          type: "heading",
          level: 3,
          text: "Reading the queue",
          id: "queue",
        },
        {
          type: "paragraph",
          text:
            "Requests are listed newest first. A row shows you the request reference, a priority badge, a status badge, an optional category, the customer name or email, and how long ago they submitted. Use the filter pills above the list to narrow the view to Open, In Progress, or Resolved cases.",
        },
        {
          type: "heading",
          level: 3,
          text: "Selecting a request",
          id: "selecting",
        },
        {
          type: "paragraph",
          text:
            "Click any row to load the request below. You will see the full conversation history laid out as bubbles. Replies from your team are aligned to the right and shown on a dark background. Replies from the customer are aligned to the left on a light background. Replies that were drafted with assistance carry a clear label so you always know which messages were human written and which were drafted before sending.",
        },
        {
          type: "heading",
          level: 3,
          text: "Composing a reply",
          id: "composing",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "If a template fits, click it. The reply box fills with the template body. Personalize the customer name, fill in any details, and send.",
            "If you would like a draft to start from, click Draft Suggestion. A suggested reply will fill the box, written in your brand voice and informed by similar past cases. Treat it as a starting point. Read it, edit it, and make it your own.",
            "Click Send Reply when you are ready. The reply is delivered to the customer by email and the request automatically moves to In Progress.",
            "Click Mark Resolved when the case is closed. The customer can still come back to add follow up information, but the request leaves the active queue.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Manual entry",
          text:
            "Use the New Ticket button in the toolbar when a customer reaches you through a different channel, for example a phone call or a personal email, and you want to keep that conversation alongside the rest of your work.",
        },
        {
          type: "heading",
          level: 3,
          text: "Status and lifecycle",
          id: "lifecycle",
        },
        {
          type: "paragraph",
          text:
            "Requests start in Open. The first reply from your team moves them to In Progress automatically. Marking a request Resolved closes it out and removes it from the active queue. You can reopen any closed request if a customer comes back. Closed and Cancelled are final states for cases that should not be acted on further. Deleted requests are removed from view but not lost; an admin can restore them if needed.",
        },
        {
          type: "heading",
          level: 3,
          text: "Privacy and isolation",
          id: "isolation",
        },
        {
          type: "paragraph",
          text:
            "Your conversations stay private to your business. Members of your team see only your requests, your customers, and your settings. There is no cross over with other customers of the platform.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "draft-assistant",
      title: "Draft assistant",
      content: [
        { type: "heading", level: 2, text: "Replies in your voice, faster", id: "draft-assistant" },
        {
          type: "paragraph",
          text:
            "The draft assistant is a single button in the reply box. Click it and the workspace prepares a suggested reply for the request you have open. It is designed to do the part of the work that takes time, drafting a thoughtful, on brand response, while leaving the judgement that matters to your team.",
        },
        {
          type: "heading",
          level: 3,
          text: "How it stays in your voice",
          id: "draft-context",
        },
        {
          type: "paragraph",
          text:
            "The draft is shaped by what your business has already published. The branding you set, the tagline, your published response time, the templates your team uses most, and the answers you have collected in your help center all guide the draft. The result reads like something your team would write, not a generic reply.",
        },
        {
          type: "heading",
          level: 3,
          text: "Sources alongside the draft",
          id: "citation-chips",
        },
        {
          type: "paragraph",
          text:
            "Whenever the draft pulls from a published article or a previous resolution, the workspace shows you which sources informed it. You see them as small chips just below the draft text. Click any chip to open the source and verify the answer is current. If a chip references something out of date, edit the draft before sending and update the underlying article when you have a moment.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Why this approach",
          text:
            "A draft that comes out of nowhere is just a guess. A draft grounded in your actual published material is closer to a colleague who has been on your team for a year. The more you publish, the better the drafts become.",
        },
        {
          type: "heading",
          level: 3,
          text: "Make the workspace smarter",
          id: "feed-the-knowledge",
        },
        {
          type: "paragraph",
          text:
            "Two paths exist for adding knowledge that the draft assistant can use later.",
        },
        {
          type: "list",
          items: [
            "Generate FAQ from Tickets. Type a topic, click Generate, and the workspace produces a polished FAQ document. You can copy it, download it, save it for the assistant to learn from, or publish it on your help center in one click.",
            "Direct upload. If you already have help documents, brand guidelines, or product information in PDF, Word, or Markdown, upload them through the Document Agent. Anything you upload becomes part of the knowledge the draft assistant draws on.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "A self reinforcing loop",
          text:
            "Every published answer does two things at once. It teaches the draft assistant to write better suggestions on the same topic. And it gives a future customer the chance to find their answer themselves before they ever file a request.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "public-portal",
      title: "Your public page",
      content: [
        { type: "heading", level: 2, text: "What your customers see", id: "public-portal" },
        {
          type: "paragraph",
          text:
            "Your customers never see the workspace. They see a single branded page that you control. The page has a clear hero with your logo, your tagline, and your published response time. Below it, a thoughtful form lets them submit a request without creating an account.",
        },
        {
          type: "heading",
          level: 3,
          text: "Submitting a request",
          id: "public-submit",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "A visitor lands on your page, reads your tagline, and decides whether to ask a question or browse your help center first.",
            "If they decide to file a request, they fill in their name, email, subject, body, and optional priority and category.",
            "When they submit, the page validates the form and confirms receipt instantly.",
            "They are taken to a confirmation page that shows their reference number and a clean message saying you will be in touch.",
            "A confirmation email arrives in their inbox within seconds, signed in your brand voice, with the same reference number and a link they can return to later.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Following up later",
          id: "follow-up",
        },
        {
          type: "paragraph",
          text:
            "Customers can return to their request at any time using the link in their confirmation email. They are asked to confirm the email address they used so only the original requester can see the conversation. Once confirmed, they see the timeline of replies your team has sent and a box where they can add follow up notes. Their follow up appears alongside the original request in your inbox so the conversation stays in one place.",
        },
        {
          type: "heading",
          level: 3,
          text: "The help center",
          id: "help-center",
        },
        {
          type: "paragraph",
          text:
            "If you publish answers to common questions, they live on a help center page that wears the same branding as your support form. Customers can search the page, browse featured articles, and read full answers without ever filing a request. After reading an article they can mark it helpful or not helpful, which gives you a signal about which answers are actually useful and which need to be revised.",
        },
        {
          type: "callout",
          variant: "info",
          title: "From answer to article in one click",
          text:
            "Inside the workspace, when you draft an FAQ on a topic, the Publish button puts it live on your help center immediately. The article is searchable, ranked, and ready for your customers within seconds.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "notifications",
      title: "Notifications",
      content: [
        { type: "heading", level: 2, text: "Keeping everyone informed", id: "notifications" },
        {
          type: "paragraph",
          text:
            "The notification system was designed around two simple rules. Customers should always know what is happening with their request. Your team should never be drowned in email. Different channels carry the right kind of message to the right audience.",
        },
        {
          type: "heading",
          level: 3,
          text: "What your customers receive",
          id: "customer-notifications",
        },
        {
          type: "paragraph",
          text:
            "Customers receive email and only email. The emails are clean, professional, and signed by your business. They never look automated.",
        },
        {
          type: "list",
          items: [
            "When a customer submits a request, they receive a confirmation. It contains a reference number, the original message for their records, your published response time, and a link they can return to later.",
            "When your team replies, the customer receives the reply directly in their inbox. The original message is quoted at the bottom in the same way Gmail or Outlook would quote a thread, so the conversation stays readable on any device.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "What your team receives",
          id: "operator-notifications",
        },
        {
          type: "paragraph",
          text:
            "Your team is never emailed about new requests. A busy business can take in hundreds of requests a day, and email at that volume becomes noise. Instead, the workspace uses two channels designed for high volume.",
        },
        {
          type: "list",
          items: [
            "An in app alert. The bell icon at the top of the interface ticks up. Opening the alerts shows the request priority, the customer name, and a snippet of the subject. Clicking through opens the request in the inbox.",
            "A native browser notification. If your team has granted permission, the same alert fires as a notification on the desktop, so they see it even when the app is in a background tab.",
            "A delivery confirmation. After sending a reply, an in app message confirms the email reached the customer. No browser notification is sent for confirmations because your team just initiated the action.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Allow browser notifications",
          text:
            "On first visit, your browser may ask whether the workspace can send notifications. Click Allow. If you accidentally clicked Block, you can change it from the lock icon in the address bar.",
        },
        {
          type: "heading",
          level: 3,
          text: "When something goes wrong",
          id: "notification-resilience",
        },
        {
          type: "paragraph",
          text:
            "Notifications are designed to be resilient. If an email cannot be delivered for any reason, the request itself is still received and your team is still alerted. If a browser notification cannot be sent, the in app alert still appears in the bell tray. The system errs on the side of you and your customer always knowing where things stand.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "analytics",
      title: "Analytics",
      content: [
        { type: "heading", level: 2, text: "Understand your support performance", id: "analytics" },
        {
          type: "paragraph",
          text:
            "The analytics view at the top of the workspace gives you a live picture of how your support operation is performing. The numbers update as work moves through the inbox, so what you see is always current.",
        },
        {
          type: "heading",
          level: 3,
          text: "What the cards mean",
          id: "analytics-cards",
        },
        {
          type: "list",
          items: [
            "Open Tickets. How many requests are currently waiting for a first reply.",
            "Avg Response. The average time between a customer submitting a request and your team responding for the first time, over your selected time range.",
            "Total Requests. The number of requests submitted within the selected time range, regardless of their current status.",
            "Satisfaction. The percentage of resolved requests that ended on a positive note, based on signals collected during the conversation.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Customer Sentiment",
          id: "sentiment-panel",
        },
        {
          type: "paragraph",
          text:
            "Below the four cards is a breakdown of customer sentiment over the time range. You see the share of requests that came in or ended on a positive note, the share that were neutral, and the share that were negative. New workspaces with no recorded sentiment will show a friendly placeholder rather than a fabricated number.",
        },
        {
          type: "heading",
          level: 3,
          text: "Ticket Categories",
          id: "categories-panel",
        },
        {
          type: "paragraph",
          text:
            "Below sentiment is a count of requests by category, ordered by frequency. The labels are the topics you configured in branding. Watch this panel over time. The categories that grow tell you where your product needs better self serve answers, where your onboarding is unclear, or where a feature is causing friction.",
        },
        {
          type: "heading",
          level: 3,
          text: "Time range",
          id: "time-ranges",
        },
        {
          type: "paragraph",
          text:
            "Switch the range at the top of the page between today, the past week, the past month, the past quarter, or the past year. Every card and panel recalculates instantly so you can compare any window you like.",
        },
        {
          type: "callout",
          variant: "info",
          title: "If your numbers look quiet",
          text:
            "A new workspace will report zeros at first. This is expected. The analytics view computes from real activity. As your team handles real requests, the numbers begin to move and the categories panel starts to surface real patterns.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "trust",
      title: "Trust and privacy",
      content: [
        { type: "heading", level: 2, text: "How your data is protected", id: "trust" },
        {
          type: "paragraph",
          text:
            "The Customer Service Agent handles real customer information, including names, email addresses, and the contents of every request. We treat that data with the seriousness it deserves at every step.",
        },
        {
          type: "heading",
          level: 3,
          text: "Your data stays your data",
          id: "isolation-guarantee",
        },
        {
          type: "list",
          items: [
            "Every request, every reply, and every setting is private to your business. Other customers of the platform never see your information.",
            "Your team only sees the requests, articles, and settings that belong to your business.",
            "Your customers only see the conversations that belong to them. A reference number alone is not enough to view a request; the original email address is also required.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Defending the public page",
          id: "abuse-protection",
        },
        {
          type: "paragraph",
          text:
            "Your public page is open to anyone with the link, which is the point. To keep it safe, the page is protected against the kinds of abuse that anonymous forms commonly attract. Excessive submissions from a single source are slowed down. Submissions are inspected for malicious content before they ever reach your inbox. If you receive unusual volume from a particular topic or region, an additional verification step can be turned on for your page.",
        },
        {
          type: "heading",
          level: 3,
          text: "Customer information handling",
          id: "customer-data",
        },
        {
          type: "paragraph",
          text:
            "Customer email addresses and request bodies are personal information. They are never used outside the conversation they belong to and are never shared between businesses. They are stored long enough to support your team and your customer through the conversation, then retained according to your account's data retention settings.",
        },
        {
          type: "heading",
          level: 3,
          text: "Audit and accountability",
          id: "audit",
        },
        {
          type: "paragraph",
          text:
            "Important actions in the workspace are recorded for accountability. You can see who replied to which request, who edited which article, and who changed the branding settings. The audit record helps your team take ownership of decisions and is useful for compliance reviews.",
        },
        {
          type: "callout",
          variant: "info",
          title: "A note on retention",
          text:
            "Deleted requests are removed from active views but kept in your account for a recovery period in case a deletion was a mistake. Permanent removal happens automatically once the recovery window has passed.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "best-practices",
      title: "Best practices",
      content: [
        { type: "heading", level: 2, text: "Getting the most out of the workspace", id: "best-practices" },
        {
          type: "heading",
          level: 3,
          text: "Set realistic response times",
          id: "set-sla",
        },
        {
          type: "paragraph",
          text:
            "The response time you publish is the first promise you make to a customer. Pick a number you can actually meet on a typical day. A slightly longer published time that you always honour creates more trust than a short time you regularly miss.",
        },
        {
          type: "heading",
          level: 3,
          text: "Publish answers to your most common questions",
          id: "publish-articles",
        },
        {
          type: "paragraph",
          text:
            "After your first week of real requests, look at the categories panel and write a help center article for the top three or four topics. The investment is small, the article remains useful indefinitely, and a good article often deflects ten or twenty future requests.",
        },
        {
          type: "heading",
          level: 3,
          text: "Make templates short and personal",
          id: "templates-personal",
        },
        {
          type: "paragraph",
          text:
            "The best templates are short outlines, not finished replies. Leave space for the operator to add a sentence about the customer's specific situation. A reply that begins with the customer's name and references something they actually wrote feels personal even when the rest of the body is from a template.",
        },
        {
          type: "heading",
          level: 3,
          text: "Use the draft assistant for the hard ones",
          id: "draft-strategy",
        },
        {
          type: "paragraph",
          text:
            "Quick questions usually deserve a quick personal reply. The draft assistant earns its keep on the harder cases, where you need to explain something carefully, refer to a published policy, or thread a needle between two competing concerns. Save the click for the moments where it actually saves you time.",
        },
        {
          type: "heading",
          level: 3,
          text: "Review categories monthly",
          id: "review-categories",
        },
        {
          type: "paragraph",
          text:
            "Take ten minutes a month to look at the categories panel. The list shifts as your product evolves. Categories that grow point at issues you should fix at the source. Categories that shrink usually mean a help article landed and is doing its job. Adjust your topic list and your help center as patterns emerge.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Treat support as a feedback channel",
          text:
            "Your support inbox is the most direct unfiltered feedback channel your business has. Patterns that emerge there should reach your product, design, and operations teams quickly. The Customer Service Agent makes those patterns visible at a glance.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "troubleshooting",
      title: "Troubleshooting",
      content: [
        { type: "heading", level: 2, text: "Common questions", id: "troubleshooting" },
        {
          type: "heading",
          level: 3,
          text: "My public page shows a Page not found message",
          id: "page-not-found",
        },
        {
          type: "paragraph",
          text:
            "The short address in the link does not match your branding settings. Open Branding from the workspace, confirm the short address is correct, and use the Copy portal URL button to get an exact link. Sharing the copied link will always work.",
        },
        {
          type: "heading",
          level: 3,
          text: "The draft assistant did not produce sources",
          id: "no-citations",
        },
        {
          type: "paragraph",
          text:
            "The draft was written without referencing your published material. This usually means you have not yet published help articles or uploaded documents on the topic. Publish a short FAQ on the question or upload a relevant document, then try the assistant again on a similar request.",
        },
        {
          type: "heading",
          level: 3,
          text: "A confirmation email never arrived for a customer",
          id: "no-email",
        },
        {
          type: "list",
          items: [
            "Ask the customer to check their spam folder. Branded mail from a new domain often gets filtered on the first send.",
            "Confirm your team entered the email correctly when the request was logged manually. A typo in an email address is the most common cause.",
            "If you are using a custom from address, confirm the domain has been verified for sending. Verifying the domain is a one time step that improves deliverability dramatically.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "I see a permission error when saving branding",
          id: "permission-denied",
        },
        {
          type: "paragraph",
          text:
            "Your account does not yet have permission to edit branding for this workspace. If you are part of a multi user account, ask an admin to grant the customer service permission. Solo accounts are granted the permission automatically.",
        },
        {
          type: "heading",
          level: 3,
          text: "The status link in customer emails goes to the wrong address",
          id: "wrong-host",
        },
        {
          type: "paragraph",
          text:
            "The status link is built from the public address configured for your account. If your account is part of a custom installation, an admin can update the public address in the platform settings. After the change, new emails will carry the correct link. Already sent emails keep the old link.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Need more help",
          text:
            "If you run into something that is not covered here, contact your account team. Include a screenshot of what you are seeing and the reference number of any specific request involved.",
        },
      ],
    },
  ],
};
