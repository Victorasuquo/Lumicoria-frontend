import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, ImageIcon, FileIcon, Settings2, Upload, CameraIcon, PlusCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  date: string;
  extractedItems: number;
  tasksCreated: number;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  source?: string;
  agent?: string;
}

const mockDocuments: DocumentItem[] = [
  {
    id: '1',
    title: 'Q2 Project Proposal',
    type: 'PDF',
    date: '15 May 2025',
    extractedItems: 3,
    tasksCreated: 2
  },
  {
    id: '2',
    title: 'Client Meeting Notes',
    type: 'Image',
    date: '14 May 2025',
    extractedItems: 5,
    tasksCreated: 4
  },
  {
    id: '3',
    title: 'Invoice #2458',
    type: 'PDF',
    date: '12 May 2025',
    extractedItems: 2,
    tasksCreated: 1
  },
  {
    id: '4',
    title: 'Team Roadmap',
    type: 'Document',
    date: '10 May 2025',
    extractedItems: 7,
    tasksCreated: 5
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review Q2 Project Proposal',
    dueDate: 'Today',
    status: 'high',
    source: 'document scan'
  },
  {
    id: '2',
    title: 'Follow up with client about invoice',
    dueDate: 'Tomorrow',
    status: 'medium',
    agent: 'Client Follow-Up Agent'
  },
  {
    id: '3',
    title: 'Team meeting preparation',
    dueDate: 'May 17',
    status: 'medium',
    source: 'calendar event'
  },
  {
    id: '4',
    title: 'Submit project timeline',
    dueDate: 'May 20',
    status: 'low',
    source: 'document scan'
  },
];

const activityItems = [
  {
    id: '1',
    description: 'Document Agent processed "Q2 Project Proposal"',
    time: '2 minutes ago'
  },
  {
    id: '2',
    description: 'Created 3 tasks from meeting notes',
    time: '1 hour ago'
  },
  {
    id: '3',
    description: 'Well-being reminder: Time for a short break',
    time: '2 hours ago'
  },
  {
    id: '4',
    description: 'Document Agent extracted data from invoice',
    time: '3 hours ago'
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [tasks] = useState<Task[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.click();

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setIsLoading(true);

        setTimeout(() => {
          const newDocument: DocumentItem = {
            id: Date.now().toString(),
            title: file.name,
            type: file.type.includes('pdf') ? 'PDF' :
              file.type.includes('image') ? 'Image' : 'Document',
            date: new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            extractedItems: Math.floor(Math.random() * 5) + 1,
            tasksCreated: Math.floor(Math.random() * 3) + 1
          };

          setDocuments([newDocument, ...documents]);
          setIsLoading(false);

          toast({
            title: 'Document uploaded successfully',
            description: `${file.name} has been processed`
          });
        }, 2000);
      }
    };
  };

  const formatTaskStatus = (status: string) => {
    switch (status) {
      case 'high':
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Today</span>;
      case 'medium':
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Tomorrow</span>;
      case 'low':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">May 17</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-gray-600">Your AI agents are ready to assist you today.</p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="capture">Capture</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Documents List */}
        <div className="lg:col-span-2">
          <TabsContent value="documents" className="space-y-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-start space-x-3">
                    <div className="cursor-pointer rounded-lg bg-purple-100 p-2">
                      {doc.type === 'PDF' ? (
                        <FileTextIcon className="h-6 w-6 text-purple-600" />
                      ) : doc.type === 'Image' ? (
                        <ImageIcon className="h-6 w-6 text-purple-600" />
                      ) : (
                        <FileIcon className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.type} • {doc.date}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent>
                  <div className="flex justify-between pt-2 text-sm">
                    <div>
                      Extracted items: <strong>{doc.extractedItems}</strong>
                    </div>
                    <div>
                      Tasks created: <strong>{doc.tasksCreated}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents">
            <div className="p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">Agent Management</h3>
              <p className="mb-4 text-gray-600">Configure and manage your AI agents</p>
              <Button asChild>
                <Link to="/agents">Go to Agents Universe</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="capture">
            <div className="p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">Capture Content</h3>
              <p className="mb-4 text-gray-600">
                Use your camera to capture documents and information
              </p>
              <Button>
                <CameraIcon className="mr-2 h-4 w-4" />
                Open Camera
              </Button>
            </div>
          </TabsContent>
        </div>

        {/* Right Column - Quick Actions and Tasks */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleUploadDocument}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CameraIcon className="mr-2 h-4 w-4" />
                Scan with Camera
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Custom Agent
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/agents">Browse Agent Universe</Link>
              </Button>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Upcoming Tasks</h2>
            <div className="space-y-3">
              {mockTasks.map((task) => (
                <div key={task.id} className="rounded-lg border bg-white p-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    {formatTaskStatus(task.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Created from {task.source || 'by ' + task.agent}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Button variant="link" className="h-auto p-0">
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {activityItems.map((item) => (
                <div key={item.id} className="rounded-lg border bg-white p-3">
                  <p className="text-sm">{item.description}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Well-being Status */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Well-being</h2>
              <Button variant="link" className="h-auto p-0">
                View all
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3">
                  <span className="font-medium">Next break in:</span>
                  <span className="ml-2 font-medium text-green-600">12 minutes</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: '70%' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;