import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auroraSection, glassPanel, glassTile, purpleGlass, Reveal } from './LandingSections';

const agents = [
  {
    name: 'Meeting Agent',
    category: 'Meetings and support',
    tagline: 'Live conversations become decisions, owners, and follow ups.',
    description: 'Capture transcripts, pull action items, draft recap emails, and keep the meeting record attached to the right workspace.',
  },
  {
    name: 'Meeting Fact Checker',
    category: 'Meetings and support',
    tagline: 'Claims are checked while the room is still aligned.',
    description: 'Compare statements against approved sources, surface uncertainty, and help teams correct course before the call ends.',
  },
  {
    name: 'Customer Service Agent',
    category: 'Meetings and support',
    tagline: 'Support queues get faster without losing judgment.',
    description: 'Triage requests, retrieve the right answer, draft replies, escalate sensitive cases, and leave an audit trail for review.',
  },
  {
    name: 'Focus Flow Agent',
    category: 'Meetings and support',
    tagline: 'The next useful action stays visible.',
    description: 'Read projects, tasks, calendar pressure, and active conversations to recommend what should happen next.',
  },
  {
    name: 'Document Agent',
    category: 'Knowledge and documents',
    tagline: 'Files become structured work.',
    description: 'Extract dates, amounts, clauses, risks, tasks, and summaries from PDFs, scans, contracts, invoices, and reports.',
  },
  {
    name: 'RAG Agent',
    category: 'Knowledge and documents',
    tagline: 'Answers come with their source material.',
    description: 'Ask questions across uploaded content, wikis, policies, and knowledge bases with citations kept visible.',
  },
  {
    name: 'Knowledge Graph Agent',
    category: 'Knowledge and documents',
    tagline: 'The relationships inside your content become searchable.',
    description: 'Pull entities, dependencies, decisions, owners, and relationships out of unstructured documents and conversations.',
  },
  {
    name: 'Vision Agent',
    category: 'Knowledge and documents',
    tagline: 'Images and screens become usable inputs.',
    description: 'Work with scans, whiteboards, screenshots, product photos, and visual records as part of the same workspace memory.',
  },
  {
    name: 'Research Agent',
    category: 'Research and data',
    tagline: 'A topic becomes a defensible brief.',
    description: 'Gather trusted sources, structure findings, compare options, and turn the result into a report people can challenge.',
  },
  {
    name: 'Research Mentor',
    category: 'Research and data',
    tagline: 'Analysis gets a method, not just an answer.',
    description: 'Guide people through scope, sources, claims, and next questions so research improves as it moves.',
  },
  {
    name: 'Data Analysis Agent',
    category: 'Research and data',
    tagline: 'Datasets become summaries, charts, and choices.',
    description: 'Upload a spreadsheet or dataset and get patterns, outliers, recommendations, and analysis notes tied to the business question.',
  },
  {
    name: 'Translation Agent',
    category: 'Research and data',
    tagline: 'Language changes without losing tone.',
    description: 'Translate text, documents, and structured content with terminology, brand voice, and regulated language in view.',
  },
  {
    name: 'Creative Agent',
    category: 'Content and learning',
    tagline: 'Blank pages become useful drafts.',
    description: 'Draft long form writing, scripts, presentation outlines, campaign ideas, and internal communication in the right voice.',
  },
  {
    name: 'Social Media Agent',
    category: 'Content and learning',
    tagline: 'A content cadence your team can keep.',
    description: 'Turn ideas into platform ready posts, reuse approved messaging, and report what should be adjusted next.',
  },
  {
    name: 'Learning Coach',
    category: 'Content and learning',
    tagline: 'New skills get a path people can follow.',
    description: 'Recommend resources, schedule practice, surface weak spots, and adapt the path to each learner.',
  },
  {
    name: 'Student Agent',
    category: 'Content and learning',
    tagline: 'Academic work gets organized once.',
    description: 'Bring notes, references, deadlines, and revision plans into a single learning workflow.',
  },
  {
    name: 'Legal Document Agent',
    category: 'Risk and governance',
    tagline: 'Contracts are reviewed against the playbook.',
    description: 'Compare clauses, flag deviations, extract obligations, and route sensitive issues to the right reviewer.',
  },
  {
    name: 'Ethics and Bias Agent',
    category: 'Risk and governance',
    tagline: 'Risk gets checked before the output leaves.',
    description: 'Review content, decisions, and customer interactions against chosen ethics, bias, and compliance guidelines.',
  },
  {
    name: 'General Agent',
    category: 'Risk and governance',
    tagline: 'The configurable agent for work that does not fit a template.',
    description: 'Start with prompts, tools, sources, and permissions, then shape a workflow for the exact job your team needs.',
  },
  {
    name: 'Wellbeing Coach',
    category: 'Human operations',
    tagline: 'Energy becomes part of the operating system.',
    description: 'Offer focus prompts, break cues, mood check ins, and weekly reflections without turning care into surveillance.',
  },
  {
    name: 'Workspace Ergonomics Agent',
    category: 'Human operations',
    tagline: 'Work patterns become healthier habits.',
    description: 'Notice meeting load, desk rhythm, context switching, and fatigue signals so teams can improve how work happens.',
  },
];

