/**
 * AvatarUpload — click-or-drop avatar/logo tile for any scope.
 *
 *   <AvatarUpload
 *     scope="org" | "team" | "project" | "user"
 *     scopeId={id}
 *     orgId={orgId}        // used as query param for team / project
 *     currentUrl={existingUrl}
 *     fallbackName={display}
 *     size={56}
 *     onUploaded={(url) => …}
 *   />
 *
 * Posts multipart to /api/v1/media/avatar/{scope}/{scopeId} (org/team/project)
 * or /api/v1/media/avatar/user (current user only).  Validates client-side
 * for mime-type + 5 MB cap so we don't bounce off the backend cap.
 *
 * Now also accepts drag-and-drop.  Visual affordance: dashed brand-purple
 * outline while a file is being dragged over the tile.
 */

import React, { useRef, useState } from "react";
import api, { resolveAvatarUrl } from "@/services/api";
import { tokens, BRAND_GRADIENT, initials as initialsOf } from "@/components/workspace/tokens";

export type AvatarScope = "org" | "team" | "project" | "user";

interface Props {
  scope: AvatarScope;
  scopeId?: string;
  orgId?: string;
  currentUrl?: string | null;
  fallbackName?: string | null;
  size?: number;
  rounded?: "full" | "lg";
  editable?: boolean;
  onUploaded?: (url: string) => void;
}

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

export const AvatarUpload: React.FC<Props> = ({
  scope, scopeId, orgId, currentUrl, fallbackName, size = 56, rounded = "full", editable = true, onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  const renderedUrl = localUrl || resolveAvatarUrl(currentUrl || undefined);

  const pick = () => {
    if (!editable || busy) return;
    inputRef.current?.click();
  };

  const validateAndUpload = async (file: File | undefined | null) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("PNG, JPG, WEBP, GIF, or SVG only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      let path = "/media/avatar/user";
      const params = new URLSearchParams();
      if (scope === "org") {
        if (!scopeId) throw new Error("scopeId required for org avatar");
        path = `/media/avatar/org/${scopeId}`;
      } else if (scope === "team") {
        if (!scopeId) throw new Error("scopeId required for team avatar");
        path = `/media/avatar/team/${scopeId}`;
        if (orgId) params.set("organization_id", orgId);
      } else if (scope === "project") {
        if (!scopeId) throw new Error("scopeId required for project avatar");
        path = `/media/avatar/project/${scopeId}`;
        if (orgId) params.set("organization_id", orgId);
      }
      const qs = params.toString();
      const { data } = await api.post(qs ? `${path}?${qs}` : path, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = data?.url || data?.signed_url || data?.public_url;
      if (url) {
        setLocalUrl(url);
        onUploaded?.(url);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await validateAndUpload(e.target.files?.[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!editable || busy) return;
    e.preventDefault();
    e.stopPropagation();
    if (!dropping) setDropping(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (!editable || busy) return;
    e.preventDefault();
    e.stopPropagation();
    setDropping(false);
  };
  const onDrop = async (e: React.DragEvent) => {
    if (!editable || busy) return;
    e.preventDefault();
    e.stopPropagation();
    setDropping(false);
    const file = e.dataTransfer.files?.[0];
    await validateAndUpload(file);
  };

  const radius = rounded === "full" ? 9999 : 16;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={pick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: "relative", width: size, height: size,
        borderRadius: radius, overflow: "hidden",
        cursor: editable ? "pointer" : "default",
        background: renderedUrl ? `url(${renderedUrl}) center/cover no-repeat` : BRAND_GRADIENT,
        color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: Math.round(size * 0.4),
        border: dropping ? `2px dashed ${tokens.PURPLE}` : "2px solid white",
        boxShadow: dropping
          ? `0 0 0 4px ${tokens.PURPLE}22, 0 2px 8px rgba(15,23,42,0.12)`
          : "0 2px 8px rgba(15,23,42,0.12)",
        flexShrink: 0,
        transition: "box-shadow 120ms ease, border-color 120ms ease",
      }}
      role={editable ? "button" : undefined}
      aria-label={editable ? "Upload image (click or drop a file)" : undefined}
      title={editable ? "Click to upload or drop an image" : undefined}
    >
      {!renderedUrl && <span>{initialsOf(fallbackName)}</span>}
      {editable && (hover || busy || dropping) && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: Math.max(10, Math.round(size * 0.16)), fontWeight: 700,
          letterSpacing: 0.6, textTransform: "uppercase", textAlign: "center", padding: 4,
        }}>
          {busy ? "Uploading…" : dropping ? "Drop to upload" : "Change"}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        onChange={onFileInputChange}
        style={{ display: "none" }}
      />
      {error && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 6, whiteSpace: "nowrap",
          fontSize: 11, color: tokens.RED, background: "white",
          border: `1px solid ${tokens.RED}33`, borderRadius: 8, padding: "4px 8px",
          boxShadow: "0 4px 16px rgba(15,23,42,0.12)", zIndex: 10,
        }}
          onClick={e => { e.stopPropagation(); setError(null); }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
