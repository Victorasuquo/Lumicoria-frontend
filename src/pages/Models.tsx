import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Cpu,
  DatabaseZap,
  FileSearch,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  Lock,
  Network,
  RadioTower,
  Route,
  ShieldCheck,
  Sparkles,
  Split,
  Workflow,
} from "lucide-react";

type Plan = "Free" | "Starter" | "Professional" | "Enterprise";
type Provider = "Google" | "OpenAI" | "Anthropic" | "Perplexity" | "Mistral";
type Workload = "Fast" | "Reasoning" | "Documents" | "Research" | "Cost";

type ModelPath = {
  name: string;
  provider: Provider;
  workload: Workload;
  plan: Plan;
  role: string;
  routeWhen: string;
  proof: string;
  context: string;
  latency: string;
  icon: React.ElementType;
};

type Filter = "All" | Workload;

const FILTERS: Filter[] = ["All", "Fast", "Reasoning", "Documents", "Research", "Cost"];

const MODEL_PATHS: ModelPath[] = [
  {
    name: "Gemini 2.5 Flash",
    provider: "Google",
    workload: "Fast",
    plan: "Free",
    role: "High-volume default",
    routeWhen: "Classify, summarize, extract, and answer routine workspace requests.",
    proof: "Clean output at high throughput, useful when agents need many short runs.",
    context: "Long",
    latency: "Fast",
    icon: Gauge,
  },
  {
    name: "Gemini 2.5 Pro",
    provider: "Google",
    workload: "Documents",
    plan: "Starter",
    role: "Structured document reasoning",
    routeWhen: "Read contracts, reports, research packs, and multimodal evidence.",
    proof: "Strong fit when the task needs long context and ordered analysis.",
    context: "Very long",
    latency: "Balanced",
    icon: DatabaseZap,
  },
  {
    name: "GPT-4o",
    provider: "OpenAI",
    workload: "Reasoning",
    plan: "Starter",
    role: "Agent planning",
    routeWhen: "Plan tool use, write polished drafts, inspect code, and coordinate steps.",
    proof: "Versatile path for agents that move between language, tools, and code.",
    context: "Long",
    latency: "Balanced",
    icon: Brain,
  },
  {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    workload: "Fast",
    plan: "Starter",
    role: "Structured output",
    routeWhen: "Label intent, extract entities, produce JSON, and make routing calls.",
    proof: "Small enough for fast queues, precise enough for controlled output.",
    context: "Medium",
    latency: "Fast",
    icon: Cpu,
  },
  {
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    workload: "Documents",
    plan: "Professional",
    role: "Careful review",
    routeWhen: "Handle sensitive reading, legal-style analysis, policy checks, and synthesis.",
    proof: "A deliberate path for writing quality, nuance, and long-form review.",
    context: "Very long",
    latency: "Deliberate",
    icon: FileSearch,
  },
  {
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    workload: "Cost",
    plan: "Professional",
    role: "Light language work",
    routeWhen: "Draft support replies, refine tone, compress notes, and review short text.",
    proof: "Useful when the agent needs Claude behavior without Sonnet cost.",
    context: "Medium",
    latency: "Fast",
    icon: Sparkles,
  },
  {
    name: "Perplexity Sonar",
    provider: "Perplexity",
    workload: "Research",
    plan: "Professional",
    role: "Current research",
    routeWhen: "Check live facts, scan markets, gather sources, and return cited context.",
    proof: "Routes research work to web-backed answers instead of stale memory.",
    context: "Web-backed",
    latency: "Search-led",
    icon: Globe2,
  },
  {
    name: "Mistral Large",
    provider: "Mistral",
    workload: "Reasoning",
    plan: "Enterprise",
    role: "Provider diversity",
    routeWhen: "Run multilingual analysis and regional workflows under workspace policy.",
    proof: "Gives larger teams another approved path for governed reasoning.",
    context: "Long",
    latency: "Balanced",
    icon: Layers3,
  },
  {
    name: "Mistral Small",
    provider: "Mistral",
    workload: "Cost",
    plan: "Enterprise",
    role: "Cost control",
    routeWhen: "Process bulk tags, summaries, queue updates, and internal automations.",
    proof: "Keeps routine runs economical without moving the work outside policy.",
    context: "Medium",
    latency: "Fast",
    icon: CircleDollarSign,
  },
];