const categoryOrder = [
  'Meetings and support',
  'Knowledge and documents',
  'Research and data',
  'Content and learning',
  'Risk and governance',
  'Human operations',
];

const categoryCopy: Record<string, { summary: string; outcome: string }> = {
  'Meetings and support': {
    summary: 'Live meetings, customer requests, and overloaded queues become owned work with traceable follow through.',
    outcome: 'Fewer dropped decisions',
  },
  'Knowledge and documents': {
    summary: 'Documents, scans, wikis, and visual material become source backed answers and structured records.',
    outcome: 'Faster document intelligence',
  },
  'Research and data': {
    summary: 'Research topics, datasets, sources, and multilingual work become reports, analysis, and next questions.',
    outcome: 'Defensible recommendations',
  },
  'Content and learning': {
    summary: 'Creative, learning, and communication work move from blank page to reviewable draft without losing voice.',
    outcome: 'Reusable knowledge paths',
  },
  'Risk and governance': {
    summary: 'Legal, ethics, routing, and review workflows get agent help while keeping human approval visible.',
    outcome: 'Safer output paths',
  },
  'Human operations': {
    summary: 'Focus, workload, rhythm, and ergonomic signals sit beside the work instead of outside it.',
    outcome: 'Better pace for teams',
  },
};

const logoVariants = [
  '/images/lumicoria-logo-primary.png',
  '/images/lumicoria-logo-mono.png',
  '/images/Lumicoria coloured (2).png',
];

const tabClasses = [
  'bg-lumicoria-core text-white shadow-[0_18px_48px_rgba(33,23,69,0.22)]',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-[0_18px_44px_rgba(33,23,69,0.10)]',
  'bg-white text-lumicoria-core shadow-[0_18px_44px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-cognitive/40',
  'bg-lumicoria-cognitive/55 text-lumicoria-obsidian shadow-[0_18px_44px_rgba(33,23,69,0.10)]',
  'bg-lumicoria-obsidian text-white shadow-[0_18px_44px_rgba(33,23,69,0.18)]',
  'bg-lumicoria-human/55 text-lumicoria-obsidian shadow-[0_18px_44px_rgba(33,23,69,0.10)]',
];

const panelClasses = [
  purpleGlass,
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/[0.78] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-white/[0.66] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-cognitive/35 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-cognitive/[0.32] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.11)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/10 bg-lumicoria-obsidian text-white shadow-[0_24px_70px_rgba(8,7,18,0.24)] ring-1 ring-lumicoria-cognitive/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/[0.28] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-2xl',
];

