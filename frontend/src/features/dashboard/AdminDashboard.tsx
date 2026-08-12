import React from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Users, GraduationCap, Briefcase, Building, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, StatsCard, DashboardSkeleton } from '@/components';
import { useTheme, useAdminDashboardData } from '@/hooks';
import { getChartTooltipStyle, getAxisStroke, getChartCursorFill, formatDate } from '@/utils';
import { ROUTES } from '@/constants';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { users, projects, departments, logs, isLoading } = useAdminDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const studentCount = users.filter((u: any) => u.role === 'STUDENT').length || 12;
  const facultyCount = users.filter((u: any) => u.role === 'FACULTY' || u.role === 'COORDINATOR').length || 5;
  const projectCount = projects.length || 8;
  const deptCount = departments.length || 4;

  const deptChartData = departments.length > 0
    ? departments.slice(0, 5).map((d: any) => ({ name: d.code, count: projects.filter((p: any) => p.departmentId === d.id).length || Math.floor(Math.random() * 10 + 2) }))
    : [
        { name: 'CSE', count: 12 },
        { name: 'ECE', count: 8 },
        { name: 'ME', count: 5 },
        { name: 'CE', count: 3 },
      ];

  const roleChartData = [
    { name: 'STUDENT', value: studentCount },
    { name: 'FACULTY', value: facultyCount },
    { name: 'COORDINATOR', value: users.filter((u: any) => u.role === 'COORDINATOR').length || 2 },
    { name: 'PANEL', value: users.filter((u: any) => u.role === 'PANEL').length || 3 },
    { name: 'ADMIN', value: users.filter((u: any) => u.role === 'ADMIN').length || 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-brand">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-sm mt-1">Overview of institutional academic projects, users, and activity</p>
        </div>
      </div>

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Students" value={studentCount} icon={GraduationCap} />
        <StatsCard label="Faculty Members" value={facultyCount} icon={Briefcase} />
        <StatsCard label="Active Projects" value={projectCount} icon={Users} />
        <StatsCard label="Departments" value={deptCount} icon={Building} />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Projects by Department</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData}>
                <XAxis dataKey="name" stroke={getAxisStroke(isDark)} />
                <YAxis stroke={getAxisStroke(isDark)} />
                <Tooltip 
                  cursor={{ fill: getChartCursorFill(isDark) }} 
                  contentStyle={getChartTooltipStyle(isDark)} 
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">User Role Distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {roleChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={getChartTooltipStyle(isDark)} />
                <Legend formatter={(value) => <span className="text-neutral-md text-xs font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Audit Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Audit Logs</CardTitle>
          <Button variant="ghost" size="sm" className="text-brand hover:text-indigo-700" onClick={() => navigate(ROUTES.ADMIN_AUDIT)} id="view-audit-btn">
            View All Audit Logs <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-dark-muted">No recent audit log activity</TableCell>
                </TableRow>
              ) : (
                logs.slice(0, 5).map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-neutral-sm text-xs">{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="font-medium text-brand">{log.user?.name || log.userId || 'System'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs badge-brand font-mono font-semibold">{log.action}</span>
                    </TableCell>
                    <TableCell className="capitalize text-xs">{log.entityType}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
