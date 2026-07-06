import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, BarChart3, Users } from 'lucide-react';
import { auroraSection, glassPanel, Reveal } from './LandingSections';

const integrations = [
  { name: 'Google Docs', icon: '/images/integrations/google-docs.png' },
  { name: 'Google Sheets', icon: '/images/integrations/google-sheets.png' },
  { name: 'Google Drive', icon: '/images/integrations/google-drive.png' },
  { name: 'Google Calendar', icon: '/images/integrations/google-calendar.svg' },
  { name: 'Gmail', icon: '/images/integrations/gmail.svg' },
  { name: 'Google Meet', icon: '/images/integrations/google-meet.png' },
  { name: 'Slack', icon: '/images/integrations/slack.png' },
  { name: 'Notion', icon: '/images/integrations/notion.png' },
  { name: 'Salesforce', icon: '/images/integrations/salesforce.png' },
  { name: 'Stripe', icon: '/images/integrations/stripe.png' },
  { name: 'OpenAI', icon: '/images/integrations/openai.jpg' },
  { name: 'Gemini', icon: '/images/integrations/gemini.png' },
  { name: 'Claude', icon: '/images/integrations/anthropic.svg' },
  { name: 'Perplexity', icon: '/images/integrations/perplexity.png' },
  { name: 'Mistral', icon: '/images/integrations/mistral.png' },
];

const integrationHighlights = [
  {
    logo: '/images/lumicoria-logo-primary.png',
    title: 'Native connectors',
    body: 'Google Workspace, Slack, Notion, Salesforce, Stripe, and provider routes',
    panel: 'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/[0.78] p-6 text-center shadow-[0_18px_52px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-xl',
  },
  {
    logo: '/images/lumicoria-logo-primary.png',
    title: 'Scoped environments',
    body: 'Connectors can be scoped to orgs, teams, projects, and individual workspaces',
    panel: 'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/[0.42] p-6 text-center shadow-[0_18px_52px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-gold/15 backdrop-blur-xl',
  },
  {
    logo: '/images/lumicoria-logo-mono.png',
    title: 'Permission trails',
    body: 'Each connected tool keeps clear scopes, logs, and reviewable activity',
    panel: 'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-gold/[0.28] p-6 text-center shadow-[0_18px_52px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-xl',
  },
];

const getOrbitPosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

