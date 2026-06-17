/**
 * <SEO> — declarative per-page SEO updater.
 *
 * Updates `<title>` and the relevant `<meta>` / `<link>` tags directly in
 * the document head on mount. On unmount the previous values are restored,
 * so navigating between pages doesn't leak stale SEO state.
 *
 * Crawlers that render JavaScript (Google, Bing) pick up the per-page
 * overrides; legacy crawlers fall back to the static defaults shipped in
 * `index.html`.
 *
 * Usage:
 *   <SEO
 *     title="Pricing"
 *     description="Per-seat plans for AI agents. Team $39, Business $79, Enterprise $129."
 *     canonical="/pricing"
 *     keywords={[...KEYWORDS.byPage.pricing, ...KEYWORDS.global]}
 *     jsonLd={pricingProductSchema}
 *   />
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  SITE,
  KEYWORDS,
  canonicalUrl,
  buildTitle,
  resolveOgImage,
  type SEOMeta,
} from "@/lib/seo";
import { trackPageView } from "@/lib/analytics";

const JSONLD_ATTR = "data-lumi-jsonld";

function setMeta(selector: string, attr: "name" | "property", attrValue: string, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  const previous = el?.getAttribute("content");
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {
    if (previous !== null && previous !== undefined) el!.setAttribute("content", previous);
  };
}

function setLink(rel: string, href: string): () => void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  const previous = el?.href;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  return () => {
    if (previous !== undefined) el!.href = previous;
  };
}

function setJsonLd(payload: Record<string, unknown> | Array<Record<string, unknown>>): () => void {
  const id = `lumi-page-jsonld-${Math.random().toString(36).slice(2, 9)}`;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.setAttribute(JSONLD_ATTR, "page");
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
  return () => { script.remove(); };
}

function setRobots(noindex?: boolean): () => void {
  return setMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
}

export const SEO: React.FC<SEOMeta> = ({
  title,
  description,
  canonical,
  ogImage,
  keywords,
  ogType = "website",
  noindex = false,
  jsonLd,
}) => {
  const loc = useLocation();
  const canonicalHref = canonicalUrl(canonical || loc.pathname);
  const fullTitle = buildTitle(title);
  const ogImg = resolveOgImage(ogImage);

  const keywordList = (
    keywords && keywords.length
      ? [...new Set([...keywords, ...KEYWORDS.global])]
      : [...KEYWORDS.global]
  ).join(", ");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = fullTitle;

    const undos: Array<() => void> = [
      setMeta('meta[name="description"]', "name", "description", description),
      setMeta('meta[name="keywords"]', "name", "keywords", keywordList),
      setLink("canonical", canonicalHref),

      // Open Graph
      setMeta('meta[property="og:type"]', "property", "og:type", ogType),
      setMeta('meta[property="og:title"]', "property", "og:title", fullTitle),
      setMeta('meta[property="og:description"]', "property", "og:description", description),
      setMeta('meta[property="og:url"]', "property", "og:url", canonicalHref),
      setMeta('meta[property="og:image"]', "property", "og:image", ogImg),
      setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", fullTitle),
      setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE.name),
      setMeta('meta[property="og:locale"]', "property", "og:locale", SITE.locale),

      // Twitter
      setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image"),
      setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle),
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", description),
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImg),
      setMeta('meta[name="twitter:site"]', "name", "twitter:site", SITE.twitterHandle),
      setMeta('meta[name="twitter:creator"]', "name", "twitter:creator", SITE.twitterHandle),

      // Robots
      setRobots(noindex),
    ];

    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const block of blocks) undos.push(setJsonLd(block));
    }

    // Track the page view in GA4 after the meta is in place.
    trackPageView(loc.pathname, fullTitle);

    return () => {
      document.title = previousTitle;
      for (const undo of undos) undo();
    };
  }, [fullTitle, description, canonicalHref, ogImg, keywordList, ogType, noindex, jsonLd, loc.pathname]);

  return null;
};

export default SEO;
