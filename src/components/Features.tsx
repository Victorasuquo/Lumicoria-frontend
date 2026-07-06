import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { auroraSection, glassPanel, glassTile, purpleGlass, Reveal } from './LandingSections';

const workspaceSurfaces = [
  {
    title: 'Projects',
    promise: 'Keep goals, owners, files, and agent output in one place.',
    body: 'Plan work, assign ownership, attach source material, and let agents help turn decisions into tasks people can actually finish.',
    records: ['Roadmap review', 'Owner assigned', 'Next action ready'],
  },
  {
    title: 'Documents',
    promise: 'Read, compare, extract, and draft with source context intact.',
    body: 'Contracts, reports, policies, invoices, and PDFs become structured summaries, risks, obligations, and reusable knowledge.',
    records: ['Clause found', 'Risk flagged', 'Summary cited'],
  },
  {
    title: 'Meetings',
    promise: 'Live calls become searchable workspace memory.',
    body: 'Create meetings, invite participants, capture transcripts, assign follow ups, and attach recordings to the right team space.',
    records: ['Transcript saved', 'Decision captured', 'Follow up drafted'],
  },
  {
    title: 'Support',
    promise: 'Customer requests route to the right answer faster.',
    body: 'Classify tickets, retrieve from the knowledge base, draft responses, escalate exceptions, and keep service quality reviewable.',
    records: ['Intent detected', 'Reply drafted', 'Escalation checked'],
  },
  {
    title: 'Analytics',
    promise: 'Activity becomes signal, not another dashboard nobody trusts.',
    body: 'Track agent runs, model spend, workflow status, workload patterns, and the operational bottlenecks that need attention.',
    records: ['Run traced', 'Cost visible', 'Pattern surfaced'],
  },
  {
    title: 'Shared memory',
    promise: 'Work stays useful after the chat ends.',
    body: 'Sources, decisions, comments, approvals, and agent outputs stay attached to the team, project, and environment they belong to.',
    records: ['Source linked', 'Approval logged', 'Team synced'],
  },
];

const workspaceScenes = [
  ['Customer issue', 'Support agent', 'Knowledge source', 'Human approval'],
  ['Live meeting', 'Transcript', 'Decisions', 'Tasks'],
  ['Contract upload', 'Clause review', 'Risk note', 'Legal handoff'],
  ['Dataset', 'Analysis agent', 'Chart draft', 'Recommendation'],
];

const surfaceTabClasses = [
  'bg-lumicoria-core text-white shadow-lg shadow-lumicoria-core/20',
  'bg-white text-lumicoria-core ring-1 ring-lumicoria-cognitive/40 shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-cognitive/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-obsidian text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-human/50 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
];

const surfacePanelClasses = [
  purpleGlass,
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-white/[0.66] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-cognitive/35 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-signal/[0.76] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.10)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-cognitive/[0.32] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.11)] ring-1 ring-lumicoria-core/[0.12] backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/10 bg-lumicoria-obsidian text-white shadow-[0_24px_70px_rgba(8,7,18,0.24)] ring-1 ring-lumicoria-cognitive/15 backdrop-blur-2xl',
  'liquid-glass liquid-interactive relative overflow-hidden rounded-2xl border border-white/80 bg-lumicoria-human/[0.28] text-lumicoria-obsidian shadow-[0_22px_64px_rgba(33,23,69,0.09)] ring-1 ring-lumicoria-core/[0.10] backdrop-blur-2xl',
];

