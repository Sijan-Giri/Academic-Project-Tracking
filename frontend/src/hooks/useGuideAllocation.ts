import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProjects } from '@/api/projects.api';
import { getAvailableGuides, assignGuide, removeGuideAssignment } from '@/api/guides.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Project } from '@/types/project.types';

export function useGuideAllocation() {
  const queryClient = useQueryClient();

  const { data: rawProjects, isLoading: loadingProjects } = useQuery({
    queryKey: ['guide-allocation-projects'],
    queryFn: () => getProjects(),
  });

  const { data: rawGuides, isLoading: loadingGuides } = useQuery({
    queryKey: ['available-guides'],
    queryFn: getAvailableGuides,
  });

  const projects = unwrapList<Project>(rawProjects);
  const guides = unwrapList<any>(rawGuides);

  const assignMut = useMutation({
    mutationFn: assignGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-allocation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Guide assigned successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to assign guide');
    },
  });

  const removeMut = useMutation({
    mutationFn: removeGuideAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-allocation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Guide assignment removed!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove guide assignment');
    },
  });

  return {
    projects,
    guides,
    isLoading: loadingProjects || loadingGuides,
    assignGuide: assignMut.mutateAsync,
    removeGuide: removeMut.mutateAsync,
    isSubmitting: assignMut.isPending || removeMut.isPending,
  };
}
