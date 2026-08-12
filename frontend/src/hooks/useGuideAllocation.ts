import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 

import { unwrapList } from '@/utils';
import type { Project } from '@/types';
import { getProjects, getAvailableGuides, getGuideAssignments, assignGuide, removeGuideAssignment } from '@/api';

export function useGuideAllocation() {
  const queryClient = useQueryClient();

  const { data: rawProjects, isLoading: loadingProjects } = useQuery({
    queryKey: ['guide-allocation-projects'],
    queryFn: () => getProjects({ limit: 100 }),
  });

  const { data: rawGuides, isLoading: loadingGuides } = useQuery({
    queryKey: ['available-guides'],
    queryFn: getAvailableGuides,
  });

  const { data: rawAssignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['all-guide-assignments'],
    queryFn: getGuideAssignments,
  });

  const projects = unwrapList<Project>(rawProjects);
  const guides = unwrapList<any>(rawGuides);
  const assignments = unwrapList<any>(rawAssignments);

  const assignMut = useMutation({
    mutationFn: assignGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-guide-assignments'] });
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
      queryClient.invalidateQueries({ queryKey: ['all-guide-assignments'] });
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
    assignments,
    isLoading: loadingProjects || loadingGuides || loadingAssignments,
    assignGuide: assignMut.mutateAsync,
    removeGuide: removeMut.mutateAsync,
    isSubmitting: assignMut.isPending || removeMut.isPending,
  };
}
