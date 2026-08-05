import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Github, Crown, ExternalLink, FileText, CheckCircle2, Clock, Activity, ArrowRight, ShieldAlert, Sparkles, FolderGit2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { getMyProjects } from '@/api/projects.api';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';

export default function MyProjectPage() {
  const navigate = useNavigate();
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const { data: projectResponse, isLoading } = useQuery({
    queryKey: ['my-project'],
    queryFn: getMyProjects
  });

  const raw = projectResponse as any;
  const projectList: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const project = projectList[0] ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 dark:bg-white/5 bg-slate-200/60 rounded-2xl border dark:border-white/10 border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 dark:bg-white/5 bg-slate-200/60 rounded-2xl border dark:border-white/10 border-slate-200" />
          <div className="h-44 dark:bg-white/5 bg-slate-200/60 rounded-2xl border dark:border-white/10 border-slate-200" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-md rounded-3xl p-8 lg:p-12 text-center">
        <div className="w-24 h-24 dark:bg-indigo-500/20 bg-indigo-50 border dark:border-indigo-500/30 border-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <GraduationCap className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-extrabold dark:text-white text-slate-900 mb-3 tracking-tight">No Active Project</h2>
        <p className="dark:text-gray-400 text-slate-500 mb-8 max-w-lg text-base leading-relaxed">
          Create your final year project to get started. You can register your project title, choose a domain, form a team, and track your milestone progress.
        </p>
        <Button
          onClick={() => navigate('/my-project/create')}
          size="lg"
          className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 px-8 py-6 rounded-xl text-base"
        >
          <Sparkles className="w-5 h-5 mr-2" /> Create Project Now
        </Button>
      </div>
    );
  }

  const guide = project.guideAssignment?.facultyProfile;
  const guideUser = guide?.user;

  const stages = ['Abstract Submission', 'Abstract Review', 'Guide Assignment', 'Review 1', 'Review 2', 'Pre-Submission', 'Final Submission'];
  const statusToStageMap: Record<string, number> = {
    DRAFT: 0,
    ABSTRACT_SUBMITTED: 1,
    ABSTRACT_APPROVED: 2,
    ABSTRACT_REJECTED: 1,
    IN_PROGRESS: 3,
    UNDER_REVIEW: 4,
    COMPLETED: 6,
    CANCELLED: 0,
  };
  const currentStageIndex = statusToStageMap[project.status] ?? 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="My Capstone Project"
        subtitle="Manage your project details, track review milestones, and monitor guide feedback."
      />

      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              {project.domain && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                  {project.domain}
                </span>
              )}
              <StatusBadge status={project.status} type="project" />
              {project.plagiarismScore !== undefined && project.plagiarismScore !== null && (
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1',
                  project.plagiarismScore <= 20
                    ? 'dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 bg-amber-50 text-amber-700 border-amber-200'
                )}>
                  <ShieldAlert className="w-3 h-3" /> Plagiarism: {project.plagiarismScore}%
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-tight">
              {project.title}
            </h1>
          </div>

          {(project.githubLink || project.githubUrl) && (
            <a
              href={project.githubLink ?? project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/10 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl dark:text-gray-200 text-slate-800 text-sm font-semibold transition-all shadow-xs shrink-0"
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
              <span key={kw} className="px-3 py-1 rounded-lg dark:bg-white/5 dark:text-gray-300 dark:border-white/10 bg-slate-100/80 text-slate-700 text-xs font-medium border border-slate-200/70">
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Abstract Box */}
        <div className="rounded-2xl dark:bg-black/20 bg-slate-50 p-5 md:p-6 border dark:border-white/5 border-slate-200/80 border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 text-slate-500 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Project Abstract
          </h3>
          <p className="dark:text-gray-300 text-slate-700 leading-relaxed text-sm">
            {showFullAbstract ? project.abstract : `${project.abstract?.substring(0, 180) || ''}${project.abstract?.length > 180 ? '...' : ''}`}
          </p>
          {project.abstract?.length > 180 && (
            <button
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-bold mt-2.5 inline-flex items-center gap-1 focus:outline-none"
            >
              {showFullAbstract ? 'Show less' : 'Read full abstract →'}
            </button>
          )}
        </div>
      </div>

      {/* Guide & Team Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Guide Card */}
        <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Project Guide
              </h3>
              {guideUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> Assigned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Pending Allocation
                </span>
              )}
            </div>

            {guideUser ? (
              <div className="flex items-start gap-4 p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200/70">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-500/20 shrink-0">
                  {guideUser.name?.charAt(0) ?? 'G'}
                </div>
                <div className="space-y-1">
                  <h4 className="dark:text-white text-slate-900 font-bold text-lg leading-tight">{guideUser.name}</h4>
                  <p className="dark:text-gray-400 text-slate-500 text-sm font-medium">
                    {guide.designation ?? 'Faculty Guide'}
                    {guide.department?.name ? ` • ${guide.department.name}` : ''}
                  </p>
                  {guideUser.email && (
                    <p className="dark:text-indigo-400 text-indigo-600 text-xs font-semibold pt-1">{guideUser.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200/70">
                <Clock className="w-10 h-10 dark:text-amber-400/60 text-amber-500/70 mb-3 animate-pulse" />
                <p className="dark:text-gray-200 text-slate-800 font-bold text-base">No Guide Assigned Yet</p>
                <p className="dark:text-gray-400 text-slate-500 text-xs mt-1 max-w-xs">
                  The project coordinator will allocate a faculty mentor for your project soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Team Members Card */}
        <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-7 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Team: <span className="text-indigo-600 dark:text-indigo-400">{project.team?.name || 'My Team'}</span>
            </h3>
            {project.team && <StatusBadge status={project.team.status} type="team" />}
          </div>

          <div className="space-y-3">
            {project.team?.members?.map((member: any) => {
              const memberUser = member.studentProfile?.user;
              const displayName = memberUser?.name ?? 'Student Member';
              const rollNumber = member.studentProfile?.studentId ?? '';
              return (
                <div key={member.id} className="flex items-center justify-between p-3.5 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200/70 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-300 font-extrabold flex items-center justify-center text-sm border border-indigo-200/60 dark:border-indigo-500/30">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="dark:text-white text-slate-900 text-sm font-bold flex items-center gap-1.5">
                        {displayName}
                        {member.isLeader && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            <Crown className="w-3 h-3 mr-0.5 text-amber-500" /> Leader
                          </span>
                        )}
                      </p>
                      {rollNumber && <p className="dark:text-gray-400 text-slate-500 text-xs font-medium">{rollNumber}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Lifecycle Stepper */}
      <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight">Project Lifecycle Progress</h3>
            <p className="dark:text-gray-400 text-slate-500 text-xs mt-1 font-medium">Track your team's progression across official academic milestones.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-300 bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            Stage {Math.min(currentStageIndex + 1, stages.length)} of {stages.length}
          </span>
        </div>

        <div className="relative pt-2 pb-6 px-2">
          {/* Track background */}
          <div className="absolute top-7 left-6 right-6 h-1 dark:bg-white/10 bg-slate-200 rounded-full" />
          
          {/* Progress bar line */}
          <div
            className="absolute top-7 left-6 h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 92}%` }}
          />

          {/* Stepper nodes */}
          <div className="relative flex justify-between items-start">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex flex-col items-center group text-center max-w-[90px]">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-300',
                      isPast
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 animate-pulse'
                        : 'dark:bg-[#14161f] bg-white dark:border-white/20 border-slate-300 text-slate-400'
                    )}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : isCurrent ? (
                      <Activity className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold mt-3 transition-colors line-clamp-2',
                      isPast
                        ? 'dark:text-emerald-400 text-emerald-700 font-bold'
                        : isCurrent
                        ? 'dark:text-indigo-300 text-indigo-700 font-extrabold'
                        : 'dark:text-gray-500 text-slate-400'
                    )}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/my-project/abstract')}
          className="group cursor-pointer rounded-2xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl dark:bg-indigo-500/20 bg-indigo-50 border dark:border-indigo-500/30 border-indigo-100 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold dark:text-white text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Project Abstract
              </h4>
              <p className="text-xs dark:text-gray-400 text-slate-500 font-medium mt-0.5">View or edit abstract</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 dark:text-gray-400 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/my-project/milestones')}
          className="group cursor-pointer rounded-2xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl dark:bg-violet-500/20 bg-violet-50 border dark:border-violet-500/30 border-violet-100 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold dark:text-white text-slate-900 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Milestones
              </h4>
              <p className="text-xs dark:text-gray-400 text-slate-500 font-medium mt-0.5">Track deliverables</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 dark:text-gray-400 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/my-project/submissions')}
          className="group cursor-pointer rounded-2xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl dark:bg-emerald-500/20 bg-emerald-50 border dark:border-emerald-500/30 border-emerald-100 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold dark:text-white text-slate-900 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Submissions
              </h4>
              <p className="text-xs dark:text-gray-400 text-slate-500 font-medium mt-0.5">Upload documents</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 dark:text-gray-400 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}
