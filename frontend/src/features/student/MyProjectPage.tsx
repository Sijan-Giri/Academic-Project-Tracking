import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  ChevronRight,
  UserCheck,
  FolderGit2,
  Crown,
  FileCode2,
  Github,
  AlertTriangle,
  FolderPlus,
  Award,
  MessageSquare,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { useMyProjects } from '@/hooks/useMyProjects';
import { getEvaluations } from '@/api/evaluations.api';
import { unwrapList } from '@/utils/apiUtils';

const STAGES = [
  { id: 'DRAFT', name: 'Draft Proposal' },
  { id: 'ABSTRACT_SUBMITTED', name: 'Abstract Submitted' },
  { id: 'ABSTRACT_APPROVED', name: 'Abstract Approved' },
  { id: 'IN_PROGRESS', name: 'In Progress' },
  { id: 'UNDER_REVIEW', name: 'Under Review' },
  { id: 'COMPLETED', name: 'Completed' },
];

import { ProjectDetailSkeleton } from '@/components/shared/Skeletons';

export default function MyProjectPage() {
  const navigate = useNavigate();
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  const { projects, isLoading } = useMyProjects();

  const project = projects[0] || null;

  const { data: rawEvaluations } = useQuery({
    queryKey: ['project-evaluations', project?.id],
    queryFn: () => getEvaluations({ projectId: project?.id }),
    enabled: Boolean(project?.id),
  });

  const evaluations = unwrapList<any>(rawEvaluations);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={project.title || "Project Details"}
        subtitle={`Domain: ${project.domain || 'General'} • Team: ${project.team?.name || 'Assigned Roster'}`}
      />

      {/* Cancelled / Rejected Banner */}
      {(project.status === 'CANCELLED' || project.status === 'ABSTRACT_REJECTED') && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-900 dark:text-rose-300 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Project Proposal {project.status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}</h4>
              <p className="text-xs mt-1 opacity-90 leading-relaxed max-w-xl font-normal">
                This project proposal has been {project.status === 'CANCELLED' ? 'cancelled' : 'rejected'} by the coordinator. Your team can submit a new project proposal to replace this project.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/my-project/create')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0 rounded-lg text-xs px-4 h-9"
          >
            <FolderPlus className="w-4 h-4 mr-2" /> Propose New Project
          </Button>
        </div>
      )}

      {/* Pending Status Banners */}
      {project.status === 'ABSTRACT_SUBMITTED' && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-900 dark:text-blue-300 p-5 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              Status Pending Coordinator Review
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
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
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 p-5 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              Evaluation & Review Pending
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                In Evaluation
              </span>
            </h4>
            <p className="text-xs mt-1 opacity-90 font-normal">
              Your project is currently under evaluation by the panel and coordinator. Official marks and status will be posted upon review completion.
            </p>
          </div>
        </div>
      )}

      {/* Top Overview Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs transition-colors duration-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {project.domain && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  {project.domain}
                </span>
              )}
              <StatusBadge status={project.status} type="project" />
              {project.plagiarismScore !== undefined && project.plagiarismScore !== null && (
                <span className={cn(
                  'px-2.5 py-0.5 rounded-md text-xs font-semibold border flex items-center gap-1',
                  project.plagiarismScore <= 20
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
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
              <Github className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Repository</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </a>
          )}
        </div>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.keywords.map((kw: string) => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-medium border border-border">
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Abstract Box */}
        <div className="rounded-lg bg-secondary/50 p-4 border border-border border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Abstract & Summary
          </h3>
          <p className="text-foreground leading-relaxed text-sm">
            {showFullAbstract ? project.abstract : `${project.abstract?.substring(0, 180) || ''}${(project.abstract?.length ?? 0) > 180 ? '...' : ''}`}
          </p>
          {(project.abstract?.length ?? 0) > 180 && (
            <Button
              variant="link"
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold mt-2 p-0 h-auto inline-flex items-center gap-1 focus:outline-none"
            >
              {showFullAbstract ? 'Show less' : 'Read full abstract →'}
            </Button>
          )}
        </div>
      </div>

      {/* Guide & Team Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Guide Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Project Guide
              </h3>
              {guideUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> Assigned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Allocation Pending
                </span>
              )}
            </div>

            {guideUser ? (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="w-11 h-11 rounded-lg bg-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                  {guideUser.name?.charAt(0) ?? 'G'}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-foreground font-semibold text-sm">{guideUser.name}</h4>
                  <p className="text-muted-foreground text-xs">
                    {guide.designation ?? 'Faculty Guide'}
                    {guide.department?.name ? ` • ${guide.department.name}` : ''}
                  </p>
                  {guideUser.email && (
                    <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium pt-0.5">{guideUser.email}</p>
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

        {/* Team Members Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Team: <span className="text-indigo-600 dark:text-indigo-400">{project.team?.name || 'My Team'}</span>
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
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

      {/* Lifecycle Progress Card */}
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
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
                    : 'bg-secondary/40 border-border text-muted-foreground'
                )}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs">
                  {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : idx + 1}
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

      {/* Evaluation Results Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                Evaluation Results & Panel Feedback
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold">
                  {evaluations.length} {evaluations.length === 1 ? 'Record' : 'Records'}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground font-normal">Official marks, rubrics, and feedback submitted by review panel evaluators.</p>
            </div>
          </div>
        </div>

        {evaluations.length === 0 ? (
          <div className="p-8 text-center bg-secondary/30 rounded-xl border border-dashed border-border space-y-2">
            <Star className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-semibold text-foreground">No Evaluation Marks Logged Yet</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto font-normal">
              Your presentation scores and evaluator feedback will appear here as soon as panel members finalize your review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((ev: any) => {
              const evalUser = ev.evaluator?.user?.name || ev.evaluator?.name || 'Panel Evaluator';
              const stageName = ev.reviewStage?.name || 'Review Presentation';
              const scoresList: any[] = ev.scores || [];

              return (
                <div key={ev.id} className="rounded-xl border border-border bg-secondary/20 p-5 space-y-4 hover:border-indigo-500/30 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                        {stageName}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Evaluated by: <strong className="text-foreground">{evalUser}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold block">Score</span>
                        <span className="text-lg font-black text-foreground tracking-tight">{ev.totalMarks || 0} pts</span>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-base shadow-sm">
                        {ev.grade || 'F'}
                      </div>
                    </div>
                  </div>

                  {ev.feedback && (
                    <div className="rounded-lg bg-card/60 p-3.5 border border-border text-xs text-foreground space-y-1">
                      <span className="text-muted-foreground font-semibold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Panel Feedback:
                      </span>
                      <p className="italic font-normal pl-5 text-slate-300">"{ev.feedback}"</p>
                    </div>
                  )}

                  {scoresList.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Rubric Score Breakdown</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {scoresList.map((s: any) => (
                          <div key={s.id} className="p-2.5 rounded-lg bg-card/80 border border-border text-xs flex justify-between items-start gap-2">
                            <div>
                              <p className="font-semibold text-foreground">{s.criteria?.name || 'Criterion'}</p>
                              {s.remarks && <p className="text-[10px] text-muted-foreground italic mt-0.5">{s.remarks}</p>}
                            </div>
                            <span className="font-bold text-indigo-400 shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                              {s.marks} marks
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/my-project/abstract')}
          className="p-5 h-auto rounded-xl border border-border bg-card hover:bg-secondary text-left transition-all group flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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
