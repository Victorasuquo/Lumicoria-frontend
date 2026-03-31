import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, Search, Check, AlertCircle, Clock, ArrowRight,
  Zap, Shield, RefreshCw, ChevronRight, Sparkles, X,
  ExternalLink, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  integrationApi,
  IntegrationCatalogItem,
  IntegrationItem,
} from '@/services/api';

// ── Category config ──────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'productivity', label: 'Productivity', icon: Zap },
  { key: 'communication', label: 'Communication', icon: Activity },
  { key: 'crm', label: 'CRM', icon: ExternalLink },
  { key: 'payments', label: 'Payments', icon: Shield },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active: { label: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Check },
  available: { label: 'Available', color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap },
  not_connected: { label: 'Not Connected', color: 'text-gray-400', bg: 'bg-gray-50', icon: Plug },
  inactive: { label: 'Disconnected', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
  error: { label: 'Error', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
  pending: { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
  configuration_required: { label: 'Setup Needed', color: 'text-orange-500', bg: 'bg-orange-50', icon: AlertCircle },
};

// ── Main Component ───────────────────────────────────────────────────────

export default function IntegrationsHub() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [catalog, setCatalog] = useState<IntegrationCatalogItem[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catalogData, userData] = await Promise.all([
        integrationApi.getCatalog(),
        integrationApi.list(),
      ]);
      setCatalog(catalogData);
      setUserIntegrations(userData);
    } catch {
      // If backend isn't available, show catalog with default data
      setCatalog(getDefaultCatalog());
    } finally {
      setLoading(false);
    }
  };

  const filtered = catalog.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = catalog.filter(
    (i) => i.status === 'active' || i.is_configured,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero Section ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lumicoria-purple/5 border border-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            <Plug className="w-3.5 h-3.5" />
            Integrations
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Works With Tools You Already Use
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Connect your favorite apps to Lumicoria. Seamless sync, zero friction.
          </p>

          {/* Stats pills */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">{connectedCount} Connected</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-lumicoria-purple" />
              <span className="text-sm font-medium text-gray-700">{catalog.length} Available</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Encrypted</span>
            </div>
          </div>
        </motion.div>

        {/* ── Search & Filters ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl h-11 shadow-sm focus:ring-lumicoria-purple/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`
                      flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                      transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Integration Grid ─────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((integration, index) => (
                <IntegrationCard
                  key={integration.type}
                  integration={integration}
                  index={index}
                  onClick={() => navigate(`/integrations/${integration.type}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No integrations match your search</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="text-lumicoria-purple text-sm mt-2 hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        {/* ── Bottom CTA ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-br from-lumicoria-purple/5 to-blue-50/50 border border-lumicoria-purple/10">
            <p className="text-gray-600 text-sm">Need a custom integration?</p>
            <Button
              variant="outline"
              className="rounded-full border-lumicoria-purple/20 text-lumicoria-purple hover:bg-lumicoria-purple/5"
              onClick={() => navigate('/contact')}
            >
              Request Integration <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Integration Card ─────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  index,
  onClick,
}: {
  integration: IntegrationCatalogItem;
  index: number;
  onClick: () => void;
}) {
  const statusInfo = STATUS_CONFIG[integration.status] || STATUS_CONFIG.not_connected;
  const StatusIcon = statusInfo.icon;
  const isConnected = integration.status === 'active' || integration.is_configured;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Glass card */}
      <div className={`
        relative overflow-hidden rounded-2xl border
        bg-white/80 backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-gray-200/60 hover:-translate-y-1
        ${isConnected
          ? 'border-emerald-200/60 shadow-sm shadow-emerald-100/40'
          : 'border-gray-200/60 shadow-sm'
        }
      `}>
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-lumicoria-purple/[0.02] via-transparent to-blue-500/[0.02]" />

        <div className="relative p-6">
          {/* Top row: icon + status */}
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center
                bg-white border border-gray-100 shadow-sm
                group-hover:shadow-md group-hover:scale-105
                transition-all duration-300
              `}>
                <img
                  src={integration.icon}
                  alt={integration.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/lumicoria-logo-primary.png';
                  }}
                />
              </div>
              {isConnected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </div>
          </div>

          {/* Name & description */}
          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-lumicoria-purple transition-colors">
            {integration.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {integration.description}
          </p>

          {/* Bottom row: actions count + arrow */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {integration.available_actions.length} action{integration.available_actions.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-lumicoria-purple transition-colors">
              {isConnected ? 'Manage' : 'Connect'}
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Default catalog fallback ─────────────────────────────────────────────

function getDefaultCatalog(): IntegrationCatalogItem[] {
  return [
    {
      type: 'google_workspace',
      name: 'Google Workspace',
      description: 'Calendar, Drive, Docs, Sheets, Gmail — your full Google productivity suite.',
      icon: '/images/integrations/google-workspace.png',
      available_actions: [
        'create_calendar_event', 'list_calendars', 'get_upcoming_events',
        'create_document', 'list_files', 'send_email',
      ],
      is_configured: false,
      status: 'not_connected',
      category: 'productivity',
    },
    {
      type: 'slack',
      name: 'Slack',
      description: 'Channels, messages, reminders, file sharing — keep your team in sync.',
      icon: '/images/integrations/slack.png',
      available_actions: [
        'create_project_channel', 'add_project_task', 'export_meeting_notes',
        'create_reminder', 'search_project_content',
      ],
      is_configured: false,
      status: 'not_connected',
      category: 'communication',
    },
    {
      type: 'notion',
      name: 'Notion',
      description: 'Pages, databases, knowledge bases — structured docs and project management.',
      icon: '/images/integrations/notion.png',
      available_actions: [
        'create_project', 'add_project_task', 'search_projects',
        'create_meeting_notes', 'export_meeting_to_notion',
      ],
      is_configured: false,
      status: 'not_connected',
      category: 'productivity',
    },
    {
      type: 'salesforce',
      name: 'Salesforce',
      description: 'CRM contacts, leads, opportunities — manage your sales pipeline.',
      icon: '/images/integrations/salesforce.png',
      available_actions: [],
      is_configured: false,
      status: 'not_connected',
      category: 'crm',
    },
    {
      type: 'stripe',
      name: 'Stripe',
      description: 'Payments, subscriptions, invoices — your billing backbone.',
      icon: '/images/integrations/stripe.png',
      available_actions: [],
      is_configured: false,
      status: 'not_connected',
      category: 'payments',
    },
  ];
}
