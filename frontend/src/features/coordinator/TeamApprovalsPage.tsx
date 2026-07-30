import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function TeamApprovalsPage() {
  const queryClient = useQueryClient();
  const [rejectItem, setRejectItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewTeam, setViewTeam] = useState<any>(null);

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams-pending-approval'],
    queryFn: async () => {
      const res = await api.get('/teams/approvals');
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/teams/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-pending-approval'] });
      toast.success('Team approved successfully');
    },
    onError: () => toast.error('Failed to approve team'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.patch(`/teams/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-pending-approval'] });
      toast.success('Team rejected');
      setRejectItem(null);
      setRejectReason('');
    },
    onError: () => toast.error('Failed to reject team'),
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const columns = [
    { accessorKey: 'name', header: 'Team Name', cell: ({ row }: any) => <span className="font-semibold text-white">{row.original.name}</span> },
    { accessorKey: 'semester', header: 'Semester', cell: ({ row }: any) => row.original.semester?.name || 'N/A' },
    { accessorKey: 'membersCount', header: 'Members', cell: ({ row }: any) => row.original.members?.length || 0 },
    { accessorKey: 'leader', header: 'Leader', cell: ({ row }: any) => row.original.leader?.name || 'Unknown' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={row.original.status === 'PENDING' ? 'bg-orange-500' : 'bg-gray-500'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewTeam(row.original)}>
            <Eye className="w-4 h-4 text-indigo-400" />
          </Button>
          {row.original.status === 'PENDING' && (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleApprove(row.original.id)} disabled={approveMutation.isPending}>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setRejectItem(row.original)}>
                <XCircle className="w-4 h-4 text-red-400" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Approvals"
        subtitle="Review and approve student teams in your department"
      />

      <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-4">
        <DataTable columns={columns} data={teams || []} isisLoading={isLoading} />
      </div>

      <ConfirmDialog
        open={!!rejectItem}
        onOpenChange={(open) => !open && setRejectItem(null)}
        title="Reject Team"
        description="Please provide a reason for rejecting this team. This will be sent to the team leader."
        onConfirm={() => rejectItem && rejectMutation.mutate({ id: rejectItem.id, reason: rejectReason })}
        confirmText="Reject Team"
        variant="danger"
      >
        <div className="py-4">
          <Textarea 
            placeholder="Reason for rejection..." 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="bg-[#0f1117] border-white/10 text-white"
          />
        </div>
      </ConfirmDialog>

      <Dialog open={!!viewTeam} onOpenChange={(open) => !open && setViewTeam(null)}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Team Details: {viewTeam?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <h4 className="text-sm text-gray-400 mb-2">Team Leader</h4>
              <div className="p-3 bg-[#1a1d27] rounded-lg border border-white/10 flex justify-between items-center">
                <span>{viewTeam?.leader?.name}</span>
                <span className="text-xs text-gray-500">{viewTeam?.leader?.studentId}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-2">Members</h4>
              <div className="space-y-2">
                {viewTeam?.members?.filter((m: any) => m.id !== viewTeam.leaderId).map((member: any) => (
                  <div key={member.id} className="p-3 bg-[#1a1d27] rounded-lg border border-white/10 flex justify-between items-center">
                    <span>{member.user?.name}</span>
                    <span className="text-xs text-gray-500">{member.user?.studentId}</span>
                  </div>
                ))}
                {(!viewTeam?.members || viewTeam.members.length <= 1) && (
                  <p className="text-sm text-gray-500">No additional members.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
