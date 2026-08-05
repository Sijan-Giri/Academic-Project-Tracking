import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getMilestones, updateMilestoneStatus } from '@/api/milestones.api';
import { createSubmission } from '@/api/submissions.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Milestone } from '@/types/project.types';

export function useMilestones(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data: rawMilestones, isLoading } = useQuery({
    queryKey: ['milestones', params],
    queryFn: () => getMilestones(params),
  });

  const milestones = unwrapList<Milestone>(rawMilestones);

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      updateMilestoneStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone status updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
  });

  const uploadSubmissionMut = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Milestone submission uploaded!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to upload submission');
    },
  });

  return {
    milestones,
    isLoading,
    updateMilestoneStatus: updateStatusMut.mutateAsync,
    uploadSubmission: uploadSubmissionMut.mutateAsync,
    isSubmitting: updateStatusMut.isPending || uploadSubmissionMut.isPending,
  };
}
