import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auroraSection, glassPanel, glassTile, Reveal } from './LandingSections';

const customers = [
  {
    title: 'Individuals',
    subhead: 'A calmer way to get through work.',
    body: 'Solo professionals, students, researchers, freelancers, and founders can start free, bring one document or goal, and leave with a clearer plan.',
    people: ['Independent consultant', 'Graduate student', 'Solo founder'],
    path: ['Bring the messy context', 'Choose the right kind of help', 'Turn output into next actions'],
    cta: 'Start free',
    href: '/signup',
  },
  {
    title: 'Teams',
    subhead: 'Shared momentum without scattered tools.',
    body: 'Small teams can run shared agents, documents, decisions, and wellbeing signals in the same workspace from twenty nine dollars per user per month.',
    people: ['Agency lead', 'Customer success lead', 'People operations lead'],
    path: ['Connect the team context', 'Share agents and sources', 'Review work and workload together'],
    cta: 'Start a team workspace',
    href: '/signup',
  },
  {
    title: 'Enterprise',
    subhead: 'Governance when the workspace scales.',
    body: 'Large organisations can add company sign in, user provisioning, audit exports, regional storage choices, managed keys, and dedicated environments when needed.',
    people: ['Chief Operating Officer', 'Chief Technology Officer', 'Workspace administrator'],
    path: ['Configure identity', 'Set governance', 'Roll out by workspace'],
    cta: 'Talk to our Enterprise team',
    href: '/enterprise',
  },
  {
    title: 'Custom Builds',
    subhead: 'Want it built for you?',
    body: 'Lumicoria.com can design and deliver a complete agent workflow for productivity, wellbeing, documents, or team operations in six to eight weeks.',
    people: ['People operations leader', 'Research director', 'Executive sponsor'],
    path: ['Map the human workflow', 'Build the agent system', 'Operate and improve it'],
    cta: 'Engage Lumicoria.com',
    href: '/agency',
  },
];

const customerTabClasses = [
  'bg-lumicoria-signal text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
  'bg-lumicoria-human/80 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10 ring-1 ring-lumicoria-gold/15',
  'bg-lumicoria-obsidian text-white shadow-lg shadow-lumicoria-core/20',
  'bg-lumicoria-gold/55 text-lumicoria-obsidian shadow-lg shadow-lumicoria-core/10',
];

const customerPanelClasses = [
  'bg-lumicoria-signal/70',
  'bg-lumicoria-human/40',
  'bg-lumicoria-obsidian text-white',
  'bg-lumicoria-gold/[0.28]',
];

const Personas = () => {
  const [activeCustomer, setActiveCustomer] = useState(1);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const panelY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [42, -42]);
  const customer = customers[activeCustomer];

  return (
    <section ref={ref} id="personas" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.45fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/Lumicoria coloured (2).png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.7rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-gray-950">
              One platform, different starting points.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Lumicoria meets people where the pressure starts: one person trying to think clearly, a student managing research, or a team trying to work better together.
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
                      : 'bg-white/60 text-gray-600 ring-1 ring-white/70 backdrop-blur-xl hover:bg-white/80 hover:text-lumicoria-obsidian'
                  }`}
                >
                  <span className="block font-hero text-xl font-semibold tracking-[-0.025em]">{item.title}</span>
                  <span className={activeCustomer === index && index === 2 ? 'mt-1 block text-sm text-white/70' : activeCustomer === index ? 'mt-1 block text-sm text-lumicoria-obsidian/70' : 'mt-1 block text-sm text-gray-500'}>{item.subhead}</span>
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
                    <img src={activeCustomer % 2 === 0 ? '/images/lumicoria-logo-primary.png' : '/images/lumicoria-logo-primary.png'} alt="" className="mb-8 h-12 w-12 rounded-2xl object-contain" />
                    <p className={activeCustomer === 2 ? 'font-hero text-sm font-semibold text-white/70' : 'font-hero text-sm font-semibold text-lumicoria-core'}>{customer.title}</p>
                    <h3 className={activeCustomer === 2 ? 'mt-4 font-hero text-[clamp(2.4rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-0.04em] text-white' : 'mt-4 font-hero text-[clamp(2.4rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-0.04em] text-gray-950'}>
                      {customer.subhead}
                    </h3>
                    <p className={activeCustomer === 2 ? 'mt-6 text-lg leading-8 text-white/70' : 'mt-6 text-lg leading-8 text-lumicoria-obsidian/70'}>{customer.body}</p>
                    <Button asChild className={activeCustomer === 2 ? 'liquid-action mt-8 bg-white text-lumicoria-obsidian hover:bg-white/90' : 'liquid-action mt-8 bg-lumicoria-obsidian text-white hover:bg-lumicoria-core'}>
                      <Link to={customer.href}>{customer.cta}</Link>
                    </Button>
                  </div>

                  <div className="bg-white/40 p-8 backdrop-blur-xl md:p-10">
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
                            <p className="font-hero text-xl font-semibold tracking-[-0.025em] text-gray-950">{step}</p>
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
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.22 }}
                    className={`${glassPanel} p-6`}
                  >
                    <div className={`mb-5 h-10 w-10 rounded-2xl ${index === 0 ? 'bg-lumicoria-signal' : index === 1 ? 'bg-lumicoria-human/70 ring-1 ring-lumicoria-gold/15' : 'bg-lumicoria-gold/45'}`} />
                    <p className="font-hero text-xl font-semibold tracking-[-0.025em] text-gray-950">{person}</p>
                    <p className="mt-3 text-sm leading-6 text-gray-500">A route through Lumicoria built around actual work, energy, and ownership.</p>
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
