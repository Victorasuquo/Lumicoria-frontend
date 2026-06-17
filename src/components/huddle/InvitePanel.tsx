/**
 * InvitePanel — share link + email invite from inside the Huddle room.
 */

import React, { useState } from "react";
import { Copy, Mail, Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { huddleApi } from "@/services/huddleApi";
import { toast } from "sonner";

interface InvitePanelProps {
  huddleId: string;
  shareToken: string;
  domain?: string;
}

export const InvitePanel: React.FC<InvitePanelProps> = ({ huddleId, shareToken, domain }) => {
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const base = domain || (typeof window !== "undefined" ? window.location.origin : "https://lumicoria.ai");
  const shareUrl = `${base}/huddles/join/${shareToken}`;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const sendEmails = async () => {
    const parsed = emails
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (parsed.length === 0) {
      toast.error("Add at least one valid email.");
      return;
    }
    setSending(true);
    try {
      const res = await huddleApi.invite(huddleId, parsed, message.trim() || undefined);
      const delivered = res.delivered?.length ?? 0;
      const skipped = res.skipped?.length ?? 0;
      toast.success(`Sent ${delivered} invite${delivered === 1 ? "" : "s"}${skipped ? ` (${skipped} skipped)` : ""}.`);
      setEmails("");
      setMessage("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Couldn't send invites");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Share link</p>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <LinkIcon size={14} className="text-gray-400 shrink-0" />
          <span className="flex-1 min-w-0 truncate text-xs text-gray-700">{shareUrl}</span>
          <Button size="sm" variant="outline" onClick={copy} className="h-7 px-2 text-xs">
            {copied ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Invite by email</p>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="alex@example.com, sam@example.com"
          rows={2}
          className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional message"
          rows={2}
          className="mt-2 w-full text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <Button size="sm" onClick={sendEmails} disabled={sending} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs h-8">
          <Mail size={12} className="mr-1.5" /> {sending ? "Sending…" : "Send invites"}
        </Button>
      </div>
    </div>
  );
};

export default InvitePanel;
