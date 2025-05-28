import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Camera, Heart, FileText, Calendar } from 'lucide-react';

const agents = [
  {
    id: 'document-agent',
    name: 'Document Agent',
    description: 'Automatically extract and process information from your documents, creating tasks and calendar events.',
    icon: FileText,
    features: ['OCR & Data Extraction', 'Task Generation', 'Calendar Integration', 'Multi-format Support']
  },
  {
    id: 'wellbeing-coach',
    name: 'Well-being Coach',
    description: 'Monitor your workload and provide personalized breaks, exercises, and well-being recommendations.',
    icon: Heart,
    features: ['Activity Monitoring', 'Break Reminders', 'Exercise Suggestions', 'Workload Analysis']
  },
  {
    id: 'live-interaction',
    name: 'Live Interaction',
    description: 'Real-time camera-based analysis for document scanning, workspace monitoring, and instant task creation.',
    icon: Camera,
    features: ['Live Document Scanning', 'Workspace Analysis', 'Instant Task Creation', 'Real-time Processing']
  },
  {
    id: 'meeting-assistant',
    name: 'Meeting Assistant',
    description: 'Capture meeting notes, create action items, and schedule follow-ups automatically.',
    icon: Calendar,
    features: ['Meeting Transcription', 'Action Item Extraction', 'Follow-up Scheduling', 'Note Organization']
  }
];

const AgentsUniverse = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Agent Universe</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover our collection of intelligent AI agents designed to enhance your productivity and well-being.
          Each agent is specialized to handle specific tasks and can be customized to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-lumicoria-purple/10 rounded-lg">
                  <agent.icon className="w-6 h-6 text-lumicoria-purple" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {agent.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <ArrowRight className="w-4 h-4 mr-2 text-lumicoria-purple" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
                Try {agent.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to create your own agent?</h2>
        <p className="text-gray-600 mb-6">
          Use our No-Code Agent Builder to create custom AI agents tailored to your specific needs.
        </p>
        <Button size="lg" className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
          <Bot className="w-5 h-5 mr-2" />
          Build Your Agent
        </Button>
      </div>
    </div>
  );
};

export default AgentsUniverse; 