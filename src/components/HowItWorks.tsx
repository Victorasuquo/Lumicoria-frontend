
import React from 'react';
import { FileText, Zap, Calendar, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const steps = [
  {
    icon: <FileText size={28} />,
    color: "bg-lumicoria-purple text-white",
    title: "Upload Documents",
    description: "Scan or upload your documents, including contracts, notes, receipts, or emails."
  },
  {
    icon: <Zap size={28} />,
    color: "bg-lumicoria-blue text-white",
    title: "AI Extraction",
    description: "Our AI agents automatically extract key dates, tasks, and information from your documents."
  },
  {
    icon: <Calendar size={28} />,
    color: "bg-lumicoria-orange text-white",
    title: "Auto-Organization",
    description: "Tasks, calendar events, and reminders are created automatically based on the extracted data."
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple, powerful, and intelligent
          </h2>
          <p className="text-lg text-gray-600">
            Lumicoria.ai transforms your documents into actionable intelligence in just a few steps, without any manual data entry.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-200 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center reveal" style={{ transitionDelay: `${index * 0.2}s` }}>
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6 z-10 relative shadow-lg`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>

                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 -right-6 transform translate-x-1/2">
                      <ArrowRight size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Demo section */}
          <Dialog>
            <div className="mt-20 bg-feature-gradient rounded-2xl p-8 shadow-lg reveal">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                  <h3 className="text-2xl font-bold mb-4">See it in action</h3>
                  <p className="text-gray-600 mb-6">
                    Watch how Lumicoria.ai processes a client contract, extracts key information, and automatically creates tasks and calendar events in seconds.
                  </p>
                  <DialogTrigger asChild>
                    <div className="inline-flex items-center font-medium text-lumicoria-purple cursor-pointer group">
                      <span>Watch the demo</span>
                      <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </DialogTrigger>
                </div>
                <div className="md:w-1/2">
                  <DialogTrigger asChild>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-xl cursor-pointer group">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                      <img
                        src="https://img.youtube.com/vi/zFcxA9T_BWs/maxresdefault.jpg"
                        alt="Demo Video Thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </DialogTrigger>
                </div>
              </div>
            </div>
            <DialogContent className="sm:max-w-[900px] p-0 border-none bg-black/80 shadow-2xl">
              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/zFcxA9T_BWs?si=Ov_7CYjzlUFjHYZ0&autoplay=1"
                  title="Lumicoria Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
