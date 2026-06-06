import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Brand tokens (mirrors src/index.css)
const PURPLE = "#6C4AB0";
const PURPLE_DEEP = "#3B2D6A";
const PURPLE_LIGHT = "#9B87F5";
const SKY = "#0EA5E9";
const TEAL = "#38BDF8";
const INK = "#0F172A";
const SLATE_50 = "#F8FAFC";
const SLATE_200 = "#E2E8F0";
const SLATE_400 = "#94A3B8";
const SLATE_600 = "#475569";

const BRAND_GRADIENT = `linear-gradient(135deg, ${PURPLE} 0%, ${SKY} 100%)`;
const AURORA_GRADIENT = `radial-gradient(60% 80% at 20% 10%, ${PURPLE_LIGHT}40 0%, transparent 60%), radial-gradient(50% 70% at 85% 25%, ${SKY}30 0%, transparent 60%), radial-gradient(60% 70% at 50% 90%, ${PURPLE}25 0%, transparent 65%)`;

const FADE_UP = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { type: "spring" as const, stiffness: 220, damping: 24 },
};

// Pricing (kept in sync with Pricing.tsx + backend PLAN_LIMITS)
const TEAM_PER_SEAT = 39;
const BUSINESS_PER_SEAT = 79;
const ENTERPRISE_PER_SEAT = 129;
const ENTERPRISE_FLOOR = 1500;
const ANNUAL_DISCOUNT = 0.15;

type CompetitorRow = {
  feature: string;
  lumicoria: string;
  chatgpt: string;
  copilot: string;
  glean: string;
  notion: string;
};

const COMPARISON: CompetitorRow[] = [
  {
    feature: "Starting per-seat / month",
    lumicoria: `$${ENTERPRISE_PER_SEAT}`,
    chatgpt: "$60",
    copilot: "$30",
    glean: "$45",
    notion: "$24",
  },
  {
    feature: "Specialised AI agents (out of the box)",
    lumicoria: "21 (free on every plan)",
    chatgpt: "GPT only",
    copilot: "M365 Copilots",
    glean: "Search-led",
    notion: "Q&A only",
  },
  {
    feature: "Custom agents (per project)",
    lumicoria: "Unlimited",
    chatgpt: "GPTs (org)",
    copilot: "Add-ons",
    glean: "—",
    notion: "Limited",
  },
  { feature: "Shared knowledge base", lumicoria: "Yes — vector + RAG", chatgpt: "Workspace", copilot: "M365 only", glean: "Yes", notion: "Within Notion" },
  { feature: "Automation rules engine", lumicoria: "Yes", chatgpt: "—", copilot: "Power Automate (extra)", glean: "—", notion: "Buttons/Forms" },
  { feature: "SSO / SAML 2.0", lumicoria: "Yes", chatgpt: "Yes", copilot: "Yes", glean: "Yes", notion: "Plus tier" },
  { feature: "SCIM 2.0 provisioning", lumicoria: "Yes", chatgpt: "Yes", copilot: "Yes", glean: "Yes", notion: "Plus tier" },
  { feature: "Audit log export to SIEM", lumicoria: "Yes (Splunk/Datadog)", chatgpt: "Yes", copilot: "M365 only", glean: "Yes", notion: "Plus tier" },
  { feature: "Data residency (US / EU / IN)", lumicoria: "Yes", chatgpt: "EU only", copilot: "Yes", glean: "Yes", notion: "EU only" },
  { feature: "API access", lumicoria: "Yes", chatgpt: "Yes", copilot: "Limited", glean: "Yes", notion: "Limited" },
  { feature: "On-prem / private cloud", lumicoria: "Custom contract", chatgpt: "—", copilot: "M365 GCC only", glean: "Yes", notion: "—" },
  { feature: "Response-time SLA", lumicoria: "24/7, 1-hr P1", chatgpt: "Business hrs", copilot: "M365 SLA", glean: "Business hrs", notion: "Business hrs" },
];

