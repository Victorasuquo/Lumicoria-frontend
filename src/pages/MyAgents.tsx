import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, Plus, Star, BarChart3,
  FileText, Mic, Heart, Eye, Sparkles, Brain,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { agentApi } from '@/services/api';

// ── Type/icon/color mapping ──
const AGENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  document: { icon: <FileText className="h-5 w-5" />, color: '#6366f1', label: 'Document' },
  meeting: { icon: <Mic className="h-5 w-5" />, color: '#0ea5e9', label: 'Meeting' },
  wellbeing: { icon: <Heart className="h-5 w-5" />, color: '#ec4899', label: 'Well-being' },
  vision: { icon: <Eye className="h-5 w-5" />, color: '#10b981', label: 'Vision' },
  creative: { icon: <Sparkles className="h-5 w-5" />, color: '#f59e0b', label: 'Creative' },
  research: { icon: <Brain className="h-5 w-5" />, color: '#8b5cf6', label: 'Research' },
  student: { icon: <Sparkles className="h-5 w-5" />, color: '#06b6d4', label: 'Student' },
  learning_coach: { icon: <Brain className="h-5 w-5" />, color: '#14b8a6', label: 'Learning' },
  custom: { icon: <Zap className="h-5 w-5" />, color: '#6b7280', label: 'Custom' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'active' },
  deployed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'active' },
  inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', label: 'paused' },
  draft: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'draft' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'error' },
  archived: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-400', label: 'archived' },
};

const FILTER_TABS = ['All', 'Active', 'Paused', 'Draft'];

const MyAgents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await agentApi.getAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch {
      // Empty state will show
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: string, agentName: string) => {
    try {
      await agentApi.deleteAgent(agentId);
      toast({ title: "Agent removed", description: `"${agentName}" has been removed.` });
      setAgents(prev => prev.filter(a => (a.id || a._id) !== agentId));
    } catch {
      toast({ title: "Error", description: "Failed to remove agent.", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (agent: any) => {
    const agentId = agent.id || agent._id;
    const currentStatus = agent.status || agent.state?.status || 'active';
    const newStatus = currentStatus === 'active' || currentStatus === 'deployed' ? 'inactive' : 'active';
    try {
      await agentApi.updateAgent(agentId, { status: newStatus, state: { status: newStatus } });
      setAgents(prev => prev.map(a => {
        if ((a.id || a._id) === agentId) {
          return { ...a, status: newStatus, state: { ...a.state, status: newStatus } };
        }
        return a;
      }));
      toast({ title: newStatus === 'active' ? "Agent activated" : "Agent paused" });
    } catch {
      toast({ title: "Error", description: "Failed to update agent.", variant: "destructive" });
    }
  };

  // Filtering
  const filteredAgents = agents.filter(agent => {
    const status = agent.status || agent.state?.status || 'active';
    const name = agent.name || '';
    const desc = agent.description || '';

    // Search filter
    if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase()) && !desc.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tab filter
    if (activeFilter === 'Active') return status === 'active' || status === 'deployed';
    if (activeFilter === 'Paused') return status === 'inactive';
    if (activeFilter === 'Draft') return status === 'draft';
    return true;
  });

  // Stats
  const totalAgents = agents.length;
  const activeCount = agents.filter(a => (a.status || a.state?.status) === 'active' || (a.status || a.state?.status) === 'deployed').length;
  const pausedCount = agents.filter(a => (a.status || a.state?.status) === 'inactive').length;
  const draftCount = agents.filter(a => (a.status || a.state?.status) === 'draft').length;
  const totalUsage = agents.reduce((sum, a) => sum + (a.usage_count || a.usage_statistics?.total_runs || 0), 0);

  const getTypeConfig = (agentType: string) => {
    return AGENT_TYPE_CONFIG[agentType] || AGENT_TYPE_CONFIG.custom;
  };

  const getStatusStyle = (status: string) => {
    return STATUS_STYLES[status] || STATUS_STYLES.draft;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Agents</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate('/agent-builder')}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Agent
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total', value: totalAgents, icon: <Zap className="h-4 w-4 text-indigo-500" /> },
              { label: 'Active', value: activeCount, icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
              { label: 'Draft', value: draftCount, icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
              { label: 'Total Runs', value: totalUsage, icon: <BarChart3 className="h-4 w-4 text-gray-400" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeFilter === tab
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <img
                src="/images/lumicoria-logo-gradient.png"
                alt="Loading"
                className="h-12 w-12 rounded-2xl animate-pulse"
              />
              <p className="text-sm text-gray-400">Loading agents...</p>
            </div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              {searchQuery || activeFilter !== 'All' ? 'No matching agents' : 'No agents yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {searchQuery || activeFilter !== 'All'
                ? 'Try a different search or filter.'
                : 'Create your first AI agent to get started.'}
            </p>
            {!searchQuery && activeFilter === 'All' && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate('/agent-builder')}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Agent
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredAgents.map((agent, idx) => {
                const agentId = agent.id || agent._id;
                const agentType = agent.agent_type || agent.type || 'custom';
                const status = agent.status || agent.state?.status || 'active';
                const typeConfig = getTypeConfig(agentType);
                const statusStyle = getStatusStyle(status);
                const capabilities = agent.capabilities || [];
                const rating = agent.success_rate ? (agent.success_rate / 20).toFixed(1) : null;
                const runs = agent.usage_count || agent.usage_statistics?.total_runs || 0;

                return (
                  <motion.div
                    key={agentId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => status === 'draft'
                      ? navigate(`/agent-builder?edit=${agentId}`)
                      : navigate(`/agents/my-agents/${agentId}`)
                    }
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${typeConfig.color}15`, color: typeConfig.color }}
                      >
                        {typeConfig.icon}
                      </div>
                      <Badge className={`text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text} border-0`}>
                        {statusStyle.label}
                      </Badge>
                    </div>

                    {/* Name & Description */}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {agent.description || `A ${typeConfig.label} agent`}
                    </p>

                    {/* Capability Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(Array.isArray(capabilities) ? capabilities.slice(0, 3) : []).map((cap: string) => {
                        const label = typeof cap === 'string'
                          ? cap.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : typeof cap === 'object' && cap !== null ? (cap as any).name || '' : '';
                        return label ? (
                          <span
                            key={label}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          >
                            {label}
                          </span>
                        ) : null;
                      })}
                      {capabilities.length > 3 && (
                        <span className="text-[10px] text-gray-300 dark:text-gray-600 px-1">
                          +{capabilities.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        {rating && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span>{rating}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <BarChart3 className="h-3 w-3" />
                          <span>{runs.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {status === 'draft' ? (
                          <button
                            onClick={() => navigate(`/agent-builder?edit=${agentId}`)}
                            className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors font-medium"
                          >
                            Continue Editing
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(agent)}
                            className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {status === 'active' || status === 'deployed' ? 'Pause' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(agentId, agent.name)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
