import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTeams, approveTeam, rejectTeam } from '@/api/teams.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Team } from '@/types/project.types';

export function useTeamApprovals(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data: rawTeams, isLoading } = useQuery({
    queryKey: ['coordinator-teams', params],
    queryFn: () => getTeams(params),
  });

  const teams = unwrapList<Team>(rawTeams);

  const approveMut = useMutation({
    mutationFn: approveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-teams'] });
      toast.success('Team approved successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to approve team');
    },
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectTeam(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-teams'] });
      toast.success('Team rejected successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reject team');
    },
  });

  return {
    teams,
    isLoading,
    approveTeam: approveMut.mutateAsync,
    rejectTeam: rejectMut.mutateAsync,
    isSubmitting: approveMut.isPending || rejectMut.isPending,
  };
}
