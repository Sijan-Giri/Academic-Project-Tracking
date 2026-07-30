import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Users, GraduationCap, Briefcase, Building } from 'lucide-react';
import { getUsersStats } from '@/api/users';
import { getAuditLogs } from '@/api/audit';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export default function AdminDashboard() {
  const { data: stats = { students: 1200, faculty: 150, projects: 320, departments: 5 } } = useQuery({ queryKey: ['admin-stats'], queryFn: getUsersStats });
  const { data: logs = [] } = useQuery({ queryKey: ['audit-logs'], queryFn: getAuditLogs });

  const deptData = [
    { name: 'CSE', count: 120 },
    { name: 'ECE', count: 80 },
    { name: 'MECH', count: 50 },
    { name: 'CIVIL', count: 30 },
    { name: 'EEE', count: 40 },
  ];

  const roleData = [
    { name: 'STUDENT', value: 1200 },
    { name: 'FACULTY', value: 150 },
    { name: 'COORDINATOR', value: 15 },
    { name: 'PANEL', value: 20 },
    { name: 'ADMIN', value: 3 },
  ];

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117]">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
        Admin Dashboard
      </h1>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.students} icon={<GraduationCap className="text-indigo-400" />} />
        <StatsCard title="Total Faculty" value={stats.faculty} icon={<Briefcase className="text-violet-400" />} />
        <StatsCard title="Active Projects" value={stats.projects} icon={<Users className="text-emerald-400" />} />
        <StatsCard title="Active Departments" value={stats.departments} icon={<Building className="text-blue-400" />} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Projects by Department</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader><CardTitle>Users by Role</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Audit Logs</CardTitle>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            View Full Audit Log
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Entity Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.slice(0, 10).map((log: any, idx: number) => (
                <TableRow key={idx} className="border-white/10 hover:bg-white/5">
                  <TableCell>{format(new Date(log.timestamp || new Date()), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                  <TableCell className="font-medium text-indigo-300">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-300">{log.entityType}</span>
                  </TableCell>
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
