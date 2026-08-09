import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Users, GraduationCap } from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';
import { PROJECT_STATUS_TABS } from '@/constants/options';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { projects: projectsList, isLoading } = useProjects({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  });

  const columns = [
    {
      accessorKey: 'title',
      header: 'Project Title',
      cell: ({ row }: any) => (
        <div>
          <span className="font-semibold text-foreground block">{row.original.title}</span>
          {row.original.abstract && (
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-md font-normal">{row.original.abstract}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }: any) => (
        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold">
          {row.original.domain || 'General'}
        </span>
      ),
    },
    {
      accessorKey: 'team',
      header: 'Team',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5 text-foreground text-xs font-medium">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
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
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{guideUser.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-xs">Unassigned</span>
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
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 font-semibold text-xs"
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
        subtitle="Manage and track all student projects across your academic department."
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by project title or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-input text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {PROJECT_STATUS_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-xs">
        <DataTable columns={columns} data={projectsList} isLoading={isLoading} />
      </div>
    </div>
  );
}
