// ─────────────────────────────────────────────────────────────────────────────
// hooks/useMyProjects.ts
// Custom hook to fetch the current student's projects.
// Encapsulates query key, query function, and data unwrapping.
// Used in: StudentDashboard, Header
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { Project } from '@/types';
import { getMyProjects } from '@/api';

export const MY_PROJECTS_QUERY_KEY = ['my-projects'] as const;

export interface UseMyProjectsReturn {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch and unwrap the current student's projects.
 */
export function useMyProjects(enabled = true): UseMyProjectsReturn {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: MY_PROJECTS_QUERY_KEY,
    queryFn: getMyProjects,
    enabled,
  });

  const projects = unwrapList<Project>(data);
  const currentProject = projects[0] ?? null;

  return { projects, currentProject, isLoading, isError, refetch };
}
