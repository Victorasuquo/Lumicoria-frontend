
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus, Loader2, CheckCircle, Sparkles, Save, Play,
  FileText, Camera, Mic, Type, Brain, Search, Eye,
  Languages, BarChart3, Scissors, ListChecks,
  Quote, Clock, Zap, Calendar, Rocket, Heart,
  ArrowRight, ChevronRight, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { agentApi } from '@/services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ── Agent Templates ──
const AGENT_TEMPLATES = [
  {
    id: 'document',
    name: 'Document Processor',
    description: 'Process and extract information from documents automatically',
    icon: <FileText className="h-5 w-5" />,
    color: '#6366f1',
    defaultCapabilities: ['document_processing', 'ocr', 'data_extraction', 'task_generation'],
    defaultComponents: {
      inputs: ['document_upload', 'text_input'],
      processors: ['document_ocr', 'data_extraction', 'summarization'],
      outputs: ['task_generator'],
    },
  },
  {
    id: 'meeting',
    name: 'Meeting Assistant',
    description: 'Capture and organize meeting information',
    icon: <Mic className="h-5 w-5" />,
    color: '#0ea5e9',
    defaultCapabilities: ['document_processing', 'summarization', 'task_generation'],
    defaultComponents: {
      inputs: ['voice_input', 'text_input'],
      processors: ['summarization', 'chain_of_thought'],
      outputs: ['task_generator', 'calendar'],
    },
  },
  {
    id: 'wellbeing',
    name: 'Well-being Coach',
    description: 'Monitor and improve work-life balance',
    icon: <Heart className="h-5 w-5" />,
    color: '#ec4899',
    defaultCapabilities: ['wellbeing_monitoring', 'text_analysis'],
    defaultComponents: {
      inputs: ['text_input'],
      processors: ['break_reminder', 'chain_of_thought'],
      outputs: ['wellbeing_coach'],
    },
  },
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Deep research with citations and source comparison',
    icon: <Search className="h-5 w-5" />,
    color: '#8b5cf6',
    defaultCapabilities: ['research', 'summarization', 'citation_management'],
    defaultComponents: {
      inputs: ['text_input'],
      processors: ['perplexity_research', 'chain_of_thought', 'summarization'],
      outputs: ['citation_manager'],
    },
  },
  {
    id: 'creative',
    name: 'Creative Writer',
    description: 'Generate marketing copy, stories, and creative content',
    icon: <Sparkles className="h-5 w-5" />,
    color: '#f59e0b',
    defaultCapabilities: ['creative_writing', 'text_analysis', 'summarization'],
    defaultComponents: {
      inputs: ['text_input'],
      processors: ['chain_of_thought'],
      outputs: ['summarization'],
    },
  },
  {
    id: 'vision',
    name: 'Vision Analyzer',
    description: 'Analyze images and real-time visual environments',
    icon: <Eye className="h-5 w-5" />,
    color: '#10b981',
    defaultCapabilities: ['vision_analysis', 'ocr', 'data_extraction'],
    defaultComponents: {
      inputs: ['live_camera', 'document_upload'],
      processors: ['environment_analyzer', 'document_ocr'],
      outputs: ['summarization'],
    },
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Start from scratch and build your own',
    icon: <Zap className="h-5 w-5" />,
    color: '#6b7280',
    defaultCapabilities: [],
    defaultComponents: {
      inputs: [],
      processors: [],
      outputs: [],
    },
  },
];

// ── Available Components ──
interface ComponentDef {
  id: string;
  name: string;
  description: string;
  lane: 'inputs' | 'processors' | 'outputs';
  icon: React.ReactNode;
  isBeta?: boolean;
}

