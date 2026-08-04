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
          <span className="font-semibold text-white block">{row.original.name}</span>
          <span className="text-xs text-gray-400">{row.original.project?.title ? `Project: ${row.original.project.title}` : 'No project created yet'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'semester',
      header: 'Semester',
      cell: ({ row }: any) => row.original.semester?.name || 'Current',
    },
    {
      accessorKey: 'leader',
      header: 'Team Leader',
      cell: ({ row }: any) => {
        const leader = getLeader(row.original);
        return (
          <div>
            <span className="text-white font-medium block">{leader.name}</span>
            {leader.studentId && <span className="text-xs text-gray-400">{leader.studentId}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'membersCount',
      header: 'Members',
      cell: ({ row }: any) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs font-medium">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
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
          <Button variant="ghost" size="icon" onClick={() => setViewTeam(row.original)} title="View Details">
            <Eye className="w-4 h-4 text-indigo-400" />
          </Button>
          {row.original.status !== 'APPROVED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(row.original.id)}
              disabled={approveMutation.isPending}
              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
          )}
          {row.original.status !== 'REJECTED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectItem(row.original)}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
            >
              <XCircle className="w-4 h-4 mr-1" /> Reject
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
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
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
        <div className="py-4">
          <Textarea
            placeholder="Reason for rejection (optional)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </ConfirmDialog>

      {/* Team Details Modal */}
      <Dialog open={!!viewTeam} onOpenChange={(open) => !open && setViewTeam(null)}>
        <DialogContent className="bg-gray-900 border-white/10 text-white sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Team: {viewTeam?.name}
              {viewTeam?.status && <StatusBadge status={viewTeam.status} type="team" />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Team Members ({viewTeam?.members?.length || 0})</h4>
              <div className="space-y-2">
                {viewTeam?.members?.map((member: any) => {
                  const user = member.studentProfile?.user;
                  const rollNo = member.studentProfile?.studentId;
                  return (
                    <div key={member.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-2">
                            {user?.name || 'Unknown'}
                            {member.isLeader && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">Leader</span>}
                          </p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-300 font-mono">{rollNo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {viewTeam?.status === 'PENDING' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectItem(viewTeam);
                    setViewTeam(null);
                  }}
                  className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(viewTeam.id);
                    setViewTeam(null);
                  }}
                  disabled={approveMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
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
