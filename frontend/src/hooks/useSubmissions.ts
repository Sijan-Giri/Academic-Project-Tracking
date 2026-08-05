import { useQuery } from '@tanstack/react-query';
import { getSubmissions } from '@/api/submissions.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Submission } from '@/types/project.types';

export function useSubmissions(params?: Record<string, unknown>) {
  const { data: rawSubmissions, isLoading, isError } = useQuery({
    queryKey: ['submissions', params],
    queryFn: () => getSubmissions(params),
  });

  const submissions = unwrapList<Submission>(rawSubmissions);

  return {
    submissions,
    isLoading,
    isError,
  };
}
