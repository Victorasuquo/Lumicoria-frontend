/**
 * Vercel Edge Function — server-side OG meta tags for blog posts.
 *
 * Why this exists:
 *   The Lumicoria frontend is a Vite SPA. Crawlers (LinkedIn, Facebook,
 *   Slack, iMessage previewer) that don't execute JS only ever see the
 *   static index.html, which contains the site-wide default OG tags.
 *   That means every blog-post share renders as "Lumicoria AI — AI Agent
 *   Universe" with the generic logo, instead of the actual post's title +
 *   cover image.
 *
 *   This function runs at the edge BEFORE the SPA loads. For requests
 *   matching /blog/:slug it fetches the post from the backend, takes
 *   the site's index.html, and rewrites the meta tags with the post's
 *   real title, excerpt, and cover image. Returns the modified HTML.
 *
 *   Humans see the same React app as before (the meta swap happens in
 *   the initial HTML response — the React hydration just keeps it).
 *   Crawlers get correct previews. No SSR for the rest of the app.
 *
 * Wired in via vercel.json:
 *   {
 *     "rewrites": [
 *       { "source": "/blog/:slug", "destination": "/api/blog-meta?slug=:slug" }
 *     ]
 *   }
 */

import type { Request } from "@vercel/node";

export const config = { runtime: "edge" };

const SITE_URL = "https://lumicoria.ai";
const API_URL = "https://api.lumicoria.ai/api/v1";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/lumicoria-og.png`;

interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  cover_image_url?: string;
  author_name?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  created_at?: string;
}

function escape(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolute(url: string | undefined | null): string {
  if (!url) return DEFAULT_OG_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function truncate(str: string, max: number): string {
  const t = (str || "").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

function replaceMeta(html: string, selector: RegExp, content: string): string {
  return html.replace(selector, (full) =>
    full.replace(/content="[^"]*"/, `content="${escape(content)}"`),
  );
}

function setTitle(html: string, title: string): string {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
}

function setOrInsert(html: string, regex: RegExp, fallbackTag: string): string {
  if (regex.test(html)) return html;
  return html.replace("</head>", `  ${fallbackTag}\n  </head>`);
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || url.pathname.split("/").pop();

  if (!slug) {
    return Response.redirect(`${SITE_URL}/blog`, 302);
  }

  // 1. Fetch the post from the backend.
  let post: BlogPost | null = null;
  try {
    const r = await fetch(`${API_URL}/blog/${slug}`, {
      headers: { "Accept": "application/json" },
      cf: { cacheTtl: 60, cacheEverything: true } as any,
    });
    if (r.ok) post = (await r.json()) as BlogPost;
  } catch {
    /* fall through — we'll serve the default index.html */
  }

  // 2. Fetch the site's base index.html so we get the same React app shell.
  let html: string;
  try {
    const shellResp = await fetch(`${SITE_URL}/index.html`, {
      cf: { cacheTtl: 30 } as any,
    });
    html = await shellResp.text();
  } catch {
    // If we can't fetch the shell, redirect the client to the live URL —
    // they'll get the SPA via the normal path (no Edge intercept).
    return Response.redirect(`${SITE_URL}/blog/${slug}?_=${Date.now()}`, 302);
  }

  // 3. If we got post data, inject per-post meta. Otherwise just serve the shell.
  if (post) {
    const fullTitle = post.title ? `${post.title} — Lumicoria AI` : "Lumicoria AI";
    const seoTitle = truncate(post.title || "Lumicoria AI", 60);
    const description = truncate(
      post.excerpt || post.subtitle || "Read the latest from Lumicoria AI — the AI Agent Universe.",
      155,
    );
    const ogDescription = truncate(
      post.excerpt || post.subtitle || description,
      125,
    );
    const image = absolute(post.cover_image_url);
    const canonical = `${SITE_URL}/blog/${post.slug}`;

    html = setTitle(html, fullTitle);
    html = replaceMeta(html, /<meta\s+name="description"[^>]*>/, description);
    html = replaceMeta(html, /<meta\s+name="keywords"[^>]*>/, [post.category, ...(post.tags || [])].filter(Boolean).join(", "));
    html = replaceMeta(html, /<meta\s+property="og:title"[^>]*>/, seoTitle);
    html = replaceMeta(html, /<meta\s+property="og:description"[^>]*>/, ogDescription);
    html = replaceMeta(html, /<meta\s+property="og:image"[^>]*>/, image);
    html = replaceMeta(html, /<meta\s+property="og:image:alt"[^>]*>/, post.title || "Lumicoria AI");
    html = replaceMeta(html, /<meta\s+property="og:url"[^>]*>/, canonical);
    html = replaceMeta(html, /<meta\s+property="og:type"[^>]*>/, "article");
    html = replaceMeta(html, /<meta\s+name="twitter:title"[^>]*>/, seoTitle);
    html = replaceMeta(html, /<meta\s+name="twitter:description"[^>]*>/, ogDescription);
    html = replaceMeta(html, /<meta\s+name="twitter:image"[^>]*>/, image);
    html = replaceMeta(html, /<meta\s+name="twitter:image:alt"[^>]*>/, post.title || "Lumicoria AI");

    // Canonical link
    html = html.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);

    // Insert article-specific JSON-LD before </head>
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": ogDescription,
      "image": image,
      "url": canonical,
      "datePublished": post.published_at || post.created_at,
      "dateModified": post.published_at || post.created_at,
      "author": {
        "@type": post.author_name ? "Person" : "Organization",
        "name": post.author_name || "Lumicoria AI",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Lumicoria AI",
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/icon-512.png`,
        },
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonical,
      },
    };
    html = html.replace(
      "</head>",
      `  <script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>\n  </head>`,
    );
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Cache at the edge for 60s — fresh enough for new posts, fast enough for crawlers.
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
