import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CheckCircle2, Github, Users, GraduationCap, Loader2 } from 'lucide-react';

import { useProjectDetail } from '@/hooks/useProjectDetail';
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

import { ProjectDetailSkeleton } from '@/components/shared/Skeletons';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [activeTab, useStateTab] = useState('overview');

  const { project, isLoading, reviewAbstract, updateProjectStatus, isReviewing, isUpdatingStatus } = useProjectDetail(id || '');
  const isStatusChanging = isReviewing || isUpdatingStatus;

  const ABSTRACT_REVIEW_STATUSES = ['ABSTRACT_APPROVED', 'ABSTRACT_REJECTED', 'REVISION_NEEDED'];

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (ABSTRACT_REVIEW_STATUSES.includes(newStatus)) {
        const defaultComments = `Abstract ${newStatus.toLowerCase().replace(/_/g, ' ')} by coordinator`;
        await reviewAbstract({ status: newStatus, comments: defaultComments });
      } else {
        await updateProjectStatus(newStatus);
      }
    } catch (_) {}
  };

  if (isLoading) return <ProjectDetailSkeleton />;
  if (!project || !project.id) return <div className="p-8 text-muted-foreground font-normal">Project not found.</div>;

  const isCoordinatorOrAdmin = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';
  const guideUser = project.guideAssignment?.facultyProfile?.user;
  const guideInfo = project.guideAssignment?.facultyProfile;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>
      </div>

      {/* Header card with status changer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-brand-subtle text-brand border border-brand text-xs font-semibold">
              {project.domain || 'General'}
            </span>
            <StatusBadge status={project.status} type="project" />
            {isStatusChanging && (
              <span className="px-2.5 py-0.5 rounded-md bg-warning-subtle text-warning-md border border-warning text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-warning" />
                Pending Status Update...
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{project.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Change selector for Coordinator & Admin */}
          {isCoordinatorOrAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {isStatusChanging ? 'Updating Status...' : 'Change Status:'}
              </span>
              <Select
                value={project.status}
                onValueChange={handleStatusChange}
                disabled={isStatusChanging}
              >
                <SelectTrigger className="w-[190px] bg-card border-input text-foreground font-semibold text-xs h-9 disabled:opacity-75">
                  {isStatusChanging ? (
                    <span className="flex items-center gap-2 text-brand font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating Status...
                    </span>
                  ) : (
                    <SelectValue placeholder="Select status" />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {STATUS_OPTIONS.map((st) => (
                    <SelectItem key={st} value={st} className="text-xs font-medium">
                      {st.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {project.githubLink && (
            <Button variant="outline" className="btn-outline shrink-0 gap-2" asChild>
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 text-brand" /> Repository
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={useStateTab} className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start rounded-xl p-1 h-auto mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 px-5 rounded-lg text-xs font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 px-5 rounded-lg text-xs font-semibold">Milestones</TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 px-5 rounded-lg text-xs font-semibold">Submissions</TabsTrigger>
          <TabsTrigger value="evaluations" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 px-5 rounded-lg text-xs font-semibold">Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-semibold">Project Abstract</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm font-normal">{project.abstract || 'No abstract provided.'}</p>
                {project.keywords?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border">
                    {project.keywords.map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium border border-border">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Team Details */}
              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand" /> Team Roster
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="font-semibold text-foreground pb-2 border-b border-border flex justify-between items-center text-sm">
                    <span>{project.team?.name || 'Unnamed Team'}</span>
                    {project.team?.status && <StatusBadge status={project.team.status} type="team" />}
                  </div>
                  {project.team?.members?.map((m: any) => {
                    const memberUser = m.studentProfile?.user;
                    return (
                      <div key={m.id} className="flex justify-between items-center text-xs">
                        <span className="text-foreground font-semibold">{memberUser?.name || 'Unknown'}</span>
                        {m.isLeader && <span className="text-[10px] bg-warning-subtle text-warning-md border border-warning px-2 py-0.5 rounded-md font-bold">Leader</span>}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Guide Details */}
              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand" /> Assigned Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {guideUser ? (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {guideUser.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{guideUser.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">{guideInfo?.designation || 'Faculty Guide'}</p>
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-success-subtle text-success-md border border-success text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-xs font-normal">No faculty guide assigned yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0">
          <Card>
            <CardHeader className="border-b border-border pb-3"><CardTitle className="text-base font-semibold">Project Milestones</CardTitle></CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {project.milestones?.length ? project.milestones.map((m: any) => (
                  <div key={m.id} className="p-4 bg-secondary/50 rounded-lg border border-border flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">{m.description}</p>
                    </div>
                    <StatusBadge status={m.status} type="milestone" />
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-8 text-xs font-normal">No milestones defined yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-0">
          <Card>
            <CardHeader className="border-b border-border pb-3"><CardTitle className="text-base font-semibold">Document Submissions</CardTitle></CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {(project as any).submissions?.length ? (project as any).submissions.map((sub: any) => (
                  <div key={sub.id} className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-brand" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">{sub.title}</p>
                        <p className="text-xs text-muted-foreground font-normal">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {sub.fileUrl && (
                      <Button variant="outline" size="sm" className="btn-outline text-xs" asChild>
                        <a href={sub.fileUrl} target="_blank" rel="noreferrer"><Download className="w-3.5 h-3.5 mr-1.5"/> Download</a>
                      </Button>
                    )}
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-8 text-xs font-normal">No submissions uploaded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-0">
          <Card>
            <CardHeader className="border-b border-border pb-3"><CardTitle className="text-base font-semibold">Panel Evaluations</CardTitle></CardHeader>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-center py-8 text-xs font-normal">No evaluation records found for this project.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
