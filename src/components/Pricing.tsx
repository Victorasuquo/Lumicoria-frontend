
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out Lumicoria.ai",
    price: "0",
    features: [
      "Access to 3 pre-built agents",
      "1 hour/month live camera usage",
      "Basic well-being coaching",
      "Single user account",
      "Standard document processing"
    ],
    notIncluded: [
      "Custom agent creation",
      "Advanced AI models",
      "Team collaboration",
      "Unlimited document uploads"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    description: "For professionals and power users",
    price: "29",
    popular: true,
    features: [
      "Access to all pre-built agents",
      "Unlimited custom agents",
      "Access to all AI models",
      "Team collaboration features",
      "Advanced well-being analytics",
      "Unlimited document uploads",
      "Priority processing"
    ],
    buttonText: "Start 14-Day Free Trial",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    price: "Custom",
    features: [
      "Everything in Pro",
      "SSO & advanced security controls",
      "Dedicated support & onboarding",
      "Compliance reporting (GDPR, CCPA)",
      "Custom integrations",
      "SLA guarantees",
      "Enterprise admin dashboard"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that's right for you. All plans include access to our core AI agent features.
          </p>
        </div>
        
        <div className="flex justify-center mb-10 reveal">
          <div className="bg-white p-1 rounded-full shadow-sm inline-flex">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-lumicoria-purple text-white shadow-md" 
                  : "text-gray-600 hover:text-lumicoria-purple"
              }`}
              onClick={() => setBillingPeriod("monthly")}
            >
              Monthly Billing
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "yearly" 
                  ? "bg-lumicoria-purple text-white shadow-md" 
                  : "text-gray-600 hover:text-lumicoria-purple"
              }`}
              onClick={() => setBillingPeriod("yearly")}
            >
              Yearly Billing
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl relative reveal ${
                plan.popular ? "border-2 border-lumicoria-purple" : ""
              }`}
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-lumicoria-purple text-white text-xs font-semibold py-1 px-3 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-gray-500 ml-2">
                      per user / {billingPeriod === "monthly" ? "month" : "year"}
                    </span>
                  )}
                </div>
                <Button 
                  variant={plan.buttonVariant as "outline" | "default"} 
                  className={`w-full ${
                    plan.buttonVariant === "default" 
                      ? "bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white" 
                      : "border-lumicoria-purple text-lumicoria-purple hover:bg-lumicoria-purple/10"
                  } btn-hover-effect`}
                >
                  <span>{plan.buttonText}</span>
                </Button>
              </div>
              
              <div className="border-t border-gray-100 p-8">
                <h4 className="font-semibold mb-4">Features included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex">
                      <Check size={20} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded && (
                    <>
                      <li className="pt-2 border-t border-gray-100"></li>
                      {plan.notIncluded.map((feature, i) => (
                        <li key={`not-${i}`} className="flex text-gray-400">
                          <X size={20} className="text-gray-300 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center reveal">
          <p className="text-gray-600">
            Need a custom solution? <span className="text-lumicoria-purple font-semibold cursor-pointer">Contact our sales team</span> to find the perfect fit for your organization.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
