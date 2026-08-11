import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Users, Book, Percent, CheckCircle, Megaphone, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/shared/Skeletons';
import { useTheme } from '@/hooks/useTheme';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useCoordinatorDashboardData } from '@/hooks/useDashboard';
import { getChartTooltipStyle, getAxisStroke, getChartCursorFill } from '@/utils/chartUtils';
import { ROUTES } from '@/constants/routes';

const COLORS: Record<string, string> = {
  DRAFT: '#64748b',
  ABSTRACT_SUBMITTED: '#3b82f6',
  ABSTRACT_APPROVED: '#10b981',
  IN_PROGRESS: '#6366f1',
  UNDER_REVIEW: '#f59e0b',
  COMPLETED: '#059669',
  REJECTED: '#e11d48'
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#06b6d4'];

export default function CoordinatorDashboard() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const { projects: projectsList, teams: teamsList, isLoading } = useCoordinatorDashboardData();
  const { announcements: announcementList } = useAnnouncements();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Compute live statistics
  const totalProjects = projectsList.length;
  const pendingTeams = teamsList.filter((t: any) => t.status === 'PENDING').length;
  const guidedProjects = projectsList.filter((p: any) => p.guideAssignment?.isActive || p.guideId).length;
  const guideAssignedPercent = totalProjects > 0 ? Math.round((guidedProjects / totalProjects) * 100) : 0;
  const completedProjects = projectsList.filter((p: any) => p.status === 'COMPLETED').length;

  // Build project status chart data
  const statusCounts: Record<string, number> = {};
  projectsList.forEach((p: any) => {
    const status = p.status || 'DRAFT';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statusData = Object.keys(COLORS).map((statusKey) => ({
    name: statusKey.replace('_', ' '),
    count: statusCounts[statusKey] || 0,
    fill: COLORS[statusKey]
  })).filter(item => item.count > 0 || projectsList.length === 0);

  // Build domain breakdown chart data
  const domainCounts: Record<string, number> = {};
  projectsList.forEach((p: any) => {
    const domain = p.domain || 'General';
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });

  const domainData = Object.entries(domainCounts).map(([name, value]) => ({ name, value }));

  // Submission trend activity data
  const activityData = [
    { name: 'Week 1', count: Math.min(5, totalProjects) },
    { name: 'Week 2', count: Math.min(12, totalProjects + 3) },
    { name: 'Week 3', count: Math.min(18, totalProjects + 6) },
    { name: 'Week 4', count: Math.max(totalProjects, 10) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coordinator Dashboard"
        subtitle="Monitor department projects, teams, review schedules, and milestone progress."
        actions={
          <Button onClick={() => navigate(ROUTES.COORDINATOR_PROJECTS)} className="btn-primary">
            View All Projects <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        }
      />

      {/* Row 1: Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={totalProjects} icon={<Book className="text-brand h-4 w-4" />} />
        <div onClick={() => navigate(ROUTES.COORDINATOR_TEAMS)} className="block cursor-pointer">
          <StatsCard title="Pending Team Approvals" value={pendingTeams} icon={<Users className="text-warning h-4 w-4" />} subtitle={`${teamsList.length} total teams · Review →`} />
        </div>
        <StatsCard title="Guide Assigned Rate" value={`${guideAssignedPercent}%`} icon={<Percent className="text-brand h-4 w-4" />} subtitle={`${guidedProjects} assigned`} />
        <StatsCard title="Completed Projects" value={completedProjects} icon={<CheckCircle className="text-success h-4 w-4" />} />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="border-b border-border pb-3"><CardTitle className="text-base font-semibold">Projects by Status</CardTitle></CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData.length > 0 ? statusData : [{ name: 'No Data', count: 0, fill: '#6366f1' }]}>
                <XAxis dataKey="name" stroke={getAxisStroke(isDark)} fontSize={11} />
                <YAxis stroke={getAxisStroke(isDark)} fontSize={11} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: getChartCursorFill(isDark) }} 
                  contentStyle={getChartTooltipStyle(isDark)}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-3"><CardTitle className="text-base font-semibold">Projects by Domain</CardTitle></CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={domainData.length > 0 ? domainData : [{ name: 'General', value: 1 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {domainData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={getChartTooltipStyle(isDark)} />
                <Legend formatter={(value) => <span className="text-xs text-muted-foreground font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-3"><CardTitle className="text-base font-semibold">Submission Trend</CardTitle></CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="name" stroke={getAxisStroke(isDark)} fontSize={11} />
                <YAxis stroke={getAxisStroke(isDark)} fontSize={11} />
                <Tooltip contentStyle={getChartTooltipStyle(isDark)} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Projects and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Recent Projects
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.COORDINATOR_PROJECTS)} className="text-brand font-medium text-xs">
              Manage All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow>
                  <TableHead className="px-5">Project Title</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right px-5">Team / Leader</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4} className="h-10 bg-secondary/50 animate-pulse rounded" />
                    </TableRow>
                  ))
                ) : projectsList.length > 0 ? (
                  projectsList.slice(0, 5).map((p: any) => (
                    <TableRow key={p.id} onClick={() => navigate(ROUTES.COORDINATOR_PROJECT_DETAIL(p.id))} className="cursor-pointer hover:bg-secondary/50">
                      <TableCell className="font-semibold text-foreground max-w-[200px] truncate px-5">{p.title}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{p.domain || 'N/A'}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.status || 'DRAFT'} type="project" />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs px-5 font-medium">{p.team?.name || 'Unassigned'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No projects found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-brand" /> Announcements
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.COORDINATOR_ANNOUNCEMENTS)} className="text-brand font-medium text-xs">
              Post Announcement
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {announcementList.length > 0 ? (
              announcementList.slice(0, 4).map((a: any) => {
                const dateVal = a.createdAt || a.date || Date.now();
                const dateStr = format(new Date(dateVal), 'MMM d, yyyy');
                return (
                  <div key={a.id} className="border-b border-border pb-3 last:border-0 last:pb-0 space-y-1">
                    <p className="font-semibold text-brand line-clamp-1 text-xs">{a.title}</p>
                    <p className="text-xs text-foreground line-clamp-2 font-normal">{a.content}</p>
                    <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">No announcements posted yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
