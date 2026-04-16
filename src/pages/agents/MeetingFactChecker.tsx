import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield, Play, Square, CheckCircle2, XCircle,
  AlertTriangle, HelpCircle, Link, ChevronRight, Loader2, Send,
  ExternalLink, ChevronDown,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import {
  meetingFactCheckerApi,
  FactCheckSessionItem,
  FactCheckClaimItem,
} from "@/services/api";

// ── Status display config ────────────────────────────────────────

const statusConfig: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  verified:            { color: "text-emerald-600", icon: CheckCircle2,  bg: "bg-emerald-50 border-emerald-200" },
  partially_verified:  { color: "text-amber-600",   icon: AlertTriangle, bg: "bg-amber-50 border-amber-200" },
  disputed:            { color: "text-red-600",      icon: XCircle,       bg: "bg-red-50 border-red-200" },
  unverifiable:        { color: "text-gray-500",     icon: HelpCircle,    bg: "bg-gray-50 border-gray-200" },
  pending:             { color: "text-blue-500",     icon: Loader2,       bg: "bg-blue-50 border-blue-200" },
};

const statusLabel: Record<string, string> = {
  verified: "Verified",
  partially_verified: "Partially True",
  disputed: "Disputed",
  unverifiable: "Unverified",
  pending: "Pending",
};

// ── Types ────────────────────────────────────────────────────────

interface LiveClaim {
  claim_id: string;
  content: string;
  speaker: string;
  verification_status: string;
  confidence: number;
  citations: string[];
  corrections: string[];
  summary: string;
  severity: string;
}

// ── Component ────────────────────────────────────────────────────

