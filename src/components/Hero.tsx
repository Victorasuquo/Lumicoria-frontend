
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Calendar, Check, Brain } from 'lucide-react';

const Hero = () => {
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
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="pt-20 pb-20 md:pt-28 md:pb-20 bg-hero-pattern">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10">
            <div className="reveal">
              <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
                Introducing Lumicoria.ai
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Document Intelligence <span className="gradient-text">Meets</span> Well-being
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Upload documents, extract key information, automate tasks, and balance productivity with well-being—all with powerful AI agents that adapt to your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white py-6 px-8 text-lg btn-hover-effect">
                  <span>Try For Free</span>
                </Button>
                <Button variant="outline" className="border-lumicoria-purple text-lumicoria-purple hover:bg-lumicoria-purple/5 py-6 px-8 text-lg">
                  <span>Watch Demo</span>
                </Button>
              </div>
            </div>
            
            <div className="mt-10 reveal" style={{transitionDelay: "0.2s"}}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-gray-700">
                  <Check size={20} className="text-lumicoria-purple mr-2" />
                  <span>No coding required</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Check size={20} className="text-lumicoria-purple mr-2" />
                  <span>Multiple AI models</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Check size={20} className="text-lumicoria-purple mr-2" />
                  <span>Free starter plan</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative reveal" style={{transitionDelay: "0.4s"}}>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-lumicoria-lightPurple/10 rounded-full filter blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-lumicoria-blue/10 rounded-full filter blur-xl"></div>
              
              <div className="relative glass-card rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-white to-gray-50 p-3 border-b">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 bg-lumicoria-purple/10 rounded-lg">
                      <FileText size={24} className="text-lumicoria-purple" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Document Agent</h3>
                      <p className="text-sm text-gray-600">Extracted 3 key dates from invoice_q2.pdf</p>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Payment Due</span>
                      <span className="text-sm text-lumicoria-purple">June 15, 2025</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Project Deadline</span>
                      <span className="text-sm text-lumicoria-purple">July 30, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Review Meeting</span>
                      <span className="text-sm text-lumicoria-purple">May 25, 2025</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar size={20} className="text-lumicoria-blue" />
                        <span className="text-sm">Create calendar events?</span>
                      </div>
                      <Button size="sm" className="bg-lumicoria-blue hover:bg-blue-600 text-white text-xs py-1">
                        Add to Calendar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Brain size={20} className="text-lumicoria-orange" />
                        <span className="text-sm">Generate tasks & reminders?</span>
                      </div>
                      <Button size="sm" className="bg-lumicoria-orange hover:bg-orange-600 text-white text-xs py-1">
                        Create Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-12 -right-12 w-24 h-24 bg-white rounded-xl shadow-lg p-4 transform rotate-12 animate-float opacity-90">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-lumicoria-teal/30 to-lumicoria-blue/30 flex items-center justify-center">
                  <Calendar className="text-lumicoria-blue" />
                </div>
              </div>
              
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-white rounded-xl shadow-lg p-3 transform -rotate-12 animate-float opacity-90" style={{animationDelay: "1s"}}>
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-lumicoria-orange/30 to-yellow-400/30 flex items-center justify-center">
                  <FileText className="text-lumicoria-orange" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
