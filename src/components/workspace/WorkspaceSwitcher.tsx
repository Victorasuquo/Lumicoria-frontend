/**
 * WorkspaceSwitcher — pill-glass dropdown that shows the active org and
 * lets the user jump to other orgs they belong to.
 *
 * Mounted at the left of MainNav.  Falls back to a plain link to /workspace
 * when there's only one workspace.
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { tokens, BRAND_GRADIENT, initials, planLabel } from "./tokens";
import { PlanBadge } from "./primitives";
import { resolveAvatarUrl } from "@/services/api";

export const WorkspaceSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrg, memberships, switchTo } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!activeOrg) {
    return (
      <button
        onClick={() => navigate("/workspace")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 14px", borderRadius: 9999,
          background: "rgba(255,255,255,0.7)", border: `1px solid ${tokens.PURPLE}22`,
          color: tokens.PURPLE_DEEP, fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}
      >
        Open workspace
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "6px 14px 6px 6px", borderRadius: 9999,
          background: "rgba(255,255,255,0.78)", border: `1px solid ${tokens.SLATE_200}`,
          color: tokens.INK, fontWeight: 600, fontSize: 13, cursor: "pointer",
          backdropFilter: "blur(10px)", boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {(() => {
          const resolvedLogo = resolveAvatarUrl(activeOrg.logo_url || undefined);
          return (
            <span style={{
              width: 26, height: 26, borderRadius: 9999,
              background: resolvedLogo
                ? `url(${resolvedLogo}) center/cover no-repeat`
                : BRAND_GRADIENT,
              color: "white",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {resolvedLogo ? null : initials(activeOrg.name)}
            </span>
          );
        })()}
        <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeOrg.name}
        </span>
        <PlanBadge plan={activeOrg.plan || "free"} compact />
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 4l3 3 3-3" stroke={tokens.SLATE_500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0,
            minWidth: 280, padding: 10, borderRadius: 18,
            background: "rgba(255,255,255,0.96)", backdropFilter: "blur(18px)",
            border: `1px solid ${tokens.SLATE_200}`,
            boxShadow: "0 24px 48px rgba(15,23,42,0.18)",
            zIndex: 60,
          }}
        >
          <div style={{ fontSize: 11, color: tokens.SLATE_500, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px" }}>
            Workspaces
          </div>
          {memberships.map(m => {
            const active = m.id === activeOrg.id;
            return (
              <button
                key={m.id}
                onClick={() => { setOpen(false); void switchTo(m.id); navigate("/workspace"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 12px", borderRadius: 12, background: active ? `${tokens.PURPLE}10` : "transparent",
                  border: "none", textAlign: "left", cursor: "pointer", color: tokens.INK,
                }}
              >
                {(() => {
                  const resolvedM = resolveAvatarUrl(m.logo_url || undefined);
                  return (
                    <span style={{
                      width: 30, height: 30, borderRadius: 9999,
                      background: resolvedM
                        ? `url(${resolvedM}) center/cover no-repeat`
                        : BRAND_GRADIENT,
                      color: "white",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{resolvedM ? null : initials(m.name)}</span>
                  );
                })()}
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                  <span style={{ display: "block", fontSize: 11, color: tokens.SLATE_500 }}>{planLabel(m.plan)}</span>
                </span>
                {active && (
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: tokens.PURPLE }} />
                )}
              </button>
            );
          })}
          <div style={{ height: 1, background: tokens.SLATE_200, margin: "8px 6px" }} />
          <button
            onClick={() => { setOpen(false); navigate("/workspace"); }}
            style={{
              display: "flex", width: "100%", padding: "10px 12px",
              borderRadius: 12, border: "none", background: "transparent",
              color: tokens.PURPLE_DEEP, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Open workspace home →
          </button>
        </div>
      )}
    </div>
  );
};
