import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Star, BarChart3, Clock, Calendar, Tag,
  FileText, Mic, Heart, Eye, Sparkles, Brain, Zap,
  Play, Pause, Trash2, Settings, Copy, CheckCircle2, Pencil,
  Activity, TrendingUp, Timer, Users, ChevronRight,
  Loader2, AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { agentApi } from '@/services/api';

// ── Type/icon/color mapping (shared with MyAgents) ──
const AGENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  document:       { icon: <FileText className="h-6 w-6" />, color: '#6366f1', label: 'Document' },
  meeting:        { icon: <Mic className="h-6 w-6" />,      color: '#0ea5e9', label: 'Meeting' },
  wellbeing:      { icon: <Heart className="h-6 w-6" />,    color: '#ec4899', label: 'Well-being' },
  vision:         { icon: <Eye className="h-6 w-6" />,      color: '#10b981', label: 'Vision' },
  creative:       { icon: <Sparkles className="h-6 w-6" />, color: '#f59e0b', label: 'Creative' },
  research:       { icon: <Brain className="h-6 w-6" />,    color: '#8b5cf6', label: 'Research' },
  student:        { icon: <Sparkles className="h-6 w-6" />, color: '#06b6d4', label: 'Student' },
  learning_coach: { icon: <Brain className="h-6 w-6" />,    color: '#14b8a6', label: 'Learning' },
  custom:         { icon: <Zap className="h-6 w-6" />,      color: '#6b7280', label: 'Custom' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:   { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', label: 'Active' },
  deployed: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', label: 'Active' },
  inactive: { bg: 'bg-gray-50 dark:bg-gray-800',      text: 'text-gray-500 dark:text-gray-400',   dot: 'bg-gray-400',  label: 'Paused' },
  draft:    { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', label: 'Draft' },
  error:    { bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-700 dark:text-red-400',     dot: 'bg-red-500',   label: 'Error' },
  archived: { bg: 'bg-gray-50 dark:bg-gray-800',      text: 'text-gray-400',                      dot: 'bg-gray-300',  label: 'Archived' },
};

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  document_processing:    <FileText className="h-4 w-4" />,
  ocr:                    <Eye className="h-4 w-4" />,
  text_analysis:          <Brain className="h-4 w-4" />,
  task_generation:        <CheckCircle2 className="h-4 w-4" />,
  calendar_integration:   <Calendar className="h-4 w-4" />,
  wellbeing_monitoring:   <Heart className="h-4 w-4" />,
  vision_analysis:        <Eye className="h-4 w-4" />,
  voice_processing:       <Mic className="h-4 w-4" />,
  research:               <Brain className="h-4 w-4" />,
  summarization:          <FileText className="h-4 w-4" />,
  translation:            <Sparkles className="h-4 w-4" />,
  creative_writing:       <Sparkles className="h-4 w-4" />,
  data_extraction:        <BarChart3 className="h-4 w-4" />,
  chain_of_thought:       <Activity className="h-4 w-4" />,
  citation_management:    <Tag className="h-4 w-4" />,
};

const AgentDetail = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (agentId) loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentApi.getAgent(agentId!);
      setAgent(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;
    setToggling(true);
    const currentStatus = agent.status || agent.state?.status || 'active';
    const newStatus = currentStatus === 'active' || currentStatus === 'deployed' ? 'inactive' : 'active';
    try {
      await agentApi.updateAgent(agentId!, { status: newStatus, state: { status: newStatus } });
      setAgent((prev: any) => ({ ...prev, status: newStatus, state: { ...prev.state, status: newStatus } }));
      toast({ title: newStatus === 'active' ? 'Agent activated' : 'Agent paused' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update agent.', variant: 'destructive' });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    try {
      await agentApi.deleteAgent(agentId!);
      toast({ title: 'Agent removed', description: `"${agent.name}" has been removed.` });
      navigate('/agents/my-agents');
    } catch {
      toast({ title: 'Error', description: 'Failed to remove agent.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/images/lumicoria-logo-gradient.png"
            alt="Loading"
            className="h-12 w-12 rounded-2xl animate-pulse"
          />
          <p className="text-sm text-gray-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Agent not found</h2>
          <p className="text-sm text-gray-400 mb-6">{error || 'This agent does not exist.'}</p>
          <Button variant="outline" onClick={() => navigate('/agents/my-agents')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Agents
          </Button>
        </div>
      </div>
    );
  }

  // Derive display values
  const agentType = agent.agent_type || agent.type || 'custom';
  const agentStatus = agent.status || agent.state?.status || 'active';
  const typeConfig = AGENT_TYPE_CONFIG[agentType] || AGENT_TYPE_CONFIG.custom;
  const statusStyle = STATUS_STYLES[agentStatus] || STATUS_STYLES.draft;
  const capabilities = agent.capabilities || [];
  const tags = agent.tags || [];
  const runs = agent.usage_count || agent.usage_statistics?.total_runs || 0;
  const successRate = agent.success_rate || 0;
  const rating = successRate ? (successRate / 20).toFixed(1) : null;
  const configuration = agent.configuration || {};
  const modelConfig = agent.agent_model_config || agent.model_config || {};
  const pipeline = agent.pipeline || configuration.pipeline || {};
  const pipelineInputs = pipeline.inputs || [];
  const pipelineProcessors = pipeline.processors || [];
  const pipelineOutputs = pipeline.outputs || [];
  const createdAt = agent.created_at ? new Date(agent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const updatedAt = agent.updated_at ? new Date(agent.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const isActive = agentStatus === 'active' || agentStatus === 'deployed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/agents/my-agents')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Agents
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${typeConfig.color}15`, color: typeConfig.color }}
              >
                {typeConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{agent.name}</h1>
                  <Badge className={`text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5 inline-block`} />
                    {statusStyle.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  {agent.description || `A ${typeConfig.label} agent`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {agentStatus === 'draft' ? (
                <Button
                  size="sm"
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate(`/agent-builder?edit=${agentId}`)}
                >
                  <Pencil className="h-4 w-4" /> Continue Editing
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className="gap-1.5"
                >
                  {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isActive ? 'Pause' : 'Activate'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Accuracy', value: successRate ? `${successRate}%` : '—', icon: <TrendingUp className="h-4 w-4 text-green-500" />, color: 'text-green-600' },
                  { label: 'Total Runs', value: runs.toLocaleString(), icon: <BarChart3 className="h-4 w-4 text-indigo-500" />, color: 'text-indigo-600' },
                  { label: 'Avg Time', value: agent.avg_response_time ? `${agent.avg_response_time}s` : '—', icon: <Timer className="h-4 w-4 text-amber-500" />, color: 'text-amber-600' },
                  { label: 'Rating', value: rating ? `${rating}/5` : '—', icon: <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />, color: 'text-yellow-600' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-4 text-center">
                    <div className="flex items-center justify-center mb-2">{m.icon}</div>
                    <p className={`text-xl font-bold ${m.color} dark:text-white`}>{m.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Capabilities</h2>
              {capabilities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {capabilities.map((cap: string, i: number) => {
                    const capKey = typeof cap === 'string' ? cap.toLowerCase() : '';
                    const label = typeof cap === 'string'
                      ? cap.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                      : typeof cap === 'object' && cap !== null ? (cap as any).name || '' : '';
                    const icon = CAPABILITY_ICONS[capKey] || <Zap className="h-4 w-4" />;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500">
                          {icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No capabilities configured.</p>
              )}
            </motion.div>

            {/* Workflow Pipeline */}
            {(pipelineInputs.length > 0 || pipelineProcessors.length > 0 || pipelineOutputs.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Workflow Pipeline</h2>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {/* Inputs */}
                  {pipelineInputs.map((item: string, i: number) => (
                    <React.Fragment key={`in-${i}`}>
                      <div className="shrink-0 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-[10px] uppercase text-blue-400 font-medium mb-0.5">Input</p>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap">
                          {item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </React.Fragment>
                  ))}
                  {/* Processors */}
                  {pipelineProcessors.map((item: string, i: number) => (
                    <React.Fragment key={`proc-${i}`}>
                      <div className="shrink-0 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <p className="text-[10px] uppercase text-purple-400 font-medium mb-0.5">Process</p>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">
                          {item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                      </div>
                      {i < pipelineProcessors.length - 1 || pipelineOutputs.length > 0 ? (
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                      ) : null}
                    </React.Fragment>
                  ))}
                  {/* Outputs */}
                  {pipelineOutputs.map((item: string, i: number) => (
                    <React.Fragment key={`out-${i}`}>
                      <div className="shrink-0 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-[10px] uppercase text-green-400 font-medium mb-0.5">Output</p>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300 whitespace-nowrap">
                          {item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                      </div>
                      {i < pipelineOutputs.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">About</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {agent.description || `This is a ${typeConfig.label.toLowerCase()} agent created with Agent Builder. It can be configured and deployed to handle various tasks.`}
              </p>
              {agent.system_prompt && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 mb-2">System Prompt</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{agent.system_prompt}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Details</h2>
              <div className="space-y-4">
                {[
                  { label: 'Category', value: typeConfig.label },
                  { label: 'Status', value: statusStyle.label },
                  { label: 'Version', value: agent.version || '1.0' },
                  { label: 'Created', value: createdAt },
                  { label: 'Last Updated', value: updatedAt },
                  { label: 'Visibility', value: agent.is_public ? 'Public' : 'Private' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Model Config */}
            {(modelConfig.provider || modelConfig.model) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Model</h2>
                <div className="space-y-3">
                  {modelConfig.provider && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Provider</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{modelConfig.provider}</span>
                    </div>
                  )}
                  {modelConfig.model && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Model</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{modelConfig.model}</span>
                    </div>
                  )}
                  {modelConfig.temperature !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Temperature</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{modelConfig.temperature}</span>
                    </div>
                  )}
                  {modelConfig.max_tokens && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Max Tokens</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{modelConfig.max_tokens.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Metadata */}
            {agent.metadata && Object.keys(agent.metadata).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
              >
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Metadata</h2>
                <div className="space-y-3">
                  {Object.entries(agent.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/agent-builder?clone=${agentId}`)}
                >
                  <Copy className="h-4 w-4" /> Duplicate Agent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/agent-builder?edit=${agentId}`)}
                >
                  <Settings className="h-4 w-4" /> Edit Configuration
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
