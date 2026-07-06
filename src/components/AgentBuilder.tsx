
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, Settings, Zap } from 'lucide-react';
import { auroraSection, glassPanel, glassTile, Reveal } from './LandingSections';

type SubNode = { id: string; name: string; icon: string };
type CanvasNode = {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  children?: SubNode[];
};

const flowNodes: CanvasNode[] = [
  // ── Triggers ──
  {
    id: 'intake',
    name: 'Multi-Channel Intake',
    subtitle: 'Trigger',
    icon: '/images/lumicoria-logo-primary.png',
    color: '#372673',
    x: 20, y: 155,
    children: [
      { id: 'sub-gmail', name: 'Gmail', icon: '/images/integrations/gmail.svg' },
      { id: 'sub-drive', name: 'Drive', icon: '/images/integrations/google-drive.png' },
    ],
  },
  // ── Router ──
  {
    id: 'router',
    name: 'AI Router',
    subtitle: 'Intelligent Routing',
    icon: '/images/lumicoria-logo-primary.png',
    color: '#211745',
    x: 210, y: 155,
    children: [
      { id: 'sub-gemini', name: 'Gemini', icon: '/images/integrations/gemini.png' },
      { id: 'sub-claude', name: 'Claude', icon: '/images/integrations/anthropic.svg' },
    ],
  },
  // ── Agents (middle column) ──
  {
    id: 'doc-agent',
    name: 'Document Agent',
    subtitle: 'Extract & Summarize',
    icon: '/images/integrations/google-docs.png',
    color: '#BFBFFF',
    x: 420, y: 30,
  },
  {
    id: 'meeting-agent',
    name: 'Meeting Agent',
    subtitle: 'Schedule & Brief',
    icon: '/images/integrations/google-meet.png',
    color: '#E2F0FF',
    x: 420, y: 175,
  },
  {
    id: 'creative-agent',
    name: 'Creative Agent',
    subtitle: 'Draft & Design',
    icon: '/images/integrations/notion.png',
    color: '#BFBFFF',
    x: 420, y: 330,
  },
  // ── Outputs (staggered Y positions for curved wires) ──
  {
    id: 'out-notion',
    name: 'Notion',
    subtitle: 'Knowledge Base',
    icon: '/images/integrations/notion.png',
    color: '#372673',
    x: 660, y: 25,
  },
  {
    id: 'out-sheets',
    name: 'Google Sheets',
    subtitle: 'Data Export',
    icon: '/images/integrations/google-sheets.png',
    color: '#E2F0FF',
    x: 660, y: 125,
  },
  {
    id: 'out-calendar',
    name: 'Google Calendar',
    subtitle: 'Auto Schedule',
    icon: '/images/integrations/google-calendar.svg',
    color: '#BFBFFF',
    x: 660, y: 225,
  },
  {
    id: 'out-slack',
    name: 'Slack',
    subtitle: 'Notify Team',
    icon: '/images/integrations/slack.png',
    color: '#E2F0FF',
    x: 660, y: 325,
  },
  // ── Final convergence ──
  {
    id: 'final-email',
    name: 'Email Summary',
    subtitle: 'Daily Digest',
    icon: '/images/integrations/gmail.svg',
    color: '#372673',
    x: 870, y: 170,
  },
];

type Wire = { from: string; to: string; label?: string };
const wires: Wire[] = [
  // Intake → Router
  { from: 'intake', to: 'router' },
  // Router fans out to 3 agents
  { from: 'router', to: 'doc-agent', label: 'Docs' },
  { from: 'router', to: 'meeting-agent', label: 'Meetings' },
  { from: 'router', to: 'creative-agent', label: 'Creative' },
  // Document Agent → 2 outputs
  { from: 'doc-agent', to: 'out-notion' },
  { from: 'doc-agent', to: 'out-sheets' },
  // Meeting Agent → 3 outputs (cross-connects)
  { from: 'meeting-agent', to: 'out-calendar' },
  { from: 'meeting-agent', to: 'out-slack' },
  // Creative Agent → Slack
  { from: 'creative-agent', to: 'out-slack' },
  // All outputs converge → Email Summary
  { from: 'out-notion', to: 'final-email' },
  { from: 'out-sheets', to: 'final-email' },
  { from: 'out-calendar', to: 'final-email' },
  { from: 'out-slack', to: 'final-email' },
];

const NODE_W = 140;
const ICON_SIZE = 52;
const PORT_R = 5;

const dotDurations = [2.2, 2.6, 1.9, 2.4, 2.0, 2.3, 1.8, 2.1, 1.7, 2.5, 2.8, 2.3, 1.6, 2.7, 1.9, 2.1, 2.4];

