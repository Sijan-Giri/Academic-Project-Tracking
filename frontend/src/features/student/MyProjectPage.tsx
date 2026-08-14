import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, ExternalLink, ShieldAlert, GraduationCap, ChevronRight, UserCheck, FolderGit2, Crown, FileCode2, Github, AlertTriangle, FolderPlus } from 'lucide-react';
import { Button, StatusBadge, PageHeader, ProjectDetailSkeleton } from '@/components';
import { cn } from '@/lib';
import { useMyProjects } from '@/hooks';

const STAGES = [
  { id: 'DRAFT', name: 'Draft Proposal' },
  { id: 'ABSTRACT_SUBMITTED', name: 'Abstract Submitted' },
  { id: 'ABSTRACT_APPROVED', name: 'Abstract Approved' },
  { id: 'IN_PROGRESS', name: 'In Progress' },
  { id: 'UNDER_REVIEW', name: 'Under Review' },
  { id: 'COMPLETED', name: 'Completed' },
];

export default function MyProjectPage() {
  const navigate = useNavigate();
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const { projects, isLoading } = useMyProjects();

  const project = projects[0] || null;

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader title="Project Details" subtitle="View and track your capstone project deliverables." />
        <div className="flex flex-col items-center justify-center min-h-[45vh] bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-4">
            <FolderGit2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No Active Project Proposal</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6 font-normal">
            You have not created a project proposal yet. Make sure your team is approved before submitting.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/my-team')} variant="outline">
              Check Team Status
            </Button>
            <Button onClick={() => navigate('/my-project/create')} className="btn-primary">
              Propose Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const guideAssignment = project.guideAssignment;
  const guide = guideAssignment?.facultyProfile;
  const guideUser = guide?.user;

  const statusToStageMap: Record<string, number> = {
    DRAFT: 0,
    ABSTRACT_SUBMITTED: 1,
    ABSTRACT_APPROVED: 2,
    IN_PROGRESS: 3,
    UNDER_REVIEW: 4,
    COMPLETED: 5,
  };
  const currentStageIndex = statusToStageMap[project.status] ?? 0;

  return (
    <div className="space-y-6">
      {}
      <PageHeader
        title={project.title || "Project Details"}
        subtitle={`Domain: ${project.domain || 'General'} • Team: ${project.team?.name || 'Assigned Roster'}`}
      />

      {}
      {(project.status === 'CANCELLED' || project.status === 'ABSTRACT_REJECTED') && (
        <div className="rounded-xl bg-danger-subtle border border-danger text-danger-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-danger mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Project Proposal {project.status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}</h4>
              <p className="text-xs mt-1 opacity-90 leading-relaxed max-w-xl font-normal">
                This project proposal has been {project.status === 'CANCELLED' ? 'cancelled' : 'rejected'} by the coordinator. Your team can submit a new project proposal to replace this project.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/my-project/create')}
            className="bg-danger-solid text-white font-semibold shrink-0 rounded-lg text-xs px-4 h-9"
          >
            <FolderPlus className="w-4 h-4 mr-2" /> Propose New Project
          </Button>
        </div>
      )}

      {}
      {project.status === 'ABSTRACT_SUBMITTED' && (
        <div className="rounded-xl bg-info-subtle border border-info text-info-md p-5 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-info-subtle flex items-center justify-center text-info shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              Status Pending Coordinator Review
              <span className="px-2 py-0.5 rounded-md bg-info-subtle text-info-md text-[11px] font-bold uppercase tracking-wider">
                Pending Approval
              </span>
            </h4>
            <p className="text-xs mt-1 opacity-90 font-normal">
              Your project proposal abstract has been submitted and is currently pending review and status approval by the coordinator.
            </p>
          </div>
        </div>
      )}

      {project.status === 'UNDER_REVIEW' && (
        <div className="rounded-xl bg-warning-subtle border border-warning text-warning-md p-5 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-warning-subtle flex items-center justify-center text-warning shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              Evaluation & Review Pending
              <span className="px-2 py-0.5 rounded-md bg-warning-subtle text-warning-md text-[11px] font-bold uppercase tracking-wider">
                In Evaluation
              </span>
            </h4>
            <p className="text-xs mt-1 opacity-90 font-normal">
              Your project is currently under review by the panel and coordinator. Official status will be updated upon review completion.
            </p>
          </div>
        </div>
      )}

      {}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs transition-colors duration-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {project.domain && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-subtle text-brand border border-brand">
                  {project.domain}
                </span>
              )}
              <StatusBadge status={project.status} type="project" />
              {project.plagiarismScore !== undefined && project.plagiarismScore !== null && (
                <span className={cn(
                  'px-2.5 py-0.5 rounded-md text-xs font-semibold border flex items-center gap-1',
                  project.plagiarismScore <= 20
                    ? 'bg-success-subtle text-success-md border-success'
                    : 'bg-warning-subtle text-warning-md border-warning'
                )}>
                  <ShieldAlert className="w-3.5 h-3.5" /> Plagiarism: {project.plagiarismScore}%
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
              {project.title}
            </h1>
          </div>

          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="btn-outline shrink-0 gap-2"
            >
              <Github className="w-4 h-4 text-brand" />
              <span>Repository</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </a>
          )}
        </div>

        {}
        {project.keywords && project.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.keywords.map((kw: string) => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium border border-border">
                #{kw}
              </span>
            ))}
          </div>
        )}

        {}
        <div className="rounded-lg bg-secondary/50 p-4 border border-border border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand" /> Abstract & Summary
          </h3>
          <p className="text-foreground leading-relaxed text-sm">
            {showFullAbstract ? project.abstract : `${project.abstract?.substring(0, 180) || ''}${(project.abstract?.length ?? 0) > 180 ? '...' : ''}`}
          </p>
          {(project.abstract?.length ?? 0) > 180 && (
            <Button
              variant="link"
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="text-brand hover:underline text-xs font-semibold mt-2 p-0 h-auto inline-flex items-center gap-1 focus:outline-none"
            >
              {showFullAbstract ? 'Show less' : 'Read full abstract →'}
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand" />
                Project Guide
              </h3>
              {guideUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-success-subtle text-success-md border border-success text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> Assigned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-warning-subtle text-warning-md border border-warning text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Allocation Pending
                </span>
              )}
            </div>

            {guideUser ? (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="w-11 h-11 rounded-lg bg-brand-subtle text-brand font-bold text-base flex items-center justify-center shrink-0">
                  {guideUser.name?.charAt(0) ?? 'G'}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-foreground font-semibold text-sm">{guideUser.name}</h4>
                  <p className="text-muted-foreground text-xs">
                    {guide.designation ?? 'Faculty Guide'}
                    {guide.department?.name ? ` • ${guide.department.name}` : ''}
                  </p>
                  {guideUser.email && (
                    <p className="text-brand text-xs font-medium pt-0.5">{guideUser.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center p-4 rounded-lg bg-secondary/30 border border-border">
                <Clock className="w-8 h-8 text-amber-500 mb-2 opacity-70" />
                <p className="text-foreground font-semibold text-sm">No Guide Assigned Yet</p>
                <p className="text-muted-foreground text-xs mt-0.5 max-w-xs font-normal">
                  The project coordinator will allocate a faculty mentor for your project.
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-brand" />
              Team: <span className="text-brand">{project.team?.name || 'My Team'}</span>
            </h3>
            {project.team && <StatusBadge status={project.team.status} type="team" />}
          </div>

          <div className="space-y-2">
            {project.team?.members?.map((m: any) => {
              const u = m.studentProfile?.user;
              const isLeader = m.isLeader;
              return (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-secondary text-foreground font-semibold text-xs flex items-center justify-center border border-border">
                      {u?.name?.charAt(0) ?? 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {u?.name ?? 'Team Member'}
                        {isLeader && (
                          <span className="text-[10px] font-bold bg-brand-subtle text-brand border border-brand px-2 py-0.5 rounded-md">
                            Leader
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{u?.email ?? m.studentProfile?.studentId}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <h3 className="text-base font-semibold text-foreground mb-4">Evaluation Stage Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map((stg, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={stg.id}
                className={cn(
                  'p-3 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 transition-all',
                  isPassed
                    ? 'bg-success-subtle border-success text-success-md'
                    : isCurrent
                    ? 'bg-brand-subtle border-brand text-brand'
                    : 'bg-secondary/40 border-border text-muted-foreground'
                )}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs">
                  {isPassed ? <CheckCircle2 className="w-4 h-4 text-success" /> : idx + 1}
                </div>
                <p className="text-xs font-semibold line-clamp-2">{stg.name}</p>
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  {isPassed ? 'Passed' : isCurrent ? 'Active' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>



      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/my-project/abstract')}
          className="p-5 h-auto rounded-xl border border-border bg-card hover:bg-secondary text-left transition-all group flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-brand">
              <FileCode2 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="w-full">
            <h4 className="text-sm font-semibold text-foreground mb-0.5">Abstract Proposal</h4>
            <p className="text-xs text-muted-foreground font-normal">View or copy project abstract details.</p>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/my-project/milestones')}
          className="p-5 h-auto rounded-xl border border-border bg-card hover:bg-secondary text-left transition-all group flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-brand">
              <Clock className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="w-full">
            <h4 className="text-sm font-semibold text-foreground mb-0.5">Milestone Tracker</h4>
            <p className="text-xs text-muted-foreground font-normal">Check deadlines and submit deliverables.</p>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/my-project/submissions')}
          className="p-5 h-auto rounded-xl border border-border bg-card hover:bg-secondary text-left transition-all group flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-brand">
              <FileText className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="w-full">
            <h4 className="text-sm font-semibold text-foreground mb-0.5">Submissions Archive</h4>
            <p className="text-xs text-muted-foreground font-normal">Review uploaded project documents & history.</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
