import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, MessageSquare, FileText } from 'lucide-react';
import { getGuidedProjects } from '@/api/projects.api';

export default function GuidedProjectsPage() {
  const { data: projects = [] } = useQuery({ queryKey: ['guided-projects'], queryFn: getGuidedProjects });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          My Guided Projects
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-400 text-slate-400" />
            <Input 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p: any) => (
          <Card key={p.id} className="flex flex-col dark:hover:border-indigo-500/50 hover:border-indigo-400 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge className="dark:bg-indigo-500/20 dark:text-indigo-400 bg-indigo-100 text-indigo-700">{p.domain}</Badge>
                <Badge className="dark:bg-slate-800 dark:text-slate-300 bg-slate-100 text-slate-700">{p.status}</Badge>
              </div>
              <CardTitle className="text-xl line-clamp-2 leading-tight">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div>
                <p className="text-sm dark:text-slate-400 text-slate-500">Team</p>
                <p className="font-medium dark:text-white text-slate-900">{p.team?.name} <span className="dark:text-slate-500 text-slate-400 text-xs">({p.team?.members?.length || 0} members)</span></p>
              </div>
              <div>
                <p className="text-sm dark:text-slate-400 text-slate-500">Current Milestone</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-medium text-violet-600 dark:text-violet-300">{p.currentMilestone?.name || 'None'}</span>
                  <Badge variant="outline" className="dark:border-violet-500/30 dark:text-violet-400 text-violet-700 border-violet-300 text-xs py-0">
                    {p.currentMilestone?.status || 'N/A'}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2 border-t dark:border-white/10 border-slate-200 pt-4">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 dark:text-slate-400 text-slate-600 hover:text-indigo-600 dark:hover:text-white dark:hover:bg-white/5 hover:bg-slate-100">
                <Eye className="w-4 h-4" />
                <span className="text-xs">Details</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 dark:text-slate-400 text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 hover:bg-indigo-50">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Feedback</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm dark:text-slate-400 text-slate-600">This will be sent as a notification to the students of team <strong>{p.team?.name}</strong>.</p>
                    <Textarea placeholder="Enter your feedback here..." className="min-h-[120px]" />
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white">
                      Send Feedback
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 dark:text-slate-400 text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 hover:bg-emerald-50">
                <FileText className="w-4 h-4" />
                <span className="text-xs">Submissions</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center dark:text-slate-500 text-slate-400 font-medium">
            No projects found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
