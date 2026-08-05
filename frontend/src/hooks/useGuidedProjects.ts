import { useQuery } from '@tanstack/react-query';
import { getGuidedProjects } from '@/api/projects.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Project } from '@/types/project.types';

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
