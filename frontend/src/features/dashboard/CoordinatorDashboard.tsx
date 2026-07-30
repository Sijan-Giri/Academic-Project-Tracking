import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Users, Book, Percent, CheckCircle } from 'lucide-react';
import { getAllProjects, getDefaulters } from '@/api/projects.api';
import { getAnnouncements } from '@/api/announcements.api';
import { format } from 'date-fns';

const COLORS = {
  DRAFT: '#6b7280',
  ABSTRACT_SUBMITTED: '#3b82f6',
  ABSTRACT_APPROVED: '#22c55e',
  IN_PROGRESS: '#6366f1',
  COMPLETED: '#10b981'
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export default function CoordinatorDashboard() {
  const { data: projects = [] } = useQuery({ queryKey: ['all-projects'], queryFn: getAllProjects });
  const { data: defaulters = [] } = useQuery({ queryKey: ['defaulters'], queryFn: getDefaulters });
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: getAnnouncements });

  const stats = {
    total: projects.length,
    pendingTeams: 5,
    guideAssignedPercent: 85,
    reviewsCompleted: 42
  };

  const statusData = Object.entries(COLORS).map(([key, color]) => ({
    name: key,
    count: Math.floor(Math.random() * 20) + 1,
    fill: color
  }));

  const domainData = [
    { name: 'AI/ML', value: 35 },
    { name: 'Web Dev', value: 25 },
    { name: 'IoT', value: 15 },
    { name: 'Security', value: 10 },
  ];

  const activityData = [
    { name: 'W1', count: 4 },
    { name: 'W2', count: 12 },
    { name: 'W3', count: 8 },
    { name: 'W4', count: 20 },
  ];

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
        Coordinator Dashboard
      </h1>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={stats.total} icon={<Book className="text-indigo-400" />} />
        <StatsCard title="Pending Approvals" value={stats.pendingTeams} icon={<Users className="text-yellow-400" />} />
        <StatsCard title="Guide Assigned" value={`${stats.guideAssignedPercent}%`} icon={<Percent className="text-blue-400" />} />
        <StatsCard title="Reviews Completed" value={stats.reviewsCompleted} icon={<CheckCircle className="text-emerald-400" />} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Projects by Status</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" hide />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }} />
                <Legend />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Projects by Domain</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Submission Activity</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Defaulters List</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-slate-400">Project</TableHead>
                  <TableHead className="text-slate-400">Team</TableHead>
                  <TableHead className="text-slate-400">Overdue Milestone</TableHead>
                  <TableHead className="text-slate-400 text-right">Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.slice(0, 5).map((d: any) => (
                  <TableRow key={d.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-indigo-300">{d.project.title}</TableCell>
                    <TableCell>{d.team.name}</TableCell>
                    <TableCell>{d.milestone.name}</TableCell>
                    <TableCell className="text-right text-red-400 font-bold">{d.daysOverdue}d</TableCell>
                  </TableRow>
                ))}
                {defaulters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-slate-400">No defaulters found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {announcements.slice(0, 3).map((a: any) => (
              <div key={a.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-indigo-300 line-clamp-1">{a.title}</p>
                <p className="text-xs text-slate-400">{format(new Date(a.date), 'MMM d, yyyy')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
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
