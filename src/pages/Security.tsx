import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  Key,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  securityApi,
  type SecurityOverview,
  type LoginEvent,
  type SessionInfo,
} from '@/services/api';

type TabId = 'overview' | 'activity' | 'sessions' | 'password';

export default function Security() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const initialTab: TabId = location.pathname.includes('/security/activity') ? 'activity' : 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data state
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'password', label: 'Password' },
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || !overview) {
        const data = await securityApi.getOverview();
        setOverview(data);
      }
      if (activeTab === 'activity') {
        const data = await securityApi.getActivity(50);
        setEvents(data.events);
        setEventsTotal(data.total);
      }
      if (activeTab === 'sessions') {
        const data = await securityApi.getSessions();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await securityApi.revokeSession(sessionId);
      toast({ title: 'Session revoked', description: 'The session has been terminated.' });
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke session.', variant: 'destructive' });
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      const result = await securityApi.revokeAllSessions();
      // Update local refresh token
      if (result.new_refresh_token) {
        localStorage.setItem('refreshToken', result.new_refresh_token);
      }
      toast({ title: 'All sessions revoked', description: 'All other sessions have been terminated.' });
      await loadData();
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke sessions.', variant: 'destructive' });
    } finally {
      setRevokingAll(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      await securityApi.changePassword(currentPassword, newPassword);
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to change password.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return <Globe className="h-4 w-4" />;
    const lower = device.toLowerCase();
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const parseDeviceName = (ua?: string) => {
    if (!ua) return 'Unknown device';
    // Extract browser + OS from user agent
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return ua.substring(0, 40) + (ua.length > 40 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-gray-900" />
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Security</h1>
          </div>
          <p className="text-sm text-gray-500 ml-9">
            Manage your account security, review login activity, and control active sessions.
          </p>

          {/* Breadcrumb-style nav links */}
          <div className="flex items-center gap-2 mt-4 ml-9 text-xs text-gray-400">
            <Link to="/settings" className="hover:text-gray-600 transition-colors">Settings</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/billing" className="hover:text-gray-600 transition-colors">Billing</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">Security</span>
            <ChevronRight className="h-3 w-3" />
            <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 text-sm font-medium border-b-2 transition-all
                  ${activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : (
          <>
            {/* ── Overview Tab ────────────────────────────────────── */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-6">
                {/* Security Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-gray-100 shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        {overview.two_factor_enabled ? (
                          <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ShieldAlert className="h-5 w-5 text-amber-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">Two-Factor Auth</span>
                      </div>
                      <Badge variant={overview.two_factor_enabled ? "default" : "secondary"}
                        className={overview.two_factor_enabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
                        }>
                        {overview.two_factor_enabled ? 'Enabled' : 'Not enabled'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-100 shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        {overview.email_verified ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">Email Verified</span>
                      </div>
                      <Badge variant={overview.email_verified ? "default" : "destructive"}
                        className={overview.email_verified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                        }>
                        {overview.email_verified ? 'Verified' : 'Not verified'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-100 shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Monitor className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">Active Sessions</span>
                      </div>
                      <span className="text-2xl font-semibold text-gray-900">{overview.active_sessions}</span>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Details */}
                <Card className="border-gray-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-gray-50">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Last login</span>
                        </div>
                        <span className="text-sm text-gray-900">{formatDate(overview.last_login)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Key className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Last password change</span>
                        </div>
                        <span className="text-sm text-gray-900">{formatDate(overview.last_password_change)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Total logins</span>
                        </div>
                        <span className="text-sm text-gray-900">{overview.login_count}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Failed login attempts</span>
                        </div>
                        <span className={`text-sm ${overview.failed_login_attempts > 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {overview.failed_login_attempts}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Account created</span>
                        </div>
                        <span className="text-sm text-gray-900">{formatDate(overview.account_created)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-gray-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button
                      onClick={() => setActiveTab('password')}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Change password</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Manage active sessions</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Review login activity</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Activity Tab ────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-medium text-gray-900">Login Activity</h2>
                  <span className="text-xs text-gray-400">{eventsTotal} events</span>
                </div>

                {events.length === 0 ? (
                  <Card className="border-gray-100 shadow-none">
                    <CardContent className="py-12 text-center">
                      <Shield className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No security events recorded yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${
                          event.status === 'failed'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          {event.status === 'failed' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {event.description}
                            </span>
                            <Badge variant="secondary" className="text-[10px] bg-gray-50 text-gray-500 border-gray-100">
                              {event.method}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            {event.ip_address && <span>{event.ip_address}</span>}
                            {event.device && (
                              <span className="flex items-center gap-1">
                                {getDeviceIcon(event.device)}
                                {parseDeviceName(event.device)}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Sessions Tab ────────────────────────────────────── */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-medium text-gray-900">Active Sessions</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevokeAll}
                    disabled={revokingAll}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    {revokingAll ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <LogOut className="h-3 w-3 mr-1" />
                    )}
                    Revoke all other sessions
                  </Button>
                </div>

                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.session_id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        session.is_current
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        session.is_current ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {getDeviceIcon(session.device)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {parseDeviceName(session.device)}
                          </span>
                          {session.is_current && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] hover:bg-emerald-100">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          {session.ip_address && <span>{session.ip_address}</span>}
                          <span>Last active: {formatDate(session.last_active)}</span>
                        </div>
                      </div>

                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.session_id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Password Tab ────────────────────────────────────── */}
            {activeTab === 'password' && (
              <div className="max-w-md">
                <Card className="border-gray-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Change Password</CardTitle>
                    <CardDescription>
                      Enter your current password and choose a new one.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Current password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        New password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 characters)"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Confirm new password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      className="w-full bg-gray-900 hover:bg-gray-800"
                    >
                      {changingPassword ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Changing...</>
                      ) : (
                        <><Lock className="h-4 w-4 mr-2" /> Change Password</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
