import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { Project } from '@/types';
import { getProjects } from '@/api';

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
