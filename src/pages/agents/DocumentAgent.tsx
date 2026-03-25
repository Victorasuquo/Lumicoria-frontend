import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Upload, Sparkles, CheckCircle2, Send,
  File, FileImage, FileSpreadsheet, Calendar, Plus,
  ListChecks, Tag, Trash2, Eye, Loader2,
  X, Clock, AlertCircle, Check, ChevronRight,
  Circle, PlayCircle, CheckCircle, XCircle, PauseCircle,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { documentApi, Document } from "@/services/api";

/* ── Helpers ────────────────────────────────────────────────── */

const typeIcons: Record<string, React.ElementType> = {
  pdf: FileText, docx: File, txt: File, image: FileImage,
  spreadsheet: FileSpreadsheet, presentation: FileSpreadsheet, other: File,
};

const statusConfig: Record<string, { label: string; cls: string; icon?: React.ElementType }> = {
  uploaded:   { label: "Uploaded",   cls: "bg-gray-50 text-gray-500 border-gray-200" },
  processing: { label: "Processing", cls: "bg-amber-50 text-amber-600 border-amber-200", icon: Loader2 },
  processed:  { label: "Processed",  cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  failed:     { label: "Failed",     cls: "bg-red-50 text-red-500 border-red-200", icon: AlertCircle },
  archived:   { label: "Archived",   cls: "bg-slate-50 text-slate-500 border-slate-200" },
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-blue-100 text-blue-700 border-blue-200",
  low:      "bg-gray-100 text-gray-600 border-gray-200",
};

const extractionColors: Record<string, string> = {
  Date: "bg-blue-50 text-blue-600", Amount: "bg-emerald-50 text-emerald-600",
  Person: "bg-violet-50 text-violet-600", Action: "bg-orange-50 text-orange-600",
  Organization: "bg-pink-50 text-pink-600", Key_Point: "bg-cyan-50 text-cyan-600",
};

const taskStatusConfig: Record<string, { label: string; icon: React.ElementType; cls: string; badgeCls: string }> = {
  todo:        { label: "To Do",       icon: Circle,      cls: "text-gray-400",   badgeCls: "bg-gray-100 text-gray-600 border-gray-200" },
  in_progress: { label: "In Progress", icon: PlayCircle,  cls: "text-blue-500",   badgeCls: "bg-blue-100 text-blue-600 border-blue-200" },
  completed:   { label: "Completed",   icon: CheckCircle, cls: "text-emerald-500", badgeCls: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  cancelled:   { label: "Cancelled",   icon: XCircle,     cls: "text-red-400",    badgeCls: "bg-red-100 text-red-500 border-red-200" },
  blocked:     { label: "Blocked",     icon: PauseCircle, cls: "text-amber-500",  badgeCls: "bg-amber-100 text-amber-600 border-amber-200" },
  deferred:    { label: "Deferred",    icon: Clock,       cls: "text-slate-400",  badgeCls: "bg-slate-100 text-slate-500 border-slate-200" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

/* ── Types for extracted data ──────────────────────────────── */

interface ExtractedItem { type: string; value: string; context?: string }
interface AutoTask {
  title: string;
  description?: string;
  priority: string;
  deadline?: string | null;
  assignee?: string | null;
  status?: string;
}

/* ── Task Detail Popup ─────────────────────────────────────── */

interface TaskDetailPopupProps {
  task: AutoTask;
  index: number;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
}

const TaskDetailPopup: React.FC<TaskDetailPopupProps> = ({ task, index, onClose, onStatusChange }) => {
  const pri = task.priority?.toLowerCase() || "medium";
  const taskStatus = task.status || "todo";
  const si = taskStatusConfig[taskStatus] || taskStatusConfig.todo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${priorityColors[pri] || priorityColors.medium}`}>
                  {task.priority || "Medium"}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${si.badgeCls}`}>
                  <si.icon size={10} className="mr-1" />
                  {si.label}
                </Badge>
                <span className="text-[10px] text-gray-300">#{index + 1}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 leading-snug">{task.title}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {task.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {task.deadline && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Deadline</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Clock size={13} className="text-gray-400" />
                  {task.deadline}
                </div>
              </div>
            )}
            {task.assignee && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Assignee</p>
                <p className="text-sm text-gray-700">{task.assignee}</p>
              </div>
            )}
          </div>

          {/* Status Change */}
          {onStatusChange && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Change Status</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(taskStatusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => onStatusChange(key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      taskStatus === key
                        ? config.badgeCls + " font-medium"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <config.icon size={11} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ── Component ─────────────────────────────────────────────── */

const DocumentAgent: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState("extracted");
  const [creatingTasks, setCreatingTasks] = useState(false);

  // Task detail popup
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  // Query state
  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<{ query: string; response: string } | null>(null);

  // Polling for processing documents
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Derived stats ────────────────────────────────────── */
  const totalDocs = documents.length;
  const processedDocs = documents.filter(d => d.status === "processed").length;
  const processingDocs = documents.filter(d => d.status === "processing").length;

  /* ── Fetch documents ──────────────────────────────────── */

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await documentApi.getDocuments();
      const docArray = Array.isArray(docs) ? docs : [];
      setDocuments(docArray);

      // Update selected doc if it changed
      if (selectedDoc) {
        const updated = docArray.find(d => d.id === selectedDoc.id);
        if (updated) setSelectedDoc(updated);
      }

      return docArray;
    } catch (error) {
      console.error("Failed to fetch documents", error);
      return [];
    }
  }, [selectedDoc?.id]);

  useEffect(() => {
    setLoading(true);
    fetchDocuments().finally(() => setLoading(false));
  }, []);

  // Poll while any document is processing
  useEffect(() => {
    if (processingDocs > 0) {
      pollingRef.current = setInterval(() => fetchDocuments(), 3000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [processingDocs]);

  /* ── Upload ───────────────────────────────────────────── */

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of fileArray) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "other";
        const typeMap: Record<string, string> = {
          pdf: "pdf", docx: "docx", doc: "docx", txt: "txt",
          xlsx: "spreadsheet", xls: "spreadsheet", csv: "spreadsheet",
          png: "image", jpg: "image", jpeg: "image", gif: "image",
          pptx: "presentation", ppt: "presentation",
        };
        await documentApi.uploadDocument(file, file.name, typeMap[ext] || "other");
        successCount++;
      } catch (error) {
        console.error(`Failed to upload ${file.name}`, error);
        toast({ title: "Upload failed", description: `Could not upload ${file.name}`, variant: "destructive" });
      }
    }

    if (successCount > 0) {
      toast({ title: "Uploaded", description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded — processing started automatically` });
      await fetchDocuments();
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
  };

  /* ── Create tasks from auto-extracted tasks ───────────── */

  const handleCreateTasks = async () => {
    if (!selectedDoc) return;
    setCreatingTasks(true);
    try {
      const result = await documentApi.createTasksFromDocument(selectedDoc.id);
      toast({
        title: "Tasks created",
        description: `${result.tasks_created} task${result.tasks_created !== 1 ? "s" : ""} saved to your task list`,
      });
    } catch (error: any) {
      toast({
        title: "Task creation failed",
        description: error?.response?.data?.detail || "Could not create tasks",
        variant: "destructive",
      });
    } finally {
      setCreatingTasks(false);
    }
  };

  /* ── Query document ───────────────────────────────────── */

  const handleQuery = async () => {
    if (!selectedDoc || !query.trim()) return;
    setQuerying(true);
    setQueryResult(null);
    try {
      const result = await documentApi.queryDocument(selectedDoc.id, query.trim());
      setQueryResult({ query: result.query, response: result.response });
    } catch (error: any) {
      toast({
        title: "Query failed",
        description: error?.response?.data?.detail || "Could not query document",
        variant: "destructive",
      });
    } finally {
      setQuerying(false);
    }
  };

  /* ── Delete ───────────────────────────────────────────── */

  const handleDelete = async (doc: Document) => {
    try {
      await documentApi.deleteDocument(doc.id);
      toast({ title: "Deleted", description: `"${doc.name}" has been deleted` });
      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
      await fetchDocuments();
    } catch {
      toast({ title: "Delete failed", description: "Could not delete document", variant: "destructive" });
    }
  };

  /* ── View original file ───────────────────────────────── */

  const handleView = async (doc: Document) => {
    try {
      const { url } = await documentApi.getPresignedUrl(doc.id);
      window.open(url, "_blank");
    } catch {
      toast({ title: "Error", description: "Could not get document URL", variant: "destructive" });
    }
  };

  /* ── Parse extraction result ──────────────────────────── */

  const getExtractionItems = (doc: Document | null): ExtractedItem[] => {
    if (!doc?.extraction_result) return [];
    const r = doc.extraction_result;
    const items: ExtractedItem[] = [];

    // Try structured categories first
    const map: Record<string, string> = {
      dates: "Date", names: "Person", organizations: "Organization",
      monetary_amounts: "Amount", action_items: "Action", key_points: "Key_Point",
    };

    for (const [key, label] of Object.entries(map)) {
      const arr = r[key];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          items.push({
            type: label,
            value: typeof item === "string" ? item : item.text || JSON.stringify(item),
            context: item.context,
          });
        }
      }
    }
    return items;
  };

  const getAnalysisText = (doc: Document | null): string => {
    if (!doc?.extraction_result) return "";
    const r = doc.extraction_result;
    // The LLM returns the analysis as a text string
    if (typeof r.analysis === "string") return r.analysis;
    if (typeof r.raw_extraction === "string") return r.raw_extraction;
    return "";
  };

  const getAutoTasks = (doc: Document | null): AutoTask[] => {
    if (!doc) return [];
    // Try metadata.auto_tasks first (set during background processing)
    const fromMeta = doc.metadata?.auto_tasks;
    if (Array.isArray(fromMeta) && fromMeta.length > 0) return fromMeta;
    // Then try extraction_result.tasks
    const fromExtraction = doc.extraction_result?.tasks;
    if (Array.isArray(fromExtraction) && fromExtraction.length > 0) return fromExtraction;
    return [];
  };

  /* ── Render ───────────────────────────────────────────── */

  const autoTasks = getAutoTasks(selectedDoc);
  const extractionItems = getExtractionItems(selectedDoc);
  const analysisText = getAnalysisText(selectedDoc);

  return (
    <AgentPageLayout
      agentName="Document Agent"
      tagline="Automatically extract key information and create tasks, events, and reminders"
      icon={FileText}
      gradient="from-violet-500 to-purple-600"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.pptx,.ppt"
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Documents", value: totalDocs, icon: FileText, color: "text-violet-500" },
          { label: "Processed", value: processedDocs, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Processing", value: processingDocs, icon: Loader2, color: "text-amber-500" },
          { label: "Items Extracted", value: documents.reduce((s, d) => s + getExtractionItems(d).length, 0), icon: Tag, color: "text-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left: Upload + Document List ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
              isDragging ? "border-lumicoria-purple bg-lumicoria-purple/5" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-2">
              {uploading ? <Loader2 size={18} className="text-lumicoria-purple animate-spin" /> : <Upload size={18} className="text-gray-400" />}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? "Uploading..." : "Drop files or click to upload"}
            </p>
            <p className="text-xs text-gray-400 mb-3">PDF, DOCX, XLSX, Images — up to 50MB</p>
            <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </Button>
          </div>

          {/* Document List */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
              <span className="text-xs text-gray-400">{documents.length} total</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="text-gray-300 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FileText size={32} className="opacity-20 mb-3" />
                <p className="text-sm font-medium">No documents yet</p>
                <p className="text-xs mt-1">Upload a file to get started</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <div className="divide-y divide-gray-50">
                  {documents.map((doc, i) => {
                    const Icon = typeIcons[doc.document_type] || File;
                    const si = statusConfig[doc.status] || statusConfig.uploaded;
                    const isSelected = selectedDoc?.id === doc.id;

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => { setSelectedDoc(doc); setActiveTab("extracted"); setQueryResult(null); setSelectedTaskIndex(null); }}
                        className={`group p-3.5 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                          isSelected ? "bg-purple-50/50 border-l-2 border-l-purple-500" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-400">{formatFileSize(doc.file_size)}</span>
                            <span className="text-gray-200">&middot;</span>
                            <span className="text-[11px] text-gray-400">{formatDate(doc.created_at)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${si.cls}`}>
                          {doc.status === "processing" && <Loader2 size={10} className="mr-1 animate-spin" />}
                          {si.label}
                        </Badge>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                          className="p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 size={12} className="text-gray-300 hover:text-red-500" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* ── Right: Detail Panel ── */}
        <div className="lg:col-span-3 space-y-6">
          {selectedDoc ? (
            <>
              {/* Document Header */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{selectedDoc.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatFileSize(selectedDoc.file_size)} &middot; {selectedDoc.document_type.toUpperCase()} &middot; {formatDate(selectedDoc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500" onClick={() => handleView(selectedDoc)}>
                      <Eye size={12} className="mr-1" /> View
                    </Button>
                    <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-gray-100 rounded">
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Processing progress */}
                {selectedDoc.status === "processing" && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Loader2 size={12} className="text-amber-500 animate-spin" />
                      <span className="text-xs text-amber-600 font-medium">Processing document...</span>
                    </div>
                    <Progress value={65} className="h-1.5" />
                    <p className="text-[10px] text-gray-400 mt-1">Extracting data, generating tasks & calendar events</p>
                  </div>
                )}

                {selectedDoc.status === "failed" && (
                  <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-600">
                      <AlertCircle size={12} className="inline mr-1" />
                      Processing failed: {selectedDoc.extraction_result?.extraction_error || "Unknown error"}
                    </p>
                  </div>
                )}
              </div>

              {/* Tabs: Extracted Data | Tasks | Calendar */}
              {selectedDoc.status === "processed" && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-gray-100 px-4 pt-3">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 h-9">
                        <TabsTrigger value="extracted" className="text-xs data-[state=active]:bg-white">
                          <Tag size={12} className="mr-1.5" /> Extracted Data
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="text-xs data-[state=active]:bg-white">
                          <ListChecks size={12} className="mr-1.5" /> Tasks ({autoTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="text-xs data-[state=active]:bg-white">
                          <Calendar size={12} className="mr-1.5" /> Calendar
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* ─── Extracted Data Tab ─── */}
                    <TabsContent value="extracted" className="p-4 m-0">
                      {(() => {
                        const hasStructured = extractionItems.length > 0;
                        const hasAnalysis = analysisText.length > 0;

                        if (!hasStructured && !hasAnalysis) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <Sparkles size={20} className="mx-auto mb-2 opacity-30" />
                              <p className="text-xs">No structured data extracted</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {/* Structured items */}
                            {hasStructured && (
                              <div className="space-y-2.5">
                                {extractionItems.map((item, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="flex items-start gap-3"
                                  >
                                    <Badge className={`text-[10px] px-2 py-0 shrink-0 mt-0.5 ${extractionColors[item.type] || "bg-gray-50 text-gray-600"}`}>
                                      {item.type}
                                    </Badge>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800">{item.value}</p>
                                      {item.context && <p className="text-xs text-gray-400">{item.context}</p>}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {/* Raw analysis text */}
                            {hasAnalysis && (
                              <div className={hasStructured ? "border-t border-gray-100 pt-4" : ""}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles size={12} className="text-purple-400" />
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Analysis</p>
                                </div>
                                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{analysisText}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </TabsContent>

                    {/* ─── Tasks Tab ─── */}
                    <TabsContent value="tasks" className="p-4 m-0">
                      {(() => {
                        if (autoTasks.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <ListChecks size={20} className="mx-auto mb-2 opacity-30" />
                              <p className="text-xs">No tasks found in this document</p>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-2">
                            {autoTasks.map((task, i) => {
                              const pri = task.priority?.toLowerCase() || "medium";
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.04 }}
                                  onClick={() => setSelectedTaskIndex(i)}
                                  className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 cursor-pointer transition-colors group"
                                >
                                  <div className="mr-3">
                                    <CheckCircle2 size={16} className="text-lumicoria-purple opacity-70" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                                    {task.description && (
                                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-2.5 mt-1.5">
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[pri] || priorityColors.medium}`}>
                                        {task.priority || "Medium"}
                                      </Badge>
                                      {task.deadline && (
                                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                          <Clock size={10} /> {task.deadline}
                                        </span>
                                      )}
                                      {task.assignee && (
                                        <span className="text-[11px] text-gray-400">{task.assignee}</span>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 ml-2" />
                                </motion.div>
                              );
                            })}

                            {/* Add task placeholder */}
                            <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                              <Plus size={14} className="mr-2" />
                              <span className="text-xs">Add task manually</span>
                            </div>

                            {/* Create Tasks button */}
                            <Button
                              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs mt-2"
                              disabled={creatingTasks}
                              onClick={handleCreateTasks}
                            >
                              {creatingTasks ? (
                                <Loader2 size={14} className="mr-2 animate-spin" />
                              ) : (
                                <Check size={14} className="mr-2" />
                              )}
                              {creatingTasks ? "Creating Tasks..." : `Create ${autoTasks.length} Task${autoTasks.length !== 1 ? "s" : ""}`}
                            </Button>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    {/* ─── Calendar Tab ─── */}
                    <TabsContent value="calendar" className="p-4 m-0">
                      {(() => {
                        const dateItems = extractionItems.filter(i => i.type === "Date");
                        const taskDeadlines = autoTasks.filter(t => t.deadline);

                        if (dateItems.length === 0 && taskDeadlines.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <Calendar size={20} className="mx-auto mb-2 opacity-30" />
                              <p className="text-xs">No dates found in this document</p>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-3">
                            {/* Dates from extraction */}
                            {dateItems.map((item, i) => (
                              <motion.div
                                key={`date-${i}`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                              >
                                <div className="mr-3">
                                  <Calendar size={16} className="text-lumicoria-purple opacity-70" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800">{item.context || "Event"}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{item.value}</p>
                                </div>
                              </motion.div>
                            ))}

                            {/* Task deadlines */}
                            {taskDeadlines.map((task, i) => (
                              <motion.div
                                key={`task-${i}`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (dateItems.length + i) * 0.04 }}
                                className="flex items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                              >
                                <div className="mr-3">
                                  <Clock size={16} className="text-blue-500 opacity-70" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                                  <p className="text-xs text-blue-600 mt-0.5">Deadline: {task.deadline}</p>
                                </div>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority?.toLowerCase() || "medium"]}`}>
                                  {task.priority || "Medium"}
                                </Badge>
                              </motion.div>
                            ))}

                            <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                              <Plus size={14} className="mr-2" />
                              <span className="text-xs">Add event manually</span>
                            </div>

                            <Button variant="outline" className="w-full border-gray-200 h-9 text-xs mt-2">
                              <Calendar size={14} className="mr-2" />
                              Add to Calendar
                            </Button>
                          </div>
                        );
                      })()}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Query Document */}
              {selectedDoc.status === "processed" && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Ask about this document</h3>
                  <div className="flex gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                      placeholder="e.g. What is the total amount? Who are the parties involved?"
                      className="text-sm h-9 border-gray-200 bg-gray-50/50"
                      disabled={querying}
                    />
                    <Button
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0"
                      onClick={handleQuery}
                      disabled={querying || !query.trim()}
                    >
                      {querying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {queryResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Q: {queryResult.query}</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{queryResult.response}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="bg-white border border-gray-100 rounded-2xl p-12 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600">Select a document</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Upload a document and it will be automatically processed. Click on any document to view extracted data, tasks, and calendar events.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Popup */}
      <AnimatePresence>
        {selectedTaskIndex !== null && autoTasks[selectedTaskIndex] && (
          <TaskDetailPopup
            task={autoTasks[selectedTaskIndex]}
            index={selectedTaskIndex}
            onClose={() => setSelectedTaskIndex(null)}
          />
        )}
      </AnimatePresence>
    </AgentPageLayout>
  );
};

export default DocumentAgent;
