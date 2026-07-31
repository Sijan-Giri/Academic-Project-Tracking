import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, FileText, CheckCircle2, User, Github } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import { getProject, updateProjectStatus } from '@/api/projects.api';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/auth.store';

const STATUS_OPTIONS = [
  'DRAFT',
  'ABSTRACT_SUBMITTED',
  'ABSTRACT_APPROVED',
  'ABSTRACT_REJECTED',
  'IN_PROGRESS',
  'UNDER_REVIEW',
  'COMPLETED',
  'CANCELLED',
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: projectRes, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => updateProjectStatus(id!, newStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Project status updated successfully!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update status'),
  });

  const raw = projectRes as any;
  const project = raw?.data ?? raw;

  if (isLoading) return <div className="p-8 text-white">Loading project details...</div>;
  if (!project || !project.id) return <div className="p-8 text-white">Project not found.</div>;

  const isCoordinatorOrAdmin = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';
  const guideUser = project.guideAssignment?.facultyProfile?.user;
  const guideInfo = project.guideAssignment?.facultyProfile;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      {/* Header card with status changer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
              {project.domain || 'General'}
            </span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Change selector for Coordinator & Admin */}
          {isCoordinatorOrAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Change Status:</span>
              <Select
                value={project.status}
                onValueChange={(val) => statusMutation.mutate(val)}
                disabled={statusMutation.isPending}
              >
                <SelectTrigger className="w-[200px] bg-black/40 border-white/20 text-white font-medium text-xs h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                  {STATUS_OPTIONS.map((st) => (
                    <SelectItem key={st} value={st} className="text-xs">
                      {st.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(project.githubLink || project.githubUrl) && (
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300" asChild>
              <a href={project.githubLink || project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" /> Repository
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border-white/10 w-full justify-start rounded-xl p-1 h-auto mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Milestones</TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Submissions</TabsTrigger>
          <TabsTrigger value="evaluations" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Abstract</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{project.abstract || 'No abstract provided.'}</p>
                {project.keywords?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.keywords.map((kw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 text-gray-300 text-xs border border-white/10">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Team Details */}
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Team Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-medium text-indigo-400 pb-2 border-b border-white/10 flex justify-between items-center">
                    <span>{project.team?.name || 'Unnamed Team'}</span>
                    {project.team?.status && <StatusBadge status={project.team.status} type="team" />}
                  </div>
                  {project.team?.members?.map((m: any) => {
                    const memberUser = m.studentProfile?.user;
                    return (
                      <div key={m.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-200">{memberUser?.name || 'Unknown'}</span>
                        {m.isLeader && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">Leader</span>}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Guide Details */}
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Guide Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {guideUser ? (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                        {guideUser.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{guideUser.name}</p>
                        <p className="text-xs text-gray-400">{guideInfo?.designation || 'Faculty'}</p>
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Assigned
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No guide assigned yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle className="text-lg">Project Milestones</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones?.length ? project.milestones.map((m: any) => (
                  <div key={m.id} className="p-4 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white text-sm">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.description}</p>
                    </div>
                    <StatusBadge status={m.status} type="milestone" />
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8 text-sm">No milestones defined yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-0">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle className="text-lg">Document Submissions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.submissions?.length ? project.submissions.map((sub: any) => (
                  <div key={sub.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-indigo-400" />
                      <div>
                        <p className="font-medium text-sm text-white">{sub.title}</p>
                        <p className="text-xs text-gray-400">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {sub.fileUrl && (
                      <Button variant="outline" size="sm" className="border-white/10 text-xs" asChild>
                        <a href={sub.fileUrl} target="_blank" rel="noreferrer"><Download className="w-3.5 h-3.5 mr-1.5"/> Download</a>
                      </Button>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8 text-sm">No submissions uploaded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-0">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle className="text-lg">Panel Evaluations</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8 text-sm">No evaluation records found for this project.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
