import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GalleryHorizontal, GalleryThumbnails, Brain, FileText, Heart, Camera, Users, Activity, CheckCircle, ListTodo, Calendar, X, Plus, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const agents = [
  {
    id: 1,
    name: "Document Agent",
    description: "Automatically extract key information from documents and create tasks, events, and reminders.",
    icon: <FileText size={32} />,
    color: "bg-lumicoria-purple",
    gradient: "from-violet-500 to-purple-600"
  },
  {
    id: 2,
    name: "Well-being Coach",
    description: "Get personalized break reminders, posture tips, and focus exercises based on your work patterns.",
    icon: <Heart size={32} />,
    color: "bg-lumicoria-purple",
    gradient: "from-rose-500 to-pink-600"
  },
  {
    id: 3,
    name: "Vision Agent",
    description: "Use your camera to instantly scan documents, whiteboards or analyze your environment in real-time.",
    icon: <Camera size={32} />,
    color: "bg-lumicoria-blue",
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    id: 4,
    name: "Meeting Agent",
    description: "Summarize calls, capture action items, and schedule follow-ups automatically.",
    icon: <Users size={32} />,
    color: "bg-lumicoria-orange",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    id: 5,
    name: "Student Agent",
    description: "Organize study materials, track assignments and deadlines with focus support.",
    icon: <Brain size={32} />,
    color: "bg-lumicoria-teal",
    gradient: "from-emerald-500 to-green-600"
  }
];

