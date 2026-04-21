import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Database, Search, FileText, Globe, StickyNote, Upload,
  Type, Layers, ChevronRight, Star, Trash2, Clock,
  X, Loader2, AlertCircle, CheckCircle2, Plus, Send, Eye, Download,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { chatApi, ragApi, DocumentItem } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import DocumentPreview, { CitationHighlight } from "@/components/DocumentPreview";

/* ─── Helpers ──────────────────────────────────────────────────────────── */
/** Clean up titles that are raw IDs like "chat_e07c3a7f-..." or UUIDs */
function displayTitle(title: string | undefined, source?: string): string {
  if (!title) return "Untitled";
  // chat_<uuid> → "Chat Excerpt"
  if (/^chat_[0-9a-f-]{8,}$/i.test(title)) return "Chat Excerpt";
  // raw UUID → use source label
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(title)) return source === "web" ? "Web Page" : "Document";
  // file paths → just the filename
  if (title.includes("/")) return title.split("/").pop() || title;
  return title;
}

/* ─── Source filter config ──────────────────────────────────────────────── */
const sourceFilters = [
  { id: "all", label: "All" },
  { id: "upload", label: "Documents", icon: FileText },
  { id: "web", label: "URLs", icon: Globe },
  { id: "manual_entry", label: "Notes", icon: StickyNote },
  { id: "chat_history", label: "Chat History", icon: Layers },
];

const sourceColors: Record<string, string> = {
  upload: "bg-purple-50 text-purple-600",
  web: "bg-emerald-50 text-emerald-600",
  manual_entry: "bg-amber-50 text-amber-600",
  chat_history: "bg-blue-50 text-blue-600",
  direct_text: "bg-amber-50 text-amber-600",
};

const sourceLabels: Record<string, string> = {
  upload: "Document",
  web: "URL",
  manual_entry: "Note",
  chat_history: "Chat",
  direct_text: "Text",
};

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface SearchResult {
  content: string;
  score: number;
  source: string;
  metadata: Record<string, any>;
}

