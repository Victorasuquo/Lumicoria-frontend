import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

const revealTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1],
};

export const Reveal = ({ children, className = '', delay = 0 }: RevealProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 34, filter: 'blur(12px)' }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ ...revealTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const auroraSection =
  'liquid-aurora relative overflow-hidden';

export const glassPanel =
  'liquid-glass liquid-interactive liquid-shadow relative overflow-hidden rounded-3xl border border-white/75 bg-white/[0.58] ring-1 ring-lumicoria-cognitive/40 backdrop-blur-2xl';

export const glassTile =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/75 bg-white/[0.56] shadow-[0_18px_52px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl';

export const purpleGlass =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-lumicoria-cognitive/30 bg-lumicoria-core text-white shadow-[0_28px_84px_rgba(33,23,69,0.24)] ring-1 ring-white/10 backdrop-blur-2xl';

const darkPanel =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-3xl border border-white/10 bg-lumicoria-obsidian/[0.88] text-white shadow-[0_32px_100px_rgba(8,7,18,0.34)] ring-1 ring-lumicoria-cognitive/[0.15] backdrop-blur-2xl';

const softPanel =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-3xl border border-white/80 bg-lumicoria-human/[0.24] text-lumicoria-obsidian shadow-[0_26px_78px_rgba(55,38,115,0.10)] ring-1 ring-lumicoria-gold/15 backdrop-blur-2xl';

const signalPanel =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-3xl border border-white/80 bg-lumicoria-signal/[0.72] text-lumicoria-obsidian shadow-[0_26px_78px_rgba(55,38,115,0.10)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-2xl';

const cognitivePanel =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-3xl border border-white/80 bg-lumicoria-cognitive/[0.24] text-lumicoria-obsidian shadow-[0_26px_78px_rgba(55,38,115,0.11)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-2xl';

const warmPanel =
  'liquid-glass liquid-interactive relative overflow-hidden rounded-3xl border border-white/80 bg-lumicoria-gold/[0.22] text-lumicoria-obsidian shadow-[0_26px_78px_rgba(55,38,115,0.10)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-2xl';

const solidTonePanels = [purpleGlass, signalPanel, softPanel, warmPanel];

const activeTabClasses = [
  'bg-lumicoria-core text-white shadow-[0_18px_48px_rgba(33,23,69,0.22)]',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-[0_18px_44px_rgba(33,23,69,0.10)]',
  'bg-lumicoria-human/80 text-lumicoria-obsidian shadow-[0_18px_44px_rgba(33,23,69,0.09)]',
  'bg-lumicoria-gold/60 text-lumicoria-obsidian shadow-[0_18px_44px_rgba(33,23,69,0.10)]',
];

const railColorClasses = [
  'border-lumicoria-core/15 bg-white/70 text-lumicoria-core',
  'border-lumicoria-signal bg-lumicoria-signal/75 text-lumicoria-obsidian',
  'border-lumicoria-human/70 bg-lumicoria-human/50 text-lumicoria-obsidian',
  'border-lumicoria-gold/60 bg-lumicoria-gold/35 text-lumicoria-obsidian',
];

const brandLogos = [
  '/images/lumicoria-logo-primary.png',
  '/images/lumicoria-logo-primary.png',
  '/images/lumicoria-logo-mono.png',
  '/images/Lumicoria coloured (2).png',
];

type KineticRailProps = {
  items: string[];
  reverse?: boolean;
  duration?: number;
  className?: string;
};

const KineticRail = ({ items, reverse = false, duration = 28, className = '' }: KineticRailProps) => {
  const reduceMotion = useReducedMotion();
  const railItems = [...items, ...items, ...items];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex w-max gap-3"
        animate={reduceMotion ? undefined : { x: reverse ? ['-33.333%', '0%'] : ['0%', '-33.333%'] }}
        transition={reduceMotion ? undefined : { duration, repeat: Infinity, ease: 'linear' }}
      >
        {railItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={`shrink-0 rounded-full border px-4 py-2 font-signal text-xs shadow-sm ring-1 ring-white/60 backdrop-blur-xl ${railColorClasses[index % railColorClasses.length]}`}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const modelProviders = ['OpenAI', 'Anthropic', 'Gemini', 'Perplexity', 'Mistral', 'Local models'];
const workSignals = ['Documents', 'Meetings', 'Research', 'Study', 'Focus', 'Well-being', 'Team decisions', 'Tasks'];
const continuum = ['Raw input', 'Reasoning', 'Action', 'Human impact'];

export const ProviderTrustBar = () => {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const markerX = useTransform(scrollYProgress, [0.1, 0.9], reduceMotion ? ['100%', '100%'] : ['0%', '100%']);

  return (
    <section ref={ref} className={`${auroraSection} border-y border-white/75 py-10`}>
      <div className="container relative mx-auto px-4">
        <Reveal className={`${glassPanel} mx-auto max-w-6xl p-5 md:p-7`}>
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.6fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="h-10 w-10 rounded-2xl object-contain" />
                <span className="font-signal text-xs text-lumicoria-core">production agents, human rhythm</span>
              </div>
              <p className="mt-4 max-w-sm font-hero text-2xl font-semibold leading-tight tracking-[-0.03em] text-lumicoria-obsidian">
                One calm operating layer for work that keeps moving.
              </p>
            </div>

            <div className="space-y-5 overflow-hidden">
              <KineticRail items={modelProviders} duration={26} />
              <KineticRail items={workSignals} reverse duration={31} />
              <div className="relative rounded-2xl border border-white/75 bg-white/[0.55] p-3 ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl">
                <div className="continuum-ribbon h-2 rounded-full opacity-90" />
                <motion.div style={{ left: markerX }} className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-lumicoria-core shadow-lg" />
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {continuum.map((item) => (
                    <p key={item} className="font-signal text-[0.68rem] text-lumicoria-core/75">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const storyMoments = [
  {
    title: 'The morning starts messy.',
    body: 'A proposal, three meetings, research notes, a due date, and low energy all arrive at once. Lumicoria gathers the context before the day scatters.',
    signal: 'input',
    tokens: ['brief', 'PDF', 'meeting', 'energy'],
  },
  {
    title: 'The workspace starts reasoning.',
    body: 'Agents read, compare, summarize, route, draft, and check sources. You see the next useful action instead of another blank chat box.',
    signal: 'reason',
    tokens: ['source map', 'risk', 'owner', 'next step'],
  },
  {
    title: 'The output becomes momentum.',
    body: 'Actions turn into tasks, calendar blocks, study sessions, summaries, replies, and a weekly digest that helps people keep their rhythm.',
    signal: 'impact',
    tokens: ['task', 'draft', 'focus', 'digest'],
  },
];

export const StorySpineSection = () => {
  const [activeMoment, setActiveMoment] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [62, -54]);
  const pathWidth = useTransform(scrollYProgress, [0.14, 0.82], reduceMotion ? ['100%', '100%'] : ['0%', '100%']);
  const active = storyMoments[activeMoment];

  return (
    <section ref={ref} className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.35fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.75rem,5vw,5.7rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-lumicoria-obsidian">
              Your day becomes a system you can trust.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Lumicoria is not another place to type prompts. It is the layer that turns the work around you into clear decisions, next actions, healthier focus, and shared memory.
            </p>
            <div className="mt-9 h-2 overflow-hidden rounded-full bg-lumicoria-cognitive/30">
              <motion.div style={{ width: pathWidth }} className="continuum-ribbon h-full rounded-full" />
            </div>
          </Reveal>

          <motion.div style={{ y: sceneY }} className="space-y-5">
            {storyMoments.map((moment, index) => (
              <Reveal key={moment.title} delay={index * 0.07}>
                <motion.button
                  type="button"
                  onMouseEnter={() => setActiveMoment(index)}
                  onFocus={() => setActiveMoment(index)}
                  onClick={() => setActiveMoment(index)}
                  whileHover={reduceMotion ? undefined : { y: -8, scale: 1.01 }}
                  className={`liquid-tilt w-full rounded-3xl p-6 text-left transition ${
                    activeMoment === index ? activeTabClasses[index % activeTabClasses.length] : `${glassPanel} text-lumicoria-obsidian`
                  }`}
                >
                  <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-center">
                    <div>
                      <p className={`font-signal text-xs ${activeMoment === index && index === 0 ? 'text-lumicoria-human' : 'text-lumicoria-core/70'}`}>{moment.signal}</p>
                      <h3 className="mt-4 font-hero text-3xl font-semibold leading-tight tracking-[-0.035em]">{moment.title}</h3>
                      <p className={`mt-4 text-base leading-8 ${activeMoment === index && index === 0 ? 'text-white/[0.78]' : activeMoment === index ? 'text-lumicoria-obsidian/[0.74]' : 'text-slate-700'}`}>{moment.body}</p>
                    </div>
                    <div className="relative min-h-[13rem] overflow-hidden rounded-2xl border border-white/[0.35] bg-white/20 p-4 backdrop-blur-xl">
                      <div className="scanline-grid absolute inset-0 opacity-50" />
                      <div className="relative grid grid-cols-2 gap-3">
                        {moment.tokens.map((item, itemIndex) => (
                          <motion.div
                            key={item}
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: itemIndex * 0.06, duration: 0.35 }}
                            className={`rounded-2xl px-4 py-4 ${activeMoment === index && index === 0 ? 'bg-white/[0.12] text-white' : activeMoment === index ? 'bg-white/[0.34] text-lumicoria-obsidian' : 'bg-white/[0.62] text-lumicoria-core'} backdrop-blur-xl`}
                          >
                            <p className="font-signal text-xs">{item}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            ))}
            <Reveal>
              <div className={softPanel}>
                <div className="grid gap-5 p-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                  <div>
                    <p className="font-signal text-xs text-lumicoria-core">current scene</p>
                    <h3 className="mt-4 font-hero text-3xl font-semibold tracking-[-0.035em]">{active.title}</h3>
                  </div>
                  <p className="text-base leading-8 text-lumicoria-obsidian/[0.76]">{active.body}</p>
                </div>
              </div>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const dailyValueCards = [
  {
    title: 'Professionals',
    promise: 'Finish the day with fewer loose ends.',
    body: 'Contracts, receipts, notes, meetings, and email become useful actions with source context preserved.',
    panel: ['scan invoice', 'draft reply', 'schedule follow up', 'protect focus'],
    color: 'core',
  },
  {
    title: 'Students',
    promise: 'Turn study material into a real plan.',
    body: 'Notes, papers, deadlines, and revision sessions become summaries, practice blocks, drafts, and reminders.',
    panel: ['summarize paper', 'build study path', 'track deadline', 'review weekly'],
    color: 'signal',
  },
  {
    title: 'Teams',
    promise: 'Share progress without chasing updates.',
    body: 'Decisions, owners, documents, and workload signals stay visible so the team can move without another status ritual.',
    panel: ['capture decision', 'assign owner', 'sync workspace', 'review load'],
    color: 'human',
  },
  {
    title: 'Well-being',
    promise: 'Treat energy like part of the work.',
    body: 'Focus prompts, break nudges, posture cues, and weekly reflections sit beside the work creating the pressure.',
    panel: ['start focus', 'pause before fatigue', 'reset posture', 'digest rhythm'],
    color: 'gold',
  },
];

export const DailyValueSection = () => {
  const [activeValue, setActiveValue] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const floatY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [42, -48]);
  const active = dailyValueCards[activeValue];

  return (
    <section ref={ref} className="liquid-aurora-human relative overflow-hidden py-28 md:py-40">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.48fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/Lumicoria coloured (2).png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.75rem,5vw,5.7rem)] font-semibold leading-[1.01] tracking-[-0.04em] text-lumicoria-obsidian">
              It has to make sense before it feels powerful.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Lumicoria turns scattered work into visible progress: fewer loose ends, clearer next steps, calmer study sessions, and healthier team rhythm.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-3">
              {dailyValueCards.map((card, index) => (
                <button
                  key={card.title}
                  type="button"
                  onMouseEnter={() => setActiveValue(index)}
                  onFocus={() => setActiveValue(index)}
                  onClick={() => setActiveValue(index)}
                  className={`rounded-2xl px-4 py-4 text-left transition ${
                    activeValue === index
                      ? activeTabClasses[index % activeTabClasses.length]
                      : 'border border-white/75 bg-white/[0.62] text-lumicoria-core ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl hover:bg-white/90'
                  }`}
                >
                  <span className="block font-hero text-lg font-semibold tracking-[-0.025em]">{card.title}</span>
                  <span className={activeValue === index && index === 0 ? 'mt-2 block text-xs leading-5 text-white/[0.72]' : activeValue === index ? 'mt-2 block text-xs leading-5 text-lumicoria-obsidian/[0.68]' : 'mt-2 block text-xs leading-5 text-slate-600'}>{card.promise}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div style={{ y: floatY }}>
            <Reveal>
              <motion.article
                key={active.title}
                initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`${glassPanel} p-5 md:p-7`}
              >
                <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr] md:items-stretch">
                  <div className={`${solidTonePanels[activeValue % solidTonePanels.length]} p-7`}>
                    <p className="font-signal text-xs opacity-70">{active.title}</p>
                    <h3 className="mt-5 font-hero text-[clamp(2.35rem,5vw,5.1rem)] font-semibold leading-[1] tracking-[-0.04em]">
                      {active.promise}
                    </h3>
                    <p className="mt-6 text-base leading-8 opacity-[0.78]">{active.body}</p>
                    <Button asChild className={`liquid-action mt-8 px-6 py-6 ${activeValue === 0 ? 'bg-white text-lumicoria-core hover:bg-white/90' : 'bg-lumicoria-obsidian text-white hover:bg-lumicoria-core'}`}>
                      <Link to="/signup">Start with your own work</Link>
                    </Button>
                  </div>

                  <div className="relative min-h-[28rem] overflow-hidden rounded-3xl border border-white/75 bg-white/[0.38] p-5 ring-1 ring-lumicoria-cognitive/40 backdrop-blur-2xl">
                    <div className="scanline-grid absolute inset-0 opacity-[0.55]" />
                    <div className="relative space-y-4">
                      {active.panel.map((item, index) => (
                        <motion.div
                          key={item}
                          initial={reduceMotion ? false : { opacity: 0, x: 26, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
                          animate={{ opacity: 1, x: 0, rotate: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.42 }}
                          className={`${index === 0 ? signalPanel : index === 1 ? glassTile : index === 2 ? purpleGlass : warmPanel} p-5`}
                        >
                          <div className="flex items-center justify-between gap-5">
                            <p className="font-hero text-xl font-semibold tracking-[-0.025em]">{item}</p>
                            <span className="h-9 w-9 rounded-full bg-white/20 text-center font-signal text-xs leading-9">{String(index + 1).padStart(2, '0')}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const wellbeingMoments = [
  {
    title: 'Focus',
    body: 'Shows the next useful step so people stop deciding what to do every ten minutes.',
    cue: 'one clear task',
  },
  {
    title: 'Breaks',
    body: 'Suggests gentle pauses when the work pattern says someone is pushing past useful concentration.',
    cue: 'pause before fatigue',
  },
  {
    title: 'Posture',
    body: 'Uses work rhythm and optional camera moments to encourage healthier desk habits without nagging.',
    cue: 'reset the body',
  },
  {
    title: 'Reflection',
    body: 'Turns the week into a readable digest: wins, pressure points, unfinished work, and a better next rhythm.',
    cue: 'plan the next week',
  },
];

export const WellbeingRhythmSection = () => {
  const [activeMoment, setActiveMoment] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const ringRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-16, 24]);
  const active = wellbeingMoments[activeMoment];

  return (
    <section ref={ref} className="liquid-aurora-human relative overflow-hidden py-28 md:py-40">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <div className={`${softPanel} p-6 md:p-8`}>
              <div className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-white/70 bg-white/[0.34] p-6 ring-1 ring-lumicoria-gold/20 backdrop-blur-2xl">
                <motion.div style={{ rotate: ringRotate }} className="breathing-halo absolute inset-8 rounded-full border border-lumicoria-gold/30" />
                <motion.div style={{ rotate: ringRotate }} className="absolute inset-20 rounded-full border border-lumicoria-core/[0.15]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    key={active.title}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.42 }}
                    className={`${solidTonePanels[activeMoment % solidTonePanels.length]} flex h-48 w-48 flex-col items-center justify-center rounded-full p-6 text-center`}
                  >
                    <p className="font-hero text-3xl font-semibold tracking-[-0.035em]">{active.title}</p>
                    <p className={`mt-3 font-signal text-xs ${activeMoment === 0 ? 'text-white/[0.72]' : 'text-lumicoria-obsidian/[0.68]'}`}>{active.cue}</p>
                  </motion.div>
                </div>
                {wellbeingMoments.map((moment, index) => {
                  const angle = (index / wellbeingMoments.length) * Math.PI * 2 - Math.PI / 2;
                  const x = Math.cos(angle) * 180;
                  const y = Math.sin(angle) * 150;
                  return (
                    <motion.button
                      key={moment.title}
                      type="button"
                      onMouseEnter={() => setActiveMoment(index)}
                      onFocus={() => setActiveMoment(index)}
                      onClick={() => setActiveMoment(index)}
                      style={{ marginLeft: -72, marginTop: -40 }}
                      animate={{ x, y, scale: activeMoment === index ? 1.08 : 1 }}
                      whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                      className={`absolute left-1/2 top-1/2 z-10 h-20 w-36 rounded-2xl px-4 py-4 text-left text-sm font-semibold ${
                        activeMoment === index ? activeTabClasses[index % activeTabClasses.length] : 'border border-white/70 bg-white/70 text-lumicoria-core ring-1 ring-lumicoria-cognitive/25 backdrop-blur-xl'
                      }`}
                    >
                      {moment.title}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.75rem,5vw,5.75rem)] font-semibold leading-[1.01] tracking-[-0.04em] text-lumicoria-obsidian">
              Well-being belongs inside the workday.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Lumicoria connects productivity and care, so people can move faster without pretending energy, focus, and recovery are separate from the work.
            </p>
            <motion.div
              key={active.title}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42 }}
              className={`${glassPanel} mt-9 p-6`}
            >
              <p className="font-hero text-3xl font-semibold tracking-[-0.03em] text-lumicoria-obsidian">{active.title}</p>
              <p className="mt-4 text-base leading-8 text-slate-700">{active.body}</p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const trustedGroups = [
  'Solo professionals',
  'Student researchers',
  'Operations teams',
  'Customer support',
  'Agency teams',
  'People teams',
  'Founders',
  'Product teams',
  'Research teams',
  'Learning teams',
];

export const TrustedBySection = () => (
  <section id="trusted-by" className={`${auroraSection} py-24`}>
    <div className="container mx-auto px-4">
      <Reveal className={`${glassPanel} mx-auto max-w-6xl p-6 md:p-10`}>
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.5fr] lg:items-center">
          <div>
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-6 h-11 w-11 rounded-2xl object-contain" />
            <h2 className="font-hero text-3xl font-semibold tracking-[-0.03em] text-lumicoria-obsidian md:text-5xl">
              Built for people doing real work, not just procurement decks.
            </h2>
          </div>
          <div className="space-y-4 overflow-hidden">
            <KineticRail items={trustedGroups.slice(0, 5)} duration={24} />
            <KineticRail items={trustedGroups.slice(5)} reverse duration={28} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {['21 agents', '6 model providers', 'Documents', 'Well-being'].map((item, index) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.24 }}
                  className={`${solidTonePanels[index % solidTonePanels.length]} px-4 py-5 text-center font-signal text-xs`}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const reviews = [
  {
    quote: 'I stopped losing half a day turning notes, sources, and scattered tasks into one plan I could actually follow.',
    role: 'Independent consultant',
    context: 'Personal productivity workspace',
  },
  {
    quote: 'The learning coach and document agent helped me turn research papers into study sessions, drafts, and next steps.',
    role: 'Graduate student',
    context: 'Research and learning workflow',
  },
  {
    quote: 'The wellbeing layer is subtle. It notices the pattern, suggests a reset, and keeps the work moving without guilt.',
    role: 'Team lead',
    context: 'Healthy team operations',
  },
];

export const ReviewsSection = () => {
  const [activeReview, setActiveReview] = useState(0);

  return (
    <section id="reviews" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.45fr] lg:items-center">
          <Reveal>
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-8 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.6rem,5vw,5.75rem)] font-semibold leading-[1] tracking-[-0.04em] text-lumicoria-obsidian">
              The first feeling should be relief.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-700">
              The platform has technical depth, but the lived result is simpler: a clearer day, a calmer study plan, and a team that remembers what happened.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {reviews.map((item, index) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setActiveReview(index)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeReview === index
                      ? activeTabClasses[index % activeTabClasses.length]
                      : 'bg-white/70 text-lumicoria-core ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl hover:bg-white'
                  }`}
                >
                  {item.role}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="relative min-h-[34rem]">
              {reviews.map((item, index) => (
                <motion.article
                  key={item.role}
                  animate={{
                    opacity: activeReview === index ? 1 : 0.36,
                    scale: activeReview === index ? 1 : 0.94,
                    y: activeReview === index ? 0 : 28 + index * 18,
                    rotate: activeReview === index ? 0 : index === 0 ? -4 : 4,
                    zIndex: activeReview === index ? 10 : 2,
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`${glassPanel} absolute inset-x-0 top-0 p-8 md:p-10`}
                >
                  <div className="mb-8 flex gap-2">
                    {brandLogos.slice(0, index + 2).map((logo) => (
                      <img key={`${item.role}-${logo}`} src={logo} alt="" className="-ml-2 h-10 w-10 rounded-full border border-white bg-white object-contain shadow-sm first:ml-0" />
                    ))}
                  </div>
                  <p className="max-w-3xl text-[clamp(1.8rem,4vw,4rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-lumicoria-obsidian">“{item.quote}”</p>
                  <div className="mt-10 border-t border-lumicoria-cognitive/30 pt-6">
                    <p className="font-semibold text-lumicoria-obsidian">{item.role}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.context}</p>
                  </div>
                </motion.article>
              ))}
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-3">
                {['Focused', 'Supported', 'Traceable'].map((word, index) => (
                  <div key={word} className={`${solidTonePanels[(index + 1) % solidTonePanels.length]} px-4 py-5 text-center`}>
                    <p className="font-signal text-xs text-lumicoria-obsidian/75">{word}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const advantages = [
  {
    old: 'Chat that forgets the work',
    lumicoria: 'Lumicoria keeps documents, meetings, tasks, goals, wellbeing signals, and agent output inside one workspace, so context survives beyond a single conversation.',
  },
  {
    old: 'Productivity apps without help',
    lumicoria: 'Plans, notes, projects, and next actions become active surfaces where agents can summarize, schedule, draft, and follow through.',
  },
  {
    old: 'Wellness outside the workflow',
    lumicoria: 'Focus prompts, break nudges, mood check ins, ergonomics, and weekly digests live next to the work creating the pressure.',
  },
  {
    old: 'Platforms built only for enterprise',
    lumicoria: 'Start free as an individual, invite a team when the work becomes shared, then add governance only when your workspace needs it.',
  },
];

export const CompetitionAdvantageSection = () => {
  const [activeAdvantage, setActiveAdvantage] = useState(0);

  return (
    <section id="advantage" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.45fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-mono.png" alt="Lumicoria" className="mb-7 h-11 w-11 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.5rem,4vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-lumicoria-obsidian">
              The advantage is continuity.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              Most products solve one slice: chat, tasks, documents, wellness, or governance. Lumicoria connects the parts people actually live inside.
            </p>
          </Reveal>

          <div className={`${glassPanel} p-3`}>
            <div className="grid gap-3 md:grid-cols-[0.75fr_1.35fr]">
              <div className="space-y-2">
                {advantages.map((advantage, index) => (
                  <button
                    key={advantage.old}
                    type="button"
                    onClick={() => setActiveAdvantage(index)}
                    className={`w-full rounded-2xl px-5 py-4 text-left transition ${
                      activeAdvantage === index
                        ? activeTabClasses[index % activeTabClasses.length]
                        : 'bg-white/[0.55] text-slate-700 ring-1 ring-white/70 backdrop-blur-xl hover:bg-white/80 hover:text-lumicoria-core'
                    }`}
                  >
                    <span className="block font-hero text-xl font-semibold tracking-[-0.025em]">{advantage.old}</span>
                  </button>
                ))}
              </div>
              <motion.div
                key={advantages[activeAdvantage].lumicoria}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative overflow-hidden rounded-2xl border border-white/70 p-8 ring-1 ring-lumicoria-cognitive/30 backdrop-blur-xl ${activeAdvantage === 0 ? 'bg-white/60' : activeAdvantage === 1 ? 'bg-lumicoria-signal/70' : activeAdvantage === 2 ? 'bg-lumicoria-human/45' : 'bg-lumicoria-gold/[0.28]'}`}
              >
                <div className="scanline-grid pointer-events-none absolute inset-0 opacity-[0.45]" />
                <div className="relative">
                  <p className="font-signal text-xs text-lumicoria-core">Lumicoria advantage</p>
                  <h3 className="mt-5 font-hero text-[clamp(2.2rem,4vw,4.7rem)] font-semibold leading-[1] tracking-[-0.04em] text-lumicoria-obsidian">
                    One workspace for output, focus, and care.
                  </h3>
                  <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700">{advantages[activeAdvantage].lumicoria}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const enterpriseCapabilities = [
  {
    title: 'Identity and roles',
    body: 'Company sign in, user provisioning, workspaces, approval paths, and role boundaries for shared agents.',
  },
  {
    title: 'Traceable output',
    body: 'Summaries, drafts, recommendations, and agent actions keep source context visible for review.',
  },
  {
    title: 'Model control',
    body: 'OpenAI, Anthropic, Gemini, Perplexity, Mistral, and local routes can be governed by workspace policy.',
  },
  {
    title: 'Regional options',
    body: 'US and EU today, UK in preparation, with Singapore and African region planning on the roadmap.',
  },
  {
    title: 'Well-being boundaries',
    body: 'Focus prompts and weekly reflections support people without turning personal care into surveillance.',
  },
  {
    title: 'Compliance path',
    body: 'SOC 2 Type II observation is underway, with responsible data handling built into the platform surface.',
  },
];

export const EnterpriseSection = () => {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const dialRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-10, 10]);

  return (
    <section ref={ref} id="enterprise-trust" className="liquid-aurora-dark relative overflow-hidden py-28 md:py-40">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.35fr] lg:items-center">
          <Reveal>
            <img src="/images/lumicoria-logo-mono.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.5rem,5vw,5.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white">
              Starts personal. Survives procurement.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/[0.72]">
              Lumicoria can start with one person getting through documents and focus work, then grow into a governed workspace without changing tools.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {['SOC 2 path', 'Regional storage', 'Managed keys'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 font-signal text-xs text-lumicoria-signal backdrop-blur-xl">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="relative">
            <motion.div style={{ rotate: dialRotate }} className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-full bg-lumicoria-human/[0.12] md:block" />
            <div className={`${darkPanel} grid grid-cols-1 gap-px sm:grid-cols-2`}>
              {enterpriseCapabilities.map((capability, index) => (
                <motion.article
                  key={capability.title}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.24 }}
                  className="bg-white/[0.045] p-7 backdrop-blur-xl"
                >
                  <p className="font-hero text-xl font-semibold tracking-[-0.02em] text-white">{capability.title}</p>
                  <p className="mt-4 text-sm leading-7 text-white/[0.64]">{capability.body}</p>
                  <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={reduceMotion ? false : { width: '20%' }}
                      whileInView={reduceMotion ? undefined : { width: `${58 + index * 6}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.06 }}
                      className="h-full rounded-full bg-lumicoria-gold"
                    />
                  </div>
                </motion.article>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="liquid-action bg-lumicoria-gold/90 px-6 py-6 text-lumicoria-obsidian hover:bg-lumicoria-human">
            <Link to="/enterprise">Talk to Enterprise</Link>
          </Button>
          <Button asChild variant="outline" className="liquid-action border-white/20 bg-white/10 px-6 py-6 text-white backdrop-blur-xl hover:bg-white/[0.15]">
            <Link to="/security">Read trust documentation</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export const FinalCTA = () => {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const panelScale = useTransform(scrollYProgress, [0, 0.65], reduceMotion ? [1, 1] : [0.96, 1]);

  return (
    <section ref={ref} id="start" className={`${auroraSection} py-28 text-lumicoria-obsidian md:py-36`}>
      <div className="container relative mx-auto px-4">
        <motion.div style={{ scale: panelScale }}>
          <Reveal className={`${glassPanel} mx-auto max-w-5xl`}>
            <div className="p-8 text-center md:p-12">
              <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mx-auto mb-7 h-14 w-14 rounded-2xl object-contain" />
              <h2 className="font-hero text-[clamp(2.8rem,6vw,5.9rem)] font-semibold leading-[0.99] tracking-[-0.04em]">
                Start with one better workday.
              </h2>
              <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-700">
                Bring one document, one meeting, one research goal, or one overloaded week. Lumicoria helps turn it into clear output, next actions, and healthier momentum.
              </p>
            </div>
            <div className="grid gap-px bg-lumicoria-cognitive/30 md:grid-cols-3">
              {[
                ['Start free', 'Use Lumicoria as one person before the team arrives.', '/signup'],
                ['Book a demo', 'See the workspace, model routing, and agent studio in context.', '/demo'],
                ['Build with us', 'Engage Lumicoria.com for a custom agent workflow.', '/agency'],
              ].map(([title, body, href], index) => (
                <Link key={title} to={href} className={`group bg-white/[0.48] p-7 backdrop-blur-xl transition hover:bg-white/75 ${index === 1 ? 'md:-translate-y-4 md:rounded-3xl md:bg-lumicoria-core md:text-white md:shadow-[0_28px_80px_rgba(33,23,69,0.24)]' : ''}`}>
                  <p className="font-hero text-2xl font-semibold tracking-[-0.03em]">{title}</p>
                  <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-white/[0.72]' : 'text-slate-700'}`}>{body}</p>
                  <span className={`mt-7 inline-flex h-10 items-center rounded-full px-4 font-signal text-xs ${index === 1 ? 'bg-white text-lumicoria-core' : 'bg-lumicoria-core text-white'} transition group-hover:translate-x-1`}>
                    Continue
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
};
