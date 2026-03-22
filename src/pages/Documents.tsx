import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document as PdfDocument, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  FileType,
  Upload,
  Search,
  Trash2,
  Download,
  MoreVertical,
  Sparkles,
  ArrowRight,
  CloudUpload,
  Loader2,
  X,
  MessageSquareText,
  Check,
} from "lucide-react";
import { Document, documentApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Configure pdf.js worker — use CDN to avoid Vite cache version mismatches
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ── Helpers ──────────────────────────────────────────────────────────────

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "text/plain": "TXT",
  "text/csv": "CSV",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WEBP",
};

function getFileLabel(mime?: string | null): string {
  if (!mime) return "FILE";
  if (MIME_LABELS[mime]) return MIME_LABELS[mime];
  const ext = mime.split("/").pop()?.toUpperCase();
  return ext && ext.length <= 6 ? ext : "FILE";
}

function getFileIcon(mime?: string | null, size = "h-7 w-7") {
  if (!mime) return <File className={size} />;
  if (mime === "application/pdf") return <FileText className={size} />;
  if (mime.includes("image/")) return <ImageIcon className={size} />;
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv"))
    return <FileSpreadsheet className={size} />;
  if (mime.includes("word") || mime.includes("document"))
    return <FileType className={size} />;
  return <File className={size} />;
}

function getCardGradient(mime?: string | null, index = 0) {
  if (!mime) return { card: "from-purple-50 via-violet-50 to-indigo-50", icon: "text-purple-400", glow: "shadow-purple-200/60" };
  if (mime === "application/pdf") return { card: "from-purple-50 via-violet-50 to-fuchsia-50", icon: "text-purple-600", glow: "shadow-purple-200/50" };
  if (mime.includes("image/")) return { card: "from-violet-50 via-purple-50 to-indigo-50", icon: "text-violet-500", glow: "shadow-violet-200/50" };
  if (mime.includes("spreadsheet") || mime.includes("excel")) return { card: "from-indigo-50 via-purple-50 to-violet-50", icon: "text-indigo-500", glow: "shadow-indigo-200/50" };
  if (mime.includes("word") || mime.includes("document")) return { card: "from-blue-50 via-indigo-50 to-purple-50", icon: "text-indigo-500", glow: "shadow-indigo-200/50" };
  const fallbacks = [
    { card: "from-purple-50 via-violet-50 to-fuchsia-50", icon: "text-purple-500", glow: "shadow-purple-200/50" },
    { card: "from-indigo-50 via-purple-50 to-violet-50", icon: "text-indigo-500", glow: "shadow-indigo-200/50" },
    { card: "from-fuchsia-50 via-purple-50 to-violet-50", icon: "text-fuchsia-500", glow: "shadow-fuchsia-200/50" },
  ];
  return fallbacks[index % fallbacks.length];
}

function getStatusDot(status: string) {
  switch (status) {
    case "processed": return "bg-emerald-400 shadow-emerald-400/40";
    case "processing": return "bg-amber-400 shadow-amber-400/40 animate-pulse";
    case "failed": return "bg-red-400 shadow-red-400/40";
    case "uploaded": return "bg-blue-400 shadow-blue-400/40";
    default: return "bg-gray-400";
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getFloatAnimation(index: number) {
  const duration = 5 + (index % 5) * 0.8;
  const yRange = 5 + (index % 4) * 2;
  const rotRange = 0.3 + (index % 3) * 0.2;
  const delay = (index % 8) * 0.35;
  return {
    animate: {
      y: [0, -yRange, 0, yRange * 0.5, 0],
      rotate: [0, rotRange, 0, -rotRange, 0],
    },
    transition: { duration, repeat: Infinity, ease: "easeInOut" as const, delay },
  };
}

function getStackStyle(index: number) {
  const rotations = [-1.5, 0.8, -0.5, 1.2, -0.8, 0.5, -1, 0.7, -0.3, 1.5];
  return {
    rotate: rotations[index % rotations.length],
    zIndex: 10 + index,
  };
}

// Fetch a URL as blob to bypass CORS (MinIO presigned URLs block fetch from react-pdf)
function useBlobUrl(url: string | undefined) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!url) return;
    let revoke = "";
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        revoke = u;
        setBlobUrl(u);
      })
      .catch(() => setError(true));
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [url]);
  return { blobUrl, error };
}

// ── PDF Thumbnail ────────────────────────────────────────────────────────

