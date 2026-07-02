/**
 * JitsiEmbed — drops a Jitsi Meet iframe into the page and wires its
 * External API event stream into React callbacks.
 *
 * Self-hosted at meet.lumicoria.ai by default; the `domain` prop always
 * comes from the backend (`huddle.jitsi_domain`) so a single env var
 * controls every client.
 *
 * The component applies per-org branding via interfaceConfigOverwrite —
 * the Jitsi watermark is replaced with the org's logo, the app name is
 * customised, and primary/accent colors override Jitsi's defaults.
 *
 * The toolbar is host-aware: moderators get destructive controls (mute
 * everyone, security/lobby) that guests don't see.
 */

import React, { useEffect, useRef } from "react";

export interface JitsiBranding {
  app_name?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  watermark_link?: string | null;
  welcome_message?: string | null;
}

interface JitsiUser {
  displayName?: string;
  email?: string;
  avatarURL?: string;
}

interface JitsiEmbedProps {
  /** Room name — must be unique per meeting. */
  roomName: string;
  /**
   * Jitsi server. ALWAYS provided by the backend (huddle.jitsi_domain).
   * No client-side fallback — the backend defaults to meet.lumicoria.ai.
   */
  domain: string;
  /** Local participant identity. */
  user?: JitsiUser;
  /** JWT — required for self-hosted Jitsi. */
  jwt?: string;
  /** Per-org branding (app name, logo, colors). */
  branding?: JitsiBranding;
  /** True when this user is the host — controls the toolbar set. */
  isHost?: boolean;
  /** Subject line shown at the top of the room. */
  subject?: string;
  /** Pre-mute mic on join. */
  startWithAudioMuted?: boolean;
  /** Pre-mute cam on join. */
  startWithVideoMuted?: boolean;
  /** Override the toolbar set entirely. Otherwise host/guest defaults apply. */
  toolbarButtons?: string[];
  /** Show prejoin page. We default to false because we have our own lobby. */
  prejoinPageEnabled?: boolean;
  /** Enable end-to-end encryption. */
  e2ee?: boolean;

  /** Callbacks. Stable references encouraged (memoise in the parent). */
  onApiReady?: (api: any) => void;
  onJoined?: (event: { id: string; displayName: string; email?: string }) => void;
  onParticipantJoined?: (event: { id: string; displayName: string }) => void;
  onParticipantLeft?: (event: { id: string; displayName: string }) => void;
  onReadyToClose?: () => void;
  onVideoConferenceLeft?: (event: { roomName: string }) => void;
  onAudioMuteStatusChanged?: (event: { muted: boolean }) => void;
  onVideoMuteStatusChanged?: (event: { muted: boolean }) => void;
  onScreenSharingStatusChanged?: (event: { on: boolean }) => void;
  onRecordingStatusChanged?: (event: { on: boolean; mode: string }) => void;
  onPasswordRequired?: () => void;
  onErrorOccurred?: (event: any) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

const SCRIPT_ID = "lumi-jitsi-external-api";

// Host gets the full set; guests get a curated subset that hides
// destructive controls (mute-everyone, security panel, kick).
const TOOLBAR_HOST = [
  "microphone", "camera", "desktop", "fullscreen", "fodeviceselection",
  "hangup", "chat", "etherpad", "sharedvideo", "settings", "raisehand",
  "videoquality", "filmstrip", "invite", "feedback", "stats", "tileview",
  "mute-everyone", "mute-video-everyone", "security", "select-background",
  "participants-pane", "videobackgroundblur",
];
const TOOLBAR_GUEST = [
  "microphone", "camera", "desktop", "fullscreen", "fodeviceselection",
  "hangup", "chat", "raisehand", "videoquality", "filmstrip", "settings",
  "tileview", "select-background", "participants-pane", "videobackgroundblur",
];

function loadJitsiScript(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Jitsi script failed to load")));
      return;
    }
    // Jitsi's web container ALWAYS serves TLS (self-generated cert on
    // localhost, Let's Encrypt in prod). Hard-code https:// — matching
    // the parent page's protocol would send us to http://localhost:8843
    // where nothing is listening.
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Jitsi script failed to load"));
    document.head.appendChild(script);
  });
}

/**
 * Inject a single <style> tag that overrides Jitsi's CSS custom properties
 * for branding. Idempotent — re-mounts replace the tag.
 */
