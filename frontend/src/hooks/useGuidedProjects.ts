import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { Project } from '@/types';
import { getGuidedProjects } from '@/api';

export function useGuidedProjects(params?: Record<string, unknown>) {
  const { data: rawProjects, isLoading, isError } = useQuery({
    queryKey: ['guided-projects', params],
    queryFn: () => getGuidedProjects(),
  });

  const projects = unwrapList<Project>(rawProjects);

  return {
    projects,
    isLoading,
    isError,
  };
}
