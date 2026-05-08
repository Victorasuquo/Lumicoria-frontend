import type { AgentDocEntry } from "../types";

export const customerServiceAgent: AgentDocEntry = {
  slug: "customer-service",
  name: "Customer Service Agent",
  tagline:
    "An end to end customer support workspace with a public portal, knowledge base, and a draft engine that grounds replies in your own documents.",
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
            "The Customer Service Agent is a full operator workspace for handling inbound questions from your end users. It is built around four parts. A public portal that your customers can use without an account. An operator inbox where your team works tickets. A knowledge base that learns from every FAQ you publish. And a notification system that keeps everyone informed without flooding inboxes.",
        },
        {
          type: "paragraph",
          text:
            "Each tenant on Lumicoria runs an isolated copy of this stack. Your tickets, templates, articles, and branding live under your organization id and never leak across tenants. A single share link such as app.lumicoria.ai/portal/your-slug is enough for a customer to file a ticket, watch its status, and reply to follow ups, all without registering an account on Lumicoria.",
        },
        {
          type: "heading",
          level: 3,
          text: "What ships in the box",
          id: "what-ships",
        },
        {
          type: "list",
          items: [
            "A branded public portal at /portal/{slug} that you can share on your website, in email signatures, or via QR codes.",
            "A help center at /portal/{slug}/help where customers can read articles you publish before they ever open a ticket.",
            "An operator inbox with conversation threading, status filters, AI draft replies, quick reply templates, and analytics.",
            "An email notification path for customers (confirmation when they file a ticket, reply emails when an operator responds).",
            "An in app and web push path for operators (new ticket alerts, delivery confirmations).",
            "Five canonical response templates that are seeded for every organization on first read.",
            "An analytics endpoint that aggregates real ticket data over a chosen time window.",
            "Multi tenant scoping enforced at the database, API, and frontend layers.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Who it is for",
          id: "who-its-for",
        },
        {
          type: "paragraph",
          text:
            "Solo operators running a small product can use the agent on a personal account. The same flows scale to teams with shared inboxes once the underlying organization is configured for multiple operators. SaaS platforms reselling support to their own customers can run one organization per client and let each client own their own portal slug, branding, and ticket history.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quick start",
          text:
            "Open the agent at /agents/customer-service. Click Branding and set a slug, a display name, and your colors. Click Copy portal URL and open the link in an incognito window to see what your customers will see. The first ticket you submit lands in your operator inbox in under a second.",
        },
        {
          type: "live-link",
          label: "Open the Customer Service Agent",
          href: "/agents/customer-service",
          description:
            "The operator workspace. Requires an authenticated account with the customer service permission.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "capabilities",
      title: "Capabilities",
      content: [
        { type: "heading", level: 2, text: "What the agent can do", id: "capabilities" },
        {
          type: "capabilities",
          items: [
            {
              icon: "MessageSquare",
              title: "Ticket lifecycle",
              description:
                "Create, list, filter, reply to, transition, soft delete. Each ticket carries a public id like TK-abc12345 that customers see in emails and on the status page.",
            },
            {
              icon: "Sparkles",
              title: "AI Draft with grounded citations",
              description:
                "One click on a ticket assembles RAG chunks from your knowledge base, prior resolved tickets, and the best matching template, then asks the LLM to draft a reply. Sources are returned alongside the draft so the operator can verify before sending.",
            },
            {
              icon: "BookOpen",
              title: "Knowledge base ingestion",
              description:
                "Generate an FAQ on a topic and click Save to Knowledge Base. The text flows through the same RAG pipeline that powers your documents, scoped to your organization. From that point on, every AI Draft for related questions retrieves it.",
            },
            {
              icon: "Globe",
              title: "Public help center",
              description:
                "Articles you publish appear at /portal/{slug}/help with the same branding as your support form. Visitors can read, search, and vote on articles. A single Publish on Help Center button turns a generated FAQ into a live article.",
            },
            {
              icon: "Palette",
              title: "Tenant branding",
              description:
                "Logo, primary color, accent color, hero copy, support email, response time SLA, and a list of public categories. The same record drives the portal, the help center, the email from name, and the email reply to address.",
            },
            {
              icon: "Bell",
              title: "Multi channel notifications",
              description:
                "Customers receive plain professional emails on submission and on every operator reply. Operators receive in app and web push notifications for new tickets, plus an in app delivery confirmation when a reply is sent. Operators are never emailed about new tickets.",
            },
            {
              icon: "BarChart3",
              title: "Real analytics",
              description:
                "Total requests, average first response time, satisfaction rate, common issue categories, template usage, and sentiment trends. All values are computed from real ticket and reply rows in Postgres over a chosen 1d, 7d, 30d, 90d, or 1y window.",
            },
            {
              icon: "Shield",
              title: "Production grade safety",
              description:
                "All writes use parameterized SQLAlchemy. Public endpoints are rate limited via Redis. User content is sanitized with bleach before storage. Public status checks require the original submitter email so ticket ids cannot be enumerated.",
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Five canonical templates seeded for every organization",
          id: "default-templates",
        },
        {
          type: "paragraph",
          text:
            "The first time an organization opens the templates list, the agent inserts five default templates. They are tagged is_default and you can edit, soft delete, or reset them at will. These five cover the most common reply patterns and let your operators be productive on day one.",
        },
        {
          type: "list",
          items: [
            "Acknowledge Inquiry. A polite acknowledgement that buys time while the operator investigates.",
            "Request More Details. A structured prompt that asks the customer for the specifics most often missing from a first message.",
            "Technical Resolution. A confirmation that a technical issue is fixed, with placeholders for what changed and what the customer should do next.",
            "Billing Inquiry Response. A neutral, factual reply for billing questions with placeholders for the breakdown of the charge or credit.",
            "Escalation Notice. A handoff message that informs the customer their ticket has been routed to a specialist and sets expectations for the next reply.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Templates as quick replies",
          text:
            "Every template appears as a clickable pill above the reply composer. One click inserts the body into the textarea so the operator can edit and send. Each click bumps the template usage_count, which then surfaces in analytics so you can tell which canned responses are pulling weight.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "setup-and-branding",
      title: "Setup and branding",
      content: [
        { type: "heading", level: 2, text: "Configure your portal", id: "setup-and-branding" },
        {
          type: "paragraph",
          text:
            "Before you share anything with customers, set up your portal branding. This single record drives the public portal, the help center, the email from name, and the link customers see at the bottom of their confirmation email. You only need to do this once per organization.",
        },
        {
          type: "heading",
          level: 3,
          text: "Open the branding modal",
          id: "open-branding",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "From the operator workspace at /agents/customer-service, click the Branding button at the top right.",
            "Fill in the URL slug. This is the public path, so use something short and recognisable. Allowed characters are a to z, 0 to 9, and the hyphen. The slug is unique across all organizations on Lumicoria.",
            "Set the display name. This appears in the hero of the public portal, in the from name on customer emails, and as the signature.",
            "Add a logo URL. SVG renders crispest. Any HTTPS URL works. The portal sizes the logo at roughly 40 pixels.",
            "Pick a primary color and an accent color. The two combine into the gradient that fills the portal hero. The primary color is also the submit button color and the active category pill color.",
            "Write a hero copy. The first line is rendered as the H1, additional lines render as supporting text below.",
            "Set your SLA in minutes. The portal renders a sentence saying you typically reply within that many minutes. Be honest, customers see this before they ever open a ticket.",
            "Optionally add a public support email. It appears in the trust strip beneath the hero and as the reply to address on customer emails.",
            "List your public categories, comma separated, in snake case. These become the category pills on the public form and feed the AI Draft logic.",
            "Click Save branding. The slug is locked at this point in the sense that it is now the share URL. You can change it later, but any links printed on business cards or QR codes will break.",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Choose your slug carefully",
          text:
            "The slug becomes the public URL segment. If you change it later, any links you have already shared will return a Portal not found page. Pick a value you are willing to live with.",
        },
        {
          type: "heading",
          level: 3,
          text: "Verify the portal",
          id: "verify-portal",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Click Copy portal URL in the operator toolbar.",
            "Paste it into an incognito window so you see what an unauthenticated visitor sees.",
            "Confirm the hero gradient, logo, display name, and hero copy are correct.",
            "Confirm the trust strip shows your SLA minutes and the Browse Help Center link.",
            "Try the form by filling in name, email, subject, body, and submitting.",
            "You should land on the status page with a confirmation banner, the ticket id, and a reply timeline that is initially empty.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Required environment for emails",
          id: "email-env",
        },
        {
          type: "paragraph",
          text:
            "Customer emails go out through the platform email service, which uses Resend as the primary provider. Set the following in your backend .env file. If RESEND_API_KEY is missing, the agent still works end to end, the email is silently skipped and a warning is logged.",
        },
        {
          type: "code",
          language: "bash",
          code:
            "RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx\nEMAIL_FROM_ADDRESS=noreply@yourdomain.com\nEMAIL_FROM_NAME=Your Brand Support\nPUBLIC_BASE_URL=https://app.yourdomain.com",
        },
        {
          type: "callout",
          variant: "info",
          title: "About PUBLIC_BASE_URL",
          text:
            "This is the URL that gets stamped on every status link in customer emails. It must be the public address customers can reach in a browser. In local development point it at http://localhost:8080 (or whichever port your frontend is served on). In production point it at your real domain.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "operator-inbox",
      title: "Operator inbox",
      content: [
        { type: "heading", level: 2, text: "Working a ticket from the operator side", id: "operator-inbox" },
        {
          type: "paragraph",
          text:
            "The operator workspace is the heart of the agent. Every ticket your customers submit, whether through the portal, a future widget, or a future inbound email integration, flows into this single inbox. Tickets are scoped to your organization automatically, so an operator on one tenant never sees another tenant's tickets even if they share the same Lumicoria install.",
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
            "Tickets render newest first, with five status filter pills above the list. All shows everything that is not soft deleted. Open shows tickets that have never been replied to. In Progress shows tickets where an operator has sent at least one reply but has not marked the case resolved. Resolved shows cases the operator closed out. Each row carries the public ticket id, a priority badge, a status badge, the optional category, the customer name or email, and a relative submitted timestamp.",
        },
        {
          type: "heading",
          level: 3,
          text: "Selecting a ticket",
          id: "selecting",
        },
        {
          type: "paragraph",
          text:
            "Clicking a row loads the ticket detail in the right pane below the queue. The reply composer is always rendered. Until a ticket is selected, the textarea and buttons are disabled with a helper line that reads Select a ticket from the queue to start. Once a ticket is selected, the conversation history appears as a stack of bubbles. Operator replies render right aligned with a dark background. Customer replies render left aligned with a light background. AI assisted replies carry an explicit AI Draft badge.",
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
            "Choose a quick reply template if one fits, or skip this step and type from scratch. Quick reply pills appear above the textarea and reflect every template the organization owns, including the five seeded defaults.",
            "Edit the text. Templates are starting points, not contracts. Personalise the customer name, fill in the placeholders, and remove any line that does not apply.",
            "Optionally click AI Draft to ask the agent to write the response for you. The button is disabled until a ticket is selected. While the call is in flight a spinner shows. The result fills the textarea and a row of citation chips appears below it, one chip per source the agent used.",
            "Review the citation chips. Each chip shows the source title and page when available. The agent only cites material that already lives in your organization's knowledge base, so a chip you do not recognise usually means a help article you forgot about, not the model hallucinating.",
            "Click Send Reply. The reply is persisted as a row in the ticket_replies table, the ticket transitions from Open to In Progress automatically, and the customer receives an email with the reply body inline.",
            "Optionally click Mark resolved if your reply closes the loop. The ticket flips to Resolved and the resolved_at timestamp is recorded. You can still reopen by patching the status back to Open or In Progress.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Manual ticket entry",
          text:
            "Click New Ticket in the toolbar to log a customer inquiry that arrived through a different channel. The form takes the customer email, optional name, subject, body, priority, and category, and creates a row with channel set to manual.",
        },
        {
          type: "heading",
          level: 3,
          text: "Status transitions and lifecycle",
          id: "lifecycle",
        },
        {
          type: "paragraph",
          text:
            "Tickets start in Open. The first operator reply transitions the ticket to In Progress automatically unless the operator explicitly chooses a different status. Marking a ticket Resolved sets resolved_at and removes it from the default Open and In Progress filters. Closed and Cancelled are terminal states intended for tickets that should not be acted on further. Soft delete via the delete endpoint sets deleted_at and the row stops appearing in any list, but it stays in the database for audit and undelete purposes.",
        },
        {
          type: "heading",
          level: 3,
          text: "Tenant isolation in the inbox",
          id: "isolation",
        },
        {
          type: "paragraph",
          text:
            "Every list, get, update, reply, and delete query filters by the operator's organization id before anything else. There is no path through the API where a missing organization filter could expose another tenant's data. The filter is enforced at the SQL layer, not the application layer, which means even a buggy frontend cannot accidentally request a ticket that belongs to a different organization.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "ai-draft",
      title: "AI Draft and the knowledge base",
      content: [
        { type: "heading", level: 2, text: "How AI Draft works", id: "ai-draft" },
        {
          type: "paragraph",
          text:
            "AI Draft is a single button on the reply composer that asks the agent to generate a grounded reply for the currently selected ticket. The word grounded is the important one. The model is not asked to imagine an answer. It is given the ticket, a small set of relevant excerpts from your organization's knowledge base, the most recently resolved tickets in the same category, and the best matching response template. Then it composes a draft.",
        },
        {
          type: "heading",
          level: 3,
          text: "Where the context comes from",
          id: "draft-context",
        },
        {
          type: "list",
          items: [
            "Top five RAG chunks from your ingested documents. The retrieval uses the same embedding pipeline that powers the rest of Lumicoria. It is filtered by your organization id, so an operator never sees suggestions seeded by a different tenant's documents.",
            "Top three resolved tickets in the same category. Their subject is matched against the current ticket's subject with an escaped ILIKE search, and the last operator or AI reply on each is included so the model can learn from how the team handled similar cases.",
            "The best matching response template by category. The template body is included so the model has a canonical structure to follow when one exists.",
            "The organization's branding hints. Display name, support email, and SLA minutes are rendered into the prompt header so the draft uses the right voice and signs off correctly.",
            "The customer profile. Name and email are passed through so the draft addresses the customer by name when known.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Why this matters",
          text:
            "An ungrounded draft is just an AI guess. A grounded draft is the model writing in your voice, citing your documents, and following the same response patterns your team has used before. Operators spend their time editing rather than starting from scratch.",
        },
        {
          type: "heading",
          level: 3,
          text: "Reading the citation chips",
          id: "citation-chips",
        },
        {
          type: "paragraph",
          text:
            "Below the draft text the agent renders a row of small chips. Each chip represents one document chunk that contributed to the draft. The chip shows the document title and the page when one is available. There is no chip for prior tickets or templates because those are internal context, not sources you would expose to the customer. If the chip strip is empty, the model wrote without retrieved context, which can happen when the knowledge base is empty or the ticket subject is too short for the embedder to produce useful matches.",
        },
        {
          type: "heading",
          level: 3,
          text: "Feeding the knowledge base",
          id: "feeding-kb",
        },
        {
          type: "paragraph",
          text:
            "The agent gets smarter when you feed it. Two recommended paths exist for adding new knowledge. The first is the Generate FAQ from Tickets button in the right column. Type a topic, an optional target audience, click Generate, and the agent produces a markdown FAQ. Then choose what to do with the output:",
        },
        {
          type: "list",
          items: [
            "Copy. Puts the markdown on your clipboard. Use this if you want to paste the content into your own help center or hand it to a writer.",
            "Download .md. Saves the markdown as a file. Useful for backups or for editing in your favourite markdown editor before publishing.",
            "Save to Knowledge Base. Pushes the content into the same RAG ingest pipeline you use for documents. Future AI Drafts will retrieve it. The article does not appear on the public help center.",
            "Publish on Help Center. Does Save to Knowledge Base AND creates a published support_articles row. The article becomes immediately visible at /portal/{slug}/help/{article-slug}. End users can read it before they ever open a ticket.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Self reinforcing loop",
          text:
            "Every FAQ you publish does two things at once. It teaches the AI Draft to write better grounded replies on the same topic, and it gives end users a self serve answer that can prevent the ticket from being filed in the first place. Volume drops while quality rises.",
        },
        {
          type: "heading",
          level: 3,
          text: "Direct document ingestion",
          id: "direct-ingest",
        },
        {
          type: "paragraph",
          text:
            "If you already have help docs as PDFs, DOCX files, or Markdown, you do not need to convert them into FAQs. Drop them through the standard Lumicoria document upload flow at /agents/document and tag them with your organization id. The Customer Service AI Draft picks them up automatically because both flows write to the same per organization vector index.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "public-portal",
      title: "Public portal and help center",
      content: [
        { type: "heading", level: 2, text: "What customers see", id: "public-portal" },
        {
          type: "paragraph",
          text:
            "Your customers never see the operator workspace. They only see the public portal at /portal/{slug}. The portal is a single branded page with three things on it. A hero with your logo, name, and tagline. A trust strip beneath it that surfaces your SLA, a privacy reassurance, your support email, and a Browse Help Center link. And a smart form that takes name, email, subject, body, priority, and a category from your configured list.",
        },
        {
          type: "heading",
          level: 3,
          text: "Submitting a ticket",
          id: "public-submit",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "The visitor lands on /portal/{slug}, reads your hero copy, and decides whether to file a ticket or browse the help center first.",
            "If they choose to file a ticket they fill in the form. Client side validation catches missing fields, malformed emails, and oversized inputs before any network call is made.",
            "On submit, a POST goes to /public/portal/{slug}/tickets. Per IP rate limiting in Redis caps abuse at five submissions every fifteen minutes.",
            "The backend sanitizes all user supplied strings with bleach, persists the ticket row, and immediately fans out two notifications. The customer receives a confirmation email. Operators receive an in app notification and a web push.",
            "The visitor is redirected to /portal/{slug}/status/{ticket_id}?email={their email} and sees a confirmation banner.",
            "The same status URL is also embedded in the email they just received, so they can return to it later from any device by clicking the link.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Privacy gated status checks",
          id: "privacy-gate",
        },
        {
          type: "paragraph",
          text:
            "The status page requires the original submitter email as a query parameter. If the email does not match the ticket's customer_email, the API returns 404 rather than 401. This is intentional. A 401 would let an attacker enumerate valid ticket ids by watching the response codes. A 404 reveals nothing. The visitor is asked to enter their email when the URL is missing it, and they only ever see a status if the email matches.",
        },
        {
          type: "heading",
          level: 3,
          text: "Following up on an existing ticket",
          id: "customer-follow-up",
        },
        {
          type: "paragraph",
          text:
            "On the status page, customers see the original ticket subject and status, plus the timeline of operator and AI assisted replies. Their own messages are not echoed back to them on this view, since they wrote those themselves. A reply box at the bottom lets them add follow up information without filing a new ticket. The submission is rate limited at ten per fifteen minutes per IP, and the same email gate applies. Operators see follow up replies threaded under the original ticket in their inbox, with the customer label.",
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
            "Every published article appears at /portal/{slug}/help. The page renders with the same gradient hero as the support form, a search box, a Featured row when articles are pinned, and a list of all other articles below. Each article opens at /portal/{slug}/help/{article-slug}. The body is rendered through ReactMarkdown with GitHub flavoured markdown extensions. Tables, fenced code, headings, and links all render as expected.",
        },
        {
          type: "list",
          items: [
            "View counts increment server side every time an article is fetched.",
            "Visitors can vote helpful or not helpful with a single click. The vote is sent to the public vote endpoint and the counters are stored on the article row.",
            "If a visitor reads an article and still has a question, the article footer carries a Did not find what you were looking for prompt and a button that returns them to the ticket form.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "From FAQ to article in one click",
          text:
            "When you click Publish on Help Center inside the FAQ generation modal, the agent does three things in a single request. It pushes the markdown into RAG. It creates a support_articles row marked published. It pins the rag_document_id back onto the article so future edits can sync the same record. The article appears live on the help center within a second.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "notifications",
      title: "Notifications",
      content: [
        { type: "heading", level: 2, text: "Multi channel notifications", id: "notifications" },
        {
          type: "paragraph",
          text:
            "The notification system fans out by event and by audience. Customers get email. Operators get in app and web push. Each channel is best effort and independent. A failure on one (for example, the email provider returning a 502) never blocks the others or the user facing HTTP request that triggered the event.",
        },
        {
          type: "heading",
          level: 3,
          text: "Customer notifications",
          id: "customer-notifications",
        },
        {
          type: "paragraph",
          text:
            "Customers never receive in app or push notifications because they do not have Lumicoria accounts. They only ever receive email, and only on two specific events.",
        },
        {
          type: "list",
          items: [
            "On ticket creation. Subject line is bracketed by the ticket id, like [TK-abc12345] We've received your request. Body opens with a personal greeting using the customer name when known, confirms receipt, surfaces the SLA minutes from your branding, includes the original message as a quoted block for their records, and closes with a link to the status page. The from name is your display name. Reply to is your support email when configured.",
            "On operator reply. Subject is Re: {original subject} [TK-abc12345]. The body presents the operator's reply prominently, then quotes the original message as a Gmail style trailing block. The signature uses the operator's display name and your organization name. The same status URL is included so the customer can return to the conversation in a browser.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Operator notifications",
          id: "operator-notifications",
        },
        {
          type: "paragraph",
          text:
            "Operators are deliberately not emailed about new tickets. A busy organization can take in five hundred tickets a day, and emailing one per ticket would render the operator's inbox useless. Instead operators receive instant notifications through two channels designed for high volume.",
        },
        {
          type: "list",
          items: [
            "In app notification. The bell icon at the top of the Lumicoria interface ticks up. Opening it shows a row with the ticket priority, the customer name, and a snippet of the subject. Clicking the row deep links to the operator inbox with the ticket pre selected.",
            "Web push notification. If the operator has granted push permission for the Lumicoria origin, the same alert fires as a native browser notification. This works while the operator is on a different tab, on a different application, or even on a locked phone if they have installed the progressive web app.",
            "Delivery confirmation. When the operator clicks Send Reply, an in app toast confirms the email was dispatched, including the customer email it went to and the ticket id. No push fires for delivery confirmations because the operator just initiated the action.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Granting push permission",
          text:
            "On first visit to the operator workspace the browser may show a permission dialog asking whether Lumicoria can send notifications. Click Allow. If you accidentally clicked Block, open the lock icon in the address bar, set Notifications to Allow, and refresh the page.",
        },
        {
          type: "heading",
          level: 3,
          text: "What can fail and how the system reacts",
          id: "notification-resilience",
        },
        {
          type: "list",
          items: [
            "Resend or SendGrid is down. The customer email is queued and retried with exponential backoff inside the email provider's failover layer. If both providers fail, a structured warning is logged with the ticket id. The ticket itself is created successfully and the operator notification still fires.",
            "Customer email address is unverified at the provider. The provider rejects the send. The agent logs the rejection and returns the ticket id to the customer through the status redirect, so they still see their request was accepted.",
            "Operator has revoked push permission. The push send returns an error. The in app notification still appears in the bell tray, and the next time the operator loads the page the notification list reflects what they missed.",
            "Operator is offline when the ticket arrives. Notifications are stored in MongoDB and surface in the bell tray on next login. Web push sends are best effort; the in app store is the durable record.",
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "analytics",
      title: "Analytics",
      content: [
        { type: "heading", level: 2, text: "Real numbers, computed live", id: "analytics" },
        {
          type: "paragraph",
          text:
            "The analytics panel in the operator workspace is not a fake dashboard. Every value is computed live from real ticket and reply rows in your tenant's slice of Postgres. Switch the time range and the figures recompute. There are no mocked numbers anywhere on the page.",
        },
        {
          type: "heading",
          level: 3,
          text: "What each card shows",
          id: "analytics-cards",
        },
        {
          type: "list",
          items: [
            "Open Tickets. Count of tickets currently in Open status, computed against the local ticket list rather than analytics so it always matches the queue.",
            "Avg Response. Mean number of seconds between ticket creation and the first operator or AI reply, averaged over the chosen time range. Rendered in seconds when low, minutes when above sixty seconds.",
            "Total Requests. Number of tickets created during the time range, regardless of current status.",
            "Satisfaction. Percentage of tickets resolved during the time range that carry a non negative sentiment score. Will read as zero until tickets carry sentiment scores from the analyse feedback path.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Customer Sentiment panel",
          id: "sentiment-panel",
        },
        {
          type: "paragraph",
          text:
            "Below the four stat cards is a horizontal sentiment bar broken into Positive, Neutral, and Negative percentages. The values come from bucketed sentiment scores on tickets created within the time range. Positive bucket starts at sentiment score 0.25 and above. Negative is below minus 0.25. The middle is Neutral. A clean tenant with no sentiment scores yet shows a No sentiment data for this range yet message rather than a fake bar.",
        },
        {
          type: "heading",
          level: 3,
          text: "Ticket Categories panel",
          id: "categories-panel",
        },
        {
          type: "paragraph",
          text:
            "Below sentiment is a count of tickets by category, descending. The labels are the category strings you configured in branding. The colors rotate through a predefined palette. A tenant with no categorised tickets yet shows a No categorised issues yet message.",
        },
        {
          type: "heading",
          level: 3,
          text: "Time range selector",
          id: "time-ranges",
        },
        {
          type: "paragraph",
          text:
            "Five options in the top toolbar: 1d, 7d, 30d, 90d, 1y. Each switches the analytics endpoint cutoff. The endpoint accepts only those five values to keep cardinality bounded and SQL plans cacheable.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Why analytics will look quiet at first",
          text:
            "The endpoint computes from real rows. A new tenant with no tickets reports zeros. This is the correct behaviour. Operators who want to see the dashboard light up should submit a few test tickets via the public portal, mark some resolved, and watch the numbers update.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "security",
      title: "Security and privacy",
      content: [
        { type: "heading", level: 2, text: "What protects your data", id: "security" },
        {
          type: "paragraph",
          text:
            "The Customer Service Agent surfaces a public, anonymous endpoint for ticket submission. That makes it the most exposed component on Lumicoria. Several layers of defence operate around it. Each one is enforced at the API edge so a buggy frontend or a malicious user cannot bypass them.",
        },
        {
          type: "heading",
          level: 3,
          text: "Multi tenant isolation",
          id: "isolation-guarantee",
        },
        {
          type: "list",
          items: [
            "Every operator query filters on organization_id before any other clause. There is no path through the API that returns rows from another tenant's organization, even if the frontend explicitly asks for them.",
            "Public endpoints resolve the organization id by slug first. The slug carries a unique index across all organizations on Lumicoria, so two tenants cannot collide.",
            "The ticket id namespace is shared, but the public id pattern of TK followed by eight hex characters provides about four billion values per organization, with a unique index enforced on insert.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "SQL injection",
          id: "sql-injection",
        },
        {
          type: "paragraph",
          text:
            "All queries are constructed through SQLAlchemy with bound parameters. There is no raw SQL string formatting anywhere in the customer service module. ILIKE searches escape the percent and underscore wildcards in user input so a malicious search term cannot match every row. Schema migrations use parameterless ALTER TABLE statements that take no user input.",
        },
        {
          type: "heading",
          level: 3,
          text: "Cross site scripting",
          id: "xss",
        },
        {
          type: "paragraph",
          text:
            "Every user supplied string that lands in the database is sanitized with bleach before storage. The allow list is intentionally small. Common formatting tags such as paragraph, line break, strong, emphasis, ordered and unordered list, blockquote, and code all pass through. Anything else, including script tags, iframes, and inline event handlers, is stripped. Both ticket bodies, reply bodies, hero copy, template bodies, and article bodies go through the same filter.",
        },
        {
          type: "heading",
          level: 3,
          text: "Rate limiting",
          id: "rate-limiting",
        },
        {
          type: "list",
          items: [
            "Public ticket creation: five submissions per fifteen minutes per IP. A 429 with Retry After is returned beyond that.",
            "Public branding fetch: sixty per minute per IP, bounded to keep public help center traffic from melting Postgres.",
            "Public status check: thirty per fifteen minutes per IP. The privacy gate also helps here because a high rate of mismatched emails alone never returns useful information.",
            "Public customer reply on an existing ticket: ten per fifteen minutes per IP.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Captcha",
          id: "captcha",
        },
        {
          type: "paragraph",
          text:
            "Each organization can flip captcha_enabled to true on its branding record. When enabled, the public ticket creation endpoint requires an h-captcha-response field on every submission and verifies it against hCaptcha's verify endpoint using the HCAPTCHA_SECRET environment variable. If the secret is missing the gate is silently skipped with a warning so a misconfigured deployment does not silently stop accepting tickets.",
        },
        {
          type: "heading",
          level: 3,
          text: "Audit trail",
          id: "audit",
        },
        {
          type: "paragraph",
          text:
            "Every state changing endpoint logs an activity through the platform activity logger. Ticket created, ticket replied, branding updated, template created, article created. The events are stored in MongoDB and survive deletes of the underlying records. They are visible to anyone in your organization with the activity dashboard permission.",
        },
        {
          type: "heading",
          level: 3,
          text: "Soft deletes",
          id: "soft-deletes",
        },
        {
          type: "paragraph",
          text:
            "Delete endpoints set a deleted_at timestamp rather than removing the row. Lists filter on deleted_at IS NULL. This keeps the audit trail intact and allows undelete by clearing the field directly in Postgres. Hard delete is intentionally not exposed via the API.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "A note on PII",
          text:
            "Customer emails and ticket bodies are personally identifiable information. They are never logged at info level, only at debug. Production deployments should ensure their structured log shipper does not include debug events from the customer service module unless the operator has a specific reason to enable that.",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      slug: "troubleshooting",
      title: "Troubleshooting",
      content: [
        { type: "heading", level: 2, text: "Common issues and fixes", id: "troubleshooting" },
        {
          type: "heading",
          level: 3,
          text: "The portal returns Portal not found",
          id: "portal-not-found",
        },
        {
          type: "paragraph",
          text:
            "The slug in the URL does not match any organization's branding row. Either the slug was never set, the slug was changed since you last shared the link, or the URL has a typo. From the operator workspace, click Branding, confirm the slug, click Copy portal URL to get an exact link, and paste it into a fresh tab.",
        },
        {
          type: "heading",
          level: 3,
          text: "AI Draft fails with a model error",
          id: "ai-draft-model",
        },
        {
          type: "paragraph",
          text:
            "The AI Draft endpoint reads DEFAULT_LLM_PROVIDER and the matching model name from your backend .env. If those are misconfigured, the call returns a 502 Bad Gateway with the underlying provider error. Check that DEFAULT_LLM_PROVIDER is set to one of gemini, openai, anthropic, mistral, or perplexity. Check that the matching API key is set. Check that the model name is one the provider currently supports. Restart the backend to apply changes.",
        },
        {
          type: "heading",
          level: 3,
          text: "AI Draft returns no citations",
          id: "no-citations",
        },
        {
          type: "paragraph",
          text:
            "The chip strip beneath the draft is empty. This means the retrieval step found nothing. Either the knowledge base is empty for your organization, or the ticket subject is too short for the embedder to produce useful matches. Generate an FAQ on the topic and click Save to Knowledge Base, or upload your help docs through the document agent. Then try AI Draft again.",
        },
        {
          type: "heading",
          level: 3,
          text: "Customer email never arrived",
          id: "no-email",
        },
        {
          type: "list",
          items: [
            "Check the backend logs for a customer_email_ticket_received_sent event with success true. If success is false, the event includes the provider's error message.",
            "Confirm RESEND_API_KEY is set in the backend .env file and is a valid key. If RESEND_API_KEY is missing, the email is silently skipped and the ticket still lands.",
            "Confirm EMAIL_FROM_ADDRESS uses a domain you have verified in your Resend account. Resend rejects sends from unverified domains with a clear error in the logs.",
            "Check the customer's spam folder. Branded transactional mail from a new domain often gets filtered on first send.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Permission denied saving branding",
          id: "permission-denied",
        },
        {
          type: "paragraph",
          text:
            "The agent enforces an AGENT customer_service EXECUTE permission. Personal accounts pass this check by default because the underlying permission repository treats no organization context as permitted. If you are part of a multi user organization and you see a 403, your account does not yet have the permission. Ask an organization admin to grant it through the standard permissions admin.",
        },
        {
          type: "heading",
          level: 3,
          text: "The status URL in the email points at the wrong host",
          id: "wrong-host",
        },
        {
          type: "paragraph",
          text:
            "The link is built from PUBLIC_BASE_URL in your backend .env, falling back to FRONTEND_URL, then to the local development default. Set PUBLIC_BASE_URL to the public address customers can reach in a browser. For local testing this is usually http://localhost:8080. For production it is your domain. Restart the backend after changing the value because pydantic settings are loaded once at process start.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Getting more help",
          text:
            "If something is misbehaving and the cause is not obvious, the backend logs are the fastest path to a fix. Every customer service event is logged with a structlog event name and the ticket id. Grep for the ticket id and you will see every step the system took for that one ticket.",
        },
      ],
    },
  ],
};