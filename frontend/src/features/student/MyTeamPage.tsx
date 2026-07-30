import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Crown, LogOut, Loader2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/shared/StatusBadge';
import { getMyTeam, createTeam, inviteMember, leaveTeam } from '@/api/student.api';
import { useAuthStore } from '@/store/auth.store';

export default function MyTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [inviteRollNo, setInviteRollNo] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data: teamRes, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam
  });

  const createMut = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      toast.success('Team created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create team')
  });

  const inviteMut = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      toast.success('Member invited successfully!');
      setInviteRollNo('');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to invite member')
  });

  const leaveMut = useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      toast.success('Left team successfully');
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to leave team')
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;
  }

  const team = teamRes?.data;
  const isLeader = team?.members?.find((m: any) => m.id === user?.id)?.isLeader;

  if (!team) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Create Team */}
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

        {/* Join Team Info */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join an Existing Team</h2>
          <p className="text-gray-400">To join an existing team, please contact the team leader. They can invite you using your roll number.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {team.name}
            <StatusBadge status={team.status} />
          </h1>
          <p className="text-gray-400 mt-1">Manage your team members and status.</p>
        </div>
        {(!isLeader || team.status === 'PENDING') && (
          <Button variant="danger" onClick={() => leaveMut.mutate()} disabled={leaveMut.isPending} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
            <LogOut className="w-4 h-4 mr-2" /> Leave Team
          </Button>
        )}
      </div>

      {team.status === 'PENDING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium">Approval Pending</h4>
            <p className="text-yellow-400/80 text-sm mt-1">Your team is waiting for coordinator approval. You can still modify team members.</p>
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

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Members ({team.members?.length || 0})</h3>
        </div>

        <div className="space-y-3 mb-6">
          {team.members?.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    {member.name}
                    {member.isLeader && <Crown className="w-4 h-4 text-yellow-500" title="Team Leader" />}
                  </p>
                  <p className="text-gray-500 text-sm">{member.rollNumber} • {member.email}</p>
                </div>
              </div>
              {/* Optional: Add remove button for leader if pending */}
            </div>
          ))}
        </div>

        {isLeader && team.status === 'PENDING' && (
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-white font-medium mb-3">Invite Member</h4>
            <div className="flex gap-3">
              <Input 
                value={inviteRollNo} 
                onChange={e => setInviteRollNo(e.target.value)} 
                placeholder="Student Roll Number" 
                className="bg-white/5 border-white/10 text-white max-w-xs"
              />
              <Button 
                onClick={() => inviteMut.mutate({ rollNumber: inviteRollNo })} 
                disabled={!inviteRollNo || inviteMut.isPending}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {inviteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Invite
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
