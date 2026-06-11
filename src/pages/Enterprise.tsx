import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  Database,
  FileCheck,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Workflow,
} from "lucide-react";

const TEAM_PER_SEAT = 39;
const BUSINESS_PER_SEAT = 79;
const ENTERPRISE_PER_SEAT = 129;
const ENTERPRISE_FLOOR = 1500;
const ANNUAL_DISCOUNT = 0.15;

const FADE_UP = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { type: "spring" as const, stiffness: 210, damping: 26 },
};

type ComparisonRow = {
  feature: string;
  lumicoria: string;
  typical: string;
  impact: string;
};

const COMPARISON: ComparisonRow[] = [
  {
    feature: "Agent portfolio",
    lumicoria: "21 specialized agents included",
    typical: "Single assistant, copilots, or add-on packs",
    impact: "One governed workspace for every function",
  },
  {
    feature: "Custom agents",
    lumicoria: "Unlimited project-bound builds",
    typical: "Builder access, paid services, or limited templates",
    impact: "Specialist workflows without vendor sprawl",
  },
  {
    feature: "Knowledge base",
    lumicoria: "Org, team, and project RAG with citations",
    typical: "Search-led or locked to one suite",
    impact: "Answers carry sources and permissions",
  },
  {
    feature: "Identity and access",
    lumicoria: "SAML SSO, SCIM, domain auto-join",
    typical: "Available only on top enterprise tiers",
    impact: "Fast rollout with clean offboarding",
  },
  {
    feature: "Audit and compliance",
    lumicoria: "Immutable activity log and SIEM export",
    typical: "Partial logs or admin-only reports",
    impact: "Security can trace every agent action",
  },
  {
    feature: "Deployment path",
    lumicoria: "SaaS, private cloud, or on-prem contract",
    typical: "SaaS-first with limited isolation options",
    impact: "Room for regulated and high-control teams",
  },
];

const CAPABILITIES = [
  {
    icon: Fingerprint,
    meta: "Identity",
    title: "SSO, SCIM, and domain controls",
    body: "Connect Okta, Azure AD, or any SAML 2.0 provider. Provision seats, enforce domain rules, and remove access the moment a user leaves.",
    span: "lg:col-span-3",
  },
  {
    icon: ShieldCheck,
    meta: "Governance",
    title: "Agent autonomy that admins can actually govern",
    body: "Set each agent to suggest, propose, or execute by project. Permission boundaries follow the workspace instead of living in a prompt.",
    span: "lg:col-span-3",
  },
  {
    icon: Database,
    meta: "Knowledge",
    title: "Shared RAG with source-level citations",
    body: "Upload documents at org, team, or project scope and keep answers tied to the files your team is allowed to read.",
    span: "lg:col-span-2",
  },
  {
    icon: Workflow,
    meta: "Automation",
    title: "Rules that move work, not just text",
    body: "Trigger agents when contracts upload, tasks stall, tickets escalate, or project status changes.",
    span: "lg:col-span-2",
  },
  {
    icon: FileCheck,
    meta: "Audit",
    title: "Exportable logs for security review",
    body: "Stream agent runs, file access, billing activity, and admin changes to your SIEM.",
    span: "lg:col-span-2",
  },
  {
    icon: Network,
    meta: "Deployment",
    title: "Private cloud and on-prem options",
    body: "For regulated teams, Lumicoria Custom scopes isolated deployments, BYOK, and model routing under one contract.",
    span: "lg:col-span-3",
  },
  {
    icon: SlidersHorizontal,
    meta: "Controls",
    title: "Budgets by agent, team, and project",
    body: "Track spend as it happens, forecast usage, and keep high-autonomy agents inside approved operating limits.",
    span: "lg:col-span-3",
  },
];

const AGENT_REQUEST_CHIPS = [
  "Legal contract review",
  "Sales prospecting and outreach",
  "RFP response drafting",
  "Compliance audit prep",
  "Research synthesis",
  "Customer success enablement",
];

const FAQ = [
  {
    q: "How is Enterprise priced?",
    a: "Enterprise is priced per seat with monthly or annual billing. Annual billing saves 15 percent. A $1,500 monthly floor applies below 12 seats.",
  },
  {
    q: "Is customer data used to train models?",
    a: "No. Customer inputs, outputs, documents, and agent runs are not used to train Lumicoria or third-party models.",
  },
  {
    q: "Can we bring our own model keys?",
    a: "Yes. Enterprise contracts can route through your OpenAI, Anthropic, Google, Perplexity, Mistral, or self-hosted model credentials.",
  },
  {
    q: "How quickly can a pilot start?",
    a: "A pilot can start the same day. SSO, SCIM, and workspace rollout for a 250-seat tenant typically completes in under a week.",
  },
  {
    q: "Do you support DPA, BAA, and security review?",
    a: "Yes. DPA is available on request, BAA is available on Enterprise contracts, and SOC 2 Type II plus ISO 27001 work is in progress.",
  },
  {
    q: "Can agents be restricted by project?",
    a: "Yes. Project leads decide which platform or custom agents are available, what knowledge they can access, and what autonomy level they receive.",
  },
];

function ActionLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light" | "ghost";
  external?: boolean;
  className?: string;
}) {
  const variants = {
    primary:
      "bg-[#6C4AB0] text-white shadow-[0_18px_42px_rgba(50,36,99,0.28)] hover:bg-[#5b3d99] focus-visible:ring-[#9B87F5]",
    secondary:
      "border border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-[#6C4AB0]",
    light:
      "bg-white text-[#352563] shadow-[0_18px_42px_rgba(0,0,0,0.22)] hover:bg-slate-100 focus-visible:ring-white",
    ghost:
      "border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white",
  };
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    variants[variant],
    className,
  ].join(" ");

  const content = (
    <>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  body: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`text-sm font-semibold ${tone === "dark" ? "text-[#c9b6f4]" : "text-[#6C4AB0]"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-semibold leading-tight sm:text-4xl ${tone === "dark" ? "text-white" : "text-slate-950"}`}>
        {title}
      </h2>
      <p className={`mt-4 max-w-[65ch] text-base leading-7 sm:text-lg ${tone === "dark" ? "text-white/70" : "text-slate-600"}`}>
        {body}
      </p>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/[0.08] p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-5">
      <div className="font-mono text-3xl font-semibold tabular-nums sm:text-4xl">{value}</div>
      <div className="mt-2 text-sm leading-5 text-white/70">{label}</div>
    </div>
  );
}

