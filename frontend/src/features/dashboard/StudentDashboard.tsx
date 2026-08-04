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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
            Student Dashboard
          </h1>
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">Track your project progress, team, and milestone deadlines</p>
        </div>
        {!currentProject && (
          <Button onClick={() => navigate('/my-project/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
            <FileText className="w-4 h-4 mr-2" /> Create Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Project Status" value={currentProject?.status ? <StatusBadge status={currentProject.status} type="project" /> : 'No Project'} icon={<FileText className="text-indigo-500 dark:text-indigo-400" />} />
        <StatsCard title="Current Milestone" value={inProgressMilestone?.name || 'None'} icon={<Circle className="text-violet-500 dark:text-violet-400" />} />
        <StatsCard 
          title="Next Deadline" 
          value={nearestDeadline ? `${differenceInDays(new Date(nearestDeadline.deadline), new Date())} days left` : 'No Deadlines'} 
          icon={<Clock className="text-blue-500 dark:text-blue-400" />} 
        />
        <StatsCard title="Faculty Guide" value={currentProject?.guideAssignment?.facultyProfile?.user?.name || currentProject?.guide?.name || 'Unassigned'} icon={<Calendar className="text-emerald-500 dark:text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Project Lifecycle Progress</CardTitle>
              {currentProject && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-project')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                  View Details
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-violet-500/30 before:to-slate-300 dark:before:to-slate-800">
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
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 dark:border-[#0f1117] border-slate-50 shrink-0 z-10 ${isDone ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-600 animate-pulse' : 'dark:bg-slate-800 bg-slate-200'}`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 dark:text-white/40 text-slate-400" />}
                      </div>
                      <div className="flex-1 p-3 rounded-xl dark:bg-white/5 dark:border-white/10 bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span className={`font-medium ${isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : isDone ? 'dark:text-gray-300 text-slate-700' : 'dark:text-gray-500 text-slate-400'}`}>{stage}</span>
                        {isDone && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>}
                        {isCurrent && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            currentProject?.status === 'ABSTRACT_APPROVED'
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10'
                              : 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10'
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Team Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-team')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                Manage Team
              </Button>
            </CardHeader>
            <CardContent>
              {team && team.id ? (
                <div className="flex justify-between items-center dark:bg-white/5 bg-slate-50 p-4 rounded-xl border dark:border-white/5 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 dark:bg-indigo-500/20 bg-indigo-100 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white text-slate-900">{team.name}</h3>
                      <p className="text-xs dark:text-slate-400 text-slate-500">{team.members?.length || 1} Member(s)</p>
                    </div>
                  </div>
                  <StatusBadge status={team.status} type="team" />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="dark:text-slate-400 text-slate-500 mb-3">You are not part of any team yet.</p>
                  <Button onClick={() => navigate('/my-team')} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Create or Join Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="dark:text-slate-400 text-slate-500 text-sm text-center py-4">No pending deadlines.</p>
              ) : (
                upcomingDeadlines.slice(0, 5).map((m: any) => {
                  const days = differenceInDays(new Date(m.deadline), new Date());
                  const color = days < 0 
                    ? 'text-rose-600 dark:text-red-400 bg-rose-100 dark:bg-red-500/10' 
                    : days < 3 
                    ? 'text-amber-700 dark:text-yellow-400 bg-amber-100 dark:bg-yellow-500/10' 
                    : 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10';
                  return (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-lg dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
                      <span className="font-medium text-sm dark:text-gray-200 text-slate-800">{m.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${color}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Announcements</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length === 0 ? (
                <p className="dark:text-slate-400 text-slate-500 text-sm text-center py-4">No recent announcements.</p>
              ) : (
                announcements.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="border-b dark:border-white/10 border-slate-200 pb-3 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-300 text-sm">{a.title}</h4>
                    <p className="text-xs dark:text-slate-400 text-slate-500 mb-1">
                      {formatDistanceToNow(new Date(a.createdAt || a.date || Date.now()), { addSuffix: true })}
                    </p>
                    <p className="text-xs dark:text-slate-300 text-slate-700 line-clamp-2">{a.content}</p>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium dark:text-slate-400 text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold dark:text-white text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
