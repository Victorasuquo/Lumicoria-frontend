import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { auroraSection, glassPanel, glassTile, purpleGlass, Reveal } from './LandingSections';

const steps = [
  {
    title: 'Bring the context',
    body: 'Start with a document, meeting, task list, research topic, wellbeing check in, or messy project brief.',
    output: ['Source', 'Goal', 'Current load'],
  },
  {
    title: 'Choose the kind of help',
    body: 'Ask for a summary, plan, draft, study path, follow up, focus reset, or custom agent workflow.',
    output: ['Outcome', 'Agent', 'Workspace context'],
  },
  {
    title: 'Work with visibility',
    body: 'See sources, decisions, next steps, confidence signals, and approvals where review matters.',
    output: ['Sources', 'Decisions', 'Review'],
  },
  {
    title: 'Keep momentum',
    body: 'Turn the result into tasks, replies, reports, study sessions, calendar blocks, or a wellbeing digest.',
    output: ['Task', 'Draft', 'Digest'],
  },
];

const stepActiveClasses = [
  'text-lumicoria-core bg-white/60',
  'text-lumicoria-obsidian bg-lumicoria-signal/70',
  'text-lumicoria-obsidian bg-lumicoria-human/70',
  'text-lumicoria-obsidian bg-lumicoria-gold/55',
];

const stepPanelClasses = [
  purpleGlass,
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/75 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/45 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-gold/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-gold/[0.28] text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progressWidth = useTransform(scrollYProgress, [0.12, 0.82], reduceMotion ? ['100%', '100%'] : ['0%', '100%']);
  const videoY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, -40]);

  return (
    <section ref={ref} id="how-it-works" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.92fr_1.35fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-mono.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.7rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-gray-950">
              From overload to output, without losing yourself in the process.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              The loop is simple enough for one person and strong enough for a team: bring context, choose help, review the path, keep momentum.
            </p>
            <div className="mt-9 h-2 overflow-hidden rounded-full bg-lumicoria-core/10">
              <motion.div style={{ width: progressWidth }} className="h-full rounded-full bg-lumicoria-core" />
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <div className={glassPanel}>
                <div className="grid gap-px bg-lumicoria-core/10 md:grid-cols-4">
                  {steps.map((step, index) => (
                    <button
                      key={step.title}
                      type="button"
                      onMouseEnter={() => setActiveStep(index)}
                      onFocus={() => setActiveStep(index)}
                      onClick={() => setActiveStep(index)}
                      className={`px-5 py-6 text-left backdrop-blur-xl transition ${
                        activeStep === index ? stepActiveClasses[index % stepActiveClasses.length] : 'bg-white/60 text-gray-500 hover:text-lumicoria-obsidian'
                      }`}
                    >
                      <span className={activeStep === index ? 'block h-2 w-10 rounded-full bg-lumicoria-core' : 'block h-2 w-10 rounded-full bg-lumicoria-core/[0.15]'} />
                      <span className="mt-5 block font-hero text-xl font-semibold tracking-[-0.025em]">{step.title}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
                  <motion.div
                    key={steps[activeStep].title}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${stepPanelClasses[activeStep % stepPanelClasses.length]} p-7`}
                  >
                    <p className="font-hero text-[clamp(2rem,4vw,4.5rem)] font-semibold leading-none tracking-[-0.04em]">{steps[activeStep].title}</p>
                    <p className={`mt-6 text-base leading-8 ${activeStep === 0 ? 'text-white/80' : 'text-lumicoria-obsidian/75'}`}>{steps[activeStep].body}</p>
                  </motion.div>

                  <div className="relative min-h-[20rem] overflow-hidden rounded-2xl border border-white/70 bg-white/50 p-5 ring-1 ring-lumicoria-core/10 backdrop-blur-xl">
                    <div className="absolute inset-x-8 top-1/2 h-px bg-lumicoria-core/20" />
                    <div className="grid grid-cols-1 gap-3">
                      {steps[activeStep].output.map((output, index) => (
                        <motion.div
                          key={output}
                          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.35 }}
                          className={`${glassTile} p-5`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-full bg-lumicoria-core text-center text-xs font-semibold leading-8 text-white">{index + 1}</span>
                            <p className="font-hero text-xl font-semibold tracking-[-0.025em] text-gray-950">{output}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Dialog>
              <Reveal>
                <motion.div style={{ y: videoY }} className={`${glassPanel} grid md:grid-cols-[0.9fr_1.2fr]`}>
                  <div className="p-8 md:p-10">
                    <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
                    <h3 className="font-hero text-3xl font-semibold tracking-[-0.03em] text-gray-950 md:text-5xl">See a workday become manageable.</h3>
                    <p className="mt-5 text-lg leading-8 text-gray-600">
                      Watch how a workspace moves from documents and meetings into decisions, next actions, and protected focus time.
                    </p>
                    <DialogTrigger asChild>
                      <button className="liquid-action mt-8 inline-flex min-h-11 items-center rounded-full bg-lumicoria-core px-5 text-sm font-semibold text-white transition hover:bg-lumicoria-obsidian">
                        Watch the walkthrough
                      </button>
                    </DialogTrigger>
                  </div>
                  <DialogTrigger asChild>
                    <button className="group relative min-h-[18rem] overflow-hidden bg-lumicoria-obsidian text-left md:min-h-[24rem]">
                      <img
                        src="https://img.youtube.com/vi/zFcxA9T_BWs/maxresdefault.jpg"
                        alt="Lumicoria product walkthrough thumbnail"
                        className="h-full w-full object-cover opacity-55 grayscale transition duration-700 group-hover:scale-105 group-hover:opacity-70"
                      />
                      <div className="absolute inset-0 bg-lumicoria-obsidian/70" />
                      <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/10 p-5 text-white backdrop-blur-xl ring-1 ring-white/10">
                        <p className="font-hero text-2xl font-semibold tracking-[-0.025em]">Daily workspace loop</p>
                        <p className="mt-2 text-sm leading-6 text-white/70">Add context, choose help, review output, keep momentum.</p>
                      </div>
                    </button>
                  </DialogTrigger>
                </motion.div>
              </Reveal>
              <DialogContent className="border-none bg-black/80 p-0 shadow-2xl sm:max-w-[900px]">
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/zFcxA9T_BWs?si=Ov_7CYjzlUFjHYZ0&autoplay=1"
                    title="Lumicoria Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
