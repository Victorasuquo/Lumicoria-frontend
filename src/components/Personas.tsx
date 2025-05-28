
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock, CircleCheck } from 'lucide-react';

const personas = [
  {
    name: "Professionals",
    title: "Streamline your workflow",
    description: "Automate document processing, task management, and maintain work-life balance with AI that understands your needs.",
    features: [
      "Extract data from contracts & invoices",
      "Automatically generate tasks & events",
      "Well-being reminders during busy days",
      "No-code customization for unique workflows"
    ],
    icon: <FileText className="h-5 w-5" />
  },
  {
    name: "Students",
    title: "Organize your studies",
    description: "Scan notes, track assignments, and maintain focus with personalized study plans and well-being support.",
    features: [
      "Convert handwritten notes to digital format",
      "Track assignment deadlines automatically",
      "Focus coaching and study break reminders",
      "Custom study planning agents"
    ],
    icon: <Calendar className="h-5 w-5" />
  },
  {
    name: "Teams",
    title: "Collaborate seamlessly",
    description: "Share workflows, automate team tasks, and gain insights with AI agents that enhance collaboration.",
    features: [
      "Meeting summaries & action items",
      "Team document processing & sharing",
      "Custom team workflows & automations",
      "Collaborative agent building"
    ],
    icon: <Clock className="h-5 w-5" />
  }
];

const Personas = () => {
  return (
    <section id="personas" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            Who It's For
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Lumicoria adapts to your needs
          </h2>
          <p className="text-lg text-gray-600">
            Whether you're a busy professional, a student, or part of a team, Lumicoria.ai provides tailored solutions for your unique requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personas.map((persona, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg overflow-hidden reveal transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]" 
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              <div className="p-8 border-b border-gray-100">
                <div className="inline-block p-2 bg-lumicoria-purple/10 rounded-lg mb-4">
                  {persona.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{persona.name}</h3>
                <h4 className="text-2xl font-bold mb-4 text-lumicoria-purple">{persona.title}</h4>
                <p className="text-gray-600 mb-6">{persona.description}</p>
              </div>
              
              <div className="p-8">
                <h5 className="font-medium mb-4">Key Benefits:</h5>
                <ul className="space-y-3 mb-6">
                  {persona.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2 text-lumicoria-purple mt-1">
                        <CircleCheck size={16} />
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white btn-hover-effect">
                  <span>Learn More</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Personas;
