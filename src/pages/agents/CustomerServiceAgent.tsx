import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Headphones, Send, Clock, CheckCircle2, AlertCircle, MessageSquare,
  BarChart3, Users, Zap, Star, Filter, Loader2, Sparkles, RefreshCw,
  Plus, Palette, Copy, FileText, Bot, Download, BookOpen, Save,
  Edit3, Trash2, ExternalLink, Globe,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { toast } from "@/hooks/use-toast";
import {
  customerServiceApi,
  type CustomerServiceAnalytics,
  type CustomerServiceTemplate,
  type CustomerServiceTimeRange,
  type SupportTicket,
  type TicketReply,
  type OrgBranding,
  type SupportArticle,
} from "@/services/api";

const PRIORITY_BADGE: Record<string, string> = {
  High: "border-red-200 text-red-600 bg-red-50",
  Medium: "border-amber-200 text-amber-600 bg-amber-50",
  Low: "border-gray-200 text-gray-500 bg-gray-50",
};
const STATUS_BADGE: Record<string, string> = {
  Open: "border-blue-200 text-blue-600 bg-blue-50",
  "In Progress": "border-amber-200 text-amber-600 bg-amber-50",
  Resolved: "border-emerald-200 text-emerald-600 bg-emerald-50",
  Closed: "border-gray-200 text-gray-500 bg-gray-50",
  Cancelled: "border-gray-200 text-gray-400 bg-gray-50",
};

const TIME_RANGES: CustomerServiceTimeRange[] = ["1d", "7d", "30d", "90d", "1y"];
const CATEGORY_PALETTE = [
  "bg-blue-400", "bg-amber-400", "bg-violet-400",
  "bg-emerald-400", "bg-red-400", "bg-pink-400", "bg-cyan-400",
];

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

