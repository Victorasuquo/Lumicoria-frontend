/**
 * Lumicoria workspace tokens.
 *
 * Mirrors src/index.css and Lumicoria Design System.  Importing these from
 * one place keeps every workspace surface visually consistent without
 * pulling in Tailwind-only class strings.
 */

export const tokens = {
  // Brand
  PURPLE: "#6C4AB0",
  PURPLE_DEEP: "#3B2D6A",
  PURPLE_LIGHT: "#9B87F5",
  PURPLE_50: "#F4F0FB",
  SKY: "#0EA5E9",
  TEAL: "#38BDF8",
  ORANGE: "#F97316",
  GREEN: "#10B981",
  AMBER: "#F59E0B",
  RED: "#EF4444",

  // Neutrals
  INK: "#0F172A",
  SLATE_50: "#F8FAFC",
  SLATE_100: "#F1F5F9",
  SLATE_200: "#E2E8F0",
  SLATE_300: "#CBD5E1",
  SLATE_400: "#94A3B8",
  SLATE_500: "#64748B",
  SLATE_600: "#475569",
  SLATE_700: "#334155",
  SLATE_800: "#1E293B",
  WHITE: "#FFFFFF",

  // Type
  DISPLAY_STACK: "'Space Grotesk', 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  BODY_STACK: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

  // Radii + shadow
  R_SM: 8,
  R_MD: 12,
  R_LG: 16,
  R_XL: 24,
  R_PILL: 9999,

  SHADOW_CARD: "0 8px 32px rgba(15,23,42,0.07)",
  SHADOW_GLOW: "0 14px 36px rgba(108,74,176,0.25)",
};

export const BRAND_GRADIENT = `linear-gradient(135deg, ${tokens.PURPLE} 0%, ${tokens.SKY} 100%)`;
export const AURORA_GRADIENT = `radial-gradient(60% 80% at 20% 10%, ${tokens.PURPLE_LIGHT}38 0%, transparent 60%), radial-gradient(50% 70% at 85% 25%, ${tokens.SKY}28 0%, transparent 60%), radial-gradient(60% 70% at 50% 90%, ${tokens.PURPLE}20 0%, transparent 65%)`;

export const FADE_UP = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 220, damping: 24 },
};

export const STAGGER = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 220, damping: 24, delay: i * 0.04 },
});

export type PlanKey = "free" | "starter" | "professional" | "team" | "business" | "enterprise";

export const planLabel = (p?: string | null): string => {
  switch ((p || "free").toLowerCase()) {
    case "starter": return "Starter";
    case "professional": return "Professional";
    case "team": return "Team";
    case "business": return "Business";
    case "enterprise": return "Enterprise";
    default: return "Free";
  }
};

export const roleLabel = (r?: string | null): string => {
  switch ((r || "").toLowerCase()) {
    case "owner": return "Owner";
    case "admin": return "Admin";
    case "team_admin": return "Team admin";
    case "lead": return "Lead";
    case "editor": return "Editor";
    case "operator": return "Operator";
    case "reviewer": return "Reviewer";
    case "viewer": return "Viewer";
    case "member": return "Member";
    default: return r || "—";
  }
};

export const initials = (name?: string | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || "").join("") || "?";
};
