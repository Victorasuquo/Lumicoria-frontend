import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Bot, FileText, Calendar, Heart, Activity, Settings, Plus, ArrowUpRight } from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';

const agents = [
  {
    id: 'document-agent',
    name: 'Document Agent',
    status: 'active',
    icon: FileText,
    tasks: 12,
    completed: 8,
    lastActive: '2 minutes ago'
  },
  {
    id: 'meeting-assistant',
    name: 'Meeting Assistant',
    status: 'idle',
    icon: Calendar,
    tasks: 5,
    completed: 5,
    lastActive: '1 hour ago'
  },
  {
    id: 'wellbeing-coach',
    name: 'Well-being Coach',
    status: 'active',
    icon: Heart,
    tasks: 3,
    completed: 1,
    lastActive: 'Just now'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'document',
    description: 'Processed invoice.pdf',
    agent: 'Document Agent',
    time: '2 minutes ago',
    icon: FileText
  },
  {
    id: 2,
    type: 'meeting',
    description: 'Created action items from team meeting',
    agent: 'Meeting Assistant',
    time: '1 hour ago',
    icon: Calendar
  },
  {
    id: 3,
    type: 'wellbeing',
    description: 'Scheduled break reminder',
    agent: 'Well-being Coach',
    time: '2 hours ago',
    icon: Heart
  }
];

const metrics = [
  {
    title: 'Active Agents',
    value: '3/5',
    icon: Bot,
    trend: '+1',
    color: 'text-green-500'
  },
  {
    title: 'Tasks Completed',
    value: '14',
    icon: Activity,
    trend: '+5',
    color: 'text-blue-500'
  },
  {
    title: 'Documents Processed',
    value: '28',
    icon: FileText,
    trend: '+12',
    color: 'text-purple-500'
  },
  {
    title: 'Well-being Score',
    value: '85%',
    icon: Heart,
    trend: '+5%',
    color: 'text-pink-500'
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user data - replace with actual user data from your auth context
  const user = {
    full_name: 'John Doe',
    email: 'john@example.com',
    avatar_url: null
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your AI agents.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
          <ProfileMenu user={user} />
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    <span className={`ml-2 text-sm ${metric.color}`}>{metric.trend}</span>
                  </div>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Agents</CardTitle>
              <CardDescription>Monitor and manage your AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-lumicoria-purple/10 rounded-lg">
                        <agent.icon className="w-6 h-6 text-lumicoria-purple" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{agent.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm text-gray-600">
                            {agent.status === 'active' ? 'Active' : 'Idle'} • {agent.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {agent.completed}/{agent.tasks} tasks completed
                        </div>
                        <Progress value={(agent.completed / agent.tasks) * 100} className="w-24 h-2" />
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions from your AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <activity.icon className="w-5 h-5 text-lumicoria-purple mt-1" />
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <span>{activity.agent}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Process New Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Check Well-being Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bot className="w-4 h-4 mr-2" />
                  Create New Agent
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="text-sm text-green-500">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm text-gray-900">120ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm text-gray-900">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm text-gray-900">1,234</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 