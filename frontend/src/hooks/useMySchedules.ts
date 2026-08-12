import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { ReviewSchedule } from '@/types';
import { getMySchedules } from '@/api';

export function useMySchedules(params?: Record<string, unknown>) {
  const { data: rawSchedules, isLoading, isError } = useQuery({
    queryKey: ['my-schedules', params],
    queryFn: getMySchedules,
  });

  const schedules = unwrapList<ReviewSchedule>(rawSchedules);

  return {
    schedules,
    isLoading,
    isError,
  };
}
