/**
 * BrainPreferences — full settings page for the autonomous brain.
 *
 * - Enable / disable the daily morning + evening digests.
 * - Local-time hour selectors for each digest.
 * - Mailbox label include / exclude (chip-style entry).
 * - Per-run caps (max emails, max attachments).
 * - Auto-assign agents toggle.
 * - Per-channel delivery toggles (email / push / in-app).
 * - "Send me a test digest now" button that hits /brain/trigger inline
 *   and renders the BrainRunSummary as a toast + a result panel.
 * - "Reconnect required" banner when prefs.needs_reauth is true.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Brain, AlertTriangle, Save, Send, Loader2, Plus, X, Sunrise, Moon, History, ArrowLeft, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  brainApi,
  BrainPreferences,
  BrainRunSummary,
  getErrorMessage,
} from "@/services/api";

const DEFAULT_PREFS: BrainPreferences = {
  enabled: false,
  morning_hour_local: 6,
  evening_hour_local: 22,
  max_emails_per_run: 100,
  max_attachments_per_run: 20,
  mailbox_labels_include: ["INBOX"],
  mailbox_labels_exclude: ["CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL"],
  auto_assign_agents: true,
  send_email: true,
  send_push: true,
  send_in_app: true,
  needs_reauth: false,
};

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const fmtHour = (h: number) => {
  const am = h < 12;
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${am ? "AM" : "PM"}`;
};

export default function BrainPreferencesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState<BrainPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState<null | "morning" | "evening">(null);
  const [lastRun, setLastRun] = useState<BrainRunSummary | null>(null);

  // ── Load + save ────────────────────────────────────────────────────────
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await brainApi.getPreferences();
      setPrefs(data);
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not load brain preferences") });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await brainApi.updatePreferences(prefs);
      setPrefs(updated);
      toast({ description: "Brain preferences saved." });
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not save preferences") });
    } finally {
      setSaving(false);
    }
  };

  // ── Trigger a test digest ──────────────────────────────────────────────
  const fireTestDigest = async (mode: "morning" | "evening") => {
    setTriggering(mode);
    setLastRun(null);
    try {
      const summary = await brainApi.trigger({ mode });
      setLastRun(summary);
      toast({
        description:
          summary.status === "ok"
            ? `${mode === "morning" ? "Morning" : "Evening"} digest fired — ${summary.tasks_created} tasks created.`
            : `Run finished with status: ${summary.status}${summary.skip_reason ? ` (${summary.skip_reason})` : ""}`,
      });
    } catch (e) {
      toast({ description: getErrorMessage(e, "Could not trigger a brain run") });
    } finally {
      setTriggering(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const update = <K extends keyof BrainPreferences>(key: K, value: BrainPreferences[K]) =>
    setPrefs(p => ({ ...p, [key]: value }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 md:px-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Brain</h1>
            <p className="text-sm text-gray-500">
              Your autonomous daily digest. Wakes up your inbox, prioritises, drafts proposals.
            </p>
          </div>
        </div>

        {/* ── Reconnect banner ───────────────────────────────────────── */}
        {prefs.needs_reauth && (
          <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-amber-900">
              <div className="font-medium">Google reconnection required</div>
              <div className="text-amber-700">
                The brain needs Gmail read access. Reconnect to refresh permissions.
              </div>
              <Link
                to="/integrations"
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-900 hover:text-amber-700"
              >
                Open Integrations
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Big enable toggle ──────────────────────────────────────── */}
        <SettingCard className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-medium text-gray-900">
                Run the brain twice daily
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                When on, the brain runs at your chosen morning + evening hours every day.
              </p>
            </div>
            <Toggle
              checked={prefs.enabled}
              onChange={v => update("enabled", v)}
            />
          </div>
        </SettingCard>

        {/* ── Send times ─────────────────────────────────────────────── */}
        <SettingCard className="mt-4" title="Send times">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HourPicker
              icon={Sunrise}
              label="Morning brief"
              value={prefs.morning_hour_local}
              onChange={v => update("morning_hour_local", v)}
              accent="text-amber-500 bg-amber-50"
            />
            <HourPicker
              icon={Moon}
              label="Evening review"
              value={prefs.evening_hour_local}
              onChange={v => update("evening_hour_local", v)}
              accent="text-indigo-500 bg-indigo-50"
            />
          </div>
        </SettingCard>

        {/* ── Mailbox labels ─────────────────────────────────────────── */}
        <SettingCard className="mt-4" title="Mailbox filters">
          <div className="space-y-4">
            <ChipsEditor
              label="Only consider labels"
              hint="Default: INBOX. Use Gmail label IDs (e.g. INBOX, IMPORTANT)."
              values={prefs.mailbox_labels_include}
              onChange={v => update("mailbox_labels_include", v)}
              placeholder="e.g. INBOX"
            />
            <ChipsEditor
              label="Skip labels"
              hint="Default: PROMOTIONS, SOCIAL. The brain won't pull from these."
              values={prefs.mailbox_labels_exclude}
              onChange={v => update("mailbox_labels_exclude", v)}
              placeholder="e.g. CATEGORY_PROMOTIONS"
            />
          </div>
        </SettingCard>

        {/* ── Caps ───────────────────────────────────────────────────── */}
        <SettingCard className="mt-4" title="Per-run caps">
          <p className="text-xs text-gray-500 mb-4">
            Hard ceilings to keep one heavy day from running away with cost or latency.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <NumberStat
              label="Max emails / run"
              value={prefs.max_emails_per_run}
              min={1}
              max={1000}
              onChange={v => update("max_emails_per_run", v)}
            />
            <NumberStat
              label="Max attachments / run"
              value={prefs.max_attachments_per_run}
              min={0}
              max={200}
              onChange={v => update("max_attachments_per_run", v)}
            />
          </div>
        </SettingCard>

        {/* ── Behaviour ──────────────────────────────────────────────── */}
        <SettingCard className="mt-4" title="Behaviour">
          <SwitchRow
            label="Auto-assign agents to created tasks"
            hint="When on, the brain picks one of your 21 specialists per task and queues a draft proposal."
            checked={prefs.auto_assign_agents}
            onChange={v => update("auto_assign_agents", v)}
          />
        </SettingCard>

        {/* ── Channels ───────────────────────────────────────────────── */}
        <SettingCard className="mt-4" title="Delivery channels">
          <SwitchRow
            label="Email"
            hint="Branded digest with one-click Approve / Revise / Reject buttons."
            checked={prefs.send_email}
            onChange={v => update("send_email", v)}
          />
          <SwitchRow
            label="In-app notification"
            hint="Shows up in your notification bell + the brain category."
            checked={prefs.send_in_app}
            onChange={v => update("send_in_app", v)}
          />
          <SwitchRow
            label="Push notification"
            hint="Only fires when a critical action is detected."
            checked={prefs.send_push}
            onChange={v => update("send_push", v)}
          />
        </SettingCard>

        {/* ── Save bar ───────────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-between gap-3 sticky bottom-4 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <Link
            to="/brain/runs"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700"
          >
            <History className="w-4 h-4" />
            Run history
          </Link>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-2">Save preferences</span>
          </Button>
        </div>

        {/* ── Test digest ─────────────────────────────────────────────── */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-900">
                Send yourself a test digest
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Runs the full pipeline now — reads Gmail, ingests into RAG, prioritises, fires the
                draft agents, and emails you the result. Useful for sanity-checking your filters.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => fireTestDigest("morning")}
                  disabled={triggering !== null}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  {triggering === "morning" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sunrise className="w-4 h-4" />}
                  <span className="ml-2">Test morning brief</span>
                </Button>
                <Button
                  onClick={() => fireTestDigest("evening")}
                  disabled={triggering !== null}
                  variant="outline"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  {triggering === "evening" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Moon className="w-4 h-4" />}
                  <span className="ml-2">Test evening review</span>
                </Button>
              </div>

              {/* Result panel for the last run */}
              {lastRun && (
                <div className="mt-5 bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Run completed
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <Stat label="Status" value={lastRun.status} />
                    <Stat label="Duration" value={`${(lastRun.duration_ms / 1000).toFixed(1)}s`} />
                    <Stat label="Emails read" value={lastRun.emails_processed} />
                    <Stat label="Attachments" value={lastRun.attachments_processed} />
                    <Stat label="Tasks created" value={lastRun.tasks_created} />
                    <Stat label="Proposals drafted" value={lastRun.proposals_drafted} />
                    <Stat label="Digest sent" value={lastRun.digest_sent ? "Yes" : "No"} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={`/brain/runs/${lastRun.run_id}`}
                      className="text-sm font-medium text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                    >
                      View node timeline
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Local presentational helpers (kept in-file — single-use, on-brand)
// ─────────────────────────────────────────────────────────────────────

function SettingCard({
  title, children, className = "",
}: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`}>
      {title && (
        <div className="text-sm font-semibold text-gray-900 mb-3">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? "bg-purple-600" : "bg-gray-200"}`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function SwitchRow({
  label, hint, checked, onChange,
}: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function HourPicker({
  icon: Icon, label, value, onChange, accent,
}: { icon: React.ElementType; label: string; value: number; onChange: (v: number) => void; accent: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <span className={`w-6 h-6 rounded-md ${accent} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        {label}
      </div>
      <select
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        {HOURS.map(h => (
          <option key={h} value={h}>{fmtHour(h)} (local)</option>
        ))}
      </select>
    </div>
  );
}

function NumberStat({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</div>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className="text-base font-medium"
      />
    </div>
  );
}

function ChipsEditor({
  label, hint, values, onChange, placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) { setDraft(""); return; }
    onChange([...values, v]);
    setDraft("");
  };

  const remove = (v: string) => onChange(values.filter(x => x !== v));

  return (
    <div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
      {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map(v => (
          <span
            key={v}
            className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-200"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-purple-400 hover:text-purple-700"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
          }}
        />
        <Button
          type="button"
          onClick={add}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className="text-sm font-medium text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}
