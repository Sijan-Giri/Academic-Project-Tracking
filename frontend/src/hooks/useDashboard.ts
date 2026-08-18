import { useQuery } from '@tanstack/react-query'; 

import { unwrapList } from '@/utils';
import { getUsers, getProjects, getGuidedProjects, getDepartments, getTeams, getMySchedules, api } from '@/api';

export function useAdminDashboardData() {
  const { data: usersResponse, isLoading: loadingUsers } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => getUsers({ limit: 100 }),
    staleTime: 60 * 1000,
  });
  const { data: projectsResponse, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => getProjects({ limit: 100 }),
    staleTime: 60 * 1000,
  });
  const { data: deptResponse, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments-list'],
    queryFn: getDepartments,
    staleTime: 60 * 1000,
  });
  const { data: auditResponse, isLoading: loadingAudit } = useQuery({
    queryKey: ['recent-audit-logs'],
    queryFn: () => api.get('/audit', { params: { limit: 5 } }).then(r => r.data),
    staleTime: 60 * 1000,
  });

  return {
    users: unwrapList(usersResponse),
    projects: unwrapList(projectsResponse),
    departments: unwrapList(deptResponse),
    logs: unwrapList(auditResponse),
    isLoading: loadingUsers || loadingProjects || loadingDepts || loadingAudit,
  };
}

export function useCoordinatorDashboardData() {
  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['coordinator-projects'],
    queryFn: () => getProjects(),
    staleTime: 60 * 1000,
  });
  const { data: teamsRes, isLoading: loadingTeams } = useQuery({
    queryKey: ['coordinator-teams'],
    queryFn: () => getTeams(),
    staleTime: 60 * 1000,
  });

  return {
    projects: unwrapList(projectsRes),
    teams: unwrapList(teamsRes),
    isLoading: loadingProjects || loadingTeams,
  };
}

export function useFacultyDashboardData() {
  const { data: rawGuided, isLoading: loadingGuided } = useQuery({
    queryKey: ['guided-projects'],
    queryFn: getGuidedProjects,
    staleTime: 60 * 1000,
  });
  const { data: rawSchedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['my-schedules'],
    queryFn: getMySchedules,
    staleTime: 60 * 1000,
  });

  return {
    guidedProjects: unwrapList(rawGuided),
    schedules: unwrapList(rawSchedules),
    isLoading: loadingGuided || loadingSchedules,
  };
}
