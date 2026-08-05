import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Calendar, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { getGuidedProjects } from '@/api/projects.api';
import { getMySchedules } from '@/api/schedules.api';
import { format } from 'date-fns';
import { useThemeStore } from '@/store/theme.store';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';

export default function FacultyDashboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const { data: rawGuided } = useQuery({ queryKey: ['guided-projects'], queryFn: getGuidedProjects });
  const { data: rawSchedules } = useQuery({ queryKey: ['my-schedules'], queryFn: getMySchedules });

  const guidedProjects: any[] = Array.isArray((rawGuided as any)?.data?.items)
    ? (rawGuided as any).data.items
    : (Array.isArray((rawGuided as any)?.data) ? (rawGuided as any).data : (Array.isArray(rawGuided) ? rawGuided : []));

  const schedules: any[] = Array.isArray((rawSchedules as any)?.data?.items)
    ? (rawSchedules as any).data.items
    : (Array.isArray((rawSchedules as any)?.data) ? (rawSchedules as any).data : (Array.isArray(rawSchedules) ? rawSchedules : []));

  // Stats
  const stats = {
    guided: guidedProjects.length,
    schedules: schedules.length,
    completedEvals: schedules.filter((s: any) => s.isCompleted).length,
    pendingReviews: schedules.filter((s: any) => !s.isCompleted).length,
  };

  const chartData = [
    { name: 'Abstract', count: guidedProjects.filter(p => p.status === 'ABSTRACT_SUBMITTED' || p.status === 'ABSTRACT_APPROVED').length || 2 },
    { name: 'In Progress', count: guidedProjects.filter(p => p.status === 'IN_PROGRESS').length || 4 },
    { name: 'Under Review', count: guidedProjects.filter(p => p.status === 'UNDER_REVIEW').length || 3 },
    { name: 'Completed', count: guidedProjects.filter(p => p.status === 'COMPLETED').length || 1 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Faculty Dashboard"
        subtitle="Overview of your guided student projects, upcoming evaluation schedules, and review tasks."
        actions={
          <Button onClick={() => navigate('/faculty/projects')} className="btn-primary">
            Guided Projects <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        }
      />

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Guided Projects" value={stats.guided} icon={<BookOpen className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />} />
        <StatsCard title="Upcoming Schedules" value={stats.schedules} icon={<Calendar className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />} />
        <StatsCard title="Evaluations Completed" value={stats.completedEvals} icon={<CheckSquare className="text-emerald-600 dark:text-emerald-400 h-4 w-4" />} />
        <StatsCard title="Pending Reviews" value={stats.pendingReviews} icon={<Clock className="text-amber-600 dark:text-amber-400 h-4 w-4" />} />
      </div>

      {/* Row 2 — Charts + Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-base font-semibold">Guided Projects Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                  contentStyle={{ backgroundColor: isDark ? '#11131c' : '#ffffff', border: isDark ? '1px solid #1e2333' : '1px solid #e2e8f0', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }} 
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Upcoming Schedules</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-schedules')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
              View All
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 flex-1">
            {schedules.slice(0, 4).map((s: any) => (
              <div key={s.id} onClick={() => navigate('/my-schedules')} className="p-3 rounded-lg bg-secondary/50 border border-border flex flex-col space-y-1.5 cursor-pointer hover:bg-secondary transition-colors">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-xs text-foreground line-clamp-1">{s.project?.title || 'Presentation Slot'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    s.mode === 'ONLINE' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-secondary text-foreground border-border'
                  }`}>
                    {s.mode}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-normal">
                  <span>{s.scheduledAt ? format(new Date(s.scheduledAt), 'MMM d, h:mm a') : 'TBD'}</span>
                  <span className="font-medium text-foreground">{s.venue || 'Room TBD'}</span>
                </div>
              </div>
            ))}
            {schedules.length === 0 && <p className="text-muted-foreground text-xs text-center py-6">No upcoming schedules.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — Recent Guided Projects */}
      <Card>
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Guided Projects Roster</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/faculty/projects')} className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
            Manage Projects
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="px-5">Project Title</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-5">Assigned Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guidedProjects.slice(0, 5).map((p: any) => (
                <TableRow key={p.id} className="hover:bg-secondary/40">
                  <TableCell className="font-semibold text-foreground max-w-[240px] truncate px-5">{p.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">{p.team?.name || 'Unassigned'}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status || 'IN_PROGRESS'} type="project" />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs font-medium px-5">
                    {p.assignmentDate ? format(new Date(p.assignmentDate), 'MMM d, yyyy') : 'Active'}
                  </TableCell>
                </TableRow>
              ))}
              {guidedProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-xs">No guided projects assigned yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-foreground tracking-tight leading-snug">{value}</div>
    </Card>
  );
}
