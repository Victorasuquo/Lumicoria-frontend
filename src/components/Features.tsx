
import React from 'react';
import { 
  FileText, 
  Heart,
  Camera, 
  Brain, 
  Users, 
  Layers 
} from 'lucide-react';

const features = [
  {
    icon: <FileText size={28} />,
    color: "from-violet-500 to-purple-600",
    title: "Document Agent",
    description: "Automatically scan and extract key information from contracts, receipts, and notes to create tasks and calendar events."
  },
  {
    icon: <Heart size={28} />,
    color: "from-rose-500 to-pink-600",
    title: "Well-being Coach",
    description: "Get personalized break reminders, posture tips, and focus exercises based on your work patterns."
  },
  {
    icon: <Camera size={28} />,
    color: "from-blue-500 to-cyan-600",
    title: "Live Vision",
    description: "Use your camera to instantly scan documents, whiteboards, or analyze your environment in real-time."
  },
  {
    icon: <Brain size={28} />,
    color: "from-amber-500 to-orange-600",
    title: "AI Model Choice",
    description: "Select from Gemini, Mistral, or Perplexity models based on your needs for speed, accuracy, or research."
  },
  {
    icon: <Users size={28} />,
    color: "from-emerald-500 to-green-600",
    title: "Team Collaboration",
    description: "Share workflows, documents, and insights with your team in a secure, collaborative environment."
  },
  {
    icon: <Layers size={28} />,
    color: "from-indigo-500 to-blue-600",
    title: "No-Code Builder",
    description: "Create custom AI agents by connecting modular components—inputs, processors, and outputs—without coding."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            Core Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your AI Agent Universe
          </h2>
          <p className="text-lg text-gray-600">
            Lumicoria.ai combines document intelligence, task automation, and well-being in one powerful platform. Choose from specialized AI agents or build your own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-r ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
