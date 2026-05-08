import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, ArrowRight, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  customerServicePublicApi,
  type PublicBranding,
  type PublicSupportArticle,
} from "@/services/api";

/**
 * Single help-center article at `/portal/:slug/help/:article_slug`.
 *
 * Anonymous, branded.  Body is rendered via react-markdown (we already
 * pre-sanitize it server-side via bleach).  Visitor can vote helpful /
 * not-helpful — counts persist server-side.
 */

const SupportPortalArticle: React.FC = () => {
  const { slug = "", article_slug = "" } = useParams<{ slug: string; article_slug: string }>();

  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [article, setArticle] = useState<PublicSupportArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!slug || !article_slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    customerServicePublicApi
      .getHelpArticle(slug, article_slug)
      .then(({ branding, article }) => {
        if (cancelled) return;
        setBranding(branding);
        setArticle(article);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, article_slug]);

  const handleVote = async (helpful: boolean) => {
    if (voted) return;
    try {
      await customerServicePublicApi.voteHelpArticle(slug, article_slug, helpful);
      setVoted(helpful ? "up" : "down");
    } catch {
      // Silently swallow — voting is best-effort.
    }
  };

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
  if (notFound || !branding || !article) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={32} className="text-zinc-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-zinc-900 mb-2">Article not found</h1>
            <p className="text-sm text-zinc-500 mb-4">
              This help article may have been moved or unpublished.
            </p>
            {slug && (
              <Link to={`/portal/${slug}/help`} className="text-sm text-indigo-600 hover:underline">
                ← Back to help center
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="text-white" style={heroStyle}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <Link
            to={`/portal/${slug}/help`}
            className="text-sm text-white/90 hover:text-white inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Help Center</span>
          </Link>
          <Link to={`/portal/${slug}`} className="text-sm text-white/80 hover:text-white">
            {branding.display_name}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {article.category && (
              <p
                className="text-[10px] uppercase tracking-wide font-semibold mb-2"
                style={{ color: branding.primary_color }}
              >
                {article.category.replace(/_/g, " ")}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
              {article.title}
            </h1>
            {article.summary && (
              <p className="text-base text-zinc-600 mb-6">{article.summary}</p>
            )}

            <div className="prose prose-sm max-w-none prose-zinc prose-headings:font-semibold prose-a:no-underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
            </div>

            {/* Helpful? */}
            <div className="mt-10 pt-6 border-t border-zinc-100">
              <p className="text-sm font-medium text-zinc-900 mb-3">Was this helpful?</p>
              {voted ? (
                <p className="text-xs text-zinc-500">
                  Thanks for your feedback!{" "}
                  {voted === "down" && (
                    <Link to={`/portal/${slug}`} className="underline" style={{ color: branding.primary_color }}>
                      Open a ticket →
                    </Link>
                  )}
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
                  >
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs hover:border-red-200 hover:bg-red-50/50 hover:text-red-700"
                  >
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Still stuck CTA */}
          <div className="mt-8 bg-white border border-zinc-100 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">Didn't find what you were looking for?</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Open a ticket and our team will reply within {branding.sla_response_minutes} minutes.
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
        </article>
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

export default SupportPortalArticle;
