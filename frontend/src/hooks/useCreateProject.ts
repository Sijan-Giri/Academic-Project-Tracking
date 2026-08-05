import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProject } from '@/api/projects.api';
import { getMyTeam } from '@/api/teams.api';
import { getSemesters } from '@/api/semesters.api';
import { unwrapData, unwrapList } from '@/utils/apiUtils';
import { ROUTES } from '@/constants/routes';
import type { Team } from '@/types/project.types';
import type { Semester } from '@/types/system.types';

export function useCreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawTeam, isLoading: loadingTeam } = useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
  });

  const { data: rawSemesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => getSemesters({ isCurrent: true }),
  });

  const team = unwrapData<Team>(rawTeam);
  const semesters = unwrapList<Semester>(rawSemesters);

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project proposal created successfully!');
      navigate(ROUTES.MY_PROJECT);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create project proposal');
    },
  });

  return {
    team,
    semesters,
    isLoading: loadingTeam,
    createProject: createMut.mutateAsync,
    isSubmitting: createMut.isPending,
  };
}
