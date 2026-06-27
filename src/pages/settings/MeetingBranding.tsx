/**
 * MeetingBranding — org admin page for customising Lumicoria Meet.
 *
 * Surfaces:
 *   - Logo + favicon upload (drag-and-drop with live preview)
 *   - Primary + accent color pickers (CSS custom property overrides)
 *   - App name (overrides "Lumicoria Meet" in the meeting chrome)
 *   - Watermark link (where the logo click lands)
 *   - Welcome message (shown on the pre-join screen)
 *   - "Preview in meeting" — opens a sandbox room with these settings
 *
 * Gated to Team / Business / Enterprise plans — Starter sees an
 * upgrade banner instead of the form.
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Palette, Upload, ImageIcon, X, Eye, Check,
  Sparkles, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerServiceApi, type OrgBranding, getErrorMessage } from "@/services/api";

const PAID_PLANS = new Set(["team", "business", "enterprise", "starter_yearly", "starter_monthly", "pro"]);

const MeetingBrandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [branding, setBranding] = useState<OrgBranding | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const b = await customerServiceApi.getBranding();
      setBranding(b);
      // Best-effort plan lookup so we can show the upgrade banner.
      try {
        const me = await (await import("@/services/api")).billingApi?.getMe?.();
        if (me?.plan) setPlan(String(me.plan).toLowerCase());
      } catch { /* */ }
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not load branding"));
    } finally {
      setLoading(false);
    }
  };

  const canCustomise = PAID_PLANS.has(plan);

  const handleField = <K extends keyof OrgBranding>(key: K, value: OrgBranding[K]) => {
    setBranding((b) => (b ? { ...b, [key]: value } : b));
  };

  const handleLogoChange = async (file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Logo must be ≤ 1 MB");
      return;
    }
    setUploadingLogo(true);
    try {
      const { logo_url } = await customerServiceApi.uploadMeetingLogo(file);
      handleField("meeting_logo_url", logo_url);
      toast.success("Logo uploaded");
    } catch (e) {
      toast.error(getErrorMessage(e, "Logo upload failed"));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconChange = async (file: File) => {
    if (file.size > 200 * 1024) {
      toast.error("Favicon must be ≤ 200 KB");
      return;
    }
    setUploadingFavicon(true);
    try {
      const { favicon_url } = await customerServiceApi.uploadMeetingFavicon(file);
      handleField("meeting_favicon_url", favicon_url);
      toast.success("Favicon uploaded");
    } catch (e) {
      toast.error(getErrorMessage(e, "Favicon upload failed"));
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleClearLogo = async () => {
    if (!confirm("Remove the meeting logo? Falls back to your main brand logo.")) return;
    try {
      await customerServiceApi.clearMeetingLogo();
      handleField("meeting_logo_url", null);
      toast.success("Logo removed");
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not remove logo"));
    }
  };

  const handleSave = async () => {
    if (!branding) return;
    setSaving(true);
    try {
      await customerServiceApi.updateBranding({
        meeting_app_name: branding.meeting_app_name ?? null,
        meeting_logo_url: branding.meeting_logo_url ?? null,
        meeting_favicon_url: branding.meeting_favicon_url ?? null,
        meeting_watermark_link: branding.meeting_watermark_link ?? null,
        meeting_welcome_message: branding.meeting_welcome_message ?? null,
        primary_color: branding.primary_color,
        accent_color: branding.accent_color,
      });
      toast.success("Meeting branding saved");
    } catch (e) {
      toast.error(getErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !branding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!canCustomise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <BackBar />
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Custom branding is a paid feature</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              Upload your logo, set your colors, and run meetings under your own brand on Team, Business, or Enterprise.
            </p>
            <Button
              className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-10 px-5"
              onClick={() => navigate("/billing")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <BackBar />

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">Meeting branding</h1>
            <p className="text-sm text-gray-500 mt-1">
              Customise how Lumicoria Meet looks for your organisation. Changes apply to every meeting your team hosts.
            </p>
          </div>
        </div>

        {/* Logo */}
        <SectionCard title="Logo" description="Square PNG with transparency works best. Replaces the Lumicoria watermark in the meeting corner.">
          <div className="flex items-start gap-6">
            <PreviewTile url={branding.meeting_logo_url} size={96} />
            <div className="flex-1">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleLogoChange(f);
                  e.target.value = "";
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="h-9"
                >
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload logo
                </Button>
                {branding.meeting_logo_url && (
                  <Button variant="ghost" size="sm" onClick={handleClearLogo} className="h-9 text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4 mr-1.5" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, WebP or SVG · max 1 MB · 64×64 to 1024×1024 recommended.</p>
            </div>
          </div>
        </SectionCard>

        {/* Favicon */}
        <SectionCard title="Favicon" description="Tab icon shown in the browser when participants are in the meeting.">
          <div className="flex items-start gap-6">
            <PreviewTile url={branding.meeting_favicon_url} size={48} rounded="rounded" />
            <div className="flex-1">
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/png,image/x-icon,image/svg+xml,image/webp"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFaviconChange(f);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="h-9"
              >
                {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload favicon
              </Button>
              <p className="text-xs text-gray-500 mt-2">PNG, SVG or ICO · max 200 KB · 32×32 recommended.</p>
            </div>
          </div>
        </SectionCard>

        {/* Colors */}
        <SectionCard title="Colors" description="These override Jitsi's button and toolbar colors inside the meeting.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField
              label="Primary color"
              value={branding.primary_color || "#6C4AB0"}
              onChange={(v) => handleField("primary_color", v)}
            />
            <ColorField
              label="Accent color"
              value={branding.accent_color || "#5B3FA0"}
              onChange={(v) => handleField("accent_color", v)}
            />
          </div>
        </SectionCard>

        {/* Text fields */}
        <SectionCard title="Names & links" description="What participants see inside and around the meeting.">
          <div className="space-y-4">
            <Field label="App name" hint="Replaces 'Lumicoria Meet' in the meeting chrome.">
              <Input
                value={branding.meeting_app_name || ""}
                onChange={(e) => handleField("meeting_app_name", e.target.value)}
                placeholder="Acme Meeting Room"
                maxLength={120}
                className="h-9"
              />
            </Field>
            <Field label="Watermark link" hint="Where the corner logo links to when clicked.">
              <Input
                type="url"
                value={branding.meeting_watermark_link || ""}
                onChange={(e) => handleField("meeting_watermark_link", e.target.value)}
                placeholder="https://yourcompany.com"
                maxLength={512}
                className="h-9"
              />
            </Field>
            <Field label="Welcome message" hint="Shown on the pre-join screen. Markdown not supported.">
              <textarea
                value={branding.meeting_welcome_message || ""}
                onChange={(e) => handleField("meeting_welcome_message", e.target.value)}
                placeholder="Welcome to your meeting. Please mute on entry."
                maxLength={2000}
                rows={3}
                className="w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Sticky save bar */}
        <div className="sticky bottom-6 mt-8 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-900/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Check className="w-4 h-4 text-emerald-500" />
            Live in every meeting you host
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/agents/meeting?branding-preview=true", "_blank")}
              className="h-9"
            >
              <Eye className="w-4 h-4 mr-2" /> Preview
              <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save branding
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


const BackBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
};


interface SectionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}
const SectionCard: React.FC<SectionCardProps> = ({ title, description, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    {children}
  </div>
);


interface PreviewTileProps {
  url?: string | null;
  size: number;
  rounded?: string;
}
const PreviewTile: React.FC<PreviewTileProps> = ({ url, size, rounded = "rounded-xl" }) => (
  <div
    className={`${rounded} bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center overflow-hidden`}
    style={{ width: size, height: size }}
  >
    {url ? (
      <img src={url} alt="" className="max-w-full max-h-full object-contain" />
    ) : (
      <ImageIcon className="w-6 h-6 text-purple-300" />
    )}
  </div>
);


interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}
const Field: React.FC<FieldProps> = ({ label, hint, children }) => (
  <div>
    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">{label}</Label>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);


interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}
const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange }) => (
  <div>
    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-9 rounded-md border border-gray-300 cursor-pointer"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#6C4AB0"
        pattern="^#[0-9a-fA-F]{6}$"
        className="h-9 font-mono text-xs flex-1"
        maxLength={7}
      />
    </div>
  </div>
);


export default MeetingBrandingPage;
