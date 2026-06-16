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
  // Cleaner editorial chrome — closer to /portal pages.  Less glass, no
  // backdrop blur on default cards (kept for soft + dark hero variants).
  const base: React.CSSProperties = tone === "dark"
    ? {
        background: "linear-gradient(135deg, #1E1B36 0%, #2A2350 100%)",
        color: "#F8FAFC",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
        padding,
        ...style,
      }
    : tone === "soft"
      ? {
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: tokens.INK,
          border: "1px solid rgba(226,232,240,0.85)",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          padding,
          ...style,
        }
      : {
          background: "#ffffff",
          color: tokens.INK,
          border: "1px solid rgba(226,232,240,0.85)",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
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

import { resolveAvatarUrl } from "@/services/api";
import { useRealtime } from "@/contexts/RealtimeContext";

export const MemberAvatarRaw: React.FC<{
  name?: string | null;
  src?: string | null;
  size?: number;
  userId?: string | null;
  /** Override presence detection — pass false on rows that aren't
   *  user-scoped (system, agent) so we don't render a stray dot. */
  showPresence?: boolean;
}> = ({ name, src, size = 32, userId, showPresence = true }) => {
  // Backend may return /uploads/avatars/foo.png (relative) or a full URL.
  // resolveAvatarUrl handles both; we cache-bust by query-string to avoid
  // stale browser cache after upload.
  const resolved = resolveAvatarUrl(src || undefined);
  const { isOnline, ready } = useRealtime();
  const presenceVisible = showPresence && ready && !!userId;
  const online = presenceVisible ? isOnline(userId) : false;
  const dotSize = Math.max(8, Math.round(size * 0.28));
  return (
    <div style={{
      position: "relative",
      display: "inline-flex",
      flexShrink: 0,
    }}>
      <div style={{
        width: size, height: size, borderRadius: tokens.R_PILL,
        background: resolved ? `url(${resolved}) center/cover no-repeat` : BRAND_GRADIENT,
        color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.4), fontWeight: 700, letterSpacing: 0.5,
        border: "2px solid white", boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
      }}>
        {resolved ? null : initials(name)}
      </div>
      {presenceVisible && (
        <span
          aria-label={online ? "Online" : "Offline"}
          title={online ? "Online" : "Offline"}
          style={{
            position: "absolute",
            right: 0, bottom: 0,
            width: dotSize, height: dotSize, borderRadius: "50%",
            background: online ? tokens.GREEN : tokens.SLATE_400,
            border: "2px solid white",
            boxShadow: "0 1px 3px rgba(15,23,42,0.18)",
          }}
        />
      )}
    </div>
  );
};

export const MemberAvatar = MemberAvatarRaw;

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

// ── Sleek-UI primitives (TabBar / FilterChips / Toolbar / KpiTile /
// CardGrid / SkeletonRow / SkeletonCard / OrbEmptyState / InlineEdit) ─

import { motion, AnimatePresence } from "framer-motion";

interface TabBarTab<T extends string = string> { id: T; label: string; count?: number | string; }

/** Sticky underline-animated tab bar — replaces the inline tab pills in
 *  TeamDetail / ProjectDetail / admin pages. */
