/**
 * LiveNowIndicator — sidebar pill that shows when the user's org has
 * an active Huddle. Polls /huddles?status=live every 20s.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video } from "lucide-react";
import { huddleApi, type Huddle } from "@/services/huddleApi";

const POLL_MS = 20_000;

export const LiveNowIndicator: React.FC = () => {
  const navigate = useNavigate();
  const [live, setLive] = useState<Huddle[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = async () => {
      try {
        const r = await huddleApi.list({ status: "live", limit: 20 });
        if (!cancelled) setLive(r.items || []);
      } catch {
        if (!cancelled) setLive([]);
      }
    };
    void fetchOnce();
    const id = setInterval(fetchOnce, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (live.length === 0) return null;

  const first = live[0];
  const onClick = () => navigate(`/agents/meeting/room/${first.id}`);

  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(244,114,182,0.10) 100%)",
        border: "1px solid rgba(239,68,68,0.25)",
        cursor: "pointer",
        textAlign: "left",
      }}
      title={live.length > 1 ? `${live.length} huddles live now` : first.title}
    >
      <span style={{
        width: 8, height: 8, borderRadius: 9999, background: "#EF4444",
        boxShadow: "0 0 0 4px rgba(239,68,68,0.15)",
        animation: "lumi-skeleton 1.6s ease-in-out infinite",
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Video size={11} color="#B91C1C" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "#B91C1C", textTransform: "uppercase" }}>
            Live now
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#7F1D1D", fontWeight: 600, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {live.length > 1 ? `${live.length} active huddles` : first.title}
        </span>
      </div>
    </button>
  );
};

export default LiveNowIndicator;
