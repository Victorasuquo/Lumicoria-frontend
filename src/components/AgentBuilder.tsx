
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Camera, Brain, ArrowRight, Layers, Settings, Zap } from 'lucide-react';

// Define the types of components in the agent builder
const componentTypes = {
  inputs: [
    { id: "document", name: "Document", icon: <FileText size={20} />, color: "bg-lumicoria-purple" },
    { id: "camera", name: "Camera", icon: <Camera size={20} />, color: "bg-lumicoria-blue" },
    { id: "email", name: "Email", icon: <FileText size={20} />, color: "bg-lumicoria-orange" }
  ],
  processors: [
    { id: "ocr", name: "OCR", icon: <Brain size={20} />, color: "bg-violet-500" },
    { id: "nlp", name: "NLP", icon: <Brain size={20} />, color: "bg-indigo-500" },
    { id: "analyze", name: "Analyzer", icon: <Brain size={20} />, color: "bg-blue-500" }
  ],
  outputs: [
    { id: "calendar", name: "Calendar", icon: <FileText size={20} />, color: "bg-emerald-500" },
    { id: "tasks", name: "Tasks", icon: <FileText size={20} />, color: "bg-amber-500" },
    { id: "notification", name: "Notification", icon: <FileText size={20} />, color: "bg-rose-500" }
  ]
};

const AgentBuilder = () => {
  const [selectedInput, setSelectedInput] = useState(componentTypes.inputs[0]);
  const [selectedProcessor, setSelectedProcessor] = useState(componentTypes.processors[0]);
  const [selectedOutput, setSelectedOutput] = useState(componentTypes.outputs[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTestAgent = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  return (
    <section id="agent-builder" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-lumicoria-purple/10 text-lumicoria-purple text-sm font-medium mb-4">
            No-Code Agent Builder
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Build Your Custom AI Agents
          </h2>
          <p className="text-lg text-gray-600">
            Create powerful AI agents by connecting modular components—inputs, processors, and outputs—without writing a single line of code.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200 mb-10 reveal">
            <div className="flex flex-col space-y-8 relative">
              {/* Connector lines */}
              <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-300 z-0 hidden md:block"></div>
              <div className="absolute top-24 left-1/6 w-0.5 h-24 bg-gray-300 z-0 hidden md:block"></div>
              <div className="absolute top-24 left-3/6 w-0.5 h-24 bg-gray-300 z-0 hidden md:block"></div>
              <div className="absolute top-24 left-5/6 w-0.5 h-24 bg-gray-300 z-0 hidden md:block"></div>
              
              {/* Flow steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center z-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                    <FileText size={20} className="mr-2 text-lumicoria-purple" />
                    Inputs
                  </h3>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="space-y-2">
                      {componentTypes.inputs.map(input => (
                        <div 
                          key={input.id}
                          onClick={() => setSelectedInput(input)}
                          className={`p-3 rounded-lg cursor-pointer flex items-center transition-all ${
                            selectedInput.id === input.id 
                              ? 'bg-lumicoria-purple/10 border border-lumicoria-purple/30' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-8 h-8 ${input.color} rounded-lg text-white flex items-center justify-center mr-3`}>
                            {input.icon}
                          </div>
                          <span className="font-medium">{input.name}</span>
                        </div>
                      ))}
                      <div className="p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-all">
                        + Add Input
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center z-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                    <Brain size={20} className="mr-2 text-lumicoria-blue" />
                    Processors
                  </h3>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="space-y-2">
                      {componentTypes.processors.map(processor => (
                        <div 
                          key={processor.id}
                          onClick={() => setSelectedProcessor(processor)}
                          className={`p-3 rounded-lg cursor-pointer flex items-center transition-all ${
                            selectedProcessor.id === processor.id 
                              ? 'bg-lumicoria-blue/10 border border-lumicoria-blue/30' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-8 h-8 ${processor.color} rounded-lg text-white flex items-center justify-center mr-3`}>
                            {processor.icon}
                          </div>
                          <span className="font-medium">{processor.name}</span>
                        </div>
                      ))}
                      <div className="p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-all">
                        + Add Processor
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center z-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                    <Layers size={20} className="mr-2 text-lumicoria-orange" />
                    Outputs
                  </h3>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="space-y-2">
                      {componentTypes.outputs.map(output => (
                        <div 
                          key={output.id}
                          onClick={() => setSelectedOutput(output)}
                          className={`p-3 rounded-lg cursor-pointer flex items-center transition-all ${
                            selectedOutput.id === output.id 
                              ? 'bg-lumicoria-orange/10 border border-lumicoria-orange/30' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-8 h-8 ${output.color} rounded-lg text-white flex items-center justify-center mr-3`}>
                            {output.icon}
                          </div>
                          <span className="font-medium">{output.name}</span>
                        </div>
                      ))}
                      <div className="p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-all">
                        + Add Output
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Agent preview */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap size={20} className="mr-2 text-lumicoria-purple" />
                  Your Custom Agent Preview
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className={`w-12 h-12 ${selectedInput.color} rounded-lg text-white flex items-center justify-center`}>
                      {selectedInput.icon}
                    </div>
                    <ArrowRight size={20} className="mx-2 text-gray-400" />
                    <div className={`w-12 h-12 ${selectedProcessor.color} rounded-lg text-white flex items-center justify-center`}>
                      {selectedProcessor.icon}
                    </div>
                    <ArrowRight size={20} className="mx-2 text-gray-400" />
                    <div className={`w-12 h-12 ${selectedOutput.color} rounded-lg text-white flex items-center justify-center`}>
                      {selectedOutput.icon}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex items-center">
                      <Settings size={16} className="mr-2" />
                      Configure
                    </Button>
                    <Button
                      className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white btn-hover-effect"
                      onClick={handleTestAgent}
                    >
                      <span className="flex items-center">
                        {isAnimating ? (
                          <>
                            <span className="animate-pulse">Testing Agent...</span>
                          </>
                        ) : (
                          <>
                            <Zap size={16} className="mr-2" />
                            Test Agent
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
                
                {isAnimating && (
                  <div className="mt-4 p-3 bg-lumicoria-purple/10 rounded-lg text-sm text-center text-lumicoria-purple animate-pulse">
                    Processing data flow... Input → Processor → Output
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center reveal">
            <p className="text-lg text-gray-600 mb-6">
              Build agents that fit your exact needs by connecting components.
              Save, share, and deploy them instantly across your workflow.
            </p>
            <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white btn-hover-effect">
              <span>Start Building Now</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentBuilder;
