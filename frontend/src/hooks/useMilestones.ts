import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 

import { unwrapList } from '@/utils';
import { useMyProjects } from '@/hooks/useMyProjects';
import type { Milestone } from '@/types';
import { getMilestones, updateMilestoneStatus, createSubmission } from '@/api';

export function useMilestones(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { projects } = useMyProjects();
  const projectId = (params?.projectId as string) ?? projects[0]?.id;

  const { data: rawMilestones, isLoading } = useQuery({
    queryKey: ['milestones', projectId, params],
    queryFn: () => getMilestones({ ...params, ...(projectId ? { projectId } : {}) }),
    
    enabled: true,
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