const builderFeaturePanels = [
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/[0.78] p-5 text-left shadow-[0_18px_52px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/[0.42] p-5 text-left shadow-[0_18px_52px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-gold/15 backdrop-blur-xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-gold/[0.26] p-5 text-left shadow-[0_18px_52px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-xl',
];

const AgentBuilder = () => {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(flowNodes.map(n => [n.id, { x: n.x, y: n.y }]))
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const canvas = (e.currentTarget as HTMLElement).closest('.agent-canvas') as HTMLElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setDragging(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - positions[nodeId].x,
      y: e.clientY - rect.top - positions[nodeId].y,
    });
  }, [positions]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPositions(prev => ({
      ...prev,
      [dragging]: {
        x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, 920)),
        y: Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, 460)),
      },
    }));
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const getCenter = (id: string) => {
    const pos = positions[id];
    if (!pos) return { x: 0, y: 0 };
    return { x: pos.x + NODE_W / 2, y: pos.y + ICON_SIZE / 2 };
  };

  const getRightPort = (id: string) => {
    const c = getCenter(id);
    return { x: c.x + ICON_SIZE / 2 + PORT_R + 2, y: c.y };
  };

  const getLeftPort = (id: string) => {
    const c = getCenter(id);
    return { x: c.x - ICON_SIZE / 2 - PORT_R - 2, y: c.y };
  };

  const bezier = (fromId: string, toId: string) => {
    const s = getRightPort(fromId);
    const e = getLeftPort(toId);
    const dx = Math.abs(e.x - s.x) * 0.5;
    return `M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${e.x - dx} ${e.y}, ${e.x} ${e.y}`;
  };

  return (
    <section id="agent-builder" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center">
          <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mx-auto mb-7 h-12 w-12 rounded-2xl object-contain" />
          <h2 className="mb-6 font-hero text-[clamp(2.7rem,5vw,5.7rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-lumicoria-obsidian">
            Compose agents for the work your team actually runs.
          </h2>
          <p className="text-lg leading-8 text-slate-700">
            Connect documents, meetings, support queues, knowledge bases, model routes, and approvals. Lumicoria turns the routine into an agent you can test, version, publish, and share without starting from code.
          </p>
        </Reveal>

        <div className="max-w-5xl mx-auto">
          <Reveal className={`${glassPanel} mb-10 overflow-hidden p-3`}>
            {/* Window chrome */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-lumicoria-core/10 bg-lumicoria-signal/80 px-5 py-2.5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="ml-2 font-signal text-[11px] text-slate-500">Lumicoria Agent Builder</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-lumicoria-obsidian font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-lumicoria-core animate-pulse" />
                  Live
                </span>
                <span className="font-signal text-[10px] text-lumicoria-core/70">Drag to rearrange</span>
              </div>
            </div>

            {/* Canvas */}
            <div
              className="agent-canvas relative select-none"
              style={{
                height: '480px',
                background: 'rgba(255,255,255,0.66)',
                boxShadow: 'inset 0 0 0 1px rgba(55,38,115,0.08), inset 24px 0 0 rgba(226,240,255,0.48), inset -24px 0 0 rgba(252,237,178,0.20)',
                cursor: dragging ? 'grabbing' : 'default',
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Wires */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.8" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {wires.map((w, i) => {
                  const path = bezier(w.from, w.to);
                  const sPt = getRightPort(w.from);
                  const ePt = getLeftPort(w.to);
                  const dur = dotDurations[i % dotDurations.length];

                  return (
                    <g key={`w-${i}`}>
                      {/* Wire, light gray like n8n */}
                      <path d={path} fill="none" stroke="#B6C6DE" strokeWidth="1.5" />

                      {/* Source port */}
                      <circle cx={sPt.x} cy={sPt.y} r={PORT_R} fill="white" stroke="#BFBFFF" strokeWidth="1.5" />
                      <circle cx={sPt.x} cy={sPt.y} r="1.5" fill="#372673" />
                      {/* Target port */}
                      <circle cx={ePt.x} cy={ePt.y} r={PORT_R} fill="white" stroke="#BFBFFF" strokeWidth="1.5" />
                      <circle cx={ePt.x} cy={ePt.y} r="1.5" fill="#372673" />

                      {/* Animated data flow dot */}
                      <circle r="2.5" fill="#FEE274" filter="url(#glow)" opacity="0.78">
                        <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} />
                      </circle>
                      <circle r="1.5" fill="#FEE274" opacity="0.48">
                        <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} begin={`${dur * 0.5}s`} />
                      </circle>

                      {/* Branch label pill */}
                      {w.label && (() => {
                        const mx = (sPt.x + ePt.x) / 2;
                        const my = (sPt.y + ePt.y) / 2 - 13;
                        const tw = w.label.length * 6 + 16;
                        return (
                          <g>
                            <rect x={mx - tw / 2} y={my - 8} width={tw} height="16" rx="8" fill="#E2F0FF" stroke="#BFBFFF" strokeWidth="0.8" />
                            <text x={mx} y={my + 3} textAnchor="middle" className="text-[9px] fill-lumicoria-core font-medium">{w.label}</text>
                          </g>
                        );
                      })()}
                    </g>
                  );
                })}

                {/* Sub-node connectors */}
                {flowNodes.filter(n => n.children).map(node => {
                  const pos = positions[node.id];
                  if (!pos || !node.children) return null;
                  const cx = pos.x + NODE_W / 2;
                  const startY = pos.y + ICON_SIZE + 12;
                  return node.children.map((child, ci) => {
                    const childX = cx + (ci - (node.children!.length - 1) / 2) * 66;
                    const childY = startY + 46;
                    return (
                      <g key={child.id}>
                        <line x1={cx} y1={startY} x2={childX} y2={childY} stroke="#BFBFFF" strokeWidth="1" strokeDasharray="3 3" />
                      </g>
                    );
                  });
                })}
              </svg>

              {/* Nodes */}
              {flowNodes.map((node, idx) => {
                const pos = positions[node.id];
                return (
                  <motion.div
                    key={node.id}
                    className="absolute cursor-grab active:cursor-grabbing group"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: NODE_W,
                      zIndex: dragging === node.id ? 50 : 10,
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06, duration: 0.45, type: 'spring' }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="w-[52px] h-[52px] rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-105"
                        style={{ border: `1.5px solid ${node.color}`, boxShadow: `0 8px 22px rgba(33,23,69,0.10), inset 0 1px 0 rgba(255,255,255,0.82)` }}
                      >
                        <img src={node.icon} alt={node.name} className="w-7 h-7 rounded-lg object-contain" />
                      </div>
                      <div className="mt-2 text-center max-w-[130px]">
                        <div className="text-[11px] font-semibold text-gray-800 leading-tight">{node.name}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{node.subtitle}</div>
                      </div>
                    </div>

                    {node.children && (
                      <div className="flex justify-center gap-5 mt-9">
                        {node.children.map(child => (
                          <div key={child.id} className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full bg-lumicoria-signal/80 border border-white/80 shadow-sm flex items-center justify-center">
                              <img src={child.icon} alt={child.name} className="w-[18px] h-[18px] rounded object-contain" />
                            </div>
                            <span className="text-[8px] text-gray-400 mt-1 font-medium">{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

          {/* Preview bar */}
          <Reveal className={`${glassPanel} !bg-lumicoria-signal/[0.46] mb-10 p-6`}>
            <h3 className="mb-4 flex items-center font-hero text-2xl font-semibold tracking-[-0.025em] text-lumicoria-obsidian">
              <Zap size={20} className="mr-2 text-lumicoria-core" />
              Workday flow preview
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0 flex-wrap gap-y-2">
                {[flowNodes[0], flowNodes[1]].map((node, i) => (
                  <span key={i} className="contents">
                    {i > 0 && <ArrowRight size={16} className="mx-1.5 text-gray-300" />}
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center" style={{ border: `1.5px solid ${node.color}60` }}>
                      <img src={node.icon} alt={node.name} className="w-5 h-5 rounded object-contain" />
                    </div>
                  </span>
                ))}
                <ArrowRight size={16} className="mx-1.5 text-gray-300" />
                <div className="flex gap-1">
                  {flowNodes.slice(2, 5).map((node, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center" style={{ border: `1.5px solid ${node.color}60` }}>
                      <img src={node.icon} alt={node.name} className="w-[18px] h-[18px] rounded object-contain" />
                    </div>
                  ))}
                </div>
                <ArrowRight size={16} className="mx-1.5 text-gray-300" />
                <div className="flex -space-x-1.5">
                  {flowNodes.slice(5, 9).map((node, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center" style={{ zIndex: 10 - i }}>
                      <img src={node.icon} alt={node.name} className="w-4 h-4 rounded object-contain" />
                    </div>
                  ))}
                </div>
                <ArrowRight size={16} className="mx-1.5 text-gray-300" />
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center" style={{ border: '1.5px solid #FEE274' }}>
                  <img src="/images/integrations/gmail.svg" alt="Email Summary" className="w-[18px] h-[18px] rounded object-contain" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Adjust flow
                </Button>
                <Button className="liquid-action bg-lumicoria-core text-white hover:bg-lumicoria-obsidian">
                  <span className="flex items-center">
                    <Zap size={16} className="mr-2" />
                    Publish agent
                  </span>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal className="text-center">
            <div className="mx-auto mb-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
              {[
                ['Start with a real workflow.', 'Pick the meeting, support, document, research, or data process that should stop being manual.'],
                ['Keep every change reviewable.', 'Every edit is saved as a version, so teams can compare, approve, and roll back safely.'],
                ['Publish with ownership.', 'Run the agent against examples, set who can use it, then monitor how it performs in the workspace.'],
              ].map(([title, body], index) => (
                <div key={title} className={builderFeaturePanels[index]}>
                  <p className="font-hero text-lg font-semibold tracking-[-0.02em] text-lumicoria-obsidian">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-lumicoria-obsidian/70">{body}</p>
                </div>
              ))}
            </div>
            <Button className="liquid-action bg-lumicoria-core text-white hover:bg-lumicoria-obsidian">
              <span>Open Studio free</span>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AgentBuilder;
