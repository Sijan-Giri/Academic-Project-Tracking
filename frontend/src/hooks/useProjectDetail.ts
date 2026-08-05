import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProject, reviewAbstract } from '@/api/projects.api';
import { assignGuide } from '@/api/guides.api';
import { unwrapData } from '@/utils/apiUtils';
import type { Project } from '@/types/project.types';

export function useProjectDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: rawProject, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  });

  const project = unwrapData<Project>(rawProject);

  const reviewAbstractMut = useMutation({
    mutationFn: (data: { status: 'ABSTRACT_APPROVED' | 'ABSTRACT_REJECTED'; comments?: string }) =>
      reviewAbstract(id, { status: data.status, comments: data.comments || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Abstract status updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to review abstract');
    },
  });

  const assignGuideMut = useMutation({
    mutationFn: (facultyProfileId: string) =>
      assignGuide({ projectId: id, facultyProfileId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Guide assigned successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to assign guide');
    },
  });

  return {
    project,
    isLoading,
    isError,
    reviewAbstract: reviewAbstractMut.mutateAsync,
    assignGuide: assignGuideMut.mutateAsync,
    isReviewing: reviewAbstractMut.isPending,
    isAssigning: assignGuideMut.isPending,
  };
}
