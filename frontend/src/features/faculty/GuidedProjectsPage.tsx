import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, MessageSquare, FileText, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGuidedProjects } from '@/api/projects.api';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';

export default function GuidedProjectsPage() {
  const navigate = useNavigate();
  const { data: rawProjects, isLoading } = useQuery({ queryKey: ['guided-projects'], queryFn: getGuidedProjects });
  const projects: any[] = Array.isArray((rawProjects as any)?.data?.items)
    ? (rawProjects as any).data.items
    : (Array.isArray((rawProjects as any)?.data) ? (rawProjects as any).data : (Array.isArray(rawProjects) ? rawProjects : []));

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedbackText, setFeedbackText] = useState('');

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendFeedback = (teamName: string) => {
    if (!feedbackText.trim()) return;
    toast.success(`Feedback sent to team ${teamName}`);
    setFeedbackText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Guided Projects"
        subtitle="Manage student teams you are actively mentoring, review submissions, and provide guidance."
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search guided projects by title or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card border-input text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 input-field">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-secondary/50" />
              <CardContent className="h-32 bg-secondary/30 mt-2" />
            </Card>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((p: any) => (
            <Card key={p.id} className="flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
              <CardHeader className="border-b border-border pb-3">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold">
                    {p.domain || 'General'}
                  </span>
                  <StatusBadge status={p.status || 'IN_PROGRESS'} type="project" />
                </div>
                <CardTitle className="text-base font-semibold text-foreground line-clamp-2 leading-snug">{p.title}</CardTitle>
              </CardHeader>

              <CardContent className="py-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Mentored Team</p>
                  <p className="font-semibold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {p.team?.name || 'Unassigned'}
                    <span className="text-xs text-muted-foreground font-normal">({p.team?.members?.length || 0} members)</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Current Milestone</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-xs text-foreground">{p.currentMilestone?.name || 'Active Progress'}</span>
                    {p.currentMilestone?.status && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-semibold text-muted-foreground">
                        {p.currentMilestone.status}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/coordinator/projects/${p.id}`)}
                  className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground hover:text-indigo-600 hover:bg-secondary text-xs font-semibold"
                >
                  <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Details</span>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground hover:text-indigo-600 hover:bg-secondary text-xs font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Feedback</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border text-foreground">
                    <DialogHeader>
                      <DialogTitle className="text-base font-semibold">Provide Mentor Feedback</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <p className="text-xs text-muted-foreground">
                        This feedback notification will be sent to members of <strong>{p.team?.name || 'this team'}</strong>.
                      </p>
                      <Textarea
                        placeholder="Type guidance, review notes, or requested corrections..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="input-field min-h-[120px]"
                      />
                      <Button onClick={() => handleSendFeedback(p.team?.name || 'Team')} className="btn-primary w-full">
                        Send Feedback
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/coordinator/projects/${p.id}`)}
                  className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground hover:text-emerald-600 hover:bg-secondary text-xs font-semibold"
                >
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Submissions</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full border border-border bg-card shadow-xs rounded-xl p-12 text-center">
            <EmptyState icon={BookOpen} title="No Guided Projects Found" description="No assigned projects match your search or filter parameters." />
          </div>
        )}
      </div>
    </div>
  );
}
