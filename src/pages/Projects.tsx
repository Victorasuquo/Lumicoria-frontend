import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectApi, Project, ProjectCreateData } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, FolderOpen, CalendarDays, CheckCircle2, Circle, Clock, Loader2, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    'Not Started': { label: 'Not Started', color: 'bg-gray-100 text-gray-600', icon: <Circle className="w-3 h-3" /> },
    'In Progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> },
    'Completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
    'On Hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> },
};

const PROJECT_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#06b6d4', '#f59e0b', '#ef4444',
];

const EMPTY_FORM: ProjectCreateData = {
    title: '',
    description: '',
    due_date: '',
    status: 'Not Started',
    color: '#6366f1',
};

const Projects: React.FC = () => {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<ProjectCreateData>(EMPTY_FORM);

    const load = async () => {
        setLoading(true);
        try {
            const data = await projectApi.list();
            setProjects(data);
        } catch {
            toast({ title: 'Failed to load projects', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setCreating(true);
        try {
            const newProject = await projectApi.create(form);
            setProjects(prev => [newProject, ...prev]);
            setDialogOpen(false);
            setForm(EMPTY_FORM);
            toast({ title: 'Project created 🎉' });
        } catch {
            toast({ title: 'Failed to create project', variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await projectApi.delete(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            toast({ title: 'Project deleted' });
        } catch {
            toast({ title: 'Failed to delete project', variant: 'destructive' });
        }
    };

    const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG['Not Started'];

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage your work and track progress</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <PlusCircle className="w-4 h-4" /> New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Create a new project</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-2">
                            <div>
                                <Label htmlFor="p-title">Project Name *</Label>
                                <Input
                                    id="p-title"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="My Awesome Project"
                                    className="mt-1 rounded-xl"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="p-desc">Description</Label>
                                <Textarea
                                    id="p-desc"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="What is this project about?"
                                    className="mt-1 rounded-xl resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Status</Label>
                                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                        <SelectTrigger className="mt-1 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {Object.keys(STATUS_CONFIG).map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="p-due">Due Date</Label>
                                    <Input
                                        id="p-due"
                                        type="date"
                                        value={form.due_date || ''}
                                        onChange={e => setForm({ ...form, due_date: e.target.value })}
                                        className="mt-1 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Project Color</Label>
                                <div className="flex gap-2 mt-2">
                                    {PROJECT_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setForm({ ...form, color: c })}
                                            className={cn(
                                                "w-7 h-7 rounded-full transition-all",
                                                form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating || !form.title.trim()} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</> : 'Create Project'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-44 rounded-3xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No projects yet</h3>
                    <p className="text-gray-500 mb-6">Create your first project to start tracking work</p>
                    <Button onClick={() => setDialogOpen(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <PlusCircle className="w-4 h-4" /> Create first project
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => {
                        const cfg = statusCfg(project.status);
                        const completedTasks = project.tasks.filter(t => t.status === 'Completed').length;
                        const totalTasks = project.tasks.length;
                        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                        return (
                            <div
                                key={project.id}
                                className="group bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 flex flex-col relative overflow-hidden"
                            >
                                {/* Color bar */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                                    style={{ backgroundColor: project.color }}
                                />

                                <div className="flex items-start justify-between mt-1">
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                                        style={{ backgroundColor: project.color + '22', color: project.color }}
                                    >
                                        {project.title.charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="font-semibold text-gray-900 mt-3 truncate">{project.title}</h3>
                                {project.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                                )}

                                <div className="flex items-center gap-2 mt-4">
                                    <span className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium", cfg.color)}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                    {project.due_date && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <CalendarDays className="w-3 h-3" />
                                            {new Date(project.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    )}
                                </div>

                                {totalTasks > 0 && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>{completedTasks}/{totalTasks} tasks</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%`, backgroundColor: project.color }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <Button variant="ghost" size="sm" className="rounded-xl text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 h-7 px-2 text-xs gap-1">
                                        Open <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Projects;
