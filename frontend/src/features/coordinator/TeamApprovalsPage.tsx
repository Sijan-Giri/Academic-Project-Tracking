import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Users } from 'lucide-react';

import { PageHeader, DataTable, StatusBadge, ConfirmDialog, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Textarea } from '@/components';
import { useTeamApprovals } from '@/hooks';
import { TEAM_STATUS_TABS } from '@/constants';

export default function TeamApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectItem, setRejectItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewTeam, setViewTeam] = useState<any>(null);
  const [actionTeamId, setActionTeamId] = useState<string | null>(null);

  const {
    teams: teamsList,
    isLoading,
    approveTeam,
    rejectTeam,
    isSubmitting,
  } = useTeamApprovals(statusFilter !== 'ALL' ? { status: statusFilter } : undefined);

  const handleApprove = async (id: string) => {
    setActionTeamId(id);
    try {
      await approveTeam(id);
    } catch (_) {} finally {
      setActionTeamId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    try {
      await rejectTeam({ id: rejectItem.id, reason: rejectReason });
      setRejectItem(null);
      setRejectReason('');
    } catch (_) {}
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
          <Users className="w-3.5 h-3.5 text-brand" />
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
            <Eye className="w-4 h-4 text-brand" />
          </Button>
          {row.original.status !== 'APPROVED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(row.original.id)}
              isLoading={actionTeamId === row.original.id && isSubmitting}
              loadingText="Approving..."
              className="bg-success-subtle text-success-md hover:bg-emerald-100 border border-success text-xs font-semibold"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
            </Button>
          )}
          {row.original.status !== 'REJECTED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectItem(row.original)}
              className="bg-danger-subtle text-danger-md hover:bg-rose-100 border border-danger text-xs font-semibold"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Team Approvals"
        subtitle="Review, approve, or reject student teams for your department."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {TEAM_STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <Button
              key={tab.value}
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-subtle text-brand border border-brand'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </Button>
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
        onConfirm={handleConfirmReject}
        confirmText="Reject Team"
        isLoading={isSubmitting}
        loadingLabel="Rejecting Team..."
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
                        <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand flex items-center justify-center font-bold text-xs">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            {user?.name || 'Unknown'}
                            {member.isLeader && <span className="text-[10px] bg-warning-subtle text-warning-md border border-warning px-2 py-0.5 rounded-md font-bold">Leader</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-brand font-mono font-semibold">{rollNo}</span>
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
                  className="bg-danger-subtle text-danger-md border-danger"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(viewTeam.id);
                    setViewTeam(null);
                  }}
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
