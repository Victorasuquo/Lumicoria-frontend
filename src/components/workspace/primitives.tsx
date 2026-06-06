/**
 * Lumicoria workspace primitives.
 *
 * GlassCard, BrandPill, RoleChip, PlanBadge, SeatCounter, MemberAvatar,
 * MemberStack, AgentChip, StatusDot, EmptyState.
 *
 * All inline-styled and self-contained so they render identically in dev
 * and the production build without depending on a Tailwind preset that
 * may differ between branches.
 */

import React from "react";
import { tokens, BRAND_GRADIENT, planLabel, roleLabel, initials } from "./tokens";

// ── GlassCard ────────────────────────────────────────────────────────

export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement> & { padding?: number | string; tone?: "default" | "soft" | "dark" }> = ({
  children, style, padding, tone = "default", ...rest
}) => {
  const base: React.CSSProperties = {
    background: tone === "dark"
      ? "linear-gradient(135deg, #1E1B36 0%, #2A2350 100%)"
      : tone === "soft"
        ? "rgba(255,255,255,0.6)"
        : "rgba(255,255,255,0.78)",
    color: tone === "dark" ? "#F8FAFC" : tokens.INK,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: tone === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.6)",
    borderRadius: tokens.R_XL,
    boxShadow: tokens.SHADOW_CARD,
    padding,
    ...style,
  };
  return <div style={base} {...rest}>{children}</div>;
};

// ── BrandPill / RoleChip / PlanBadge ────────────────────────────────

export const BrandPill: React.FC<{ children: React.ReactNode; tone?: "primary" | "outline" | "ghost"; style?: React.CSSProperties }> = ({
  children, tone = "primary", style,
}) => {
  if (tone === "outline") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: tokens.R_PILL,
        border: `1px solid ${tokens.PURPLE}30`, color: tokens.PURPLE_DEEP,
        fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
        background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
        ...style,
      }}>{children}</span>
    );
  }
  if (tone === "ghost") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: tokens.R_PILL, color: tokens.PURPLE_DEEP,
        fontWeight: 600, fontSize: 12, ...style,
      }}>{children}</span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: tokens.R_PILL, color: "white",
      background: BRAND_GRADIENT, fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
      boxShadow: "0 6px 18px rgba(108,74,176,0.25)", ...style,
    }}>{children}</span>
  );
};

export const RoleChip: React.FC<{ role?: string | null }> = ({ role }) => {
  const isPrivileged = ["owner", "admin", "team_admin", "lead"].includes((role || "").toLowerCase());
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: tokens.R_PILL,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
      background: isPrivileged ? `${tokens.PURPLE}14` : `${tokens.SLATE_400}1A`,
      color: isPrivileged ? tokens.PURPLE_DEEP : tokens.SLATE_600,
      border: isPrivileged ? `1px solid ${tokens.PURPLE}28` : `1px solid ${tokens.SLATE_300}88`,
    }}>{roleLabel(role)}</span>
  );
};

export const PlanBadge: React.FC<{ plan?: string | null; compact?: boolean }> = ({ plan, compact }) => {
  const isPaid = ["starter", "professional", "team", "business", "enterprise"].includes((plan || "free").toLowerCase());
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: compact ? "3px 9px" : "5px 12px",
      borderRadius: tokens.R_PILL,
      fontSize: compact ? 10 : 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
      color: isPaid ? "white" : tokens.SLATE_600,
      background: isPaid ? BRAND_GRADIENT : `${tokens.SLATE_400}1A`,
      border: isPaid ? "none" : `1px solid ${tokens.SLATE_300}88`,
      boxShadow: isPaid ? "0 6px 14px rgba(108,74,176,0.22)" : "none",
    }}>{planLabel(plan)}</span>
  );
};

// ── SeatCounter ──────────────────────────────────────────────────────

