/**
 * HuddleLobby — pre-join page for invitees coming in via a share link.
 *
 * Routes:
 *   /huddles/join/:shareToken     — public, no auth required
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import PreCallCheck from "@/components/huddle/PreCallCheck";
import { huddleApi, type HuddlePublic } from "@/services/huddleApi";

const HuddleLobby: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [huddle, setHuddle] = useState<HuddlePublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    huddleApi
      .getPublic(shareToken)
      .then((h) => setHuddle(h))
      .catch(() => setError("This link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleReady = async (input: { displayName: string; audioMuted: boolean; videoMuted: boolean }) => {
    if (!huddle) return;
    try {
      // Register as guest participant
      await huddleApi.join(huddle.id, {
        guest_name: input.displayName,
        role: "guest",
      });
    } catch { /* still allow join */ }
    navigate(`/agents/meeting/room/${huddle.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading meeting…
      </div>
    );
  }

  if (error || !huddle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-8 text-center">
        <AlertCircle size={32} className="mb-3 text-red-300" />
        <p className="text-lg">{error || "Meeting not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <p className="text-[10px] uppercase tracking-wider text-purple-600 font-semibold mb-2">Lumicoria Huddle</p>
        <h1 className="text-2xl font-bold mb-1">{huddle.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{huddle.status === "live" ? "Live now" : "Waiting to start"}</p>
        <PreCallCheck onReady={handleReady} joinLabel="Join meeting" />
      </div>
    </div>
  );
};

export default HuddleLobby;
