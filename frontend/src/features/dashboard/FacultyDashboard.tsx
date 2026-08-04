import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Calendar, CheckSquare, Clock } from 'lucide-react';
import { getGuidedProjects } from '@/api/projects.api';
import { getMySchedules } from '@/api/schedules.api';
import { format } from 'date-fns';
import { useThemeStore } from '@/store/theme.store';

export default function FacultyDashboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { data: rawGuided } = useQuery({ queryKey: ['guided-projects'], queryFn: getGuidedProjects });
  const { data: rawSchedules } = useQuery({ queryKey: ['my-schedules'], queryFn: getMySchedules });

  const guidedProjects: any[] = Array.isArray((rawGuided as any)?.data?.items) ? (rawGuided as any).data.items : (Array.isArray((rawGuided as any)?.data) ? (rawGuided as any).data : (Array.isArray(rawGuided) ? rawGuided : []));
  const schedules: any[] = Array.isArray((rawSchedules as any)?.data?.items) ? (rawSchedules as any).data.items : (Array.isArray((rawSchedules as any)?.data) ? (rawSchedules as any).data : (Array.isArray(rawSchedules) ? rawSchedules : []));

  // Stats
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
        Faculty Dashboard
      </h1>

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Guided Projects" value={stats.guided} icon={<BookOpen className="text-indigo-500 dark:text-indigo-400" />} />
        <StatsCard title="Upcoming Schedules" value={stats.schedules} icon={<Calendar className="text-blue-500 dark:text-blue-400" />} />
        <StatsCard title="Evaluations Completed" value={stats.completedEvals} icon={<CheckSquare className="text-emerald-500 dark:text-emerald-400" />} />
        <StatsCard title="Pending Reviews" value={stats.pendingReviews} icon={<Clock className="text-amber-500 dark:text-yellow-400" />} />
      </div>

      {/* Row 2 — Charts + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                  contentStyle={{ backgroundColor: isDark ? '#1e1e2e' : '#ffffff', border: isDark ? 'none' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }} 
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Upcoming Schedules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {schedules.slice(0, 5).map((s: any) => (
              <div key={s.id} className="p-3 rounded-lg dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200 flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold line-clamp-1 dark:text-white text-slate-900">{s.project.title}</span>
                  <Badge className={s.mode === 'ONLINE' ? 'dark:bg-blue-500/20 dark:text-blue-400 bg-blue-100 text-blue-700' : 'dark:bg-slate-500/20 dark:text-slate-400 bg-slate-100 text-slate-700'}>
                    {s.mode}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm dark:text-slate-400 text-slate-500">
                  <span>{format(new Date(s.date), 'MMM d, h:mm a')}</span>
                  <span>{s.venue}</span>
                </div>
              </div>
            ))}
            {schedules.length === 0 && <p className="dark:text-slate-400 text-slate-500 text-sm">No upcoming schedules.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Recent Guided Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Guided Projects Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Current Milestone Status</TableHead>
                <TableHead>Guide Assignment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guidedProjects.slice(0, 5).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-300">{p.title}</TableCell>
                  <TableCell>{p.team?.name}</TableCell>
                  <TableCell>
                    <Badge className="dark:bg-violet-500/20 dark:text-violet-400 bg-violet-100 text-violet-700">{p.status}</Badge>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium dark:text-slate-400 text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold dark:text-white text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
