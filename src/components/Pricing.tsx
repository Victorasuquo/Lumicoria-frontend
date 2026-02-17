import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    description: 'Try Lumicoria with core agents and essential workflows.',
    price: '$0',
    period: 'per month',
    features: [
      '3 pre-built agents',
      '1 hour/month live camera usage',
      'Basic well-being coaching'
    ],
    highlighted: false,
    cta: 'Start Free'
  },
  {
    name: 'Pro',
    description: 'For professionals and teams shipping real outcomes.',
    price: '$29',
    period: 'per user / month',
    features: [
      'Unlimited custom agents & workflows',
      'AI Model Hub (Gemini, Mistral, Perplexity)',
      'Advanced well-being analytics'
    ],
    highlighted: true,
    cta: 'Get Pro'
  },
  {
    name: 'Enterprise',
    description: 'Security, compliance, governance, and scale.',
    price: 'Custom',
    period: 'contact sales',
    features: [
      'SSO, audit logs, advanced security',
      'Compliance reporting (GDPR, CCPA)',
      'Custom integrations & SLAs'
    ],
    highlighted: false,
    cta: 'Contact Sales'
  }
];

const Pricing = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Plans built for real work</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more agents and workflow orchestration, and scale to enterprise governance when you’re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative rounded-2xl transition-all ${
                tier.highlighted
                  ? 'border-lumicoria-purple shadow-lg scale-105'
                  : 'border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-lumicoria-purple text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 ml-2">{tier.period}</span>
                </div>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-lumicoria-purple mr-2 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button
                  asChild
                  className={`w-full ${
                    tier.highlighted
                      ? 'bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white'
                      : 'bg-white text-lumicoria-purple border border-lumicoria-purple hover:bg-lumicoria-purple/10'
                  }`}
                >
                  <Link to="/pricing">{tier.cta}</Link>
                </Button>
                <Button asChild variant="link" className="text-gray-500">
                  <Link to="/pricing">See full details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
