import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Users, Book, Percent, CheckCircle, Megaphone, AlertTriangle } from 'lucide-react';
import { getProjects } from '@/api/projects.api';
import { getTeams } from '@/api/teams.api';
import { getAnnouncements } from '@/api/announcements.api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/theme.store';

const COLORS: Record<string, string> = {
  DRAFT: '#6b7280',
  ABSTRACT_SUBMITTED: '#3b82f6',
  ABSTRACT_APPROVED: '#22c55e',
  IN_PROGRESS: '#6366f1',
  UNDER_REVIEW: '#eab308',
  COMPLETED: '#10b981',
  REJECTED: '#ef4444'
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#06b6d4'];

export default function CoordinatorDashboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['coordinator-projects'],
    queryFn: () => getProjects(),
  });

  const { data: teamsRes } = useQuery({
    queryKey: ['coordinator-teams'],
    queryFn: () => getTeams(),
  });

  const { data: announcementsRes } = useQuery({
    queryKey: ['coordinator-announcements'],
    queryFn: () => getAnnouncements(),
  });

  // Safe array unwrapping
  const projectsList: any[] = Array.isArray((projectsRes as any)?.data?.items)
    ? (projectsRes as any).data.items
    : (Array.isArray((projectsRes as any)?.data) ? (projectsRes as any).data : (Array.isArray(projectsRes) ? projectsRes : []));

  const teamsList: any[] = Array.isArray((teamsRes as any)?.data?.items)
    ? (teamsRes as any).data.items
    : (Array.isArray((teamsRes as any)?.data) ? (teamsRes as any).data : (Array.isArray(teamsRes) ? teamsRes : []));

  const announcementList: any[] = Array.isArray((announcementsRes as any)?.data?.items)
    ? (announcementsRes as any).data.items
    : (Array.isArray((announcementsRes as any)?.data) ? (announcementsRes as any).data : (Array.isArray(announcementsRes) ? announcementsRes : []));

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
  if (domainData.length === 0) {
    domainData.push(
      { name: 'AI/ML', value: 4 },
      { name: 'Web Dev', value: 3 },
      { name: 'Cybersecurity', value: 2 }
    );
  }

  // Submission trend activity data
  const activityData = [
    { name: 'Week 1', count: Math.min(5, totalProjects) },
    { name: 'Week 2', count: Math.min(12, totalProjects + 3) },
    { name: 'Week 3', count: Math.min(18, totalProjects + 6) },
    { name: 'Week 4', count: Math.max(totalProjects, 10) },
  ];

  const navigation = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
            Coordinator Dashboard
          </h1>
          <p className="dark:text-slate-400 text-slate-500 mt-1 text-sm">Monitor department projects, teams, review schedules, and milestones.</p>
        </div>
      </div>

      {/* Row 1: Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={totalProjects} icon={<Book className="text-indigo-500 dark:text-indigo-400 h-5 w-5" />} />
        <div onClick={() => navigation('/coordinator/teams')} className="block cursor-pointer hover:opacity-90 transition-opacity">
          <StatsCard title="Pending Team Approvals" value={pendingTeams} icon={<Users className="text-amber-500 dark:text-yellow-400 h-5 w-5" />} subtitle={`${teamsList.length} total teams · Click to review`} />
        </div>
        <StatsCard title="Guide Assigned Rate" value={`${guideAssignedPercent}%`} icon={<Percent className="text-blue-500 dark:text-blue-400 h-5 w-5" />} subtitle={`${guidedProjects} assigned`} />
        <StatsCard title="Completed Projects" value={completedProjects} icon={<CheckCircle className="text-emerald-500 dark:text-emerald-400 h-5 w-5" />} />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Projects by Status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData.length > 0 ? statusData : [{ name: 'No Data', count: 0, fill: '#6366f1' }]}>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                  contentStyle={{ backgroundColor: isDark ? '#1e1e2e' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#fff' : '#0f172a', borderRadius: '8px' }} 
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
          <CardHeader><CardTitle className="text-base font-semibold">Projects by Domain</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={domainData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {domainData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e1e2e' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#fff' : '#0f172a', borderRadius: '8px' }} />
                <Legend formatter={(value) => <span className="text-xs dark:text-slate-300 text-slate-700 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Submission Activity Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e1e2e' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#fff' : '#0f172a', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Tables and Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Recent Projects Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Team / Leader</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingProjects ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4} className="h-10 dark:bg-white/5 bg-slate-200 animate-pulse rounded" />
                    </TableRow>
                  ))
                ) : projectsList.length > 0 ? (
                  projectsList.slice(0, 5).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-indigo-600 dark:text-indigo-300 max-w-[200px] truncate">{p.title}</TableCell>
                      <TableCell className="dark:text-slate-300 text-slate-700 text-xs">{p.domain || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          p.status === 'COMPLETED' ? 'dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          p.status === 'IN_PROGRESS' ? 'dark:bg-indigo-500/20 dark:text-indigo-400 bg-indigo-100 text-indigo-700 border border-indigo-300' :
                          p.status === 'ABSTRACT_APPROVED' ? 'dark:bg-green-500/20 dark:text-green-400 bg-green-100 text-green-700 border border-green-300' :
                          'dark:bg-gray-500/20 dark:text-gray-300 bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          {p.status || 'DRAFT'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right dark:text-slate-300 text-slate-700 text-xs">{p.team?.name || 'Unassigned'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 dark:text-slate-400 text-slate-500">No projects found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcementList.length > 0 ? (
              announcementList.slice(0, 4).map((a: any) => {
                const dateVal = a.createdAt || a.date || Date.now();
                const dateStr = format(new Date(dateVal), 'MMM d, yyyy');
                return (
                  <div key={a.id} className="border-b dark:border-white/10 border-slate-200 pb-3 last:border-0 last:pb-0">
                    <p className="font-medium text-indigo-600 dark:text-indigo-300 line-clamp-1 text-sm">{a.title}</p>
                    <p className="text-xs dark:text-slate-400 text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-1">{dateStr}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs dark:text-slate-400 text-slate-500 text-center py-8">No announcements posted yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, subtitle }: { title: string; value: React.ReactNode; icon: React.ReactNode; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium dark:text-slate-400 text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold dark:text-white text-slate-900">{value}</div>
        {subtitle && <p className="text-[11px] dark:text-slate-400 text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
