/**
 * Google Analytics 4 helpers.
 *
 * gtag is loaded statically in index.html via the GA snippet. This file
 * exposes typed helpers so application code never touches `window.gtag`
 * directly and so unconfigured tracking IDs silently no-op in dev.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID: string | undefined = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;

const enabled = (): boolean =>
  typeof window !== "undefined" &&
  !!GA_ID &&
  !GA_ID.includes("XXXXXXXX") &&
  typeof window.gtag === "function";

/** Fire a page_view event. Call on every client-side route change. */
export const trackPageView = (path: string, title?: string): void => {
  if (!enabled()) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: `${window.location.origin}${path}`,
  });
};

/** Fire an arbitrary GA4 event. */
export const trackEvent = (
  name: string,
  params?: Record<string, unknown>,
): void => {
  if (!enabled()) return;
  window.gtag("event", name, params || {});
};

/** Set a user property — e.g. plan tier, org id (no PII please). */
export const setUserProperty = (
  key: string,
  value: string | number | boolean,
): void => {
  if (!enabled()) return;
  window.gtag("set", "user_properties", { [key]: value });
};
