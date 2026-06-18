# Lumicoria AI — Demo guide

A short walk-through of the product using two real customer use cases. You
don't need to install anything. You'll spend most of the time clicking
through the live app and watching agents do real work.

**Live URL** → <https://lumicoria.ai>

---

## Demo login

You can either sign up fresh with Google (everyone gets a free workspace), or
use the pre-populated demo account so you can see two real organisations and
some pre-loaded history. The demo account is **TalentPort Labs**, plus an
invited project for **Queska**.

| Field    | Value                            |
|----------|----------------------------------|
| Email    | `jacobasuquo199@gmail.com`       |
| Password | `lumicoriaDemo988.`              |

Open <https://lumicoria.ai/login>, paste those, sign in. You'll land in the
workspace home.

> If you'd rather sign up fresh: click **Continue with Google** and finish
> onboarding (it takes 30 seconds). You'll see the same surfaces, just
> empty — the script below walks you through populating them.

---

## What you're about to see

Lumicoria is an AI operating system for work. Not a chat box, not a single
agent — a **multi-tenant workspace with 21 specialised agents that collaborate
with humans on real tasks**. The closest comparisons are Notion + Slack +
Asana + ChatGPT, except every layer of the platform has AI woven in by
default.

Two use cases drive this demo:

1. **TalentPort** — a digital education company training software engineers
   and data analysts. Their challenge: turn long internal strategy documents
   into concrete tasks, assign them to teammates, and run autonomous
   research, recruitment outreach, and content drafting in the background.
2. **Queska** — a corporate travel company. Their challenge: integrate a
   complex travel-management workflow across 14 internal stakeholders, with
   a mix of human and AI-driven steps.

We're going to load real documents from both companies into Lumicoria, watch
agents extract the work, route it to humans and agents, and then run the
autonomous loop.

---

## The two demo documents

We've included both source documents in the repository so you can download
them and try the upload step yourself.