const AgentsUniverse = () => {
  const [activeCategory, setActiveCategory] = useState(categoryOrder[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const orbitRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-14, 18]);
  const railY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [38, -38]);
  const filteredAgents = useMemo(() => agents.filter((agent) => agent.category === activeCategory), [activeCategory]);
  const activeAgent = filteredAgents[activeIndex % filteredAgents.length] ?? agents[0];
  const categoryIndex = Math.max(0, categoryOrder.indexOf(activeCategory));
  const isDark = categoryIndex === 0 || categoryIndex === 4;
  const activeCopy = categoryCopy[activeCategory];

  return (
    <section ref={ref} id="agents-universe" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.84fr_1.48fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.75rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-lumicoria-obsidian">
              The agent library for real operating work.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Twenty one production agents cover meetings, support, documents, research, data, creative work, legal review, governance, and human rhythm inside the same workspace.
            </p>

            <div className="mt-9 grid gap-2">
              {categoryOrder.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveIndex(0);
                  }}
                  className={`rounded-2xl px-5 py-4 text-left transition ${
                    activeCategory === category
                      ? tabClasses[index]
                      : 'bg-white/[0.62] text-slate-600 ring-1 ring-white/75 backdrop-blur-xl hover:bg-white hover:text-lumicoria-core'
                  }`}
                >
                  <span className="block font-hero text-xl font-semibold tracking-[-0.025em]">{category}</span>
                  <span className={activeCategory === category && (index === 0 || index === 4) ? 'mt-1 block text-sm text-white/68' : 'mt-1 block text-sm text-slate-600'}>
                    {categoryCopy[category].outcome}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div style={{ y: railY }} className="space-y-6">
            <Reveal>
              <div className={`${glassPanel} p-5`}>
                <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[34rem] overflow-hidden rounded-2xl border border-white/75 bg-white/[0.55] p-5 ring-1 ring-lumicoria-cognitive/35 backdrop-blur-xl">
                    <div className="scanline-grid absolute inset-0 opacity-[0.45]" />
                    <motion.div style={{ rotate: orbitRotate }} className="absolute inset-8 rounded-full border border-lumicoria-core/10" />
                    <motion.div style={{ rotate: orbitRotate }} className="absolute inset-20 rounded-full border border-lumicoria-cognitive/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                        className="z-10 flex h-40 w-40 items-center justify-center rounded-full border border-white/75 bg-white/[0.76] shadow-[0_22px_70px_rgba(33,23,69,0.14)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl"
                      >
                        <img src="/images/Lumicoria coloured (2).png" alt="Lumicoria" className="h-20 w-20 object-contain" />
                      </motion.div>
                    </div>

                    {filteredAgents.map((agent, index) => {
                      const angle = (index / filteredAgents.length) * Math.PI * 2 - Math.PI / 2;
                      const radius = filteredAgents.length <= 2 ? 144 : index % 2 === 0 ? 176 : 126;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;

                      return (
                        <motion.button
                          key={agent.name}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`absolute left-1/2 top-1/2 z-20 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/75 bg-white/[0.78] p-2 shadow-sm ring-1 backdrop-blur-xl transition ${
                            activeAgent.name === agent.name ? 'ring-lumicoria-core shadow-[0_16px_36px_rgba(33,23,69,0.18)]' : 'ring-lumicoria-cognitive/30 hover:ring-lumicoria-core/30'
                          }`}
                          animate={{ x, y, scale: activeAgent.name === agent.name ? 1.1 : 1 }}
                          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        >
                          <img src={logoVariants[index % logoVariants.length]} alt="" className="h-full w-full rounded-xl object-contain" />
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.article
                    key={activeAgent.name}
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${panelClasses[categoryIndex]} p-7`}
                  >
                    <img src={logoVariants[activeIndex % logoVariants.length]} alt="" className="mb-8 h-12 w-12 rounded-2xl bg-white object-contain" />
                    <p className={isDark ? 'text-sm font-semibold text-white/70' : 'text-sm font-semibold text-lumicoria-core'}>{activeCategory}</p>
                    <h3 className="mt-4 font-hero text-[clamp(2.15rem,4vw,4.65rem)] font-semibold leading-[1] tracking-[-0.04em]">
                      {activeAgent.name}
                    </h3>
                    <p className={isDark ? 'mt-5 text-2xl font-semibold leading-9 tracking-[-0.02em] text-white' : 'mt-5 text-2xl font-semibold leading-9 tracking-[-0.02em] text-lumicoria-obsidian'}>{activeAgent.tagline}</p>
                    <p className={isDark ? 'mt-6 text-base leading-8 text-white/75' : 'mt-6 text-base leading-8 text-lumicoria-obsidian/70'}>{activeAgent.description}</p>

                    <div className={isDark ? 'mt-8 rounded-2xl bg-white/[0.10] p-4 text-sm leading-6 text-white/72' : 'mt-8 rounded-2xl bg-white/[0.46] p-4 text-sm leading-6 text-lumicoria-obsidian/72'}>
                      {activeCopy.summary}
                    </div>

                    <Link to="/agents" className={isDark ? 'liquid-action mt-8 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-lumicoria-obsidian transition hover:bg-white/90' : 'liquid-action mt-8 inline-flex min-h-11 items-center rounded-full bg-lumicoria-obsidian px-5 text-sm font-semibold text-white transition hover:bg-lumicoria-core'}>
                      Browse agents
                    </Link>
                  </motion.article>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAgents.map((agent, index) => (
                <Reveal key={agent.name} delay={index * 0.04}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={`h-full w-full rounded-3xl p-5 text-left transition ${
                      activeAgent.name === agent.name
                        ? tabClasses[categoryIndex]
                        : `${glassTile} text-lumicoria-obsidian hover:-translate-y-1 hover:ring-lumicoria-core/25`
                    }`}
                  >
                    <p className="font-hero text-xl font-semibold tracking-[-0.025em]">{agent.name}</p>
                    <p className={activeAgent.name === agent.name && isDark ? 'mt-3 text-sm leading-6 text-white/72' : 'mt-3 text-sm leading-6 text-slate-600'}>
                      {agent.tagline}
                    </p>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal className={`${glassPanel} flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center`}>
              <div>
                <p className="font-hero text-2xl font-semibold tracking-[-0.03em] text-lumicoria-obsidian">Production breadth without a messy tool shelf.</p>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">
                  Start with one vertical agent, then share it with a team, bind it to sources, route models, and govern the output from the same environment.
                </p>
              </div>
              <Button asChild className="liquid-action bg-lumicoria-core px-6 py-6 text-white hover:bg-lumicoria-obsidian">
                <Link to="/agents">Open the library</Link>
              </Button>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AgentsUniverse;
