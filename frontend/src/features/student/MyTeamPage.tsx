import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserPlus, Crown, LogOut, Loader2, Info, AlertTriangle,
  CheckCircle2, Clock, Mail, Check, X, Send, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import {
  getMyTeam, createTeam, inviteMember, leaveTeam, removeMember,
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
  const { data: myInvitationsRes } = useQuery({
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
      toast.success('Team created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create team'),
  });

  const inviteMut = useMutation({
    mutationFn: ({ teamId, rollNo }: { teamId: string; rollNo: string }) =>
      inviteMember(teamId, rollNo),
    onSuccess: () => {
      toast.success('Invitation sent! Member must accept to join.');
      setInviteRollNo('');
      queryClient.invalidateQueries({ queryKey: ['team-invitations', team?.id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send invitation'),
  });

  const removeMut = useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      removeMember(teamId, memberId),
    onSuccess: () => {
      toast.success('Member removed from team');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to remove member'),
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

  // ── Loading Skeleton ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
        <div className="h-64 dark:bg-white/5 bg-slate-200/60 rounded-3xl border dark:border-white/10 border-slate-200" />
      </div>
    );
  }

  // ── No team — show create + received invitations ──────────────────────────

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Team Management"
          subtitle="Form a new capstone project team or accept an invitation from your team leader."
        />

        {/* Pending received invitations banner */}
        {myInvitations.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl dark:bg-indigo-500/10 bg-indigo-50/80 border dark:border-indigo-500/30 border-indigo-200/80 p-6 md:p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-extrabold dark:text-white text-slate-900 flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Pending Team Invitations
                <span className="px-2.5 py-0.5 rounded-full dark:bg-indigo-500/30 dark:text-indigo-300 bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                  {myInvitations.length} new
                </span>
              </h2>
            </div>
            <p className="dark:text-gray-300 text-slate-600 text-sm mb-5 font-medium">
              Accept an invitation to join a capstone team, or decline if you're not joining.
            </p>
            <div className="space-y-3.5">
              {myInvitations.map((inv: any) => {
                const inviterUser = inv.invitedBy?.user;
                const teamMembers = inv.team?.members ?? [];
                return (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-black/20 bg-white border dark:border-white/10 border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-500/20 shrink-0">
                        {inv.team?.name?.charAt(0) ?? 'T'}
                      </div>
                      <div>
                        <p className="dark:text-white text-slate-900 font-extrabold text-base">{inv.team?.name}</p>
                        <p className="dark:text-gray-400 text-slate-500 text-sm font-medium">
                          Invited by <strong className="dark:text-indigo-300 text-indigo-700">{inviterUser?.name ?? 'Team Leader'}</strong>
                          {' • '}{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                        </p>
                        <p className="dark:text-gray-500 text-slate-400 text-xs mt-1 font-medium">
                          Sent {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 sm:shrink-0">
                      <Button
                        size="sm"
                        onClick={() => declineMut.mutate(inv.id)}
                        disabled={declineMut.isPending || acceptMut.isPending}
                        className="dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl"
                      >
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptMut.mutate(inv.id)}
                        disabled={acceptMut.isPending || declineMut.isPending}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-500/20 rounded-xl"
                      >
                        {acceptMut.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                        Accept Invitation
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create or Join Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Team Card */}
          <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-7 md:p-8 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold dark:text-white text-slate-900 mb-2 tracking-tight">Create a New Team</h2>
              <p className="dark:text-gray-400 text-slate-500 text-sm mb-6 leading-relaxed font-medium">
                Start a team as leader, give it a unique name, and invite your project teammates by roll number.
              </p>
            </div>
            <div className="w-full space-y-4 pt-2">
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Enter team name (e.g. Apex Innovators)"
                className="w-full h-11 dark:bg-white/5 bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl"
              />
              <Button
                onClick={() => createMut.mutate({ name: teamName })}
                disabled={!teamName || createMut.isPending}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/25 rounded-xl"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Create Team
              </Button>
            </div>
          </div>

          {/* Join Team Card */}
          <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-7 md:p-8 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-violet-500/20">
                <UserPlus className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold dark:text-white text-slate-900 mb-2 tracking-tight">Join an Existing Team</h2>
              <p className="dark:text-gray-400 text-slate-500 text-sm leading-relaxed font-medium">
                {myInvitations.length > 0
                  ? 'You have pending invitations above. Accept an invitation to join your team.'
                  : 'Ask your team leader to send an invitation to your student roll number. Your invitation will appear here automatically.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200/70 text-xs font-semibold dark:text-gray-300 text-slate-600 flex items-center gap-2 mt-6">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              Invitations require leader approval and student acceptance.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Has a team ───────────────────────────────────────────────────────────

  const pendingSentInvites = sentInvitations.filter((i: any) => i.status === 'PENDING');
  const historySentInvites = sentInvitations.filter((i: any) => i.status !== 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="My Team"
        subtitle="Manage your capstone project team roster, invites, and approval status."
      />

      {/* Team Info Header Card */}
      <div className="relative overflow-hidden rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-300 bg-indigo-50 text-indigo-700 border border-indigo-200">
                Team #{team.id.substring(0, 8)}
              </span>
              <StatusBadge status={team.status} type="team" />
            </div>
            <h1 className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              {team.name}
            </h1>
          </div>
          {!isLeader && team.status === 'PENDING' && (
            <Button
              variant="destructive"
              onClick={() => leaveMut.mutate(team.id)}
              disabled={leaveMut.isPending}
              className="dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" /> Leave Team
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert Banners */}
      {team.status === 'PENDING' && (
        <div className="rounded-2xl dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 bg-amber-50 border border-amber-200 text-amber-800 p-4 md:p-5 flex items-start gap-3.5 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Coordinator Approval Pending</h4>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              Your team is currently pending approval by the project coordinator. You can still invite team members in the meantime.
            </p>
          </div>
        </div>
      )}
      {team.status === 'REJECTED' && (
        <div className="rounded-2xl dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 bg-rose-50 border border-rose-200 text-rose-800 p-4 md:p-5 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Team Proposal Rejected</h4>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              {team.rejectionReason || 'Your team registration was declined by the coordinator. Please contact your coordinator for details.'}
            </p>
          </div>
        </div>
      )}
      {team.status === 'APPROVED' && (
        <div className="rounded-2xl dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 md:p-5 flex items-start gap-3.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Team Approved Officially</h4>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              Your team is officially registered and approved by the academic coordinator.
            </p>
          </div>
        </div>
      )}

      {/* Team Roster Card */}
      <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-xl font-extrabold dark:text-white text-slate-900 mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Team Members
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-300 bg-indigo-50 text-indigo-700 border border-indigo-200">
            {team.members?.length || 0} Members
          </span>
        </h3>

        <div className="space-y-3.5">
          {team.members?.map((member: any) => {
            const memberUser = member.studentProfile?.user;
            const displayName = memberUser?.name ?? 'Student Member';
            const rollNumber = member.studentProfile?.studentId ?? '';
            const displayEmail = memberUser?.email ?? '';
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200/70 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-indigo-500/20 shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="dark:text-white text-slate-900 font-extrabold text-base flex items-center gap-2">
                      {displayName}
                      {member.isLeader && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                          <Crown className="w-3.5 h-3.5 mr-1 text-amber-500" /> Leader
                        </span>
                      )}
                    </p>
                    <p className="dark:text-gray-400 text-slate-500 text-xs font-medium mt-0.5">
                      {rollNumber}{rollNumber && displayEmail ? ' • ' : ''}{displayEmail}
                    </p>
                  </div>
                </div>
                {isLeader && !member.isLeader && team.status !== 'REJECTED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMut.mutate({ teamId: team.id, memberId: member.id })}
                    disabled={removeMut.isPending}
                    className="dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl"
                  >
                    Remove Member
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Section (Leader only, non-rejected) */}
      {isLeader && team.status !== 'REJECTED' && (
        <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 space-y-8">
          {/* Invite input form */}
          <div>
            <h3 className="text-xl font-extrabold dark:text-white text-slate-900 mb-2 flex items-center gap-2.5">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Invite a New Teammate
            </h3>
            <p className="dark:text-gray-400 text-slate-500 text-sm mb-5 font-medium">
              Enter a student's roll number. They will receive a notification and must <strong className="dark:text-white text-slate-800">accept</strong> the invitation before joining.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <Input
                value={inviteRollNo}
                onChange={e => setInviteRollNo(e.target.value)}
                placeholder="Student Roll Number (e.g. CS2023004)"
                className="h-11 dark:bg-white/5 bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl"
                onKeyDown={e => {
                  if (e.key === 'Enter' && inviteRollNo) {
                    inviteMut.mutate({ teamId: team.id, rollNo: inviteRollNo });
                  }
                }}
              />
              <Button
                onClick={() => inviteMut.mutate({ teamId: team.id, rollNo: inviteRollNo })}
                disabled={!inviteRollNo || inviteMut.isPending}
                className="h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 rounded-xl sm:shrink-0"
              >
                {inviteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Send Invitation
              </Button>
            </div>
          </div>

          {/* Pending sent invitations */}
          {pendingSentInvites.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 text-slate-500 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Awaiting Student Response ({pendingSentInvites.length})
              </h4>
              <div className="space-y-2.5">
                {pendingSentInvites.map((inv: any) => {
                  const invitee = inv.studentProfile?.user;
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-2xl dark:bg-amber-500/10 dark:border-amber-500/20 bg-amber-50/80 border border-amber-200/80 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-sm border border-amber-200 dark:border-amber-500/30">
                          {invitee?.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="dark:text-white text-slate-900 font-bold text-sm">{invitee?.name ?? 'Student'}</p>
                          <p className="dark:text-gray-400 text-slate-500 text-xs font-medium">{inv.studentProfile?.studentId ?? invitee?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full dark:bg-amber-500/20 dark:text-amber-300 bg-amber-100 text-amber-800 border border-amber-200">
                        Pending Accept
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invitation History */}
          {historySentInvites.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider dark:text-gray-400 text-slate-500 mb-3">
                Invitation Activity History
              </h4>
              <div className="space-y-2.5">
                {historySentInvites.map((inv: any) => {
                  const invitee = inv.studentProfile?.user;
                  const isAccepted = inv.status === 'ACCEPTED';
                  return (
                    <div
                      key={inv.id}
                      className={cn(
                        'flex items-center justify-between rounded-2xl p-4 border',
                        isAccepted
                          ? 'dark:bg-emerald-500/10 dark:border-emerald-500/20 bg-emerald-50/80 border-emerald-200/80'
                          : 'dark:bg-rose-500/10 dark:border-rose-500/20 bg-rose-50/80 border-rose-200/80'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-xl font-extrabold flex items-center justify-center text-sm border',
                            isAccepted
                              ? 'dark:bg-emerald-500/20 dark:text-emerald-300 bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'dark:bg-rose-500/20 dark:text-rose-300 bg-rose-100 text-rose-800 border-rose-200'
                          )}
                        >
                          {invitee?.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="dark:text-white text-slate-900 font-bold text-sm">{invitee?.name ?? 'Student'}</p>
                          <p className="dark:text-gray-400 text-slate-500 text-xs font-medium">{inv.studentProfile?.studentId ?? invitee?.email}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-extrabold px-3 py-1 rounded-full border',
                          isAccepted
                            ? 'dark:bg-emerald-500/20 dark:text-emerald-300 bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'dark:bg-rose-500/20 dark:text-rose-300 bg-rose-100 text-rose-800 border-rose-200'
                        )}
                      >
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
