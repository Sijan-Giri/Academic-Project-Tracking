import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Calendar, CheckSquare, Clock } from 'lucide-react';
import { getGuidedProjects } from '@/api/projects';
import { getMySchedules } from '@/api/schedules';
import { format } from 'date-fns';

export default function FacultyDashboard() {
  const { data: guidedProjects = [] } = useQuery({ queryKey: ['guided-projects'], queryFn: getGuidedProjects });
  const { data: schedules = [] } = useQuery({ queryKey: ['my-schedules'], queryFn: getMySchedules });

  // Mock stats
  const stats = {
    guided: guidedProjects.length,
    schedules: schedules.length,
    completedEvals: 12,
    pendingReviews: 3,
  };

  const chartData = [
    { name: 'Abstract', count: 4 },
    { name: 'Proposal', count: 7 },
    { name: 'Mid-Term', count: 2 },
    { name: 'Final', count: 1 },
  ];

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
        Faculty Dashboard
      </h1>

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Guided Projects" value={stats.guided} icon={<BookOpen className="text-indigo-400" />} />
        <StatsCard title="Upcoming Schedules" value={stats.schedules} icon={<Calendar className="text-blue-400" />} />
        <StatsCard title="Evaluations Completed" value={stats.completedEvals} icon={<CheckSquare className="text-emerald-400" />} />
        <StatsCard title="Pending Reviews" value={stats.pendingReviews} icon={<Clock className="text-yellow-400" />} />
      </div>

      {/* Row 2 — Charts + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e1e2e', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col">
          <CardHeader>
            <CardTitle>Upcoming Schedules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {schedules.slice(0, 5).map((s: any) => (
              <div key={s.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold line-clamp-1">{s.project.title}</span>
                  <Badge className={s.mode === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}>
                    {s.mode}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{format(new Date(s.date), 'MMM d, h:mm a')}</span>
                  <span>{s.venue}</span>
                </div>
              </div>
            ))}
            {schedules.length === 0 && <p className="text-slate-400">No upcoming schedules.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Recent Guided Projects */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Recent Guided Projects Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-400">Project</TableHead>
                <TableHead className="text-slate-400">Team</TableHead>
                <TableHead className="text-slate-400">Current Milestone Status</TableHead>
                <TableHead className="text-slate-400">Guide Assignment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guidedProjects.slice(0, 5).map((p: any) => (
                <TableRow key={p.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-indigo-300">{p.title}</TableCell>
                  <TableCell>{p.team.name}</TableCell>
                  <TableCell>
                    <Badge className="bg-violet-500/20 text-violet-400">{p.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(p.assignmentDate || new Date()), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
