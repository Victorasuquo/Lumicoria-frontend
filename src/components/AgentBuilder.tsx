
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, Settings, Zap } from 'lucide-react';

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
  {
    id: 'intake',
    name: 'Multi-Channel Intake',
    subtitle: 'Trigger',
    icon: '/images/lumicoria-logo-gradient.png',
    color: '#6366f1',
    x: 30, y: 155,
    children: [
      { id: 'sub-gmail', name: 'Gmail', icon: '/images/integrations/gmail.svg' },
      { id: 'sub-drive', name: 'Drive', icon: '/images/integrations/google-drive.png' },
    ],
  },
  {
    id: 'router',
    name: 'AI Router',
    subtitle: 'Intelligent Routing',
    icon: '/images/lumicoria-logo-primary.png',
    color: '#7c3aed',
    x: 240, y: 155,
    children: [
      { id: 'sub-gemini', name: 'Gemini', icon: '/images/integrations/gemini.png' },
      { id: 'sub-claude', name: 'Claude', icon: '/images/integrations/anthropic.svg' },
    ],
  },
  {
    id: 'doc-agent',
    name: 'Document Agent',
    subtitle: 'Extract & Summarize',
    icon: '/images/integrations/google-docs.png',
    color: '#2563eb',
    x: 470, y: 50,
  },
  {
    id: 'meeting-agent',
    name: 'Meeting Agent',
    subtitle: 'Schedule & Brief',
    icon: '/images/integrations/google-meet.png',
    color: '#059669',
    x: 470, y: 190,
  },
  {
    id: 'creative-agent',
    name: 'Creative Agent',
    subtitle: 'Draft & Design',
    icon: '/images/integrations/notion.png',
    color: '#d97706',
    x: 470, y: 330,
  },
  {
    id: 'out-notion',
    name: 'Notion',
    subtitle: 'Knowledge Base',
    icon: '/images/integrations/notion.png',
    color: '#374151',
    x: 700, y: 50,
  },
  {
    id: 'out-calendar',
    name: 'Google Calendar',
    subtitle: 'Auto Schedule',
    icon: '/images/integrations/google-calendar.svg',
    color: '#2563eb',
    x: 700, y: 190,
  },
  {
    id: 'out-slack',
    name: 'Slack',
    subtitle: 'Team Notify',
    icon: '/images/integrations/slack.png',
    color: '#7c3aed',
    x: 700, y: 330,
  },
];

type Wire = { from: string; to: string; label?: string };
const wires: Wire[] = [
  { from: 'intake', to: 'router' },
  { from: 'router', to: 'doc-agent', label: 'Docs' },
  { from: 'router', to: 'meeting-agent', label: 'Meetings' },
  { from: 'router', to: 'creative-agent', label: 'Creative' },
  { from: 'doc-agent', to: 'out-notion' },
  { from: 'meeting-agent', to: 'out-calendar' },
  { from: 'creative-agent', to: 'out-slack' },
];

const NODE_W = 140;
const ICON_SIZE = 52;
const PORT_R = 5;

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
        x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, 800)),
        y: Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, 420)),
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

  const dotDurations = [2.2, 2.6, 1.9, 2.4, 2.0, 2.3, 1.8];

  return (
    <section id="agent-builder" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            No-Code Agent Builder
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Build Your Custom AI Agents
          </h2>
          <p className="text-lg text-gray-600">
            Create powerful AI agents by connecting modular components—inputs, processors, and outputs—without writing a single line of code.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-200 shadow-lg mb-10 reveal overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs font-medium text-gray-400 ml-2">Lumicoria Agent Builder</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
                <span className="text-[10px] text-gray-300">Drag to rearrange</span>
              </div>
            </div>

            {/* Canvas */}
            <div
              className="agent-canvas relative select-none"
              style={{
                height: '480px',
                background: '#fafbfc',
                backgroundImage: 'radial-gradient(#e8e8ec 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px',
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
                      {/* Wire — light gray like n8n */}
                      <path d={path} fill="none" stroke="#d4d4d8" strokeWidth="1.5" />

                      {/* Source port */}
                      <circle cx={sPt.x} cy={sPt.y} r={PORT_R} fill="white" stroke="#d4d4d8" strokeWidth="1.5" />
                      <circle cx={sPt.x} cy={sPt.y} r="1.5" fill="#a1a1aa" />
                      {/* Target port */}
                      <circle cx={ePt.x} cy={ePt.y} r={PORT_R} fill="white" stroke="#d4d4d8" strokeWidth="1.5" />
                      <circle cx={ePt.x} cy={ePt.y} r="1.5" fill="#a1a1aa" />

                      {/* Animated data flow dot */}
                      <circle r="2.5" fill="#8b5cf6" filter="url(#glow)" opacity="0.7">
                        <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} />
                      </circle>
                      <circle r="1.5" fill="#c4b5fd" opacity="0.4">
                        <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} begin={`${dur * 0.5}s`} />
                      </circle>

                      {/* Branch label pill */}
                      {w.label && (() => {
                        const mx = (sPt.x + ePt.x) / 2;
                        const my = (sPt.y + ePt.y) / 2 - 13;
                        const tw = w.label.length * 6 + 16;
                        return (
                          <>
                            <rect x={mx - tw / 2} y={my - 8} width={tw} height="16" rx="8" fill="white" stroke="#e4e4e7" strokeWidth="0.8" />
                            <text x={mx} y={my + 3} textAnchor="middle" className="text-[9px] fill-gray-400 font-medium">{w.label}</text>
                          </>
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
                        <line x1={cx} y1={startY} x2={childX} y2={childY} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3 3" />
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
                        className="w-[52px] h-[52px] rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                        style={{ border: `1.5px solid ${node.color}60`, boxShadow: `0 1px 6px ${node.color}10` }}
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
                            <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
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
          </div>

          {/* Preview bar */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-10 reveal">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Zap size={20} className="mr-2 text-lumicoria-purple" />
              Production Workflow Preview
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                {[flowNodes[0], flowNodes[1]].map((node, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight size={16} className="mx-1.5 text-gray-300" />}
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center" style={{ border: `1.5px solid ${node.color}60` }}>
                      <img src={node.icon} alt={node.name} className="w-5 h-5 rounded object-contain" />
                    </div>
                  </React.Fragment>
                ))}
                <ArrowRight size={16} className="mx-1.5 text-gray-300" />
                <div className="flex gap-1">
                  {[flowNodes[2], flowNodes[3], flowNodes[4]].map((node, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center" style={{ border: `1.5px solid ${node.color}60` }}>
                      <img src={node.icon} alt={node.name} className="w-[18px] h-[18px] rounded object-contain" />
                    </div>
                  ))}
                </div>
                <ArrowRight size={16} className="mx-1.5 text-gray-300" />
                <div className="flex -space-x-1.5">
                  {flowNodes.slice(5).map((node, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center" style={{ zIndex: 5 - i }}>
                      <img src={node.icon} alt={node.name} className="w-4 h-4 rounded object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Configure
                </Button>
                <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white btn-hover-effect">
                  <span className="flex items-center">
                    <Zap size={16} className="mr-2" />
                    Deploy Agent
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center reveal">
            <p className="text-lg text-gray-600 mb-6">
              Orchestrate 21 specialized AI agents across documents, meetings, wellbeing, creative work, and more.
              Deploy production workflows in minutes.
            </p>
            <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white btn-hover-effect">
              <span>Start Building Now</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentBuilder;
