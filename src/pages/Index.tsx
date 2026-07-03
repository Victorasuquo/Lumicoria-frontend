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
  CompetitionAdvantageSection,
  DailyValueSection,
  EnterpriseSection,
  FinalCTA,
  ProviderTrustBar,
  ReviewsSection,
  StorySpineSection,
  TrustedBySection,
  WellbeingRhythmSection,
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
        title="Lumicoria AI, AI Agent Universe for Teams, Productivity and Wellbeing"
        description="AI agents for documents, meetings, research, study planning, focus, wellbeing, and team productivity. Start free, organize your work, and scale with your team when you are ready."
        canonical="/"
        keywords={[...KEYWORDS.byPage.home, ...KEYWORDS.global]}
      />
      <Hero />
      <ProviderTrustBar />
      <StorySpineSection />
      <DailyValueSection />
      <AgentsUniverse />
      <Features />
      <WellbeingRhythmSection />
      <HowItWorks />
      <AgentBuilder />
      <Integrations />
      <TrustedBySection />
      <ReviewsSection />
      <Personas />
      <CompetitionAdvantageSection />
      <EnterpriseSection />
      <Pricing />
      <FinalCTA />
    </main>
  );
};

export default Index;
