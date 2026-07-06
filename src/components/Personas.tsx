import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auroraSection, glassPanel, glassTile, Reveal } from './LandingSections';

const customers = [
  {
    title: 'Individuals',
    subhead: 'Start with your own work.',
    body: 'Consultants, founders, analysts, researchers, and operators can bring a document, meeting, research question, or messy week and leave with usable output.',
    people: ['Independent consultant', 'Founder operator', 'Research analyst'],
    path: ['Bring real context', 'Pick the right agent', 'Turn output into action'],
    cta: 'Start free',
    href: '/signup',
  },
  {
    title: 'Teams',
    subhead: 'Give everyone shared agents and memory.',
    body: 'Teams can share agents, sources, decisions, and tasks inside managed workspaces so work does not disappear into private chat threads.',
    people: ['Operations lead', 'Product manager', 'Agency lead'],
    path: ['Create the workspace', 'Connect sources and apps', 'Publish agents to the team'],
    cta: 'Start a team workspace',
    href: '/signup',
  },
  {
    title: 'Support and service',
    subhead: 'Route customer work with human review.',
    body: 'Support leaders can triage requests, draft replies, escalate sensitive cases, and connect service quality back to approved knowledge.',
    people: ['Customer success lead', 'Support manager', 'Service operations'],
    path: ['Connect the knowledge base', 'Classify and draft', 'Review exceptions'],
    cta: 'See support workflows',
    href: '/agents',
  },
  {
    title: 'Enterprise',
    subhead: 'Govern agents across the organisation.',
    body: 'Large organisations can add SSO, SCIM, audit exports, data residency, managed keys, webhooks, and private deployment conversations when needed.',
    people: ['CIO', 'Compliance owner', 'Workspace administrator'],
    path: ['Set identity controls', 'Define data boundaries', 'Roll out by workspace'],
    cta: 'Talk to Enterprise',
    href: '/enterprise',
  },
  {
    title: 'Custom builds',
    subhead: 'Have the workflow built for you.',
    body: 'Lumicoria.com can design and deliver agent systems for meetings, customer support, knowledge operations, analysis, and governed internal workflows.',
    people: ['Executive sponsor', 'Operations director', 'Transformation lead'],
    path: ['Map the workflow', 'Build the agent system', 'Operate and improve'],
    cta: 'Engage Lumicoria.com',
    href: '/agency',
  },
];

const customerTabClasses = [
  'bg-white text-lumicoria-core ring-1 ring-lumicoria-cognitive/40 shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-core text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-obsidian text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-cognitive/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
];

const customerPanelClasses = [
  'bg-white/[0.62]',
  'bg-lumicoria-core text-white',
  'bg-lumicoria-signal/[0.76]',
  'bg-lumicoria-obsidian text-white',
  'bg-lumicoria-cognitive/[0.32]',
];

const Personas = () => {
  const [activeCustomer, setActiveCustomer] = useState(1);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const panelY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [42, -42]);
  const customer = customers[activeCustomer];
  const darkCustomer = activeCustomer === 1 || activeCustomer === 3;

  return (
    <section ref={ref} id="personas" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.45fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/Lumicoria coloured (2).png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.7rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-lumicoria-obsidian">
              Not enterprise only. Not personal only.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Lumicoria starts where the work starts, then grows into shared teams, managed environments, and enterprise controls without changing the platform story.
            </p>

            <div className="mt-9 space-y-2">
              {customers.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveCustomer(index)}
                  className={`w-full rounded-2xl px-5 py-4 text-left transition ${
                    activeCustomer === index
                      ? customerTabClasses[index]
                      : 'bg-white/[0.62] text-slate-600 ring-1 ring-white/75 backdrop-blur-xl hover:bg-white hover:text-lumicoria-core'
                  }`}
                >
                  <span className="block font-hero text-xl font-semibold tracking-[-0.025em]">{item.title}</span>
                  <span className={activeCustomer === index && (index === 1 || index === 3) ? 'mt-1 block text-sm text-white/70' : 'mt-1 block text-sm text-slate-600'}>{item.subhead}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div style={{ y: panelY }} className="space-y-6">
            <Reveal>
              <motion.article
                key={customer.title}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className={glassPanel}
              >
                <div className="grid gap-px bg-lumicoria-core/10 md:grid-cols-[1.05fr_0.95fr]">
                  <div className={`${customerPanelClasses[activeCustomer]} p-8 backdrop-blur-xl md:p-10`}>
                    <img src="/images/lumicoria-logo-primary.png" alt="" className="mb-8 h-12 w-12 rounded-2xl object-contain" />
                    <p className={darkCustomer ? 'font-hero text-sm font-semibold text-white/70' : 'font-hero text-sm font-semibold text-lumicoria-core'}>{customer.title}</p>
                    <h3 className={darkCustomer ? 'mt-4 font-hero text-[clamp(2.35rem,5vw,5.15rem)] font-semibold leading-[1] tracking-[-0.04em] text-white' : 'mt-4 font-hero text-[clamp(2.35rem,5vw,5.15rem)] font-semibold leading-[1] tracking-[-0.04em] text-lumicoria-obsidian'}>
                      {customer.subhead}
                    </h3>
                    <p className={darkCustomer ? 'mt-6 text-lg leading-8 text-white/72' : 'mt-6 text-lg leading-8 text-lumicoria-obsidian/70'}>{customer.body}</p>
                    <Button asChild className={darkCustomer ? 'liquid-action mt-8 bg-white text-lumicoria-obsidian hover:bg-white/90' : 'liquid-action mt-8 bg-lumicoria-obsidian text-white hover:bg-lumicoria-core'}>
                      <Link to={customer.href}>{customer.cta}</Link>
                    </Button>
                  </div>

                  <div className="bg-white/[0.44] p-8 backdrop-blur-xl md:p-10">
                    <p className="font-hero text-sm font-semibold text-lumicoria-core">How this path works</p>
                    <div className="mt-6 space-y-4">
                      {customer.path.map((step, index) => (
                        <motion.div
                          key={step}
                          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.35 }}
                          className={`${glassTile} p-5`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-full bg-lumicoria-core text-center text-xs font-semibold leading-8 text-white">{index + 1}</span>
                            <p className="font-hero text-xl font-semibold tracking-[-0.025em] text-lumicoria-obsidian">{step}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3">
              {customer.people.map((person, index) => (
                <Reveal key={person} delay={index * 0.05}>
                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -6 }}
                    transition={{ duration: 0.22 }}
                    className={`${glassPanel} p-6`}
                  >
                    <div className={`mb-5 h-10 w-10 rounded-2xl ${index === 0 ? 'bg-lumicoria-core' : index === 1 ? 'bg-lumicoria-signal ring-1 ring-lumicoria-cognitive/35' : 'bg-lumicoria-cognitive/55'}`} />
                    <p className="font-hero text-xl font-semibold tracking-[-0.025em] text-lumicoria-obsidian">{person}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">A practical route through agents, workspace memory, and ownership.</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Personas;