function applyBrandingStyles(branding: JitsiBranding | undefined) {
  const STYLE_ID = "lumi-jitsi-branding-vars";
  const existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();
  if (!branding || (!branding.primary_color && !branding.accent_color)) return;

  const primary = branding.primary_color || "#6C4AB0";
  const accent = branding.accent_color || "#5B3FA0";
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --primary-action-color: ${primary};
      --primary-action-color-hover: ${accent};
      --secondary-action-color: ${accent};
      --toolbar-button-color: #fff;
      --toolbar-background: rgba(15, 23, 42, 0.92);
      --participant-background-color: ${primary};
      --button-bg: ${primary};
      --action-color: ${primary};
    }
  `;
  document.head.appendChild(style);
}

export const JitsiEmbed: React.FC<JitsiEmbedProps> = ({
  roomName,
  domain,
  user,
  jwt,
  branding,
  isHost = false,
  subject,
  startWithAudioMuted = false,
  startWithVideoMuted = false,
  toolbarButtons,
  prejoinPageEnabled = false,
  e2ee = false,
  onApiReady,
  onJoined,
  onParticipantJoined,
  onParticipantLeft,
  onReadyToClose,
  onVideoConferenceLeft,
  onAudioMuteStatusChanged,
  onVideoMuteStatusChanged,
  onScreenSharingStatusChanged,
  onRecordingStatusChanged,
  onPasswordRequired,
  onErrorOccurred,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  if (!domain) {
    // Hard fail visibly — silent fallback masked real OAuth bugs in the past.
    throw new Error(
      "JitsiEmbed requires a `domain` prop. Pass huddle.jitsi_domain from the backend response.",
    );
  }

  useEffect(() => {
    let cancelled = false;
    let api: any;

    // Apply branding CSS before the iframe mounts so the first paint
    // shows the right colors.
    applyBrandingStyles(branding);

    loadJitsiScript(domain).then(() => {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

      const resolvedToolbar = toolbarButtons ?? (isHost ? TOOLBAR_HOST : TOOLBAR_GUEST);

      const options: any = {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: user || {},
        jwt,
        configOverwrite: {
          startWithAudioMuted,
          startWithVideoMuted,
          prejoinPageEnabled,
          enableWelcomePage: false,
          disableInviteFunctions: true,
          subject: subject || "",
          e2ee,
          // Lumicoria-branded loading + post-call screens.
          defaultLanguage: "en",
          disableProfile: false,
          disableShortcuts: false,
        },
        interfaceConfigOverwrite: {
          // Zero Jitsi branding by default.
          APP_NAME: branding?.app_name || "Lumicoria Meet",
          NATIVE_APP_NAME: branding?.app_name || "Lumicoria Meet",
          PROVIDER_NAME: branding?.app_name || "Lumicoria",
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
          SHOW_BRAND_WATERMARK: Boolean(branding?.logo_url),
          BRAND_WATERMARK_LINK: branding?.watermark_link || "https://lumicoria.ai",
          DEFAULT_LOGO_URL: branding?.logo_url || undefined,
          DEFAULT_WELCOME_PAGE_LOGO_URL: branding?.logo_url || undefined,
          // Surface area
          DEFAULT_BACKGROUND: "#0F172A",
          MOBILE_APP_PROMO: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
          TOOLBAR_BUTTONS: resolvedToolbar,
          DISPLAY_WELCOME_FOOTER: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          HIDE_INVITE_MORE_HEADER: true,
          // Disable the "feedback after call" Jitsi prompt — we collect
          // our own NPS via the post-meeting summary.
          DISABLE_FOCUS_INDICATOR: false,
          DISABLE_VIDEO_BACKGROUND: false,
          // Customise the chrome (window) tab title.
          ...(branding?.favicon_url ? { SHOW_JITSI_WATERMARK: false } : {}),
        },
      };

      // Jitsi External API defaults to https. Match the current page protocol.
      if (window.location.protocol === "http:") {
        (options as any).noSSL = true;
      }

      api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;
      onApiReady?.(api);

      api.addEventListener("videoConferenceJoined", (ev: any) => onJoined?.(ev));
      api.addEventListener("participantJoined", (ev: any) => onParticipantJoined?.(ev));
      api.addEventListener("participantLeft", (ev: any) => onParticipantLeft?.(ev));
      api.addEventListener("readyToClose", () => onReadyToClose?.());
      api.addEventListener("videoConferenceLeft", (ev: any) => onVideoConferenceLeft?.(ev));
      api.addEventListener("audioMuteStatusChanged", (ev: any) => onAudioMuteStatusChanged?.(ev));
      api.addEventListener("videoMuteStatusChanged", (ev: any) => onVideoMuteStatusChanged?.(ev));
      api.addEventListener("screenSharingStatusChanged", (ev: any) => onScreenSharingStatusChanged?.(ev));
      api.addEventListener("recordingStatusChanged", (ev: any) => onRecordingStatusChanged?.(ev));
      api.addEventListener("passwordRequired", () => onPasswordRequired?.());
      api.addEventListener("errorOccurred", (ev: any) => onErrorOccurred?.(ev));
    }).catch((err) => {
      console.error("Jitsi load failed", err);
    });

    return () => {
      cancelled = true;
      try { api?.dispose(); } catch { /* */ }
      apiRef.current = null;
    };
    // Branding goes in deps so a logo / color change forces a remount and
    // the new branding renders immediately. Callbacks are intentionally
    // omitted — they change frequently and don't need to reinitialise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    roomName, domain, jwt, isHost,
    branding?.app_name, branding?.logo_url,
    branding?.primary_color, branding?.accent_color,
  ]);

  // Update subject if it changes after mount.
  useEffect(() => {
    try { apiRef.current?.executeCommand("subject", subject || ""); } catch { /* */ }
  }, [subject]);

  // Apply a custom favicon to the embed window if branding provides one.
  useEffect(() => {
    if (!branding?.favicon_url) return;
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = branding.favicon_url;
    document.head.appendChild(link);
  }, [branding?.favicon_url]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#0F172A" }}
    />
  );
};

export default JitsiEmbed;