export function TabBar<T extends string = string>({
  tabs, active, onChange, sticky = true,
}: { tabs: TabBarTab<T>[]; active: T; onChange: (id: T) => void; sticky?: boolean; }) {
  return (
    <div style={{
      position: sticky ? "sticky" : undefined,
      top: sticky ? 64 : undefined, zIndex: 20,
      display: "flex", gap: 4,
      padding: "4px 4px 2px",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)",
      borderRadius: 999, border: `1px solid ${tokens.SLATE_200}`,
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      width: "fit-content", maxWidth: "100%", overflowX: "auto",
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              position: "relative",
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", border: "none",
              background: "transparent", color: isActive ? tokens.PURPLE_DEEP : tokens.SLATE_600,
              fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
              borderRadius: 999,
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{
                fontSize: 11, padding: "1px 6px", borderRadius: 999,
                background: isActive ? `${tokens.PURPLE}14` : tokens.SLATE_100,
                color: isActive ? tokens.PURPLE_DEEP : tokens.SLATE_600,
                fontWeight: 700,
              }}>{t.count}</span>
            )}
            {isActive && (
              <motion.div
                layoutId="lumi-tabbar-underline"
                style={{
                  position: "absolute", left: 12, right: 12, bottom: -2, height: 2,
                  background: BRAND_GRADIENT, borderRadius: 999,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Chip filter bar.  Single-select OR multi-select via the prop. */
export function FilterChips({
  options, value, onChange, multi = false, label,
}: {
  options: Array<{ id: string; label: string; count?: number | string }>;
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multi?: boolean;
  label?: string;
}) {
  const selected = new Set(Array.isArray(value) ? value : [value].filter(Boolean));
  const toggle = (id: string) => {
    if (!multi) { onChange(id === Array.from(selected)[0] ? "" : id); return; }
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(Array.from(next));
  };
  return (
    <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {label && (
        <span style={{
          fontSize: 11, color: tokens.SLATE_500, letterSpacing: 1,
          textTransform: "uppercase", fontWeight: 700,
        }}>{label}</span>
      )}
      {options.map(opt => {
        const isOn = selected.has(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 11px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${isOn ? tokens.PURPLE : tokens.SLATE_200}`,
              background: isOn ? `${tokens.PURPLE}10` : "white",
              color: isOn ? tokens.PURPLE_DEEP : tokens.SLATE_700,
              fontSize: 12, fontWeight: 600,
              transition: "all 120ms ease",
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span style={{
                fontSize: 10, padding: "1px 5px", borderRadius: 999,
                background: isOn ? "white" : tokens.SLATE_100,
                color: isOn ? tokens.PURPLE_DEEP : tokens.SLATE_500,
                fontWeight: 700,
              }}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Sticky page toolbar — search left, chips/sort/view-switch middle,
 *  bulk-actions right. */
export const Toolbar: React.FC<{
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  sticky?: boolean;
}> = ({ left, center, right, sticky = true }) => (
  <div style={{
    position: sticky ? "sticky" : undefined,
    top: sticky ? 72 : undefined, zIndex: 15,
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    padding: "10px 12px", marginBottom: 12,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${tokens.SLATE_200}`,
    borderRadius: 14,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  }}>
    {left && <div style={{ display: "inline-flex", gap: 8, alignItems: "center", flex: "0 1 auto", minWidth: 0 }}>{left}</div>}
    {center && <div style={{ display: "inline-flex", gap: 8, alignItems: "center", flex: "1 1 auto", minWidth: 0, flexWrap: "wrap" }}>{center}</div>}
    {right && <div style={{ display: "inline-flex", gap: 8, alignItems: "center", flex: "0 0 auto" }}>{right}</div>}
  </div>
);

/** Animated KPI tile (number counts up on mount). */
export const KpiTile: React.FC<{
  label: string; value: string | number; sub?: string;
  tone?: "default" | "accent"; onClick?: () => void;
  trend?: "up" | "down" | "flat"; sparkline?: number[];
}> = ({ label, value, sub, tone = "default", onClick, trend, sparkline }) => {
  const accent = tone === "accent";
  return (
    <motion.div
      whileHover={onClick ? { y: -1, boxShadow: "0 12px 32px rgba(15,23,42,0.10)" } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={onClick}
      style={{
        padding: 18, borderRadius: 16, cursor: onClick ? "pointer" : "default",
        background: accent ? BRAND_GRADIENT : "white",
        color: accent ? "white" : tokens.INK,
        border: `1px solid ${accent ? "transparent" : tokens.SLATE_200}`,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
        color: accent ? "rgba(255,255,255,0.85)" : tokens.SLATE_500,
      }}>{label}</div>
      <div style={{
        fontFamily: tokens.DISPLAY_STACK, fontSize: 32, fontWeight: 700,
        letterSpacing: -0.5, marginTop: 6,
      }}>{value}</div>
      {sub && (
        <div style={{
          fontSize: 12, marginTop: 4,
          color: accent ? "rgba(255,255,255,0.85)" : tokens.SLATE_600,
        }}>
          {trend && (
            <span style={{ marginRight: 4 }}>
              {trend === "up" ? "▲" : trend === "down" ? "▼" : "▬"}
            </span>
          )}
          {sub}
        </div>
      )}
      {sparkline && sparkline.length > 0 && (
        <svg
          width="100%" height={28}
          viewBox={`0 0 ${sparkline.length - 1} 10`} preserveAspectRatio="none"
          style={{ marginTop: 6, opacity: accent ? 0.85 : 1 }}
        >
          <polyline
            fill="none"
            stroke={accent ? "white" : tokens.PURPLE}
            strokeWidth={0.6}
            points={sparkline.map((v, i) => {
              const max = Math.max(...sparkline, 1);
              const min = Math.min(...sparkline, 0);
              const y = 10 - ((v - min) / Math.max(max - min, 1)) * 9;
              return `${i},${y.toFixed(2)}`;
            }).join(" ")}
          />
        </svg>
      )}
    </motion.div>
  );
};

/** Responsive grid wrapper.  Defaults match the workspace pattern
 *  (auto-fit, minmax 240). */
export const CardGrid: React.FC<{ minCol?: number; gap?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  minCol = 240, gap = 16, children, style,
}) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`,
    gap, ...style,
  }}>
    {children}
  </div>
);

/** Skeleton row (table-like). */
export const SkeletonRow: React.FC<{ height?: number; widths?: Array<number | string> }> = ({
  height = 44, widths = ["32%", "20%", "20%", "12%"],
}) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", height,
    borderBottom: `1px solid ${tokens.SLATE_100}`,
  }}>
    {widths.map((w, i) => (
      <Skeleton key={i} width={w} height={12} />
    ))}
  </div>
);

/** Skeleton card. */
export const SkeletonCard: React.FC<{ height?: number; padded?: boolean }> = ({ height = 140, padded = true }) => (
  <div style={{
    height, padding: padded ? 18 : 0, borderRadius: 16,
    background: "white", border: `1px solid ${tokens.SLATE_200}`,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  }}>
    {padded && (
      <>
        <Skeleton width="40%" height={12} />
        <Skeleton width="65%" height={20} style={{ marginTop: 12 }} />
        <Skeleton width="25%" height={10} style={{ marginTop: 14 }} />
      </>
    )}
  </div>
);

/** Aurora-orb empty state — no stock illustrations. */
export const OrbEmptyState: React.FC<{ title: string; body?: string; action?: React.ReactNode; size?: number }> = ({
  title, body, action, size = 96,
}) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: 36, textAlign: "center",
    background: "white", borderRadius: 18, border: `1px solid ${tokens.SLATE_200}`,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  }}>
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: AURORA_GRADIENT,
      boxShadow: "0 18px 50px rgba(108,74,176,0.22)",
      marginBottom: 18, position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 12, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.0) 60%)",
      }} />
    </div>
    <h3 style={{
      margin: 0, fontFamily: tokens.DISPLAY_STACK, fontWeight: 700,
      fontSize: 18, color: tokens.INK,
    }}>{title}</h3>
    {body && (
      <p style={{
        marginTop: 8, marginBottom: action ? 16 : 0,
        color: tokens.SLATE_600, fontSize: 14, maxWidth: 460,
      }}>{body}</p>
    )}
    {action}
  </div>
);

/** Inline edit — click to switch a value from display to text input. */
export const InlineEdit: React.FC<{
  value: string;
  onSave: (next: string) => void | Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  displayStyle?: React.CSSProperties;
}> = ({ value, onSave, placeholder, multiline, displayStyle }) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { setDraft(value); }, [value]);

  const commit = async () => {
    if (draft === value) { setEditing(false); return; }
    setBusy(true);
    try { await onSave(draft); setEditing(false); }
    catch { /* keep editing on failure */ }
    finally { setBusy(false); }
  };

  if (editing) {
    if (multiline) {
      return (
        <Textarea
          autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={e => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
          disabled={busy} placeholder={placeholder}
        />
      );
    }
    return (
      <Input
        autoFocus value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void commit(); }
          else if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        disabled={busy} placeholder={placeholder}
      />
    );
  }
  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        cursor: "text", padding: "2px 6px", margin: "-2px -6px",
        borderRadius: 6, transition: "background 120ms ease",
        display: "inline-block", ...displayStyle,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = tokens.SLATE_100)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {value || <span style={{ color: tokens.SLATE_400 }}>{placeholder || "—"}</span>}
    </span>
  );
};

// Inject a single shared keyframes block once.
if (typeof document !== "undefined" && !document.getElementById("lumi-skeleton-keyframes")) {
  const style = document.createElement("style");
  style.id = "lumi-skeleton-keyframes";
  style.innerHTML = [
    "@keyframes lumi-skeleton { 0% { background-position: 0% 0%; } 100% { background-position: -200% 0%; } }",
    "@keyframes lumi-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.55; } 40% { transform: translateY(-4px); opacity: 1; } }",
  ].join(" ");
  document.head.appendChild(style);
}