const PROVIDERS: Record<Provider, { label: string; logo: string; line: string; accent: string }> = {
  Google: {
    label: "Google Gemini",
    logo: "/images/integrations/gemini.png",
    line: "Document depth and multimodal work",
    accent: "bg-[#E2F0FF] text-[#25365C]",
  },
  OpenAI: {
    label: "OpenAI",
    logo: "/images/integrations/openai.jpg",
    line: "Planning, writing, code, and tools",
    accent: "bg-[#E8F7F0] text-[#14553D]",
  },
  Anthropic: {
    label: "Anthropic Claude",
    logo: "/images/integrations/anthropic.svg",
    line: "Careful long-context review",
    accent: "bg-[#FFF0E8] text-[#6F3217]",
  },
  Perplexity: {
    label: "Perplexity Sonar",
    logo: "/images/integrations/perplexity.png",
    line: "Live research with sources",
    accent: "bg-[#E8F5FF] text-[#164A6E]",
  },
  Mistral: {
    label: "Mistral",
    logo: "/images/integrations/mistral.png",
    line: "Model diversity for teams",
    accent: "bg-[#F1ECFF] text-[#3B2D6A]",
  },
};

const PLAN_ORDER: Plan[] = ["Free", "Starter", "Professional", "Enterprise"];

const PLAN_ACCESS: Array<{
  plan: Plan;
  modelAccess: string;
  policy: string;
  ownership: string;
}> = [
  {
    plan: "Free",
    modelAccess: "Default route",
    policy: "Core routing",
    ownership: "Lumicoria managed",
  },
  {
    plan: "Starter",
    modelAccess: "4 model paths",
    policy: "Faster fallbacks",
    ownership: "Lumicoria managed",
  },
  {
    plan: "Professional",
    modelAccess: "6 model paths",
    policy: "Research routing",
    ownership: "Lumicoria managed",
  },
  {
    plan: "Enterprise",
    modelAccess: "All paths and BYOK",
    policy: "Workspace policy",
    ownership: "Customer provider keys",
  },
];

const ROUTING_SIGNALS = [
  {
    icon: Split,
    title: "Intent",
    body: "The router identifies whether the request is chat, extraction, planning, review, code, or research.",
  },
  {
    icon: FileSearch,
    title: "Evidence",
    body: "Tasks that need citations, uploaded files, or long context move toward models built for that load.",
  },
  {
    icon: ShieldCheck,
    title: "Policy",
    body: "Plan access, workspace permissions, cost limits, and provider approvals are applied before the run leaves the queue.",
  },
  {
    icon: Network,
    title: "Fallback",
    body: "If a provider is unavailable or out of policy, Lumicoria sends the work through the next approved path.",
  },
];

