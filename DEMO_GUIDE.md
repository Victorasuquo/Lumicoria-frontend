# Lumicoria AI — Demo guide

A walk-through of the product using two real customer use cases, followed by
a complete tour of the platform's feature surface. You don't need to install
anything. The walk-through takes about 15 minutes; the full reference
section is optional — read it if you want to see how far the product
actually goes.

**Live URL** → <https://lumicoria.ai>

---

## Demo login

You can either sign up fresh with Google (everyone gets a free workspace),
or use the pre-populated demo account so you can see two real organisations
with some pre-loaded history. The demo account owns **TalentPort Labs** and
has an invited project for **Queska**.

| Field    | Value                            |
|----------|----------------------------------|
| Email    | `jacobasuquo199@gmail.com`       |
| Password | `lumicoriaDemo988.`              |

Open <https://lumicoria.ai/login>, paste those, sign in. You'll land in the
workspace home.

> Prefer to start fresh? Click **Continue with Google** — onboarding takes
> 30 seconds. You'll see the same surfaces, just empty. The walk-through
> below populates them.

---

## What you're about to see

Lumicoria is an **AI-native workspace** — not a chat box, not a single
agent. It's a multi-tenant operating system for work, where **21 specialised
AI agents collaborate with humans on real tasks** inside the same surface
where the team already lives. Think Notion + Slack + Asana + ChatGPT
collapsed into one tool, except every layer is AI-native by default and
every action is auditable.

Two real use cases drive this demo:

1. **TalentPort** — a digital education company training software engineers
   and data analysts. Their challenge: turn long strategy documents into
   concrete tasks, route them to teammates, and run autonomous research,
   recruitment outreach, and content drafting in the background.
2. **Queska** — a corporate travel company. Their challenge: integrate a
   complex travel-management workflow across 14 stakeholders, with a mix
   of human-driven and AI-driven steps.

We're going to load real documents from both companies into Lumicoria,
watch agents extract the work, route it to humans + AI agents, and run the
autonomous loop end-to-end.

---

## The two demo documents

We've included both source documents in the backend repository so you can
download them and try the upload step yourself.

