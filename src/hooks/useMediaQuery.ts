/**
 * useMediaQuery — reactive CSS media-query hook.
 *
 *   const isMobile = useMediaQuery("(max-width: 767px)");
 *   const isDark = useMediaQuery("(prefers-color-scheme: dark)");
 *
 * Picks up viewport changes (rotate, resize) without forcing a render
 * tree restart.  Safe on SSR — returns `false` until mount.
 */

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const get = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setMatches((e as MediaQueryList).matches);
    // Initial sync — matchMedia can drift between render and effect.
    setMatches(mql.matches);
    // Older Safari uses addListener / removeListener.
    if ("addEventListener" in mql) mql.addEventListener("change", handler as EventListener);
    else (mql as any).addListener(handler);
    return () => {
      if ("removeEventListener" in mql) mql.removeEventListener("change", handler as EventListener);
      else (mql as any).removeListener(handler);
    };
  }, [query]);

  return matches;
}

/** Mobile: anything < 768 px (tailwind md breakpoint). */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

/** Tablet: 768-1023 px. */
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

/** Desktop: ≥ 1024 px. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** Active color scheme based on OS preference (browsers without
 *  matchMedia return "light"). */
export const usePrefersDark = () => useMediaQuery("(prefers-color-scheme: dark)");

export default useMediaQuery;
