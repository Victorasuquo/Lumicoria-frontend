import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText as FileTextIcon, Image as ImageIcon, File as FileIcon, Settings2, Upload, Camera as CameraIcon, PlusCircle, Clock, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { documentApi, Document, projectApi, Project } from '@/services/api';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'On Hold': 'bg-amber-100 text-amber-700',
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [projLoading, setProjLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, []);

  const loadDocuments = async () => {
    setDocsLoading(true);
    try {
      const data = await documentApi.getDocuments();
      setDocuments(data);
    } catch (err) {
      // Silently fail — user may have no documents yet
    } finally {
      setDocsLoading(false);
    }
  };

  const loadProjects = async () => {
    setProjLoading(true);
    try {
      const data = await projectApi.list();
      setProjects(data);
    } catch (err) {
      // Silently fail
    } finally {
      setProjLoading(false);
    }
  };

  const handleUploadDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.click();

    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setUploadLoading(true);
        try {
          const result = await documentApi.uploadDocument(file);
          setDocuments(prev => [result.document, ...prev]);
          toast({ title: 'Document uploaded', description: `${file.name} has been processed` });
        } catch {
          toast({ title: 'Upload failed', description: 'Could not upload document.', variant: 'destructive' });
        } finally {
          setUploadLoading(false);
        }
      }
    };
  };

  const firstName = user ? (user as any).full_name?.split(' ')[0] || 'there' : 'there';

  const Skeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-gray-500">Your AI agents are ready to assist you today.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 rounded-xl bg-gray-100 p-1">
          <TabsTrigger value="documents" className="rounded-lg">Documents</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg">Projects</TabsTrigger>
          <TabsTrigger value="agents" className="rounded-lg">Agents</TabsTrigger>
          <TabsTrigger value="capture" className="rounded-lg">Capture</TabsTrigger>
        </TabsList>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — tab content */}
          <div className="lg:col-span-2">

            {/* ── Documents Tab ─────────────────────────────── */}
            <TabsContent value="documents" className="space-y-4">
              {docsLoading ? (
                <Skeleton />
              ) : documents.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                  <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No documents yet</h3>
                  <p className="text-gray-500 text-sm mb-5">Upload a PDF, image or document to get started</p>
                  <Button onClick={handleUploadDocument} disabled={uploadLoading} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Upload className="mr-2 h-4 w-4" /> Upload Document
                  </Button>
                </div>
              ) : (
                documents.map(doc => (
                  <Card key={doc.id} className="overflow-hidden rounded-2xl border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between p-4">
                      <div className="flex items-start space-x-3">
                        <div className="cursor-pointer rounded-xl bg-indigo-50 p-2.5">
                          {(doc as any).file_type?.includes('pdf') ? (
                            <FileTextIcon className="h-6 w-6 text-indigo-600" />
                          ) : (doc as any).file_type?.includes('image') ? (
                            <ImageIcon className="h-6 w-6 text-indigo-600" />
                          ) : (
                            <FileIcon className="h-6 w-6 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{(doc as any).name || (doc as any).title}</h3>
                          <p className="text-sm text-gray-500">
                            {(doc as any).file_type} • {new Date((doc as any).created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent>
                      <div className="flex justify-between pt-2 text-sm text-gray-500">
                        <div>Extracted items: <strong className="text-gray-700">{(doc as any).extracted_items ?? '—'}</strong></div>
                        <div>Tasks created: <strong className="text-gray-700">{(doc as any).tasks_created ?? '—'}</strong></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {uploadLoading && (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
                </div>
              )}
            </TabsContent>

            {/* ── Projects Tab ───────────────────────────────── */}
            <TabsContent value="projects" className="space-y-4">
              {projLoading ? (
                <Skeleton />
              ) : projects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                  <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No projects yet</h3>
                  <p className="text-gray-500 text-sm mb-5">Create a project to track your work</p>
                  <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link to="/projects"><PlusCircle className="mr-2 h-4 w-4" />Create Project</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {projects.slice(0, 4).map(project => (
                      <div
                        key={project.id}
                        className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: project.color }} />
                        <h3 className="font-semibold text-gray-900 truncate mt-1">{project.title}</h3>
                        <span className={cn("inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600')}>
                          {project.status}
                        </span>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                          <span>{project.tasks.length} tasks</span>
                          {project.due_date && <span>{new Date(project.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {projects.length > 4 && (
                    <Button variant="outline" asChild className="w-full rounded-xl">
                      <Link to="/projects">View all {projects.length} projects <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  )}
                </>
              )}
            </TabsContent>

            {/* ── Agents Tab ─────────────────────────────────── */}
            <TabsContent value="agents">
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Agent Management</h3>
                <p className="mb-4 text-gray-500 text-sm">Configure and manage your AI agents</p>
                <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link to="/agents">Go to Agents Universe</Link>
                </Button>
              </div>
            </TabsContent>

            {/* ── Capture Tab ────────────────────────────────── */}
            <TabsContent value="capture">
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                <CameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Capture Content</h3>
                <p className="mb-4 text-gray-500 text-sm">Use your camera to capture documents and information</p>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                  <CameraIcon className="mr-2 h-4 w-4" /> Open Camera
                </Button>
              </div>
            </TabsContent>
          </div>

          {/* Right column — Quick Actions + Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-xl" onClick={handleUploadDocument} disabled={uploadLoading}>
                  <Upload className="mr-2 h-4 w-4 text-indigo-500" /> Upload Document
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  <CameraIcon className="mr-2 h-4 w-4 text-indigo-500" /> Scan with Camera
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                  <Link to="/projects"><PlusCircle className="mr-2 h-4 w-4 text-indigo-500" /> Create Project</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                  <Link to="/agents">Browse Agent Universe</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Documents', value: docsLoading ? '…' : documents.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Projects', value: projLoading ? '…' : projects.length, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Agents', value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Active', value: projLoading ? '…' : projects.filter(p => p.status === 'In Progress').length, color: 'text-green-600', bg: 'bg-green-50' },
                ].map(stat => (
                  <div key={stat.label} className={cn("rounded-2xl p-4 text-center", stat.bg)}>
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Well-being */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Well-being</h2>
                <Button variant="link" className="h-auto p-0 text-indigo-600" asChild>
                  <Link to="/wellbeing">View all</Link>
                </Button>
              </div>
              <Card className="rounded-2xl border-gray-100">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Next break in:</span>
                    <span className="font-semibold text-green-600">12 min</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">70% of your focus session done</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;