const PdfThumbnail: React.FC<{ url: string }> = ({ url }) => {
  const { blobUrl, error } = useBlobUrl(url);
  const [loaded, setLoaded] = useState(false);

  if (error || !blobUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {error ? (
          <FileText className="h-8 w-8 text-purple-300/60" />
        ) : (
          <Loader2 className="h-5 w-5 text-purple-300 animate-spin" />
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-purple-300 animate-spin" />
        </div>
      )}
      <PdfDocument
        file={blobUrl}
        onLoadSuccess={() => setLoaded(true)}
        onLoadError={() => setLoaded(false)}
        loading=""
      >
        <PdfPage
          pageNumber={1}
          width={220}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </PdfDocument>
    </div>
  );
};

// ── Full Preview Modal ───────────────────────────────────────────────────

const FullPreview: React.FC<{
  url: string;
  name: string;
  mime?: string | null;
  onClose: () => void;
}> = ({ url, name, mime, onClose }) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const isImage = (mime || "").includes("image/");
  const isPdf = mime === "application/pdf";

  // For PDFs, fetch as blob to bypass CORS
  const { blobUrl: pdfBlobUrl } = useBlobUrl(isPdf ? url : undefined);

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
    const el = pageRefs.current.get(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-[90vw] max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
          <span className="text-sm font-medium text-gray-700 truncate max-w-[40%]">{name}</span>
          <div className="flex items-center gap-1">
            {isPdf && numPages > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} className="h-8 w-8 p-0">
                  <span className="text-xs">&larr;</span>
                </Button>
                <span className="text-xs text-gray-500 mx-1">
                  {currentPage} / {numPages}
                </span>
                <Button variant="ghost" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= numPages} className="h-8 w-8 p-0">
                  <span className="text-xs">&rarr;</span>
                </Button>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))} className="h-8 w-8 p-0 text-xs">-</Button>
                <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.min(s + 0.2, 3))} className="h-8 w-8 p-0 text-xs">+</Button>
                <div className="w-px h-5 bg-gray-200 mx-1" />
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center">
          {isImage ? (
            <img src={url} alt={name} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
          ) : isPdf ? (
            pdfBlobUrl ? (
            <PdfDocument
              file={pdfBlobUrl}
              onLoadSuccess={({ numPages: total }) => setNumPages(total)}
              onLoadError={(err) => console.error("PDF load error:", err)}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                </div>
              }
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <div
                  key={pageNum}
                  ref={(el) => { if (el) pageRefs.current.set(pageNum, el); }}
                  className="relative mb-4 mx-auto shadow-lg bg-white"
                  style={{ width: "fit-content" }}
                >
                  <PdfPage
                    pageNumber={pageNum}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </div>
              ))}
            </PdfDocument>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <File className="h-16 w-16" />
              <p className="text-sm">Preview not available for this file type</p>
              <a href={url} download={name} className="text-sm text-purple-600 hover:underline">Download instead</a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; mime?: string | null } | null>(null);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Fetch documents
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try { setDocuments(await documentApi.getDocuments()); }
      catch { toast({ title: "Error", description: "Failed to fetch documents", variant: "destructive" }); }
      finally { setIsLoading(false); }
    })();
  }, []);

  // Fetch presigned URLs for thumbnails after documents load
  useEffect(() => {
    if (documents.length === 0) return;
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      await Promise.allSettled(
        documents.map(async (doc) => {
          try {
            const { url } = await documentApi.getPresignedUrl(doc.id);
            urls[doc.id] = url;
          } catch {
            // If presigned URL fails, use file_url as fallback
            if (doc.file_url) urls[doc.id] = doc.file_url;
          }
        })
      );
      setPresignedUrls(urls);
    };
    fetchUrls();
  }, [documents]);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    for (const file of Array.from(files)) {
      try {
        const doc = await documentApi.uploadDocument(file);
        setDocuments((p) => [doc, ...p]);
        toast({ title: "Uploaded", description: `${file.name}` });
      } catch {
        toast({ title: "Failed", description: `Could not upload ${file.name}`, variant: "destructive" });
      }
    }
    setIsUploading(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} document(s)?`)) return;
    try {
      await Promise.all(ids.map((id) => documentApi.deleteDocument(id)));
      setDocuments((p) => p.filter((d) => !ids.includes(d.id)));
      setSelectedDocs(new Set());
      toast({ title: "Deleted", description: `${ids.length} removed` });
    } catch {
      toast({ title: "Failed", description: "Could not delete", variant: "destructive" });
    }
  };

  // Instant download via hidden anchor with blob
  const handleDownload = async (doc: Document) => {
    try {
      const url = presignedUrls[doc.id];
      if (!url) { toast({ title: "Failed", description: "File URL not available", variant: "destructive" }); return; }
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = blobUrl;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast({ title: "Failed", description: "Could not download", variant: "destructive" });
    }
  };

  // Click card → open preview
  const handleCardClick = (doc: Document) => {
    const url = presignedUrls[doc.id];
    if (url) {
      setPreviewDoc({ url, name: doc.name, mime: doc.mime_type });
    } else {
      toast({ title: "Loading", description: "File is still loading, try again" });
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = documents.filter((d) =>
    (d.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative min-h-screen overflow-hidden"
    >
      {/* ── Vibrant ocean background ──────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/70 via-purple-50/40 to-sky-100/60" />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-br from-purple-300/30 to-violet-400/20 blur-[100px]"
          style={{ top: "-15%", right: "-10%" }}
          animate={{ x: [0, 40, 0, -30, 0], y: [0, 30, 0, -20, 0], scale: [1, 1.05, 1, 0.97, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-300/25 to-cyan-300/15 blur-[100px]"
          style={{ bottom: "0%", left: "-10%" }}
          animate={{ x: [0, -35, 0, 25, 0], y: [0, -25, 0, 20, 0], scale: [1, 0.96, 1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-fuchsia-200/20 to-pink-300/15 blur-[100px]"
          style={{ top: "35%", left: "25%" }}
          animate={{ x: [0, 20, 0, -15, 0], y: [0, -15, 0, 12, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-br from-indigo-200/20 to-blue-200/15 blur-[80px]"
          style={{ top: "60%", right: "15%" }}
          animate={{ x: [0, -20, 0, 15, 0], y: [0, 10, 0, -12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Waves */}
        <svg className="absolute bottom-0 left-0 w-full h-48 opacity-[0.08]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <motion.path
            fill="url(#waveGrad)"
            d="M0,160L60,176C120,192,240,224,360,218.7C480,213,600,171,720,154.7C840,139,960,149,1080,170.7C1200,192,1320,224,1380,240L1440,256L1440,320L0,320Z"
            animate={{ d: [
              "M0,160L60,176C120,192,240,224,360,218.7C480,213,600,171,720,154.7C840,139,960,149,1080,170.7C1200,192,1320,224,1380,240L1440,256L1440,320L0,320Z",
              "M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,229.3C840,245,960,235,1080,208C1200,181,1320,139,1380,117.3L1440,96L1440,320L0,320Z",
              "M0,160L60,176C120,192,240,224,360,218.7C480,213,600,171,720,154.7C840,139,960,149,1080,170.7C1200,192,1320,224,1380,240L1440,256L1440,320L0,320Z",
            ] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.txt,.md,.pptx"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {/* ── Drag overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/90 to-blue-50/90 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4 p-16 rounded-3xl border-2 border-dashed border-purple-300 bg-white/60">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <CloudUpload className="h-14 w-14 text-purple-500" />
              </motion.div>
              <p className="text-lg font-semibold text-purple-700">Drop to upload</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Preview Modal ─────────────────────────────── */}
      <AnimatePresence>
        {previewDoc && (
          <FullPreview
            url={previewDoc.url}
            name={previewDoc.name}
            mime={previewDoc.mime}
            onClose={() => setPreviewDoc(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* ── Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
            <p className="text-sm text-gray-400 mt-1">
              {documents.length} file{documents.length !== 1 ? "s" : ""}
              {documents.length > 0 && ` \u00b7 ${formatFileSize(documents.reduce((s, d) => s + (d.file_size || 0), 0))}`}
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-300/40 hover:shadow-purple-400/50 transition-all hover:-translate-y-0.5"
          >
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload
          </Button>
        </motion.div>

        {/* ── Ask AI CTA ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate("/chat")}
          className="mb-8 group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/30 hover:bg-white/80">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.04] via-transparent to-blue-500/[0.04] pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 shadow-inner flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                    What do you want to know?
                  </h3>
                  <p className="text-xs text-gray-400">AI-powered search across all your documents</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50/80 border border-gray-100 text-sm text-gray-300">
                  <MessageSquareText className="h-4 w-4" />
                  <span>Ask anything...</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Search + bulk actions ────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <Input
              placeholder="Search documents..."
              className="pl-10 h-10 bg-white/70 backdrop-blur-sm border-white/80 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-300 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {selectedDocs.size > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Button variant="destructive" onClick={() => handleDelete(Array.from(selectedDocs))} className="h-10 rounded-xl shadow-md">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedDocs.size})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Content ─────────────────────────────────────── */}
        {isLoading && documents.length === 0 ? (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <p className="mt-3 text-sm text-gray-400">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/80 border border-white shadow-lg flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-700">{searchQuery ? "No matches" : "No documents yet"}</h3>
            <p className="text-sm text-gray-400 mt-1">{searchQuery ? "Try a different search" : "Upload files to get started"}</p>
            {!searchQuery && (
              <Button className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            )}
          </motion.div>
        ) : (
          /* ── Stacked floating cards ─────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((doc, index) => {
              const gradient = getCardGradient(doc.mime_type, index);
              const float = getFloatAnimation(index);
              const stack = getStackStyle(index);
              const isSelected = selectedDocs.has(doc.id);
              const isHovered = hoveredId === doc.id;
              const isPdf = doc.mime_type === "application/pdf";
              const isImage = (doc.mime_type || "").includes("image/");
              const thumbUrl = presignedUrls[doc.id];

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 30, rotate: stack.rotate * 2 }}
                  animate={{ opacity: 1, y: 0, rotate: stack.rotate }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05, duration: 0.5, type: "spring", stiffness: 120 }}
                  style={{ zIndex: isHovered ? 50 : stack.zIndex }}
                  className="relative"
                  onMouseEnter={() => setHoveredId(doc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.div
                    animate={isHovered ? { y: -8, rotate: 0, scale: 1.03 } : float.animate}
                    transition={isHovered ? { duration: 0.3, ease: "easeOut" } : float.transition}
                  >
                    <div
                      onClick={() => handleCardClick(doc)}
                      className={`
                        relative cursor-pointer rounded-2xl overflow-hidden
                        border-2 transition-all duration-300
                        shadow-lg ${gradient.glow}
                        ${isSelected
                          ? "border-purple-400 ring-2 ring-purple-200/60 shadow-xl shadow-purple-200/40"
                          : isHovered
                            ? "border-white/90 shadow-2xl"
                            : "border-white/70 shadow-lg"
                        }
                      `}
                    >
                      {/* Thumbnail / preview area */}
                      <div className={`relative h-40 bg-gradient-to-br ${gradient.card} flex items-center justify-center overflow-hidden`}>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-[0.03]"
                          style={{
                            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                            backgroundSize: "16px 16px",
                          }}
                        />

                        {/* Real thumbnail: image or PDF first page */}
                        {isImage && thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={doc.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : isPdf && thumbUrl ? (
                          <PdfThumbnail url={thumbUrl} />
                        ) : (
                          <motion.div
                            animate={isHovered ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                          >
                            <div className="absolute -bottom-1 -right-1 w-14 h-14 rounded-xl bg-white/40 rotate-6" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-14 h-14 rounded-xl bg-white/60 rotate-3" />
                            <div className={`relative w-14 h-14 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center ${gradient.icon}`}>
                              {getFileIcon(doc.mime_type)}
                            </div>
                          </motion.div>
                        )}

                        {/* Fade overlay at bottom for text readability */}
                        {(isImage || isPdf) && thumbUrl && (
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                        )}

                        {/* File type label */}
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/70 backdrop-blur-sm text-gray-500 shadow-sm">
                            {getFileLabel(doc.mime_type)}
                          </span>
                        </div>

                        {/* Selection checkbox */}
                        <div className="absolute top-3 right-3" onClick={(e) => toggleSelect(doc.id, e)}>
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center transition-all
                            ${isSelected
                              ? "bg-purple-600 shadow-lg"
                              : isHovered
                                ? "bg-white/80 border-2 border-purple-300 shadow-sm"
                                : "bg-white/50 border-2 border-white/60 opacity-0 group-hover:opacity-100"
                            }
                          `}
                          style={{ opacity: isSelected || isHovered ? 1 : 0 }}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="bg-white p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-gray-800 truncate flex-1" title={doc.name}>
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate("/chat")}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Ask AI"
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-3">
                          {getFileLabel(doc.mime_type)} &middot; {formatDate(doc.created_at)} &middot; {formatFileSize(doc.file_size)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shadow-sm ${getStatusDot(doc.status)}`} />
                            <span className="text-[11px] text-gray-400 capitalize">{doc.status}</span>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                <DropdownMenuItem onClick={() => handleDelete([doc.id])} className="gap-2 cursor-pointer text-sm text-red-600 focus:text-red-600">
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Empty upload zone ────────────────────────────── */}
        {documents.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 cursor-pointer group"
          >
            <div className="rounded-2xl border-2 border-dashed border-purple-200/60 hover:border-purple-300 bg-white/40 backdrop-blur-sm p-14 text-center transition-all hover:bg-white/60">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 mb-4"
              >
                <CloudUpload className="h-7 w-7 text-purple-400" />
              </motion.div>
              <p className="font-medium text-gray-600 group-hover:text-purple-600 transition-colors">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-300 mt-1">PDF, DOCX, XLSX, Images, CSV, TXT</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Documents;
