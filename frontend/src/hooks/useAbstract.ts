import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getMyProjects, submitAbstract } from '@/api/projects.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Project } from '@/types/project.types';

export function useAbstract() {
  const queryClient = useQueryClient();

  const { data: rawProjects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: getMyProjects,
  });

  const projects = unwrapList<Project>(rawProjects);
  const project = projects[0] || null;

  const submitAbstractMut = useMutation({
    mutationFn: (projectId: string) => submitAbstract(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success('Abstract submitted for coordinator review!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit abstract');
    },
  });

  return {
    project,
    isLoading,
    submitAbstract: submitAbstractMut.mutateAsync,
    isSubmitting: submitAbstractMut.isPending,
  };
}
