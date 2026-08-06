import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProject, reviewAbstract, updateProjectStatus, updateProject } from '@/api/projects.api';
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
    mutationFn: (data: { status: string; comments?: string }) => {
      const validComments =
        data.comments && data.comments.trim().length >= 5
          ? data.comments.trim()
          : `Abstract ${data.status.toLowerCase().replace(/_/g, ' ')} by coordinator`;
      return reviewAbstract(id, { status: data.status, comments: validComments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Abstract status updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to review abstract');
    },
  });

  const updateProjectStatusMut = useMutation({
    mutationFn: async (status: string) => {
      try {
        return await updateProjectStatus(id, status);
      } catch (_) {
        return await updateProject(id, { status: status as any });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project status updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update project status');
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
    updateProjectStatus: updateProjectStatusMut.mutateAsync,
    assignGuide: assignGuideMut.mutateAsync,
    isReviewing: reviewAbstractMut.isPending,
    isUpdatingStatus: updateProjectStatusMut.isPending,
    isAssigning: assignGuideMut.isPending,
  };
}
