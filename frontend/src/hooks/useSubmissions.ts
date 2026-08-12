import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { Submission } from '@/types';
import { getSubmissions } from '@/api';

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