export const SeatCounter: React.FC<{ used: number; purchased: number; style?: React.CSSProperties }> = ({ used, purchased, style }) => {
  const remaining = Math.max(purchased - used, 0);
  const ratio = purchased ? Math.min(used / purchased, 1) : 0;
  const warning = ratio >= 0.9;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "6px 14px", borderRadius: tokens.R_PILL,
      background: "rgba(255,255,255,0.78)",
      border: `1px solid ${warning ? tokens.AMBER : tokens.SLATE_200}`,
      fontSize: 12, color: tokens.SLATE_700, fontWeight: 600,
      ...style,
    }}>
      <div style={{
        width: 84, height: 6, borderRadius: tokens.R_PILL,
        background: tokens.SLATE_200, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, width: `${ratio * 100}%`,
          background: warning ? `linear-gradient(90deg, ${tokens.AMBER}, ${tokens.ORANGE})` : BRAND_GRADIENT,
        }} />
      </div>
      <span>{used.toLocaleString()} / {purchased.toLocaleString()} seats</span>
      {remaining > 0 ? (
        <span style={{ color: tokens.SLATE_500, fontWeight: 500 }}>· {remaining.toLocaleString()} open</span>
      ) : (
        <span style={{ color: tokens.AMBER, fontWeight: 700 }}>· Add seats</span>
      )}
    </div>
  );
};

// ── Avatar / MemberStack / AgentChip ────────────────────────────────

export const MemberAvatar: React.FC<{ name?: string | null; src?: string | null; size?: number }> = ({ name, src, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: tokens.R_PILL,
    background: src ? `url(${src})` : BRAND_GRADIENT,
    backgroundSize: "cover", backgroundPosition: "center",
    color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: Math.round(size * 0.4), fontWeight: 700, letterSpacing: 0.5,
    border: "2px solid white", boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
    flexShrink: 0,
  }}>
    {src ? null : initials(name)}
  </div>
);

export const MemberStack: React.FC<{ members: Array<{ name?: string | null; avatar_url?: string | null }>; max?: number; size?: number }> = ({ members, max = 5, size = 28 }) => {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {visible.map((m, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: max - i }}>
          <MemberAvatar name={m.name} src={m.avatar_url} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <span style={{
          marginLeft: -10, zIndex: 0,
          width: size, height: size, borderRadius: tokens.R_PILL,
          background: tokens.SLATE_100, color: tokens.SLATE_600,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: Math.round(size * 0.36),
          border: "2px solid white",
        }}>+{overflow}</span>
      )}
    </div>
  );
};

export const AgentChip: React.FC<{ agentKey: string; size?: number }> = ({ agentKey, size = 28 }) => {
  // Generate a stable brand-gradient initial chip per agent_key.
  // No third-party icons or AI-vendor logos.
  const palette = [
    [tokens.PURPLE, tokens.SKY],
    [tokens.PURPLE_DEEP, tokens.PURPLE],
    [tokens.SKY, tokens.TEAL],
    [tokens.PURPLE, tokens.ORANGE],
    [tokens.PURPLE_LIGHT, tokens.PURPLE_DEEP],
  ];
  const hash = Array.from(agentKey).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const [from, to] = palette[hash % palette.length];
  const label = agentKey
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join("") || "?";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "4px 10px 4px 4px", borderRadius: tokens.R_PILL,
      background: "rgba(255,255,255,0.78)",
      border: `1px solid ${tokens.SLATE_200}`,
      fontSize: 12, fontWeight: 600, color: tokens.INK,
    }}>
      <span style={{
        width: size, height: size, borderRadius: tokens.R_PILL,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.4), fontWeight: 700,
      }}>{label}</span>
      <span style={{ textTransform: "capitalize" }}>{agentKey.replace(/_/g, " ")}</span>
    </span>
  );
};

// ── StatusDot / EmptyState / SectionHeader ──────────────────────────

export const StatusDot: React.FC<{ tone?: "online" | "warn" | "off" | "ok"; size?: number }> = ({ tone = "online", size = 8 }) => {
  const color =
    tone === "online" || tone === "ok" ? tokens.GREEN :
    tone === "warn" ? tokens.AMBER : tokens.SLATE_400;
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      borderRadius: tokens.R_PILL, background: color,
      boxShadow: `0 0 0 3px ${color}26`,
    }} />
  );
};

export const SectionHeader: React.FC<{ eyebrow?: string; title: string; subtitle?: string; right?: React.ReactNode; }> = ({
  eyebrow, title, subtitle, right,
}) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
    <div>
      {eyebrow && (
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.PURPLE_DEEP, fontWeight: 700 }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontFamily: tokens.DISPLAY_STACK,
        fontWeight: 700, fontSize: 28, letterSpacing: -0.5,
        color: tokens.INK, margin: 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ color: tokens.SLATE_600, fontSize: 14, marginTop: 6, marginBottom: 0, maxWidth: 720 }}>{subtitle}</p>
      )}
    </div>
    {right && <div>{right}</div>}
  </div>
);

