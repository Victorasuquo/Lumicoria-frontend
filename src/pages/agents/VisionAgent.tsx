import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Camera, Upload, Eye, FileText, Scan,
  Box, Type, Layers, Clock, ChevronRight, Send, X, Loader2,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AgentPageLayout from "@/components/AgentPageLayout";
import {
  visionApi,
  type VisionAnalysis,
  type VisionHistoryItem,
  type VisualQAResponse,
} from "@/services/api";

type AnalysisMode = "general" | "ocr";

const VisionAgent: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("upload");
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("general");
  const [customPrompt, setCustomPrompt] = useState("");

  // File + preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Current analysis
  const [currentAnalysis, setCurrentAnalysis] = useState<VisionAnalysis | null>(null);

  // Q&A
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["vision-stats"],
    queryFn: () => visionApi.getStats(),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["vision-history"],
    queryFn: () => visionApi.getHistory({ limit: 10 }),
  });

  // ── Mutations ────────────────────────────────────────────────────
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      const options = customPrompt.trim() ? { prompt: customPrompt } : undefined;
      if (analysisMode === "ocr") {
        return visionApi.ocr(selectedFile);
      }
      return visionApi.analyze(selectedFile, options);
    },
    onSuccess: (data) => {
      setCurrentAnalysis(data);
      setQaHistory([]);
      queryClient.invalidateQueries({ queryKey: ["vision-stats"] });
      queryClient.invalidateQueries({ queryKey: ["vision-history"] });
    },
  });

  const qaMutation = useMutation({
    mutationFn: async (q: string) => {
      if (!currentAnalysis) throw new Error("No analysis");
      return visionApi.query(currentAnalysis.id, q);
    },
    onSuccess: (data: VisualQAResponse) => {
      setQaHistory((prev) => [...prev, { q: data.question, a: data.answer }]);
      setQuestion("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => visionApi.deleteAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-history"] });
      queryClient.invalidateQueries({ queryKey: ["vision-stats"] });
    },
  });

  // ── Camera ───────────────────────────────────────────────────────
  // Keep stream in a ref so we can access it without stale closures
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStream(stream);
      // Don't try to attach here — the video element may not be rendered yet.
      // The effect below handles it after React re-renders.
    } catch (err) {
      setCameraError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "Could not access camera. Make sure a camera is connected.",
      );
    }
  }, []);

  // Attach the stream to the <video> element whenever both exist
  useEffect(() => {
    const video = videoRef.current;
    if (video && cameraStream) {
      video.srcObject = cameraStream;
      video.play().catch(() => {});
    }
  }, [cameraStream]);

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCurrentAnalysis(null);
      setQaHistory([]);
      stopCamera();
      setActiveTab("upload");
    }, "image/jpeg", 0.92);
  }, [stopCamera]);

  // Stop camera when switching away from camera tab
  useEffect(() => {
    if (activeTab !== "camera" && streamRef.current) {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ── File handling ────────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCurrentAnalysis(null);
    setQaHistory([]);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentAnalysis(null);
    setQaHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadHistory = async (item: VisionHistoryItem) => {
    try {
      const detail = await visionApi.getDetail(item.id);
      setCurrentAnalysis({
        id: detail._id,
        description: detail.description,
        structured_analysis: detail.structured_analysis,
        image_url: detail.image_url,
        processed_at: detail.processed_at,
        model_used: detail.model_used,
        citations: detail.citations,
        analysis_type: detail.analysis_type,
      });
      setQaHistory(
        (detail.conversations || []).map((c) => ({ q: c.question, a: c.answer })),
      );
      if (detail.image_url) {
        setPreviewUrl(detail.image_url);
        setSelectedFile(null);
      }
    } catch {
      // ignore
    }
  };

  // ── Quick actions ────────────────────────────────────────────────
  const quickActions = [
    {
      label: "Scan Document",
      icon: FileText,
      color: "from-violet-500 to-purple-600",
      onClick: () => {
        setAnalysisMode("general");
        setCustomPrompt("Scan this document. Extract all text, identify document type, and summarize key information.");
        fileInputRef.current?.click();
      },
    },
    {
      label: "Analyze Workspace",
      icon: Layers,
      color: "from-emerald-500 to-teal-600",
      onClick: () => {
        setAnalysisMode("general");
        setCustomPrompt("Analyze this workspace/environment. Describe the setup, objects, organization, and any notable elements.");
        fileInputRef.current?.click();
      },
    },
    {
      label: "Recognize Objects",
      icon: Box,
      color: "from-blue-500 to-indigo-600",
      onClick: () => {
        setAnalysisMode("general");
        setCustomPrompt("Identify and list every object visible in this image with descriptions and approximate locations.");
        fileInputRef.current?.click();
      },
    },
    {
      label: "Read Text",
      icon: Type,
      color: "from-amber-500 to-orange-600",
      onClick: () => {
        setAnalysisMode("ocr");
        setCustomPrompt("");
        fileInputRef.current?.click();
      },
    },
  ];

  // ── Derived data ─────────────────────────────────────────────────
  const sa = currentAnalysis?.structured_analysis;
  const detections: Array<{ type: string; value: string }> = [];
  if (sa) {
    (sa.detected_objects || []).forEach((v) => detections.push({ type: "Object", value: v }));
    (sa.detected_text || []).forEach((v) => detections.push({ type: "Text", value: v }));
    if (sa.scene_type) detections.push({ type: "Scene", value: sa.scene_type });
  }

  const statItems = [
    { label: "Scans", value: stats?.total_scans ?? 0, icon: Scan, color: "text-sky-500" },
    { label: "Objects Found", value: stats?.objects_found ?? 0, icon: Box, color: "text-violet-500" },
    { label: "Text Extracted", value: stats?.text_extracted ?? 0, icon: Type, color: "text-emerald-500" },
    { label: "Avg. Time", value: `${stats?.avg_processing_time?.toFixed(1) ?? "0.0"}s`, icon: Clock, color: "text-amber-500" },
  ];

  return (
    <AgentPageLayout
      agentName="Vision Agent"
      tagline="See and understand the world"
      icon={Camera}
      gradient="from-sky-500 to-cyan-600"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statItems.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-2`}>
              <action.icon size={14} />
            </div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{action.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Upload + Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload area */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-50">
              {(["upload", "camera"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-medium transition-colors ${
                    activeTab === tab ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "camera" ? "Camera" : "Upload"}
                </button>
              ))}
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {activeTab === "camera" ? (
              <div className="bg-gray-950 flex flex-col items-center">
                {cameraStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full object-contain"
                      style={{ maxHeight: 360 }}
                    />
                    <div className="flex items-center gap-3 py-4 bg-gray-950 w-full justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="relative h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                        title="Capture photo"
                      >
                        <div className="w-10 h-10 rounded-full border-[3px] border-gray-900" />
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="h-10 px-4 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-1.5 transition-colors"
                        title="Stop camera"
                      >
                        <X size={14} />
                        Stop
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                      <Camera size={28} className="text-white/60" />
                    </div>
                    {cameraError ? (
                      <p className="text-sm text-red-400 mb-4 text-center px-6">{cameraError}</p>
                    ) : (
                      <p className="text-sm text-white/50 mb-4">Take a photo with your camera</p>
                    )}
                    <Button
                      size="sm"
                      onClick={startCamera}
                      className="bg-sky-500 hover:bg-sky-600 text-white h-8 px-4 text-xs"
                    >
                      <Camera size={12} className="mr-1.5" />
                      Activate Camera
                    </Button>
                  </div>
                )}
              </div>
            ) : previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[400px] object-contain bg-gray-50"
                />
                <button
                  onClick={clearSelection}
                  className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X size={14} />
                </button>
                {!currentAnalysis && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setAnalysisMode("general"); analyzeMutation.mutate(); }}
                      disabled={analyzeMutation.isPending}
                      className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs shadow-lg"
                    >
                      {analyzeMutation.isPending && analysisMode === "general" ? (
                        <><Loader2 size={12} className="mr-1.5 animate-spin" />Analyzing...</>
                      ) : (
                        <><Scan size={12} className="mr-1.5" />Analyze</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => { setAnalysisMode("ocr"); analyzeMutation.mutate(); }}
                      disabled={analyzeMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 text-xs shadow-lg"
                    >
                      {analyzeMutation.isPending && analysisMode === "ocr" ? (
                        <><Loader2 size={12} className="mr-1.5 animate-spin" />Reading...</>
                      ) : (
                        <><Type size={12} className="mr-1.5" />Read Text</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-8 flex flex-col items-center justify-center border-2 border-dashed m-4 rounded-xl min-h-[240px] transition-colors cursor-pointer ${
                  isDragging ? "border-sky-400 bg-sky-50/50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Upload size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Drop an image here</p>
                <p className="text-xs text-gray-400 mb-4">PNG, JPG, WEBP — up to 20MB</p>
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Analysis error */}
          {analyzeMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
              Analysis failed: {(analyzeMutation.error as Error)?.message || "Unknown error"}
            </div>
          )}

          {/* Analyzing indicator */}
          {analyzeMutation.isPending && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex flex-col items-center">
              <Loader2 size={28} className="text-sky-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {analysisMode === "ocr" ? "Extracting text..." : "Analyzing image..."}
              </p>
              <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Analysis Results */}
          {currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50/60 to-sky-50 border border-purple-100/60 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-purple-100/40">
                <div className="flex items-center gap-2">
                  <Eye size={13} className="text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700">Analysis Results</span>
                </div>
                <Badge className="text-[9px] bg-purple-100 text-purple-600 border-0 px-1.5 py-0">
                  {currentAnalysis.analysis_type === "ocr" ? "OCR" : "General"}
                </Badge>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {/* Markdown description */}
                <div className="p-4 overflow-x-hidden break-words">
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
                    prose-blockquote:border-purple-300 prose-blockquote:bg-purple-100/30 prose-blockquote:rounded-r-lg prose-blockquote:py-0.5 prose-blockquote:not-italic
                    prose-hr:border-purple-200/50 prose-hr:my-3
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentAnalysis.description}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Structured detections */}
                {detections.length > 0 && (
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-purple-100/40">
                    <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-2">Detections</p>
                    {detections.map((det, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-2.5 bg-white/60 rounded-xl border border-purple-100/30"
                      >
                        <Badge className={`text-[10px] px-2 py-0 shrink-0 border-0 ${
                          det.type === "Text" ? "bg-blue-100/70 text-blue-600" :
                          det.type === "Object" ? "bg-violet-100/70 text-violet-600" :
                          "bg-emerald-100/70 text-emerald-600"
                        }`}>
                          {det.type}
                        </Badge>
                        <p className="text-[13px] text-gray-700 flex-1 break-words">{det.value}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Visual Q&A + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Q&A */}
          <div className="bg-gradient-to-br from-white to-purple-50/30 border border-purple-100/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Send size={12} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-900">Visual Q&A</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {currentAnalysis
                ? "Ask questions about the analyzed image"
                : "Upload and analyze an image first"}
            </p>

            <div className="bg-white/70 rounded-xl p-3 mb-3 min-h-[140px] max-h-[500px] overflow-y-auto space-y-3 scroll-smooth border border-purple-100/30" id="qa-scroll">
              {qaHistory.length === 0 && !currentAnalysis && (
                <p className="text-xs text-gray-400 italic">
                  Upload an image and ask questions about it...
                </p>
              )}
              {qaHistory.length === 0 && currentAnalysis && (
                <p className="text-xs text-purple-400 italic">
                  Image analyzed! Ask a question below.
                </p>
              )}
              <AnimatePresence>
                {qaHistory.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onAnimationComplete={() => {
                      document.getElementById("qa-scroll")?.scrollTo({
                        top: 99999, behavior: "smooth",
                      });
                    }}
                    className="space-y-2"
                  >
                    <div className="flex justify-end">
                      <div className="bg-purple-600 text-white text-xs rounded-xl rounded-br-sm px-3 py-2 max-w-[90%]">
                        {item.q}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/60 border border-purple-100/40 text-gray-700 text-xs rounded-xl rounded-bl-sm px-3 py-2 max-w-[95%] overflow-x-hidden break-words">
                        <div className="prose prose-sm max-w-none text-[12px] leading-relaxed
                          prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1
                          prose-h1:text-[13px] prose-h2:text-[12px] prose-h3:text-[12px]
                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-1
                          prose-strong:text-gray-800 prose-strong:font-semibold
                          prose-ul:my-1 prose-ol:my-1
                          prose-li:text-gray-700 prose-li:text-[12px]
                          prose-li:marker:text-purple-400
                          prose-code:text-purple-700 prose-code:bg-purple-100/60 prose-code:px-1 prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                        ">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.a}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {qaMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-purple-50 border border-purple-100/40 text-purple-400 text-xs rounded-xl px-3 py-2 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && question.trim() && currentAnalysis) {
                    e.preventDefault();
                    qaMutation.mutate(question.trim());
                  }
                }}
                placeholder="What do you see in this image?"
                disabled={!currentAnalysis || qaMutation.isPending}
                className="text-sm h-9 border-purple-200/60 bg-white/80 focus:border-purple-300"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (question.trim() && currentAnalysis) {
                    qaMutation.mutate(question.trim());
                  }
                }}
                disabled={!currentAnalysis || !question.trim() || qaMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-3 shrink-0"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Recent Analyses</h3>
            </div>
            {historyLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 size={20} className="text-gray-300 animate-spin" />
              </div>
            ) : !history || history.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400">No analyses yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                    onClick={() => handleLoadHistory(item)}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                        <Eye size={16} className="text-sky-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200">
                          {item.analysis_type === "ocr" ? "OCR" : item.analysis_type === "url" ? "URL" : "Scan"}
                        </Badge>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(item.id);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default VisionAgent;