const AVAILABLE_COMPONENTS: ComponentDef[] = [
  // Inputs
  { id: 'document_upload', name: 'Document Upload', description: 'PDFs, images, text files', lane: 'inputs', icon: <FileText size={16} /> },
  { id: 'text_input', name: 'Text Input', description: 'Typed or pasted text', lane: 'inputs', icon: <Type size={16} /> },
  { id: 'voice_input', name: 'Voice Input', description: 'Audio transcription', lane: 'inputs', icon: <Mic size={16} /> },
  { id: 'live_camera', name: 'Live Camera', description: 'Real-time capture', lane: 'inputs', icon: <Camera size={16} /> },
  // Processors
  { id: 'document_ocr', name: 'Document OCR', description: 'Extract text with OCR', lane: 'processors', icon: <FileText size={16} /> },
  { id: 'perplexity_research', name: 'AI Research', description: 'Deep LLM research', lane: 'processors', icon: <Search size={16} /> },
  { id: 'chain_of_thought', name: 'Chain of Thought', description: 'Multi-step reasoning', lane: 'processors', icon: <Brain size={16} /> },
  { id: 'data_extraction', name: 'Data Extraction', description: 'Structured data extraction', lane: 'processors', icon: <BarChart3 size={16} /> },
  { id: 'summarization', name: 'Summarization', description: 'Concise summaries', lane: 'processors', icon: <Scissors size={16} /> },
  { id: 'break_reminder', name: 'Break Reminder', description: 'Activity monitoring', lane: 'processors', icon: <Clock size={16} /> },
  { id: 'translator', name: 'Translator', description: 'Multi-language translation', lane: 'processors', icon: <Languages size={16} /> },
  { id: 'environment_analyzer', name: 'Environment Analyzer', description: 'Visual environment analysis', lane: 'processors', icon: <Eye size={16} />, isBeta: true },
  // Outputs
  { id: 'task_generator', name: 'Task Generator', description: 'Auto-generate tasks', lane: 'outputs', icon: <ListChecks size={16} /> },
  { id: 'calendar', name: 'Calendar', description: 'Events and reminders', lane: 'outputs', icon: <Calendar size={16} /> },
  { id: 'citation_manager', name: 'Citation Manager', description: 'Manage references', lane: 'outputs', icon: <Quote size={16} /> },
  { id: 'wellbeing_coach', name: 'Wellbeing Coach', description: 'Wellness recommendations', lane: 'outputs', icon: <Heart size={16} /> },
  { id: 'deploy_agent', name: 'Deploy Agent', description: 'Deploy as standalone', lane: 'outputs', icon: <Rocket size={16} /> },
];

// ── Capability definitions ──
const CAPABILITIES = [
  { id: 'document_processing', label: 'Document Processing', tab: 'features' },
  { id: 'ocr', label: 'OCR', tab: 'features' },
  { id: 'text_analysis', label: 'Text Analysis', tab: 'features' },
  { id: 'task_generation', label: 'Task Generation', tab: 'features' },
  { id: 'summarization', label: 'Summarization', tab: 'features' },
  { id: 'research', label: 'Research', tab: 'features' },
  { id: 'creative_writing', label: 'Creative Writing', tab: 'features' },
  { id: 'data_extraction', label: 'Data Extraction', tab: 'features' },
  { id: 'chain_of_thought', label: 'Chain of Thought', tab: 'advanced' },
  { id: 'translation', label: 'Translation', tab: 'features' },
  { id: 'citation_management', label: 'Citation Management', tab: 'advanced' },
  { id: 'calendar_integration', label: 'Calendar Integration', tab: 'integrations' },
  { id: 'wellbeing_monitoring', label: 'Wellbeing Monitoring', tab: 'features' },
  { id: 'vision_analysis', label: 'Vision Analysis', tab: 'features' },
  { id: 'voice_processing', label: 'Voice Processing', tab: 'integrations' },
];

const AgentBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editAgentId = searchParams.get('edit');
  const cloneAgentId = searchParams.get('clone');

  // Form state
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<any>(null);

  // Pipeline state
  const [pipelineInputs, setPipelineInputs] = useState<string[]>([]);
  const [pipelineProcessors, setPipelineProcessors] = useState<string[]>([]);
  const [pipelineOutputs, setPipelineOutputs] = useState<string[]>([]);

  // Edit/Clone mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // My agents
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showMyAgents, setShowMyAgents] = useState(false);

  // Load agent for edit/clone
  useEffect(() => {
    const agentIdToLoad = editAgentId || cloneAgentId;
    if (agentIdToLoad) {
      loadAgentForEdit(agentIdToLoad, !!editAgentId);
    }
  }, [editAgentId, cloneAgentId]);

  const loadAgentForEdit = async (agentId: string, isEdit: boolean) => {
    setLoadingEdit(true);
    try {
      const agent = await agentApi.getAgent(agentId);
      const agentType = agent.agent_type || (agent as any).type || 'custom';
      const config = (agent as any).configuration || {};
      const components = config.components || config.pipeline || {};

      setAgentName(isEdit ? agent.name : `${agent.name} (Copy)`);
      setAgentDescription((agent as any).description || '');
      setSelectedTemplate(AGENT_TEMPLATES.some(t => t.id === agentType) ? agentType : 'custom');
      setSelectedCapabilities((agent as any).capabilities || []);
      setTags(((agent as any).tags || []).filter((t: string) => !AGENT_TEMPLATES.some(tmpl => tmpl.id === t)));
      setPipelineInputs(components.inputs || []);
      setPipelineProcessors(components.processors || []);
      setPipelineOutputs(components.outputs || []);

      if (isEdit) {
        setIsEditMode(true);
        setEditingAgentId(agentId);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load agent.', variant: 'destructive' });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Load user's agents
  useEffect(() => {
    loadMyAgents();
  }, []);

  const loadMyAgents = async () => {
    setLoadingAgents(true);
    try {
      const agents = await agentApi.getAgents();
      setMyAgents(Array.isArray(agents) ? agents : []);
    } catch {
      // Silently handle - user might not have any agents
    } finally {
      setLoadingAgents(false);
    }
  };

  // Select template → auto-populate pipeline & capabilities
  const selectTemplate = (templateId: string) => {
    const tmpl = AGENT_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    setSelectedTemplate(templateId);
    setPipelineInputs(tmpl.defaultComponents.inputs);
    setPipelineProcessors(tmpl.defaultComponents.processors);
    setPipelineOutputs(tmpl.defaultComponents.outputs);
    setSelectedCapabilities(tmpl.defaultCapabilities);

    // Auto-fill name if empty
    if (!agentName && templateId !== 'custom') {
      setAgentName(`My ${tmpl.name}`);
    }
  };

  // Toggle component in pipeline
  const toggleComponent = (comp: ComponentDef) => {
    const setState =
      comp.lane === 'inputs' ? setPipelineInputs :
      comp.lane === 'processors' ? setPipelineProcessors :
      setPipelineOutputs;

    const current =
      comp.lane === 'inputs' ? pipelineInputs :
      comp.lane === 'processors' ? pipelineProcessors :
      pipelineOutputs;

    if (current.includes(comp.id)) {
      setState(current.filter(id => id !== comp.id));
    } else {
      setState([...current, comp.id]);
    }
  };

  // Toggle capability
  const toggleCapability = (capId: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(capId) ? prev.filter(c => c !== capId) : [...prev, capId]
    );
  };

  // Is component selected?
  const isComponentSelected = (compId: string) => {
    return pipelineInputs.includes(compId) || pipelineProcessors.includes(compId) || pipelineOutputs.includes(compId);
  };

  // Get selected components for a lane
  const getSelectedForLane = (lane: 'inputs' | 'processors' | 'outputs') => {
    const ids = lane === 'inputs' ? pipelineInputs : lane === 'processors' ? pipelineProcessors : pipelineOutputs;
    return ids.map(id => AVAILABLE_COMPONENTS.find(c => c.id === id)).filter(Boolean) as ComponentDef[];
  };

  // Build payload helper
  const buildPayload = (statusOverride?: string) => ({
    name: agentName.trim(),
    description: agentDescription.trim() || `${agentName} agent`,
    agent_type: selectedTemplate === 'custom' ? 'document' : selectedTemplate,
    capabilities: selectedCapabilities,
    configuration: {
      components: {
        inputs: pipelineInputs,
        processors: pipelineProcessors,
        outputs: pipelineOutputs,
      },
    },
    tags: [...tags, selectedTemplate].filter(Boolean),
    metadata: {
      created_from: 'agent_builder',
      template: selectedTemplate,
    },
    ...(statusOverride ? { status: statusOverride, state: { status: statusOverride } } : {}),
  });

  // Create agent
  const handleCreateAgent = async () => {
    if (!agentName.trim()) {
      toast({ title: "Name required", description: "Please give your agent a name.", variant: "destructive" });
      return;
    }
    if (!selectedTemplate) {
      toast({ title: "Template required", description: "Please select a template.", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const payload = buildPayload();

      let agent;
      if (isEditMode && editingAgentId) {
        agent = await agentApi.updateAgent(editingAgentId, payload);
        setCreatedAgent(agent);
        toast({ title: "Agent updated", description: `"${agentName}" has been updated.` });
      } else {
        agent = await agentApi.createAgent(payload);
        setCreatedAgent(agent);
        toast({ title: "Agent created", description: `"${agentName}" is ready to use.` });
      }
      await loadMyAgents();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create agent';
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // Save as draft
  const [savingDraft, setSavingDraft] = useState(false);
  const handleSaveDraft = async () => {
    if (!agentName.trim()) {
      toast({ title: "Name required", description: "Please give your agent a name.", variant: "destructive" });
      return;
    }

    setSavingDraft(true);
    try {
      const payload = buildPayload('draft');

      if (isEditMode && editingAgentId) {
        await agentApi.updateAgent(editingAgentId, payload);
        toast({ title: "Draft saved", description: `"${agentName}" saved as draft.` });
      } else {
        const agent = await agentApi.createAgent(payload);
        // Switch to edit mode so subsequent saves update instead of creating new
        setIsEditMode(true);
        setEditingAgentId(agent.id || (agent as any)._id);
        toast({ title: "Draft saved", description: `"${agentName}" saved as draft.` });
      }
      await loadMyAgents();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save draft';
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingDraft(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setAgentName('');
    setAgentDescription('');
    setSelectedTemplate(null);
    setSelectedCapabilities([]);
    setTags([]);
    setTagInput('');
    setPipelineInputs([]);
    setPipelineProcessors([]);
    setPipelineOutputs([]);
    setCreatedAgent(null);
    setIsEditMode(false);
    setEditingAgentId(null);
    // Clear query params
    if (editAgentId || cloneAgentId) {
      navigate('/agent-builder', { replace: true });
    }
  };

  const totalComponents = pipelineInputs.length + pipelineProcessors.length + pipelineOutputs.length;

  // ── Test panel state ──
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const handleTestAgent = async (agentId: string) => {
    if (!testInput.trim()) {
      toast({ title: 'Input required', description: 'Please enter test input.', variant: 'destructive' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await agentApi.testAgent(agentId, testInput.trim());
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, error: err?.response?.data?.detail || 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleDeploy = async (agentId: string) => {
    setDeploying(true);
    try {
      await agentApi.updateAgent(agentId, { status: 'active', state: { status: 'active' } });
      toast({ title: 'Agent deployed', description: 'Your agent is now active.' });
      navigate(`/agents/my-agents/${agentId}`);
    } catch {
      toast({ title: 'Error', description: 'Failed to deploy agent.', variant: 'destructive' });
    } finally {
      setDeploying(false);
    }
  };

  // ── Success screen ──
  if (createdAgent) {
    const createdId = createdAgent.id || createdAgent._id;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 max-w-xl w-full shadow-sm"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{isEditMode ? 'Agent Updated' : 'Agent Created'}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">{createdAgent.name || agentName}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              {selectedCapabilities.length} capabilities &middot; {totalComponents} components
            </p>
          </div>

          {/* Test Panel */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-500" /> Test Your Agent
            </h3>
            <Textarea
              placeholder="Enter test input to see your agent work live..."
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              rows={3}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 resize-none mb-3"
            />
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
              onClick={() => handleTestAgent(createdId)}
              disabled={testing || !testInput.trim()}
            >
              {testing ? (
                <>
                  <img src="/images/lumicoria-logo-gradient.png" alt="" className="h-4 w-4 rounded animate-spin mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1.5" /> Run Test
                </>
              )}
            </Button>

            {/* Test Results */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-lg p-4 ${
                  testResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {testResult.success ? 'Success' : 'Failed'}
                    {testResult.execution_time_ms && ` · ${testResult.execution_time_ms}ms`}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {testResult.success
                    ? typeof testResult.result === 'string'
                      ? testResult.result
                      : testResult.result?.text || testResult.result?.summary || testResult.result?.response || JSON.stringify(testResult.result, null, 2)
                    : testResult.error}
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Create Another
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleDeploy(createdId)}
              disabled={deploying}
            >
              {deploying ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Rocket className="h-4 w-4 mr-1.5" />}
              Deploy Agent
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/agents/my-agents')}>
              View Agents
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loadingEdit) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditMode ? `Edit: ${agentName}` : 'Agent Builder'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create your own AI agent — no code required</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMyAgents(!showMyAgents)}
            >
              My Agents {myAgents.length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs">{myAgents.length}</Badge>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={savingDraft || !agentName.trim()}
            >
              {savingDraft ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleCreateAgent}
              disabled={creating || !agentName.trim() || !selectedTemplate}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
              {isEditMode ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* My Agents Panel */}
        <AnimatePresence>
          {showMyAgents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">My Agents</h3>
                  <button onClick={() => setShowMyAgents(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                {loadingAgents ? (
                  <div className="flex items-center justify-center py-8">
                    <img src="/images/lumicoria-logo-gradient.png" alt="Loading" className="h-10 w-10 rounded-2xl animate-pulse" />
                  </div>
                ) : myAgents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No agents yet. Create your first one below.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myAgents.map((agent: any) => {
                      const aid = agent.id || agent._id;
                      const agentStatus = agent.status || agent.state?.status || 'active';
                      return (
                        <div
                          key={aid}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                          onClick={() =>
                            agentStatus === 'draft'
                              ? navigate(`/agent-builder?edit=${aid}`)
                              : navigate(`/agents/my-agents/${aid}`)
                          }
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                            <Zap className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{agent.name}</p>
                            <p className="text-xs text-gray-400 truncate">{agent.agent_type || agent.type || 'agent'}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`ml-auto text-[10px] flex-shrink-0 ${
                              agentStatus === 'active' || agentStatus === 'deployed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : agentStatus === 'draft'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {agentStatus}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Form ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Name & Description */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Configure Your Agent</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Agent Name</label>
                  <Input
                    placeholder="Enter a name for your agent"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Describe what your agent does"
                    value={agentDescription}
                    onChange={e => setAgentDescription(e.target.value)}
                    rows={3}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Template</label>
                  <Select value={selectedTemplate || ''} onValueChange={selectTemplate}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_TEMPLATES.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                      >
                        {tag}
                        <button
                          onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                          className="hover:text-indigo-800 dark:hover:text-indigo-200"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        const newTag = tagInput.trim().toLowerCase();
                        if (!tags.includes(newTag)) {
                          setTags(prev => [...prev, newTag]);
                        }
                        setTagInput('');
                      }
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Agent Capabilities</h2>
              <p className="text-xs text-gray-400 mb-4">Select the features you want. You can add or remove later.</p>
              <Tabs defaultValue="features">
                <TabsList className="w-full bg-gray-100 dark:bg-gray-800 mb-3">
                  <TabsTrigger value="features" className="flex-1 text-xs">Features</TabsTrigger>
                  <TabsTrigger value="integrations" className="flex-1 text-xs">Integrations</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1 text-xs">Advanced</TabsTrigger>
                </TabsList>
                {['features', 'integrations', 'advanced'].map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-2 mt-0">
                    {CAPABILITIES.filter(c => c.tab === tab).map(cap => (
                      <label
                        key={cap.id}
                        className="flex items-center gap-2.5 py-1.5 px-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedCapabilities.includes(cap.id)}
                          onCheckedChange={() => toggleCapability(cap.id)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{cap.label}</span>
                      </label>
                    ))}
                    {CAPABILITIES.filter(c => c.tab === tab).length === 0 && (
                      <p className="text-xs text-gray-400 py-3 text-center">No options in this category</p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          {/* ── Right Column: Templates + Pipeline ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Cards */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Agent Templates</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2 mb-4">Start with a pre-built template or create from scratch</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {AGENT_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => selectTemplate(tmpl.id)}
                    className={`relative text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      selectedTemplate === tmpl.id
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: `${tmpl.color}15`, color: tmpl.color }}
                    >
                      {tmpl.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{tmpl.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">{tmpl.description}</p>
                    {selectedTemplate === tmpl.id && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle className="h-4 w-4 text-indigo-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline Builder */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white">Pipeline</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {totalComponents > 0
                      ? `${totalComponents} component${totalComponents !== 1 ? 's' : ''} selected`
                      : 'Select a template to auto-populate, or add components manually'}
                  </p>
                </div>
                {totalComponents > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs text-gray-400" onClick={() => { setPipelineInputs([]); setPipelineProcessors([]); setPipelineOutputs([]); }}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Pipeline Lanes */}
              <div className="grid grid-cols-3 gap-4">
                {(['inputs', 'processors', 'outputs'] as const).map((lane, laneIdx) => {
                  const laneLabel = lane === 'inputs' ? 'Input' : lane === 'processors' ? 'Process' : 'Output';
                  const laneColor = lane === 'inputs' ? '#6366f1' : lane === 'processors' ? '#8b5cf6' : '#059669';
                  const laneComponents = AVAILABLE_COMPONENTS.filter(c => c.lane === lane);
                  const selected = getSelectedForLane(lane);

                  return (
                    <div key={lane} className="space-y-3">
                      {/* Lane Header */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: laneColor }} />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{laneLabel}</span>
                        {laneIdx < 2 && (
                          <ArrowRight className="h-3 w-3 text-gray-300 dark:text-gray-600 ml-auto" />
                        )}
                      </div>

                      {/* Selected Components */}
                      <div className="min-h-[80px] rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-2 space-y-2 bg-gray-50/50 dark:bg-gray-800/20">
                        <AnimatePresence>
                          {selected.map(comp => (
                            <motion.div
                              key={comp.id}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-2.5 py-2 border border-gray-100 dark:border-gray-700 group"
                            >
                              <div className="text-gray-500 dark:text-gray-400 flex-shrink-0">{comp.icon}</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{comp.name}</p>
                              </div>
                              <button
                                onClick={() => toggleComponent(comp)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {selected.length === 0 && (
                          <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center py-4">
                            Add {laneLabel.toLowerCase()} components
                          </p>
                        )}
                      </div>

                      {/* Available Components */}
                      <div className="space-y-1">
                        {laneComponents.filter(c => !isComponentSelected(c.id)).map(comp => (
                          <button
                            key={comp.id}
                            onClick={() => toggleComponent(comp)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                          >
                            <Plus size={12} className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 truncate">{comp.name}</span>
                            {comp.isBeta && <Badge variant="secondary" className="text-[9px] py-0 px-1 ml-auto">Beta</Badge>}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flow visualization */}
              {totalComponents > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 mb-3">Flow preview</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getSelectedForLane('inputs').map((comp, i) => (
                      <React.Fragment key={comp.id}>
                        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full px-3 py-1.5 text-xs font-medium">
                          {comp.icon}
                          <span>{comp.name}</span>
                        </div>
                        {(i < getSelectedForLane('inputs').length - 1) && <span className="text-gray-300 text-xs">+</span>}
                      </React.Fragment>
                    ))}
                    {pipelineInputs.length > 0 && pipelineProcessors.length > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-1" />
                    )}
                    {getSelectedForLane('processors').map((comp, i) => (
                      <React.Fragment key={comp.id}>
                        <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full px-3 py-1.5 text-xs font-medium">
                          {comp.icon}
                          <span>{comp.name}</span>
                        </div>
                        {(i < getSelectedForLane('processors').length - 1) && <span className="text-gray-300 text-xs">+</span>}
                      </React.Fragment>
                    ))}
                    {pipelineProcessors.length > 0 && pipelineOutputs.length > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-1" />
                    )}
                    {getSelectedForLane('outputs').map((comp, i) => (
                      <React.Fragment key={comp.id}>
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full px-3 py-1.5 text-xs font-medium">
                          {comp.icon}
                          <span>{comp.name}</span>
                        </div>
                        {(i < getSelectedForLane('outputs').length - 1) && <span className="text-gray-300 text-xs">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Button (mobile-friendly) */}
            <div className="lg:hidden">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-sm"
                onClick={handleCreateAgent}
                disabled={creating || !agentName.trim() || !selectedTemplate}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {isEditMode ? 'Update Agent' : 'Create Agent'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
