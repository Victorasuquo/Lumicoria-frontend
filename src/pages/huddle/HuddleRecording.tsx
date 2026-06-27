/**
 * HuddleRecording — playback + download + share for a completed huddle.
 *
 * Hits GET /huddles/{id}/recording for the signed playback URL and
 * GET /huddles/{id} for metadata. Host can delete the recording from
 * this page.
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Download, Share2, Trash2, Video, Loader2, Clock, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { huddleApi, type Huddle, type RecordingPlayback } from "@/services/huddleApi";
import { useAuth } from "@/contexts/AuthContext";

const HuddleRecordingPage: React.FC = () => {
  const { huddleId } = useParams<{ huddleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [huddle, setHuddle] = useState<Huddle | null>(null);
  const [playback, setPlayback] = useState<RecordingPlayback | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (huddleId) void load(); }, [huddleId]);

  const load = async () => {
    if (!huddleId) return;
    setLoading(true);
    try {
      const [h, pb] = await Promise.all([
        huddleApi.get(huddleId),
        huddleApi.getRecordingUrl(huddleId).catch(() => null),
      ]);
      setHuddle(h);
      setPlayback(pb);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not load recording");
    } finally {
      setLoading(false);
    }
  };

  const isHost = !!user && !!huddle && String((user as any).id) === huddle.host_user_id;

  const handleDownload = () => {
    const url = playback?.playback_url || huddle?.recording_url;
    if (!url) return;
    // Open in new tab — preserves auth headers + lets browser handle large files.
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const url = playback?.playback_url || huddle?.recording_url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Playback link copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleDelete = async () => {
    if (!huddleId) return;
    if (!confirm("Delete this recording permanently? This can't be undone.")) return;
    setDeleting(true);
    try {
      // Delete endpoint may live on the recording service — call directly via api.
      const api = (await import("@/services/api")).default;
      await api.delete(`/huddles/${huddleId}/recording`);
      toast.success("Recording deleted");
      navigate("/agents/meeting");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!huddle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm">
          <h2 className="text-base font-semibold text-gray-900">Recording not found</h2>
          <p className="text-sm text-gray-500 mt-2">It may have been deleted or expired past its retention window.</p>
          <Link to="/agents/meeting" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900">
            <ArrowLeft className="w-4 h-4" /> Back to meetings
          </Link>
        </div>
      </div>
    );
  }

  const playbackUrl = playback?.playback_url || huddle.recording_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{huddle.title || "Meeting recording"}</h1>
            <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {fmtAbsolute(huddle.started_at || huddle.created_at)}
              </span>
              {huddle.participant_count != null && (
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {huddle.participant_count} participant{huddle.participant_count === 1 ? "" : "s"}
                </span>
              )}
              {huddle.recording_size_bytes != null && (
                <span>{(huddle.recording_size_bytes / 1048576).toFixed(1)} MB</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="h-9">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!playbackUrl} className="h-9">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            {isHost && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 border-red-200 text-red-700 hover:bg-red-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-900/10">
          {playbackUrl ? (
            <video
              key={playbackUrl}
              src={playbackUrl}
              controls
              playsInline
              className="w-full aspect-video bg-black"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center text-gray-400">
              <Video className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Recording is still processing.</p>
              <p className="text-xs mt-1 opacity-75">We'll email you when it's ready.</p>
            </div>
          )}
        </div>

        {/* Footer notes */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Retention</h3>
          <p className="text-xs text-gray-500">
            Recordings are kept according to your organisation's retention policy
            {huddle.recording_expires_at && (
              <> — this one is scheduled to be removed on <strong>{fmtAbsolute(huddle.recording_expires_at)}</strong></>
            )}
            . Download a copy if you need to keep it longer.
          </p>
        </div>
      </div>
    </div>
  );
};

function fmtAbsolute(ts?: string | null): string {
  if (!ts) return "";
  try { return new Date(ts).toLocaleString(); }
  catch { return ts; }
}

export default HuddleRecordingPage;
