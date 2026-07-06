import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  QrCode,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Store,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { SEO } from "@/components/SEO";

type PlanId = "solo" | "studio" | "company";
type PaymentMethodId = "wallet" | "qr" | "ussd" | "agent";
type PaymentStatus = "INITIAL" | "PENDING" | "SUCCESS" | "FAILED";

type DemoPlan = {
  id: PlanId;
  name: string;
  audience: string;
  price: number;
  credits: string;
  highlight: string;
  items: string[];
};

type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const plans: DemoPlan[] = [
  {
    id: "solo",
    name: "Freelancer",
    audience: "For one builder",
    price: 7500,
    credits: "80 AI credits",
    highlight: "Best for proposals, invoices, research, and client follow-up.",
    items: ["AI workspace", "Document agent", "Client-ready exports"],
  },
  {
    id: "studio",
    name: "Startup Studio",
    audience: "For small teams",
    price: 18500,
    credits: "260 AI credits",
    highlight: "The demo default for Nigerian startups and SME operators.",
    items: ["Shared agents", "Invoice matching", "Priority workflows"],
  },
  {
    id: "company",
    name: "Business Ops",
    audience: "For growing orgs",
    price: 45000,
    credits: "820 AI credits",
    highlight: "For teams that want AI agents tied to approvals and billing.",
    items: ["Team governance", "Settlement review", "Admin analytics"],
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "wallet",
    name: "OPay Wallet",
    label: "Wallet debit",
    description: "Customer confirms inside the OPay app.",
    icon: Wallet,
  },
  {
    id: "qr",
    name: "Wallet QR",
    label: "Scan to pay",
    description: "A QR prompt mirrors OPay wallet QR payment.",
    icon: QrCode,
  },
  {
    id: "ussd",
    name: "USSD",
    label: "Bank USSD",
    description: "A short code option for customers without data.",
    icon: Smartphone,
  },
  {
    id: "agent",
    name: "Agent Cash",
    label: "Retail agent",
    description: "A reference code can be paid at an OPay agent.",
    icon: Store,
  },
];

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const formatNaira = (amount: number) => nairaFormatter.format(amount);

const buildReference = (planId: PlanId) => `LUM-OPAY-${planId.toUpperCase()}-2847`;

const researchNotes = [
  "OPay positions itself around secure, easy, and affordable financial services for everyday payments.",
  "OPay Checkout supports online payments, invoicing, subscriptions, payment links, payouts, and POS acceptance.",
  "OPay Cashier can redirect customers to a hosted checkout URL and return payment status to the merchant.",
  "Server APIs list NGN payment methods including OPay Wallet QR and Bank USSD, useful for Nigeria-first adoption.",
  "Callbacks and payment-status checks make the Lumicoria reconciliation story credible for invoices and settlements.",
];

const reconciliationFeed = [
  "Invoice created for Startup Studio",
  "OPay reference attached to subscription",
  "Customer payment status moves to SUCCESS",
  "Lumicoria credits unlocked instantly",
  "Settlement marked for finance review",
];

const qrCells = [
  1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0,
  1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1,
  0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1,
  1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0,
  0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1,
  1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0,
  1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0,
  0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1,
  1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1,
  0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0,
  1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1,
];

