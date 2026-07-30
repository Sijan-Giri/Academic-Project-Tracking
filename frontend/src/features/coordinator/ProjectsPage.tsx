import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Filter } from 'lucide-react';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['coordinator-projects', statusFilter, semesterFilter, search],
    queryFn: async () => {
      const res = await api.get('/coordinator/projects', {
        params: { status: statusFilter === 'ALL' ? undefined : statusFilter, search, semesterId: semesterFilter === 'ALL' ? undefined : semesterFilter }
      });
      return res.data;
    },
  });

  const columns = [
    { accessorKey: 'title', header: 'Project Title', cell: ({ row }: any) => <span className="font-medium text-white">{row.original.title}</span> },
    { accessorKey: 'domain', header: 'Domain' },
    { accessorKey: 'team.name', header: 'Team', cell: ({ row }: any) => row.original.team?.name || 'Unknown' },
    { accessorKey: 'guide.name', header: 'Guide', cell: ({ row }: any) => row.original.guide?.name || <span className="text-gray-500 italic">Unassigned</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const colors: Record<string, string> = {
          PROPOSED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
          IN_PROGRESS: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          COMPLETED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        const color = colors[row.original.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        return <Badge variant="outline" className={`border ${color}`}>{row.original.status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/coordinator/projects/${row.original.id}`)} className="text-indigo-400 hover:text-indigo-300">
          <Eye className="w-4 h-4 mr-2" /> View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects Overview"
        subtitle="All projects in your department"
      />

      <div className="flex flex-col md:flex-row gap-4 items-center bg-[#1a1d27] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or domain..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f1117] border-white/10 text-white w-full"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#0f1117] border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PROPOSED">Proposed</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-[180px] bg-[#0f1117] border-white/10 text-white">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
              <SelectItem value="ALL">All Semesters</SelectItem>
              {/* Typically map through fetched semesters here */}
              <SelectItem value="sem1">Semester 1</SelectItem>
              <SelectItem value="sem2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-4">
        <DataTable columns={columns} data={projects || []} isisLoading={isLoading} />
      </div>
    </div>
  );
}
