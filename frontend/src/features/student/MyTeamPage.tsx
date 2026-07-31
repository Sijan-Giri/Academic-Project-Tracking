import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserPlus, Crown, LogOut, Loader2, Info, AlertTriangle,
  CheckCircle2, Clock, Mail, Check, X, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/shared/StatusBadge';
import {
  getMyTeam, createTeam, inviteMember, leaveTeam,
  getMyInvitations, acceptInvitation, declineInvitation, getTeamInvitations
} from '@/api/teams.api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export default function MyTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [inviteRollNo, setInviteRollNo] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  // Own team
  const { data: teamRes, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    retry: false,
  });

  // Pending invitations received (shown when student has no team)
  const { data: myInvitationsRes, isLoading: invitesLoading } = useQuery({
    queryKey: ['my-invitations'],
    queryFn: getMyInvitations,
    retry: false,
  });

  const rawTeam = teamRes as any;
  const team = rawTeam?.data ?? (rawTeam?.id ? rawTeam : null);

  const rawInvites = myInvitationsRes as any;
  const myInvitations: any[] = Array.isArray(rawInvites)
    ? rawInvites
    : Array.isArray(rawInvites?.data) ? rawInvites.data : [];

  // Invitations the leader sent (shown on team page)
  const { data: sentInvitesRes } = useQuery({
    queryKey: ['team-invitations', team?.id],
    queryFn: () => getTeamInvitations(team!.id),
    enabled: !!team?.id,
    retry: false,
  });
  const rawSent = sentInvitesRes as any;
  const sentInvitations: any[] = Array.isArray(rawSent)
    ? rawSent
    : Array.isArray(rawSent?.data) ? rawSent.data : [];

  // Is the current user the leader?
  const isLeader = team?.members?.some((m: any) => {
    const memberUserId = m.studentProfile?.userId ?? m.studentProfile?.user?.id;
    return memberUserId === user?.id && m.isLeader;
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMut = useMutation({
    mutationFn: (data: { name: string }) => createTeam(data),
    onSuccess: () => {
      toast.success('Team created!');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create team'),
  });

  const inviteMut = useMutation({
    mutationFn: ({ teamId, rollNo }: { teamId: string; rollNo: string }) =>
      inviteMember(teamId, rollNo),
    onSuccess: () => {
      toast.success('Invitation sent! They must accept it to join.');
      setInviteRollNo('');
      queryClient.invalidateQueries({ queryKey: ['team-invitations', team?.id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send invitation'),
  });

  const leaveMut = useMutation({
    mutationFn: (teamId: string) => leaveTeam(teamId),
    onSuccess: () => {
      toast.success('Left team successfully');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to leave team'),
  });

  const acceptMut = useMutation({
    mutationFn: (id: string) => acceptInvitation(id),
    onSuccess: () => {
      toast.success('You joined the team!');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to accept invitation'),
  });

  const declineMut = useMutation({
    mutationFn: (id: string) => declineInvitation(id),
    onSuccess: () => {
      toast.success('Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to decline invitation'),
  });

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;
  }

  // ── No team — show create + received invitations ──────────────────────────

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Pending received invitations */}
        {myInvitations.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              Pending Team Invitations
              <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold">
                {myInvitations.length}
              </span>
            </h2>
            <p className="text-gray-400 text-sm mb-5">Accept an invitation to join a team, or decline if you're not interested.</p>
            <div className="space-y-3">
              {myInvitations.map((inv: any) => {
                const inviterUser = inv.invitedBy?.user;
                const teamMembers = inv.team?.members ?? [];
                return (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 border border-white/5 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {inv.team?.name?.charAt(0) ?? 'T'}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-base">{inv.team?.name}</p>
                        <p className="text-gray-400 text-sm">
                          Invited by <span className="text-indigo-300">{inviterUser?.name ?? 'Team Leader'}</span>
                          {' · '}{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      <Button
                        size="sm"
                        onClick={() => declineMut.mutate(inv.id)}
                        disabled={declineMut.isPending || acceptMut.isPending}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                      >
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptMut.mutate(inv.id)}
                        disabled={acceptMut.isPending || declineMut.isPending}
                        className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/20"
                      >
                        {acceptMut.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create / Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create a New Team</h2>
            <p className="text-gray-400 mb-6">Start a new team as a leader and invite your peers.</p>
            <div className="w-full space-y-4">
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="bg-white/5 border-white/10 text-white w-full"
              />
              <Button
                onClick={() => createMut.mutate({ name: teamName })}
                disabled={!teamName || createMut.isPending}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Team
              </Button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join an Existing Team</h2>
            <p className="text-gray-400">
              {myInvitations.length > 0
                ? 'You have pending invitations above. Accept one to join.'
                : 'Ask your team leader to invite you using your roll number. The invitation will appear here.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Has a team ───────────────────────────────────────────────────────────

  const pendingSentInvites = sentInvitations.filter((i: any) => i.status === 'PENDING');
  const historySentInvites = sentInvitations.filter((i: any) => i.status !== 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {team.name}
            <StatusBadge status={team.status} type="team" />
          </h1>
          <p className="text-gray-400 mt-1">Manage your team members and invitations.</p>
        </div>
        {!isLeader && team.status === 'PENDING' && (
          <Button variant="destructive" onClick={() => leaveMut.mutate(team.id)} disabled={leaveMut.isPending} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
            <LogOut className="w-4 h-4 mr-2" /> Leave Team
          </Button>
        )}
      </div>

      {/* Status banners */}
      {team.status === 'PENDING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium">Approval Pending</h4>
            <p className="text-yellow-400/80 text-sm mt-1">Your team is waiting for coordinator approval. You can still invite members.</p>
          </div>
        </div>
      )}
      {team.status === 'REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-medium">Team Rejected</h4>
            <p className="text-red-400/80 text-sm mt-1">{team.rejectionReason || 'Contact coordinator for details.'}</p>
          </div>
        </div>
      )}
      {team.status === 'APPROVED' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <h4 className="text-emerald-400 font-medium">Team Approved</h4>
            <p className="text-emerald-400/80 text-sm mt-1">Your team is approved. Team composition is locked.</p>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Members <span className="text-gray-500 text-base font-normal">({team.members?.length || 0})</span>
        </h3>

        <div className="space-y-3">
          {team.members?.map((member: any) => {
            const memberUser = member.studentProfile?.user;
            const displayName = memberUser?.name ?? 'Unknown';
            const rollNumber = member.studentProfile?.studentId ?? '';
            const displayEmail = memberUser?.email ?? '';
            return (
              <div key={member.id} className="flex items-center gap-4 bg-black/20 border border-white/5 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium flex items-center gap-2">
                    {displayName}
                    {member.isLeader && <Crown className="w-4 h-4 text-yellow-500" title="Team Leader" />}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    {rollNumber}{rollNumber && displayEmail ? ' · ' : ''}{displayEmail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite + sent invitations (leader only, pending team) */}
      {isLeader && team.status === 'PENDING' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Invite input */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" /> Invite a Member
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter the student's roll number. They will receive a notification and must <strong className="text-white">accept</strong> the invitation to join.
            </p>
            <div className="flex gap-3">
              <Input
                value={inviteRollNo}
                onChange={e => setInviteRollNo(e.target.value)}
                placeholder="Student Roll Number"
                className="bg-white/5 border-white/10 text-white max-w-xs"
                onKeyDown={e => {
                  if (e.key === 'Enter' && inviteRollNo) {
                    inviteMut.mutate({ teamId: team.id, rollNo: inviteRollNo });
                  }
                }}
              />
              <Button
                onClick={() => inviteMut.mutate({ teamId: team.id, rollNo: inviteRollNo })}
                disabled={!inviteRollNo || inviteMut.isPending}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {inviteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Send Invite
              </Button>
            </div>
          </div>

          {/* Pending sent invitations */}
          {pendingSentInvites.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Awaiting Response ({pendingSentInvites.length})
              </h4>
              <div className="space-y-2">
                {pendingSentInvites.map((inv: any) => {
                  const invitee = inv.studentProfile?.user;
                  return (
                    <div key={inv.id} className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm font-bold">
                          {invitee?.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{invitee?.name ?? 'Unknown'}</p>
                          <p className="text-gray-500 text-xs">{inv.studentProfile?.studentId ?? invitee?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invitation history */}
          {historySentInvites.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Invitation History</h4>
              <div className="space-y-2">
                {historySentInvites.map((inv: any) => {
                  const invitee = inv.studentProfile?.user;
                  const isAccepted = inv.status === 'ACCEPTED';
                  return (
                    <div key={inv.id} className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 border',
                      isAccepted
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          isAccepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        )}>
                          {invitee?.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{invitee?.name ?? 'Unknown'}</p>
                          <p className="text-gray-500 text-xs">{inv.studentProfile?.studentId ?? invitee?.email}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium border',
                        isAccepted
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      )}>
                        {isAccepted ? 'Accepted' : 'Declined'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
