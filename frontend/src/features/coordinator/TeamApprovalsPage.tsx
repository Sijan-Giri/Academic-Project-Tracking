import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getTeams, approveTeam, rejectTeam } from '@/api/teams.api';

export default function TeamApprovalsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectItem, setRejectItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewTeam, setViewTeam] = useState<any>(null);

  const { data: teamsRes, isLoading } = useQuery({
    queryKey: ['teams-list', statusFilter],
    queryFn: () => getTeams(statusFilter !== 'ALL' ? { status: statusFilter } : undefined),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-list'] });
      toast.success('Team approved successfully!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to approve team'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectTeam(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-list'] });
      toast.success('Team rejected');
      setRejectItem(null);
      setRejectReason('');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to reject team'),
  });

  // Safely unwrap data
  const raw = teamsRes as any;
  const teamsList: any[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.items)
    ? raw.data.items
    : Array.isArray(raw)
    ? raw
    : [];

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const getLeader = (team: any) => {
    const leaderMember = team.members?.find((m: any) => m.isLeader);
    if (!leaderMember) return { name: 'Unknown', studentId: '' };
    const user = leaderMember.studentProfile?.user;
    return {
      name: user?.name || 'Unknown',
      studentId: leaderMember.studentProfile?.studentId || '',
    };
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Team Name',
      cell: ({ row }: any) => (
        <div>
          <span className="font-semibold text-foreground block">{row.original.name}</span>
          <span className="text-xs text-muted-foreground font-normal">{row.original.project?.title ? `Project: ${row.original.project.title}` : 'No project created yet'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'semester',
      header: 'Semester',
      cell: ({ row }: any) => <span className="text-xs text-muted-foreground font-medium">{row.original.semester?.name || 'Current'}</span>,
    },
    {
      accessorKey: 'leader',
      header: 'Team Leader',
      cell: ({ row }: any) => {
        const leader = getLeader(row.original);
        return (
          <div>
            <span className="text-foreground font-semibold text-xs block">{leader.name}</span>
            {leader.studentId && <span className="text-[11px] text-muted-foreground font-normal">{leader.studentId}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'membersCount',
      header: 'Members',
      cell: ({ row }: any) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-secondary border border-border text-foreground text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          {row.original.members?.length || row.original._count?.members || 0}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <StatusBadge status={row.original.status} type="team" />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewTeam(row.original)} title="View Details" className="h-8 w-8">
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </Button>
          {row.original.status !== 'APPROVED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(row.original.id)}
              disabled={approveMutation.isPending}
              className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
            </Button>
          )}
          {row.original.status !== 'REJECTED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectItem(row.original)}
              className="bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Team Approvals"
        subtitle="Review, approve, or reject student teams for your department."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {[
          { label: 'All Teams', value: 'ALL', icon: Users },
          { label: 'Pending Approval', value: 'PENDING', icon: Clock },
          { label: 'Approved', value: 'APPROVED', icon: CheckCircle2 },
          { label: 'Rejected', value: 'REJECTED', icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-xs">
        <DataTable columns={columns} data={teamsList} isLoading={isLoading} />
      </div>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        open={!!rejectItem}
        onOpenChange={(open) => !open && setRejectItem(null)}
        title="Reject Team"
        description={`Are you sure you want to reject team "${rejectItem?.name}"? You may optionally provide a reason.`}
        onConfirm={() => rejectItem && rejectMutation.mutate({ id: rejectItem.id, reason: rejectReason })}
        confirmText="Reject Team"
        variant="danger"
      >
        <div className="py-3">
          <Textarea
            placeholder="Reason for rejection (optional)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="input-field"
          />
        </div>
      </ConfirmDialog>

      {/* Team Details Modal */}
      <Dialog open={!!viewTeam} onOpenChange={(open) => !open && setViewTeam(null)}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base">
              Team: {viewTeam?.name}
              {viewTeam?.status && <StatusBadge status={viewTeam.status} type="team" />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team Members ({viewTeam?.members?.length || 0})</h4>
              <div className="space-y-2">
                {viewTeam?.members?.map((member: any) => {
                  const user = member.studentProfile?.user;
                  const rollNo = member.studentProfile?.studentId;
                  return (
                    <div key={member.id} className="p-3 bg-secondary/50 rounded-lg border border-border flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            {user?.name || 'Unknown'}
                            {member.isLeader && <span className="text-[10px] bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md font-bold">Leader</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{rollNo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {viewTeam?.status === 'PENDING' && (
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectItem(viewTeam);
                    setViewTeam(null);
                  }}
                  className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(viewTeam.id);
                    setViewTeam(null);
                  }}
                  disabled={approveMutation.isPending}
                  className="btn-primary"
                >
                  Approve Team
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
