import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Personas from '../components/Personas';
import HowItWorks from '../components/HowItWorks';
import AgentsUniverse from '../components/AgentsUniverse';
import Integrations from '../components/Integrations';
import AgentBuilder from '../components/AgentBuilder';
import Pricing from '../components/Pricing';
import {
  EnterpriseSection,
  FinalCTA,
  OperationsProofSection,
  ProviderTrustBar,
  SecureSharedEnvironmentsSection,
} from '../components/LandingSections';
import { SEO } from "@/components/SEO";
import { KEYWORDS } from "@/lib/seo";

const Index = () => {
  // For scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 200);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="landing-shell min-h-screen w-full max-w-full overflow-x-hidden">
      <SEO
        title="Lumicoria AI, AI Workforce Operating Environment"
        description="Build, deploy, and govern production AI agents across meetings, customer support, documents, research, data, tasks, and enterprise workspaces. Start free with 21 agents and six model providers."
        canonical="/"
        keywords={[...KEYWORDS.byPage.home, ...KEYWORDS.global]}
      />
      <Hero />
      <ProviderTrustBar />
      <AgentsUniverse />
      <Features />
      <OperationsProofSection />
      <HowItWorks />
      <AgentBuilder />
      <Integrations />
      <SecureSharedEnvironmentsSection />
      <Personas />
      <EnterpriseSection />
      <Pricing />
      <FinalCTA />
    </main>
  );
};

export default Index;
