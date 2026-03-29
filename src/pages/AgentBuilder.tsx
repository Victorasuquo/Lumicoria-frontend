
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Save, Play, Upload, Trash2, Plus, Search,
  Settings, Zap, ChevronLeft, ChevronRight,
  FileText, Camera, Mic, Type, Brain, GitBranch,
  Repeat, ArrowRightLeft, Calendar, Rocket, Heart,
  Eye, GraduationCap, Sparkles, Globe, LayoutGrid,
  X, Loader2, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { agentStudioApi, type StudioComponent, type ComponentInstance, type Workflow } from '@/services/api';

// ── Icon mapping for component types ──
const typeIcons: Record<string, React.ReactNode> = {
  input: <Upload size={14} />,
  processor: <Brain size={14} />,
  output: <Zap size={14} />,
  integration: <Globe size={14} />,
  condition: <GitBranch size={14} />,
  loop: <Repeat size={14} />,
  transform: <ArrowRightLeft size={14} />,
};

const typeColors: Record<string, string> = {
  input: '#6366f1',
  processor: '#8b5cf6',
  output: '#059669',
  integration: '#0ea5e9',
  condition: '#d97706',
  loop: '#ec4899',
  transform: '#f97316',
};

// ── Fallback components (when backend is unavailable) ──
const FALLBACK_COMPONENTS: StudioComponent[] = [
  { id: 'document_upload', name: 'Document Upload', type: 'input', category: 'document', description: 'Upload & process PDFs, images, text files', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'file-up', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'text_input', name: 'Text Input', type: 'input', category: 'general', description: 'Accept text input from users', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'type', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'voice_input', name: 'Voice Input', type: 'input', category: 'general', description: 'Audio input and transcription', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'mic', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'live_camera', name: 'Live Camera', type: 'input', category: 'vision', description: 'Real-time image and video capture', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'camera', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'document_ocr', name: 'Document OCR', type: 'processor', category: 'document', description: 'Extract text from documents using OCR', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'scan', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'perplexity_research', name: 'AI Research', type: 'processor', category: 'general', description: 'LLM-powered deep research', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'search', version: '1.0.0', is_beta: false, requires_auth: true },
  { id: 'chain_of_thought', name: 'Chain of Thought', type: 'processor', category: 'general', description: 'Multi-step reasoning processor', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'brain', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'data_extraction', name: 'Data Extraction', type: 'processor', category: 'document', description: 'Extract structured data from content', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'database', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'summarization', name: 'Summarization', type: 'processor', category: 'document', description: 'Create concise summaries of content', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'align-left', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'task_generator', name: 'Task Generator', type: 'processor', category: 'general', description: 'Auto-generate tasks from content', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'list-checks', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'translator', name: 'Translator', type: 'processor', category: 'general', description: 'Translate between languages', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'languages', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'live_environment_analyzer', name: 'Environment Analyzer', type: 'processor', category: 'vision', description: 'Analyze real-time visual environments', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'eye', version: '1.0.0', is_beta: true, requires_auth: false },
  { id: 'citation_manager', name: 'Citation Manager', type: 'processor', category: 'document', description: 'Manage citations and references', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'quote', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'break_reminder', name: 'Break Reminder', type: 'processor', category: 'wellbeing', description: 'Monitor activity and suggest breaks', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'timer', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'calendar_integration', name: 'Calendar', type: 'output', category: 'meeting', description: 'Create calendar events and reminders', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'calendar', version: '1.0.0', is_beta: false, requires_auth: true },
  { id: 'agent_deployment', name: 'Deploy Agent', type: 'output', category: 'general', description: 'Deploy workflow as a standalone agent', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'rocket', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'wellbeing_coach', name: 'Wellbeing Coach', type: 'output', category: 'wellbeing', description: 'Health and wellness recommendations', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'heart', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'condition', name: 'Condition', type: 'condition', category: 'general', description: 'Branch workflow based on conditions', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'git-branch', version: '1.0.0', is_beta: false, requires_auth: false },
  { id: 'loop', name: 'Loop', type: 'loop', category: 'general', description: 'Repeat actions in a loop', config_schema: {}, input_schema: {}, output_schema: {}, icon: 'repeat', version: '1.0.0', is_beta: false, requires_auth: false },
];

