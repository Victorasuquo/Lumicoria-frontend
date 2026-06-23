/**
 * BrainRuns — list of recent brain runs for the current user.
 *
 * Newest first. Click a row → /brain/runs/:id detail page.
 * "Run now" button at the top of the page mirrors the trigger from
 * BrainPreferences so an admin debugging a flaky digest can fire
 * one without leaving this page.
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain, ArrowLeft, Loader2, RefreshCw, Sunrise, Moon, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  brainApi,
  BrainRun,
  getErrorMessage,
} from "@/services/api";
import RunCard from "@/components/brain/RunCard";

export default function BrainRunsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [runs, setRuns] = useState<BrainRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<null | "morning" | "evening">(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await brainApi.listRuns(50);
      setRuns(data);
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not load brain runs") });
    } finally {
      setLoading(false);
    }
  };

  const fire = async (mode: "morning" | "evening") => {
    setTriggering(mode);
    try {
      const summary = await brainApi.trigger({ mode });
      toast({
        description: `${mode === "morning" ? "Morning" : "Evening"} brain run completed (${summary.status}).`,
      });
      // Drill straight into the run that just finished.
      navigate(`/brain/runs/${summary.run_id}`);
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not trigger a brain run") });
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 md:px-6">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">Brain runs</h1>
            <p className="text-sm text-gray-500">
              Every morning + evening run is recorded here. Click a run to drill into the node timeline.
            </p>
          </div>
          <Link to="/brain/preferences">
            <Button variant="outline" className="border-gray-200">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
          </Link>
        </div>

        {/* Trigger row */}
        <div className="mt-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-gray-900">Fire one now</div>
            <div className="text-xs text-gray-600">Runs the full pipeline against your live Gmail.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              disabled={triggering !== null}
              onClick={() => fire("morning")}
            >
              {triggering === "morning" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sunrise className="w-4 h-4" />}
              <span className="ml-2">Run morning now</span>
            </Button>
            <Button
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              disabled={triggering !== null}
              onClick={() => fire("evening")}
            >
              {triggering === "evening" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Moon className="w-4 h-4" />}
              <span className="ml-2">Run evening now</span>
            </Button>
            <Button
              variant="outline"
              className="border-gray-300"
              disabled={loading || triggering !== null}
              onClick={load}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="mt-6 space-y-3">
          {loading && runs.length === 0 ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : runs.length === 0 ? (
            <div className="py-12 text-center bg-white border border-dashed border-gray-200 rounded-xl">
              <div className="text-sm text-gray-500">
                No runs yet. Fire the first one above, or wait for your scheduled window.
              </div>
            </div>
          ) : (
            runs.map(r => <RunCard key={r.id} run={r} />)
          )}
        </div>

      </div>
    </div>
  );
}