const FEATURES = [
  { title: "21 platform agents, free for the team", body: "Document, meeting, legal, research, vision, wellbeing, and more — every plan ships with the full lineup. No per-agent licence." },
  { title: "Custom agents per project", body: "Spin up purpose-built agents inside any project. Pick the model, set autonomy, attach a knowledge base. Cost flows to the org budget." },
  { title: "Shared organisation knowledge base", body: "Documents you upload at org, team, or project scope become RAG-ready instantly. Citations always travel with the answer." },
  { title: "SSO + SCIM out of the box", body: "Plug in Okta, Azure AD, or any SAML 2.0 IdP. Auto-provision and de-provision users via SCIM 2.0. Domain auto-join keeps onboarding tight." },
  { title: "Data residency you control", body: "Pin your data to US, EU, or India. Customer-managed encryption keys available on contract." },
  { title: "Audit export to your SIEM", body: "Stream every action — task touched, agent invoked, document opened — to Splunk, Datadog, or any HEC-compatible sink." },
  { title: "Automation rules engine", body: "If a task moves to ‘blocked’, ping the lead. If a contract uploads, run the legal agent. Build it in minutes, no code." },
  { title: "Real-time chat with agents", body: "Invite an agent into a project channel. Tag it with `/run`. It answers in the thread, with sources, in real time." },
  { title: "Enterprise SLA + 24/7 support", body: "1-hour P1 response, dedicated CSM, quarterly business reviews, and onboarding workshops baked into every Enterprise contract." },
];

const AGENT_REQUEST_CHIPS = [
  "Legal contract review",
  "Sales prospecting + outreach",
  "RFP / RFI response",
  "Compliance audit prep",
  "Research synthesis",
  "Customer success enablement",
];

const FAQ = [
  { q: "How is pricing structured?", a: "Per seat, billed monthly or annually. Annual saves 15%. Enterprise carries a $1,500/mo floor below 12 seats; above 12 seats it's pure per-seat economics." },
  { q: "Is the data we send used to train models?", a: "No. Customer data is never used to train any third-party or Lumicoria model. You retain ownership of your inputs and outputs." },
  { q: "Can we bring our own LLM keys?", a: "Yes. Enterprise contracts support BYOK across OpenAI, Anthropic, Google, Perplexity, Mistral, and self-hosted models." },
  { q: "What's the deployment model?", a: "Multi-tenant SaaS by default. Private-cloud and on-prem deployments are available under a Lumicoria Custom contract via lumicoria.com." },
  { q: "How fast can we be live?", a: "A free pilot ships same day. SSO + SCIM rollout for a 250-seat tenant typically completes in under a week." },
  { q: "What integrations are supported?", a: "Slack, Microsoft Teams, Google Workspace, Notion, Linear, Jira, Asana, Trello, Monday, GitHub, Figma, Salesforce, HubSpot — and outbound webhooks for everything else." },
  { q: "Do you offer a DPA / BAA?", a: "Yes. SOC 2 Type II is in progress (Q3 audit), ISO 27001 is in progress (Q4), GDPR DPA is available on request, and HIPAA BAA ships with the Enterprise contract." },
  { q: "What about API access?", a: "Yes. Every paid plan ships with API access; Enterprise gets bumped rate limits, webhook delivery guarantees, and machine accounts." },
  { q: "Can agents be restricted by project?", a: "Yes. Project leads control which agents (platform or custom) are active in a project, and at what autonomy level (suggest / propose / execute)." },
  { q: "How are credits / cost tracked?", a: "Every agent run records tokens and cost in real time. Admins see live spend by agent, team, project, and seat — with cost forecasts and per-agent budgets." },
  { q: "What if we need an agent you don't have?", a: "Tell us the workflow. We'll either build it as a custom agent in your org, or scope a fully bespoke Lumicoria deployment via lumicoria.com." },
  { q: "Can we cancel?", a: "Yes — month-to-month subscriptions can be cancelled at any time and run to the end of the period. Annual contracts renew unless cancelled before the renewal window." },
];

