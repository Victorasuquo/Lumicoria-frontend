/**
 * TeamHuddleButton — drop into the Team detail header to spin up a
 * Slack-style instant team huddle. One click → backend creates room →
 * we navigate to /agents/meeting/room/{id}.
 */

import React, { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { huddleApi } from "@/services/huddleApi";
import { toast } from "sonner";

interface TeamHuddleButtonProps {
  teamId?: string;
  projectId?: string;
  teamName?: string;
  agentKeys?: string[];
  size?: "sm" | "md";
  variant?: "default" | "outline" | "ghost";
}

export const TeamHuddleButton: React.FC<TeamHuddleButtonProps> = ({
  teamId,
  projectId,
  teamName,
  agentKeys = ["meeting"],
  size = "sm",
  variant = "default",
}) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      const huddle = await huddleApi.create({
        title: teamName ? `${teamName} huddle` : "Instant team huddle",
        meeting_type: "instant",
        team_id: teamId,
        project_id: projectId,
        agent_keys: agentKeys,
        recording_enabled: false,
      });
      navigate(`/agents/meeting/room/${huddle.id}`);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : detail?.message || "Couldn't start the huddle.";
      toast.error(msg);
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={start}
      disabled={busy}
      variant={variant}
      size={size}
      className={
        variant === "default"
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : ""
      }
    >
      {busy ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Video size={12} className="mr-1.5" />}
      {busy ? "Starting…" : "Start huddle"}
    </Button>
  );
};

export default TeamHuddleButton;
