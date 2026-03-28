import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

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

const Integrations = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const innerRing = integrations.slice(0, 8);
  const outerRing = integrations.slice(8);

  return (
    <section id="integrations" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header — matches AgentBuilder / Personas pattern */}
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

        {/* Orbit visualization */}
        <div className="max-w-5xl mx-auto">
          <div className="relative flex items-center justify-center mb-16" style={{ height: '580px' }}>
            {/* Orbit ring lines */}
            <div className="absolute w-[340px] h-[340px] rounded-full border border-gray-100" />
            <div className="absolute w-[540px] h-[540px] rounded-full border border-gray-50" />

            {/* Center — Lumicoria wordmark */}
            <div className="absolute z-10 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center">
                <img
                  src="/images/Lumicoria coloured (2).png"
                  alt="Lumicoria"
                  className="w-28 h-auto object-contain"
                />
              </div>
            </div>

            {/* Inner ring — 8 icons */}
            {innerRing.map((integration, i) => {
              const pos = getOrbitPosition(i, innerRing.length, 170);
              return (
                <motion.div
                  key={integration.name}
                  className="absolute z-20"
                  style={{
                    left: `calc(50% + ${pos.x}px - 32px)`,
                    top: `calc(50% + ${pos.y}px - 32px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, type: "spring" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Dashed connector line to center */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      left: '32px',
                      top: '32px',
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
                      strokeDasharray="6 4"
                    />
                  </svg>

                  <div
                    className={`relative w-16 h-16 rounded-2xl bg-white border shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer
                      ${hoveredIdx === i ? 'border-gray-300 shadow-md scale-110' : 'border-gray-100'}`}
                  >
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="w-10 h-10 rounded-lg object-contain"
                    />
                  </div>

                  {/* Tooltip */}
                  {hoveredIdx === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-1/2 -translate-x-1/2 -bottom-10 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg z-30"
                    >
                      {integration.name}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {/* Outer ring — 7 icons */}
            {outerRing.map((integration, i) => {
              const pos = getOrbitPosition(i, outerRing.length, 270);
              const globalIdx = innerRing.length + i;
              return (
                <motion.div
                  key={integration.name}
                  className="absolute z-20"
                  style={{
                    left: `calc(50% + ${pos.x}px - 30px)`,
                    top: `calc(50% + ${pos.y}px - 30px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.5, type: "spring" }}
                  onMouseEnter={() => setHoveredIdx(globalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div
                    className={`relative w-[60px] h-[60px] rounded-2xl bg-white border shadow-sm flex items-center justify-center transition-all duration-200 cursor-pointer
                      ${hoveredIdx === globalIdx ? 'border-gray-300 shadow-md scale-110' : 'border-gray-100'}`}
                  >
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="w-9 h-9 rounded-lg object-contain"
                    />
                  </div>

                  {hoveredIdx === globalIdx && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-1/2 -translate-x-1/2 -bottom-10 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg z-30"
                    >
                      {integration.name}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
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

          {/* CTA — matches AgentBuilder pattern */}
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
      </div>
    </section>
  );
};

export default Integrations;
