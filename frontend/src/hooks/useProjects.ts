import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/api/projects.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Project } from '@/types/project.types';

export function useProjects(params?: Record<string, unknown>) {
  const { data: rawProjects, isLoading, isError } = useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  });

  const projects = unwrapList<Project>(rawProjects);

  return {
    projects,
    isLoading,
    isError,
  };
}
