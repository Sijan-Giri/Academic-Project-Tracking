import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Github, Crown, ExternalLink, ChevronRight, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { getMyProjects } from '@/api/project.api';
import { cn } from '@/lib/utils';

export default function MyProjectPage() {
  const navigate = useNavigate();
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const { data: projectResponse, isLoading } = useQuery({
    queryKey: ['my-project'],
    queryFn: getMyProjects
  });

  const project = projectResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-white/5 rounded-xl border border-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-32 bg-white/5 rounded-xl border border-white/10" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">No Project Yet</h2>
        <p className="text-gray-400 mb-8 max-w-md">Create your final year project to get started. You can form a team, choose a domain, and start your academic journey.</p>
        <Button onClick={() => navigate('/my-project/create')} size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20">
          Create Project
        </Button>
      </div>
    );
  }

  const stages = ['Abstract Submission', 'Abstract Review', 'Guide Assignment', 'Requirements', 'Design', 'Implementation', 'Final Submission'];
  const currentStageIndex = stages.findIndex(s => s === (project.currentStage || 'Abstract Submission'));

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
                {project.domain}
              </span>
              <StatusBadge status={project.status} />
            </div>
            <h1 className="text-3xl font-bold text-white">{project.title}</h1>
          </div>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors border border-white/10">
              <Github className="w-5 h-5" />
              <span>Repository</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-50" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.keywords?.map((kw: string) => (
            <span key={kw} className="px-2.5 py-1 rounded-md bg-white/5 text-gray-300 text-xs border border-white/5">
              {kw}
            </span>
          ))}
        </div>

        <div className="bg-black/20 rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Abstract</h3>
          <p className="text-gray-300 leading-relaxed text-sm">
            {showFullAbstract ? project.abstract : `${project.abstract?.substring(0, 150) || ''}${project.abstract?.length > 150 ? '...' : ''}`}
          </p>
          {project.abstract?.length > 150 && (
            <button onClick={() => setShowFullAbstract(!showFullAbstract)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-2 focus:outline-none">
              {showFullAbstract ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guide Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Project Guide
            </h3>
            {project.guide ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {project.guide.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">{project.guide.name}</h4>
                  <p className="text-gray-400 text-sm">{project.guide.designation} • {project.guide.department}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Assigned
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Clock className="w-10 h-10 text-orange-400/50 mb-3" />
                <p className="text-gray-300 font-medium">No guide assigned</p>
                <p className="text-gray-500 text-sm mt-1">A faculty guide will be assigned soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-indigo-400" />
              Team: {project.team?.name || 'Unnamed Team'}
            </h3>
            {project.team && <StatusBadge status={project.team.status} />}
          </div>
          <div className="space-y-3">
            {project.team?.members?.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      {member.name}
                      {member.isLeader && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                    </p>
                    <p className="text-gray-500 text-xs">{member.rollNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lifecycle Progress */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-6">Project Lifecycle</h3>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
          <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%` }} />
          <div className="relative flex justify-between">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex flex-col items-center group">
                  <div className={cn("w-4 h-4 rounded-full border-2 mb-2 z-10 transition-colors", 
                    isPast ? "bg-indigo-500 border-indigo-500" : 
                    isCurrent ? "bg-violet-600 border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : 
                    "bg-gray-800 border-gray-600"
                  )} />
                  <span className={cn("text-xs font-medium text-center max-w-[80px] hidden md:block", 
                    isPast ? "text-gray-300" : 
                    isCurrent ? "text-indigo-300" : 
                    "text-gray-600"
                  )}>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white" onClick={() => navigate('/student/abstract')}>
          <FileText className="w-6 h-6 text-indigo-400" />
          <span>View Abstract</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white" onClick={() => navigate('/student/milestones')}>
          <Activity className="w-6 h-6 text-violet-400" />
          <span>View Milestones</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white" onClick={() => navigate('/student/submissions')}>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span>Submissions</span>
        </Button>
      </div>
    </div>
  );
}
