import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar, Upload, Video, Users, Clock, CheckCircle2,
  ListChecks, FileText, Play, Square, ChevronRight, Loader2, Mic,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { meetingApi, MeetingResponse, MeetingLibraryItem } from "@/services/api";
import { useTranscription } from "@/hooks/useTranscription";
import { useAuth } from "@/contexts/AuthContext";

const platforms = [
  { name: "Google Meet", img: "/images/integrations/google-meet.png", color: "text-green-600", bg: "bg-green-50" },
  { name: "Zoom", icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Microsoft Teams", icon: Video, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const MeetingAssistant: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input state — transcript can be typed/pasted OR populated by STT
  const [transcript, setTranscript] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Recording mode: "mic" (solo) or "meeting" (mic + tab audio for remote speakers)
  const [recordingMode, setRecordingMode] = useState<"mic" | "meeting">("mic");

  // Real-time speech-to-text
  const {
    isRecording,
    isConnected,
    liveText,
    startRecording,
    stopRecording,
  } = useTranscription({
    userId: user?.id,
    mode: recordingMode,
    onChunk: (text) => {
      setTranscript((prev) => (prev ? prev + " " + text : text));
    },
    onComplete: (full) => {
      if (full) setTranscript(full);
    },
    onError: (msg) => {
      toast({ title: "Recording error", description: msg, variant: "destructive" });
    },
  });

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Results — loaded from Postgres on mount
  const [currentResult, setCurrentResult] = useState<MeetingResponse | null>(null);
  const [history, setHistory] = useState<MeetingLibraryItem[]>([]);
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());

  // ── Load meeting history + draft from DB on mount ──────────────
  useEffect(() => {
    let cancelled = false;

    const loadFromDb = async () => {
      try {
        const [libraryRes, draft] = await Promise.all([
          meetingApi.getLibrary({ page: 1, limit: 50 }),
          meetingApi.getDraft(),
        ]);
        if (cancelled) return;
        setHistory(libraryRes.meetings);
        if (draft && draft.transcript) {
          setTranscript(draft.transcript);
        }
      } catch (err) {
        // Silently fail — user just sees empty state
        console.warn("Failed to load meeting data:", err);
      }
    };

    loadFromDb();
    return () => { cancelled = true; };
  }, []);

  // ── Auto-save draft (debounced) ────────────────────────────────
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

    // Don't save empty transcripts
    if (!transcript.trim()) return;

    draftTimerRef.current = setTimeout(() => {
      meetingApi.saveDraft({ transcript }).catch((err) =>
        console.warn("Draft auto-save failed:", err)
      );
    }, 2000); // 2-second debounce

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [transcript]);

  // Stats derived from all processed meetings
  const totalMeetings = history.length;
  const totalActions = history.reduce((sum, m) => sum + (m.action_items?.length ?? 0), 0);
  const totalDecisions = history.reduce((sum, m) => sum + (m.decisions?.length ?? 0), 0);
  const totalKeyPoints = history.reduce((sum, m) => sum + (m.key_points?.length ?? 0), 0);

  const handleProcess = useCallback(async () => {
    if (!transcript.trim()) {
      toast({ title: 'Paste a transcript first', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    setCompletedActions(new Set());
    try {
      const response = await meetingApi.process({
        transcript,
        metadata: { type: 'general', date: new Date().toISOString().split('T')[0] },
      });
      setCurrentResult(response);

      // Refresh library from DB to pick up the auto-saved meeting
      try {
        const lib = await meetingApi.getLibrary({ page: 1, limit: 50 });
        setHistory(lib.meetings);
      } catch { /* keep existing history */ }

      // Clear draft after successful processing
      meetingApi.deleteDraft().catch(() => {});
      setTranscript('');

      toast({ title: 'Meeting processed', description: `${response.action_items.length} action items extracted.` });
    } catch (error: any) {
      toast({ title: 'Processing failed', description: error.response?.data?.detail || error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }, [transcript, toast]);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setCompletedActions(new Set());
    try {
      const metadataJson = JSON.stringify({
        title: file.name.replace(/\.[^/.]+$/, ''),
        date: new Date().toISOString().split('T')[0],
        type: 'general',
      });
      const response = await meetingApi.upload(file, metadataJson);
      setCurrentResult(response);

      // Refresh library from DB
      try {
        const lib = await meetingApi.getLibrary({ page: 1, limit: 50 });
        setHistory(lib.meetings);
      } catch { /* keep existing history */ }

      toast({ title: 'Recording processed', description: `${response.action_items.length} action items extracted.` });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.response?.data?.detail || error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const handleGenerateSummary = handleProcess;

  const toggleAction = (i: number) => {
    setCompletedActions(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const viewHistoryItem = useCallback(async (item: MeetingLibraryItem) => {
    setCompletedActions(new Set());
    try {
      const detail = await meetingApi.getMeeting(item.id);
      setCurrentResult({
        meeting_id: detail.id,
        summary: detail.summary || '',
        action_items: detail.action_items || [],
        decisions: detail.decisions || [],
        key_points: detail.key_points || [],
        follow_ups: detail.follow_ups || [],
        processed_at: detail.processed_at || detail.created_at,
        model_used: detail.model_used || '',
        questions: detail.questions || [],
        concerns: detail.concerns || [],
        raw_response: detail.raw_response || undefined,
      });
    } catch {
      // Fallback: use the summary data from the list item
      setCurrentResult({
        meeting_id: item.id,
        summary: item.summary || '',
        action_items: item.action_items || [],
        decisions: item.decisions || [],
        key_points: item.key_points || [],
        follow_ups: item.follow_ups || [],
        processed_at: item.processed_at || item.created_at,
        model_used: item.model_used || '',
      });
    }
  }, []);

  const actionItems = currentResult?.action_items ?? [];
  const decisions = currentResult?.decisions ?? [];
  const pendingCount = actionItems.length - completedActions.size;

  return (
    <AgentPageLayout
      agentName="Meeting Assistant"
      tagline="Never miss a detail"
      icon={Calendar}
      gradient="from-emerald-500 to-teal-600"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Meetings", value: totalMeetings || "—", icon: Video, color: "text-emerald-500" },
          { label: "Action Items", value: totalActions || "—", icon: ListChecks, color: "text-blue-500" },
          { label: "Decisions", value: totalDecisions || "—", icon: CheckCircle2, color: "text-violet-500" },
          { label: "Key Points", value: totalKeyPoints || "—", icon: Clock, color: "text-amber-500" },
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

      {/* Platform Integration Cards — clicking activates meeting mode */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {platforms.map((p) => {
          const isActive = recordingMode === "meeting";
          return (
            <button
              key={p.name}
              onClick={() => {
                setRecordingMode((prev) => prev === "meeting" ? "mic" : "meeting");
                toast({
                  title: recordingMode === "meeting" ? "Switched to mic only" : "Meeting mode enabled",
                  description: recordingMode === "meeting"
                    ? "Recording will capture your microphone only."
                    : "When you start recording, you'll be asked to share the meeting tab to capture all speakers.",
                });
              }}
              disabled={isRecording}
              className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 ${
                isActive ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-100 hover:border-gray-200"
              } ${isRecording ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center overflow-hidden`}>
                {'img' in p && p.img
                  ? <img src={p.img} alt={p.name} className="w-6 h-6 object-contain" />
                  : p.icon && <p.icon size={18} className={p.color} />
                }
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-[11px] text-gray-400">{isActive ? "Meeting mode" : "Tap to capture"}</p>
              </div>
            </button>
          );
        })}
      </div>
      {recordingMode === "meeting" && !isRecording && (
        <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
          Meeting mode active — when you start recording, Chrome will ask you to share the meeting tab. This captures all speakers, not just your mic.
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Transcription */}
        <div className="lg:col-span-3 space-y-6">
          {/* Transcript Input / Live Session */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Meeting Transcript</h3>
                {isRecording && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-500 font-medium">Recording</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Mic size={12} className="text-emerald-500 animate-pulse" />
                )}
                <Button
                  size="sm"
                  onClick={handleToggleRecording}
                  className={`h-8 px-3 text-xs ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {isRecording ? <Square size={12} className="mr-1.5" /> : <Play size={12} className="mr-1.5" />}
                  {isRecording ? "Stop" : "Start"}
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Paste your meeting transcript, notes, or minutes here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="border-0 rounded-none min-h-[260px] resize-none text-sm text-gray-700 placeholder:text-gray-300 focus-visible:ring-0 p-4 leading-relaxed"
            />

            <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between">
              {isRecording && liveText ? (
                <span className="text-[10px] text-emerald-500 italic truncate max-w-[70%]">
                  {liveText}
                </span>
              ) : (
                <span />
              )}
              {transcript.length > 0 && (
                <span className="text-[10px] text-gray-300">{transcript.length.toLocaleString()} characters</span>
              )}
            </div>
          </div>

          {/* Upload Recording */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
            className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx,.pdf,.mp3,.mp4,.wav,.m4a"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={18} className="text-emerald-500 animate-spin" />
                <p className="text-sm font-medium text-gray-600">Processing file...</p>
              </div>
            ) : (
              <>
                <Upload size={18} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Upload Meeting Recording</p>
                <p className="text-xs text-gray-400">TXT, DOC, DOCX, PDF, MP3, MP4, WAV, M4A — drag & drop or click</p>
              </>
            )}
          </div>

          {/* Meeting History */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Meeting History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <div className="p-6 text-center">
                  <Video size={20} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Processed meetings will appear here</p>
                </div>
              ) : (
                history.map((meeting, i) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => viewHistoryItem(meeting)}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Video size={16} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{meeting.title || 'Untitled Meeting'}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{meeting.meeting_date || new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>·</span>
                        <ListChecks size={10} /> <span>{meeting.action_items?.length ?? 0} actions</span>
                        <span>·</span>
                        <CheckCircle2 size={10} /> <span>{meeting.decisions?.length ?? 0} decisions</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-200 text-gray-500">
                      {meeting.action_items?.length ?? 0} actions
                    </Badge>
                    <ChevronRight size={14} className="text-gray-300" />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Items + Decisions + Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Items */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Action Items</h3>
              {actionItems.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-emerald-200 text-emerald-600 bg-emerald-50">
                  {pendingCount} pending
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-3">
              {actionItems.length === 0 ? (
                <div className="text-center py-4">
                  <ListChecks size={20} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Action items will appear after processing</p>
                </div>
              ) : (
                actionItems.map((item, i) => {
                  const done = completedActions.has(i);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => toggleAction(i)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        done ? "bg-gray-50/50 border-gray-100" : "bg-white border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        done ? "border-emerald-400 bg-emerald-400" : "border-gray-300"
                      }`}>
                        {done && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${done ? "text-gray-400 line-through" : "text-gray-800"}`}>{item.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users size={10} className="text-gray-300" />
                          <span className="text-[10px] text-gray-400">{item.assignee}</span>
                          {item.deadline && (
                            <>
                              <span className="text-[10px] text-gray-300">·</span>
                              <Clock size={10} className="text-gray-300" />
                              <span className="text-[10px] text-gray-400">{item.deadline}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Key Decisions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Decisions</h3>
            {decisions.length === 0 ? (
              <div className="text-center py-3">
                <CheckCircle2 size={20} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Decisions will appear after processing</p>
              </div>
            ) : (
              <div className="space-y-2">
                {decisions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">{d}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {currentResult?.summary && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{currentResult.summary}</p>
              {currentResult.model_used && (
                <p className="text-[10px] text-gray-300 mt-3">{currentResult.model_used} · {new Date(currentResult.processed_at).toLocaleTimeString()}</p>
              )}
            </div>
          )}

          {/* Key Points */}
          {currentResult && currentResult.key_points.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Points</h3>
              <div className="space-y-2">
                {currentResult.key_points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-600">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-ups */}
          {currentResult && currentResult.follow_ups.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Follow-ups</h3>
              <div className="space-y-2">
                {currentResult.follow_ups.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-600">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Summary Button */}
          <Button
            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-xs"
            disabled={!transcript.trim() || isProcessing}
            onClick={handleGenerateSummary}
          >
            {isProcessing ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <FileText size={14} className="mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Generate Meeting Summary'}
          </Button>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default MeetingAssistant;
