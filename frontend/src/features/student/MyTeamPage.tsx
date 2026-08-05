import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, LogOut, Info, AlertTriangle, Mail, Check, X } from 'lucide-react';
import { getMyTeam, createTeam, inviteMember, removeMember, leaveTeam, getMyInvitations, acceptInvitation, declineInvitation } from '@/api/teams.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function MyTeamPage() {
  const queryClient = useQueryClient();
  const authUser = useAuthStore(s => s.user);

  const [teamName, setTeamName] = useState('');
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [activeTab, setActiveTab] = useState<'CREATE' | 'JOIN'>('CREATE');

  // Fetch student's current team
  const { data: teamRes, isLoading: teamLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    retry: false
  });

  // Fetch pending invitations sent TO this student
  const { data: invRes, isLoading: invLoading } = useQuery({
    queryKey: ['my-pending-invitations'],
    queryFn: getMyInvitations,
  });

  const team = (teamRes as any)?.data ?? teamRes ?? null;
  const myInvitations: any[] = (invRes as any)?.data ?? invRes ?? [];

  // Mutations
  const createMut = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      toast.success('Team created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create team')
  });

  const inviteMut = useMutation({
    mutationFn: ({ teamId, studentId }: { teamId: string; studentId: string }) => inviteMember(teamId, studentId),
    onSuccess: () => {
      toast.success('Invitation sent!');
      setInviteStudentId('');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send invitation')
  });

  const removeMut = useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) => removeMember(teamId, memberId),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to remove member')
  });

  const leaveMut = useMutation({
    mutationFn: (teamId: string) => leaveTeam(teamId),
    onSuccess: () => {
      toast.success('You left the team');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to leave team')
  });

  const acceptMut = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      toast.success('Invitation accepted!');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to accept invitation')
  });

  const rejectMut = useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => {
      toast.success('Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to decline invitation')
  });

  if (teamLoading || invLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 bg-card border border-border rounded-xl" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  // Check if student is team leader
  const myMemberRecord = team?.members?.find(
    (m: any) => m.studentProfile?.userId === authUser?.id || m.studentProfileId === authUser?.studentProfile?.id
  );
  const isLeader = myMemberRecord?.isLeader ?? false;

  const sentInvitations: any[] = team?.invitations || [];

  // ── No team ───────────────────────────────────────────────────────────────

  if (!team || !team.id) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Team Roster & Invites"
          subtitle="Create a new capstone project team or accept an invitation from a peer."
        />

        {/* Received Pending Invitations */}
        {myInvitations.length > 0 && (
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-semibold text-foreground">
                Pending Team Invitations ({myInvitations.length})
              </h3>
            </div>
            <div className="space-y-3">
              {myInvitations.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-card border border-border gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{inv.team?.name || 'Unnamed Team'}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Invited by <strong className="text-foreground">{inv.invitedBy?.name || 'Team Leader'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => acceptMut.mutate(inv.id)}
                      disabled={acceptMut.isPending}
                      className="btn-primary"
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMut.mutate(inv.id)}
                      disabled={rejectMut.isPending}
                    >
                      <X className="w-4 h-4 mr-1.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab('CREATE')}
            className={cn(
              'pb-3 text-sm font-semibold transition-colors relative',
              activeTab === 'CREATE'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Create New Team
          </button>
          <button
            onClick={() => setActiveTab('JOIN')}
            className={cn(
              'pb-3 text-sm font-semibold transition-colors relative',
              activeTab === 'JOIN'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Join Existing Team
          </button>
        </div>

        {activeTab === 'CREATE' ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Create Team Roster</h3>
              <p className="text-xs text-muted-foreground">Register your team name. As team leader, you can invite peers afterwards.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!teamName.trim()) return toast.error('Enter a team name');
                createMut.mutate({ name: teamName.trim() });
              }}
              className="space-y-4 max-w-md"
            >
              <div className="space-y-2">
                <Label htmlFor="teamName" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Innovators, ByteForce, Team Alpha"
                />
              </div>
              <Button type="submit" disabled={createMut.isPending} className="btn-primary">
                <Users className="w-4 h-4 mr-2" /> Register & Create Team
              </Button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Waiting for Invitation</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 font-normal">
                Ask your team leader to invite your Roll Number or Student ID from their team management page.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Has a team ───────────────────────────────────────────────────────────

  const pendingSentInvites = sentInvitations.filter((i: any) => i.status === 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title={team?.name ? `Team ${team.name}` : "Team Roster & Invites"}
        subtitle={team?.name ? `Manage team members, member invitations, and approval for Team ${team.name}.` : "Manage your capstone project team roster, invites, and approval status."}
      />

      {/* Team Info Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-secondary border border-border text-foreground">
                Team #{team.id.substring(0, 8)}
              </span>
              <StatusBadge status={team.status} type="team" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {team.name}
            </h1>
          </div>
          {!isLeader && team.status === 'PENDING' && (
            <Button
              variant="destructive"
              onClick={() => leaveMut.mutate(team.id)}
              disabled={leaveMut.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" /> Leave Team
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert Banners */}
      {team.status === 'PENDING' && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Coordinator Approval Pending</h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-normal">
              Your team is currently pending approval by the project coordinator. You can still invite team members in the meantime.
            </p>
          </div>
        </div>
      )}
      {team.status === 'REJECTED' && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Team Proposal Rejected</h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-normal">
              {team.rejectionReason || 'Your team registration was declined by the coordinator. Please contact your coordinator for details.'}
            </p>
          </div>
        </div>
      )}

      {/* Team Roster Grid */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Team Roster Members</h3>
            <p className="text-xs text-muted-foreground">{team.members?.length || 0} registered member(s)</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Role: <strong className="text-indigo-600 dark:text-indigo-400">{isLeader ? 'Leader' : 'Member'}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {team.members?.map((m: any) => {
            const profile = m.studentProfile;
            const u = profile?.user;
            const isMe = u?.id === authUser?.id || profile?.userId === authUser?.id;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {u?.name?.charAt(0) ?? 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {u?.name || 'Student Member'}
                      {m.isLeader && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                          Leader
                        </span>
                      )}
                      {isMe && <span className="text-xs text-muted-foreground font-normal">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {profile?.studentId || 'N/A'} • {u?.email || 'No email'}
                    </p>
                  </div>
                </div>

                {isLeader && !m.isLeader && team.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMut.mutate({ teamId: team.id, memberId: m.id })}
                    disabled={removeMut.isPending}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-medium"
                  >
                    Remove
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leader Actions: Invite Member Form */}
      {isLeader && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Invite Team Member
            </h3>
            <p className="text-xs text-muted-foreground font-normal">
              Enter a student's Roll Number or Student ID to send them a team invitation.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!inviteStudentId.trim()) return toast.error('Enter a student ID');
              inviteMut.mutate({ teamId: team.id, studentId: inviteStudentId.trim() });
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg"
          >
            <Input
              value={inviteStudentId}
              onChange={(e) => setInviteStudentId(e.target.value)}
              placeholder="e.g. PAS078BCT001"
              className="flex-1"
            />
            <Button type="submit" disabled={inviteMut.isPending} className="btn-primary shrink-0">
              <UserPlus className="w-4 h-4 mr-2" /> Send Invitation
            </Button>
          </form>

          {/* Pending Sent Invites */}
          {pendingSentInvites.length > 0 && (
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pending Sent Invitations ({pendingSentInvites.length}):
              </p>
              <div className="space-y-2">
                {pendingSentInvites.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border text-xs">
                    <span className="font-semibold text-foreground">
                      Student ID: {inv.studentProfile?.studentId || inv.studentProfileId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-semibold">
                      Pending Acceptance
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
