import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, Calendar, Users, FileText } from 'lucide-react';
import { getMyProjects } from '@/api/projects.api';
import { getMyTeam } from '@/api/teams.api';
import { getAnnouncements } from '@/api/announcements.api';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';

const STAGES = [
  'Abstract Submission',
  'Abstract Approved',
  'Review 1',
  'Review 2',
  'Review 3',
  'Pre-Submission',
  'Final Submission'
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  const { data: projectsRes } = useQuery({ queryKey: ['my-projects'], queryFn: getMyProjects });
  const { data: teamRes } = useQuery({ queryKey: ['my-team'], queryFn: getMyTeam });
  const { data: announcementsRes } = useQuery({ queryKey: ['announcements'], queryFn: () => getAnnouncements() });

  // Safe unwrapping
  const projectList = Array.isArray((projectsRes as any)?.data?.items)
    ? (projectsRes as any).data.items
    : (Array.isArray((projectsRes as any)?.data) ? (projectsRes as any).data : (Array.isArray(projectsRes) ? projectsRes : []));

  const currentProject = projectList[0] || null;

  const team = (teamRes as any)?.data || teamRes;

  const announcements = Array.isArray((announcementsRes as any)?.data?.items)
    ? (announcementsRes as any).data.items
    : (Array.isArray((announcementsRes as any)?.data) ? (announcementsRes as any).data : (Array.isArray(announcementsRes) ? announcementsRes : []));

  const milestones = currentProject?.milestones || [];
  const inProgressMilestone = milestones.find((m: any) => m.status === 'IN_PROGRESS' || m.status === 'NOT_STARTED');

  const upcomingDeadlines = milestones
    .filter((m: any) => m.status !== 'APPROVED' && m.status !== 'COMPLETED' && m.deadline)
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const nearestDeadline = upcomingDeadlines[0];

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
            Student Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track your project progress, team, and milestone deadlines</p>
        </div>
        {!currentProject && (
          <Button onClick={() => navigate('/my-project/create')} className="bg-indigo-600 hover:bg-indigo-700">
            <FileText className="w-4 h-4 mr-2" /> Create Project
          </Button>
        )}
      </div>

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Project Status" value={currentProject?.status ? <StatusBadge status={currentProject.status} type="project" /> : 'No Project'} icon={<FileText className="text-indigo-400" />} />
        <StatsCard title="Current Milestone" value={inProgressMilestone?.name || 'None'} icon={<Circle className="text-violet-400" />} />
        <StatsCard 
          title="Next Deadline" 
          value={nearestDeadline ? `${differenceInDays(new Date(nearestDeadline.deadline), new Date())} days left` : 'No Deadlines'} 
          icon={<Clock className="text-blue-400" />} 
        />
        <StatsCard title="Faculty Guide" value={currentProject?.guideAssignment?.facultyProfile?.user?.name || currentProject?.guide?.name || 'Unassigned'} icon={<Calendar className="text-emerald-400" />} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lifecycle Timeline Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base font-semibold">Project Lifecycle Progress</CardTitle>
              {currentProject && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-project')} className="text-indigo-400 hover:text-indigo-300">
                  View Details
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-violet-500/30 before:to-slate-800">
                {STAGES.map((stage, i) => {
                  const statusMap: Record<string, number> = {
                    DRAFT: 0,
                    ABSTRACT_SUBMITTED: 0,
                    ABSTRACT_APPROVED: 1,
                    ABSTRACT_REJECTED: 0,
                    IN_PROGRESS: 2,
                    UNDER_REVIEW: 3,
                    COMPLETED: 6,
                    CANCELLED: 0,
                  };
                  const currentStatusIndex = statusMap[currentProject?.status || 'DRAFT'] ?? 0;
                  const isDone = i < currentStatusIndex;
                  const isCurrent = i === currentStatusIndex;

                  return (
                    <div key={stage} className="relative flex items-center justify-start gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1117] shrink-0 z-10 ${isDone ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'}`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-white/40" />}
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <span className={`font-medium ${isCurrent ? 'text-indigo-400 font-bold' : isDone ? 'text-gray-300' : 'text-gray-500'}`}>{stage}</span>
                        {isDone && <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>}
                        {isCurrent && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            currentProject?.status === 'ABSTRACT_APPROVED'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-indigo-400 bg-indigo-500/10'
                          }`}>
                            {currentProject?.status === 'ABSTRACT_APPROVED' ? 'Approved' : 'Current Stage'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Team Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base font-semibold">Team Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-team')} className="text-indigo-400 hover:text-indigo-300">
                Manage Team
              </Button>
            </CardHeader>
            <CardContent>
              {team && team.id ? (
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                      <p className="text-xs text-slate-400">{team.members?.length || 1} Member(s)</p>
                    </div>
                  </div>
                  <StatusBadge status={team.status} type="team" />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 mb-3">You are not part of any team yet.</p>
                  <Button onClick={() => navigate('/my-team')} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Create or Join Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Deadlines Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base font-semibold">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No pending deadlines.</p>
              ) : (
                upcomingDeadlines.slice(0, 5).map((m: any) => {
                  const days = differenceInDays(new Date(m.deadline), new Date());
                  const color = days < 0 ? 'text-red-400 bg-red-500/10' : days < 3 ? 'text-yellow-400 bg-yellow-500/10' : 'text-emerald-400 bg-emerald-500/10';
                  return (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="font-medium text-sm text-gray-200">{m.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${color}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Announcements Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base font-semibold">Announcements</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')} className="text-indigo-400 hover:text-indigo-300">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No recent announcements.</p>
              ) : (
                announcements.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-indigo-300 text-sm">{a.title}</h4>
                    <p className="text-xs text-slate-400 mb-1">
                      {formatDistanceToNow(new Date(a.createdAt || a.date || Date.now()), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-2">{a.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