const Features = () => {
  const [activeSurface, setActiveSurface] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const mapY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [46, -46]);
  const meterWidth = useTransform(scrollYProgress, [0.1, 0.85], reduceMotion ? ['100%', '100%'] : ['12%', '100%']);
  const surface = workspaceSurfaces[activeSurface];
  const darkSurface = activeSurface === 0 || activeSurface === 4;

  return (
    <section ref={ref} id="features" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.86fr_1.45fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.75rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-lumicoria-obsidian">
              A workspace where agents can actually do the work.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Lumicoria is not a loose collection of chatbots. It is projects, documents, meetings, support, analytics, and shared memory with AI agents operating inside the context.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-2">
              {workspaceSurfaces.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onMouseEnter={() => setActiveSurface(index)}
                  onFocus={() => setActiveSurface(index)}
                  onClick={() => setActiveSurface(index)}
                  className={`rounded-2xl px-4 py-4 text-left transition ${
                    activeSurface === index
                      ? surfaceTabClasses[index]
                      : 'bg-white/[0.62] text-slate-600 ring-1 ring-white/75 backdrop-blur-xl hover:bg-white hover:text-lumicoria-core'
                  }`}
                >
                  <span className="block font-hero text-lg font-semibold tracking-[-0.025em]">{item.title}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div style={{ y: mapY }} className="space-y-6">
            <Reveal>
              <div className={`${glassPanel} p-5`}>
                <div className="grid gap-5 lg:grid-cols-[1fr_0.86fr]">
                  <div className="relative min-h-[31rem] overflow-hidden rounded-2xl border border-white/75 bg-white/[0.52] p-5 ring-1 ring-lumicoria-cognitive/35 backdrop-blur-xl">
                    <div className="scanline-grid absolute inset-0 opacity-[0.45]" />
                    <div className="relative mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="/images/lumicoria-logo-primary.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
                        <div>
                          <p className="font-hero text-sm font-semibold text-lumicoria-obsidian">Workspace operating map</p>
                          <p className="text-xs text-slate-500">Hover a surface to inspect the system.</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-white/70 px-3 py-1.5 font-signal text-[0.68rem] text-lumicoria-core ring-1 ring-lumicoria-cognitive/30">
                        live context
                      </div>
                    </div>

                    <div className="relative grid min-h-[24rem] gap-4 md:grid-cols-2">
                      {workspaceScenes.map((scene, sceneIndex) => (
                        <motion.div
                          key={scene.join()}
                          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: sceneIndex * 0.08, duration: 0.42 }}
                          className={`${sceneIndex === activeSurface % workspaceScenes.length ? surfacePanelClasses[activeSurface] : glassTile} p-4`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="h-2.5 w-2.5 rounded-full bg-lumicoria-core" />
                            <span className="font-signal text-[0.65rem] text-slate-500">flow {sceneIndex + 1}</span>
                          </div>
                          <div className="mt-5 space-y-2">
                            {scene.map((item, index) => (
                              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.46] px-4 py-3 backdrop-blur-xl">
                                <span className="h-7 w-7 rounded-full bg-lumicoria-core text-center font-signal text-[0.65rem] leading-7 text-white">{index + 1}</span>
                                <p className="font-hero text-base font-semibold tracking-[-0.025em] text-lumicoria-obsidian">{item}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.article
                    key={surface.title}
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${surfacePanelClasses[activeSurface]} p-7`}
                  >
                    <p className={darkSurface ? 'font-hero text-sm font-semibold text-white/70' : 'font-hero text-sm font-semibold text-lumicoria-core'}>Integrated workspace</p>
                    <h3 className="mt-4 font-hero text-[clamp(2.35rem,5vw,5rem)] font-semibold leading-[1] tracking-[-0.04em]">{surface.title}</h3>
                    <p className={darkSurface ? 'mt-5 text-2xl font-semibold leading-9 tracking-[-0.02em] text-white' : 'mt-5 text-2xl font-semibold leading-9 tracking-[-0.02em] text-lumicoria-obsidian'}>{surface.promise}</p>
                    <p className={darkSurface ? 'mt-6 text-base leading-8 text-white/75' : 'mt-6 text-base leading-8 text-lumicoria-obsidian/70'}>{surface.body}</p>
                    <div className={darkSurface ? 'mt-8 space-y-3 text-white/80' : 'mt-8 space-y-3 text-lumicoria-obsidian/75'}>
                      {surface.records.map((record) => (
                        <div key={record} className="rounded-2xl bg-white/[0.38] px-4 py-3 text-sm font-semibold backdrop-blur-xl">
                          {record}
                        </div>
                      ))}
                    </div>
                  </motion.article>
                </div>
              </div>
            </Reveal>

            <Reveal className={`${glassPanel} p-6`}>
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-hero text-2xl font-semibold tracking-[-0.03em] text-lumicoria-obsidian">Context travels with the work.</p>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">
                    Every agent action can stay tied to sources, owners, permissions, model route, and review history.
                  </p>
                </div>
                <div className="h-2 min-w-[12rem] overflow-hidden rounded-full bg-lumicoria-cognitive/30">
                  <motion.div style={{ width: meterWidth }} className="h-full rounded-full bg-lumicoria-core" />
                </div>
              </div>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
