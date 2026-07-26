import React from "react";

export const PageHeader: React.FC<{ eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }> = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <div className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#6C4AB0]">{eyebrow}</div>}
      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => (
  <div className={`rounded-3xl border border-black/10 bg-white p-5 shadow-sm ${className}`} {...props} />
);

export const Kpi: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <Card>
    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
    <div className="mt-3 text-3xl font-black text-slate-950">{value}</div>
    {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
  </Card>
);

export const StatusPill: React.FC<{ children: React.ReactNode; tone?: "ok" | "warn" | "bad" | "neutral" }> = ({ children, tone = "neutral" }) => {
  const cls = tone === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : tone === "bad" ? "bg-red-50 text-red-700 border-red-200" : tone === "warn" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${cls}`}>{children}</span>;
};

export const Loading: React.FC = () => <div className="rounded-3xl border border-black/10 bg-white p-8 text-sm text-slate-500">Loading…</div>;
