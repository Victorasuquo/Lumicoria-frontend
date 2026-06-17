/**
 * JitsiEmbed — drops a Jitsi Meet iframe into the page and wires its
 * External API event stream into React callbacks.
 *
 * No npm dependency. The External API script is loaded once from CDN
 * (https://meet.jit.si/external_api.js) and cached for the page lifetime.
 *
 * Designed for the public meet.jit.si server (Phase 1). For self-hosted
 * (`meet.lumicoria.ai`) just swap the `domain` prop.
 */

import React, { useEffect, useRef } from "react";

interface JitsiUser {
  displayName?: string;
  email?: string;
  avatarURL?: string;
}

interface JitsiEmbedProps {
  /** Room name — must be unique per meeting. */
  roomName: string;
  /** Jitsi server. Defaults to public Jitsi. */
  domain?: string;
  /** Local participant identity. */
  user?: JitsiUser;
  /** JWT — only for self-hosted Jitsi with auth. */
  jwt?: string;
  /** Subject line shown at the top of the room. */
  subject?: string;
  /** Pre-mute mic on join. */
  startWithAudioMuted?: boolean;
  /** Pre-mute cam on join. */
  startWithVideoMuted?: boolean;
  /** Toolbar buttons whitelist — `undefined` keeps the Jitsi default set. */
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
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

const SCRIPT_ID = "lumi-jitsi-external-api";

function loadJitsiScript(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Jitsi script failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Jitsi script failed to load"));
    document.head.appendChild(script);
  });
}

export const JitsiEmbed: React.FC<JitsiEmbedProps> = ({
  roomName,
  domain = "meet.jit.si",
  user,
  jwt,
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let api: any;

    loadJitsiScript(domain).then(() => {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
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
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: "#0F172A",
          MOBILE_APP_PROMO: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
          TOOLBAR_BUTTONS: toolbarButtons,
        },
      };

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
    }).catch((err) => {
      console.error("Jitsi load failed", err);
    });

    return () => {
      cancelled = true;
      try { api?.dispose(); } catch { /* */ }
      apiRef.current = null;
    };
    // We deliberately key only on the props that require a re-mount.
    // Callbacks change frequently and don't need to reinitialise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, domain, jwt]);

  // Expose imperative controls via ref window if needed
  useEffect(() => {
    // Update subject if it changes after mount.
    try { apiRef.current?.executeCommand("subject", subject || ""); } catch { /* */ }
  }, [subject]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#0F172A" }}
    />
  );
};

export default JitsiEmbed;
