import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { auroraSection, glassPanel, glassTile, purpleGlass, Reveal } from './LandingSections';

const workspaceLayers = [
  {
    title: 'Productivity',
    body: 'Turn scattered notes, meetings, deadlines, and half finished tasks into a clear plan that keeps moving with you.',
    details: ['Projects', 'Tasks', 'Meetings', 'Next actions'],
  },
  {
    title: 'Documents',
    body: 'Summarize PDFs, compare clauses, extract decisions, draft reports, and keep source context visible for review.',
    details: ['PDFs', 'Contracts', 'Reports', 'Sources'],
  },
  {
    title: 'Learning',
    body: 'Move from question to source map, study plan, outline, draft, and reusable knowledge without rebuilding context every time.',
    details: ['Research', 'Study plan', 'Knowledge graph', 'Draft'],
  },
  {
    title: 'Wellbeing',
    body: 'Protect energy with focus prompts, break nudges, ergonomic patterns, mood check ins, and weekly reflections grounded in your workload.',
    details: ['Focus', 'Breaks', 'Mood', 'Digest'],
  },
];

const workflowSignals = [
  ['Open a messy brief', 'Extract decisions', 'Create next actions', 'Protect focus time'],
  ['Upload a research paper', 'Summarize sources', 'Build study plan', 'Draft response'],
  ['Finish a meeting', 'Capture owners', 'Draft follow ups', 'Check workload'],
  ['Feel overloaded', 'Surface priorities', 'Suggest a reset', 'Resume with context'],
];

const layerActiveClasses = [
  'bg-lumicoria-core text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-human/80 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10 ring-1 ring-lumicoria-gold/15',
  'bg-lumicoria-gold/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
];

const layerPanelClasses = [
  purpleGlass,
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/75 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/45 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-gold/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-gold/[0.28] text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
];

const Features = () => {
  const [activeLayer, setActiveLayer] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const mapY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [48, -48]);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-8, 8]);

  return (
    <section ref={ref} id="features" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.86fr_1.45fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.7rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-gray-950">
              Productivity, documents, learning, and wellbeing in one workspace.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Lumicoria helps individuals make sense of work, helps students organize learning, and helps teams keep momentum without burning people out.
            </p>

            <div className="mt-9 space-y-2">
              {workspaceLayers.map((layer, index) => (
                <button
                  key={layer.title}
                  type="button"
                  onMouseEnter={() => setActiveLayer(index)}
                  onFocus={() => setActiveLayer(index)}
                  onClick={() => setActiveLayer(index)}
                  className={`w-full rounded-2xl px-5 py-4 text-left transition ${
                    activeLayer === index
                      ? layerActiveClasses[index % layerActiveClasses.length]
                      : 'bg-white/60 text-gray-600 ring-1 ring-white/70 backdrop-blur-xl hover:bg-white/80 hover:text-lumicoria-obsidian'
                  }`}
                >
                  <span className="block font-hero text-xl font-semibold tracking-[-0.025em]">{layer.title}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div style={{ y: mapY }} className="space-y-6">
            <Reveal>
              <div className={`${glassPanel} p-5`}>
                <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                  <div className="min-h-[28rem] rounded-2xl border border-white/70 bg-white/50 p-5 ring-1 ring-lumicoria-core/10 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="/images/lumicoria-logo-primary.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
                        <div>
                          <p className="font-hero text-sm font-semibold text-gray-950">Daily workspace map</p>
                          <p className="text-xs text-gray-500">Hover a layer to change what Lumicoria helps with.</p>
                        </div>
                      </div>
                      <motion.div style={{ rotate: orbitRotate }} className="h-10 w-10 rounded-full bg-lumicoria-core/10" />
                    </div>

                    <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-5 ring-1 ring-lumicoria-core/10 backdrop-blur-xl">
                      <div className="absolute left-8 right-8 top-1/2 h-px bg-lumicoria-core/[0.15]" />
                      <div className="grid grid-cols-2 gap-4">
                        {workspaceLayers[activeLayer].details.map((detail, index) => (
                          <motion.div
                            key={`${workspaceLayers[activeLayer].title}-${detail}`}
                            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.06, duration: 0.35 }}
                          className={`relative p-5 ${
                              index === activeLayer % 4 ? layerPanelClasses[activeLayer % layerPanelClasses.length] : `${glassTile} text-gray-950`
                            }`}
                          >
                            <p className="font-hero text-lg font-semibold tracking-[-0.025em]">{detail}</p>
                            <div className={index === activeLayer % 4 && activeLayer === 0 ? 'mt-5 h-2 w-20 rounded-full bg-white/25' : 'mt-5 h-2 w-20 rounded-full bg-lumicoria-core/10'} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    key={workspaceLayers[activeLayer].title}
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${layerPanelClasses[activeLayer % layerPanelClasses.length]} p-7`}
                  >
                    <p className="font-hero text-4xl font-semibold leading-none tracking-[-0.04em]">{workspaceLayers[activeLayer].title}</p>
                    <p className={`mt-6 text-base leading-8 ${activeLayer === 0 ? 'text-white/80' : 'text-lumicoria-obsidian/75'}`}>{workspaceLayers[activeLayer].body}</p>
                    <div className="mt-8 space-y-3">
                      {workspaceLayers[activeLayer].details.map((detail) => (
                        <div key={detail} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${activeLayer === 0 ? 'bg-white/10 text-white/80' : 'bg-white/40 text-lumicoria-obsidian/75'}`}>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2">
              {workflowSignals.map((signal, signalIndex) => (
                <Reveal key={signal.join()} delay={signalIndex * 0.05}>
                  <motion.article
                    whileHover={reduceMotion ? undefined : { y: -10, scale: 1.015 }}
                    transition={{ duration: 0.22 }}
                    className={`${glassPanel} p-5`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-lumicoria-core" />
                      <p className="font-hero text-sm font-semibold text-lumicoria-core">What changes</p>
                    </div>
                    <div className="mt-5 space-y-2">
                      {signal.map((item, itemIndex) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className={itemIndex === signal.length - 1 ? 'h-8 w-8 rounded-full bg-lumicoria-core text-center text-xs font-semibold leading-8 text-white' : 'h-8 w-8 rounded-full bg-lumicoria-core/10 text-center text-xs font-semibold leading-8 text-lumicoria-core'}>
                            {itemIndex + 1}
                          </span>
                          <p className="text-sm font-medium text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
