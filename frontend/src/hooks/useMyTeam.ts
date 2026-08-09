import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getMyTeam,
  createTeam,
  inviteMember,
  removeMember,
  leaveTeam,
  deleteTeam,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
} from '@/api/teams.api';
import { unwrapData, unwrapList } from '@/utils/apiUtils';
import type { Team } from '@/types/project.types';

export const MY_TEAM_QUERY_KEY = ['my-team'] as const;

export function useMyTeam(enabled = true) {
  const queryClient = useQueryClient();

  const { data: teamRes, isLoading: loadingTeam, isError, refetch } = useQuery({
    queryKey: MY_TEAM_QUERY_KEY,
    queryFn: getMyTeam,
    enabled,
  });

  const { data: invRes } = useQuery({
    queryKey: ['my-pending-invitations'],
    queryFn: getMyInvitations,
    enabled,
  });

  const team = unwrapData<Team>(teamRes) ?? null;
  const invitations = unwrapList<any>(invRes);

  const createMut = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      toast.success('Team created successfully!');
      queryClient.invalidateQueries({ queryKey: MY_TEAM_QUERY_KEY });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create team'),
  });

  const inviteMut = useMutation({
    mutationFn: ({ teamId, studentId }: { teamId: string; studentId: string }) =>
      inviteMember(teamId, studentId),
    onSuccess: () => {
      toast.success('Invitation sent!');
      queryClient.invalidateQueries({ queryKey: MY_TEAM_QUERY_KEY });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send invitation'),
  });

  const removeMut = useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      removeMember(teamId, memberId),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: MY_TEAM_QUERY_KEY });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to remove member'),
  });

  const leaveMut = useMutation({
    mutationFn: (teamId: string) => leaveTeam(teamId),
    onSuccess: () => {
      toast.success('You left the team');
      queryClient.invalidateQueries({ queryKey: MY_TEAM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['my-project'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to leave team'),
  });

  const deleteMut = useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      toast.success('Team disbanded successfully');
      queryClient.invalidateQueries({ queryKey: MY_TEAM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['my-project'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete team'),
  });

  const acceptMut = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      toast.success('Invitation accepted!');
      queryClient.invalidateQueries({ queryKey: MY_TEAM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to accept invitation'),
  });

  const declineMut = useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => {
      toast.success('Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to decline invitation'),
  });

  return {
    team,
    invitations,
    isLoading: loadingTeam,
    isError,
    refetch,
    createTeam: createMut.mutateAsync,
    inviteMember: inviteMut.mutateAsync,
    removeMember: removeMut.mutateAsync,
    leaveTeam: leaveMut.mutateAsync,
    deleteTeam: deleteMut.mutateAsync,
    acceptInvitation: acceptMut.mutateAsync,
    declineInvitation: declineMut.mutateAsync,
    isCreating: createMut.isPending,
    isInviting: inviteMut.isPending,
    isRemoving: removeMut.isPending,
    isLeaving: leaveMut.isPending,
    isDeleting: deleteMut.isPending,
    isAccepting: acceptMut.isPending,
    isDeclining: declineMut.isPending,
  };
}
