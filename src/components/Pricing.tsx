import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auroraSection, glassPanel, glassTile, Reveal } from './LandingSections';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'per month',
    description: 'For one person testing documents, focus, learning, and agent help.',
    features: [
      'Up to 2 agents',
      'Up to 50 agent runs per month',
      'Up to 10 documents per month',
      'Default model only',
      'Community support',
    ],
    cta: 'Start free',
    href: '/signup',
    logo: '/images/lumicoria-logo-primary.png',
  },
  {
    name: 'Starter',
    price: '$29',
    period: 'per user per month',
    description: 'For solo professionals and small teams that want more runs and documents.',
    features: [
      'Up to 5 agents',
      'Up to 500 agent runs per month',
      'Up to 100 documents per month',
      'Four model providers',
      'Email support',
    ],
    cta: 'Start with Starter',
    href: '/pricing',
    logo: '/images/lumicoria-logo-primary.png',
  },
  {
    name: 'Professional',
    price: '$79',
    period: 'per user per month',
    description: 'For growing teams running documents, meetings, research, wellbeing, and shared agents.',
    features: [
      'Up to 15 agents',
      'Up to 5,000 agent runs per month',
      'Up to 1,000 documents per month',
      'Six model providers',
      'Priority support, API access, custom agent templates, advanced features',
    ],
    cta: 'Get Professional',
    href: '/pricing',
    logo: '/images/lumicoria-logo-primary.png',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For organisations that need governance, residency, identity, audit, and dedicated support.',
    features: [
      'Unlimited agents, runs, and documents',
      'All model providers, including dedicated provider keys',
      'Company sign in, audit exports, regional storage choices, and managed keys',
      'Dedicated environment on request',
      'Custom SLA above 99.9 percent',
      'Dedicated customer success manager',
    ],
    cta: 'Talk to sales',
    href: '/enterprise',
    logo: '/images/lumicoria-logo-mono.png',
  },
];

const includedRows = [
  ['Agents', '2', '5', '15', 'Unlimited'],
  ['Agent runs', '50', '500', '5,000', 'Unlimited'],
  ['Documents', '10', '100', '1,000', 'Unlimited'],
  ['Model providers', 'Default', '4', '6', 'Dedicated keys'],
];

const planTabClasses = [
  'bg-lumicoria-signal/75 text-lumicoria-obsidian',
  'bg-lumicoria-human/55 text-lumicoria-obsidian ring-1 ring-lumicoria-gold/15',
  'bg-lumicoria-core text-white',
  'bg-lumicoria-obsidian text-white',
];

const planPanelClasses = [
  'rounded-2xl bg-lumicoria-signal/75 p-8 text-lumicoria-obsidian ring-1 ring-white/70',
  'rounded-2xl bg-lumicoria-human/35 p-8 text-lumicoria-obsidian ring-1 ring-lumicoria-gold/15',
  'rounded-2xl bg-lumicoria-core p-8 text-white',
  'rounded-2xl bg-lumicoria-obsidian p-8 text-white',
];

const Pricing = () => {
  const [activePlan, setActivePlan] = useState(2);
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const panelY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [36, -36]);
  const plan = plans[activePlan];

  return (
    <section ref={ref} id="pricing" className={`${auroraSection} py-28 md:py-40`}>
      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.45fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <img src="/images/lumicoria-logo-primary.png" alt="Lumicoria" className="mb-7 h-12 w-12 rounded-2xl object-contain" />
            <h2 className="font-hero text-[clamp(2.7rem,5vw,5.85rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-gray-950">
              Start free, then choose the capacity your work actually needs.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Individuals can begin without a sales call. Teams can grow into shared agents, documents, and governance when the work asks for it.
            </p>
          </Reveal>

          <motion.div style={{ y: panelY }} className="space-y-6">
            <Reveal>
              <div className={glassPanel}>
                <div className="grid gap-px bg-lumicoria-core/10 md:grid-cols-4">
                  {plans.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setActivePlan(index)}
                      className={`px-5 py-6 text-left backdrop-blur-xl transition ${
                        activePlan === index ? planTabClasses[index] : 'bg-white/60 text-gray-500 hover:text-lumicoria-obsidian'
                      }`}
                    >
                      <span className={activePlan === index && index > 1 ? 'block h-2 w-10 rounded-full bg-white/50' : activePlan === index ? 'block h-2 w-10 rounded-full bg-lumicoria-core/50' : 'block h-2 w-10 rounded-full bg-lumicoria-core/[0.15]'} />
                      <span className="mt-5 block font-hero text-xl font-semibold tracking-[-0.025em]">{item.name}</span>
                      <span className="mt-2 block text-sm">{item.price}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
                  <motion.article
                    key={plan.name}
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={planPanelClasses[activePlan]}
                  >
                    <img src={plan.logo} alt="" className="mb-7 h-12 w-12 rounded-2xl bg-white object-contain" />
                    <p className={activePlan > 1 ? 'text-sm font-semibold text-white/70' : 'text-sm font-semibold text-lumicoria-core'}>{plan.name}</p>
                    <div className="mt-5 flex items-end gap-3">
                      <span className="font-hero text-6xl font-semibold tracking-[-0.04em]">{plan.price}</span>
                      <span className={activePlan > 1 ? 'pb-2 text-sm text-white/70' : 'pb-2 text-sm text-lumicoria-obsidian/70'}>{plan.period}</span>
                    </div>
                    <p className={activePlan > 1 ? 'mt-6 text-base leading-8 text-white/80' : 'mt-6 text-base leading-8 text-lumicoria-obsidian/70'}>{plan.description}</p>
                    <Button
                      asChild
                      className={activePlan > 1 ? 'liquid-action mt-8 bg-white text-lumicoria-obsidian hover:bg-white/90' : 'liquid-action mt-8 bg-lumicoria-obsidian text-white hover:bg-lumicoria-core'}
                    >
                      <Link to={plan.href}>{plan.cta}</Link>
                    </Button>
                  </motion.article>

                  <div className={`${glassTile} p-6`}>
                    <p className="font-hero text-2xl font-semibold tracking-[-0.025em] text-gray-950">Included capacity</p>
                    <div className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-sm font-medium text-gray-700 backdrop-blur-xl"
                        >
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className={glassPanel}>
                <div className="grid grid-cols-5 bg-lumicoria-obsidian px-4 py-4 text-xs font-semibold text-white md:text-sm">
                  <span>Limit</span>
                  {plans.map((item) => (
                    <span key={item.name}>{item.name}</span>
                  ))}
                </div>
                {includedRows.map((row) => (
                  <div key={row[0]} className="grid grid-cols-5 border-t border-lumicoria-core/10 px-4 py-4 text-xs text-gray-600 md:text-sm">
                    {row.map((cell, index) => (
                      <span key={`${row[0]}-${cell}`} className={index === 0 ? 'font-semibold text-gray-950' : activePlan === index - 1 ? 'font-semibold text-lumicoria-core' : ''}>
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className={`${glassPanel} p-6 text-center`}>
              <p className="text-base leading-8 text-gray-700">
                Need it built for you? Engage Lumicoria.com for a Discovery Sprint, a Production Agent Build, or a full workflow and wellbeing system.
              </p>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