| Company    | What it is                                 | Download                                                                                                                          |
|------------|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| TalentPort | Recruitment + curriculum strategy session  | [TalentPort Recruitment Strategy Session.pdf](./TalentPort%20Recruitment%20Strategy%20Session.pdf) · [Google Doc](https://docs.google.com/document/d/1NyxpO_IKqfDyo5UUzQ-dF2oEjrwBH-TLJyeLzaGBaU8/edit?usp=sharing) |
| Queska     | Corporate-travel integration brief         | [Queska Corporate Travel Integration Brief.pdf](./Queska%20Corporate%20Travel%20Integration%20Brief.pdf) · [Google Doc](https://docs.google.com/document/d/1FBlRN3muVyCUrThZK-8HViU6N227kLG3q3mPZEMtacw/edit?usp=sharing) |

> If you cloned the repo locally, the PDFs are right next to this file. If
> you're reading this on GitHub, click either filename above to download.

---

## Step 1 · Walk into the workspace

After you sign in you land at <https://lumicoria.ai/workspace>.

This is the workspace home for **TalentPort Labs**. Three things to notice:

- The **cover banner** at the top — every team can brand their own
  workspace, including upload custom cover + logo (we built first-class
  image support, not the usual stock pattern).
- The **agent leaderboard** card on the right — this is the live list of
  the 21 platform agents, sorted by usage in this org. It updates every
  time an agent runs.
- The **Quick Actions** strip + the **Pinned / Recent / Starred** rails.
  Lumicoria treats your work the way a good IDE treats your files — most
  recent, most pinned, most starred are always one click away.

Open the **Activity** tab in the left sidebar (`/workspace/activity`). This
is the live event stream for the org: every document upload, every agent
run, every task created, every member action. It's the same feed we
forward to your SIEM if you're on the Enterprise plan.

---

## Step 2 · Upload the TalentPort brief into the Document Agent

This is the most important moment of the demo. Pay attention to what
happens after the upload — the agent doesn't just summarise it. It pulls
real work out and routes it.

1. In the left sidebar, click **Agents** → **Document** (or open
   <https://lumicoria.ai/agents/document> directly).
2. You'll see the Document Agent landing page. There's an upload zone at
   the top labelled **"Drop a document or click to browse"**.
3. Click it, pick the file
   [`TalentPort Recruitment Strategy Session.pdf`](./TalentPort%20Recruitment%20Strategy%20Session.pdf)
   you downloaded above, and confirm the upload.
4. Watch the progress chip. Behind the scenes, the agent is:
   - OCR-ing the PDF (PyMuPDF + Tesseract fallback)
   - Chunking it into semantic windows
   - Embedding the chunks into the project's vector store
   - Extracting entities, decisions, deadlines, owners, and *action items*

> The first time you do this on a fresh account it takes 15-30 seconds.
> Subsequent uploads to the same project hit the warm RAG store and finish
> in under 5 seconds.

When the agent finishes, the right panel populates with a **Proposal**. The
proposal carries:

- A rendered markdown summary of the document
- A list of every **action item** the agent found (titles, owners,
  deadlines, priorities, source citations)
- A cost line showing exactly how much this run cost ($X.XX, broken down
  by token + storage)
- Three buttons: **Approve**, **Request revision**, **Reject**

This is the human-in-the-loop pattern at the per-task level. Nothing gets
filed without you saying yes.

---

## Step 3 · Approve, watch the tasks land

Click **Approve** on the proposal.

Three things happen in the next two seconds:

1. The action items become real tasks under
   <https://lumicoria.ai/workspace/projects/<project_id>/tasks> — one row
   per item, with the deadline, owner, and source link back to the
   originating page in the uploaded PDF.
2. Each task that the Document Agent flagged as "agent-solvable" gets an
   AI co-owner. Open one — you'll see two avatars in the assignee strip: a
   human (you) and the Research Agent (or Meeting Agent, or whichever
   specialist matches the work).
3. The activity feed picks up a `document.processed` event and a row of
   `task.created` events. Every single action is auditable.

Switch to the **Board** view of the Tasks tab. You'll see five lanes:
**To do · In progress · In review · Blocked · Done**. The tasks the agent
created sit in the To-do lane.

---

## Step 4 · Let an agent run autonomously on one of those tasks

Pick a research-ish task from the list — for the TalentPort brief, you'll
see something like *"Research current market salary bands for junior data
analysts in West Africa"*. Click it.

The task detail drawer opens. You'll see:

- **Description** — pulled from the source document with a citation link
  back to the original PDF page
- **Assignees** — you + the Research Agent
- **Activity timeline** at the bottom
- A **Run agent** button at the top right

Click **Run agent**.

Watch the timeline. Within ~30 seconds:

- The Research Agent fetches relevant web sources (Perplexity Sonar by
  default — you can switch to Gemini, Claude, GPT, or DeepSeek per-run)
- It synthesises findings with citations
- It posts a **draft proposal** back into the task drawer
- It sets the task status to *In review*
- It pings the human assignee for approval

This is the **autonomous loop**. The agent didn't wait for you to ask. The
moment the task became a task, the agent recognised it could solve it and
started working. You only intervene when it asks you to.

Approve the agent's draft. The task moves to *Done* and the draft gets
saved as a comment with full citations.

---

## Step 5 · Run the same flow on the Queska brief

Now do the second use case. This is shorter because the pattern is the
same, but you'll see the agent handle a wildly different domain:

1. Go to **Projects** → **New project**
2. Name it `Queska Integration`, pick the colour you want, click **Create**
3. Open the new project, then click **Documents** → **Upload**
4. Drop in
   [`Queska Corporate Travel Integration Brief.pdf`](./Queska%20Corporate%20Travel%20Integration%20Brief.pdf)
5. When the Document Agent finishes, approve the proposal
6. Open the resulting tasks and pick one — try *"Draft the API contract
   between the booking engine and the payments service"*
7. Click **Run agent** — this time the **Legal Document Agent** runs and
   produces a draft contract with clause-by-clause reasoning

You're now operating the same product on two completely different
verticals (HR + travel) with no special configuration. That's the
universe-of-agents bet paying off.

---

## Step 6 · Try the Customer Service Agent

Every modern B2B product needs to handle customer support. Lumicoria ships
the Customer Service Agent as a first-class surface that any team can
embed.

1. Open <https://lumicoria.ai/agents/customer-service>
2. Notice the three tabs: **Tickets · Templates · Branding**
3. Click **New ticket**, fill in:
   - Customer email: `aiyana@queska.com`
   - Topic: `Refund for trip cancellation`
   - Severity: `Medium`
4. Click **Save**, then **Run agent**

The Customer Service Agent will:

- Pull the customer's history from the org's CRM-like store
- Draft a personalised response with the right tone for the severity
- Suggest a refund amount based on your business rules
- Attach a citation to your refund policy doc (uploaded earlier via RAG)
- Wait for your approval before sending

This is the same pattern as Step 4 — agent works autonomously, human
approves at the right moment.

---

## Step 7 · The full Agent Universe

Open <https://lumicoria.ai/agents>. This is the catalogue of all 21
specialised platform agents:

**Work execution** — Document, Meeting, Meeting Fact Checker, Vision, RAG,
Data Analysis, Knowledge Graph, Legal Document, Translation

**Creative + communication** — Creative, Social Media, Customer Service

**Learning + growth** — Student, Learning Coach, Research, Research Mentor

**Operations + wellbeing** — Wellbeing Coach, Focus & Flow, Workspace
Ergonomics, Ethics & Bias

**Coordination** — Intelligence Agent (the orchestrator that routes
ambiguous requests to the right specialist)

Click any of them to land on the agent's own page. Every agent has:

- A "what it does" hero
- A live interaction surface (paste text, upload a file, ask a question)
- A history of past runs
- An analytics tab (cost, latency, success rate)
- A docs link with the agent's full prompt + tool list

And here's the part that's hard to overstate: any of these can be **invited
to any project**. They run with the project's permissions, see the
project's knowledge base, and respect the org's data residency. They share
a unified Memory Bank, so the Research Agent remembers what the Document
Agent learned.

---

## Step 8 · Bonus — Lumicoria Huddle (live meeting product)

This isn't in the strict demo flow but it's the most visually impressive
piece. If you have ~3 minutes:

1. Open <https://lumicoria.ai/agents/meeting>
2. Click the purple **Start meeting** button in the hero
3. A new tab opens with the Jitsi-powered meeting room
4. On the right is the AI sidebar with the same agent catalogue you saw
   above. Click **+** on any agent to add them to the call
5. Speak. The Meeting Agent transcribes, the Translation Agent provides
   live captions in your chosen language, and any other attached agent
   responds in real time

End the call (red button bottom right of the sidebar). You'll be routed
back to <https://lumicoria.ai/agents/meeting> — and within ~10 seconds
you'll see a fresh entry in the meeting library with:

- The full transcript
- A post-call summary (decisions, action items, follow-ups)
- Speaker analytics (talk-time, interruptions, sentiment trends)
- A signed-URL recording (if you turned it on)

The kicker: Lumicoria Huddle competes head-on with Google Meet, Zoom, and
Slack Huddles. We built it on Jitsi (open source) so we could embed AI
agents directly into the audio + transcript layer. Other meeting products
will eventually copy this; for now, we're the only one shipping it.

---

## What's behind the curtain

If you want to look at the architecture instead of the UI, the live API is
at <https://api.lumicoria.ai/docs> — that's the public OpenAPI spec with
every endpoint browseable.

- **1,053 routes across 24 routers** powering this UX
- **MongoDB + Postgres** primary stores (multi-tenant from row 1)
- **MinIO + Cloudflare R2** dual-write object storage
- **Weaviate / Qdrant / Chroma** for vector RAG
- **Celery + Redis** for background agent runs
- **WebSockets + Redis pub/sub** for everything realtime (presence, agent
  streaming, huddle transcript, live agent responses)
- **Firebase Auth** for identity, **SAML 2.0** + **SCIM 2.0** for
  enterprise
- **MCP** + **A2A** protocols for agent-to-agent communication
- **Cloud Trace + BigQuery + Looker Studio** for observability
- Built on the **Google Cloud agent stack** (Gemini 2.5 Pro/Flash, Vertex
  AI Search, Agent Runtime, Memory Bank, ADK), Anthropic Claude, OpenAI,
  DeepSeek, Mistral, Perplexity Sonar

---

## If something doesn't work

- **Sign-in fails** — clear cookies for `lumicoria.ai`, try again. Google
  sign-in needs popups allowed.
- **Document upload spinner doesn't move** — refresh the page. The upload
  almost certainly succeeded but the WebSocket reconnect missed the
  finish event.
- **402 Upgrade required** — you hit a plan cap. The demo account is on
  Enterprise so this shouldn't happen, but if you signed up fresh you're
  on Free (1 huddle/day, 30 min max, no agents in call). Use the demo
  login.
- **A page is blank** — open DevTools → Console. Paste any red errors
  back to us and we'll fix.

Anything else? Email us at **hello@lumicoria.ai** or open an issue on the
GitHub repo for this branch.

---

## Next steps

If you want to dig further:

- **Browse the architecture** → [`backend/README.md`](./backend/README.md)
- **Read the Huddle spec** → [`backend/docker/jitsi/README.md`](./backend/docker/jitsi/README.md)
- **Self-host the whole stack** → [`DEPLOY_GCP_VPS.md`](./DEPLOY_GCP_VPS.md)
- **Build a custom agent** → open Agent Studio at
  <https://lumicoria.ai/agent-builder>

Thank you for taking the time. We built this in two months from a kitchen
table, and we think it changes how teams work alongside AI for the next
decade. Tell us if you agree, disagree, or want to talk.

— The Lumicoria team
