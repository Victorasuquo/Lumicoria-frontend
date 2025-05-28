import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mic, PenTool, FileText, Bot } from 'lucide-react';

const LiveStudio = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);

  const features = [
    {
      title: 'Document Scanning',
      description: 'Scan and process documents in real-time using your camera',
      icon: FileText,
      active: true
    },
    {
      title: 'Voice Input',
      description: 'Use voice commands to create tasks and interact with agents',
      icon: Mic,
      active: false
    },
    {
      title: 'Sketch Recognition',
      description: 'Draw or sketch to create tasks and visualize ideas',
      icon: PenTool,
      active: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Interaction Studio</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Interact with AI agents in real-time using your camera, voice, or sketches.
          Transform your physical workspace into an intelligent, interactive environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Camera Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Live Camera Feed</CardTitle>
            <CardDescription>
              Use your camera to scan documents, monitor your workspace, and interact with AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {isCameraActive ? (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-lumicoria-purple mx-auto mb-4" />
                  <p className="text-gray-600">Camera feed will appear here</p>
                </div>
              ) : (
                <Button
                  onClick={() => setIsCameraActive(true)}
                  className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Modes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Interaction Modes</CardTitle>
            <CardDescription>
              Choose how you want to interact with AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="document" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="document">
                  <FileText className="w-4 h-4 mr-2" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="sketch">
                  <PenTool className="w-4 h-4 mr-2" />
                  Sketch
                </TabsTrigger>
              </TabsList>
              <TabsContent value="document" className="space-y-4">
                <p className="text-gray-600">
                  Point your camera at documents to scan and process them in real-time.
                  The AI will extract information and create tasks automatically.
                </p>
                <Button className="w-full bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
                  Start Document Mode
                </Button>
              </TabsContent>
              <TabsContent value="voice" className="space-y-4">
                <p className="text-gray-600">
                  Use voice commands to create tasks, interact with agents, and control the system.
                  Speak naturally and the AI will understand your intent.
                </p>
                <Button className="w-full bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
                  Start Voice Mode
                </Button>
              </TabsContent>
              <TabsContent value="sketch" className="space-y-4">
                <p className="text-gray-600">
                  Draw or sketch to create tasks, visualize ideas, or annotate documents.
                  The AI will interpret your drawings and convert them into actionable items.
                </p>
                <Button className="w-full bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
                  Start Sketch Mode
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Active Agents</CardTitle>
            <CardDescription>
              AI agents currently processing your inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg ${
                    feature.active ? 'bg-lumicoria-purple/10' : 'bg-gray-50'
                  }`}
                >
                  <feature.icon className={`w-6 h-6 mr-4 ${
                    feature.active ? 'text-lumicoria-purple' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveStudio; 