interface RecentQuery {
  query: string;
  date: string;
  results: number;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
const RAGAgent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add panels
  const [showUpload, setShowUpload] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // RAG Q&A
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragSources, setRagSources] = useState<any[]>([]);
  const [isAskingRag, setIsAskingRag] = useState(false);

  // Persistent history from MongoDB
  const [ragHistory, setRagHistory] = useState<any[]>([]);
  const [ragStats, setRagStats] = useState<any>(null);

  // Document preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewPage, setPreviewPage] = useState(1);
  const [previewHighlights, setPreviewHighlights] = useState<CitationHighlight[]>([]);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewContent, setPreviewContent] = useState(""); // for non-PDF previews
  const [previewType, setPreviewType] = useState<"pdf" | "text">("pdf");
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState<string>("");
  const [previewDownloadName, setPreviewDownloadName] = useState<string>("");
  const [previewIsBinary, setPreviewIsBinary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load persistent history + stats from MongoDB ────────────────────── */
  const loadRagHistory = useCallback(async () => {
    try {
      const data = await ragApi.getHistory(20, 0);
      setRagHistory(data);
    } catch (err) {
      console.error("Failed to load RAG history:", err);
    }
  }, []);

  const loadRagStats = useCallback(async () => {
    try {
      const data = await ragApi.getStats();
      setRagStats(data);
    } catch (err) {
      console.error("Failed to load RAG stats:", err);
    }
  }, []);

  useEffect(() => {
    loadRagHistory();
    loadRagStats();
  }, [loadRagHistory, loadRagStats]);

  const handleLoadRagSession = useCallback(async (sessionId: string) => {
    try {
      const data = await ragApi.getDetail(sessionId);
      setRagAnswer(data.response || "");
      setRagSources(data.sources || []);
      setQuery(data.query || "");
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  }, []);

  const handleDeleteRagSession = useCallback(async (sessionId: string) => {
    try {
      await ragApi.deleteSession(sessionId);
      setRagHistory(prev => prev.filter(h => h.id !== sessionId));
      loadRagStats();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  }, [loadRagStats]);

  /* ── Open document preview ────────────────────────────────────────────── */
  const isTextMime = (mime: string): boolean => {
    if (!mime) return false;
    if (mime.startsWith("text/")) return true;
    if (mime === "application/json") return true;
    if (mime === "application/xml") return true;
    return false;
  };

  const openDocumentPreview = useCallback(async (doc: { document_id?: string; title?: string; source?: string; page_number?: number; bbox?: any; page_width?: number; page_height?: number; content?: string; mime_type?: string; source_url?: string }) => {
    const docId = doc.document_id;
    const title = doc.title || "Document";

    // Reset preview state
    setPreviewDownloadUrl("");
    setPreviewDownloadName("");
    setPreviewIsBinary(false);

    if (!docId) {
      if (doc.source === "web" && doc.source_url) {
        window.open(doc.source_url, "_blank");
      } else {
        setPreviewContent(doc.content || "No content available.");
        setPreviewTitle(title);
        setPreviewType("text");
        setPreviewOpen(true);
      }
      return;
    }

    let info: Awaited<ReturnType<typeof chatApi.getDocumentFileUrl>> | null = null;
    try {
      info = await chatApi.getDocumentFileUrl(docId);
    } catch {
      setPreviewContent(doc.content || "Could not load document preview.");
      setPreviewTitle(title);
      setPreviewType("text");
      setPreviewOpen(true);
      return;
    }

    const mime = info.mime_type || doc.mime_type || "";
    const source = info.source || doc.source || "";
    const downloadName = info.original_filename || info.filename || title;

    // Web / URL sources → open the original URL in a new tab
    if (source === "web" && info.source_url) {
      window.open(info.source_url, "_blank");
      return;
    }

    // PDF → dedicated viewer
    if (mime.includes("pdf")) {
      setPreviewUrl(info.url);
      setPreviewPage(doc.page_number || 1);
      setPreviewHighlights(doc.bbox ? [{
        pageNumber: doc.page_number || 1,
        bbox: doc.bbox,
        pageWidth: doc.page_width,
        pageHeight: doc.page_height,
      }] : []);
      setPreviewTitle(title);
      setPreviewType("pdf");
      setPreviewOpen(true);
      return;
    }

    // Text-like → fetch raw bytes from MinIO
    if (isTextMime(mime)) {
      try {
        const res = await fetch(info.url);
        const text = await res.text();
        setPreviewContent(text || doc.content || "No content available.");
      } catch {
        setPreviewContent(doc.content || "Could not load document preview.");
      }
      setPreviewDownloadUrl(info.url);
      setPreviewDownloadName(downloadName);
      setPreviewTitle(title);
      setPreviewType("text");
      setPreviewOpen(true);
      return;
    }

    // Binary (docx, xlsx, pptx, etc.) → show extracted text from Weaviate + download link
    try {
      const data = await chatApi.getDocumentContent(docId);
      setPreviewContent(
        data.content?.trim()
          ? data.content
          : "No extracted text yet — the document may still be processing. Use the download button to view the original."
      );
    } catch {
      setPreviewContent("Preview unavailable. Use the download button to view the original file.");
    }
    setPreviewDownloadUrl(info.url);
    setPreviewDownloadName(downloadName);
    setPreviewIsBinary(true);
    setPreviewTitle(title);
    setPreviewType("text");
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewUrl("");
    setPreviewContent("");
    setPreviewDownloadUrl("");
    setPreviewDownloadName("");
    setPreviewIsBinary(false);
  }, []);

  /* ── Load documents on mount ──────────────────────────────────────────── */
  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const sourceFilter = activeFilter === "all" ? undefined : [activeFilter];
      const res = await chatApi.listDocuments({ source_types: sourceFilter, limit: 100 });
      setDocuments(res.documents || []);
      setDocCount(res.total || 0);
      const totalChunks = (res.documents || []).reduce((sum: number, d: DocumentItem) => sum + (d.chunk_count || 0), 0);
      setChunkCount(totalChunks);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [activeFilter]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  /* ── Search ───────────────────────────────────────────────────────────── */
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    setRagAnswer("");
    setRagSources([]);
    try {
      const includeSources = activeFilter === "all" ? undefined : [activeFilter];
      const res = await chatApi.searchContext(query.trim(), 10, includeSources);
      const results: SearchResult[] = (res.results || res.context || []).map((r: any) => ({
        content: r.content || r.text || "",
        score: r.score ?? r.relevance ?? 0,
        source: r.source || r.metadata?.source || "upload",
        metadata: r.metadata || {},
      }));
      setSearchResults(results);

      // Track recent query
      setRecentQueries((prev) => {
        const updated = [
          { query: query.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), results: results.length },
          ...prev.filter((q) => q.query !== query.trim()),
        ].slice(0, 10);
        return updated;
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, activeFilter]);

  /* ── RAG Ask (query + answer) ─────────────────────────────────────────── */
  const handleAskRAG = useCallback(async () => {
    if (!query.trim()) return;
    setIsAskingRag(true);
    setError(null);
    setRagAnswer("");
    setRagSources([]);
    setSearchResults([]);
    try {
      const data = await ragApi.ask({
        query: query.trim(),
        include_sources: activeFilter === "all" ? undefined : [activeFilter],
      });
      setRagAnswer(data.response || "");
      setRagSources(data.sources || []);

      setRecentQueries((prev) => {
        const updated = [
          { query: query.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), results: (data.sources || []).length },
          ...prev.filter((q) => q.query !== query.trim()),
        ].slice(0, 10);
        return updated;
      });

      // Refresh persistent history
      loadRagHistory();
      loadRagStats();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "RAG query failed");
    } finally {
      setIsAskingRag(false);
    }
  }, [query, activeFilter, loadRagHistory, loadRagStats]);

  /* ── File upload ──────────────────────────────────────────────────────── */
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsAdding(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await chatApi.uploadDocument(file, file.name);
      }
      setSuccess(`${files.length} file(s) uploaded and processing`);
      setShowUpload(false);
      setTimeout(() => loadDocuments(), 2000); // reload after processing starts
    } catch {
      setError("File upload failed");
    } finally {
      setIsAdding(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [loadDocuments]);

  /* ── Add URL ──────────────────────────────────────────────────────────── */
  const handleAddUrl = useCallback(async () => {
    if (!urlValue.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      await chatApi.addDocumentUrl(urlValue.trim());
      setSuccess("URL added — processing in background");
      setUrlValue("");
      setShowUrlInput(false);
      setTimeout(() => loadDocuments(), 2000);
    } catch {
      setError("Failed to add URL");
    } finally {
      setIsAdding(false);
    }
  }, [urlValue, loadDocuments]);

  /* ── Add Text ─────────────────────────────────────────────────────────── */
  const handleAddText = useCallback(async () => {
    if (!textValue.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      await chatApi.addDocumentText(textValue.trim(), textTitle.trim() || undefined);
      setSuccess("Text added — processing in background");
      setTextValue("");
      setTextTitle("");
      setShowTextInput(false);
      setTimeout(() => loadDocuments(), 2000);
    } catch {
      setError("Failed to add text");
    } finally {
      setIsAdding(false);
    }
  }, [textValue, textTitle, loadDocuments]);

  /* ── Delete document ──────────────────────────────────────────────────── */
  const handleDeleteDocument = useCallback(async (docId: string) => {
    try {
      await chatApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
      setSuccess("Document deleted");
    } catch {
      setError("Failed to delete document");
    }
  }, []);

  /* ── Auto-clear alerts ────────────────────────────────────────────────── */
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); }
  }, [error]);

  return (
    <AgentPageLayout agentName="RAG Agent" tagline="Knowledge at your fingertips" icon={Database} gradient="from-purple-500 to-fuchsia-600">
      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Documents", value: isLoadingDocs ? "…" : String(docCount), icon: FileText, color: "text-purple-500" },
          { label: "Chunks Indexed", value: isLoadingDocs ? "…" : chunkCount > 1000 ? `${(chunkCount / 1000).toFixed(1)}K` : String(chunkCount), icon: Layers, color: "text-fuchsia-500" },
          { label: "Queries", value: String(ragStats?.total_sessions || recentQueries.length), icon: Search, color: "text-blue-500" },
          { label: "Avg. Sources", value: ragStats?.avg_context_used != null ? String(ragStats.avg_context_used) : String(searchResults.length), icon: Star, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><s.icon size={14} className={s.color} /><span className="text-xs text-gray-400">{s.label}</span></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              placeholder="Search your knowledge base..."
              className="text-sm h-11 pl-10 border-gray-200 bg-gray-50/50"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="bg-gray-900 hover:bg-gray-800 text-white h-11 px-5 text-sm shrink-0"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
          </Button>
          <Button
            onClick={handleAskRAG}
            disabled={isAskingRag || !query.trim()}
            variant="outline"
            className="h-11 px-5 text-sm shrink-0 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {isAskingRag ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} className="mr-1.5" />Ask RAG</>}
          </Button>
        </div>
        <div className="flex gap-2">
          {sourceFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === f.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Answer — compact purple-lilac style */}
      <AnimatePresence>
        {ragAnswer && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 rounded-2xl bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-violet-50 border border-purple-100/60 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2.5">
              <Database size={13} className="text-purple-500" />
              <span className="text-xs font-semibold text-purple-700">RAG Answer</span>
              {ragSources.length > 0 && (
                <Badge className="text-[9px] bg-purple-100 text-purple-600 border-0 px-1.5 py-0">
                  {ragSources.length} sources
                </Badge>
              )}
            </div>

            {/* Markdown content — compact */}
            <div className="prose prose-sm max-w-none text-[13px] leading-relaxed
              prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5
              prose-h1:text-[15px] prose-h2:text-[14px] prose-h3:text-[13px]
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-1.5
              prose-strong:text-gray-800 prose-strong:font-semibold
              prose-em:text-gray-600
              prose-ul:my-1.5 prose-ul:space-y-0.5 prose-ol:my-1.5 prose-ol:space-y-0.5
              prose-li:text-gray-700 prose-li:text-[13px] prose-li:leading-relaxed
              prose-li:marker:text-purple-400
              prose-code:text-purple-700 prose-code:bg-purple-100/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:my-2 prose-pre:text-xs
              prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-purple-300 prose-blockquote:bg-purple-100/30 prose-blockquote:rounded-r-lg prose-blockquote:py-0.5 prose-blockquote:not-italic
              prose-table:text-xs prose-th:bg-purple-50 prose-th:font-semibold prose-td:py-1.5
              prose-hr:border-purple-200/50 prose-hr:my-3
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  // Intercept links that are citation placeholders: [N](cite:N)
                  a: ({ href, children, ...props }) => {
                    if (href?.startsWith("cite:")) {
                      const num = parseInt(href.replace("cite:", ""));
                      const src = ragSources[num - 1];
                      return (
                        <button
                          onClick={(e) => { e.preventDefault(); src && openDocumentPreview({
                            document_id: src.document_id,
                            title: src.title || src.type,
                            source: src.source || src.type,
                            page_number: src.page_number,
                            bbox: src.bbox,
                            page_width: src.page_width,
                            page_height: src.page_height,
                            content: src.chunk_text || src.content,
                          }); }}
                          className="inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 mx-0.5 text-[9px] font-bold rounded bg-purple-200/70 text-purple-700 hover:bg-purple-300 transition-colors cursor-pointer align-super leading-none no-underline"
                          title={src?.title || `Source ${num}`}
                        >
                          {num}
                        </button>
                      );
                    }
                    return <a href={href} {...props}>{children}</a>;
                  },
                }}
              >{
                // Pre-process: convert [N] citations to markdown links [N](cite:N)
                // so ReactMarkdown parses them as <a> tags we can intercept
                ragAnswer.replace(/\[(\d+)\]/g, (match, num) => {
                  const n = parseInt(num);
                  return n > 0 && n <= ragSources.length ? `[${num}](cite:${num})` : match;
                })
              }</ReactMarkdown>
            </div>

            {/* Sources pills */}
            {ragSources.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-purple-200/40">
                <div className="flex flex-wrap gap-1.5">
                  {ragSources.map((s: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => openDocumentPreview({
                        document_id: s.document_id,
                        title: s.title || s.type,
                        source: s.source || s.type,
                        page_number: s.page_number,
                        bbox: s.bbox,
                        page_width: s.page_width,
                        page_height: s.page_height,
                        content: s.chunk_text || s.content,
                      })}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 border border-purple-200/60 rounded-lg hover:border-purple-400 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-purple-200 text-purple-700 text-[8px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[10px] font-medium text-gray-600 truncate max-w-[120px]">
                        {displayTitle(s.title || s.type, s.source || s.type)}
                      </span>
                      {s.page_number && (
                        <span className="text-[8px] text-purple-400 shrink-0">p.{s.page_number}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Search Results / Document List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Search Results</h3>
                <span className="text-xs text-gray-400">{searchResults.length} matches</span>
              </div>
              <div className="divide-y divide-gray-50">
                {searchResults.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-4 hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                        {displayTitle(r.metadata.title || r.metadata.filename, r.source) || `Chunk from ${sourceLabels[r.source] || r.source}`}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Star size={10} className="text-amber-400" />
                        <span className="text-[10px] text-gray-400">{Math.round(r.score * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-3">{r.content}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sourceColors[r.source] || "bg-gray-50 text-gray-600"}`}>
                        {sourceLabels[r.source] || r.source}
                      </Badge>
                      {r.metadata.page_number && (
                        <span className="text-[10px] text-gray-400">Page {r.metadata.page_number}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Documents in Knowledge Base */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Knowledge Base</h3>
              <span className="text-xs text-gray-400">
                {isLoadingDocs ? "Loading…" : `${documents.length} documents`}
              </span>
            </div>
            {isLoadingDocs ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center">
                <Database size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No documents yet</p>
                <p className="text-xs text-gray-300 mt-1">Upload files, add URLs, or paste text to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {documents.map((doc, i) => (
                  <motion.div key={doc.document_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50/30 transition-colors group cursor-pointer"
                    onClick={() => openDocumentPreview({
                      document_id: doc.document_id,
                      title: doc.title || "Untitled",
                      source: doc.source,
                      mime_type: doc.mime_type,
                    })}
                  >
                    <FileText size={16} className="text-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{displayTitle(doc.title, doc.source)}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sourceColors[doc.source] || "bg-gray-50 text-gray-500"}`}>
                          {sourceLabels[doc.source] || doc.source}
                        </Badge>
                        {doc.status === "processing" && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Loader2 size={9} className="animate-spin" />
                            Processing
                          </span>
                        )}
                        {doc.status === "error" && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded" title="Processing failed">
                            <AlertCircle size={9} />
                            Error
                          </span>
                        )}
                        {doc.status === "ready" && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 size={9} />
                            Ready
                          </span>
                        )}
                        {doc.chunk_count ? (
                          <span className="text-[10px] text-gray-400">{doc.chunk_count} chunks</span>
                        ) : null}
                        <span className="text-[10px] text-gray-300">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDocumentPreview({
                          document_id: doc.document_id,
                          title: doc.title || "Untitled",
                          source: doc.source,
                          mime_type: doc.mime_type,
                        }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-purple-50 text-gray-300 hover:text-purple-500"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.document_id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add to Knowledge Base */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add to Knowledge Base</h3>
            <div className="space-y-2">
              {/* Upload File */}
              <button
                onClick={() => { setShowUpload(true); setShowUrlInput(false); setShowTextInput(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors text-left"
              >
                <Upload size={16} className="text-violet-500" />
                <span className="text-xs font-medium text-gray-700">Upload File</span>
              </button>
              <AnimatePresence>
                {showUpload && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.html,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileUpload}
                        className="text-xs w-full"
                        disabled={isAdding}
                      />
                      <p className="text-[10px] text-violet-400 mt-2">PDF, DOCX, TXT, MD, CSV, HTML, images</p>
                      {isAdding && <Loader2 size={14} className="animate-spin text-violet-500 mt-2" />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add URL */}
              <button
                onClick={() => { setShowUrlInput(true); setShowUpload(false); setShowTextInput(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors text-left"
              >
                <Globe size={16} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-700">Add URL</span>
              </button>
              <AnimatePresence>
                {showUrlInput && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                      <Input
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        placeholder="https://example.com/article"
                        className="text-xs h-9 bg-white"
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddUrl(); }}
                      />
                      <Button onClick={handleAddUrl} disabled={isAdding || !urlValue.trim()} size="sm" className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700">
                        {isAdding ? <Loader2 size={12} className="animate-spin" /> : <><Plus size={12} className="mr-1" />Add URL</>}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Text */}
              <button
                onClick={() => { setShowTextInput(true); setShowUpload(false); setShowUrlInput(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors text-left"
              >
                <Type size={16} className="text-emerald-500" />
                <span className="text-xs font-medium text-gray-700">Add Text</span>
              </button>
              <AnimatePresence>
                {showTextInput && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                      <Input
                        value={textTitle}
                        onChange={(e) => setTextTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="text-xs h-8 bg-white"
                      />
                      <textarea
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder="Paste your text content here..."
                        className="w-full text-xs p-2 rounded-lg border border-emerald-200 bg-white resize-none h-24 focus:outline-none focus:ring-1 focus:ring-emerald-300"
                      />
                      <Button onClick={handleAddText} disabled={isAdding || !textValue.trim()} size="sm" className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                        {isAdding ? <Loader2 size={12} className="animate-spin" /> : <><Plus size={12} className="mr-1" />Add Text</>}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Queries */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Recent Queries</h3></div>
            {recentQueries.length === 0 ? (
              <div className="p-4 text-center"><p className="text-xs text-gray-300">No queries yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentQueries.map((q, i) => (
                  <div key={i}
                    onClick={() => { setQuery(q.query); }}
                    className="p-3 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <Search size={12} className="text-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{q.query}</p>
                      <p className="text-[10px] text-gray-400">{q.date} · {q.results} results</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RAG Stats */}
          {ragStats && ragStats.total_sessions > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">RAG Stats</h3>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Total queries: <span className="font-medium text-gray-700">{ragStats.total_sessions}</span></p>
                <p>Avg. sources used: <span className="font-medium text-gray-700">{ragStats.avg_context_used}</span></p>
                <p>Avg. response time: <span className="font-medium text-gray-700">{ragStats.avg_processing_time}s</span></p>
              </div>
            </div>
          )}

          {/* Persistent History */}
          {ragHistory.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Session History</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {ragHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => handleLoadRagSession(item.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-purple-200 text-purple-500">
                        {item.sources_count || 0} sources
                      </Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRagSession(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">{item.query || "Query"}</p>
                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={8} /> {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* PDF Document Preview */}
      {previewType === "pdf" && (
        <DocumentPreview
          documentUrl={previewUrl}
          isOpen={previewOpen}
          onClose={closePreview}
          initialPage={previewPage}
          highlights={previewHighlights}
        />
      )}

      {/* Text Preview Modal */}
      <AnimatePresence>
        {previewOpen && previewType === "text" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-[90vw] max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-fuchsia-50 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-purple-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">{previewTitle}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {previewDownloadUrl && (
                    <a
                      href={previewDownloadUrl}
                      download={previewDownloadName || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-purple-600 hover:bg-purple-100 transition-colors"
                      title="Download original file"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  )}
                  <button onClick={closePreview} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              </div>
              {previewIsBinary && (
                <div className="px-5 py-2 text-[11px] text-amber-700 bg-amber-50 border-b border-amber-100 shrink-0">
                  Showing extracted text only — use Download to open the original file.
                </div>
              )}
              <div className="flex-1 overflow-auto p-5">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">{previewContent}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AgentPageLayout>
  );
};

export default RAGAgent;