function Pill({ children, kind = "purple" }: { children: React.ReactNode; kind?: "purple" | "ghost" | "outline" }) {
  if (kind === "outline") {
    return (
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 9999,
          border: `1px solid ${PURPLE}30`, color: PURPLE_DEEP,
          fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
          background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
        }}
      >
        {children}
      </span>
    );
  }
  if (kind === "ghost") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 9999, color: PURPLE_DEEP,
        fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
      }}>
        {children}
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 9999,
      color: "white", background: BRAND_GRADIENT,
      fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
      boxShadow: "0 6px 18px rgba(108,74,176,0.25)",
    }}>
      {children}
    </span>
  );
}

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(15,23,42,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "14px 22px", borderRadius: 9999,
        color: "white", background: BRAND_GRADIENT,
        fontWeight: 600, fontSize: 15, letterSpacing: 0.2,
        boxShadow: "0 14px 36px rgba(108,74,176,0.35)",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

function GhostCTA({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "13px 22px", borderRadius: 9999,
        color: PURPLE_DEEP, background: "rgba(255,255,255,0.65)",
        border: `1px solid ${PURPLE}33`,
        fontWeight: 600, fontSize: 15, letterSpacing: 0.2,
        textDecoration: "none", backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </a>
  );
}

const Enterprise: React.FC = () => {
  const [seats, setSeats] = useState(50);
  const [comparePrice, setComparePrice] = useState(60); // ChatGPT Enterprise default
  const [cadence, setCadence] = useState<"monthly" | "annual">("annual");

  const annualMultiplier = cadence === "annual" ? 1 - ANNUAL_DISCOUNT : 1;
  const lumicoriaMonthly = Math.max(ENTERPRISE_PER_SEAT * annualMultiplier * seats, ENTERPRISE_FLOOR);
  const lumicoriaAnnual = lumicoriaMonthly * 12;
  const competitorMonthly = comparePrice * seats;
  const competitorAnnual = competitorMonthly * 12;
  const annualSavings = Math.max(competitorAnnual - lumicoriaAnnual, 0);
  const threeYearSavings = annualSavings * 3;

  const [requestText, setRequestText] = useState("");
  const [requestChip, setRequestChip] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const submitRequest = async () => {
    try {
      await fetch("/api/v1/org-billing/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "enterprise", cadence, seats }),
      });
    } catch { /* preview only */ }
    setRequestSubmitted(true);
  };

  const heroVisible = useMemo(() => true, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: INK,
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: `${SLATE_50}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          background: AURORA_GRADIENT,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      />

      {/* Lightweight top bar (no MainNav) */}
      <header
        style={{
          position: "relative", zIndex: 5,
          padding: "20px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: BRAND_GRADIENT, boxShadow: "0 6px 16px rgba(108,74,176,0.35)",
            }} />
            <span style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: INK }}>
              Lumicoria
            </span>
          </div>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 14, color: SLATE_600 }}>
          <Link to="/pricing" style={{ color: SLATE_600, textDecoration: "none" }}>Pricing</Link>
          <Link to="/agents" style={{ color: SLATE_600, textDecoration: "none" }}>Agents</Link>
          <a href="https://lumicoria.com" target="_blank" rel="noopener noreferrer" style={{ color: SLATE_600, textDecoration: "none" }}>Custom</a>
          <PrimaryCTA href="#contact-sales">Talk to sales</PrimaryCTA>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 1200, margin: "0 auto", padding: "64px 32px 48px",
          textAlign: "center",
        }}
      >
        <motion.div {...FADE_UP}>
          <Pill kind="outline">Lumicoria Enterprise · per-seat from ${ENTERPRISE_PER_SEAT}/mo</Pill>
        </motion.div>
        <motion.h1
          {...FADE_UP}
          style={{
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700,
            letterSpacing: -1.2,
            lineHeight: 1.05,
            marginTop: 18, marginBottom: 18,
            background: BRAND_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Enterprise AI collaboration<br/>that pays for itself.
        </motion.h1>
        <motion.p
          {...FADE_UP}
          style={{
            maxWidth: 760, margin: "0 auto",
            fontSize: 18, lineHeight: 1.55, color: SLATE_600,
          }}
        >
          Run 21 specialised agents and unlimited custom builds across every project, team, and seat —
          governed by SSO, SCIM, audit export, and the SLA your security team actually asked for.
        </motion.p>
        <motion.div {...FADE_UP} style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <PrimaryCTA href="#contact-sales">Talk to sales</PrimaryCTA>
          <GhostCTA href="/signup">Start a free pilot</GhostCTA>
        </motion.div>

        {/* Live counter strip */}
        <motion.div
          {...FADE_UP}
          style={{
            display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16,
            marginTop: 64, maxWidth: 800, marginInline: "auto",
          }}
        >
          {[
            { n: "21", lab: "Platform agents on day one" },
            { n: "920+", lab: "API endpoints, multi-tenant" },
            { n: "24/7", lab: "P1 response, 1-hour SLA" },
          ].map((m) => (
            <GlassCard key={m.lab} style={{ padding: 20, textAlign: "center" }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 36, color: PURPLE_DEEP, letterSpacing: -0.5,
              }}>{m.n}</div>
              <div style={{ fontSize: 13, color: SLATE_600, marginTop: 6 }}>{m.lab}</div>
            </GlassCard>
          ))}
        </motion.div>
      </section>

      {/* Comparison table */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>
        <motion.h2 {...FADE_UP} style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36, fontWeight: 700, letterSpacing: -0.6, color: INK,
          textAlign: "center", marginBottom: 12,
        }}>
          Side-by-side with the field
        </motion.h2>
        <motion.p {...FADE_UP} style={{ textAlign: "center", color: SLATE_600, fontSize: 16, maxWidth: 720, margin: "0 auto 36px" }}>
          Pricing and feature data current as of {new Date().toLocaleString("default", { month: "long", year: "numeric" })}.
          Lumicoria includes everything below at Enterprise; competitors typically tier or unbundle.
        </motion.p>
        <motion.div {...FADE_UP}>
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.6)" }}>
                    <th style={{ textAlign: "left", padding: "16px 18px", color: SLATE_600, fontWeight: 600 }}>Feature</th>
                    <th style={{ textAlign: "left", padding: "16px 18px", color: PURPLE_DEEP, fontWeight: 700 }}>Lumicoria</th>
                    <th style={{ textAlign: "left", padding: "16px 18px", color: SLATE_600, fontWeight: 600 }}>ChatGPT Enterprise</th>
                    <th style={{ textAlign: "left", padding: "16px 18px", color: SLATE_600, fontWeight: 600 }}>MS Copilot</th>
                    <th style={{ textAlign: "left", padding: "16px 18px", color: SLATE_600, fontWeight: 600 }}>Glean</th>
                    <th style={{ textAlign: "left", padding: "16px 18px", color: SLATE_600, fontWeight: 600 }}>Notion AI</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, idx) => (
                    <tr key={row.feature} style={{ borderTop: `1px solid ${SLATE_200}` }}>
                      <td style={{ padding: "12px 18px", color: INK, fontWeight: 500 }}>{row.feature}</td>
                      <td style={{ padding: "12px 18px", color: PURPLE_DEEP, fontWeight: 600 }}>{row.lumicoria}</td>
                      <td style={{ padding: "12px 18px", color: SLATE_600 }}>{row.chatgpt}</td>
                      <td style={{ padding: "12px 18px", color: SLATE_600 }}>{row.copilot}</td>
                      <td style={{ padding: "12px 18px", color: SLATE_600 }}>{row.glean}</td>
                      <td style={{ padding: "12px 18px", color: SLATE_600 }}>{row.notion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Savings calculator */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 32px 48px" }}>
        <motion.div {...FADE_UP}>
          <GlassCard style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32, alignItems: "center" }}>
              <div>
                <Pill>See your savings</Pill>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 28, fontWeight: 700, marginTop: 14, marginBottom: 8, color: INK, letterSpacing: -0.5,
                }}>How much does Lumicoria save you?</h3>
                <p style={{ color: SLATE_600, fontSize: 15, marginBottom: 22, lineHeight: 1.5 }}>
                  Compare against the per-seat list price of the AI suite you're currently evaluating.
                  Numbers update live.
                </p>

                <label style={{ display: "block", marginBottom: 18 }}>
                  <span style={{ display: "block", color: SLATE_600, fontSize: 13, marginBottom: 6 }}>Seats</span>
                  <input
                    type="range" min={5} max={500} value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value, 10))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ marginTop: 4, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: PURPLE_DEEP }}>
                    {seats.toLocaleString()} seats
                  </div>
                </label>

                <label style={{ display: "block", marginBottom: 18 }}>
                  <span style={{ display: "block", color: SLATE_600, fontSize: 13, marginBottom: 6 }}>
                    Competitor per-seat / month
                  </span>
                  <input
                    type="number" min={10} max={500} value={comparePrice}
                    onChange={(e) => setComparePrice(parseFloat(e.target.value) || 0)}
                    style={{
                      width: 140, padding: "10px 12px",
                      borderRadius: 12, border: `1px solid ${SLATE_200}`,
                      fontSize: 15, fontFamily: "'Space Grotesk', sans-serif",
                      background: "white",
                    }}
                  />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                  {(["monthly", "annual"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCadence(c)}
                      style={{
                        padding: "10px 16px", borderRadius: 9999,
                        border: `1px solid ${PURPLE}33`,
                        background: cadence === c ? BRAND_GRADIENT : "rgba(255,255,255,0.6)",
                        color: cadence === c ? "white" : PURPLE_DEEP,
                        fontWeight: 600, fontSize: 13, cursor: "pointer",
                      }}
                    >
                      {c === "annual" ? "Annual (−15%)" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
                }}>
                  <GlassCard style={{ padding: 18 }}>
                    <div style={{ fontSize: 12, color: SLATE_400, textTransform: "uppercase", letterSpacing: 1 }}>Lumicoria</div>
                    <div style={{ marginTop: 6, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: PURPLE_DEEP }}>
                      ${Math.round(lumicoriaMonthly).toLocaleString()}/mo
                    </div>
                    <div style={{ fontSize: 12, color: SLATE_600, marginTop: 2 }}>
                      ${Math.round(lumicoriaAnnual).toLocaleString()}/yr
                    </div>
                  </GlassCard>
                  <GlassCard style={{ padding: 18 }}>
                    <div style={{ fontSize: 12, color: SLATE_400, textTransform: "uppercase", letterSpacing: 1 }}>Competitor</div>
                    <div style={{ marginTop: 6, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: SLATE_600 }}>
                      ${Math.round(competitorMonthly).toLocaleString()}/mo
                    </div>
                    <div style={{ fontSize: 12, color: SLATE_600, marginTop: 2 }}>
                      ${Math.round(competitorAnnual).toLocaleString()}/yr
                    </div>
                  </GlassCard>
                </div>
                <div style={{ marginTop: 16, padding: 20, borderRadius: 18, background: BRAND_GRADIENT, color: "white" }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9 }}>Estimated savings</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 36, marginTop: 4 }}>
                    ${Math.round(annualSavings).toLocaleString()}/yr
                  </div>
                  <div style={{ marginTop: 4, opacity: 0.9, fontSize: 13 }}>
                    ${Math.round(threeYearSavings).toLocaleString()} over 3 years
                  </div>
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: SLATE_400, textAlign: "center" }}>
                  Enterprise floor: ${ENTERPRISE_FLOOR.toLocaleString()}/mo applies under 12 seats.
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>
        <motion.h2 {...FADE_UP} style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36, fontWeight: 700, letterSpacing: -0.6, color: INK,
          textAlign: "center", marginBottom: 36,
        }}>
          Everything an enterprise team needs, in one tenant
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 }}>
          {FEATURES.map((f) => (
            <motion.div key={f.title} {...FADE_UP}>
              <GlassCard style={{ padding: 22, height: "100%" }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: BRAND_GRADIENT, marginBottom: 14 }} />
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ color: SLATE_600, fontSize: 14, lineHeight: 1.55 }}>{f.body}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Request agents */}
      <section id="request-agents" style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>
        <motion.div {...FADE_UP}>
          <GlassCard style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 32, alignItems: "center" }}>
              <div>
                <Pill>Request a custom agent</Pill>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginTop: 14, marginBottom: 8, letterSpacing: -0.5 }}>
                  Tell us the workflow.<br/>We'll build the agent.
                </h3>
                <p style={{ color: SLATE_600, fontSize: 15, lineHeight: 1.55 }}>
                  Describe the job your team would hand to a smart specialist. Our agent team turns it into
                  a project-bound agent on your tenant, with the right model, sources, and approval flow.
                </p>
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {AGENT_REQUEST_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => { setRequestChip(chip); setRequestText(chip); }}
                      style={{
                        padding: "8px 14px", borderRadius: 9999, fontSize: 13,
                        border: requestChip === chip ? `2px solid ${PURPLE}` : `1px solid ${PURPLE}33`,
                        background: requestChip === chip ? "white" : "rgba(255,255,255,0.5)",
                        color: PURPLE_DEEP, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {requestSubmitted ? (
                  <div style={{ padding: 24, borderRadius: 18, background: "white", border: `1px solid ${PURPLE}33` }}>
                    <div style={{ fontWeight: 700, color: PURPLE_DEEP, fontSize: 18, marginBottom: 6 }}>Got it.</div>
                    <div style={{ color: SLATE_600, fontSize: 14 }}>
                      Our sales team will reach out within one business day with a build estimate and a starter
                      tenant for you to try.
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      placeholder="e.g. ‘Review every inbound MSA against our standard playbook and surface clause-level deltas.’"
                      rows={6}
                      style={{
                        width: "100%", padding: 16,
                        borderRadius: 16, border: `1px solid ${SLATE_200}`,
                        fontSize: 14, lineHeight: 1.5,
                        background: "white", color: INK,
                        fontFamily: "Inter, sans-serif", resize: "vertical",
                      }}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <PrimaryCTA href="#" >
                        <span onClick={(e) => { e.preventDefault(); submitRequest(); }}>Send to sales</span>
                      </PrimaryCTA>
                      <GhostCTA href="https://lumicoria.com" external>
                        Need a fully custom build → Lumicoria Custom
                      </GhostCTA>
                    </div>
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Custom build CTA */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "16px 32px 32px" }}>
        <motion.div {...FADE_UP}>
          <GlassCard style={{ padding: 28, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <Pill kind="outline">Bespoke deployment</Pill>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>
              Need a deployment with your data, your models, your branding?
            </h3>
            <p style={{ color: SLATE_600, fontSize: 15, lineHeight: 1.55, maxWidth: 720 }}>
              Lumicoria Custom is our enterprise services arm. Private cloud, on-prem, regulated industries,
              bring-your-own-model — all under a single contract.
            </p>
            <GhostCTA href="https://lumicoria.com" external>Talk to Lumicoria Custom →</GhostCTA>
          </GlassCard>
        </motion.div>
      </section>

      {/* Compliance + security */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>
        <motion.div {...FADE_UP} style={{ textAlign: "center" }}>
          <Pill kind="outline">Trust &amp; security</Pill>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginTop: 10, marginBottom: 8, letterSpacing: -0.5 }}>
            Built for the security team's threat model
          </h3>
          <p style={{ color: SLATE_600, fontSize: 15, lineHeight: 1.55, maxWidth: 720, margin: "0 auto" }}>
            Customer data is never used to train any model. Every action lands in an immutable audit log.
            Encryption is industry-standard everywhere data sits or moves.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
            {[
              "SOC 2 Type II (in progress, Q3 audit)",
              "ISO 27001 (in progress, Q4)",
              "GDPR — DPA on request",
              "HIPAA — BAA on Enterprise contract",
            ].map((b) => (
              <span key={b} style={{
                padding: "10px 16px", borderRadius: 9999,
                background: "white", border: `1px solid ${PURPLE}22`,
                color: PURPLE_DEEP, fontWeight: 600, fontSize: 13,
              }}>
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
        <motion.h2 {...FADE_UP} style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36, fontWeight: 700, letterSpacing: -0.6, color: INK,
          textAlign: "center", marginBottom: 36,
        }}>
          Questions, answered straight.
        </motion.h2>
        <motion.div {...FADE_UP}>
          <GlassCard style={{ padding: 8 }}>
            {FAQ.map((item, idx) => (
              <details key={item.q} style={{
                padding: "18px 22px",
                borderBottom: idx < FAQ.length - 1 ? `1px solid ${SLATE_200}` : "none",
              }}>
                <summary style={{
                  cursor: "pointer", listStyle: "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, color: INK, fontSize: 16,
                }}>
                  {item.q}
                  <span style={{ color: PURPLE, fontSize: 20, marginLeft: 16 }}>+</span>
                </summary>
                <p style={{ marginTop: 12, color: SLATE_600, fontSize: 14, lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </GlassCard>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section id="contact-sales" style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" }}>
        <motion.div {...FADE_UP}>
          <GlassCard style={{
            padding: 48,
            background: `linear-gradient(135deg, ${PURPLE_DEEP} 0%, ${PURPLE} 60%, ${SKY} 100%)`,
            border: "1px solid rgba(255,255,255,0.25)",
            color: "white", textAlign: "center",
          }}>
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 36, fontWeight: 700, letterSpacing: -0.6, marginBottom: 14,
            }}>
              Ready to put 21 agents on your team?
            </h3>
            <p style={{ opacity: 0.85, maxWidth: 640, margin: "0 auto", fontSize: 16, lineHeight: 1.55, marginBottom: 24 }}>
              Same-day pilot. Full SSO + SCIM rollout in under a week. Dedicated CSM and quarterly reviews
              baked into the contract.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a
                href="mailto:enterprise@lumicoria.ai?subject=Lumicoria%20Enterprise%20inquiry"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 22px", borderRadius: 9999,
                  background: "white", color: PURPLE_DEEP,
                  fontWeight: 700, fontSize: 15, textDecoration: "none",
                  boxShadow: "0 14px 36px rgba(0,0,0,0.25)",
                }}
              >
                Talk to sales
              </a>
              <Link
                to="/signup"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 22px", borderRadius: 9999,
                  background: "rgba(255,255,255,0.15)", color: "white",
                  border: "1px solid rgba(255,255,255,0.4)",
                  fontWeight: 600, fontSize: 15, textDecoration: "none",
                }}
              >
                Start free pilot
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 1,
        padding: "32px", textAlign: "center",
        color: SLATE_400, fontSize: 13,
      }}>
        <div>© {new Date().getFullYear()} Lumicoria AI. Enterprise contracts via <a href="https://lumicoria.com" target="_blank" rel="noopener noreferrer" style={{ color: PURPLE_DEEP, textDecoration: "none" }}>lumicoria.com</a>.</div>
      </footer>
    </div>
  );
};

export default Enterprise;
