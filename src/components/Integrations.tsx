import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, BarChart3, Users } from 'lucide-react';

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

const getOrbitPosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

/* ── Mini dashboard inside the laptop screen ── */
const DashboardMockup = () => (
  <div className="w-full h-full bg-[#f8f9fa] flex text-left">
    {/* Sidebar */}
    <div className="w-12 bg-white border-r border-gray-100 flex flex-col items-center py-2.5 gap-2.5 shrink-0">
      <img src="/images/lumicoria-logo-primary.png" alt="" className="w-6 h-6 rounded-md" />
      <div className="w-5 h-5 rounded bg-lumicoria-purple/10 flex items-center justify-center mt-1">
        <FileText size={10} className="text-lumicoria-purple" />
      </div>
      <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center">
        <CheckCircle size={10} className="text-gray-300" />
      </div>
      <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center">
        <BarChart3 size={10} className="text-gray-300" />
      </div>
      <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center">
        <Users size={10} className="text-gray-300" />
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
        {['12 Tasks', '3 Agents', '98%'].map((label, i) => (
          <div key={i} className="bg-white rounded-md border border-gray-100 px-2 py-1.5">
            <div className="text-[8px] text-gray-400 leading-none">{['Active', 'Running', 'Uptime'][i]}</div>
            <div className="text-[10px] font-semibold text-gray-800 mt-0.5 leading-none">{label}</div>
          </div>
        ))}
      </div>
      {/* Task list */}
      <div className="space-y-1">
        {['Sync Google Drive files...', 'Process Slack messages...', 'Update Salesforce leads...'].map((text, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-white rounded border border-gray-100 px-2 py-1">
            <div className={`w-1 h-1 rounded-full shrink-0 ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-amber-400' : 'bg-lumicoria-purple'}`} />
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
    <section id="integrations" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            Integrations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Works With Your Entire Stack
          </h2>
          <p className="text-lg text-gray-600">
            Lumicoria connects with the productivity tools, communication platforms,
            AI models, and services your team already relies on.
          </p>
        </div>

        {/* Split layout */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">

            {/* Left — MacBook Pro mockup */}
            <div className="flex-1 flex justify-center reveal">
              <div className="relative w-full max-w-[520px]">
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
            </div>

            {/* Right — Integration orbit */}
            <div className="flex-1 flex justify-center">
              <div className="relative" style={{ width: '480px', height: '480px' }}>
                {/* Glass blobs */}
                <div
                  className="absolute w-[240px] h-[140px] rounded-[50%] blur-[70px] opacity-[0.15]"
                  style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c4b5fd 100%)', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}
                />
                <div
                  className="absolute w-[120px] h-[90px] rounded-[50%] blur-[50px] opacity-[0.10]"
                  style={{ background: 'linear-gradient(220deg, #e0e7ff 0%, #c7d2fe 100%)', top: '35%', left: '35%', transform: 'translate(-50%, -50%)' }}
                />
                <div
                  className="absolute w-[80px] h-[60px] rounded-[50%] blur-[40px] opacity-[0.08]"
                  style={{ background: '#ddd6fe', top: '62%', left: '65%', transform: 'translate(-50%, -50%)' }}
                />

                {/* Orbit rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[260px] h-[260px] rounded-full border border-gray-100" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[420px] h-[420px] rounded-full border border-gray-50" />
                </div>

                {/* Center — wordmark */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-28 h-28 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center">
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
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          strokeDasharray="5 3"
                        />
                      </svg>

                      <div className={`relative w-14 h-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer
                        ${hoveredIdx === i ? 'border-gray-300 shadow-md scale-110' : 'border-gray-100'}`}
                      >
                        <img src={integration.icon} alt={integration.name} className="w-9 h-9 rounded-lg object-contain" />
                      </div>

                      {hoveredIdx === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 -bottom-9 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg z-30"
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
                      <div className={`relative w-[52px] h-[52px] rounded-2xl bg-white border shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer
                        ${hoveredIdx === globalIdx ? 'border-gray-300 shadow-md scale-110' : 'border-gray-100'}`}
                      >
                        <img src={integration.icon} alt={integration.name} className="w-8 h-8 rounded-lg object-contain" />
                      </div>

                      {hoveredIdx === globalIdx && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 -bottom-9 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg z-30"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10 reveal">
          <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="w-10 h-10 rounded-lg object-contain mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">15+ Integrations</h3>
            <p className="text-sm text-gray-500">Connect with your favorite tools and services</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <img src="/images/lumicoria-logo-gradient.png" alt="Lumicoria" className="w-10 h-10 rounded-lg object-contain mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Real-time Sync</h3>
            <p className="text-sm text-gray-500">Changes sync instantly across all connected apps</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <img src="/images/lumicoria-logo-mono.png" alt="Lumicoria" className="w-10 h-10 rounded-lg object-contain mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Secure by Default</h3>
            <p className="text-sm text-gray-500">End-to-end encryption for all integration data</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center reveal">
          <p className="text-lg text-gray-600 mb-6">
            Connect your workspace, communication, and AI tools in minutes.
            No complex setup required.
          </p>
          <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white btn-hover-effect">
            <span>View All Integrations</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
