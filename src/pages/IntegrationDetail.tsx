import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, X, Plug, PlugZap, RefreshCw, Shield,
  Activity, ChevronRight, AlertCircle, Eye, EyeOff,
  Play, Loader2, Clock, Zap, ExternalLink, Copy,
  CheckCircle2, XCircle, Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  integrationApi,
  IntegrationCatalogDetail,
  IntegrationItem,
  IntegrationHealth,
  IntegrationActionResult,
} from '@/services/api';

// Providers that use OAuth popup flow (not credential paste)
const OAUTH_PROVIDERS = new Set(['google_workspace', 'slack', 'notion', 'salesforce']);

// ── Status config ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  active: { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  available: { dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50' },
  not_connected: { dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' },
  inactive: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
  error: { dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
};

// ── Main Component ───────────────────────────────────────────────────────

export default function IntegrationDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [catalogInfo, setCatalogInfo] = useState<IntegrationCatalogDetail | null>(null);
  const [userIntegration, setUserIntegration] = useState<IntegrationItem | null>(null);
  const [health, setHealth] = useState<IntegrationHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'settings'>('overview');
  const [actionResults, setActionResults] = useState<Record<string, IntegrationActionResult>>({});
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const isConnected = userIntegration && ['active'].includes(userIntegration.status);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    if (!type) return;
    setLoading(true);
    try {
      const [detail, integrations] = await Promise.all([
        integrationApi.getCatalogDetail(type),
        integrationApi.list(type),
      ]);
      setCatalogInfo(detail);

      if (integrations.length > 0) {
        const integ = integrations[0];
        setUserIntegration(integ);
        try {
          const h = await integrationApi.getHealth(integ.id);
          setHealth(h);
        } catch { /* health endpoint may not be available */ }
      }
    } catch {
      setCatalogInfo(getDefaultDetail(type));
    } finally {
      setLoading(false);
    }
  };

  // ── OAuth popup flow (Google, Slack, Notion) ───────────────────────────
  const handleOAuthConnect = async () => {
    if (!type) return;
    setConnecting(true);
    try {
      // 1. Get the auth URL from backend
      const { auth_url, state } = await integrationApi.getOAuthUrl(type);

      // 2. Open popup
      const width = 600, height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        auth_url,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},popup=yes`,
      );

      if (!popup) {
        toast({ title: 'Popup blocked', description: 'Please allow popups for this site.', variant: 'destructive' });
        setConnecting(false);
        return;
      }

      // 3. Listen for the callback postMessage from OAuthCallback.tsx
      const handler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== 'oauth_callback') return;
        window.removeEventListener('message', handler);

        if (event.data.error) {
          toast({
            title: 'Authentication failed',
            description: event.data.error_description || event.data.error,
            variant: 'destructive',
          });
          setConnecting(false);
          return;
        }

        // 4. Exchange the code for tokens via backend
        try {
          const result = await integrationApi.handleOAuthCallback({
            code: event.data.code,
            state: event.data.state,
            provider: type,
          });
          setUserIntegration(result);
          toast({ title: 'Connected!', description: `${catalogInfo?.name} is now connected.` });
        } catch (e: any) {
          toast({
            title: 'Connection failed',
            description: e?.response?.data?.detail || e.message || 'Token exchange failed.',
            variant: 'destructive',
          });
        } finally {
          setConnecting(false);
        }
      };
      window.addEventListener('message', handler);

      // Fallback: if popup is closed without completing, reset state
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener('message', handler);
          setConnecting(false);
        }
      }, 500);

    } catch (e: any) {
      toast({
        title: 'OAuth error',
        description: e?.response?.data?.detail || e.message || 'Could not start authentication.',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  // ── Credential paste flow (Salesforce, Stripe) ────────────────────────
  const handleCredentialConnect = async () => {
    if (!catalogInfo || !type) return;

    const missingFields = (catalogInfo.credential_fields || []).filter(
      (f) => !credentials[f.key]?.trim()
    );
    if (missingFields.length > 0) {
      toast({
        title: 'Missing credentials',
        description: `Please fill in: ${missingFields.map((f) => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setConnecting(true);
    try {
      const result = await integrationApi.connect({
        type,
        name: catalogInfo.name,
        credentials,
      });
      setUserIntegration(result);
      setShowCredentials(false);
      toast({ title: 'Connected!', description: `${catalogInfo.name} is now connected.` });
    } catch (e: any) {
      toast({
        title: 'Connection failed',
        description: e?.response?.data?.detail || e.message || 'Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleConnect = () => {
    if (type && OAUTH_PROVIDERS.has(type)) {
      handleOAuthConnect();
    } else {
      handleCredentialConnect();
    }
  };

  const handleDisconnect = async () => {
    if (!userIntegration) return;
    setDisconnecting(true);
    try {
      await integrationApi.disconnect(userIntegration.id);
      setUserIntegration(null);
      setHealth(null);
      setCredentials({});
      toast({ title: 'Disconnected', description: `${catalogInfo?.name} has been disconnected.` });
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to disconnect.', variant: 'destructive' });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    if (!userIntegration) return;
    setSyncing(true);
    try {
      await integrationApi.triggerSync(userIntegration.id);
      toast({ title: 'Sync triggered', description: 'Data is being synchronized.' });
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const handleExecuteAction = async (action: string) => {
    if (!userIntegration) return;
    setExecutingAction(action);
    try {
      const result = await integrationApi.executeAction(userIntegration.id, action);
      setActionResults((prev) => ({ ...prev, [action]: result }));
    } catch (e: any) {
      setActionResults((prev) => ({
        ...prev,
        [action]: { success: false, error: e.message || 'Action failed' },
      }));
    } finally {
      setExecutingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-lumicoria-purple animate-spin" />
      </div>
    );
  }

  if (!catalogInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Integration not found</p>
          <Button variant="ghost" onClick={() => navigate('/integrations')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Integrations
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[userIntegration?.status || 'not_connected'] || STATUS_COLORS.not_connected;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Back button ──────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/integrations')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All Integrations
        </motion.button>

        {/* ── Header Card ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-sm mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lumicoria-purple/[0.02] via-transparent to-blue-500/[0.02]" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={catalogInfo.icon}
                  alt={catalogInfo.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/lumicoria-logo-primary.png';
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{catalogInfo.name}</h1>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} ${isConnected ? 'animate-pulse' : ''}`} />
                    {isConnected ? 'Connected' : userIntegration?.status === 'inactive' ? 'Disconnected' : 'Not Connected'}
                  </div>
                </div>
                <p className="text-gray-500 mb-4">{catalogInfo.description}</p>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                        className="rounded-full"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                      </Button>
                    </>
                  ) : type && OAUTH_PROVIDERS.has(type) ? (
                    <Button
                      size="sm"
                      onClick={handleOAuthConnect}
                      disabled={connecting}
                      className="rounded-full bg-lumicoria-purple hover:bg-lumicoria-purple/90"
                    >
                      {connecting ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <PlugZap className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {connecting ? 'Authenticating...' : `Connect ${catalogInfo.name}`}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setShowCredentials(true)}
                      className="rounded-full bg-lumicoria-purple hover:bg-lumicoria-purple/90"
                    >
                      <PlugZap className="w-3.5 h-3.5 mr-1.5" />
                      Connect {catalogInfo.name}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Credentials Form (slide-down) — only for non-OAuth providers ── */}
        <AnimatePresence>
          {showCredentials && !isConnected && type && !OAUTH_PROVIDERS.has(type) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-lumicoria-purple/20 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-lumicoria-purple" />
                  <h3 className="font-semibold text-gray-900">Connection Credentials</h3>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  Your credentials are encrypted with AES-256 (Fernet) before storage. We never log or expose them.
                </p>

                <div className="space-y-4">
                  {(catalogInfo.credential_fields || []).map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                      </label>
                      {field.type === 'file' ? (
                        <div className="relative">
                          <textarea
                            placeholder="Paste your JSON credentials here..."
                            rows={4}
                            value={credentials[field.key] || ''}
                            onChange={(e) =>
                              setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-lumicoria-purple/20 focus:border-lumicoria-purple/40 outline-none resize-none"
                          />
                        </div>
                      ) : (
                        <CredentialInput
                          type={field.type}
                          placeholder={field.label}
                          value={credentials[field.key] || ''}
                          onChange={(val) =>
                            setCredentials((prev) => ({ ...prev, [field.key]: val }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button
                    onClick={handleCredentialConnect}
                    disabled={connecting}
                    className="rounded-full bg-lumicoria-purple hover:bg-lumicoria-purple/90"
                  >
                    {connecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {connecting ? 'Connecting...' : 'Save & Connect'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCredentials(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100/80 rounded-xl p-1 w-fit">
          {(['overview', 'actions', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'actions' && `Actions (${(catalogInfo.available_actions || []).length})`}
              {tab === 'settings' && 'Settings'}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Health metrics */}
              {isConnected && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard
                    label="Status"
                    value={health?.status || 'Active'}
                    icon={Activity}
                    color="text-emerald-600"
                  />
                  <MetricCard
                    label="Last Sync"
                    value={health?.last_sync ? new Date(health.last_sync).toLocaleDateString() : 'Never'}
                    icon={Clock}
                    color="text-blue-600"
                  />
                  <MetricCard
                    label="Errors (7d)"
                    value={String(health?.recent_errors || 0)}
                    icon={AlertCircle}
                    color={health?.recent_errors ? 'text-red-500' : 'text-gray-400'}
                  />
                  <MetricCard
                    label="Webhooks"
                    value={String(health?.active_webhooks || 0)}
                    icon={Zap}
                    color="text-lumicoria-purple"
                  />
                </div>
              )}

              {/* Capabilities */}
              <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(catalogInfo.available_actions || []).slice(0, 8).map((action) => (
                    <div
                      key={action}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-lumicoria-purple/5 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-lumicoria-purple" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {formatActionName(action)}
                      </span>
                    </div>
                  ))}
                </div>
                {(catalogInfo.available_actions || []).length === 0 && (
                  <p className="text-sm text-gray-400 italic">Coming soon — this integration is under development.</p>
                )}
              </div>

              {/* Security info */}
              <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-lumicoria-purple" />
                  <h3 className="font-semibold text-gray-900">Security</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Credentials are encrypted with AES-256 (Fernet) encryption at rest.</p>
                  <p>All API calls are made server-side — tokens never reach the browser.</p>
                  <p>You can disconnect at any time to revoke access.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {(catalogInfo.available_actions || []).length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-gray-200/60 bg-white/80">
                  <Settings2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No actions available yet for this integration.</p>
                </div>
              ) : (
                (catalogInfo.available_actions || []).map((action) => (
                  <ActionRow
                    key={action}
                    action={action}
                    isConnected={!!isConnected}
                    executing={executingAction === action}
                    result={actionResults[action]}
                    onExecute={() => handleExecuteAction(action)}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Integration Settings</h3>

                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Auto-sync</p>
                        <p className="text-xs text-gray-500">Automatically sync data on a schedule</p>
                      </div>
                      <div className="text-sm text-gray-400">Coming soon</div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Webhooks</p>
                        <p className="text-xs text-gray-500">Receive real-time updates</p>
                      </div>
                      <div className="text-sm text-gray-400">Coming soon</div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Update credentials</p>
                        <p className="text-xs text-gray-500">Replace your existing connection credentials</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => { setShowCredentials(true); setActiveTab('overview'); }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Connect this integration to access settings.</p>
                )}
              </div>

              {/* Danger zone */}
              {isConnected && (
                <div className="rounded-2xl border border-red-200/60 bg-red-50/30 p-6">
                  <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-600/70 mb-4">
                    Disconnecting will remove stored credentials and stop all syncs.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    {disconnecting ? 'Disconnecting...' : 'Disconnect Integration'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function MetricCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white/80 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-lg font-semibold text-gray-900 capitalize">{value}</p>
    </div>
  );
}

function ActionRow({
  action, isConnected, executing, result, onExecute,
}: {
  action: string;
  isConnected: boolean;
  executing: boolean;
  result?: IntegrationActionResult;
  onExecute: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-gray-200/60 bg-white/80 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-lumicoria-purple/5 flex items-center justify-center">
          <Play className="w-4 h-4 text-lumicoria-purple" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{formatActionName(action)}</p>
          <p className="text-xs text-gray-400 font-mono">{action}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {result && (
          <div className={`flex items-center gap-1 text-xs ${result.success ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {result.success ? 'Success' : 'Failed'}
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={!isConnected || executing}
          onClick={onExecute}
          className="rounded-full text-xs"
        >
          {executing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Play className="w-3 h-3 mr-1" /> Test
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function CredentialInput({
  type, placeholder, value, onChange,
}: {
  type: string; placeholder: string; value: string; onChange: (val: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const isSecret = type === 'password';

  return (
    <div className="relative">
      <Input
        type={isSecret && !visible ? 'password' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-lumicoria-purple/20 focus:border-lumicoria-purple/40"
      />
      {isSecret && (
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatActionName(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDefaultDetail(type: string): IntegrationCatalogDetail {
  const defaults: Record<string, IntegrationCatalogDetail> = {
    google_workspace: {
      type: 'google_workspace',
      name: 'Google Workspace',
      description: 'Calendar, Drive, Docs, Sheets, Gmail — your full Google productivity suite.',
      icon: '/images/integrations/google-workspace.png',
      category: 'productivity',
      available_actions: [
        'create_calendar_event', 'list_calendars', 'get_upcoming_events',
        'create_document', 'list_files', 'create_project_folder', 'send_email',
      ],
      is_configured: false,
      status: 'not_connected',
      credential_fields: [], // OAuth — no manual fields
    },
    slack: {
      type: 'slack',
      name: 'Slack',
      description: 'Channels, messages, reminders, file sharing — keep your team in sync.',
      icon: '/images/integrations/slack.png',
      category: 'communication',
      available_actions: [
        'create_project_channel', 'add_project_task', 'export_meeting_notes',
        'create_reminder', 'search_project_content',
      ],
      is_configured: false,
      status: 'not_connected',
      credential_fields: [], // OAuth — no manual fields
    },
    notion: {
      type: 'notion',
      name: 'Notion',
      description: 'Pages, databases, knowledge bases — structured docs and project management.',
      icon: '/images/integrations/notion.png',
      category: 'productivity',
      available_actions: [
        'create_project', 'add_project_task', 'search_projects',
        'create_meeting_notes', 'export_meeting_to_notion',
      ],
      is_configured: false,
      status: 'not_connected',
      credential_fields: [], // OAuth — no manual fields
    },
    salesforce: {
      type: 'salesforce',
      name: 'Salesforce',
      description: 'CRM contacts, leads, opportunities — manage your sales pipeline.',
      icon: '/images/integrations/salesforce.png',
      category: 'crm',
      available_actions: [
        'get_contacts', 'create_contact', 'get_leads', 'create_lead',
        'get_opportunities', 'create_opportunity', 'search_records',
      ],
      is_configured: false,
      status: 'not_connected',
      credential_fields: [], // OAuth — no manual fields
    },
    stripe: {
      type: 'stripe',
      name: 'Stripe',
      description: 'Payments, subscriptions, invoices — your billing backbone.',
      icon: '/images/integrations/stripe.png',
      category: 'payments',
      available_actions: [],
      is_configured: false,
      status: 'not_connected',
      credential_fields: [
        { key: 'secret_key', label: 'Secret Key (sk_...)', type: 'password' },
        { key: 'webhook_secret', label: 'Webhook Secret (whsec_...)', type: 'password' },
      ],
    },
  };
  return defaults[type] || {
    type: type,
    name: type,
    description: 'Integration details unavailable.',
    icon: '/images/lumicoria-logo-primary.png',
    category: 'other',
    available_actions: [],
    is_configured: false,
    status: 'not_connected',
    credential_fields: [],
  };
}
