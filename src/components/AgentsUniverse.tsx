import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auroraSection, glassPanel, glassTile, purpleGlass, Reveal } from './LandingSections';

const agents = [
  {
    name: 'Document Agent',
    category: 'Knowledge',
    tagline: 'Turn every document into structured action.',
    description: 'Extract dates, amounts, parties, clauses, risks, and tasks from contracts, invoices, scans, and internal files.',
  },
  {
    name: 'RAG Agent',
    category: 'Knowledge',
    tagline: 'Your knowledge, searchable by meaning.',
    description: "Answer team questions with citations back to the source across documentation, wikis, contracts, and uploaded content.",
  },
  {
    name: 'Knowledge Graph Agent',
    category: 'Knowledge',
    tagline: 'Extract the structure inside unstructured content.',
    description: 'Pull entities, relationships, and dependencies out of documents and conversations so teams can query the graph.',
  },
  {
    name: 'Research Agent',
    category: 'Research',
    tagline: 'A week of research in an afternoon.',
    description: 'Turn a topic and trusted sources into a structured report with citations, key findings, and a defensible recommendation.',
  },
  {
    name: 'Research Mentor',
    category: 'Research',
    tagline: "Methodology coaching for your team's analysts.",
    description: 'Walk analysts through sources, methods, and analysis so the final report is sharper and still owned by the analyst.',
  },
  {
    name: 'Customer Service Agent',
    category: 'Operations',
    tagline: 'Resolve routine tickets with context.',
    description: 'Triage, classify, retrieve from the knowledge base, draft the reply, and escalate work that needs human judgment.',
  },
  {
    name: 'Translation Agent',
    category: 'Operations',
    tagline: 'Thirty plus languages, with your terminology.',
    description: 'Translate text, documents, and structured content with brand voice and regulatory language in mind.',
  },
  {
    name: 'Social Media Agent',
    category: 'Creative',
    tagline: 'A consistent cadence your team can maintain.',
    description: 'Draft posts in brand voice, schedule across platforms, and report engagement with recommended adjustments.',
  },
  {
    name: 'Meeting Agent',
    category: 'Operations',
    tagline: 'Every meeting captured as structured outcome.',
    description: 'Audio becomes transcript, decisions, action items, and tasks attached to the right people and records.',
  },
  {
    name: 'Meeting Fact Checker',
    category: 'Governance',
    tagline: 'Real time fact checking against your knowledge base.',
    description: "During the call, claims are checked against your team's content so misstatements surface early.",
  },
  {
    name: 'Data Analysis Agent',
    category: 'Research',
    tagline: "The analyst's first pass, in minutes.",
    description: 'Upload the dataset and get summaries, visualisations, and recommendations calibrated to the business question.',
  },
  {
    name: 'Creative Agent',
    category: 'Creative',
    tagline: 'First drafts, calibrated to your brand.',
    description: 'Long form writing, scripts, marketing copy, and presentation outlines in your voice. The team edits.',
  },
  {
    name: 'Vision Agent',
    category: 'Knowledge',
    tagline: 'Image and video as first class input.',
    description: 'Document scanning, whiteboard capture, product identification, and visual workflows available to operators.',
  },
  {
    name: 'Legal Document Agent',
    category: 'Governance',
    tagline: 'Every contract reviewed against your playbook.',
    description: 'Extract clauses, compare against standards, and flag deviations for the legal or operations team.',
  },
  {
    name: 'Ethics and Bias Agent',
    category: 'Governance',
    tagline: 'Catch the risk before it leaves the team.',
    description: 'Review content, communications, and decisions for ethics, bias, and compliance issues against chosen guidelines.',
  },
  {
    name: 'Student Agent',
    category: 'Learning',
    tagline: 'A study companion for the academic year.',
    description: "Organise notes, references, deadlines, and study plans against the student's actual curriculum and pace.",
  },
  {
    name: 'Learning Coach',
    category: 'Learning',
    tagline: 'Adult learning that adapts to your goal.',
    description: "Recommend resources, schedule practice, and surface the right material based on the learner's pace and prior knowledge.",
  },
  {
    name: 'Wellbeing Coach',
    category: 'Wellbeing',
    tagline: 'A wellness layer integrated with your work.',
    description: 'Observe workspace activity, surface mood prompts, recommend breaks, and produce a weekly digest grounded in real activity.',
  },
  {
    name: 'Focus Flow Agent',
    category: 'Wellbeing',
    tagline: 'Surface your next best action.',
    description: 'Look across projects, tasks, calendar, and active conversations to surface the next action calibrated to priorities.',
  },
  {
    name: 'Workspace Ergonomics Agent',
    category: 'Wellbeing',
    tagline: 'Patterns made visible. Improvements suggested.',
    description: "Observe team work patterns and recommend operational improvements leadership can act on.",
  },
  {
    name: 'General Agent',
    category: 'Custom',
    tagline: 'The starting point for the agent you compose.',
    description: 'Configurable, integration aware, and prompt driven. The base for the workflow your team needs next.',
  },
];

