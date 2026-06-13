/**
 * CoverUpload — wide banner uploader for team / project / org hero sections.
 *
 *   <CoverUpload
 *     scope="team" | "project" | "org"
 *     scopeId={id}
 *     orgId={orgId}
 *     currentUrl={team.cover_url}
 *     onUploaded={url => …}
 *   >
 *     <h1>Title</h1>
 *   </CoverUpload>
 *
 * Renders a full-width tile (default 220px tall) with the cover image as
 * the background; falls back to a soft purple→sky gradient.  Children are
 * laid out on top so callers can drop the existing hero title/badges in.
 *
 * Supports click + drag-and-drop.  10 MB cap for covers (vs 5 MB on avatars).
 */

import React, { useRef, useState } from "react";
import api, { resolveAvatarUrl } from "@/services/api";
import { tokens } from "@/components/workspace/tokens";

export type CoverScope = "team" | "project" | "org";

interface Props {
  scope: CoverScope;
  scopeId: string;
  orgId?: string;
  currentUrl?: string | null;
  height?: number | string;
  rounded?: number;
  overlay?: "soft" | "dark" | "none";
  editable?: boolean;
  onUploaded?: (url: string) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024;

const FALLBACK_GRADIENT =
  "linear-gradient(135deg, rgba(108,74,176,0.92) 0%, rgba(14,165,233,0.85) 100%)";

export const CoverUpload: React.FC<Props> = ({
  scope, scopeId, orgId, currentUrl, height = 220, rounded = 18,
  overlay = "soft", editable = true, onUploaded, children, style,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  const renderedUrl = localUrl || resolveAvatarUrl(currentUrl || undefined);

  const pick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable || busy) return;
    inputRef.current?.click();
  };

  const validateAndUpload = async (file: File | undefined | null) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("PNG, JPG, WEBP, or GIF only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Cover must be under 10 MB.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const params = new URLSearchParams();
      if (orgId) params.set("organization_id", orgId);
      const path = `/media/cover/${scope}/${scopeId}`;
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
    await validateAndUpload(e.dataTransfer.files?.[0]);
  };

  const overlayStyle: React.CSSProperties =
    overlay === "none"
      ? {}
      : overlay === "dark"
        ? { background: "linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.55) 100%)" }
        : { background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 100%)" };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: "relative", width: "100%", height, borderRadius: rounded, overflow: "hidden",
        background: renderedUrl ? `url(${renderedUrl}) center/cover no-repeat` : FALLBACK_GRADIENT,
        boxShadow: dropping
          ? `inset 0 0 0 2px ${tokens.PURPLE}, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transition: "box-shadow 120ms ease",
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...overlayStyle }} />
      <div style={{ position: "relative", height: "100%", padding: 24, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {children}
      </div>

      {editable && (
        <button
          type="button"
          onClick={pick}
          style={{
            position: "absolute", top: 14, right: 14,
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 9999,
            background: hover || dropping ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)",
            color: hover || dropping ? "white" : tokens.INK,
            border: `1px solid ${tokens.SLATE_200}`,
            fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
            cursor: "pointer", boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
            transition: "background 120ms ease, color 120ms ease",
          }}
          aria-label="Change cover image"
        >
          {busy ? "Uploading…" : dropping ? "Drop to upload" : renderedUrl ? "Change cover" : "Add cover"}
        </button>
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
          position: "absolute", left: 14, bottom: 14,
          fontSize: 12, color: tokens.RED, background: "white",
          border: `1px solid ${tokens.RED}33`, borderRadius: 8, padding: "6px 10px",
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

export default CoverUpload;