const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const statusMap = {
    INITIAL: "Ready",
    PENDING: "Processing",
    SUCCESS: "Paid",
    FAILED: "Declined",
  };

  const toneMap = {
    INITIAL: "border-[#02aa63]/20 bg-[#e9fff5] text-[#006d43] dark:border-[#42e5a1]/30 dark:bg-[#052c21] dark:text-[#b9ffdf]",
    PENDING: "border-[#02aa63]/30 bg-white text-[#006d43] dark:border-[#42e5a1]/30 dark:bg-[#08251e] dark:text-[#b9ffdf]",
    SUCCESS: "border-[#02aa63]/30 bg-[#02aa63] text-white dark:border-[#42e5a1]/30 dark:bg-[#00c875] dark:text-[#022c1b]",
    FAILED: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[status]}`}>
      {statusMap[status]}
    </span>
  );
};

const MethodIcon = ({ method }: { method: PaymentMethod }) => {
  const Icon = method.icon;
  return <Icon className="h-5 w-5" strokeWidth={1.8} />;
};

const OpayPaymentDemo = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("studio");
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId>("wallet");
  const [status, setStatus] = useState<PaymentStatus>("INITIAL");
  const timerRef = useRef<number | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[1],
    [selectedPlanId],
  );

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.id === selectedMethodId) ?? paymentMethods[0],
    [selectedMethodId],
  );

  const reference = buildReference(selectedPlan.id);
  const vat = Math.round(selectedPlan.price * 0.075);
  const total = selectedPlan.price + vat;

  useEffect(() => {
    if (status !== "PENDING") return undefined;

    timerRef.current = window.setTimeout(() => {
      setStatus("SUCCESS");
    }, 1400);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [status]);

  const beginSimulation = () => {
    setStatus("PENDING");
  };

  const resetSimulation = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setStatus("INITIAL");
  };

  const showDeclinedState = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setStatus("FAILED");
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f6fff9] text-[#06251a] selection:bg-[#02aa63] selection:text-white dark:bg-[#06130f] dark:text-[#eafff4]">
      <SEO
        title="OPay Payment Demo"
        description="A simulated Lumicoria subscription checkout showing how OPay wallet, QR, USSD, and agent payment paths can work in Naira."
        canonical="/opay-payment"
        keywords={["OPay payment demo", "Lumicoria OPay", "Naira subscription", "OPay checkout", "Nigeria AI subscription"]}
        noindex
      />

      <header className="sticky top-0 z-30 border-b border-[#02aa63]/15 bg-[#f6fff9]/88 backdrop-blur-xl dark:border-[#42e5a1]/15 dark:bg-[#06130f]/86">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Lumicoria OPay payment demo">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#02aa63] text-sm font-black text-white shadow-[0_14px_34px_rgba(2,170,99,0.24)]">
              O
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black tracking-tight">OPay Payment</span>
              <span className="block text-[11px] font-semibold text-[#497766] dark:text-[#9bd8bf]">Lumicoria demo</span>
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[#375b4d] dark:text-[#b5e8d4] md:flex">
            <a className="transition hover:text-[#02aa63]" href="#flow">Flow</a>
            <a className="transition hover:text-[#02aa63]" href="#checkout">Checkout</a>
            <a className="transition hover:text-[#02aa63]" href="#research">Research</a>
          </div>
          <a
            href="#checkout"
            className="rounded-full bg-[#06251a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(6,37,26,0.16)] transition hover:-translate-y-0.5 hover:bg-[#02aa63] active:translate-y-px dark:bg-[#02aa63] dark:text-[#06251a] dark:hover:bg-[#42e5a1]"
          >
            Open Checkout
          </a>
        </nav>
      </header>

      <section id="top" className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_20%_10%,rgba(2,170,99,0.20),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(66,229,161,0.18),transparent_28%)]" />

        <div className="flex flex-col justify-center">
          <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#02aa63]/20 bg-white/75 px-3 py-1.5 text-xs font-bold text-[#006d43] shadow-sm dark:border-[#42e5a1]/20 dark:bg-white/5 dark:text-[#b9ffdf]">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            Demo mode only
          </div>
          <h1 className="max-w-[11ch] text-5xl font-black tracking-[-0.065em] text-[#052217] sm:text-6xl lg:text-7xl dark:text-white">
            AI plans paid locally.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#365b4d] dark:text-[#b9dccc]">
            A Nigeria-first checkout story for Lumicoria subscriptions using OPay-style wallet, QR, USSD, and agent payment paths.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#checkout"
              className="inline-flex items-center justify-center rounded-full bg-[#02aa63] px-6 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(2,170,99,0.26)] transition hover:-translate-y-0.5 hover:bg-[#028f55] active:translate-y-px dark:text-[#06251a] dark:hover:bg-[#42e5a1]"
            >
              Run Demo
            </a>
            <a
              href="#flow"
              className="inline-flex items-center justify-center rounded-full border border-[#02aa63]/25 bg-white px-6 py-3 text-sm font-black text-[#063d2a] transition hover:-translate-y-0.5 hover:border-[#02aa63]/50 hover:bg-[#effff7] active:translate-y-px dark:border-[#42e5a1]/25 dark:bg-white/5 dark:text-[#dffff0] dark:hover:bg-white/10"
            >
              See Flow
            </a>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["NGN", "Naira pricing"],
              ["QR", "Wallet scan"],
              ["USSD", "Offline-ready"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-3xl border border-[#02aa63]/12 bg-white/72 p-4 shadow-sm dark:border-[#42e5a1]/12 dark:bg-white/5">
                <p className="text-xl font-black text-[#02aa63] dark:text-[#42e5a1]">{value}</p>
                <p className="mt-1 text-xs font-semibold text-[#557466] dark:text-[#a6cdbd]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center lg:justify-end">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[#02aa63]/16 bg-white p-3 shadow-[0_30px_100px_rgba(6,37,26,0.13)] dark:border-[#42e5a1]/14 dark:bg-[#0a1c15]">
            <div className="rounded-[1.55rem] bg-[#f3fff8] p-4 dark:bg-[#071610]">
              <div className="rounded-[1.35rem] border border-[#02aa63]/14 bg-white p-5 dark:border-[#42e5a1]/14 dark:bg-[#0c2118]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#052217] dark:text-white">Lumicoria Startup Studio</p>
                    <p className="mt-1 text-sm text-[#557466] dark:text-[#a6cdbd]">Monthly subscription checkout</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_0.92fr]">
                  <div className="rounded-3xl bg-[#06251a] p-5 text-white shadow-[0_24px_70px_rgba(6,37,26,0.24)]">
                    <p className="text-sm font-semibold text-[#9ff2cb]">Amount due</p>
                    <p className="mt-2 text-4xl font-black tracking-[-0.045em]">{formatNaira(total)}</p>
                    <p className="mt-2 text-sm text-[#c9f5df]">Plan, VAT, and credits bundled for demo.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-[11px] font-semibold text-[#a7eeca]">Reference</p>
                        <p className="mt-1 break-all text-xs font-black">{reference}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-[11px] font-semibold text-[#a7eeca]">Method</p>
                        <p className="mt-1 text-xs font-black">{selectedMethod.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#02aa63]/12 bg-[#f8fffb] p-5 dark:border-[#42e5a1]/14 dark:bg-white/5">
                    <div className="mx-auto grid h-36 w-36 grid-cols-12 gap-1 rounded-2xl bg-white p-3 shadow-inner dark:bg-[#dffff0]">
                      {qrCells.map((cell, index) => (
                        <span
                          key={`${cell}-${index}`}
                          className={cell ? "rounded-[3px] bg-[#06251a]" : "rounded-[3px] bg-transparent"}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-center text-sm font-black text-[#052217] dark:text-white">Scan with OPay</p>
                    <p className="mt-1 text-center text-xs font-semibold text-[#557466] dark:text-[#a6cdbd]">
                      Mock QR for presentation only
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-[#02aa63]/12 bg-[#f8fffb] p-4 dark:border-[#42e5a1]/14 dark:bg-white/5">
                  <div className="grid gap-3 sm:grid-cols-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedMethodId(method.id);
                          setStatus("INITIAL");
                        }}
                        className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 active:translate-y-px ${
                          selectedMethodId === method.id
                            ? "border-[#02aa63] bg-[#e9fff5] text-[#063d2a] shadow-[0_12px_28px_rgba(2,170,99,0.12)] dark:bg-[#073d2a] dark:text-[#dffff0]"
                            : "border-[#02aa63]/12 bg-white text-[#365b4d] dark:border-[#42e5a1]/12 dark:bg-[#071610] dark:text-[#b9dccc]"
                        }`}
                      >
                        <MethodIcon method={method} />
                        <span className="mt-3 block text-xs font-black">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black tracking-[-0.04em] text-[#052217] sm:text-5xl dark:text-white">
            The demo narrative is simple.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#426756] dark:text-[#b9dccc]">
            Customers subscribe in Naira, choose the local payment path they trust, and Lumicoria turns the successful payment into credits and invoice reconciliation.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[#02aa63]/14 bg-white p-6 shadow-sm dark:border-[#42e5a1]/14 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#02aa63] text-white">
                <ReceiptText className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="text-lg font-black">Demo story beat</h3>
                <p className="text-sm text-[#557466] dark:text-[#a6cdbd]">Use this during the script.</p>
              </div>
            </div>
            <p className="mt-6 text-2xl font-black leading-tight tracking-[-0.035em]">
              "AI should live where work happens. Payments should meet customers where they already are."
            </p>
            <div className="mt-6 rounded-3xl bg-[#f1fff7] p-4 dark:bg-[#06251a]">
              <p className="text-sm leading-7 text-[#365b4d] dark:text-[#b9dccc]">
                The page shows OPay as the adoption layer: wallet for app users, QR for quick top-ups, USSD for low-data contexts, and agent cash for offline trust.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Subscribe",
                body: "A freelancer or SME chooses a Lumicoria AI plan in Naira.",
                icon: CreditCard,
              },
              {
                title: "Pay locally",
                body: "The customer selects wallet, QR, USSD, or an agent reference.",
                icon: Wallet,
              },
              {
                title: "Confirm status",
                body: "The checkout state moves from initial to pending to paid.",
                icon: CheckCircle2,
              },
              {
                title: "Reconcile",
                body: "Lumicoria matches the settlement reference with the invoice.",
                icon: RefreshCw,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[2rem] border border-[#02aa63]/14 bg-white p-5 shadow-sm transition hover:-translate-y-1 dark:border-[#42e5a1]/14 dark:bg-white/5">
                  <Icon className="h-6 w-6 text-[#02aa63] dark:text-[#42e5a1]" strokeWidth={1.8} />
                  <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#557466] dark:text-[#a6cdbd]">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="checkout" className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <div className="rounded-[2rem] border border-[#02aa63]/14 bg-white p-6 shadow-[0_24px_90px_rgba(6,37,26,0.08)] dark:border-[#42e5a1]/14 dark:bg-white/5">
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Choose a Naira plan.</h2>
          <p className="mt-3 text-sm leading-6 text-[#557466] dark:text-[#a6cdbd]">
            These are demo subscriptions. No card, wallet, or API call is charged.
          </p>

          <div className="mt-6 grid gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setStatus("INITIAL");
                }}
                className={`rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 active:translate-y-px ${
                  selectedPlanId === plan.id
                    ? "border-[#02aa63] bg-[#e9fff5] shadow-[0_16px_34px_rgba(2,170,99,0.14)] dark:bg-[#073d2a]"
                    : "border-[#02aa63]/12 bg-[#fbfffd] hover:border-[#02aa63]/40 dark:border-[#42e5a1]/12 dark:bg-[#071610]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black">{plan.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#557466] dark:text-[#a6cdbd]">{plan.audience}</p>
                  </div>
                  <p className="text-2xl font-black tracking-[-0.035em] text-[#02aa63] dark:text-[#42e5a1]">
                    {formatNaira(plan.price)}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#365b4d] dark:text-[#b9dccc]">{plan.highlight}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[plan.credits, ...plan.items].map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#34614e] dark:bg-white/10 dark:text-[#dffff0]">
                      {item}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#02aa63]/14 bg-white p-3 shadow-[0_24px_90px_rgba(6,37,26,0.10)] dark:border-[#42e5a1]/14 dark:bg-[#0a1c15]">
          <div className="rounded-[1.55rem] bg-[#f2fff7] p-4 dark:bg-[#071610]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#02aa63]/12 pb-5 dark:border-[#42e5a1]/12">
              <div>
                <p className="text-sm font-black text-[#02aa63] dark:text-[#42e5a1]">OPay Cashier simulation</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{selectedPlan.name}</h2>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-3xl bg-white p-5 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-[#557466] dark:text-[#a6cdbd]">Monthly subscription</p>
                  <p className="text-sm font-black">{formatNaira(selectedPlan.price)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-[#557466] dark:text-[#a6cdbd]">VAT estimate</p>
                  <p className="text-sm font-black">{formatNaira(vat)}</p>
                </div>
                <div className="mt-4 rounded-2xl bg-[#06251a] p-4 text-white dark:bg-[#02aa63] dark:text-[#06251a]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-black">Total due</p>
                    <p className="text-2xl font-black tracking-[-0.04em]">{formatNaira(total)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-black">Payment method</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedMethodId(method.id);
                          setStatus("INITIAL");
                        }}
                        className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 active:translate-y-px ${
                          selectedMethodId === method.id
                            ? "border-[#02aa63] bg-[#e9fff5] text-[#063d2a] dark:bg-[#073d2a] dark:text-[#dffff0]"
                            : "border-[#02aa63]/12 bg-white text-[#365b4d] dark:border-[#42e5a1]/12 dark:bg-[#071610] dark:text-[#b9dccc]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MethodIcon method={method} />
                          <span className="text-sm font-black">{method.label}</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#557466] dark:text-[#a6cdbd]">{method.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={beginSimulation}
                    disabled={status === "PENDING"}
                    className="inline-flex items-center justify-center rounded-full bg-[#02aa63] px-6 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(2,170,99,0.22)] transition hover:-translate-y-0.5 hover:bg-[#028f55] active:translate-y-px disabled:cursor-wait disabled:opacity-70 dark:text-[#06251a] dark:hover:bg-[#42e5a1]"
                  >
                    {status === "PENDING" ? "Processing" : "Simulate Charge"}
                  </button>
                  <button
                    type="button"
                    onClick={resetSimulation}
                    className="inline-flex items-center justify-center rounded-full border border-[#02aa63]/25 bg-white px-5 py-3 text-sm font-black text-[#063d2a] transition hover:-translate-y-0.5 hover:bg-[#effff7] active:translate-y-px dark:border-[#42e5a1]/25 dark:bg-white/5 dark:text-[#dffff0] dark:hover:bg-white/10"
                  >
                    Reset
                  </button>
                </div>
                <button
                  type="button"
                  onClick={showDeclinedState}
                  className="mt-3 text-xs font-bold text-[#8a4d45] underline-offset-4 hover:underline dark:text-[#ffcabf]"
                >
                  Show declined state
                </button>
              </div>

              <div className="rounded-3xl border border-[#02aa63]/12 bg-white p-5 dark:border-[#42e5a1]/12 dark:bg-white/5">
                <div aria-live="polite">
                  {status === "INITIAL" && (
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9fff5] text-[#02aa63] dark:bg-[#073d2a] dark:text-[#42e5a1]">
                        <Wallet className="h-6 w-6" strokeWidth={1.8} />
                      </div>
                      <h3 className="mt-5 text-xl font-black">Ready to collect</h3>
                      <p className="mt-2 text-sm leading-6 text-[#557466] dark:text-[#a6cdbd]">
                        The customer sees a branded OPay payment prompt before the mock charge begins.
                      </p>
                    </div>
                  )}

                  {status === "PENDING" && (
                    <div>
                      <div className="h-12 w-12 rounded-2xl bg-[#e9fff5] p-3 dark:bg-[#073d2a]">
                        <div className="h-full w-full animate-spin rounded-full border-2 border-[#02aa63]/20 border-t-[#02aa63] dark:border-[#42e5a1]/20 dark:border-t-[#42e5a1]" />
                      </div>
                      <h3 className="mt-5 text-xl font-black">Waiting for OPay status</h3>
                      <p className="mt-2 text-sm leading-6 text-[#557466] dark:text-[#a6cdbd]">
                        This mimics a pending checkout while the payment status is confirmed.
                      </p>
                    </div>
                  )}

                  {status === "SUCCESS" && (
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#02aa63] text-white dark:bg-[#42e5a1] dark:text-[#06251a]">
                        <CheckCircle2 className="h-6 w-6" strokeWidth={1.8} />
                      </div>
                      <h3 className="mt-5 text-xl font-black">Payment confirmed</h3>
                      <p className="mt-2 text-sm leading-6 text-[#557466] dark:text-[#a6cdbd]">
                        Lumicoria unlocks credits and reconciles the invoice with the OPay reference.
                      </p>
                    </div>
                  )}

                  {status === "FAILED" && (
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200">
                        <XCircle className="h-6 w-6" strokeWidth={1.8} />
                      </div>
                      <h3 className="mt-5 text-xl font-black">Payment not completed</h3>
                      <p className="mt-2 text-sm leading-6 text-[#557466] dark:text-[#a6cdbd]">
                        The customer can retry with another method while the invoice stays unpaid.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-3xl bg-[#f1fff7] p-4 dark:bg-[#06251a]">
                  <p className="text-xs font-black text-[#02aa63] dark:text-[#42e5a1]">Reference</p>
                  <p className="mt-1 break-all text-sm font-black">{reference}</p>
                  <p className="mt-4 text-xs font-black text-[#02aa63] dark:text-[#42e5a1]">Displayed method</p>
                  <p className="mt-1 text-sm font-black">{selectedMethod.name}</p>
                </div>

                <div className="mt-6 space-y-3">
                  {reconciliationFeed.map((item, index) => {
                    const isActive = status === "SUCCESS" || index < 2 || status === "PENDING";
                    return (
                      <div key={item} className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                            isActive
                              ? "bg-[#02aa63] text-white dark:bg-[#42e5a1] dark:text-[#06251a]"
                              : "bg-[#dcece5] text-[#557466] dark:bg-white/10 dark:text-[#a6cdbd]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <p className={`text-sm font-semibold ${isActive ? "text-[#063d2a] dark:text-[#dffff0]" : "text-[#6f897d] dark:text-[#779b8c]"}`}>
                          {item}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="research" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-[#06251a] p-7 text-white shadow-[0_30px_90px_rgba(6,37,26,0.18)] dark:bg-[#0b2b20]">
            <p className="text-sm font-black text-[#42e5a1]">Research-backed angle</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              OPay is the trust bridge for adoption.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#c9f5df]">
              For the demo, the innovation is not a live payment integration. It is the visible product flow: local payment choice, subscription activation, and automatic reconciliation for SMEs.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#02aa63]/14 bg-white p-6 dark:border-[#42e5a1]/14 dark:bg-white/5">
            <div className="grid gap-3">
              {researchNotes.map((note) => (
                <div key={note} className="rounded-3xl bg-[#f3fff8] p-4 dark:bg-[#071610]">
                  <p className="text-sm leading-6 text-[#365b4d] dark:text-[#b9dccc]">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#02aa63]/14 px-4 py-8 text-center text-sm font-semibold text-[#557466] dark:border-[#42e5a1]/14 dark:text-[#a6cdbd]">
        <p>Simulation only. No OPay API, wallet, card, USSD, or agent transaction is created.</p>
      </footer>
    </main>
  );
};

export default OpayPaymentDemo;