function CapabilityCard({
  icon: Icon,
  meta,
  title,
  body,
  span,
}: {
  icon: React.ElementType;
  meta: string;
  title: string;
  body: string;
  span: string;
}) {
  return (
    <motion.article
      {...FADE_UP}
      className={`rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] ${span}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-lg bg-[#6C4AB0]/10 p-3 text-[#4e3588]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {meta}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-snug text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </motion.article>
  );
}

const Enterprise: React.FC = () => {
  const [seats, setSeats] = useState(50);
  const [comparePrice, setComparePrice] = useState(160);
  const [cadence, setCadence] = useState<"monthly" | "annual">("annual");
  const [requestText, setRequestText] = useState("");
  const [requestChip, setRequestChip] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content") ?? null;

    document.title = "Lumicoria Enterprise - Governed AI agents for teams";
    if (description) {
      description.setAttribute(
        "content",
        "Lumicoria Enterprise brings governed AI agents, SSO, SCIM, audit logs, RAG, automation, and private deployment paths to teams."
      );
    }

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) {
        description.setAttribute("content", previousDescription);
      }
    };
  }, []);

  const annualMultiplier = cadence === "annual" ? 1 - ANNUAL_DISCOUNT : 1;
  const lumicoriaMonthly = Math.max(ENTERPRISE_PER_SEAT * annualMultiplier * seats, ENTERPRISE_FLOOR);
  const lumicoriaAnnual = lumicoriaMonthly * 12;
  const competitorMonthly = comparePrice * seats;
  const competitorAnnual = competitorMonthly * 12;
  const annualDelta = competitorAnnual - lumicoriaAnnual;
  const annualSavings = Math.max(annualDelta, 0);
  const threeYearSavings = annualSavings * 3;

  const planSnapshot = useMemo(
    () => [
      { label: "Team", value: `$${TEAM_PER_SEAT}/seat`, detail: "Shared projects" },
      { label: "Business", value: `$${BUSINESS_PER_SEAT}/seat`, detail: "Advanced analytics" },
      { label: "Enterprise", value: `$${ENTERPRISE_PER_SEAT}/seat`, detail: "Full governance" },
    ],
    []
  );

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await fetch("/api/v1/org-billing/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "enterprise", cadence, seats, request: requestText }),
      });
    } catch {
      // Preview mode still shows the composed handoff state.
    }
    setRequestSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950 antialiased">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <section className="relative isolate overflow-hidden bg-[#0b1020] text-white">
        <img
          src="/images/dashboard_hero.png"
          alt="Lumicoria dashboard preview"
          className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,26,0.96),rgba(15,20,40,0.88),rgba(11,16,32,0.72))]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f7fb] to-transparent" />

        <header className="relative z-20 mx-auto flex max-w-[1320px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/images/lumicoria-logo-gradient.png"
              alt="Lumicoria"
              className="h-10 w-10 rounded-lg shadow-[0_12px_34px_rgba(108,74,176,0.38)]"
            />
            <span className="text-lg font-semibold text-white sm:text-xl">
              Lumicoria
            </span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 text-sm font-medium text-white/75 backdrop-blur-md md:flex">
            <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" to="/pricing">
              Pricing
            </Link>
            <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" to="/agents">
              Agents
            </Link>
            <a
              className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
              href="https://lumicoria.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Custom
            </a>
          </nav>
          <ActionLink href="#contact-sales" variant="light" className="px-4 py-2.5 sm:px-5">
            Sales
          </ActionLink>
        </header>

        <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 backdrop-blur-md">
              <BadgeCheck className="h-4 w-4 text-[#b9a7ff]" aria-hidden="true" />
              Enterprise from ${ENTERPRISE_PER_SEAT}/seat with governed rollout
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-7xl">
              Governed AI agents for enterprise teams.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              Run Lumicoria's platform agents and unlimited custom builds across every project, with identity,
              audit, data residency, and deployment controls ready for security review.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionLink href="mailto:enterprise@lumicoria.ai?subject=Lumicoria%20Enterprise%20inquiry" variant="light">
                Talk to sales
              </ActionLink>
              <ActionLink href="/signup" variant="ghost">
                Start a pilot
              </ActionLink>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard value="21" label="Platform agents included from day one" />
            <MetricCard value="1 hr" label="P1 response target on Enterprise" />
            <MetricCard value="3" label="US, EU, and India residency options" />
            <MetricCard value="24/7" label="Coverage for critical escalations" />
          </div>
        </div>
      </section>

      <main id="main" className="relative">
        <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <SectionHeader
              eyebrow="Procurement fit"
              title="Built for teams comparing AI suites, not just chat tools."
              body="The Enterprise page now leads with what buyers ask for: identity, governance, knowledge controls, auditability, and deployment flexibility."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {planSnapshot.map((plan) => (
                <div key={plan.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-500">{plan.label}</div>
                  <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
                    {plan.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{plan.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div {...FADE_UP} className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="overflow-x-auto">
              <table className="min-w-[880px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Buying criterion</th>
                    <th className="px-5 py-4 font-semibold">Lumicoria Enterprise</th>
                    <th className="px-5 py-4 font-semibold">Typical AI suite</th>
                    <th className="px-5 py-4 font-semibold">Operational impact</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-t border-slate-200">
                      <td className="px-5 py-4 font-semibold text-slate-950">{row.feature}</td>
                      <td className="px-5 py-4 text-[#4e3588]">{row.lumicoria}</td>
                      <td className="px-5 py-4 text-slate-600">{row.typical}</td>
                      <td className="px-5 py-4 text-slate-600">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <motion.div {...FADE_UP} className="grid gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold text-[#6C4AB0]">Cost modeler</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                Model your Enterprise contract before the first sales call.
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-7 text-slate-600">
                Compare Lumicoria against the current per-seat cost of the AI tools your team is evaluating.
                The slider keeps finance, security, and operations in the same conversation.
              </p>

              <div className="mt-8 space-y-6">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Seats</span>
                  <input
                    type="range"
                    min={12}
                    max={1000}
                    value={seats}
                    onChange={(event) => setSeats(parseInt(event.target.value, 10))}
                    className="mt-3 h-2 w-full accent-[#6C4AB0]"
                  />
                  <span className="mt-3 block font-mono text-3xl font-semibold tabular-nums text-slate-950">
                    {seats.toLocaleString()} seats
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Current AI suite per-seat / month</span>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-500">$</span>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={comparePrice}
                      onChange={(event) => setComparePrice(parseFloat(event.target.value) || 0)}
                      className="w-32 rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-base tabular-nums text-slate-950 outline-none transition focus:border-[#6C4AB0] focus:ring-2 focus:ring-[#6C4AB0]/20"
                    />
                  </div>
                </label>

                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                  {(["monthly", "annual"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCadence(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                        cadence === option
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {option === "annual" ? "Annual - 15%" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 text-white sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                  <div className="text-sm font-semibold text-white/60">Lumicoria</div>
                  <div className="mt-3 font-mono text-3xl font-semibold tabular-nums">
                    ${Math.round(lumicoriaMonthly).toLocaleString()}/mo
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    ${Math.round(lumicoriaAnnual).toLocaleString()}/yr
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                  <div className="text-sm font-semibold text-white/60">Current suite</div>
                  <div className="mt-3 font-mono text-3xl font-semibold tabular-nums">
                    ${Math.round(competitorMonthly).toLocaleString()}/mo
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    ${Math.round(competitorAnnual).toLocaleString()}/yr
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-white p-6 text-slate-950">
                <div className="text-sm font-semibold text-slate-500">
                  Estimated annual savings
                </div>
                <div className="mt-3 font-mono text-5xl font-semibold tabular-nums text-[#352563]">
                  ${Math.round(annualSavings).toLocaleString()}
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-600">
                  ${Math.round(threeYearSavings).toLocaleString()} over 3 years. If the model shows no savings,
                  use it as a transparent budget comparison instead of a forced claim.
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/70">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#c9b6f4]" aria-hidden="true" />
                Enterprise floor: ${ENTERPRISE_FLOOR.toLocaleString()}/mo applies under 12 seats. Annual contracts can include BYOK, DPA, BAA, and private deployment scope.
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <SectionHeader
            eyebrow="Platform controls"
            title="The premium part is not the gloss. It is the operating model."
            body="Enterprise teams need a page that feels calm under scrutiny. These modules surface the controls admins, security reviewers, and department leads expect before rollout."
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {CAPABILITIES.map((capability) => (
              <CapabilityCard key={capability.title} {...capability} />
            ))}
          </div>
        </section>

        <section id="request-agents" className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <motion.div {...FADE_UP} className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold text-[#6C4AB0]">Custom agent request</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                Describe the workflow. We turn it into a governed agent.
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-7 text-slate-600">
                Custom agents live inside your tenant, inherit project permissions, and can be scoped to the
                model, documents, approval flow, and autonomy level your team approves.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {AGENT_REQUEST_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setRequestChip(chip);
                      setRequestText(chip);
                      setRequestSubmitted(false);
                    }}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                      requestChip === chip
                        ? "border-[#6C4AB0] bg-[#6C4AB0]/10 text-[#352563]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submitRequest} className="p-6 sm:p-8">
              {requestSubmitted ? (
                <div className="rounded-lg border border-[#6C4AB0]/20 bg-[#6C4AB0]/10 p-6">
                  <div className="flex items-center gap-3 text-lg font-semibold text-[#352563]">
                    <Check className="h-5 w-5" aria-hidden="true" />
                    Request captured
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    The Enterprise team will respond within one business day with rollout fit, build scope,
                    and a pilot path.
                  </p>
                </div>
              ) : (
                <>
                  <label htmlFor="agent-request" className="text-sm font-semibold text-slate-700">
                    Workflow brief
                  </label>
                  <textarea
                    id="agent-request"
                    value={requestText}
                    onChange={(event) => {
                      setRequestText(event.target.value);
                      setRequestSubmitted(false);
                    }}
                    placeholder="Review every inbound MSA against our playbook and surface clause-level deltas for legal approval."
                    rows={7}
                    className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#6C4AB0] focus:ring-2 focus:ring-[#6C4AB0]/20"
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={!requestText.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6C4AB0] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(50,36,99,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5b3d99] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      Send to sales
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <ActionLink href="https://lumicoria.com" variant="secondary" external>
                      Fully custom deployment
                    </ActionLink>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        </section>

        <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="Trust and security"
              title="Designed for the security team's threat model."
              body="Customer data is not used to train models. Every meaningful action lands in an audit trail, and Enterprise contracts can include regional residency, BAA, DPA, and private deployment terms."
              tone="dark"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["SAML SSO", "SAML 2.0 with IdP-led controls"],
                ["SCIM", "Automated provisioning and offboarding"],
                ["Audit export", "SIEM-ready security event stream"],
                ["Data residency", "US, EU, and India hosting options"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                  <Lock className="h-5 w-5 text-[#c9b6f4]" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeader
              eyebrow="Straight answers"
              title="What procurement usually asks next."
              body="The FAQ is intentionally direct. No inflated claims, no feature fog, just the questions that decide whether a pilot can move forward."
            />
            <motion.div {...FADE_UP} className="rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              {FAQ.map((item, index) => (
                <details key={item.q} className="group border-b border-slate-200 last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-base font-semibold text-slate-950 transition hover:bg-slate-50">
                    {item.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{item.a}</p>
                </details>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="contact-sales" className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <motion.div {...FADE_UP} className="relative overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-10 lg:p-12">
            <img
              src="/images/dashboard_hero.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-[0.12] grayscale lg:block"
            />
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white/75">
                <Building2 className="h-4 w-4 text-[#c9b6f4]" aria-hidden="true" />
                Enterprise rollout
              </div>
              <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                Put governed agents into one department this week.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Start with a pilot, prove the workflows, then expand across teams with SSO, SCIM,
                audit exports, and a dedicated rollout plan.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ActionLink href="mailto:enterprise@lumicoria.ai?subject=Lumicoria%20Enterprise%20inquiry" variant="light">
                  Talk to sales
                </ActionLink>
                <ActionLink href="/signup" variant="ghost">
                  Start free pilot
                </ActionLink>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Lumicoria AI. Enterprise contracts via lumicoria.com.</div>
          <div className="flex flex-wrap gap-4">
            <Link className="transition hover:text-slate-950" to="/privacy">Privacy</Link>
            <Link className="transition hover:text-slate-950" to="/terms">Terms</Link>
            <Link className="transition hover:text-slate-950" to="/security">Security</Link>
            <Link className="transition hover:text-slate-950" to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Enterprise;