// ── Canvas constants ──
const NODE_W = 140;
const ICON_SIZE = 52;
const PORT_R = 5;

// ── Types ──
type CanvasNode = ComponentInstance & {
  _def?: StudioComponent;
};

type CanvasEdge = {
  id: string;
  from: string;
  to: string;
};

let _nodeCounter = 0;
const nextNodeId = () => `node_${Date.now()}_${++_nodeCounter}`;

const AgentBuilder = () => {
  const { toast } = useToast();

  // ── Component library ──
  const [components, setComponents] = useState<StudioComponent[]>(FALLBACK_COMPONENTS);
  const [compSearch, setCompSearch] = useState('');
  const [compFilter, setCompFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Canvas state ──
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Workflow metadata ──
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<Record<string, any> | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [workflowTags, setWorkflowTags] = useState<string[]>([]);

  // ── Saved workflows ──
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const [showWorkflows, setShowWorkflows] = useState(false);

  // ── Load components from API (merge with fallbacks) ──
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const data = await agentStudioApi.getComponents();
        if (data && data.length > 0) {
          // Merge: API components override fallbacks by id, keep fallbacks that don't exist in API
          const apiIds = new Set(data.map((c: StudioComponent) => c.id));
          const merged = [
            ...data,
            ...FALLBACK_COMPONENTS.filter(fc => !apiIds.has(fc.id)),
          ];
          setComponents(merged);
        }
      } catch {
        // Use fallback components
      }
    };
    loadComponents();
  }, []);

  // ── Load saved workflows ──
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await agentStudioApi.getWorkflows();
        setSavedWorkflows(data || []);
      } catch {
        // No saved workflows
      }
    };
    loadWorkflows();
  }, []);

  // ── Filtered components ──
  const filteredComponents = components.filter(c => {
    const matchesSearch = !compSearch ||
      c.name.toLowerCase().includes(compSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(compSearch.toLowerCase());
    const matchesFilter = compFilter === 'all' || c.type === compFilter;
    return matchesSearch && matchesFilter;
  });

  // Group by type
  const grouped = filteredComponents.reduce((acc, c) => {
    (acc[c.type] = acc[c.type] || []).push(c);
    return acc;
  }, {} as Record<string, StudioComponent[]>);

  // ── Add node to canvas ──
  const addNode = useCallback((comp: StudioComponent) => {
    const id = nextNodeId();
    // Place new node near center with slight random offset
    const baseX = 300 + Math.random() * 200;
    const baseY = 100 + Math.random() * 200;
    const node: CanvasNode = {
      id,
      component_id: comp.id,
      name: comp.name,
      config: {},
      position: { x: baseX, y: baseY },
      connections: [],
      _def: comp,
    };
    setNodes(prev => [...prev, node]);
    setSelectedNode(id);
  }, []);

  // ── Delete node ──
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  }, [selectedNode]);

  // ── Drag handling ──
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging(nodeId);
    setSelectedNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y,
    });
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setNodes(prev => prev.map(n => n.id === dragging ? {
      ...n,
      position: {
        x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - NODE_W)),
        y: Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100)),
      },
    } : n));
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // ── Connection handling ──
  const startConnection = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnecting(nodeId);
  }, []);

  const completeConnection = useCallback((targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connecting && connecting !== targetId) {
      const exists = edges.some(ed => ed.from === connecting && ed.to === targetId);
      if (!exists) {
        setEdges(prev => [...prev, { id: `edge_${Date.now()}`, from: connecting, to: targetId }]);
      }
    }
    setConnecting(null);
  }, [connecting, edges]);

  // ── Wire path helpers ──
  const getCenter = (node: CanvasNode) => ({
    x: node.position.x + NODE_W / 2,
    y: node.position.y + ICON_SIZE / 2,
  });

  const getRightPort = (node: CanvasNode) => {
    const c = getCenter(node);
    return { x: c.x + ICON_SIZE / 2 + PORT_R + 2, y: c.y };
  };

  const getLeftPort = (node: CanvasNode) => {
    const c = getCenter(node);
    return { x: c.x - ICON_SIZE / 2 - PORT_R - 2, y: c.y };
  };

  const bezier = (fromNode: CanvasNode, toNode: CanvasNode) => {
    const s = getRightPort(fromNode);
    const e = getLeftPort(toNode);
    const dx = Math.abs(e.x - s.x) * 0.5;
    return `M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${e.x - dx} ${e.y}, ${e.x} ${e.y}`;
  };

  // ── Save workflow ──
  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({ title: 'Name required', description: 'Please enter a workflow name.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        description: workflowDesc || 'No description',
        components: nodes.map(n => ({
          id: n.id,
          component_id: n.component_id,
          name: n.name,
          config: n.config,
          position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
          connections: edges.filter(e => e.from === n.id).map(e => ({ target: e.to })),
        })),
        tags: [],
      };
      let saved: Workflow;
      if (workflowId) {
        saved = await agentStudioApi.updateWorkflow(workflowId, payload);
      } else {
        saved = await agentStudioApi.createWorkflow(payload);
        setWorkflowId(saved.id);
      }
      toast({ title: 'Saved', description: `Workflow "${saved.name}" saved successfully.` });
      // Refresh list
      const data = await agentStudioApi.getWorkflows();
      setSavedWorkflows(data || []);
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message || 'Could not save workflow.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deploy workflow ──
  const deployWorkflow = async () => {
    if (!workflowId) {
      toast({ title: 'Save first', description: 'Please save your workflow before deploying.', variant: 'destructive' });
      return;
    }
    setIsDeploying(true);
    try {
      const result = await agentStudioApi.deployWorkflow(workflowId);
      toast({ title: 'Deployed!', description: `Agent deployed with ID: ${result.agent_id}` });
    } catch (err: any) {
      toast({ title: 'Deploy failed', description: err?.message || 'Could not deploy workflow.', variant: 'destructive' });
    } finally {
      setIsDeploying(false);
    }
  };

  // ── Test / Execute workflow ──
  const testWorkflow = async () => {
    if (!workflowId) {
      toast({ title: 'Save first', description: 'Save your workflow before testing.', variant: 'destructive' });
      return;
    }
    if (nodes.length === 0) {
      toast({ title: 'Empty workflow', description: 'Add some components before testing.', variant: 'destructive' });
      return;
    }
    setIsTesting(true);
    setTestResults(null);
    setExecutionStatus('running');
    setShowTestPanel(true);
    try {
      const inputData = testInput.trim() ? JSON.parse(testInput) : { text: 'Test input from Agent Builder' };
      const exec = await agentStudioApi.executeWorkflow(workflowId, inputData);
      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await agentStudioApi.getExecutionStatus(exec.execution_id);
          setExecutionStatus(status.status);
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval);
            const result = await agentStudioApi.getExecution(exec.execution_id);
            setTestResults(result.results || { status: result.status });
            setIsTesting(false);
          }
        } catch {
          clearInterval(pollInterval);
          setIsTesting(false);
          setExecutionStatus('failed');
        }
      }, 1500);
      // Safety timeout
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isTesting) {
          setIsTesting(false);
          setExecutionStatus('timeout');
        }
      }, 60000);
    } catch (err: any) {
      setIsTesting(false);
      setExecutionStatus('failed');
      setTestResults({ error: err?.message || 'Execution failed' });
    }
  };

  // ── Load a saved workflow ──
  const loadWorkflow = async (wf: Workflow) => {
    setWorkflowId(wf.id);
    setWorkflowName(wf.name);
    setWorkflowDesc(wf.description);
    // Rebuild nodes with _def
    const loaded: CanvasNode[] = wf.components.map(ci => ({
      ...ci,
      _def: components.find(c => c.id === ci.component_id),
    }));
    setNodes(loaded);
    // Rebuild edges from connections
    const loadedEdges: CanvasEdge[] = [];
    wf.components.forEach(ci => {
      ci.connections.forEach(conn => {
        loadedEdges.push({ id: `edge_${Date.now()}_${Math.random()}`, from: ci.id, to: conn.target });
      });
    });
    setEdges(loadedEdges);
    setShowWorkflows(false);
    toast({ title: 'Loaded', description: `Workflow "${wf.name}" loaded.` });
  };

  // ── Resolve component icon ──
  const getNodeIcon = (node: CanvasNode) => {
    const def = node._def || components.find(c => c.id === node.component_id);
    const type = def?.type || 'processor';
    const iconMap: Record<string, React.ReactNode> = {
      'file-up': <Upload size={22} />,
      'type': <Type size={22} />,
      'mic': <Mic size={22} />,
      'camera': <Camera size={22} />,
      'scan': <FileText size={22} />,
      'search': <Search size={22} />,
      'brain': <Brain size={22} />,
      'database': <LayoutGrid size={22} />,
      'align-left': <FileText size={22} />,
      'list-checks': <Zap size={22} />,
      'languages': <Globe size={22} />,
      'eye': <Eye size={22} />,
      'quote': <FileText size={22} />,
      'timer': <Heart size={22} />,
      'calendar': <Calendar size={22} />,
      'rocket': <Rocket size={22} />,
      'heart': <Heart size={22} />,
      'git-branch': <GitBranch size={22} />,
      'repeat': <Repeat size={22} />,
      'document-scan': <FileText size={22} />,
    };
    const icon = def?.icon;
    return iconMap[icon || ''] || typeIcons[type] || <Brain size={22} />;
  };

  const getNodeColor = (node: CanvasNode) => {
    const def = node._def || components.find(c => c.id === node.component_id);
    return typeColors[def?.type || 'processor'] || '#8b5cf6';
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const selectedDef = selectedNodeData?._def || components.find(c => c.id === selectedNodeData?.component_id);

  const dotDurations = [2.2, 2.6, 1.9, 2.4, 2.0, 2.3, 1.8, 2.1, 1.7, 2.5, 2.8, 2.3, 1.6, 2.7];

  return (
    <div className="h-screen flex flex-col bg-[#fafbfc] overflow-hidden">
      {/* ── Top bar ── */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ChevronLeft size={18} />
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="border-0 font-semibold text-gray-900 text-base w-64 focus-visible:ring-0 px-2 h-9"
            placeholder="Workflow name..."
          />
          {workflowId && (
            <Badge variant="outline" className="text-[10px] text-gray-400">
              {workflowId.slice(0, 8)}...
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigOpen(true)}
            className="text-xs"
          >
            <Settings size={14} className="mr-1.5" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWorkflows(true)}
            className="text-xs"
          >
            <LayoutGrid size={14} className="mr-1.5" />
            My Workflows
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <Button
            variant="outline"
            size="sm"
            onClick={saveWorkflow}
            disabled={isSaving}
            className="text-xs"
          >
            {isSaving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />}
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestPanel(true)}
            className="text-xs border-green-200 text-green-700 hover:bg-green-50"
          >
            <Play size={14} className="mr-1.5" />
            Test
          </Button>
          <Button
            size="sm"
            onClick={deployWorkflow}
            disabled={isDeploying || !workflowId}
            className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white text-xs"
          >
            {isDeploying ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Rocket size={14} className="mr-1.5" />}
            Deploy
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Component sidebar ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    placeholder="Search components..."
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {['all', 'input', 'processor', 'output', 'condition'].map(f => (
                    <button
                      key={f}
                      onClick={() => setCompFilter(f)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        compFilter === f
                          ? 'bg-lumicoria-purple text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {Object.entries(grouped).map(([type, comps]) => (
                    <div key={type} className="mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {typeIcons[type]}
                        {type}s
                      </div>
                      {comps.map(comp => (
                        <button
                          key={comp.id}
                          onClick={() => addNode(comp)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: typeColors[comp.type] || '#8b5cf6' }}
                          >
                            {typeIcons[comp.type] || <Brain size={14} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-gray-800 truncate leading-tight flex items-center gap-1">
                              {comp.name}
                              {comp.is_beta && <span className="text-[8px] bg-amber-100 text-amber-600 px-1 rounded">Beta</span>}
                            </div>
                            <div className="text-[9px] text-gray-400 truncate">{comp.description}</div>
                          </div>
                          <Plus size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  ))}
                  {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-400">No components found</div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-5 flex items-center justify-center border-r border-gray-200 bg-white hover:bg-gray-50 transition-colors shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
        </button>

        {/* ── Canvas ── */}
        <div className="flex-1 relative overflow-hidden">
          {/* Canvas toolbar */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-500 font-medium">{nodes.length} nodes</span>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-500 font-medium">{edges.length} connections</span>
            </div>
          </div>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Start building your workflow</h3>
                <p className="text-xs text-gray-400 max-w-[240px]">
                  Click components from the sidebar to add them to the canvas, then connect them together.
                </p>
              </div>
            </div>
          )}

          <div
            ref={canvasRef}
            className="absolute inset-0"
            style={{
              background: '#fafbfc',
              backgroundImage: 'radial-gradient(#e8e8ec 0.5px, transparent 0.5px)',
              backgroundSize: '24px 24px',
              cursor: dragging ? 'grabbing' : connecting ? 'crosshair' : 'default',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={() => { handleMouseUp(); setConnecting(null); }}
            onMouseLeave={() => { handleMouseUp(); setConnecting(null); }}
            onClick={() => { if (!dragging) setSelectedNode(null); }}
          >
            {/* Wires */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <filter id="flow-glow">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {edges.map((edge, i) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const path = bezier(fromNode, toNode);
                const sPt = getRightPort(fromNode);
                const ePt = getLeftPort(toNode);
                const dur = dotDurations[i % dotDurations.length];

                return (
                  <g key={edge.id}>
                    <path d={path} fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
                    <circle cx={sPt.x} cy={sPt.y} r={PORT_R} fill="white" stroke="#d4d4d8" strokeWidth="1.5" />
                    <circle cx={sPt.x} cy={sPt.y} r="1.5" fill="#a1a1aa" />
                    <circle cx={ePt.x} cy={ePt.y} r={PORT_R} fill="white" stroke="#d4d4d8" strokeWidth="1.5" />
                    <circle cx={ePt.x} cy={ePt.y} r="1.5" fill="#a1a1aa" />
                    <circle r="2.5" fill="#8b5cf6" filter="url(#flow-glow)" opacity="0.7">
                      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} />
                    </circle>
                    <circle r="1.5" fill="#c4b5fd" opacity="0.4">
                      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} begin={`${dur * 0.5}s`} />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const color = getNodeColor(node);
              const isSelected = selectedNode === node.id;
              return (
                <motion.div
                  key={node.id}
                  className="absolute cursor-grab active:cursor-grabbing group"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: NODE_W,
                    zIndex: dragging === node.id ? 50 : isSelected ? 40 : 10,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, type: 'spring' }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                >
                  <div className="flex flex-col items-center">
                    {/* Icon circle */}
                    <div className="relative">
                      <div
                        className={`w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center transition-all duration-150 ${
                          isSelected ? 'shadow-md ring-2 ring-offset-2' : 'shadow-sm'
                        }`}
                        style={{
                          border: `1.5px solid ${color}60`,
                          boxShadow: isSelected ? undefined : `0 1px 6px ${color}10`,
                          ['--tw-ring-color' as any]: color,
                          color: color,
                        }}
                      >
                        {getNodeIcon(node)}
                      </div>
                      {/* Right port (output) */}
                      <div
                        className="absolute -right-[8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-300 cursor-pointer hover:border-lumicoria-purple hover:scale-125 transition-all z-20"
                        onMouseDown={(e) => startConnection(node.id, e)}
                      />
                      {/* Left port (input) */}
                      <div
                        className="absolute -left-[8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-300 cursor-pointer hover:border-lumicoria-purple hover:scale-125 transition-all z-20"
                        onMouseUp={(e) => completeConnection(node.id, e)}
                      />
                      {/* Delete button */}
                      {isSelected && (
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-30"
                          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                    {/* Label */}
                    <div className="mt-2 text-center max-w-[130px]">
                      <div className="text-[11px] font-semibold text-gray-800 leading-tight truncate">{node.name}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5 truncate">
                        {node._def?.category || components.find(c => c.id === node.component_id)?.category || ''}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel: Node config ── */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: getNodeColor(selectedNodeData) }}
                  >
                    {getNodeIcon(selectedNodeData)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{selectedNodeData.name}</div>
                    <div className="text-[10px] text-gray-400">{selectedDef?.type} · {selectedDef?.category}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Node name */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-1 block">Display Name</label>
                    <Input
                      value={selectedNodeData.name}
                      onChange={(e) => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, name: e.target.value } : n
                      ))}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-1 block">Description</label>
                    <p className="text-xs text-gray-500">{selectedDef?.description}</p>
                  </div>

                  {/* Version & Beta */}
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">v{selectedDef?.version || '1.0.0'}</Badge>
                    {selectedDef?.is_beta && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">Beta</Badge>}
                    {selectedDef?.requires_auth && <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">Auth Required</Badge>}
                  </div>

                  {/* Config fields based on config_schema */}
                  {selectedDef?.config_schema?.properties && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 mb-2 block">Configuration</label>
                      <div className="space-y-2">
                        {Object.entries(selectedDef.config_schema.properties as Record<string, any>).map(([key, schema]) => (
                          <div key={key}>
                            <label className="text-[10px] text-gray-400 capitalize block mb-0.5">{key.replace(/_/g, ' ')}</label>
                            {schema.type === 'string' && schema.enum ? (
                              <select
                                className="w-full h-8 text-xs border border-gray-200 rounded-md px-2"
                                value={selectedNodeData.config[key] || ''}
                                onChange={(e) => setNodes(prev => prev.map(n =>
                                  n.id === selectedNode ? { ...n, config: { ...n.config, [key]: e.target.value } } : n
                                ))}
                              >
                                <option value="">Select...</option>
                                {schema.enum.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : schema.type === 'number' || schema.type === 'integer' ? (
                              <Input
                                type="number"
                                className="h-8 text-xs"
                                min={schema.minimum}
                                max={schema.maximum}
                                value={selectedNodeData.config[key] || ''}
                                onChange={(e) => setNodes(prev => prev.map(n =>
                                  n.id === selectedNode ? { ...n, config: { ...n.config, [key]: Number(e.target.value) } } : n
                                ))}
                              />
                            ) : (
                              <Input
                                className="h-8 text-xs"
                                value={selectedNodeData.config[key] || ''}
                                onChange={(e) => setNodes(prev => prev.map(n =>
                                  n.id === selectedNode ? { ...n, config: { ...n.config, [key]: e.target.value } } : n
                                ))}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connections */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-2 block">Connections</label>
                    <div className="space-y-1">
                      {edges.filter(e => e.from === selectedNode || e.to === selectedNode).map(edge => {
                        const otherNodeId = edge.from === selectedNode ? edge.to : edge.from;
                        const otherNode = nodes.find(n => n.id === otherNodeId);
                        const direction = edge.from === selectedNode ? 'Out →' : '← In';
                        return (
                          <div key={edge.id} className="flex items-center justify-between text-[10px] bg-gray-50 rounded px-2 py-1.5">
                            <span className="text-gray-500">
                              <span className="text-gray-400">{direction}</span> {otherNode?.name || otherNodeId}
                            </span>
                            <button
                              onClick={() => setEdges(prev => prev.filter(e => e.id !== edge.id))}
                              className="text-gray-300 hover:text-red-500"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                      {edges.filter(e => e.from === selectedNode || e.to === selectedNode).length === 0 && (
                        <p className="text-[10px] text-gray-400">No connections. Drag from a port to connect.</p>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 text-xs mt-4"
                    onClick={() => deleteNode(selectedNodeData.id)}
                  >
                    <Trash2 size={12} className="mr-1.5" />
                    Remove Node
                  </Button>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Workflow settings sheet ── */}
      <Sheet open={configOpen} onOpenChange={setConfigOpen}>
        <SheetContent className="w-[400px] sm:w-[440px]">
          <SheetHeader>
            <SheetTitle>Workflow Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Agent / Workflow Name</label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g. Document Processing Pipeline"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <Textarea
                value={workflowDesc}
                onChange={(e) => setWorkflowDesc(e.target.value)}
                placeholder="Describe what this agent workflow does..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Tags</label>
              <Input
                value={workflowTags.join(', ')}
                onChange={(e) => setWorkflowTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="e.g. document, automation, production"
              />
              <p className="text-[10px] text-gray-400 mt-1">Comma-separated tags for organization</p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700 block mb-2">Workflow Summary</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{nodes.length}</div>
                  <div className="text-[10px] text-gray-400">Nodes</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{edges.length}</div>
                  <div className="text-[10px] text-gray-400">Connections</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {new Set(nodes.map(n => n._def?.type || components.find(c => c.id === n.component_id)?.type)).size}
                  </div>
                  <div className="text-[10px] text-gray-400">Types</div>
                </div>
              </div>
            </div>
            {nodes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Components Used</label>
                <div className="space-y-1.5">
                  {nodes.map(n => (
                    <div key={n.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ backgroundColor: getNodeColor(n) }}>
                        {React.cloneElement(getNodeIcon(n) as React.ReactElement, { size: 12 })}
                      </div>
                      <span className="text-gray-700 font-medium">{n.name}</span>
                      <Badge variant="outline" className="text-[8px] ml-auto">{n._def?.type || ''}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button
              className="w-full bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white"
              onClick={() => { setConfigOpen(false); saveWorkflow(); }}
            >
              <Save size={16} className="mr-2" />
              Save Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Test panel sheet ── */}
      <Sheet open={showTestPanel} onOpenChange={setShowTestPanel}>
        <SheetContent className="w-[400px] sm:w-[440px]">
          <SheetHeader>
            <SheetTitle>Test Workflow</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Test Input (JSON)</label>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder={'{\n  "text": "Your test input here..."\n}'}
                rows={5}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-gray-400 mt-1">Provide input data for the first component in your workflow</p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={testWorkflow}
              disabled={isTesting || nodes.length === 0}
            >
              {isTesting ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Running...</>
              ) : (
                <><Play size={16} className="mr-2" /> Run Test</>
              )}
            </Button>

            {/* Execution status */}
            {executionStatus && (
              <div className={`rounded-lg p-4 ${
                executionStatus === 'completed' ? 'bg-green-50 border border-green-200' :
                executionStatus === 'failed' || executionStatus === 'timeout' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {executionStatus === 'completed' && <CheckCircle size={16} className="text-green-600" />}
                  {executionStatus === 'running' && <Loader2 size={16} className="text-blue-600 animate-spin" />}
                  {(executionStatus === 'failed' || executionStatus === 'timeout') && <XCircle size={16} className="text-red-600" />}
                  <span className="text-sm font-semibold capitalize">{executionStatus}</span>
                </div>
                {executionStatus === 'running' && (
                  <p className="text-xs text-blue-600">Executing workflow components...</p>
                )}
              </div>
            )}

            {/* Results */}
            {testResults && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Results</label>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[300px]">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!workflowId && nodes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-amber-700">
                  <Clock size={14} />
                  <span>Save your workflow first to enable testing.</span>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Saved workflows sheet ── */}
      <Sheet open={showWorkflows} onOpenChange={setShowWorkflows}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>My Workflows</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {savedWorkflows.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No saved workflows yet.</p>
            )}
            {savedWorkflows.map(wf => (
              <button
                key={wf.id}
                onClick={() => loadWorkflow(wf)}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-lumicoria-purple/30 hover:bg-lumicoria-purple/5 transition-colors"
              >
                <div className="text-sm font-semibold text-gray-800">{wf.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{wf.description || 'No description'}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px]">{wf.components?.length || 0} nodes</Badge>
                  <Badge variant="outline" className="text-[9px]">v{wf.version}</Badge>
                </div>
              </button>
            ))}
            <Button
              className="w-full mt-4 bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white"
              onClick={() => {
                setWorkflowId(null);
                setWorkflowName('Untitled Workflow');
                setWorkflowDesc('');
                setNodes([]);
                setEdges([]);
                setShowWorkflows(false);
              }}
            >
              <Plus size={16} className="mr-2" />
              New Workflow
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AgentBuilder;
