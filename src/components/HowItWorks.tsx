import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auroraSection, glassPanel, glassTile, purpleGlass, Reveal } from './LandingSections';

const steps = [
  {
    title: 'Choose the vertical',
    body: 'Start with the work that already costs time: meeting follow ups, support triage, contract review, research packs, data analysis, or content operations.',
    output: ['Use case', 'Owner', 'Success measure'],
  },
  {
    title: 'Connect the context',
    body: 'Attach documents, apps, knowledge bases, calendars, model routes, and workspace permissions so the agent understands the environment.',
    output: ['Sources', 'Tools', 'Permissions'],
  },
  {
    title: 'Test with real examples',
    body: 'Run the agent against sample work, inspect sources, compare versions, tune the workflow, and decide where human review belongs.',
    output: ['Evaluation', 'Version', 'Approval path'],
  },
  {
    title: 'Publish to the workspace',
    body: 'Share the agent with a team, monitor runs, trace decisions, route sensitive cases, and improve the workflow as usage grows.',
    output: ['Shared agent', 'Run log', 'Improvements'],
  },
];

const deliverySignals = [
  ['Meeting starts', 'Transcript captured', 'Actions assigned', 'Workspace updated'],
  ['Ticket arrives', 'Intent classified', 'Answer drafted', 'Escalation reviewed'],
  ['Contract uploaded', 'Clause compared', 'Risk surfaced', 'Legal handoff'],
  ['Dataset added', 'Patterns found', 'Chart drafted', 'Recommendation logged'],
];

const stepActiveClasses = [
  'bg-lumicoria-core text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-white text-lumicoria-core ring-1 ring-lumicoria-cognitive/40 shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-cognitive/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
];

const stepPanelClasses = [
  purpleGlass,
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/[0.76] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-white/[0.66] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-cognitive/35 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-cognitive/[0.32] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.11)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-2xl',
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progressWidth = useTransform(scrollYProgress, [0.12, 0.82], reduceMotion ? ['100%', '100%'] : ['0%', '100%']);
  const panelY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [38, -38]);
  const step = steps[activeStep];
  const darkStep = activeStep === 0;

  return (
    <section ref={ref} id="how-it-works" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.38fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-mono.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.75rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-lumicoria-obsidian">
              From one workflow to a production agent.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Lumicoria gives teams a practical path from idea to shared agent: define the work, connect context, test safely, and publish with visibility.
            </p>
            <div className="mt-9 h-2 overflow-hidden rounded-full bg-lumicoria-cognitive/30">
              <motion.div style={{ width: progressWidth }} className="h-full rounded-full bg-lumicoria-core" />
            </div>
          </Reveal>

          <motion.div style={{ y: panelY }} className="space-y-6">
            <Reveal>
              <div className={glassPanel}>
                <div className="grid gap-px bg-lumicoria-core/10 md:grid-cols-4">
                  {steps.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      onMouseEnter={() => setActiveStep(index)}
                      onFocus={() => setActiveStep(index)}
                      onClick={() => setActiveStep(index)}
                      className={`px-5 py-6 text-left backdrop-blur-xl transition ${
                        activeStep === index ? stepActiveClasses[index] : 'bg-white/[0.58] text-slate-500 hover:bg-white/80 hover:text-lumicoria-core'
                      }`}
                    >
                      <span className={activeStep === index ? 'block h-2 w-10 rounded-full bg-current opacity-80' : 'block h-2 w-10 rounded-full bg-lumicoria-core/[0.15]'} />
                      <span className="mt-5 block font-hero text-xl font-semibold tracking-[-0.025em]">{item.title}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
                  <motion.div
                    key={step.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${stepPanelClasses[activeStep]} p-7`}
                  >
                    <p className={darkStep ? 'font-hero text-sm font-semibold text-white/70' : 'font-hero text-sm font-semibold text-lumicoria-core'}>Delivery loop</p>
                    <h3 className="mt-4 font-hero text-[clamp(2.2rem,4vw,4.7rem)] font-semibold leading-none tracking-[-0.04em]">{step.title}</h3>
                    <p className={darkStep ? 'mt-6 text-base leading-8 text-white/75' : 'mt-6 text-base leading-8 text-lumicoria-obsidian/70'}>{step.body}</p>
                  </motion.div>

                  <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-white/75 bg-white/[0.52] p-5 ring-1 ring-lumicoria-cognitive/35 backdrop-blur-xl">
                    <div className="scanline-grid absolute inset-0 opacity-[0.42]" />
                    <div className="relative grid grid-cols-1 gap-3">
                      {step.output.map((output, index) => (
                        <motion.div
                          key={output}
                          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.35 }}
                          className={`${glassTile} p-5`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-9 w-9 rounded-full bg-lumicoria-core text-center font-signal text-xs leading-9 text-white">{index + 1}</span>
                            <p className="font-hero text-xl font-semibold tracking-[-0.025em] text-lumicoria-obsidian">{output}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2">
              {deliverySignals.map((signal, signalIndex) => (
                <Reveal key={signal.join()} delay={signalIndex * 0.05}>
                  <motion.article
                    whileHover={reduceMotion ? undefined : { y: -8, scale: 1.012 }}
                    transition={{ duration: 0.22 }}
                    className={`${glassPanel} p-5`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-lumicoria-core" />
                      <p className="font-hero text-sm font-semibold text-lumicoria-core">Production path</p>
                    </div>
                    <div className="mt-5 space-y-2">
                      {signal.map((item, itemIndex) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className={itemIndex === signal.length - 1 ? 'h-8 w-8 rounded-full bg-lumicoria-core text-center text-xs font-semibold leading-8 text-white' : 'h-8 w-8 rounded-full bg-lumicoria-core/10 text-center text-xs font-semibold leading-8 text-lumicoria-core'}>
                            {itemIndex + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>

            <Reveal className={`${glassPanel} flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center`}>
              <div>
                <p className="font-hero text-2xl font-semibold tracking-[-0.03em] text-lumicoria-obsidian">No-code when you need speed. Typed components when you need control.</p>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">
                  Agent Studio gives builders a visual canvas while keeping versions, tests, components, and governance ready for teams.
                </p>
              </div>
              <Button asChild className="liquid-action bg-lumicoria-core px-6 py-6 text-white hover:bg-lumicoria-obsidian">
                <Link to="/agent-builder">Open Agent Studio</Link>
              </Button>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