const logoVariants = [
  '/images/lumicoria-logo-primary.png',
  '/images/lumicoria-logo-primary.png',
  '/images/lumicoria-logo-mono.png',
  '/images/Lumicoria coloured (2).png',
];

const categoryOrder = ['Wellbeing', 'Learning', 'Knowledge', 'Research', 'Operations', 'Creative', 'Governance', 'Custom'];

const categoryActiveClasses = [
  'bg-lumicoria-human/80 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10 ring-1 ring-lumicoria-gold/15',
  'bg-lumicoria-gold/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-core text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-obsidian text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-obsidian text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-gold/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
];

const categoryPanelClasses = [
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/45 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-gold/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-gold/[0.28] text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/75 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
  purpleGlass,
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/10 bg-lumicoria-obsidian text-white shadow-[0_24px_70px_rgba(8,7,18,0.24)] ring-1 ring-lumicoria-cognitive/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/75 text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/10 bg-lumicoria-obsidian text-white shadow-[0_24px_70px_rgba(8,7,18,0.24)] ring-1 ring-lumicoria-cognitive/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-gold/[0.28] text-lumicoria-obsidian shadow-[0_20px_60px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl',
];

const AgentsUniverse = () => {
  const [activeCategory, setActiveCategory] = useState('Wellbeing');
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const orbitRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-18, 18]);
  const filteredAgents = useMemo(() => agents.filter((agent) => agent.category === activeCategory), [activeCategory]);
  const activeAgent = filteredAgents[activeIndex % filteredAgents.length] ?? agents[0];
  const activeCategoryIndex = Math.max(0, categoryOrder.indexOf(activeCategory));
  const activeCategoryIsDark = activeCategoryIndex === 3 || activeCategoryIndex === 4 || activeCategoryIndex === 6;

  return (
    <section ref={ref} id="agents-universe" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.86fr_1.42fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.7rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-gray-950">
              Agents for the whole workday.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Document intelligence, research, meetings, learning, creative work, customer support, focus, and wellbeing all orbit the same workspace.
            </p>

            <div className="mt-9 flex flex-wrap gap-2">
              {categoryOrder.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveIndex(0);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category
                      ? categoryActiveClasses[categoryOrder.indexOf(category)]
                      : 'bg-white/70 text-lumicoria-core ring-1 ring-lumicoria-core/[0.15] backdrop-blur-xl hover:bg-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <div className={`${glassPanel} p-5`}>
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="relative min-h-[31rem] overflow-hidden rounded-2xl border border-white/70 bg-white/50 p-5 ring-1 ring-lumicoria-core/10 backdrop-blur-xl">
                    <motion.div style={{ rotate: orbitRotate }} className="absolute inset-8 rounded-full border border-lumicoria-core/10" />
                    <motion.div style={{ rotate: orbitRotate }} className="absolute inset-20 rounded-full border border-lumicoria-core/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        className="z-10 flex h-36 w-36 items-center justify-center rounded-full border border-white/70 bg-white/70 shadow-[0_20px_60px_rgba(33,23,69,0.12)] ring-1 ring-lumicoria-core/10 backdrop-blur-2xl"
                      >
                        <img src="/images/Lumicoria coloured (2).png" alt="Lumicoria" className="h-20 w-20 object-contain" />
                      </motion.div>
                    </div>
                    {filteredAgents.map((agent, index) => {
                      const angle = (index / filteredAgents.length) * Math.PI * 2 - Math.PI / 2;
                      const radius = index % 2 === 0 ? 160 : 112;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      return (
                        <motion.button
                          key={agent.name}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`absolute left-1/2 top-1/2 z-20 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/70 bg-white/75 p-2 shadow-sm ring-1 backdrop-blur-xl transition ${
                            activeAgent.name === agent.name ? 'ring-lumicoria-core shadow-[0_14px_30px_rgba(33,23,69,0.18)]' : 'ring-lumicoria-core/10 hover:ring-lumicoria-core/25'
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
                    className={`${categoryPanelClasses[activeCategoryIndex]} p-7`}
                  >
                    <div className="relative">
                      <img src={logoVariants[activeIndex % logoVariants.length]} alt="" className="mb-8 h-12 w-12 rounded-2xl bg-white object-contain" />
                      <p className={activeCategoryIsDark ? 'text-sm font-semibold text-white/70' : 'text-sm font-semibold text-lumicoria-core'}>{activeAgent.category}</p>
                      <h3 className="mt-4 font-hero text-[clamp(2.2rem,4vw,4.7rem)] font-semibold leading-[1] tracking-[-0.04em]">
                        {activeAgent.name}
                      </h3>
                      <p className={activeCategoryIsDark ? 'mt-5 text-2xl font-semibold leading-9 tracking-[-0.02em] text-white' : 'mt-5 text-2xl font-semibold leading-9 tracking-[-0.02em] text-lumicoria-obsidian'}>{activeAgent.tagline}</p>
                      <p className={activeCategoryIsDark ? 'mt-6 text-base leading-8 text-white/75' : 'mt-6 text-base leading-8 text-lumicoria-obsidian/70'}>{activeAgent.description}</p>
                      <Link to="/agents" className={activeCategoryIsDark ? 'liquid-action mt-8 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-lumicoria-obsidian transition hover:bg-white/90' : 'liquid-action mt-8 inline-flex min-h-11 items-center rounded-full bg-lumicoria-obsidian px-5 text-sm font-semibold text-white transition hover:bg-lumicoria-core'}>
                        Try this agent
                      </Link>
                    </div>
                  </motion.article>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3">
              {filteredAgents.slice(0, 6).map((agent, index) => (
                <Reveal key={agent.name} delay={index * 0.04}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-full w-full rounded-3xl p-5 text-left transition ${
                      activeAgent.name === agent.name
                        ? categoryActiveClasses[activeCategoryIndex]
                        : `${glassTile} text-gray-950 hover:-translate-y-1 hover:ring-lumicoria-core/25`
                    }`}
                  >
                    <p className="font-hero text-xl font-semibold tracking-[-0.025em]">{agent.name}</p>
                    <p className={activeAgent.name === agent.name && activeCategoryIsDark ? 'mt-3 text-sm leading-6 text-white/75' : activeAgent.name === agent.name ? 'mt-3 text-sm leading-6 text-lumicoria-obsidian/70' : 'mt-3 text-sm leading-6 text-gray-500'}>
                      {agent.tagline}
                    </p>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal className={`${glassPanel} flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center`}>
              <p className="max-w-2xl text-base leading-7 text-gray-600">
                Start with one agent for a document, one focus session, or one research task. Add the rest only when the work naturally expands.
              </p>
              <Button asChild className="liquid-action bg-lumicoria-core px-6 py-6 text-white hover:bg-lumicoria-obsidian">
                <Link to="/agents">Browse the full library</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentsUniverse;
