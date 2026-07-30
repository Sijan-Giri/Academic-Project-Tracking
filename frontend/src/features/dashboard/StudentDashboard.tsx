import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { getMyProjects } from '@/api/projects.api';
import { getMyTeam } from '@/api/teams.api';
import { getAnnouncements } from '@/api/announcements.api';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

const STAGES = [
  'Abstract Submission',
  'Abstract Approval',
  'Proposal',
  'Mid-Term Review',
  'Implementation',
  'Pre-Final Review',
  'Final Submission'
];

export default function StudentDashboard() {
  const { data: projects = [] } = useQuery({ queryKey: ['my-projects'], queryFn: getMyProjects });
  const { data: team } = useQuery({ queryKey: ['my-team'], queryFn: getMyTeam });
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: getAnnouncements });

  const currentProject = projects[0] || null;
  const milestones = currentProject?.milestones || [];
  const inProgressMilestone = milestones.find((m: any) => m.status === 'IN_PROGRESS');
  
  const upcomingDeadlines = milestones
    .filter((m: any) => m.status !== 'COMPLETED' && m.deadline)
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const nearestDeadline = upcomingDeadlines[0];

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
        Student Dashboard
      </h1>

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Project Status" value={currentProject?.status || 'No Project'} icon={<CheckCircle2 className="text-indigo-400" />} />
        <StatsCard title="Current Milestone" value={inProgressMilestone?.name || 'None'} icon={<Circle className="text-violet-400" />} />
        <StatsCard 
          title="Next Deadline" 
          value={nearestDeadline ? `${differenceInDays(new Date(nearestDeadline.deadline), new Date())} days` : 'None'} 
          icon={<Clock className="text-blue-400" />} 
        />
        <StatsCard title="Guide" value={currentProject?.guide?.name || 'Not Assigned'} icon={<Calendar className="text-emerald-400" />} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle>Project Lifecycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300/20 before:to-transparent">
                {STAGES.map((stage, i) => {
                  const isDone = i < 3; // mock logic
                  const isCurrent = i === 3; // mock logic
                  return (
                    <div key={stage} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f1117] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-colors ${isDone ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-white/50" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className={`font-bold ${isCurrent ? 'text-indigo-400' : 'text-slate-300'}`}>{stage}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Team Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent>
              {team ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{team.name}</h3>
                    <p className="text-slate-400">{team.members?.length || 0} Members</p>
                  </div>
                  <Badge className="bg-indigo-500/20 text-indigo-400">{team.status}</Badge>
                </div>
              ) : (
                <p className="text-slate-400">Not part of a team yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Deadlines Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-slate-400">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((m: any) => {
                  const days = differenceInDays(new Date(m.deadline), new Date());
                  const color = days < 0 ? 'text-red-400' : days < 3 ? 'text-yellow-400' : 'text-emerald-400';
                  return (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="font-medium">{m.name}</span>
                      <span className={`text-sm font-bold ${color}`}>{days}d</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Announcements Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-semibold text-indigo-300">{a.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">{formatDistanceToNow(new Date(a.date))} ago</p>
                  <p className="text-sm text-slate-300 line-clamp-2">{a.content}</p>
                </div>
              ))}
              {announcements.length > 3 && (
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium w-full text-center mt-2">
                  View All
                </button>
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
