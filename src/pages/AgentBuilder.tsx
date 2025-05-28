import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Plus, Settings, Code, Zap, FileText, Calendar, Heart } from 'lucide-react';

const templates = [
  {
    id: 'document-processor',
    name: 'Document Processor',
    description: 'Process and extract information from documents automatically',
    icon: FileText,
    features: ['OCR', 'Data Extraction', 'Task Generation']
  },
  {
    id: 'meeting-assistant',
    name: 'Meeting Assistant',
    description: 'Capture and organize meeting information',
    icon: Calendar,
    features: ['Transcription', 'Action Items', 'Follow-ups']
  },
  {
    id: 'wellbeing-coach',
    name: 'Well-being Coach',
    description: 'Monitor and improve work-life balance',
    icon: Heart,
    features: ['Activity Tracking', 'Break Reminders', 'Health Tips']
  }
];

const AgentBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">No-Code Agent Builder</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create your own AI agent without writing a single line of code.
          Choose a template, customize it to your needs, and deploy it instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Configuration */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Configure Your Agent</CardTitle>
              <CardDescription>
                Set up your agent's basic information and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Agent Name</label>
                  <Input
                    placeholder="Enter a name for your agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    placeholder="Describe what your agent does"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center">
                            <template.icon className="w-4 h-4 mr-2 text-lumicoria-purple" />
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Agent Capabilities</CardTitle>
              <CardDescription>
                Customize what your agent can do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="features">
                    <Zap className="w-4 h-4 mr-2" />
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="integrations">
                    <Settings className="w-4 h-4 mr-2" />
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    <Code className="w-4 h-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="space-y-4">
                  <p className="text-gray-600">
                    Select the features you want your agent to have. You can add or remove features later.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate && templates.find(t => t.id === selectedTemplate)?.features.map((feature, index) => (
                      <div key={index} className="flex items-center p-4 bg-lumicoria-purple/5 rounded-lg">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-gray-900">{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="integrations" className="space-y-4">
                  <p className="text-gray-600">
                    Connect your agent with other tools and services to enhance its capabilities.
                  </p>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4">
                  <p className="text-gray-600">
                    Configure advanced settings like response time, accuracy thresholds, and custom behaviors.
                  </p>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Advanced Settings
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Agent Templates</CardTitle>
            <CardDescription>
              Start with a pre-built template or create from scratch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-lumicoria-purple/10 border border-lumicoria-purple'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start">
                    <template.icon className="w-6 h-6 text-lumicoria-purple mt-1 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-lumicoria-purple/10 text-lumicoria-purple rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
          <Bot className="w-5 h-5 mr-2" />
          Create Agent
        </Button>
      </div>
    </div>
  );
};

export default AgentBuilder; 