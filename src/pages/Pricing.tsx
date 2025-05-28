import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams',
    price: '$29',
    period: 'per month',
    features: [
      '5 AI Agents',
      'Basic Document Processing',
      'Standard Well-being Features',
      'Email Support',
      '1 User'
    ],
    highlighted: false
  },
  {
    name: 'Professional',
    description: 'Ideal for growing businesses',
    price: '$79',
    period: 'per month',
    features: [
      '15 AI Agents',
      'Advanced Document Processing',
      'Full Well-being Suite',
      'Priority Support',
      '5 Users',
      'Custom Agent Templates',
      'API Access'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 'Custom',
    period: 'contact us',
    features: [
      'Unlimited AI Agents',
      'Enterprise Document Processing',
      'Custom Well-being Solutions',
      '24/7 Dedicated Support',
      'Unlimited Users',
      'Custom Development',
      'Advanced Security',
      'SLA Guarantee'
    ],
    highlighted: false
  }
];

const Pricing = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your needs. All plans include our core AI agent technology
          and can be upgraded or downgraded at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative ${
              tier.highlighted
                ? 'border-lumicoria-purple shadow-lg scale-105'
                : 'border-gray-200'
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
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-lumicoria-purple mr-2 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  tier.highlighted
                    ? 'bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white'
                    : 'bg-white text-lumicoria-purple border border-lumicoria-purple hover:bg-lumicoria-purple/10'
                }`}
              >
                {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need a custom solution?</h2>
        <p className="text-gray-600 mb-6">
          We offer tailored solutions for organizations with specific requirements.
          Our team will work with you to create a custom plan that fits your needs.
        </p>
        <Button variant="outline" size="lg" className="text-lumicoria-purple border-lumicoria-purple hover:bg-lumicoria-purple/10">
          Contact Sales
        </Button>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Can I change my plan later?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers for annual plans.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Is there a free trial available?</h3>
            <p className="text-gray-600">
              Yes, we offer a 14-day free trial for all plans. No credit card required to start.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What kind of support is included?</h3>
            <p className="text-gray-600">
              All plans include email support. Professional and Enterprise plans include priority support and dedicated account managers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 