const CustomerServiceAgent: React.FC = () => {
  // ─── Tickets ─────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ─── Composer ────────────────────────────────────────────────────────
  const [reply, setReply] = useState("");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [aiCitations, setAiCitations] = useState<Array<{ title?: string; document_id?: string; page_number?: number; source?: string }>>([]);
  const [usedTemplateId, setUsedTemplateId] = useState<string | null>(null);

  // ─── Analytics ───────────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState<CustomerServiceTimeRange>("7d");
  const [analytics, setAnalytics] = useState<CustomerServiceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ─── Templates ───────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<CustomerServiceTemplate[]>([]);

  // ─── Branding ────────────────────────────────────────────────────────
  const [branding, setBranding] = useState<OrgBranding | null>(null);

  // ─── Help-center articles ────────────────────────────────────────────
  const [articles, setArticles] = useState<SupportArticle[]>([]);

  // ─── Modals ──────────────────────────────────────────────────────────
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);

  // FAQ modal local state
  const [faqTopic, setFaqTopic] = useState("");
  const [faqAudience, setFaqAudience] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqOutput, setFaqOutput] = useState("");

  // Template modal local state
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("technical_support");
  const [tplBody, setTplBody] = useState("");
  const [tplTone, setTplTone] = useState("professional_friendly");
  const [tplLoading, setTplLoading] = useState(false);

  // New ticket modal state
  const [ntSubject, setNtSubject] = useState("");
  const [ntBody, setNtBody] = useState("");
  const [ntEmail, setNtEmail] = useState("");
  const [ntName, setNtName] = useState("");
  const [ntPriority, setNtPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [ntCategory, setNtCategory] = useState("");
  const [ntLoading, setNtLoading] = useState(false);

  // Branding modal state — mirrors live branding for editing
  const [bdSlug, setBdSlug] = useState("");
  const [bdName, setBdName] = useState("");
  const [bdLogoUrl, setBdLogoUrl] = useState("");
  const [bdHeroCopy, setBdHeroCopy] = useState("");
  const [bdPrimary, setBdPrimary] = useState("#4f46e5");
  const [bdAccent, setBdAccent] = useState("#6366f1");
  const [bdSlaMin, setBdSlaMin] = useState(60);
  const [bdSupportEmail, setBdSupportEmail] = useState("");
  const [bdCategories, setBdCategories] = useState<string>("");
  const [bdLoading, setBdLoading] = useState(false);

  // ─── Loaders ─────────────────────────────────────────────────────────
  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await customerServiceApi.listTickets({
        status: statusFilter || undefined,
        limit: 50,
      });
      setTickets(res.tickets || []);
    } catch (err: any) {
      console.error("loadTickets failed", err);
      // Permission denied is the most common failure here — surface
      // gracefully without burying the user in toasts on every page-load.
      if (err?.response?.status !== 403) {
        toast({
          title: "Failed to load tickets",
          description: err?.response?.data?.detail || err?.message || "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setTicketsLoading(false);
    }
  }, [statusFilter]);

  const loadTicketDetail = useCallback(async (id: string) => {
    setTicketDetailLoading(true);
    try {
      const t = await customerServiceApi.getTicket(id);
      setActiveTicket(t);
    } catch (err: any) {
      toast({
        title: "Failed to load ticket",
        description: err?.response?.data?.detail || err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTicketDetailLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async (range: CustomerServiceTimeRange) => {
    setAnalyticsLoading(true);
    try {
      const data = await customerServiceApi.getAnalytics(range);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await customerServiceApi.listTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  }, []);

  const loadBranding = useCallback(async () => {
    try {
      const b = await customerServiceApi.getBranding();
      setBranding(b);
    } catch (err) {
      console.error("Failed to load branding", err);
    }
  }, []);

  const loadArticles = useCallback(async () => {
    try {
      const data = await customerServiceApi.listArticles({ limit: 50 });
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to load articles", err);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { loadAnalytics(timeRange); }, [timeRange, loadAnalytics]);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);
  useEffect(() => { loadBranding(); }, [loadBranding]);
  useEffect(() => { loadArticles(); }, [loadArticles]);

  // Auto-load detail for selected ticket
  useEffect(() => {
    if (!selectedTicketId) {
      setActiveTicket(null);
      setReply("");
      setAiCitations([]);
      setUsedTemplateId(null);
      return;
    }
    loadTicketDetail(selectedTicketId);
    setReply("");
    setAiCitations([]);
    setUsedTemplateId(null);
  }, [selectedTicketId, loadTicketDetail]);

  // ─── Stats / sentiment / categories from analytics ───────────────────
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "Open").length;
    const responseSec = analytics?.average_response_time ?? null;
    const responseLabel =
      responseSec === null ? "—" :
      responseSec >= 60 ? `${(responseSec / 60).toFixed(1)}m` : `${responseSec.toFixed(1)}s`;
    const satisfaction = analytics ? `${Math.round((analytics.satisfaction_rate ?? 0) * 100)}%` : "—";
    return [
      { label: "Open Tickets", value: open.toString(), icon: AlertCircle, color: "text-amber-500" },
      { label: "Avg Response", value: responseLabel, icon: Clock, color: "text-blue-500" },
      { label: "Total Requests", value: analytics?.total_requests?.toLocaleString() ?? "—", icon: CheckCircle2, color: "text-emerald-500" },
      { label: "Satisfaction", value: satisfaction, icon: Star, color: "text-violet-500" },
    ];
  }, [tickets, analytics]);

  const sentimentBreakdown = useMemo(() => {
    const t = analytics?.feedback_trends;
    if (!t) return [];
    return [
      { label: "Positive", value: Math.round(t.positive * 100), color: "bg-emerald-400" },
      { label: "Neutral", value: Math.round(t.neutral * 100), color: "bg-gray-300" },
      { label: "Negative", value: Math.round(t.negative * 100), color: "bg-red-400" },
    ];
  }, [analytics]);

  const ticketCategories = useMemo(() => {
    const issues = analytics?.common_issues ?? [];
    return issues.map((issue, i) => ({
      label: issue.issue,
      count: issue.count,
      color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    }));
  }, [analytics]);

  const quickReplies = useMemo(
    () => templates.map((t) => ({ id: t.id, label: t.name, text: t.body, description: t.description })),
    [templates],
  );

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleSelectTemplate = useCallback((tpl: { id: string; text: string }) => {
    setReply(tpl.text);
    setUsedTemplateId(tpl.id);
    setAiCitations([]);
    customerServiceApi.markTemplateUsed(tpl.id).catch(() => undefined);
  }, []);

  const handleAiDraft = useCallback(async () => {
    if (!activeTicket) return;
    setAiDraftLoading(true);
    setAiCitations([]);
    try {
      const resp = await customerServiceApi.aiDraft(activeTicket.id);
      setReply(resp.draft || "");
      setAiCitations(resp.citations || []);
      setUsedTemplateId(resp.matching_template_id || null);
      toast({
        title: "Draft generated",
        description: resp.model_used ? `Model: ${resp.model_used}` : undefined,
      });
    } catch (err: any) {
      toast({
        title: "Draft failed",
        description: err?.response?.data?.detail || err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setAiDraftLoading(false);
    }
  }, [activeTicket]);

  const handleSendReply = useCallback(async () => {
    if (!activeTicket || !reply.trim()) {
      toast({ title: "Nothing to send", description: "Type a reply or generate a draft first.", variant: "destructive" });
      return;
    }
    setSendLoading(true);
    try {
      await customerServiceApi.replyToTicket(activeTicket.id, {
        body: reply,
        template_id: usedTemplateId || undefined,
        transition_status: "In Progress",
      });
      toast({ title: "Reply sent", description: `Reply on ${activeTicket.id} dispatched.` });
      setReply("");
      setAiCitations([]);
      setUsedTemplateId(null);
      // Refresh detail + list so the conversation history + status update.
      loadTicketDetail(activeTicket.id);
      loadTickets();
    } catch (err: any) {
      toast({
        title: "Send failed",
        description: err?.response?.data?.detail || err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  }, [activeTicket, reply, usedTemplateId, loadTicketDetail, loadTickets]);

  const handleResolve = useCallback(async () => {
    if (!activeTicket) return;
    try {
      await customerServiceApi.updateTicket(activeTicket.id, { status: "Resolved" });
      toast({ title: "Ticket resolved" });
      loadTicketDetail(activeTicket.id);
      loadTickets();
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
    }
  }, [activeTicket, loadTicketDetail, loadTickets]);

  const handleCreateTicket = useCallback(async () => {
    if (!ntSubject.trim() || !ntBody.trim() || !ntEmail.trim()) return;
    setNtLoading(true);
    try {
      const t = await customerServiceApi.createTicket({
        subject: ntSubject,
        body: ntBody,
        customer_email: ntEmail,
        customer_name: ntName || undefined,
        priority: ntPriority,
        category: ntCategory || undefined,
        channel: "manual",
      });
      toast({ title: "Ticket created", description: t.id });
      setNewTicketOpen(false);
      setNtSubject(""); setNtBody(""); setNtEmail(""); setNtName(""); setNtPriority("Medium"); setNtCategory("");
      setSelectedTicketId(t.id);
      loadTickets();
    } catch (err: any) {
      toast({ title: "Create failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
    } finally {
      setNtLoading(false);
    }
  }, [ntSubject, ntBody, ntEmail, ntName, ntPriority, ntCategory, loadTickets]);

  const handleGenerateFaq = useCallback(async () => {
    if (!faqTopic.trim()) return;
    setFaqLoading(true);
    setFaqOutput("");
    try {
      const resp = await customerServiceApi.generateFaq({
        content: `Generate FAQ entries for: ${faqTopic}`,
        topic: faqTopic,
        target_audience: faqAudience || undefined,
      });
      const txt =
        (resp.response && (resp.response.faq || resp.response.response || resp.response.content)) ||
        resp.raw_response ||
        "";
      setFaqOutput(typeof txt === "string" ? txt : JSON.stringify(txt, null, 2));
      toast({ title: "FAQ ready" });
    } catch (err: any) {
      toast({ title: "FAQ generation failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
    } finally {
      setFaqLoading(false);
    }
  }, [faqTopic, faqAudience]);

  const handleCopyText = useCallback(async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  }, []);

  const handleDownloadMarkdown = useCallback((filename: string, text: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const [faqSaveLoading, setFaqSaveLoading] = useState(false);
  const handleSaveFaqToKb = useCallback(async (publishAsArticle: boolean) => {
    if (!faqOutput.trim() || !faqTopic.trim()) return;
    setFaqSaveLoading(true);
    try {
      const result = await customerServiceApi.saveFaqToKnowledgeBase({
        topic: faqTopic,
        content: faqOutput,
        target_audience: faqAudience || undefined,
        publish_as_article: publishAsArticle,
        article_category: publishAsArticle ? "faq" : undefined,
      });
      toast({
        title: publishAsArticle
          ? "FAQ saved to KB and published as article"
          : "FAQ saved to knowledge base",
        description: publishAsArticle && result.article
          ? `Live at /portal/${branding?.slug || "..."}/help/${result.article.slug}`
          : "Future AI Drafts will cite this content.",
      });
      // If we created an article, refresh the article list (admin side).
      if (publishAsArticle) loadArticles();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    } finally {
      setFaqSaveLoading(false);
    }
  }, [faqOutput, faqTopic, faqAudience, branding]);

  const handleSaveTplFromDraft = useCallback(async () => {
    if (!tplBody.trim() || !tplCategory.trim()) return;
    setTplLoading(true);
    try {
      await customerServiceApi.createTemplate({
        name: tplName.trim() || `${tplCategory.replace(/_/g, " ")} (auto)`,
        category: tplCategory,
        body: tplBody,
        tone: tplTone,
      });
      toast({ title: "Template saved" });
      loadTemplates();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.response?.data?.detail || err?.message,
        variant: "destructive",
      });
    } finally {
      setTplLoading(false);
    }
  }, [tplName, tplCategory, tplBody, tplTone, loadTemplates]);

  const handleCreateTemplateRow = useCallback(async () => {
    if (!tplName.trim() || !tplBody.trim() || !tplCategory.trim()) return;
    setTplLoading(true);
    try {
      await customerServiceApi.createTemplate({
        name: tplName,
        category: tplCategory,
        body: tplBody,
        tone: tplTone,
      });
      toast({ title: "Template saved" });
      setTplOpen(false);
      setTplName(""); setTplBody(""); setTplCategory("technical_support"); setTplTone("professional_friendly");
      loadTemplates();
    } catch (err: any) {
      toast({ title: "Template create failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
    } finally {
      setTplLoading(false);
    }
  }, [tplName, tplBody, tplCategory, tplTone, loadTemplates]);

  const openBrandingModal = useCallback(() => {
    if (branding) {
      setBdSlug(branding.slug || "");
      setBdName(branding.display_name || "");
      setBdLogoUrl(branding.logo_url || "");
      setBdHeroCopy(branding.hero_copy || "");
      setBdPrimary(branding.primary_color || "#4f46e5");
      setBdAccent(branding.accent_color || "#6366f1");
      setBdSlaMin(branding.sla_response_minutes || 60);
      setBdSupportEmail(branding.support_email || "");
      setBdCategories((branding.public_categories || []).join(", "));
    }
    setBrandingOpen(true);
  }, [branding]);

  const handleSaveBranding = useCallback(async () => {
    setBdLoading(true);
    try {
      const cats = bdCategories.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const updated = await customerServiceApi.updateBranding({
        slug: bdSlug.trim().toLowerCase() || undefined,
        display_name: bdName,
        logo_url: bdLogoUrl || null,
        hero_copy: bdHeroCopy || null,
        primary_color: bdPrimary,
        accent_color: bdAccent,
        sla_response_minutes: bdSlaMin,
        support_email: bdSupportEmail || null,
        public_categories: cats,
      });
      setBranding(updated);
      toast({ title: "Branding saved" });
      setBrandingOpen(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
    } finally {
      setBdLoading(false);
    }
  }, [bdSlug, bdName, bdLogoUrl, bdHeroCopy, bdPrimary, bdAccent, bdSlaMin, bdSupportEmail, bdCategories]);

  const portalUrl = useMemo(() => {
    if (!branding?.slug) return null;
    return `${window.location.origin}/portal/${branding.slug}`;
  }, [branding]);

  const handleCopyPortal = useCallback(async () => {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      toast({ title: "Portal URL copied" });
    } catch {
      toast({ title: "Copy failed", description: portalUrl, variant: "destructive" });
    }
  }, [portalUrl]);

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <AgentPageLayout agentName="Customer Service Agent" tagline="Intelligent support & satisfaction" icon={Headphones} gradient="from-indigo-500 to-blue-600">
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                timeRange === r ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewTicketOpen(true)} variant="outline" size="sm" className="h-8 px-3 text-xs">
            <Plus size={12} className="mr-1.5" /> New Ticket
          </Button>
          <Button onClick={openBrandingModal} variant="outline" size="sm" className="h-8 px-3 text-xs">
            <Palette size={12} className="mr-1.5" /> Branding
          </Button>
          {portalUrl && (
            <Button onClick={handleCopyPortal} variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500 hover:text-indigo-600" title={portalUrl}>
              <Copy size={12} className="mr-1.5" /> Copy portal URL
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { loadTickets(); loadAnalytics(timeRange); loadTemplates(); }}
            disabled={analyticsLoading || ticketsLoading}
            className="h-8 px-2 text-gray-400 hover:text-gray-700"
          >
            {(analyticsLoading || ticketsLoading) ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
              <span className="text-[10px] text-gray-300">{timeRange}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Ticket Queue */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
            {["", "Open", "In Progress", "Resolved"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  statusFilter === s ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Ticket Queue</h3>
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400"><Filter size={12} /></Button>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">{tickets.length} tickets</Badge>
              </div>
            </div>
            {tickets.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={20} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Inbox is empty</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-md mx-auto">
                  Tickets your tenants submit will appear here.
                  {portalUrl && (
                    <> Share your branded support portal:
                      <button onClick={handleCopyPortal} className="text-indigo-600 hover:underline ml-1">{portalUrl}</button>
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedTicketId === ticket.id
                        ? "bg-indigo-50/30 border-l-2 border-l-indigo-400"
                        : "hover:bg-gray-50/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-400">{ticket.id}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_BADGE[ticket.priority] || ""}`}>{ticket.priority}</Badge>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_BADGE[ticket.status] || ""}`}>{ticket.status}</Badge>
                          {ticket.category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">
                              {ticket.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 font-medium truncate">{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users size={10} className="text-gray-400" />
                          <span className="text-[10px] text-gray-400">{ticket.customer_name || ticket.customer_email}</span>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">{formatRelativeTime(ticket.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Composer — ALWAYS rendered */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {activeTicket ? `Reply to ${activeTicket.id}` : "Reply Composer"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {activeTicket ? activeTicket.subject : "Select a ticket from the queue to start"}
                </p>
              </div>
              {activeTicket && activeTicket.status !== "Resolved" && activeTicket.status !== "Closed" && (
                <Button onClick={handleResolve} variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-50">
                  <CheckCircle2 size={12} className="mr-1" /> Mark resolved
                </Button>
              )}
            </div>

            {/* Conversation history */}
            {activeTicket && activeTicket.replies && activeTicket.replies.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-50 max-h-[280px] overflow-y-auto bg-gray-50/40">
                <div className="space-y-3">
                  {activeTicket.replies.map((r) => (
                    <ReplyBubble key={r.id} reply={r} />
                  ))}
                </div>
              </div>
            )}
            {activeTicket && ticketDetailLoading && (
              <div className="px-4 py-2 text-[11px] text-gray-400 border-b border-gray-50">
                <Loader2 size={11} className="inline animate-spin mr-1" /> Loading conversation...
              </div>
            )}

            <div className="p-4">
              {quickReplies.length > 0 && (
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.id}
                      title={qr.description || undefined}
                      disabled={!activeTicket}
                      onClick={() => handleSelectTemplate(qr)}
                      className="px-2.5 py-1 rounded-lg bg-gray-50 text-[10px] font-medium text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={!activeTicket}
                placeholder={activeTicket ? "Type your response..." : "Select a ticket to reply..."}
                className="min-h-[100px] text-sm border-gray-200 bg-gray-50/50 resize-none mb-3"
              />
              {aiCitations.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5 font-medium">Sources used by AI Draft</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiCitations.map((c, i) => (
                      <div key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px]">
                        <FileText size={9} />
                        <span className="truncate max-w-[200px]">
                          {c.title || c.document_id || "Source"}
                          {c.page_number ? `, p.${c.page_number}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSendReply} disabled={!activeTicket || sendLoading || !reply.trim()} className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs">
                  {sendLoading ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Send size={12} className="mr-1.5" />}
                  Send Reply
                </Button>
                <Button onClick={handleAiDraft} disabled={!activeTicket || aiDraftLoading} variant="outline" className="border-gray-200 h-9 px-4 text-xs">
                  {aiDraftLoading ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Sparkles size={12} className="mr-1.5" />}
                  AI Draft
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Sentiment + Categories + Quick actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900">Customer Sentiment</h3>
              {analyticsLoading && <Loader2 size={12} className="animate-spin text-gray-300 ml-auto" />}
            </div>
            {sentimentBreakdown.length === 0 ? (
              <p className="text-[11px] text-gray-400">No sentiment data for this range yet.</p>
            ) : (
              <div className="space-y-2">
                {sentimentBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{s.label}</span>
                      <span className="text-[10px] text-gray-400">{s.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${s.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ticket Categories</h3>
            {ticketCategories.length === 0 ? (
              <p className="text-[11px] text-gray-400">No categorised issues yet.</p>
            ) : (
              <div className="space-y-2">
                {ticketCategories.map((c) => (
                  <div key={c.label} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
                    <span className="text-xs text-gray-600 flex-1 truncate">{c.label}</span>
                    <span className="text-[10px] text-gray-400">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={() => setFaqOpen(true)} className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs">
              <Zap size={14} className="mr-2" /> Generate FAQ from Tickets
            </Button>
            <Button onClick={() => setTplOpen(true)} variant="outline" className="w-full border-gray-200 h-9 text-xs">
              <MessageSquare size={14} className="mr-2" /> Create Response Template
            </Button>
          </div>

          {/* Help Center articles panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-900">Help Center</h3>
              </div>
              {branding?.slug && (
                <a
                  href={`${window.location.origin}/portal/${branding.slug}/help`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Public view <ExternalLink size={9} />
                </a>
              )}
            </div>
            {articles.length === 0 ? (
              <p className="text-[11px] text-gray-400">
                No articles yet. Generate an FAQ and click <strong>Publish on Help Center</strong> to seed the public help page.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {articles.map((a) => (
                  <ArticleRow
                    key={a.id}
                    article={a}
                    portalSlug={branding?.slug || null}
                    onTogglePublish={async () => {
                      try {
                        await customerServiceApi.updateArticle(a.id, { published: !a.published });
                        loadArticles();
                      } catch (err: any) {
                        toast({ title: "Update failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
                      }
                    }}
                    onDelete={async () => {
                      if (!window.confirm(`Delete "${a.title}"? This soft-deletes the article — you can recreate it later.`)) return;
                      try {
                        await customerServiceApi.deleteArticle(a.id);
                        loadArticles();
                      } catch (err: any) {
                        toast({ title: "Delete failed", description: err?.response?.data?.detail || err?.message, variant: "destructive" });
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── New Ticket modal ───────────────────────────────────────────── */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Ticket</DialogTitle>
            <DialogDescription>Manually log a customer inquiry that came in through email or another channel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Customer email *</label>
                <Input value={ntEmail} onChange={(e) => setNtEmail(e.target.value)} placeholder="alex@example.com" type="email" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Customer name</label>
                <Input value={ntName} onChange={(e) => setNtName(e.target.value)} placeholder="Alex Chen" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Subject *</label>
              <Input value={ntSubject} onChange={(e) => setNtSubject(e.target.value)} placeholder="Unable to access dashboard" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Description *</label>
              <Textarea value={ntBody} onChange={(e) => setNtBody(e.target.value)} placeholder="Describe what the customer reported..." className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Priority</label>
                <div className="flex gap-1">
                  {(["High", "Medium", "Low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNtPriority(p)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                        ntPriority === p ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <Input value={ntCategory} onChange={(e) => setNtCategory(e.target.value)} placeholder="technical_support" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTicketOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={ntLoading || !ntEmail || !ntSubject || !ntBody}>
              {ntLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Plus size={14} className="mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Branding modal ─────────────────────────────────────────────── */}
      <Dialog open={brandingOpen} onOpenChange={setBrandingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Support Portal Branding</DialogTitle>
            <DialogDescription>
              Customize the public support page at <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/portal/{bdSlug || "your-slug"}</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">URL slug *</label>
                <Input value={bdSlug} onChange={(e) => setBdSlug(e.target.value)} placeholder="agripro" />
                <p className="text-[10px] text-gray-400 mt-1">a-z, 0-9, hyphens only</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Display name *</label>
                <Input value={bdName} onChange={(e) => setBdName(e.target.value)} placeholder="Agripro Support" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Logo URL</label>
              <Input value={bdLogoUrl} onChange={(e) => setBdLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Hero copy</label>
              <Textarea value={bdHeroCopy} onChange={(e) => setBdHeroCopy(e.target.value)} placeholder="How can we help today?" className="min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Primary color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bdPrimary} onChange={(e) => setBdPrimary(e.target.value)} className="h-9 w-12 rounded border border-gray-200" />
                  <Input value={bdPrimary} onChange={(e) => setBdPrimary(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Accent color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bdAccent} onChange={(e) => setBdAccent(e.target.value)} className="h-9 w-12 rounded border border-gray-200" />
                  <Input value={bdAccent} onChange={(e) => setBdAccent(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">SLA response (minutes)</label>
                <Input type="number" value={bdSlaMin} onChange={(e) => setBdSlaMin(parseInt(e.target.value || "60", 10))} min={1} max={10080} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Support email</label>
                <Input value={bdSupportEmail} onChange={(e) => setBdSupportEmail(e.target.value)} placeholder="support@yourcompany.com" type="email" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Public categories (comma-separated)</label>
              <Input value={bdCategories} onChange={(e) => setBdCategories(e.target.value)} placeholder="technical_support, billing_issue, feature_request" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandingOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBranding} disabled={bdLoading || !bdSlug || !bdName}>
              {bdLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
              Save branding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── FAQ generation modal ───────────────────────────────────────── */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate FAQ Content</DialogTitle>
            <DialogDescription>
              The agent drafts FAQ entries for a topic. Useful for turning recurring tickets into self-serve docs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Topic</label>
              <Input value={faqTopic} onChange={(e) => setFaqTopic(e.target.value)} placeholder="e.g. password reset, billing cycles, API rate limits" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Target audience (optional)</label>
              <Input value={faqAudience} onChange={(e) => setFaqAudience(e.target.value)} placeholder="e.g. enterprise admins, end users" />
            </div>
            {faqOutput && (
              <>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 max-h-[260px] overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap font-sans text-gray-700">{faqOutput}</pre>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={() => handleCopyText(faqOutput)} variant="outline" size="sm" className="h-8 px-3 text-xs">
                    <Copy size={11} className="mr-1.5" /> Copy
                  </Button>
                  <Button
                    onClick={() => handleDownloadMarkdown(`faq-${faqTopic.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`, faqOutput)}
                    variant="outline" size="sm" className="h-8 px-3 text-xs"
                  >
                    <Download size={11} className="mr-1.5" /> Download .md
                  </Button>
                  <Button
                    onClick={() => handleSaveFaqToKb(false)}
                    disabled={faqSaveLoading}
                    variant="outline" size="sm"
                    className="h-8 px-3 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    title="Push into the AI knowledge base — future drafts will cite it"
                  >
                    {faqSaveLoading ? <Loader2 size={11} className="mr-1.5 animate-spin" /> : <BookOpen size={11} className="mr-1.5" />}
                    Save to Knowledge Base
                  </Button>
                  <Button
                    onClick={() => handleSaveFaqToKb(true)}
                    disabled={faqSaveLoading}
                    size="sm"
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    title="Save to KB AND publish on the public help center"
                  >
                    {faqSaveLoading ? <Loader2 size={11} className="mr-1.5 animate-spin" /> : <Globe size={11} className="mr-1.5" />}
                    Publish on Help Center
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqOpen(false)}>Close</Button>
            <Button onClick={handleGenerateFaq} disabled={faqLoading || !faqTopic.trim()}>
              {faqLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Sparkles size={14} className="mr-2" />}
              {faqOutput ? "Regenerate" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Template creation modal ────────────────────────────────────── */}
      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Response Template</DialogTitle>
            <DialogDescription>
              Save a reusable reply template for common cases. Templates show up as quick-reply buttons above the composer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Name *</label>
              <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Refund Confirmation" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category *</label>
                <Input value={tplCategory} onChange={(e) => setTplCategory(e.target.value)} placeholder="billing_issue" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tone</label>
                <Input value={tplTone} onChange={(e) => setTplTone(e.target.value)} placeholder="professional_friendly" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Body *</label>
              <Textarea value={tplBody} onChange={(e) => setTplBody(e.target.value)} placeholder="Hi {{customer_name}}, ..." className="min-h-[150px]" />
              {tplBody && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button onClick={() => handleCopyText(tplBody)} variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-gray-500">
                    <Copy size={10} className="mr-1" /> Copy
                  </Button>
                  <Button
                    onClick={() => handleDownloadMarkdown(`template-${(tplName || tplCategory).toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`, tplBody)}
                    variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-gray-500"
                  >
                    <Download size={10} className="mr-1" /> Download .md
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplOpen(false)}>Close</Button>
            <Button onClick={handleCreateTemplateRow} disabled={tplLoading || !tplName.trim() || !tplBody.trim() || !tplCategory.trim()}>
              {tplLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
              Save template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentPageLayout>
  );
};

const ArticleRow: React.FC<{
  article: SupportArticle;
  portalSlug: string | null;
  onTogglePublish: () => void;
  onDelete: () => void;
}> = ({ article, portalSlug, onTogglePublish, onDelete }) => {
  const publicUrl = portalSlug ? `${window.location.origin}/portal/${portalSlug}/help/${article.slug}` : null;
  return (
    <div className="border border-gray-100 rounded-lg p-2.5 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs font-medium text-gray-800 truncate flex-1">{article.title}</p>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
            article.published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {article.published ? "Live" : "Draft"}
        </span>
      </div>
      {article.summary && (
        <p className="text-[10px] text-gray-400 truncate mb-1.5">{article.summary}</p>
      )}
      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <span>{article.view_count} views</span>
        {article.helpful_count > 0 && <span>· 👍 {article.helpful_count}</span>}
        <div className="ml-auto flex items-center gap-1">
          {publicUrl && article.published && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
              title="Open public page"
            >
              <ExternalLink size={11} />
            </a>
          )}
          <button
            onClick={onTogglePublish}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-emerald-600"
            title={article.published ? "Unpublish" : "Publish"}
          >
            {article.published ? <Globe size={11} /> : <Globe size={11} className="opacity-50" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ReplyBubble: React.FC<{ reply: TicketReply }> = ({ reply }) => {
  const isOperator = reply.author_type === "operator";
  const isAi = reply.author_type === "agent_ai";
  return (
    <div className={`flex gap-2 ${isOperator || isAi ? "flex-row-reverse" : ""}`}>
      <div className="shrink-0 mt-0.5">
        {isAi ? (
          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center"><Bot size={11} className="text-indigo-600" /></div>
        ) : isOperator ? (
          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-medium text-emerald-700">A</div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600">C</div>
        )}
      </div>
      <div className={`flex-1 min-w-0 max-w-[80%] ${isOperator || isAi ? "items-end" : ""}`}>
        <div className={`flex items-center gap-1.5 mb-0.5 text-[10px] text-gray-400 ${isOperator || isAi ? "justify-end" : ""}`}>
          <span>{reply.author_display_name || (isAi ? "AI Draft" : isOperator ? "Operator" : "Customer")}</span>
          <span className="text-gray-300">·</span>
          <span>{formatRelativeTime(reply.created_at)}</span>
        </div>
        <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
          isAi ? "bg-indigo-50 text-indigo-900" :
          isOperator ? "bg-gray-900 text-white" :
          "bg-gray-100 text-gray-800"
        }`}>
          {reply.body}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceAgent;
