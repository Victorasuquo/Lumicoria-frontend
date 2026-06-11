/**
 * WorkspaceLayout — the chrome that wraps every /workspace/* page.
 *
 * Renders: aurora background → sticky glass sidebar (workspace + teams +
 * projects tree, scrollable) → main content slot.  Lazy-loads teams and
 * projects from the active org so the tree always reflects reality.
 */

import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { tokens, BRAND_GRADIENT, AURORA_GRADIENT, initials } from "./tokens";
import { GlassCard, PlanBadge, SeatCounter, Skeleton } from "./primitives";
import { teamApi, projectV2Api, type Team, type ProjectV2 } from "@/services/workspaceApi";

const SidebarSection: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div style={{ marginTop: 18 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 6px" }}>
      <div style={{ fontSize: 10, color: tokens.SLATE_500, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
        {title}
      </div>
      {right}
    </div>
    <div>{children}</div>
  </div>
);

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 10,
  padding: "8px 12px", borderRadius: 12,
  background: active ? `${tokens.PURPLE}12` : "transparent",
  color: active ? tokens.PURPLE_DEEP : tokens.SLATE_700,
  fontSize: 13, fontWeight: active ? 700 : 600,
  textDecoration: "none", border: "none", textAlign: "left",
  cursor: "pointer", width: "100%",
});

export const WorkspaceLayout: React.FC = () => {
  const { activeOrg, activeOrgId, subscription, loading } = useWorkspace();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<ProjectV2[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeOrgId) { setTeams([]); setProjects([]); return; }
    setLoadingTree(true);
    Promise.all([
      teamApi.list(activeOrgId, { onlyMine: false }).catch(() => []),
      projectV2Api.list(activeOrgId, { onlyMine: false }).catch(() => []),
    ]).then(([t, p]) => {
      if (cancelled) return;
      setTeams(t.slice(0, 30));
      setProjects(p.slice(0, 40));
    }).finally(() => { if (!cancelled) setLoadingTree(false); });
    return () => { cancelled = true; };
  }, [activeOrgId]);

  const seatsUsed = subscription?.seats_used ?? 0;
  const seatsPurchased = subscription?.seats_purchased ?? 0;
  const showSeats = (subscription?.plan && ["team", "business", "enterprise"].includes(subscription.plan)) && seatsPurchased > 0;

  const adminLinks = useMemo(() => ([
    { to: "/workspace/admin/billing", label: "Billing & seats" },
    { to: "/workspace/admin/audit", label: "Audit log" },
    { to: "/workspace/admin/sso", label: "SSO" },
    { to: "/workspace/admin/scim", label: "SCIM provisioning" },
    { to: "/workspace/admin/domains", label: "Domains" },
    { to: "/workspace/admin/api-tokens", label: "API tokens" },
    { to: "/workspace/admin/webhooks", label: "Webhooks" },
    { to: "/workspace/admin/security", label: "Session policy" },
    { to: "/workspace/admin/automations", label: "Automations" },
    { to: "/workspace/admin/notifications", label: "Notifications" },
    { to: "/workspace/admin/branding", label: "Branding" },
    { to: "/workspace/admin/integrations", label: "Integrations" },
  ]), []);

  return (
    <div style={{
      minHeight: "100vh", position: "relative",
      background: tokens.SLATE_50,
      fontFamily: tokens.BODY_STACK, color: tokens.INK,
    }}>
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: AURORA_GRADIENT, opacity: 0.7,
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        display: "grid",
        gridTemplateColumns: "300px minmax(0, 1fr)",
        gap: 24, maxWidth: 1480, margin: "0 auto", padding: "24px 24px 48px",
      }}>
        {/* Sidebar */}
        <aside style={{ position: "sticky", top: 88, alignSelf: "flex-start" }}>
          <GlassCard padding={16} style={{ maxHeight: "calc(100vh - 112px)", overflow: "auto" }}>
            {/* Active workspace pill */}
            <button
              onClick={() => navigate("/workspace")}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 10px", borderRadius: 14,
                background: `${tokens.PURPLE}08`, border: `1px solid ${tokens.PURPLE}1A`,
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{
                width: 34, height: 34, borderRadius: 9999,
                background: activeOrg?.logo_url ? `url(${activeOrg.logo_url})` : BRAND_GRADIENT,
                backgroundSize: "cover", color: "white",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
              }}>{activeOrg?.logo_url ? null : initials(activeOrg?.name || "Workspace")}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 14, color: tokens.INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activeOrg?.name || (loading ? "Loading…" : "No workspace")}
                </span>
                <span style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                  <PlanBadge plan={activeOrg?.plan || "free"} compact />
                </span>
              </span>
            </button>

            {showSeats && (
              <div style={{ marginTop: 12 }}>
                <SeatCounter used={seatsUsed} purchased={seatsPurchased} style={{ width: "100%", justifyContent: "space-between" }} />
              </div>
            )}

            <SidebarSection title="Overview">
              <NavLink to="/workspace" end style={({ isActive }) => navLinkStyle(isActive)}>Home</NavLink>
              <NavLink to="/workspace/members" style={({ isActive }) => navLinkStyle(isActive)}>Members</NavLink>
              <NavLink to="/workspace/activity" style={({ isActive }) => navLinkStyle(isActive)}>Activity</NavLink>
            </SidebarSection>

            <SidebarSection
              title={`Teams (${teams.length})`}
              right={
                <button
                  onClick={() => navigate("/workspace/teams")}
                  style={{ background: "transparent", border: "none", color: tokens.PURPLE_DEEP, fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                >
                  All
                </button>
              }
            >
              {loadingTree ? (
                <>
                  <Skeleton height={28} style={{ marginBottom: 6 }} />
                  <Skeleton height={28} style={{ marginBottom: 6 }} />
                </>
              ) : teams.length === 0 ? (
                <div style={{ fontSize: 12, color: tokens.SLATE_500, padding: "6px 4px" }}>
                  No teams yet. <button onClick={() => navigate("/workspace/teams")} style={{ background: "transparent", border: "none", color: tokens.PURPLE_DEEP, fontWeight: 700, cursor: "pointer", padding: 0 }}>Create one →</button>
                </div>
              ) : teams.map(t => (
                <NavLink key={t.id} to={`/workspace/teams/${t.id}`} style={({ isActive }) => navLinkStyle(isActive)}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: t.color || tokens.PURPLE_LIGHT }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                </NavLink>
              ))}
            </SidebarSection>

            <SidebarSection
              title={`Projects (${projects.length})`}
              right={
                <button
                  onClick={() => navigate("/workspace/projects")}
                  style={{ background: "transparent", border: "none", color: tokens.PURPLE_DEEP, fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                >
                  All
                </button>
              }
            >
              {loadingTree ? (
                <>
                  <Skeleton height={28} style={{ marginBottom: 6 }} />
                  <Skeleton height={28} style={{ marginBottom: 6 }} />
                  <Skeleton height={28} style={{ marginBottom: 6 }} />
                </>
              ) : projects.length === 0 ? (
                <div style={{ fontSize: 12, color: tokens.SLATE_500, padding: "6px 4px" }}>
                  No projects yet. <button onClick={() => navigate("/workspace/projects")} style={{ background: "transparent", border: "none", color: tokens.PURPLE_DEEP, fontWeight: 700, cursor: "pointer", padding: 0 }}>Start one →</button>
                </div>
              ) : projects.slice(0, 12).map(p => (
                <NavLink key={p.id} to={`/workspace/projects/${p.id}`} style={({ isActive }) => navLinkStyle(isActive)}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: p.color || tokens.PURPLE }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                </NavLink>
              ))}
            </SidebarSection>

            <SidebarSection title="Admin">
              {adminLinks.map(l => (
                <NavLink key={l.to} to={l.to} style={({ isActive }) => navLinkStyle(isActive)}>{l.label}</NavLink>
              ))}
            </SidebarSection>
          </GlassCard>
        </aside>

        {/* Main */}
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};