const AgentsUniverse = () => {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [processingState, setProcessingState] = useState("idle"); // idle, processing, complete
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("extracted");
  const [showWellbeingExercise, setShowWellbeingExercise] = useState(false);
  
  // For document agent demo
  const documentInfo = {
    extracted: [
      { label: "Payment Due", value: "June 15, 2025" },
      { label: "Project Deadline", value: "July 30, 2025" },
      { label: "Total Amount", value: "$12,450.00" }
    ],
    tasks: [
      { id: 1, title: "Process invoice payment", deadline: "June 10, 2025", priority: "High" },
      { id: 2, title: "Schedule project review", deadline: "July 15, 2025", priority: "Medium" }
    ],
    events: [
      { id: 1, title: "Payment Reminder", date: "June 14, 2025", time: "09:00 AM" },
      { id: 2, title: "Project Deadline", date: "July 30, 2025", time: "05:00 PM" }
    ]
  };
  
  // For well-being coach demo
  const wellbeingData = {
    focusTime: "52 minutes",
    recommendation: "3-minute breathing exercise",
    posture: "Leaning forward",
    breakStatus: "Due now"
  };

  useEffect(() => {
    let interval;
    
    if (processingState === "processing") {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            setProcessingState("complete");
            return 100;
          }
          return newProgress;
        });
      }, 100);
    }
    
    return () => interval && clearInterval(interval);
  }, [processingState]);

  const handleStartProcessing = () => {
    setProcessingState("processing");
    setProgress(0);
    
    // Reset to default state when switching agents
    setActiveTab("extracted");
    setShowWellbeingExercise(false);
  };

  const handleDeployAgent = () => {
    toast({
      title: `${selectedAgent.name} Deployed`,
      description: "Your agent is now active and ready to assist you.",
    });
  };

  const startBreakExercise = () => {
    setShowWellbeingExercise(true);
  };
  
  const dismissBreakExercise = () => {
    setShowWellbeingExercise(false);
    toast({
      title: "Break reminder snoozed",
      description: "We'll remind you again in 20 minutes.",
    });
  };

  // Reset processing state when agent changes
  useEffect(() => {
    setProcessingState("idle");
    setProgress(0);
  }, [selectedAgent]);
  
  return (
    <section id="agents-universe" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            Agents Universe
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your AI Assistant Ecosystem
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Browse our library of specialized AI agents, each designed to assist with specific tasks and workflows. Select and deploy agents instantly, with no coding required.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between reveal">
          {/* Agent Navigator */}
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <GalleryThumbnails className="mr-2 text-lumicoria-purple" />
              Browse Agents
            </h3>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-lg cursor-pointer transition-all flex items-center ${
                    selectedAgent.id === agent.id 
                      ? 'bg-lumicoria-purple/10 border border-lumicoria-purple/30' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${agent.color} text-white mr-4`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Agent Details */}
          <div className="w-full lg:w-2/3">
            <motion.div 
              key={selectedAgent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex items-start mb-6">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedAgent.gradient} text-white mr-6`}>
                  {selectedAgent.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedAgent.name}</h3>
                  <p className="text-gray-600">{selectedAgent.description}</p>
                </div>
              </div>
              
              {/* Agent Demo Area */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-lumicoria-purple/10 to-lumicoria-blue/5 rounded-full filter blur-2xl"></div>
                
                {/* Document Agent Demo */}
                {selectedAgent.id === 1 && (
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-lumicoria-purple/20 flex items-center justify-center">
                        <FileText size={24} className="text-lumicoria-purple" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Document Processing</h4>
                        <p className="text-sm text-gray-500">
                          {processingState === "idle" && "Ready to scan documents"}
                          {processingState === "processing" && "Scanning invoice_q2.pdf..."}
                          {processingState === "complete" && "Document analysis complete"}
                        </p>
                        
                        {processingState === "processing" && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">Extracting data {progress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {processingState === "idle" && (
                      <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={handleStartProcessing}>
                        <div className="text-center">
                          <FileText size={36} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Click to process document</p>
                        </div>
                      </div>
                    )}
                    
                    {processingState === "complete" && (
                      <div className="bg-white rounded-lg border border-gray-200">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                            <TabsTrigger value="calendar">Calendar</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="extracted" className="p-4">
                            <div className="space-y-3">
                              {documentInfo.extracted.map((item, index) => (
                                <div className="flex justify-between" key={index}>
                                  <span className="text-sm font-medium">{item.label}:</span>
                                  <span className="text-sm text-lumicoria-purple">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="tasks" className="p-4">
                            <div className="space-y-3">
                              {documentInfo.tasks.map((task) => (
                                <div key={task.id} className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-100">
                                  <div className="mr-2">
                                    <CheckCircle size={16} className="text-lumicoria-purple opacity-70" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <div className="flex text-xs text-gray-500 mt-1">
                                      <span className="mr-2">Due: {task.deadline}</span>
                                      <span>Priority: {task.priority}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="flex items-center p-2 bg-gray-50 rounded-md border border-dashed border-gray-300 text-gray-400 cursor-pointer hover:bg-gray-100">
                                <Plus size={16} className="mr-2" />
                                <span className="text-sm">Add task</span>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="calendar" className="p-4">
                            <div className="space-y-3">
                              {documentInfo.events.map((event) => (
                                <div key={event.id} className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-100">
                                  <div className="mr-2">
                                    <Calendar size={16} className="text-lumicoria-purple opacity-70" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{event.title}</p>
                                    <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                                  </div>
                                </div>
                              ))}
                              <div className="flex items-center p-2 bg-gray-50 rounded-md border border-dashed border-gray-300 text-gray-400 cursor-pointer hover:bg-gray-100">
                                <Plus size={16} className="mr-2" />
                                <span className="text-sm">Add event</span>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                    
                    {processingState === "complete" && (
                      <div className="flex justify-end space-x-3">
                        <Button size="sm" variant="outline" className="text-xs">
                          Export Data
                        </Button>
                        <Button size="sm" className="bg-lumicoria-blue hover:bg-blue-600 text-xs">
                          Save All
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Well-being Coach Demo */}
                {selectedAgent.id === 2 && (
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <Heart size={24} className="text-rose-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Well-being Coach</h4>
                        <p className="text-sm text-gray-500">
                          {processingState === "idle" && "Ready to monitor your well-being"}
                          {processingState === "processing" && "Analyzing your work patterns..."}
                          {processingState === "complete" && "Analysis complete"}
                        </p>
                        
                        {processingState === "processing" && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">Analyzing patterns {progress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {processingState === "idle" && (
                      <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={handleStartProcessing}>
                        <div className="text-center">
                          <Activity size={36} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Click to start monitoring</p>
                        </div>
                      </div>
                    )}
                    
                    {processingState === "complete" && !showWellbeingExercise && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm mb-3 font-medium">
                          You've been working for {wellbeingData.focusTime} straight. Time for a short break!
                        </p>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Focus Duration:</span>
                            <span className="text-sm font-medium text-rose-500">{wellbeingData.focusTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Posture:</span>
                            <span className="text-sm font-medium text-amber-500">{wellbeingData.posture}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Recommendation:</span>
                            <span className="text-sm font-medium text-emerald-500">{wellbeingData.recommendation}</span>
                          </div>
                        </div>
                        <div className="flex items-center mt-4 p-2 bg-rose-50 rounded-lg border border-rose-100">
                          <AlertCircle size={18} className="text-rose-500 mr-2" />
                          <p className="text-sm text-rose-700">Break overdue. Recommended action needed.</p>
                        </div>
                      </div>
                    )}
                    
                    {processingState === "complete" && showWellbeingExercise && (
                      <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 text-center">
                        <h4 className="font-medium text-rose-800 mb-2">Breathing Exercise</h4>
                        <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-white flex items-center justify-center relative">
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-rose-400"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <p className="text-rose-600 font-medium">Breathe</p>
                        </div>
                        <p className="text-sm text-rose-700 mb-4">Follow the circle's rhythm.<br />Breathe in as it expands, out as it contracts.</p>
                        <p className="text-xs text-rose-600 mb-1">Time remaining: 2:47</p>
                        <Progress value={30} className="h-1 bg-rose-200" />
                      </div>
                    )}
                    
                    {processingState === "complete" && (
                      <div className="flex justify-end space-x-3 mt-4">
                        {!showWellbeingExercise ? (
                          <>
                            <Button size="sm" variant="outline" className="text-xs" onClick={dismissBreakExercise}>
                              Remind Later
                            </Button>
                            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-xs" onClick={startBreakExercise}>
                              Start Break
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowWellbeingExercise(false)}>
                            End Exercise
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Other agent demos */}
                {selectedAgent.id > 2 && (
                  <div className="relative z-10 space-y-4 flex items-center justify-center h-40">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedAgent.gradient} mx-auto mb-4 flex items-center justify-center text-white`}>
                        {selectedAgent.icon}
                      </div>
                      <p className="text-gray-500">
                        Deploy this agent to see it in action
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline">
                  Learn More
                </Button>
                <Button 
                  className={`bg-gradient-to-r ${selectedAgent.gradient} text-white`}
                  onClick={handleDeployAgent}
                >
                  Deploy Agent
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentsUniverse;