const CONTROL_POINTS = [
  {
    icon: KeyRound,
    title: "Bring provider keys",
    body: "Use approved OpenAI, Anthropic, Google, Perplexity, Mistral, or private model credentials.",
  },
  {
    icon: Lock,
    title: "Keep workspace policy",
    body: "Route by team, plan, project, and data boundary without asking users to pick a provider.",
  },
  {
    icon: Clock3,
    title: "Review usage",
    body: "Track provider, model path, run count, and fallback behavior from one operational view.",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ProviderMark({ provider }: { provider: Provider }) {
  const meta = PROVIDERS[provider];

  return (
    <span className={cx("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold", meta.accent)}>
      <img src={meta.logo} alt="" className="h-4 w-4 rounded-full bg-white object-cover" />
      {meta.label}
    </span>
  );
}

function PlanChip({ plan }: { plan: Plan }) {
  const isEnterprise = plan === "Enterprise";

  return (
    <span
      className={cx(
        "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold",
        isEnterprise ? "bg-[#211745] text-white" : "bg-[#F1ECFF] text-[#3B2D6A]"
      )}
    >
      {plan}
    </span>
  );
}

function SectionIntro({
  label,
  title,
  body,
  className,
}: {
  label?: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cx("max-w-3xl", className)}>
      {label ? <p className="font-hero text-sm font-semibold text-[#6C4AB0]">{label}</p> : null}
      <h2 className="mt-3 max-w-[13ch] font-hero text-[clamp(2.25rem,4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#24202F]">
        {title}
      </h2>
      <p className="mt-5 max-w-[68ch] text-base leading-8 text-[#4D465E] sm:text-lg">{body}</p>
    </div>
  );
}

function RouterSurface() {
  const route = [
    ["Incoming work", "Read a contract and extract deadline risk"],
    ["Signals", "Documents, long context, low sensitivity"],
    ["Selected path", "Gemini 2.5 Pro"],
    ["Fallback", "Claude Sonnet 4, if policy requires review"],
  ];

  return (
    <div className="relative">
      <div className="absolute -left-6 top-8 h-40 w-40 rounded-full bg-[#FEE274]/45 blur-3xl" />
      <div className="absolute -right-6 bottom-10 h-48 w-48 rounded-full bg-[#BFBFFF]/55 blur-3xl" />

      <div className="relative rounded-3xl bg-[#211745] p-3 text-white">
        <div className="rounded-2xl border border-white/12 bg-[#100A2A]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEE274]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#BFBFFF]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#E2F0FF]" />
            </div>
            <p className="font-mono text-xs font-semibold text-white/55">router.trace</p>
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-[#100A2A] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/64">Live route sample</p>
                  <h3 className="mt-2 font-hero text-2xl font-semibold tracking-[-0.025em] text-white">
                    Contract review enters the queue.
                  </h3>
                </div>
                <Route className="h-8 w-8 text-[#FEE274]" aria-hidden="true" />
              </div>

              <div className="mt-7 space-y-3">
                {route.map(([label, value], index) => (
                  <div key={label} className="grid grid-cols-[7rem_1fr] items-start gap-4 border-t border-white/10 pt-3">
                    <p className="text-xs font-semibold text-white/42">{label}</p>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#FEE274]" />
                      <p className={cx("text-sm leading-6", index === 2 ? "font-semibold text-[#FEE274]" : "text-white/78")}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0B071E] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/64">Approved provider pool</p>
                  <p className="mt-1 text-sm text-white/42">5 paths available in this workspace</p>
                </div>
                <RadioTower className="h-6 w-6 text-[#BFBFFF]" aria-hidden="true" />
              </div>

              <div className="mt-6 space-y-2.5">
                {Object.entries(PROVIDERS).map(([provider, meta], index) => (
                  <div
                    key={provider}
                    className={cx(
                      "flex items-center justify-between rounded-2xl px-3 py-3",
                      index === 0 ? "bg-[#FEE274] text-[#211745]" : "bg-white/[0.06] text-white"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={meta.logo} alt="" className="h-7 w-7 rounded-lg bg-white object-cover p-0.5" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{meta.label}</p>
                        <p className={cx("truncate text-xs", index === 0 ? "text-[#211745]/65" : "text-white/45")}>{meta.line}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs opacity-55">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            {[
              ["Run policy", "Starter"],
              ["Latency path", "Fast"],
              ["Fallback", "Ready"],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#100A2A] px-5 py-4">
                <p className="text-xs font-semibold text-white/42">{label}</p>
                <p className="mt-1 font-mono text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalRail() {
  return (
    <div className="rounded-3xl border border-[#DEDCE9] bg-white">
      {ROUTING_SIGNALS.map((signal, index) => {
        const Icon = signal.icon;

        return (
          <div
            key={signal.title}
            className={cx(
              "grid gap-5 p-5 sm:grid-cols-[8rem_1fr] sm:p-6",
              index !== ROUTING_SIGNALS.length - 1 && "border-b border-[#ECEAF3]"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1ECFF] text-sm font-semibold text-[#3B2D6A]">
                {index + 1}
              </span>
              <Icon className="h-5 w-5 text-[#6C4AB0]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-hero text-xl font-semibold tracking-[-0.02em] text-[#24202F]">{signal.title}</h3>
              <p className="mt-2 max-w-[68ch] text-sm leading-7 text-[#5B5369] sm:text-base">{signal.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModelRow({ model }: { model: ModelPath }) {
  const Icon = model.icon;

  return (
    <article className="group grid gap-5 border-t border-[#E7E4EF] py-6 transition motion-reduce:transition-none lg:grid-cols-[1.1fr_1.45fr_0.75fr] lg:items-center">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#211745] text-white transition group-hover:bg-[#6C4AB0] motion-reduce:transition-none">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-hero text-2xl font-semibold leading-tight tracking-[-0.025em] text-[#24202F]">{model.name}</h3>
            <PlanChip plan={model.plan} />
          </div>
          <div className="mt-3">
            <ProviderMark provider={model.provider} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#6C4AB0]">{model.role}</p>
        <p className="mt-2 max-w-[74ch] text-base leading-7 text-[#4D465E]">{model.routeWhen}</p>
        <p className="mt-2 max-w-[74ch] text-sm leading-6 text-[#6A6278]">{model.proof}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-[#F5F3FA] p-4 sm:grid-cols-3 lg:grid-cols-1">
        {[
          ["Workload", model.workload],
          ["Context", model.context],
          ["Latency", model.latency],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold text-[#6A6278]">{label}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-[#24202F]">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function AccessMatrix() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#DEDCE9] bg-white">
      <div className="grid bg-[#F5F3FA] text-sm font-semibold text-[#5B5369] md:grid-cols-[0.9fr_repeat(4,1fr)]">
        <div className="hidden px-5 py-4 md:block">Access</div>
        {PLAN_ORDER.map((plan) => (
          <div key={plan} className="border-t border-[#DEDCE9] px-5 py-4 md:border-l md:border-t-0">
            {plan}
          </div>
        ))}
      </div>

      {[
        ["Model paths", "modelAccess"],
        ["Routing policy", "policy"],
        ["Provider ownership", "ownership"],
      ].map(([label, key]) => (
        <div key={label} className="grid border-t border-[#ECEAF3] md:grid-cols-[0.9fr_repeat(4,1fr)]">
          <div className="bg-[#FBFAFD] px-5 py-4 text-sm font-semibold text-[#24202F]">{label}</div>
          {PLAN_ACCESS.map((tier) => (
            <div key={`${tier.plan}-${label}`} className="border-t border-[#ECEAF3] px-5 py-4 text-sm leading-6 text-[#5B5369] md:border-l md:border-t-0">
              {tier[key as keyof typeof tier]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ControlPlane() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="overflow-hidden rounded-3xl bg-[#211745] text-white">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
              <KeyRound className="h-4 w-4 text-[#FEE274]" aria-hidden="true" />
              Enterprise model control
            </div>
            <h2 className="mt-6 max-w-[12ch] font-hero text-[clamp(2.25rem,4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              Keep the provider contract. Use the router.
            </h2>
            <p className="mt-6 max-w-[66ch] text-base leading-8 text-white/70 sm:text-lg">
              Enterprise teams can route through their approved provider keys while Lumicoria keeps plan policy,
              fallback paths, and usage records in one operational layer.
            </p>
            <Link
              to="/enterprise"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#211745] transition hover:bg-[#F7F8FF] active:scale-[0.98] motion-reduce:transition-none"
            >
              See Enterprise controls
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="border-t border-white/10 bg-[#130D32] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="space-y-4">
              {CONTROL_POINTS.map((point) => {
                const Icon = point.icon;

                return (
                  <div key={point.title} className="grid gap-4 rounded-2xl bg-white/[0.06] p-5 sm:grid-cols-[2.75rem_1fr]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#211745]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-hero text-xl font-semibold tracking-[-0.02em] text-white">{point.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/62">{point.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-[#FEE274] p-5 text-[#211745]">
              <p className="text-sm font-semibold">Fallback remains visible.</p>
              <p className="mt-2 text-sm leading-6 text-[#211745]/72">
                When a route changes, teams can see why: provider availability, plan access, workspace policy, or cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Models: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");

    document.title = "Lumicoria Models, governed model routing";
    description?.setAttribute(
      "content",
      "Explore Lumicoria model routing across Gemini, OpenAI, Claude, Perplexity, and Mistral, with plan policy, fallback paths, and Enterprise BYOK."
    );

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) {
        description.setAttribute("content", previousDescription);
      }
    };
  }, []);

  const filteredModels = useMemo(() => {
    if (activeFilter === "All") return MODEL_PATHS;
    return MODEL_PATHS.filter((model) => model.workload === activeFilter);
  }, [activeFilter]);

  const providerCount = new Set(MODEL_PATHS.map((model) => model.provider)).size;

  return (
    <div className="min-h-screen bg-[oklch(0.99_0.003_270)] text-[#24202F] antialiased">
      <a
        href="#models-main"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#24202F] focus:not-sr-only focus:fixed focus:left-4 focus:top-20"
      >
        Skip to models
      </a>

      <main id="models-main">
        <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24">
          <div className="absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[#BFBFFF]/35 blur-3xl" />
          <div className="absolute right-0 top-40 h-56 w-56 rounded-full bg-[#FEE274]/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F1ECFF] px-3 py-2 text-sm font-semibold text-[#3B2D6A]">
                <Route className="h-4 w-4" aria-hidden="true" />
                Model routing layer
              </div>
              <h1 className="mt-7 max-w-[11ch] font-hero text-[clamp(3rem,7vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[#211745]">
                Models chosen by the work.
              </h1>
              <p className="mt-7 max-w-[64ch] text-lg leading-8 text-[#4D465E] sm:text-xl">
                Lumicoria reads the task, applies workspace policy, then sends the run to the model path that fits the
                evidence, cost, speed, and governance needs.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#211745] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#372673] active:scale-[0.98] motion-reduce:transition-none"
                >
                  Run a routed chat
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8D3E6] bg-white px-5 py-3 text-sm font-semibold text-[#3B2D6A] transition hover:border-[#BFBFFF] active:scale-[0.98] motion-reduce:transition-none"
                >
                  Compare pricing plans
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {[
                  `${MODEL_PATHS.length} model paths`,
                  `${providerCount} providers`,
                  "Plan-aware policy",
                  "Enterprise BYOK",
                ].map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#5B5369] ring-1 ring-[#E3DFEE]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <RouterSurface />
          </div>
        </section>

        <section className="mx-auto grid max-w-[1360px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-24">
          <SectionIntro
            title="A route is a decision record."
            body="The router is designed for teams that need repeatable decisions. Users do not memorize model behavior. Agents receive the right path after Lumicoria checks intent, evidence, policy, and fallback rules."
          />
          <SignalRail />
        </section>

        <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <SectionIntro
              label="Model atlas"
              title="Compare paths by workload."
              body="Provider names stay visible, but the first read is operational. Choose a workload to see which paths Lumicoria can use for that class of work."
            />

            <div className="flex max-w-full overflow-x-auto rounded-full bg-[#F1ECFF] p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cx(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transition-none",
                    activeFilter === filter ? "bg-[#211745] text-white" : "text-[#5B5369] hover:text-[#211745]"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#DEDCE9] bg-white px-5 sm:px-6">
            {filteredModels.map((model) => (
              <ModelRow key={model.name} model={model} />
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1360px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-24">
          <SectionIntro
            title="Access follows autonomy."
            body="Plans unlock model paths by how much context, research, and governance a team needs. Enterprise adds provider ownership without removing Lumicoria policy."
          />
          <AccessMatrix />
        </section>

        <ControlPlane />

        <section className="mx-auto max-w-[1360px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="grid gap-8 rounded-3xl border border-[#DEDCE9] bg-white p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <h2 className="max-w-[16ch] font-hero text-[clamp(2.25rem,4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#211745]">
                Give every agent a path it can defend.
              </h2>
              <p className="mt-5 max-w-[68ch] text-base leading-8 text-[#4D465E] sm:text-lg">
                Start free, test routing in chat, then upgrade when work needs longer context, live research, or provider
                ownership.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#211745] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#372673] active:scale-[0.98] motion-reduce:transition-none"
              >
                Start free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/docs/available-models"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8D3E6] bg-white px-5 py-3 text-sm font-semibold text-[#3B2D6A] transition hover:border-[#BFBFFF] active:scale-[0.98] motion-reduce:transition-none"
              >
                Read model docs
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Models;