/* ── Mini dashboard inside the laptop screen ── */
const DashboardMockup = () => (
  <div className="w-full h-full bg-[#f7fbff] flex text-left">
    {/* Sidebar */}
    <div className="w-12 bg-white border-r border-gray-100 flex flex-col items-center py-2.5 gap-2.5 shrink-0">
      <img src="/images/lumicoria-logo-primary.png" alt="" className="w-6 h-6 rounded-md" />
      <div className="w-5 h-5 rounded bg-lumicoria-signal flex items-center justify-center mt-1">
        <FileText size={10} className="text-lumicoria-core" />
      </div>
      <div className="w-5 h-5 rounded bg-lumicoria-human/55 flex items-center justify-center">
        <CheckCircle size={10} className="text-lumicoria-core/70" />
      </div>
      <div className="w-5 h-5 rounded bg-lumicoria-gold/40 flex items-center justify-center">
        <BarChart3 size={10} className="text-lumicoria-core/70" />
      </div>
      <div className="w-5 h-5 rounded bg-lumicoria-core/10 flex items-center justify-center">
        <Users size={10} className="text-lumicoria-core/70" />
      </div>
    </div>
    {/* Main */}
    <div className="flex-1 p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <div className="h-2 w-16 bg-gray-800 rounded-sm" />
          <div className="h-1 w-24 bg-gray-200 rounded-sm mt-1" />
        </div>
        <div className="flex gap-1">
          {['/images/integrations/google-docs.png', '/images/integrations/slack.png', '/images/integrations/notion.png'].map((ic, i) => (
            <img key={i} src={ic} alt="" className="w-4 h-4 rounded object-contain" />
          ))}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
        {['Docs', 'Agents', 'Ready'].map((label, i) => (
          <div
            key={i}
            className={`rounded-md border px-2 py-1.5 ${[
              'border-lumicoria-core/10 bg-lumicoria-signal/75',
              'border-white/80 bg-lumicoria-human/45',
              'border-white/80 bg-lumicoria-gold/35',
            ][i]}`}
          >
            <div className="text-[8px] text-lumicoria-core/60 leading-none">{['Source', 'Flow', 'Status'][i]}</div>
            <div className="text-[10px] font-semibold text-lumicoria-obsidian mt-0.5 leading-none">{label}</div>
          </div>
        ))}
      </div>
      {/* Task list */}
      <div className="space-y-1">
        {['Sync Google Drive files...', 'Process Slack messages...', 'Update Salesforce leads...'].map((text, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-white rounded border border-gray-100 px-2 py-1">
            <div className={`w-1 h-1 rounded-full shrink-0 ${i === 0 ? 'bg-lumicoria-core' : i === 1 ? 'bg-lumicoria-gold' : 'bg-lumicoria-core/40'}`} />
            <span className="text-[8px] text-gray-500 truncate">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Integrations = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const innerRing = integrations.slice(0, 8);
  const outerRing = integrations.slice(8);

  return (
    <section id="integrations" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <Reveal className="mx-auto mb-16 max-w-3xl text-center">
          <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mx-auto mb-7 h-12 w-12 rounded-2xl object-contain" />
          <h2 className="mb-6 font-hero text-[clamp(2.7rem,5vw,5.7rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-lumicoria-obsidian">
            Works with the stack you already chose.
          </h2>
          <p className="text-lg leading-8 text-slate-700">
            Connect docs, calendars, messages, payments, support records, and model providers. Agents move work between tools without asking the team to migrate first.
          </p>
        </Reveal>

        {/* Split layout */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">

            {/* Left MacBook Pro mockup */}
            <Reveal className="flex flex-1 justify-center">
              <div className={`${glassPanel} relative w-full max-w-[560px] p-4`}>
                {/* SVG frame */}
                <img src="/images/macbook-frame.svg" alt="" className="w-full h-auto relative z-0" />
                {/* Dashboard content positioned inside the screen area */}
                <div
                  className="absolute overflow-hidden rounded-[5px] z-20"
                  style={{
                    top: '4.7%',
                    left: '11.1%',
                    width: '77.8%',
                    height: '77.4%',
                  }}
                >
                  <DashboardMockup />
                </div>
              </div>
            </Reveal>

            {/* Right integration orbit */}
            <div className="flex-1 flex justify-center">
              <div className="relative" style={{ width: '480px', height: '480px' }}>
                {/* Orbit rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[260px] h-[260px] rounded-full border border-lumicoria-cognitive/40" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[420px] h-[420px] rounded-full border border-lumicoria-signal/70" />
                </div>

                {/* Center wordmark */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="liquid-glass liquid-shadow flex h-28 w-28 items-center justify-center rounded-full border border-white/80 bg-white/[0.72] backdrop-blur-2xl">
                    <img
                      src="/images/Lumicoria coloured (2).png"
                      alt="Lumicoria"
                      className="w-20 h-auto object-contain"
                    />
                  </div>
                </div>

                {/* Inner ring */}
                {innerRing.map((integration, i) => {
                  const pos = getOrbitPosition(i, innerRing.length, 130);
                  return (
                    <motion.div
                      key={integration.name}
                      className="absolute z-20"
                      style={{
                        left: `calc(50% + ${pos.x}px - 28px)`,
                        top: `calc(50% + ${pos.y}px - 28px)`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.5, type: "spring" }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          left: '28px', top: '28px',
                          width: `${Math.abs(pos.x) + 1}px`,
                          height: `${Math.abs(pos.y) + 1}px`,
                          transform: `translate(${pos.x > 0 ? '-100%' : '0'}, ${pos.y > 0 ? '-100%' : '0'})`,
                          overflow: 'visible',
                        }}
                      >
                        <line
                          x1={pos.x > 0 ? '100%' : '0'}
                          y1={pos.y > 0 ? '100%' : '0'}
                          x2={pos.x > 0 ? '0' : '100%'}
                          y2={pos.y > 0 ? '0' : '100%'}
                          stroke="#BFBFFF"
                          strokeWidth="1"
                          strokeDasharray="5 3"
                        />
                      </svg>

                      <div className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border bg-white/[0.78] shadow-sm ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl transition-all duration-200
                        ${hoveredIdx === i ? 'scale-110 border-lumicoria-core !bg-lumicoria-signal/90 shadow-[0_14px_34px_rgba(33,23,69,0.14)]' : 'border-white/70'}`}
                      >
                        <img src={integration.icon} alt={integration.name} className="w-9 h-9 rounded-lg object-contain" />
                      </div>

                      {hoveredIdx === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 -bottom-9 whitespace-nowrap bg-lumicoria-obsidian text-white text-xs font-medium px-3 py-1.5 rounded-lg z-30"
                        >
                          {integration.name}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Outer ring */}
                {outerRing.map((integration, i) => {
                  const pos = getOrbitPosition(i, outerRing.length, 210);
                  const globalIdx = innerRing.length + i;
                  return (
                    <motion.div
                      key={integration.name}
                      className="absolute z-20"
                      style={{
                        left: `calc(50% + ${pos.x}px - 26px)`,
                        top: `calc(50% + ${pos.y}px - 26px)`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.5, type: "spring" }}
                      onMouseEnter={() => setHoveredIdx(globalIdx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div className={`relative flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-2xl border bg-white/[0.78] shadow-sm ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl transition-all duration-200
                        ${hoveredIdx === globalIdx ? 'scale-110 border-lumicoria-core !bg-lumicoria-human/75 shadow-[0_14px_34px_rgba(33,23,69,0.14)]' : 'border-white/70'}`}
                      >
                        <img src={integration.icon} alt={integration.name} className="w-8 h-8 rounded-lg object-contain" />
                      </div>

                      {hoveredIdx === globalIdx && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 -bottom-9 whitespace-nowrap bg-lumicoria-obsidian text-white text-xs font-medium px-3 py-1.5 rounded-lg z-30"
                        >
                          {integration.name}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats / features row */}
        <Reveal className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
          {integrationHighlights.map((item) => (
            <div key={item.title} className={item.panel}>
              <img src={item.logo} alt="Lumicoria" className="w-10 h-10 rounded-lg object-contain mx-auto mb-3" />
              <h3 className="mb-1 font-hero text-lg font-semibold text-lumicoria-obsidian">{item.title}</h3>
              <p className="text-sm leading-6 text-lumicoria-obsidian/70">{item.body}</p>
            </div>
          ))}
        </Reveal>

        {/* CTA */}
        <Reveal className="text-center">
          <p className="mb-6 text-lg leading-8 text-slate-700">
            Microsoft Teams, Outlook, HubSpot, Asana, Jira, Linear, GitHub, Figma, Trello, Monday, and Zapier are part of the wider connector roadmap.
          </p>
          <Button className="liquid-action bg-lumicoria-core text-white hover:bg-lumicoria-obsidian">
            <span>Explore integrations</span>
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export default Integrations;
