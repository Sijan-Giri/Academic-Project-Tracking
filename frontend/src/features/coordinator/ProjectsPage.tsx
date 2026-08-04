import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Users, GraduationCap } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProjects } from '@/api/projects.api';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['coordinator-projects', statusFilter, search],
    queryFn: () =>
      getProjects({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
      }),
  });

  // Safely unwrap data
  const raw = projectsRes as any;
  const projectsList: any[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.items)
    ? raw.data.items
    : Array.isArray(raw)
    ? raw
    : [];

  const columns = [
    {
      accessorKey: 'title',
      header: 'Project Title',
      cell: ({ row }: any) => (
        <div>
          <span className="font-semibold text-white block">{row.original.title}</span>
          {row.original.abstract && (
            <span className="text-xs text-gray-400 line-clamp-1 max-w-md">{row.original.abstract}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }: any) => (
        <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
          {row.original.domain || 'General'}
        </span>
      ),
    },
    {
      accessorKey: 'team',
      header: 'Team',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>{row.original.team?.name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'guide',
      header: 'Guide',
      cell: ({ row }: any) => {
        const guideUser = row.original.guideAssignment?.facultyProfile?.user;
        return guideUser ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
            <GraduationCap className="w-4 h-4" />
            <span>{guideUser.name}</span>
          </div>
        ) : (
          <span className="text-gray-500 italic text-xs">Unassigned</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <StatusBadge status={row.original.status} type="project" />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/coordinator/projects/${row.original.id}`)}
          className="text-indigo-400 hover:text-indigo-300 hover:bg-white/5"
        >
          <Eye className="w-4 h-4 mr-1.5" /> View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Projects Overview"
        subtitle="Manage and track all student projects across your department."
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by project title or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'DRAFT', 'ABSTRACT_SUBMITTED', 'ABSTRACT_APPROVED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <DataTable columns={columns} data={projectsList} isLoading={isLoading} />
      </div>
    </div>
  );
}
