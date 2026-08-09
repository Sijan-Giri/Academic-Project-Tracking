import { useState } from 'react';
import { Users, UserPlus, LogOut, Info, AlertTriangle, Mail, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { useMyTeam } from '@/hooks/useMyTeam';
import { MyTeamSkeleton } from '@/components/shared/Skeletons';

export default function MyTeamPage() {
  const authUser = useAuthStore(s => s.user);

  const [teamName, setTeamName] = useState('');
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [activeTab, setActiveTab] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    team,
    invitations,
    isLoading: teamLoading,
    createTeam,
    inviteMember,
    removeMember,
    leaveTeam,
    deleteTeam,
    acceptInvitation,
    declineInvitation,
    isCreating,
    isInviting,
    isRemoving,
    isLeaving,
    isDeleting,
    isAccepting,
    isDeclining,
  } = useMyTeam();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    try {
      await createTeam({ name: teamName });
      setTeamName('');
    } catch (_) {}
  };

  const handleInvite = async () => {
    if (!inviteStudentId.trim() || !team) return;
    try {
      await inviteMember({ teamId: team.id, studentId: inviteStudentId });
      setInviteStudentId('');
    } catch (_) {}
  };

  const handleRemove = async (memberId: string) => {
    if (!team) return;
    try {
      await removeMember({ teamId: team.id, memberId });
    } catch (_) {}
  };

  const handleLeave = async () => {
    if (!team) return;
    try {
      await leaveTeam(team.id);
    } catch (_) {}
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    try {
      await deleteTeam(team.id);
      setDeleteModalOpen(false);
    } catch (_) {}
  };

  // Early return for skeleton rendering AFTER all hooks are declared
  if (teamLoading) {
    return <MyTeamSkeleton />;
  }

  const myInvitations = invitations;

  // Check if student is team leader
  const myMemberRecord = team?.members?.find(
    (m: any) => m.studentProfile?.userId === authUser?.id || m.studentProfileId === authUser?.studentProfile?.id
  );
  const isLeader = myMemberRecord?.isLeader ?? false;

  const sentInvitations: any[] = (team as any)?.invitations || [];

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
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
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
                      onClick={() => acceptInvitation(inv.id)}
                      className="btn-primary"
                      isLoading={isAccepting}
                      loadingText="Accepting..."
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineInvitation(inv.id)}
                      isLoading={isDeclining}
                      loadingText="Declining..."
                    >
                      <X className="w-4 h-4 mr-1.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create / Join Team Tabs */}
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('CREATE')}
              className={cn(
                'flex-1 py-4 text-center font-semibold text-sm transition-colors border-b-2',
                activeTab === 'CREATE'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-secondary/50'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Create New Team
            </button>
            <button
              onClick={() => setActiveTab('JOIN')}
              className={cn(
                'flex-1 py-4 text-center font-semibold text-sm transition-colors border-b-2',
                activeTab === 'JOIN'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-secondary/50'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Join Existing Team
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'CREATE' ? (
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Form a Project Team</h3>
                  <p className="text-xs text-muted-foreground font-normal">
                    You will become the team leader and can invite peers using their Student Roll IDs.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="teamName" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Team Name</Label>
                    <Input
                      id="teamName"
                      placeholder="e.g. CyberNova Squad"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <Button
                    onClick={handleCreateTeam}
                    disabled={!teamName.trim()}
                    className="btn-primary w-full"
                    isLoading={isCreating}
                    loadingText="Creating Team..."
                  >
                    Create Team & Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-2">
                  <Info className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">How to Join a Team</h3>
                <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                  To join an existing team, ask your team leader to send an invitation to your Student Roll ID (<strong className="text-foreground">{authUser?.studentProfile?.studentId || 'Your Roll ID'}</strong>). Received invitations will appear above automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Existing Team View ───────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="My Team Roster"
        subtitle="Manage team members, invite new peers, and track team status."
        actions={
          isLeader ? (
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(true)}
              className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Disband Team
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleLeave}
              className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 text-xs font-semibold"
              isLoading={isLeaving}
              loadingText="Leaving Team..."
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Leave Team
            </Button>
          )
        }
      />

      {/* Team Header Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-foreground tracking-tight">{team.name}</h2>
            <StatusBadge status={team.status} type="team" />
          </div>
          <p className="text-xs text-muted-foreground font-normal">
            Created on {new Date(team.createdAt || Date.now()).toLocaleDateString()} · {team.members?.length || 0} Member(s)
          </p>
        </div>

        {team.status === 'PENDING' && (
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 px-3 py-1.5 rounded-md border border-amber-200 dark:border-amber-500/30 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Pending Coordinator Approval
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Team Members ({team.members?.length || 0})
              </h3>
            </div>

            <div className="space-y-3">
              {team.members?.map((m: any) => {
                const user = m.studentProfile?.user;
                const studentId = m.studentProfile?.studentId;
                const isMe = user?.id === authUser?.id;

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-lg bg-card border border-border flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{user?.name || 'Unknown Student'}</span>
                          {isMe && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-semibold border border-border">You</span>}
                          {m.isLeader && (
                            <span className="text-[10px] bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {studentId && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{studentId}</span>}
                      {isLeader && !m.isLeader && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(m.id)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 h-8 text-xs font-semibold"
                          isLoading={isRemoving}
                          loadingText="Removing..."
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Invite Sidebar */}
        <div className="space-y-6">
          {isLeader && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-semibold text-foreground">Invite Team Member</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inviteId" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Student Roll ID</Label>
                  <Input
                    id="inviteId"
                    placeholder="e.g. STU-2026-0042"
                    value={inviteStudentId}
                    onChange={(e) => setInviteStudentId(e.target.value)}
                    className="input-field"
                  />
                </div>

                <Button
                  onClick={handleInvite}
                  disabled={!inviteStudentId.trim()}
                  className="btn-primary w-full"
                  isLoading={isInviting}
                  loadingText="Sending Invitation..."
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          )}

          {/* Sent Pending Invitations */}
          {sentInvitations.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Sent Invitations ({sentInvitations.length})
              </h3>
              <div className="space-y-2">
                {sentInvitations.map((inv: any) => (
                  <div key={inv.id} className="p-3 bg-secondary/50 rounded-lg border border-border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{inv.studentProfile?.user?.name || inv.studentProfileId}</p>
                      <p className="text-[11px] text-muted-foreground">Status: Pending</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-semibold text-[10px]">
                      Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteTeam}
        isLoading={isDeleting}
        loadingLabel="Disbanding Team..."
        title="Disband & Delete Team"
        description={`Are you sure you want to delete team "${team?.name}"? All team members will be removed and any associated project or invitations will be deleted. This action cannot be undone.`}
        confirmLabel="Disband Team"
        variant="danger"
      />
    </div>
  );
}
