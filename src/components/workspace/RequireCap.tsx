/**
 * RequireCap — route-level capability guard for workspace-admin pages.
 *
 * The sidebar hiding admin LINKS was the only gate before this: a plain
 * member deep-linking to /workspace/admin/branding rendered the full
 * admin page (member-readable GETs like branding/settings/tags leaked
 * real config). This wraps each admin route: while the permission probe
 * is in flight it renders a skeleton; once resolved, members without
 * the capability are redirected to the workspace home.
 *
 * Server-side checks remain the real enforcement — this stops the UI
 * from presenting surfaces the API would (or wouldn't!) refuse.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions, type Capability } from "@/contexts/PermissionsContext";
import { Skeleton } from "./primitives";

export const RequireCap: React.FC<{
  cap: Capability;
  children: React.ReactNode;
}> = ({ cap, children }) => {
  const { can, ready } = usePermissions();

  if (!ready) {
    return (
      <div style={{ padding: 24, display: "grid", gap: 12 }}>
        <Skeleton height={32} width="40%" />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    );
  }
  if (!can(cap)) {
    return <Navigate to="/workspace" replace />;
  }
  return <>{children}</>;
};

export default RequireCap;