export const EmptyState: React.FC<{ title: string; body?: string; action?: React.ReactNode }> = ({ title, body, action }) => (
  <GlassCard style={{ padding: 36, textAlign: "center" }}>
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: tokens.R_XL, background: `${tokens.PURPLE}14`, marginBottom: 12 }}>
      <span style={{ width: 18, height: 18, borderRadius: tokens.R_PILL, background: BRAND_GRADIENT, display: "inline-block" }} />
    </div>
    <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontWeight: 700, fontSize: 18, margin: 0, color: tokens.INK }}>{title}</h3>
    {body && <p style={{ color: tokens.SLATE_600, fontSize: 14, marginTop: 8, marginBottom: action ? 16 : 0 }}>{body}</p>}
    {action}
  </GlassCard>
);

// ── Buttons ─────────────────────────────────────────────────────────

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "outline" | "danger"; size?: "sm" | "md" };

export const Button: React.FC<BtnProps> = ({ tone = "primary", size = "md", style, children, ...rest }) => {
  const padding = size === "sm" ? "8px 14px" : "11px 18px";
  const fontSize = size === "sm" ? 13 : 14;
  let bg: string = BRAND_GRADIENT;
  let color = "white";
  let border = "none";
  let boxShadow = "0 10px 22px rgba(108,74,176,0.25)";
  if (tone === "ghost") { bg = "transparent"; color = tokens.PURPLE_DEEP; border = `1px solid ${tokens.PURPLE}22`; boxShadow = "none"; }
  if (tone === "outline") { bg = "white"; color = tokens.PURPLE_DEEP; border = `1px solid ${tokens.PURPLE}33`; boxShadow = "0 2px 6px rgba(15,23,42,0.04)"; }
  if (tone === "danger") { bg = `linear-gradient(135deg, ${tokens.RED} 0%, #B91C1C 100%)`; boxShadow = "0 8px 22px rgba(239,68,68,0.25)"; }
  return (
    <button
      {...rest}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding, borderRadius: tokens.R_PILL, fontFamily: tokens.BODY_STACK,
        fontWeight: 600, fontSize, letterSpacing: 0.1,
        background: bg, color, border, cursor: "pointer", boxShadow,
        transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ── Input ───────────────────────────────────────────────────────────

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }> = ({ invalid, style, ...rest }) => (
  <input
    {...rest}
    style={{
      width: "100%", padding: "10px 14px",
      borderRadius: tokens.R_MD,
      border: `1px solid ${invalid ? tokens.RED : tokens.SLATE_200}`,
      fontSize: 14, fontFamily: tokens.BODY_STACK, color: tokens.INK,
      background: "white", outline: "none",
      ...style,
    }}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ style, ...rest }) => (
  <textarea
    {...rest}
    style={{
      width: "100%", padding: "12px 14px",
      borderRadius: tokens.R_MD,
      border: `1px solid ${tokens.SLATE_200}`,
      fontSize: 14, fontFamily: tokens.BODY_STACK, color: tokens.INK,
      background: "white", outline: "none", resize: "vertical",
      ...style,
    }}
  />
);

// ── Skeleton ────────────────────────────────────────────────────────

export const Skeleton: React.FC<{ width?: number | string; height?: number | string; radius?: number; style?: React.CSSProperties }> = ({ width = "100%", height = 14, radius = 8, style }) => (
  <div style={{
    width, height, borderRadius: radius,
    background: `linear-gradient(90deg, ${tokens.SLATE_100} 0%, ${tokens.SLATE_200} 50%, ${tokens.SLATE_100} 100%)`,
    backgroundSize: "200% 100%",
    animation: "lumi-skeleton 1.4s ease-in-out infinite",
    ...style,
  }} />
);

// Inject a single shared keyframes block once.
if (typeof document !== "undefined" && !document.getElementById("lumi-skeleton-keyframes")) {
  const style = document.createElement("style");
  style.id = "lumi-skeleton-keyframes";
  style.innerHTML = "@keyframes lumi-skeleton { 0% { background-position: 0% 0%; } 100% { background-position: -200% 0%; } }";
  document.head.appendChild(style);
}
