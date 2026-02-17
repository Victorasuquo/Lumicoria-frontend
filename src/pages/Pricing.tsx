import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pricingTiers = [
  {
    name: 'Free',
    description: 'Get started with core agents and essential workflows.',
    price: '$0',
    period: 'per month',
    features: [
      'Access to 3 pre-built agents',
      '1 hour/month Live Interaction Studio',
      'Basic well-being coaching',
      'Document extraction & summaries',
      'Email support'
    ],
    highlighted: false
  },
  {
    name: 'Pro',
    description: 'Unlock the full platform for teams and power users.',
    price: '$29',
    period: 'per user / month',
    features: [
      'Unlimited custom agents & workflows',
      'AI Model Hub (Gemini, Mistral, Perplexity)',
      'Live Interaction Studio (camera, voice, text)',
      'Team collaboration & shared workspaces',
      'Advanced well-being analytics',
      'Priority support'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    description: 'Security, scale, and governance for large organizations.',
    price: 'Custom',
    period: 'contact sales',
    features: [
      'SSO, audit logs, and advanced security',
      'Dedicated onboarding & success team',
      'Compliance reporting (GDPR, CCPA)',
      'Custom integrations & SLAs',
      'Private data policies & governance',
      'Enterprise support, 24/7'
    ],
    highlighted: false
  }
];

const faqs = [
  {
    q: 'What is included in the Free tier?',
    a: 'You get access to three pre-built agents, basic well-being coaching, and 1 hour per month of Live Interaction Studio usage.'
  },
  {
    q: 'Which AI models does Lumicoria support?',
    a: 'Lumicoria includes an AI Model Hub so you can choose models like Gemini, Mistral, and Perplexity based on task requirements.'
  },
  {
    q: 'Can I build custom agents without code?',
    a: 'Yes. The No-Code Agent Studio lets you connect inputs, AI processors, and outputs visually—no engineering required.'
  },
  {
    q: 'How does live camera usage work?',
    a: 'Live Interaction Studio supports camera, voice, sketches, and text. Free plans include 1 hour per month; Pro and Enterprise scale with usage.'
  },
  {
    q: 'Do you support teams and shared workspaces?',
    a: 'Pro includes team collaboration features, shared agent libraries, and workspace-level permissions to keep workflows aligned.'
  },
  {
    q: 'What security controls are available?',
    a: 'Enterprise includes SSO, audit logs, advanced encryption, and compliance reporting aligned with GDPR and CCPA requirements.'
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes. Pro starts with a 14-day free trial and can be upgraded or downgraded at any time.'
  }
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f6ff] text-[#1d143f] dark:bg-[#0c0a14] dark:text-[#f7f6ff]">
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_10%_-10%,rgba(191,191,255,0.55),transparent_60%),radial-gradient(700px_520px_at_90%_0%,rgba(226,240,255,0.7),transparent_60%),linear-gradient(180deg,#f7f6ff_0%,#ffffff_55%,#ffffff_100%)] dark:bg-[radial-gradient(900px_520px_at_10%_-10%,rgba(70,58,126,0.5),transparent_60%),radial-gradient(700px_520px_at_90%_0%,rgba(80,115,170,0.3),transparent_60%),linear-gradient(180deg,#0c0a14_0%,#131024_60%,#0c0a14_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]" style={{
        backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.15\"/></svg>')"
      }} />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#372673] shadow-[0_12px_35px_-28px_rgba(55,38,115,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-[#e2dcff]">
            Pricing
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-[#5b5572] dark:text-[#c8c4e0]">
            One intelligent layer for agents, workflows, and governance. Choose the plan that matches your scale today—and grow without re-platforming.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[#6b6484] dark:text-[#b4b0ca]">
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-[0_12px_35px_-28px_rgba(55,38,115,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">Cancel anytime</span>
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-[0_12px_35px_-28px_rgba(55,38,115,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">14-day free trial on Pro</span>
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-[0_12px_35px_-28px_rgba(55,38,115,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">Enterprise-grade security</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`group relative flex h-full flex-col overflow-hidden rounded-[32px] border bg-white/80 backdrop-blur-2xl shadow-[0_30px_80px_-50px_rgba(22,16,48,0.45)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${tier.highlighted
                  ? 'border-[#6c4ab0]/60 ring-1 ring-[#6c4ab0]/30 shadow-[0_40px_100px_-60px_rgba(55,38,115,0.6)]'
                  : 'border-white/70 hover:-translate-y-1 hover:border-[#c7b8f7]'
                } dark:border-white/10 dark:bg-white/5 dark:shadow-[0_40px_110px_-70px_rgba(0,0,0,0.7)]`}
            >
              <div className={`pointer-events-none absolute inset-0 ${tier.highlighted
                  ? 'bg-[radial-gradient(240px_200px_at_70%_0%,rgba(254,226,116,0.35),transparent_70%)]'
                  : 'bg-[radial-gradient(220px_200px_at_80%_0%,rgba(191,191,255,0.25),transparent_70%)]'
                }`} />
              <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/40 opacity-60 [mask-image:linear-gradient(180deg,white,transparent)] dark:border-white/10" />
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#6c4ab0] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl text-[#1d143f] dark:text-white">{tier.name}</CardTitle>
                <CardDescription className="text-[#6b6484] dark:text-[#c4c0da]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-[#1d143f] dark:text-white">{tier.price}</span>
                  <span className="text-sm text-[#6b6484] dark:text-[#b7b3cd]">{tier.period}</span>
                </div>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[#524c68] dark:text-[#d1cde6]">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6c4ab0]/10 dark:bg-white/10">
                        <Check className="h-3.5 w-3.5 text-[#6c4ab0] dark:text-[#e2dcff]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto items-stretch">
                <Button
                  className={`w-full rounded-full text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-[1px] ${tier.highlighted
                      ? 'bg-[#6c4ab0] text-white shadow-[0_18px_40px_-28px_rgba(55,38,115,0.7)] hover:bg-[#3b2d6a]'
                      : 'bg-white text-[#6c4ab0] border border-[#6c4ab0] hover:bg-[#6c4ab0]/10'
                    } dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20`}
                  onClick={() => tier.name === 'Enterprise' ? window.location.href = 'mailto:sales@lumicoria.ai' : navigate('/billing')}
                >
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-[32px] border border-white/60 bg-white/80 p-10 text-center shadow-[0_30px_80px_-55px_rgba(55,38,115,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <h2 className="text-2xl font-semibold text-[#1d143f] dark:text-white">Need a custom solution?</h2>
          <p className="mt-3 text-[#6b6484] dark:text-[#b7b3cd]">
            We tailor enterprise deployments with advanced security, governance, and custom integrations for regulated and high-scale teams.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-6 rounded-full border-[#6c4ab0] text-[#6c4ab0] hover:bg-[#6c4ab0]/10 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            onClick={() => window.location.href = 'mailto:sales@lumicoria.ai'}
          >
            Contact Sales
          </Button>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_1.6fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#372673] shadow-[0_12px_35px_-28px_rgba(55,38,115,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-[#e2dcff]">
              FAQ
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-[#1d143f] dark:text-white">Questions & Answers</h2>
            <p className="mt-4 text-[#6b6484] dark:text-[#c8c4e0]">
              Everything you need to know about Lumicoria.ai pricing, usage, and platform capabilities.
            </p>
            <div className="mt-6 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 text-sm text-[#6b6484] shadow-[0_20px_50px_-40px_rgba(55,38,115,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-[#b7b3cd]">
              More questions? Visit our docs or talk to sales for a tailored walkthrough.
            </div>
          </div>
          <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_70px_-45px_rgba(55,38,115,0.4)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="border-[#e6e0ff]/70 dark:border-white/10">
                  <AccordionTrigger className="text-left text-sm font-semibold text-[#1d143f] hover:no-underline dark:text-white">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#6b6484] dark:text-[#c4c0da]">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
