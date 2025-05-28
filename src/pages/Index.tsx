import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Personas from '../components/Personas';
import HowItWorks from '../components/HowItWorks';
import AgentsUniverse from '../components/AgentsUniverse';
import AgentBuilder from '../components/AgentBuilder';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <AgentsUniverse />
      <AgentBuilder />
      <Personas />
      <HowItWorks />
      
      {/* Call to action section */}
      <section className="py-20 bg-gradient-to-r from-lumicoria-purple to-lumicoria-deepPurple text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to transform your workflow?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of professionals, students, and teams who are already using Lumicoria.ai to automate their document workflows and improve well-being.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-white text-lumicoria-purple hover:bg-gray-100 py-6 px-8 text-lg btn-hover-effect">
                <span>Get Started Free</span>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 py-6 px-8 text-lg">
                <span className="flex items-center">
                  Request a Demo
                  <ArrowRight size={18} className="ml-2" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
