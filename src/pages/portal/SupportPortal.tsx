import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, ShieldCheck, Sparkles, Clock, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";
import { customerServicePublicApi, type PublicBranding } from "@/services/api";

/**
 * Public, unauthenticated support portal at `/portal/:slug`.
 *
 * Tenant-branded — colors, logo, hero, categories all come from
 * /public/portal/{slug}/branding.  Form posts to
 * /public/portal/{slug}/tickets and redirects to the status page.
 *
 * Defensive design:
 *   - Strict client-side validation (subject + email + body required).
 *   - Length caps mirror the server's Pydantic caps so we fail fast.
 *   - "Powered by Lumicoria Agent" footer (subtle).
 *   - Captcha placeholder ready when the org enables it server-side.
 */

const PRIORITIES: Array<"High" | "Medium" | "Low"> = ["High", "Medium", "Low"];

const MAX = {
  subject: 500,
  body: 10_000,
  name: 200,
  email: 320,
};

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const SupportPortal: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    customerServicePublicApi
      .getBranding(slug)
      .then((b) => {
        if (cancelled) return;
        setBranding(b);
        if (b.public_categories?.length) setCategory(b.public_categories[0]);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError(err?.response?.data?.detail || "Could not load support portal.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const validate = (): string | null => {
    if (!name.trim()) return "Please share your name so we know who to reply to.";
    if (!email.trim() || !isValidEmail(email)) return "Please enter a valid email address.";
    if (email.length > MAX.email) return "Email is too long.";
    if (!subject.trim()) return "Please enter a short subject for your inquiry.";
    if (subject.length > MAX.subject) return "Subject is too long.";
    if (!body.trim()) return "Please describe your inquiry.";
    if (body.length > MAX.body) return "Your message is too long.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branding) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await customerServicePublicApi.createTicket(slug, {
        customer_email: email.trim().toLowerCase(),
        customer_name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        priority,
        category: category || undefined,
      });
      navigate(
        `/portal/${slug}/status/${result.ticket_id}?email=${encodeURIComponent(email.trim().toLowerCase())}&new=1`,
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("Too many submissions from this device. Please try again in a few minutes.");
      } else {
        setError(err?.response?.data?.detail || "We couldn't submit your request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading / not-found shells ──────────────────────────────────────
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
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Portal not found</h1>
          <p className="text-sm text-zinc-500">
            The support portal at <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">/portal/{slug}</code> doesn't exist or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  const heroStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.accent_color} 100%)`,
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Hero */}
      <header className="text-white" style={heroStyle}>
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-4"
          >
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={branding.display_name} className="h-10 w-10 rounded-lg bg-white/10 object-contain p-1.5" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
            )}
            <span className="text-sm font-medium opacity-90">{branding.display_name}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
          >
            {branding.hero_copy?.split("\n")[0] || "How can we help?"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base opacity-90 max-w-xl"
          >
            {branding.hero_copy?.split("\n").slice(1).join(" ") ||
              "Submit your question and our team will get back to you shortly."}
          </motion.p>
        </div>
      </header>

      {/* Trust strip */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
          <Link
            to={`/portal/${slug}/help`}
            className="inline-flex items-center gap-1.5 font-medium hover:text-zinc-900"
            style={{ color: branding.primary_color }}
          >
            <BookOpen size={13} />
            Browse Help Center
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="opacity-60" />
            We typically reply within <strong className="text-zinc-700">{branding.sla_response_minutes} min</strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="opacity-60" />
            Your message is private and only seen by our support team
          </span>
          {branding.support_email && (
            <span className="inline-flex items-center gap-1.5">
              Email us directly: <a href={`mailto:${branding.support_email}`} className="text-zinc-700 hover:underline">{branding.support_email}</a>
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Your name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={MAX.name}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ outlineColor: branding.primary_color }}
                  placeholder="e.g. Alex Chen"
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={MAX.email}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  placeholder="alex@company.com"
                />
              </Field>
            </div>

            <Field label="Subject" required>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={MAX.subject}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                placeholder="What's this about?"
              />
            </Field>

            {branding.public_categories && branding.public_categories.length > 0 && (
              <Field label="Category">
                <div className="flex flex-wrap gap-2">
                  {branding.public_categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        category === c
                          ? "border-transparent text-white"
                          : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                      }`}
                      style={category === c ? { backgroundColor: branding.primary_color } : undefined}
                    >
                      {c.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Priority">
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      priority === p
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Message" required>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={MAX.body}
                rows={6}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y"
                placeholder="Tell us what's going on. Include any error messages, what you were doing, and your environment."
              />
              <p className="text-[10px] text-zinc-400 mt-1 text-right">
                {body.length.toLocaleString()} / {MAX.body.toLocaleString()}
              </p>
            </Field>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-zinc-400">
                By submitting, you agree to {branding.display_name} contacting you about this inquiry.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
                style={{ backgroundColor: branding.primary_color }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </motion.form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 size={12} className="opacity-50" />
            Secure submission · TLS encrypted
          </span>
          <a href="https://lumicoria.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 transition-colors">
            Powered by Lumicoria Agent
          </a>
        </div>
      </footer>
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label className="block">
    <span className="text-xs font-medium text-zinc-700 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    {children}
  </label>
);

export default SupportPortal;