const MeetingFactChecker: React.FC = () => {
  const { toast } = useToast();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Claim input
  const [claimText, setClaimText] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const claimInputRef = useRef<HTMLTextAreaElement>(null);

  // Live session claims (current session, from API responses)
  const [claims, setClaims] = useState<LiveClaim[]>([]);

  // Persisted data from Postgres
  const [sessionHistory, setSessionHistory] = useState<FactCheckSessionItem[]>([]);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [viewingClaims, setViewingClaims] = useState<FactCheckClaimItem[] | null>(null);

  // Track which claims have their sources panel expanded
  const [expandedClaims, setExpandedClaims] = useState<Set<string>>(new Set());

  const isActive = sessionId !== null;

  // ── Load session history from DB on mount + auto-load latest ────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await meetingFactCheckerApi.getSessions({ page: 1, limit: 50 });
        if (cancelled) return;
        setSessionHistory(res.sessions);

        // Auto-load the most recent session's claims so the dashboard isn't empty
        if (res.sessions.length > 0 && !sessionId) {
          const latest = res.sessions[0];
          try {
            const detail = await meetingFactCheckerApi.getSession(latest.id);
            if (!cancelled) {
              setViewingClaims(detail.claims);
              setSessionSummary(detail.summary);
            }
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.warn("Failed to load fact-check sessions:", err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Displayed claims (live or viewing a past session) ──────────
  const displayClaims: Array<LiveClaim | FactCheckClaimItem> = viewingClaims ?? claims;

  // ── Derived stats ──────────────────────────────────────────────
  // When viewing a specific session, show that session's stats.
  // Otherwise show aggregate stats across all sessions.
  const useAggregate = displayClaims.length === 0 && sessionHistory.length > 0 && !isActive;

  const totalClaims = useAggregate
    ? sessionHistory.reduce((sum, s) => sum + s.total_claims, 0)
    : displayClaims.length;

  const verifiedCount = useAggregate
    ? sessionHistory.reduce((sum, s) => {
        const v = s.verification_stats?.verified;
        return sum + (typeof v === "number" ? v : (v?.count ?? 0));
      }, 0)
    : displayClaims.filter(c => c.verification_status === "verified").length;

  const disputedCount = useAggregate
    ? sessionHistory.reduce((sum, s) => {
        const d = s.verification_stats?.disputed;
        return sum + (typeof d === "number" ? d : (d?.count ?? 0));
      }, 0)
    : displayClaims.filter(c => c.verification_status === "disputed").length;

  const totalSources = displayClaims.reduce((sum, c) => sum + (c.citations?.length ?? 0), 0);
  const verifiedPct = totalClaims > 0 ? Math.round((verifiedCount / totalClaims) * 100) : 0;

  // ── Start session ──────────────────────────────────────────────
  const handleStartSession = useCallback(async () => {
    if (!sessionTitle.trim()) {
      toast({ title: "Enter a session title", variant: "destructive" });
      return;
    }
    setIsStarting(true);
    try {
      const res = await meetingFactCheckerApi.startSession({
        title: sessionTitle.trim(),
        participants: [],
        context: {},
        parameters: {},
      });
      const sid = res?.results?.session_id;
      if (!sid) throw new Error("No session_id returned");
      setSessionId(sid);
      setClaims([]);
      setViewingClaims(null);
      setSessionSummary(null);
      toast({ title: "Session started", description: `"${sessionTitle}" is now live.` });
    } catch (err: any) {
      toast({ title: "Failed to start session", description: err.response?.data?.detail || err.message, variant: "destructive" });
    } finally {
      setIsStarting(false);
    }
  }, [sessionTitle, toast]);

  // ── End session ────────────────────────────────────────────────
  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    setIsEnding(true);
    try {
      const res = await meetingFactCheckerApi.endSession({
        session_id: sessionId,
        context: {},
        parameters: {},
      });
      const results = res?.results ?? {};
      const summary = results.summary || "No summary generated.";
      setSessionSummary(summary);
      setSessionId(null);

      // Refresh session history from DB
      try {
        const lib = await meetingFactCheckerApi.getSessions({ page: 1, limit: 50 });
        setSessionHistory(lib.sessions);
      } catch { /* keep existing */ }

      toast({ title: "Session ended", description: `${claims.length} claims verified.` });
    } catch (err: any) {
      toast({ title: "Failed to end session", description: err.response?.data?.detail || err.message, variant: "destructive" });
    } finally {
      setIsEnding(false);
    }
  }, [sessionId, claims.length, toast]);

  // ── Verify a claim ─────────────────────────────────────────────
  const handleVerifyClaim = useCallback(async () => {
    if (!claimText.trim()) {
      toast({ title: "Enter a claim to verify", variant: "destructive" });
      return;
    }
    if (!sessionId) {
      toast({ title: "Start a session first", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    try {
      const res = await meetingFactCheckerApi.verifyClaim({
        session_id: sessionId,
        claim: claimText.trim(),
        speaker: speaker.trim() || "Unknown",
        claim_type: "assertion",
        context: {},
        parameters: {},
      });

      const r = res?.results ?? {};
      const newClaim: LiveClaim = {
        claim_id: r.claim_id || crypto.randomUUID(),
        content: claimText.trim(),
        speaker: speaker.trim() || "Unknown",
        verification_status: r.verification_status || "pending",
        confidence: typeof r.confidence === "number"
          ? (r.confidence <= 1 ? Math.round(r.confidence * 100) : Math.round(r.confidence))
          : 0,
        citations: r.citations || [],
        corrections: r.corrections || [],
        summary: r.summary || "",
        severity: r.severity || "medium",
      };

      setClaims(prev => [newClaim, ...prev]);
      setClaimText("");
      claimInputRef.current?.focus();

      toast({
        title: `Claim ${statusLabel[newClaim.verification_status] || newClaim.verification_status}`,
        description: newClaim.summary || `Confidence: ${newClaim.confidence}%`,
      });
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.response?.data?.detail || err.message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  }, [claimText, speaker, sessionId, toast]);

  // ── View a past session from DB ────────────────────────────────
  const viewSession = useCallback(async (session: FactCheckSessionItem) => {
    setSessionSummary(session.summary);
    try {
      const detail = await meetingFactCheckerApi.getSession(session.id);
      setViewingClaims(detail.claims);
      setClaims([]);
    } catch {
      setViewingClaims([]);
    }
  }, []);

  // ── Back to live view ──────────────────────────────────────────
  const backToLive = () => {
    setViewingClaims(null);
    setSessionSummary(null);
  };

  // ── Render helpers ─────────────────────────────────────────────
  const renderClaim = (claim: LiveClaim | FactCheckClaimItem, i: number) => {
    const status = claim.verification_status;
    const cfg = statusConfig[status] || statusConfig.pending;
    const StatusIcon = cfg.icon;
    const label = statusLabel[status] || status;
    const content = "content" in claim ? claim.content : "";
    const conf = claim.confidence;

    return (
      <motion.div
        key={"claim_id" in claim ? claim.claim_id : claim.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        className="p-4 hover:bg-gray-50/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          <StatusIcon size={16} className={`${cfg.color} shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 leading-relaxed">"{content}"</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-[10px] text-gray-400">— {claim.speaker}</span>
              <Badge variant="outline" className={`text-[10px] px-2 py-0 ${cfg.bg}`}>
                {label}
              </Badge>
              {conf > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        conf > 75 ? "bg-emerald-400" : conf > 50 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${conf}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{conf}%</span>
                </div>
              )}
              {claim.citations.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const claimKey = "claim_id" in claim ? claim.claim_id : claim.id;
                    setExpandedClaims(prev => {
                      const next = new Set(prev);
                      next.has(claimKey) ? next.delete(claimKey) : next.add(claimKey);
                      return next;
                    });
                  }}
                  className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <Link size={9} /> {claim.citations.length} sources
                  <ChevronDown
                    size={9}
                    className={`transition-transform ${
                      expandedClaims.has("claim_id" in claim ? claim.claim_id : claim.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
            {claim.summary && (
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{claim.summary}</p>
            )}
            {/* Expanded sources panel */}
            <AnimatePresence>
              {claim.citations.length > 0 &&
                expandedClaims.has("claim_id" in claim ? claim.claim_id : claim.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 px-2.5 py-2 bg-blue-50 border border-blue-100 rounded-lg overflow-hidden"
                >
                  <p className="text-[10px] text-blue-700 font-medium mb-1.5">Sources:</p>
                  <div className="space-y-1">
                    {claim.citations.map((src, si) => {
                      const isUrl = /^https?:\/\//.test(src);
                      return (
                        <div key={si} className="flex items-start gap-1.5">
                          <span className="text-[10px] text-blue-400 mt-0.5 shrink-0">{si + 1}.</span>
                          {isUrl ? (
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-1"
                            >
                              {src.length > 80 ? src.slice(0, 80) + "..." : src}
                              <ExternalLink size={8} className="shrink-0" />
                            </a>
                          ) : (
                            <p className="text-[10px] text-blue-600 break-all">{src}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {claim.corrections.length > 0 && (
              <div className="mt-2 px-2 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-[10px] text-amber-700 font-medium mb-0.5">Corrections:</p>
                {claim.corrections.map((c, ci) => (
                  <p key={ci} className="text-[10px] text-amber-600">{c}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AgentPageLayout
      agentName="Fact Checker"
      tagline="Truth in every statement"
      icon={Shield}
      gradient="from-red-500 to-rose-600"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Claims", value: totalClaims > 0 ? totalClaims : "—", icon: Shield, color: "text-red-500" },
          { label: "Verified", value: totalClaims > 0 ? `${verifiedPct}%` : "—", icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Disputed", value: totalClaims > 0 ? disputedCount : "—", icon: XCircle, color: "text-amber-500" },
          { label: "Sources Checked", value: totalClaims > 0 ? totalSources : "—", icon: Link, color: "text-blue-500" },
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

      {/* Viewing past session banner */}
      {viewingClaims !== null && !isActive && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center justify-between">
          <span>Viewing a past session</span>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-blue-700" onClick={backToLive}>
            Back to live
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Claims Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Session Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Session title (e.g. Board Meeting Q2)..."
                className="text-sm h-9 border-gray-200 bg-gray-50/50 flex-1"
                disabled={isActive}
              />
              <Button
                size="sm"
                onClick={isActive ? handleEndSession : handleStartSession}
                disabled={isStarting || isEnding}
                className={`h-9 px-4 text-xs shrink-0 ${
                  isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {(isStarting || isEnding) ? (
                  <Loader2 size={12} className="mr-1.5 animate-spin" />
                ) : isActive ? (
                  <Square size={12} className="mr-1.5" />
                ) : (
                  <Play size={12} className="mr-1.5" />
                )}
                {isStarting ? "Starting..." : isEnding ? "Ending..." : isActive ? "End Session" : "Start Session"}
              </Button>
            </div>
            {isActive && (
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-medium">Live verification active</span>
              </div>
            )}
          </div>

          {/* Claim Input — only visible during active session */}
          {isActive && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Verify a Claim</h3>
              <Textarea
                ref={claimInputRef}
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder='e.g. "Our revenue grew 40% last quarter"'
                className="text-sm min-h-[70px] resize-none border-gray-200 bg-gray-50/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleVerifyClaim();
                  }
                }}
              />
              <div className="flex items-center gap-3">
                <Input
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="Speaker (e.g. CEO)"
                  className="text-sm h-9 border-gray-200 bg-gray-50/50 w-48"
                />
                <Button
                  size="sm"
                  onClick={handleVerifyClaim}
                  disabled={isVerifying || !claimText.trim()}
                  className="h-9 px-4 text-xs bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {isVerifying ? (
                    <Loader2 size={12} className="mr-1.5 animate-spin" />
                  ) : (
                    <Send size={12} className="mr-1.5" />
                  )}
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
                <span className="text-[10px] text-gray-300 ml-auto">Cmd+Enter to submit</span>
              </div>
            </div>
          )}

          {/* Claims Feed */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Claims Feed</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {displayClaims.length === 0 ? (
                <div className="p-6 text-center">
                  <Shield size={20} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    {isActive ? "Submit a claim above to verify it" : "Start a session to begin fact-checking"}
                  </p>
                </div>
              ) : (
                displayClaims.map((claim, i) => renderClaim(claim, i))
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Verification Summary</h3>
            {totalClaims === 0 ? (
              <div className="text-center py-3">
                <CheckCircle2 size={20} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Stats appear after verifying claims</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const count = displayClaims.filter(c => c.verification_status === status).length;
                  const pct = Math.round((count / totalClaims) * 100);
                  if (count === 0) return null;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <config.icon size={14} className={config.color} />
                      <span className="text-xs text-gray-600 w-28">{statusLabel[status] || status}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === "verified" ? "bg-emerald-400"
                            : status === "disputed" ? "bg-red-400"
                            : status === "partially_verified" ? "bg-amber-400"
                            : "bg-gray-300"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session Summary */}
          {sessionSummary && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Session Summary</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{sessionSummary}</p>
            </div>
          )}

          {/* Session History */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Session History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {sessionHistory.length === 0 ? (
                <div className="p-6 text-center">
                  <Shield size={20} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Completed sessions will appear here</p>
                </div>
              ) : (
                sessionHistory.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => viewSession(session)}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <Shield size={16} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{session.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" · "}{session.total_claims} claims
                        {(() => {
                          const v = session.verification_stats?.verified;
                          const count = typeof v === "number" ? v : v?.count;
                          return count != null && count > 0 ? ` · ${count} verified` : "";
                        })()}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default MeetingFactChecker;