| Company    | What it is                                 | Download                                                                                                                          |
|------------|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| TalentPort | Recruitment + curriculum strategy session  | [TalentPort Recruitment Strategy Session.pdf](./TalentPort%20Recruitment%20Strategy%20Session.pdf) · [Google Doc](https://docs.google.com/document/d/1NyxpO_IKqfDyo5UUzQ-dF2oEjrwBH-TLJyeLzaGBaU8/edit?usp=sharing) |
| Queska     | Corporate-travel integration brief         | [Queska Corporate Travel Integration Brief.pdf](./Queska%20Corporate%20Travel%20Integration%20Brief.pdf) · [Google Doc](https://docs.google.com/document/d/1FBlRN3muVyCUrThZK-8HViU6N227kLG3q3mPZEMtacw/edit?usp=sharing) |

> If you cloned the repo locally, the PDFs are right next to this file. If
> you're reading on GitHub, click either filename to download.

---

# Part 1 — The walk-through (15 min)

## Step 1 · Walk into the workspace

After you sign in you land at <https://lumicoria.ai/workspace>.

This is the workspace home for **TalentPort Labs**. A few things to notice:

- The **cover banner** at the top — every team can brand their own
  workspace, including custom cover + logo. First-class image support
  baked in, not a stock pattern.
- The **agent leaderboard** card on the right — live list of the 21
  platform agents, sorted by usage in this org. Updates every time an
  agent runs.
- The **Quick Actions** strip + the **Pinned / Recent / Starred** rails.
  Lumicoria treats your work the way a good IDE treats files — most
  recent, most pinned, most starred are always one click away.
- The **Activity** tab in the left sidebar (`/workspace/activity`). Live
  event stream for the org: every document upload, every agent run, every
  task created, every member action. Same feed we forward to your SIEM on
  the Enterprise plan.
- The **left sidebar tree** — Overview group, Teams group (each team is a
  department-level grouping), Projects group, Admin group (visible only
  if you're an admin). Every collapsible section auto-loads.

Move to the next step.

---

## Step 2 · Upload the TalentPort brief into the Document Agent

This is the most important moment of the demo. Pay attention to what
happens *after* the upload — the agent doesn't just summarise. It pulls
real work out and routes it.

1. In the left sidebar, click **Agents** → **Document** (or open
   <https://lumicoria.ai/agents/document> directly).
2. The Document Agent landing page loads with an upload zone labelled
   **"Drop a document or click to browse"**.
3. Click it, pick
   [`TalentPort Recruitment Strategy Session.pdf`](./TalentPort%20Recruitment%20Strategy%20Session.pdf),
   confirm the upload.
4. Watch the progress chip. Behind the scenes the agent is:
   - OCR-ing the PDF (PyMuPDF, Tesseract fallback)
   - Chunking it into semantic windows (~512 tokens, configurable)
   - Embedding the chunks into the project's vector store (Weaviate)
   - Extracting entities, decisions, deadlines, owners, and *action items*
   - Building citation back-references to specific PDF pages

> First run on a fresh account takes 15-30 seconds. Subsequent uploads to
> the same project hit the warm RAG store and finish in under 5 seconds.

When the agent finishes, the right panel populates with a **Proposal**.
The proposal carries:

- A rendered markdown summary of the document
- A list of every **action item** the agent found (titles, owners,
  deadlines, priorities, source citations)
- A **cost line** showing exactly how much this run cost ($X.XX), broken
  down by tokens + storage + LLM provider
- A **model line** showing which model ran (Gemini 2.5 Pro by default; the
  org admin can switch this on a per-agent basis)
- Three buttons: **Approve · Request revision · Reject**

This is the **human-in-the-loop pattern at the per-task level**. Nothing
gets filed without you saying yes.

---

## Step 3 · Approve, watch the tasks land

Click **Approve** on the proposal.

Three things happen in the next two seconds:

1. The action items become real tasks under
   <https://lumicoria.ai/workspace/projects/<project_id>/tasks> — one row
   per item, with the deadline, owner, source link back to the originating
   page in the uploaded PDF.
2. Each task that the Document Agent flagged as "agent-solvable" gets an
   AI co-owner. Open one — you'll see two avatars in the assignee strip: a
   human (you) and the Research Agent (or Meeting Agent, or whichever
   specialist matches the work).
3. The activity feed picks up `document.processed` + a row of
   `task.created` events. Every single action is auditable.

Switch to the **Board** view of the Tasks tab. Five lanes:
**To do · In progress · In review · Blocked · Done**. The tasks the agent
created sit in To-do.

Switch to **List**, **Calendar**, **Gantt**, **Timeline** views — same
data, different lens. Built into the product, not via an integration.

---

## Step 4 · Let an agent run autonomously on a task

Pick a research-ish task — for TalentPort, something like *"Research
current market salary bands for junior data analysts in West Africa"*.
Click it.

The task detail drawer opens. You'll see:

- **Description** — pulled from the source document with a citation link
  back to the originating PDF page
- **Assignees** — you + the Research Agent
- **Activity timeline** at the bottom
- A **Run agent** button at the top right

Click **Run agent**.

Watch the timeline. Within ~30 seconds:

- The Research Agent fetches relevant web sources (Perplexity Sonar by
  default — switchable to Gemini, Claude, GPT, or DeepSeek per-run)
- Synthesises findings with citations
- Posts a **draft proposal** back into the task drawer
- Sets the task status to *In review*
- Pings the human assignee for approval

This is the **autonomous loop**. The agent didn't wait for you to ask. The
moment the task became a task, the agent recognised it could solve it and
started working. You intervene only when it asks.

Approve the agent's draft. The task moves to *Done*. The draft saves as a
comment with full citations.

> **Strict mode**: For high-stakes projects (legal review, compliance,
> financial close), org admins can flip **Strict mode** on a project. The
> autonomous loop pauses — agents still draft, but nothing files without
> two human approvers. See *Admin → Strict Mode* under the project
> settings.

---

## Step 5 · Run the same flow on the Queska brief

Now do the second use case. The pattern is the same; the domain is
completely different.

1. Sidebar → **Projects** → **New project**.
2. Name it `Queska Integration`, pick a colour, click **Create**.
3. Open the new project. Click **Documents** → **Upload**.
4. Drop in
   [`Queska Corporate Travel Integration Brief.pdf`](./Queska%20Corporate%20Travel%20Integration%20Brief.pdf).
5. When the Document Agent finishes, approve the proposal.
6. Open the resulting tasks. Pick one — try *"Draft the API contract
   between the booking engine and the payments service"*.
7. Click **Run agent**. This time the **Legal Document Agent** runs and
   produces a draft contract with clause-by-clause reasoning.

You're now operating the same product on two completely different
verticals (HR + travel) with no special configuration. That's the
universe-of-agents bet paying off.

---

## Step 6 · Try the Customer Service Agent

Every modern B2B product needs to handle customer support. Lumicoria ships
the Customer Service Agent as a first-class surface that any team can
embed in seconds.

1. Open <https://lumicoria.ai/agents/customer-service>.
2. Notice the four tabs: **Tickets · Templates · Branding · Public portal**.
3. Click **New ticket**, fill in:
   - Customer email: `aiyana@queska.com`
   - Topic: `Refund for trip cancellation`
   - Severity: `Medium`
4. Click **Save**, then **Run agent**.

The Customer Service Agent will:

- Pull the customer's history from the org's CRM-like store
- Draft a personalised response with the right tone for the severity
- Suggest a refund amount based on your business rules
- Attach a citation to your refund policy doc (uploaded earlier via RAG)
- Wait for your approval before sending

Then open the **Public portal** tab. Each org gets a branded public
ticket-submission page at `lumicoria.ai/portal/<slug>`. Customers submit
tickets there; the Customer Service Agent triages and drafts responses
before a human ever reads them.

---

## Step 7 · Tour the full Agent Universe

Open <https://lumicoria.ai/agents>. This is the catalogue of all 21
specialised platform agents (see Part 2 for the full list with what each
one does).

Click any of them to land on the agent's own page. Every agent has:

- A "what it does" hero
- A live interaction surface (paste text, upload a file, ask a question)
- A history of past runs
- An analytics tab (cost, latency, success rate)
- A docs link with the agent's full prompt + tool list

And here's the part that's hard to overstate: **any of these can be
invited to any project or any live meeting**. They run with the project's
permissions, see the project's knowledge base, respect the org's data
residency. They share a unified **Memory Bank**, so the Research Agent
remembers what the Document Agent learned about the same project.

---

## Step 8 · Lumicoria Huddle (live meeting product)

This isn't strictly in the demo flow but it's the most visually
differentiating piece of the platform. If you have ~3 minutes:

1. Open <https://lumicoria.ai/agents/meeting>.
2. Click the purple **Start meeting** button in the hero.
3. A new tab opens with the Jitsi-powered meeting room.
4. On the right is the AI sidebar with the same agent catalogue you saw
   above. Click **+** on any agent to add them to the call.
5. Speak. The Meeting Agent transcribes; the Translation Agent provides
   live captions in your chosen language; any other attached agent
   responds in real time on the right.

End the call (red button bottom right of the sidebar). You'll be routed
back to <https://lumicoria.ai/agents/meeting> — and within ~10 seconds
you'll see a fresh entry in the meeting library with:

- The full transcript
- A post-call summary (decisions, action items, follow-ups)
- Speaker analytics (talk-time, interruption count, sentiment trend)
- A signed-URL recording (if you turned recording on)
- Calendar export to Google Calendar / Outlook / Apple via ICS

Lumicoria Huddle competes head-on with Google Meet, Zoom, Slack Huddles.
We built it on Jitsi (open source) so we could embed AI agents directly
into the audio + transcript layer. Other meeting products will eventually
copy this; for now, we're the only one shipping it end-to-end.

---

# Part 2 — The complete platform

If you stopped after Part 1 you saw the spine. The rest of this section
walks through every surface of the platform so you know how deep it goes.
Skim or read in full as you like.

## The 21 specialised platform agents

We made one architectural bet early: **don't build one giant generalist
model and pretend it can do everything. Build a *universe* of specialists,
each with deep expertise, all sharing a unified memory + observability
layer.**

Here's the full catalogue grouped by what each one is best at:

### Work execution

- **Document Agent** — OCR + RAG + structured extraction from any PDF,
  contract, slide deck, image. Page-level citations. Multi-language.
  Powers what you saw in Step 2.
- **Meeting Assistant** — Turns transcripts into decisions, action items,
  owners, due dates. Routes them straight to your task system. Powers
  Huddle post-call summaries.
- **Meeting Fact Checker** — Web-grounded fact verification with citations
  during decision-making meetings. Catches the "actually that statistic
  is from 2018" moments before they make it into the minutes.
- **Vision Agent** — Image classification, multi-modal reasoning,
  screenshot understanding, whiteboard OCR. Reads anything shown on
  shared screens during Huddle.
- **RAG Agent** — Conversational retrieval over your team's knowledge
  base with cited sources. Works on documents, meeting transcripts,
  shared knowledge across the org.
- **Data Analysis Agent** — CSV processing, statistical inference,
  anomaly detection, chart generation. Will draft a pandas notebook,
  attach the rendered figures.
- **Knowledge Graph Agent** — Builds and queries entity relationships
  across your org's documents. "Who has worked with which client on what
  contract type?" answered with a citation chain.
- **Legal Document Agent** — Contract clause extraction, redline
  drafting, legal-tone summaries. Powers the Queska contract step.
- **Translation Agent** — 50+ languages with cultural adaptation, not
  just literal swaps. Powers live captions in Huddle.

### Creative + communication

- **Creative Agent** — Marketing copy, storytelling, social posts, ad
  variations. Style + tone + length controls baked in.
- **Social Media Agent** — Trend analysis, sentiment, post scheduling,
  engagement forecasting. Multi-platform (Twitter, LinkedIn, Instagram,
  Facebook).
- **Customer Service Agent** — Ticket routing, response templates, SLA
  monitoring, escalation logic. Public portal for customer ticket
  submission. Powers what you saw in Step 6.

### Learning + growth

- **Student Agent** — Homework + exam prep + concept explanations.
- **Learning Coach** — Personalised study plans, quiz generation, spaced
  repetition, progress tracking.
- **Research Agent** — Deep web research with multi-source synthesis.
  Powers what you saw in Step 4.
- **Research Mentor** — Hypothesis framing, methodology critique,
  academic writing guidance.

### Operations + wellbeing

- **Wellbeing Coach** — Mood tracking, stress detection from sentiment,
  break reminders, work-life rhythm. Never alarmist; always private to
  the user.
- **Focus & Flow Agent** — Deep work timers, distraction tracking, flow
  state analytics, productivity heatmaps. Pomodoro / time-block / deep
  work / flowtime techniques baked in.
- **Workspace Ergonomics** — Posture analysis from your webcam (opt-in),
  desk-setup recommendations, ergonomic checklist scoring.
- **Ethics & Bias Agent** — Pre-publish content review for bias, fairness
  audits, responsible AI checks.

### Coordination

- **Intelligence Agent** — The orchestrator. Routes ambiguous requests
  to the right specialist or chains multiple agents via A2A protocol.
  This is the agent the **Lumi** chat bubble in the bottom-right corner
  talks to.

## Custom agents via Agent Studio

The 21 platform agents handle ~80% of what teams need. The other 20% is
*specifically yours*. **Agent Studio** at <https://lumicoria.ai/agent-builder>
lets you build custom agents visually.

- **Seven typed component categories**: Triggers, LLM Generators, RAG
  Retrievers, Vision Processors, Tool Calls (via MCP), Conditions, Outputs
- **Type-safe connections** — wrong-shape ports show inline red borders
- **Versioned saves with rollback** — every change is a new revision; you
  can promote any revision to *Published*
- **Built-in eval harness** — run test cases against draft revisions
  before publishing. Pass/fail per case, latency + cost per run
- **Project-bound by default** — custom agents inherit a project's
  knowledge base + permissions
- **Share to team or org** — promote a successful custom agent into the
  team's catalogue
- **Forking** — start from any existing agent's blueprint and tweak

A finance team can spin up a "Quarterly Earnings Drafter" in 30 minutes.
A legal team can ship a "NDA Reviewer" that cites case law. A support
team can launch a "Tier-1 Auto-Responder" wired to their Zendesk.

## The workspace hierarchy

Under the hood, Lumicoria is a strict **multi-tenant SaaS**:
**Organisation → Team → Project → Task**. Every primitive carries the
full security model. The full schema:

### Organisation
- Self-serve creation, branding (cover image, logo, colours)
- Plan + seat management with Stripe billing
- Audit log of every action across the org
- SSO via SAML 2.0 (Okta, Azure AD, OneLogin, Google)
- SCIM 2.0 user provisioning
- Domain claims for auto-join
- Data residency picker (US / EU / IN)
- Customer-managed encryption keys (BYOK)
- Webhooks for outbound events
- API tokens with scoped permissions

### Teams
- Department-style groupings (Engineering, Growth, Sales)
- Members + admins with role-based permissions
- Per-team branding, channels, reminders
- Granular analytics: task throughput, agent activity, member engagement
- Saved views + custom dashboards
- Slack & Google Calendar integrations
- Custom team-specific roles

### Projects
- Strict-mode toggle (require approvals on every agent run)
- Knowledge base per project with KB query + manual rebuild
- 5 task views: Board, List, Calendar, Gantt, Timeline
- Bulk operations + imports from Asana, Jira, Linear, Notion, Trello, CSV
- Saved filters, templates, agent attachments
- Burnup, burndown, throughput, cycle time, cost analytics
- Webhook events per project
- Visibility: private | team | org

### Tasks
- Dual-source: humans create them, agents create them too
- Five views (Board / List / Calendar / Gantt / Timeline), five priority
  tiers, custom fields, tags
- Agent-assigned tasks come with a **proposal**: rendered markdown body,
  citations, cost line, Approve / Request revision / Reject buttons
- Comment threads with mentions, reactions, resolved state
- Sub-tasks, parent-task promotion, cross-project graph
- Templates + bulk-create

### Members
- Presence dots on every avatar (live via WebSocket fan-out across
  multiple workers)
- Typing indicators in chat + comment threads
- Role-based capability gating across every UI surface
- Custom roles (Business + plan)
- Invite by email, magic link, or domain auto-join
- Per-user profile, preferences, theme, notification rules

## The AI-native team layer

Most workspace products today treat AI as a "feature." Lumicoria treats
AI as a **first-class teammate**. That changes a few things you don't get
elsewhere:

- **Agents are project members.** They show up in the member list with
  their own avatar, can be @mentioned in tasks + chat, and have the same
  scoped permissions as humans.
- **Agents create tasks.** When the Document Agent processes a strategy
  doc, the resulting tasks are owned by the agent until a human approves
  them — same audit trail, same review process.
- **Agents are accountable.** Every agent run logs the model used, input,
  output, cost, latency, full trace. `/workspace/admin/audit` shows you
  the chain.
- **Agents have memory.** A unified **Memory Bank** lets every agent in a
  project read what the others have learned. The Research Agent in
  October remembers what the Document Agent extracted in July.
- **Agents respect strict mode.** When a project is flagged strict, no
  agent action ships without two human approvers. Built for legal,
  compliance, financial close.
- **Agents have cost ceilings.** Org admins can set per-agent monthly
  caps. Hit the cap and the agent pauses, escalates to a human, doesn't
  silently overrun.

## The autonomous loop

The most distinctive piece of the product, mostly invisible from the UI.

When a task lands in the system, **the platform asks every attached agent
"can you advance this?"** in the background. If any agent says yes (via
the Intelligence Agent's routing logic), it does the work and posts a
draft. The human reviewer sees the draft when they next open the task —
no waiting, no asking.

You can opt out per-project (turn the autonomous loop off entirely), per
task type (only allow autonomous on certain templates), or per agent
(disable specific agents from running unattended).

## Lumicoria Huddle — the meeting product

Already covered in Step 8 of the walk-through, but the full feature
list:

### Phase 1 (shipped)
- Jitsi-powered HD video + audio
- Browser-side recording with chunked upload to MinIO
- Public share links (guests join without an account)
- AI sidebar with attached agents
- Post-call MeetingAgent summary
- Calendar export to Google Calendar

### Phase 1.5 (shipped)
- Live agent dispatcher — chunks → asyncio.gather across attached agents
  → real-time push to all clients via WebSocket
- Scheduled meetings with Google Calendar invite generation
- "Live now" indicator in the workspace sidebar
- Instant team huddles (Slack-style "Start huddle" button on every team)

### Phase 2 (shipped)
- Self-hosted Jitsi at `meet.lumicoria.ai` with JWT auth
- Jibri server-side recording (replaces browser-side for orgs needing
  always-on / higher fidelity)
- BYOK CMK envelope encryption of recordings at rest (Fernet,
  PBKDF2-derived KEK per org)
- Breakout rooms · polls · raise-hand · 6 reactions
- Slack `🔴 Huddle live in #channel` integration
- Webhook events (`huddle.created` · `huddle.started` · `huddle.ended` ·
  `huddle.recording_ready`)
- Compliance recording mode (force-record + force E2EE-off for DLP)

### Phase 3 (shipped)
- **Virtual agent participant** — TTS reads agent responses into the
  meeting via Web Audio mixing → Jitsi mic injection. Remote participants
  literally *hear* the AI agent's voice as cleanly as they hear you.
- **Live 50-language captions** via Translation Agent on the transcript
  stream
- **Speaker analytics** — talk-time by participant, interruption count,
  sentiment trend, longest silence, total words
- **Calendar back-sync** — pull events from Google Calendar that
  reference Lumicoria URLs and mirror them as scheduled huddles
- **ICS export** for Outlook / Apple Calendar
- **PWA + Capacitor** for installable mobile shells (iOS + Android)

## Trust + compliance — built in, not bolted on

For enterprise customers the table stakes are:

- **SOC 2** in progress
- **HIPAA BAA** on request
- **GDPR** + DPA
- **Audit log export** to Splunk, Datadog, S3, custom SIEM (Team+ plan)
- **Data residency**: US / EU / IN per-org
- **Customer-managed encryption keys** via BYOK (Business+ plan)
- **Prompt-injection guard** at the MCP tool boundary — agents can't
  execute arbitrary external commands
- **Per-tenant scopes** on every tool call
- **Compliance recording** mode for highly-regulated workflows
- **Just-in-time access** — temporary elevated permissions with audit
- **Session policy** — idle timeout, max sessions per user, IP allowlist,
  MFA enforcement
- **Custom roles** — define org-specific roles beyond the built-in
  owner/admin/member set

Every agent run logs: who, what input, what output, which model, how
much it cost, how long it took, full audit chain. Open
`/workspace/admin/audit` to see it all.

## Real-time everywhere

Most AI apps are request-response. Lumicoria is built on **persistent
WebSockets**:

- Presence dots across every page
- Typing indicators in every comment thread
- Live agent-run progress bars
- Real-time transcript chunks during Huddle
- Per-room agent response streams
- Cross-tab notification fan-out (browser push too, via FCM)
- Multi-worker scale via Redis pub/sub (`rt:user:*`, `rt:org:*`,
  `rt:team:*`, `rt:project:*`, `rt:channel:*`, `rt:huddle:*`)

The substrate makes the illusion that AI is *already there* — watching,
participating, responding before you finish typing.

## Wellbeing as a first-class layer

We don't believe productivity is the only metric. Lumicoria has an entire
wellbeing surface:

- **Wellbeing Coach** — conversational mental-health check-ins, private
  to the user, never shared with management
- **Mood tracking** — lightweight prompts, trend visualisation, never
  alarmist
- **Focus & Flow** — Pomodoro / time-block / deep-work / flowtime
  sessions with productivity heatmaps and distraction logs
- **Workspace Ergonomics** — webcam-based posture analysis (opt-in) +
  ergonomic checklist scoring
- **Break reminders** — surfaced via push or in-app at intelligent moments
- **Burnout signals** — aggregate sentiment from your meetings + tasks,
  flagged privately

## Integrations

Lumicoria connects to the tools you already use:

- **Google Workspace** — Drive (file picker), Calendar (event sync),
  Gmail (notification mirror), Docs (export)
- **Slack** — Channel notifications, Huddle live-posts, slash commands
- **Microsoft 365** — Outlook calendar back-sync, Teams meeting handoff
  (Q3 2026)
- **Notion** — Page export, doc sync
- **GitHub** — Issue + PR webhooks, agent-assisted code review (Q3 2026)
- **Stripe** — Billing, credits, BYOK API key for cost passthrough
- **Zapier / Make** — Webhooks for every Lumicoria event
- **MCP gateway** — Any MCP-compliant tool plugs in natively (Model
  Context Protocol, the Anthropic-introduced standard)

Every integration is per-org scoped, OAuth-revocable, audit-logged.

## Plans + pricing

| Plan | Price | Best for | Key gates |
|------|-------|----------|-----------|
| **Free** | $0 | Individuals trying the platform | 2 agents, 50 runs/mo, no Huddle agents |
| **Starter** | $29/mo | Solo professionals | 5 agents, 500 runs/mo, 1 Huddle agent |
| **Professional** | $79/mo | Power users + small teams | 15 agents, 5000 runs/mo, 3 Huddle agents, API access |
| **Team** | **$39/seat/mo** | Teams of 3-50 | Unlimited Huddles, 50 participants, scheduled meetings, audit export |
| **Business** | **$79/seat/mo** | Companies needing SSO + compliance | SSO + SCIM, data residency, breakout rooms, custom branding, Slack integration |
| **Enterprise** | **$129/seat/mo** | Regulated industries | BYOK CMK, custom Jitsi (meet.<your-domain>), SCIM-mapped policies, DLP hook, unlimited retention |

Annual billing → **15% off** every paid tier.

The 21 platform agents are **included on every plan** — you only pay for
usage caps and the enterprise-grade controls. Custom agents you build in
Studio are bound to projects on the Team plan and higher.

---

# Part 3 — Built on Google Cloud

This is the section we usually skip in customer demos but you'll probably
ask, so it's here.

## The Google Cloud agent stack

Lumicoria is built end-to-end on Google Cloud's agent platform. Every
layer is intentional.

| Layer | What we use |
|-------|-------------|
| **Models** | Gemini 2.5 Pro (long-context reasoning), Gemini 2.5 Flash (fast routing), Vertex AI Gemini Embeddings (knowledge base vector store) |
| **Agent runtime** | Vertex AI Agent Runtime for managed orchestration with autoscaling |
| **Memory** | Vertex AI Memory Bank — the unified memory layer every agent reads and writes through |
| **Search** | Vertex AI Search powering the RAG retrieval surface across project knowledge bases |
| **Inter-agent** | A2A protocol for agent-to-agent collaboration (the Research Agent handing off to the Legal Document Agent without humans in the middle) |
| **Tool calling** | MCP gateway for the Model Context Protocol — every external tool an agent can call goes through this safe, scoped, auditable boundary |
| **SDK** | ADK (Agent Development Kit) for building, evaluating, deploying custom agents |
| **Compute** | Cloud Run for stateless services, Compute Engine for the stateful workers |
| **Observability** | Cloud Trace for per-agent-run tracing, Cloud Logging for structured logs, BigQuery for warehouse, Looker Studio for dashboards |
| **Identity** | Firebase Auth for end-user identity, Google Workspace integration for SSO |
| **Storage** | Cloud Storage (and MinIO + R2 dual-write for object resilience) |

## Why the Google Cloud stack matters

The reason we picked Google end-to-end (rather than stitching pieces from
multiple clouds):

1. **A2A + MCP are now Google standards.** When the platform owner is the
   one defining the protocol, your custom agents will keep working as the
   protocol evolves.
2. **Memory Bank closes the agent-context loop.** Without a shared memory
   layer every agent re-derives context per run. With one, agents
   accumulate org-specific knowledge over time.
3. **Cloud Trace gives us per-span observability.** Every agent step
   (model call, RAG retrieval, tool call) is a span tagged with
   `organization_id`, `team_id`, `project_id`, `agent_key`. You can
   answer "why did this take 8 seconds?" with a flame graph.
4. **Vertex AI Search is enterprise-grade RAG.** Multi-modal, scoped by
   ACLs, residency-aware out of the box.
5. **Cloud Run + Memorystore + Cloud SQL** let us scale the stateless
   pieces to zero when idle. Customers don't pay for sleeping workers.

## Multi-model by default

Even though we're Google-first, the platform is **model-agnostic**.
Customers can route specific agents to specific providers per-run:

- **Google** — Gemini 2.5 Pro, Flash, Ultra (when available)
- **Anthropic** — Claude Opus 4.X, Sonnet 4.X, Haiku 4.X
- **OpenAI** — GPT-class models for code + creative
- **DeepSeek** — fast specialist for coding tasks
- **Mistral** — for European data residency needs
- **Perplexity Sonar** — for live web research with citations (default
  for the Research Agent)

Switch the default at the org level, override per-agent, override per-run.
The cost line on every proposal shows you exactly what each model run cost.

---

# Part 4 — Architecture

Brief reference for the technically curious.

- **1,053 routes across 24 routers** — the public OpenAPI spec is at
  <https://api.lumicoria.ai/docs>
- **MongoDB + Postgres** — primary stores (multi-tenant from row 1)
- **MinIO + Cloudflare R2** — dual-write object storage
- **Weaviate / Qdrant / Chroma** — vector RAG (pluggable per project)
- **Celery + Redis** — background agent runs, scheduled tasks, retention
  sweeps
- **WebSockets + Redis pub/sub** — everything realtime (presence, agent
  streaming, huddle transcripts, live agent responses)
- **Firebase Auth** — identity, **SAML 2.0** + **SCIM 2.0** for enterprise
- **Jitsi (self-hosted optional)** — video, recording (Jibri), live
  captions
- **PWA + Capacitor** — installable mobile shells loading the live URL
- **Vercel Edge Functions** — per-blog-post SEO meta-tag rendering
- **Cloudflare** — CDN, DDoS, edge cache, free-tier SSL

---

# Part 5 — If something doesn't work

- **Sign-in fails** — clear cookies for `lumicoria.ai`, try again. Google
  sign-in needs popups allowed.
- **Document upload spinner doesn't move** — refresh the page. The upload
  almost certainly succeeded but the WebSocket reconnect missed the
  finish event.
- **402 Upgrade required** — you hit a plan cap. The demo account is on
  Enterprise so this shouldn't happen, but if you signed up fresh you're
  on Free. Use the demo login.
- **A page is blank** — open DevTools → Console. Paste any red errors
  back to us and we'll fix.
- **An agent run hangs** — open the run detail; you'll see which step is
  stuck. If it's a model call, swap to a different model from the
  dropdown and retry.
- **Anything else** — email **hello@lumicoria.ai** or open an issue on
  the GitHub repo for this branch.

---

# Part 6 — Next steps

If you want to dig further:

- **Architecture deep-dive** → [`backend/README.md`](./backend/README.md)
- **Self-hosted Jitsi spec** → [`backend/docker/jitsi/README.md`](./backend/docker/jitsi/README.md)
- **Self-host the whole stack** → [`DEPLOY_GCP_VPS.md`](./DEPLOY_GCP_VPS.md)
- **Build a custom agent** → open Agent Studio at
  <https://lumicoria.ai/agent-builder>
- **Browse the public API** → <https://api.lumicoria.ai/docs>
- **Read about the agent universe** → <https://lumicoria.ai/agents>

---

We built Lumicoria because the AI tools we wanted didn't exist. The 12-tab
workflow of "ask the chat box, copy, paste, ask again" isn't sustainable
when the underlying models are good enough to actually participate in
work. So we built a workspace where they do — not as a feature, as the
substrate.

Tell us what's missing. We ship fast.

— The Lumicoria team
