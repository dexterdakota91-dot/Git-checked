import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  MoreVertical,
  ChevronRight,
  Filter,
  ArrowUpCircle,
  AlertTriangle,
  Calendar,
  X
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Task, 
  TaskPriority, 
  TaskCategory, 
  Project 
} from '../types';
import { cn } from '@/lib/utils';
import { LoadingIndicator } from './LoadingIndicator';
import { suggestTasks } from '../services/gemini';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface TaskManagementProps {
  project: Project;
  onUpdateTasks: (tasks: Task[]) => void;
}

export function TaskManagement({ project, onUpdateTasks }: TaskManagementProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [filter, setFilter] = useState<TaskCategory | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'technical',
    estimatedHours: 0,
    progress: 0,
    status: 'pending'
  });

  const tasks = project.tasks || [];

  const handleAddTask = () => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    } as Task;
    
    onUpdateTasks([...tasks, task]);
    setIsAddTaskOpen(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'technical',
      estimatedHours: 0,
      progress: 0,
      status: 'pending'
    });
  };

  const handleSuggestTasks = async () => {
    setIsSuggesting(true);
    try {
      const suggested = await suggestTasks(project.name, project.description, project.status);
      const newTasks: Task[] = suggested.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending' as Task['status'],
        progress: 0
      }));
      onUpdateTasks([...tasks, ...newTasks]);
    } catch (error) {
      console.error("Error suggesting tasks:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const canCompleteTask = (task: Task) => {
    if (!task.prerequisites || task.prerequisites.length === 0) return true;
    return task.prerequisites.every(prereq => {
      const prereqTask = tasks.find(t => t.title === prereq);
      return prereqTask && prereqTask.status === 'completed';
    });
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (status === 'completed' && task && !canCompleteTask(task)) {
      alert("Please complete all prerequisites before marking this task as done.");
      return;
    }
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status, progress: status === 'completed' ? 100 : t.progress } : t
    );
    onUpdateTasks(updatedTasks as Task[]);
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { 
        ...t, 
        progress, 
        status: (progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending') as Task['status']
      } : t
    );
    onUpdateTasks(updatedTasks as Task[]);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'low': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-primary" size={18} />;
      case 'in-progress': return <Clock className="text-blue-500 animate-pulse" size={18} />;
      case 'blocked': return <AlertTriangle className="text-red-500" size={18} />;
      default: return <Circle className="text-muted-foreground" size={18} />;
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Operational Roadmap</h2>
          <p className="text-muted-foreground">Manage and track your venture's critical path</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSuggesting ? (
              <div className="flex items-center gap-1 text-primary animate-pulse">
                <Sparkles size={14} /> AI is working...
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Waiting for user input
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-primary/20 text-primary hover:bg-primary/10"
              onClick={handleSuggestTasks}
              disabled={isSuggesting}
            >
              {isSuggesting ? (
                <LoadingIndicator icon={Sparkles} size={16} className="mr-2" />
              ) : (
                <Sparkles size={16} className="mr-2" />
              )}
              AI Task Architect
            </Button>
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger nativeButton={true} render={
                <Button className="electric-glow">
                  <Plus size={16} className="mr-2" /> Add Task
                </Button>
              } />
              <DialogContent className="aetheris-card border-none max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>Define a new operational milestone for your venture.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title</label>
                    <input 
                      className="w-full bg-secondary border border-border rounded-md p-2 text-sm"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="e.g., Register Domain Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea 
                      className="w-full bg-secondary border border-border rounded-md p-2 text-sm min-h-[80px]"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Describe the task details..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                      <select 
                        className="w-full bg-secondary border border-border rounded-md p-2 text-sm"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                      <select 
                        className="w-full bg-secondary border border-border rounded-md p-2 text-sm"
                        value={newTask.category}
                        onChange={(e) => setNewTask({...newTask, category: e.target.value as TaskCategory})}
                      >
                        <option value="legal">Legal</option>
                        <option value="technical">Technical</option>
                        <option value="marketing">Marketing</option>
                        <option value="financial">Financial</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Hours</label>
                    <input 
                      type="number"
                      className="w-full bg-secondary border border-border rounded-md p-2 text-sm"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
                  <Button className="electric-glow" onClick={handleAddTask} disabled={!newTask.title}>
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'legal', 'technical', 'marketing', 'financial', 'operations'].map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(cat as any)}
            className={cn(
              "capitalize",
              filter === cat ? "electric-glow" : "text-muted-foreground"
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <Card className="aetheris-card border-dashed border-accent/20 bg-accent/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Filter className="text-muted-foreground" size={24} />
              </div>
              <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                Use the AI Task Architect to generate a roadmap or add your first task manually.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="aetheris-card group hover:bg-accent/5 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                    className="mt-1 hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger nativeButton={false} render={
                              <h4 className={cn(
                                "font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors",
                                task.status === 'completed' && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </h4>
                            } />
                            <DialogContent className="aetheris-card border-none max-w-2xl">
                              <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-tighter px-1.5 py-0", getPriorityColor(task.priority))}>
                                    {task.priority} Priority
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter px-1.5 py-0">
                                    {task.category}
                                  </Badge>
                                </div>
                                <DialogTitle className="text-2xl font-bold font-display">{task.title}</DialogTitle>
                                <DialogDescription className="text-muted-foreground pt-2">
                                  {task.description}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid grid-cols-2 gap-6 py-6 border-y border-accent/10">
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Status</p>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status)}
                                    <span className="capitalize text-sm font-medium">{task.status?.replace('-', ' ') || 'Unknown'}</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Estimated Effort</p>
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock size={14} className="text-primary" />
                                    <span>{task.estimatedHours || 0} Hours</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Current Progress</p>
                                  <div className="flex items-center gap-3">
                                    <Progress value={task.progress} className="h-2 flex-1" />
                                    <span className="text-sm font-mono">{task.progress}%</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Due Date</p>
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar size={14} className="text-primary" />
                                    <span>{task.dueDate || 'No date set'}</span>
                                  </div>
                                </div>
                                {task.prerequisites && task.prerequisites.length > 0 && (
                                  <div className="col-span-2 space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Prerequisites</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                      {task.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              <DialogFooter className="pt-4 flex items-center justify-end gap-2">
                                <DialogClose className={buttonVariants({ variant: 'outline' })}>
                                  Cancel
                                </DialogClose>
                                <DialogClose className={buttonVariants({ variant: 'outline' })} onClick={() => updateTaskStatus(task.id, 'blocked')}>
                                  Mark Blocked
                                </DialogClose>
                                <DialogClose 
                                  className={cn(buttonVariants({ variant: 'default' }), "electric-glow")}
                                  onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                >
                                  {task.status === 'completed' ? 'Mark as Incomplete' : 'Mark Task as Done'}
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-tighter px-1.5 py-0", getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span className="capitalize">{task.category}</span>
                        </div>
                        {task.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedHours}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Tag({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
