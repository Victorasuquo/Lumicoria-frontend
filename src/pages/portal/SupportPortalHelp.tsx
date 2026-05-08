import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Search, BookOpen, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import {
  customerServicePublicApi,
  type PublicBranding,
  type PublicSupportArticle,
} from "@/services/api";

/**
 * Public help center listing at `/portal/:slug/help`.
 *
 * Anonymous, branded, lists `published=true` articles in the same
 * tenant gradient as the support form.  No auth, no tracking — just
 * documentation customers can find and read before opening a ticket.
 */

const SupportPortalHelp: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [articles, setArticles] = useState<PublicSupportArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    customerServicePublicApi
      .listHelpArticles(slug)
      .then(({ branding, articles }) => {
        if (cancelled) return;
        setBranding(branding);
        setArticles(articles);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [articles, search]);

  const featured = filtered.filter((a) => a.featured);
  const others = filtered.filter((a) => !a.featured);

  const heroStyle: React.CSSProperties = useMemo(() => {
    if (!branding) return {};
    return { backgroundImage: `linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.accent_color} 100%)` };
  }, [branding]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
      </div>
    );
  }
  if (notFound || !branding) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle size={32} className="text-zinc-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Help center not found</h1>
          <p className="text-sm text-zinc-500">
            No portal at <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">/portal/{slug}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="text-white" style={heroStyle}>
        <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          <Link
            to={`/portal/${slug}`}
            className="text-sm text-white/80 hover:text-white inline-flex items-center gap-1.5 mb-3"
          >
            <ArrowLeft size={14} />
            <span>Back to {branding.display_name}</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Help Center</h1>
          <p className="text-base opacity-90">
            Common questions and step-by-step guides for {branding.display_name}.
          </p>

          <div className="mt-6 relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="w-full rounded-lg border-0 bg-white/95 pl-10 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {filtered.length === 0 ? (
            <div className="bg-white border border-zinc-100 rounded-2xl p-10 text-center">
              <BookOpen size={28} className="text-zinc-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-700">No articles yet</p>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-md mx-auto">
                Our team is putting together help content. In the meantime,{" "}
                <Link to={`/portal/${slug}`} className="underline" style={{ color: branding.primary_color }}>
                  open a ticket
                </Link>{" "}
                and we'll reply directly.
              </p>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">Featured</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {featured.map((a, i) => (
                      <ArticleCard key={a.id} article={a} slug={slug} branding={branding} index={i} accentBg />
                    ))}
                  </div>
                </section>
              )}
              {others.length > 0 && (
                <section>
                  {featured.length > 0 && (
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">All articles</h2>
                  )}
                  <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                    {others.map((a, i) => (
                      <ArticleListItem key={a.id} article={a} slug={slug} branding={branding} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <div className="mt-8 bg-white border border-zinc-100 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">Still need help?</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Open a ticket and our team will get back to you within {branding.sla_response_minutes} minutes.
              </p>
            </div>
            <Link
              to={`/portal/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white shrink-0"
              style={{ backgroundColor: branding.primary_color }}
            >
              Submit request <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-zinc-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-right text-[11px] text-zinc-400">
          <a href="https://lumicoria.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 transition-colors">
            Powered by Lumicoria Agent
          </a>
        </div>
      </footer>
    </div>
  );
};

const ArticleCard: React.FC<{
  article: PublicSupportArticle;
  slug: string;
  branding: PublicBranding;
  index: number;
  accentBg?: boolean;
}> = ({ article, slug, branding, index, accentBg }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
  >
    <Link
      to={`/portal/${slug}/help/${article.slug}`}
      className={`block rounded-2xl border p-4 hover:shadow-sm transition-shadow ${
        accentBg ? "border-zinc-100 bg-white" : "border-zinc-100 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {article.category && (
          <span className="text-[10px] uppercase tracking-wide" style={{ color: branding.primary_color }}>
            {article.category.replace(/_/g, " ")}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 mb-1.5 line-clamp-2">{article.title}</h3>
      {article.summary && (
        <p className="text-xs text-zinc-500 line-clamp-2">{article.summary}</p>
      )}
    </Link>
  </motion.div>
);

const ArticleListItem: React.FC<{
  article: PublicSupportArticle;
  slug: string;
  branding: PublicBranding;
  index: number;
}> = ({ article, slug, branding, index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.02 }}
  >
    <Link
      to={`/portal/${slug}/help/${article.slug}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/50 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{article.title}</p>
        {article.summary && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{article.summary}</p>
        )}
      </div>
      {article.category && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 shrink-0 hidden sm:inline"
        >
          {article.category.replace(/_/g, " ")}
        </span>
      )}
      <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-500 shrink-0" />
    </Link>
  </motion.div>
);

export default SupportPortalHelp;
