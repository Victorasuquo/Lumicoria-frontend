/**
 * Public invite-accept page (Phase 5).
 *
 * Hit when a user clicks the "Accept invitation" button in their email.
 * Three states:
 *   1. Loading — fetching the invite preview.
 *   2. Logged-in user with matching email → one-click accept.
 *   3. No account → redirect to /signup with the invite email prefilled.
 *      Signup will accept the invite automatically via the auth hook.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { inviteApi, InvitePreview, getErrorMessage } from "@/services/api";
import { cn } from "@/lib/utils";

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-slate-400",
  medium: "bg-purple-600",
  high: "bg-amber-500",
  critical: "bg-red-500",
};

const InviteAccept: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const token = params.get("token") || "";

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState<null | { orgs: number; tasks: number }>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing token");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const p = await inviteApi.previewByToken(token);
        setPreview(p);
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Invitation could not be loaded."));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const emailMatches =
    user && preview && user.email && user.email.toLowerCase() === (preview.email_normalized || preview.email).toLowerCase();

  const handleAccept = async () => {
    if (!preview) return;
    setAccepting(true);
    try {
      const r = await inviteApi.acceptByToken(token);
      setDone({ orgs: r.orgs_joined, tasks: r.tasks_reassigned });
      toast({ title: "Invitation accepted" });
    } catch (e: unknown) {
      toast({ title: "Accept failed", description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setAccepting(false);
    }
  };

  const handleSignup = () => {
    if (!preview) return;
    // Pass token + email to signup so the signup endpoint sees it and the
    // auth hook accepts the invite automatically.
    navigate(`/signup?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(preview.email)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Brand strip */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <img
            src="/images/lumicoria-logo-primary.png"
            alt="Lumicoria"
            width={28}
            height={28}
            className="rounded-md"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
          <span className="text-sm font-semibold text-gray-900">Lumicoria</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center">
            <Loader2 className="text-gray-300 animate-spin mx-auto mb-2" size={20} />
            <p className="text-sm text-gray-500">Loading invitation…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-3" size={24} />
            <h2 className="text-base font-semibold text-gray-900 mb-1">We couldn't open this invitation</h2>
            <p className="text-sm text-gray-500">{error}</p>
            <Button onClick={() => navigate("/")} className="mt-5 bg-purple-600 hover:bg-purple-700 text-white">Go home</Button>
          </div>
        )}

        {/* Done */}
        {!loading && done && (
          <div className="p-8 text-center">
            <CheckCircle2 className="text-emerald-500 mx-auto mb-3" size={28} />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Invitation accepted</h2>
            <p className="text-sm text-gray-500">
              {done.orgs > 0 && <>You joined {done.orgs} workspace{done.orgs === 1 ? "" : "s"}. </>}
              {done.tasks > 0 && <>{done.tasks} task{done.tasks === 1 ? "" : "s"} are now assigned to you.</>}
            </p>
            <Button onClick={() => navigate("/tasks")} className="mt-5 bg-purple-600 hover:bg-purple-700 text-white">
              Open Lumicoria <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        )}

        {/* Preview + action */}
        {!loading && !error && !done && preview && (
          <div className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Invitation</p>
            <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-2">
              {preview.organization_name
                ? <>You've been invited to <span className="text-purple-700">{preview.organization_name}</span></>
                : preview.project_name
                ? <>You've been invited to the project <span className="text-purple-700">{preview.project_name}</span></>
                : <>You've been invited to collaborate on Lumicoria</>}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              <span className="font-semibold text-gray-900">{preview.inviter_name || preview.inviter_email || "Someone"}</span>
              {" "}invited you to join as <span className="font-medium">{preview.role}</span>.
            </p>

            {preview.message && (
              <div className="bg-purple-50/50 border-l-2 border-purple-300 p-3 rounded-r-lg text-sm text-purple-900 mb-4 italic">
                "{preview.message}"
              </div>
            )}

            {/* Task list */}
            {preview.task_previews && preview.task_previews.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Tasks assigned to you</p>
                <ul className="space-y-1.5">
                  {preview.task_previews.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                      <span className={cn("inline-block w-2 h-2 rounded-full mt-1.5 shrink-0", PRIORITY_DOT[t.priority || "medium"])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                        <p className="text-[11px] text-gray-500">{t.due_label}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5 text-xs text-gray-600">
              Invited as <span className="font-medium text-gray-900">{preview.email}</span>
              {preview.expires_at && <> · expires {new Date(preview.expires_at).toLocaleDateString()}</>}
            </div>

            {/* CTA varies by auth state */}
            {user && emailMatches ? (
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {accepting ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Accepting…</> : "Accept invitation"}
              </Button>
            ) : user && !emailMatches ? (
              <div className="text-center">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  You're signed in as {user.email}. This invitation was sent to {preview.email}.
                  Sign out and sign in with the invited email to accept.
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>Switch account</Button>
              </div>
            ) : (
              <Button
                onClick={handleSignup}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Accept and create your account <ArrowRight size={14} className="ml-1.5" />
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InviteAccept;
