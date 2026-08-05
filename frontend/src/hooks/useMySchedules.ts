import { useQuery } from '@tanstack/react-query';
import { getMySchedules } from '@/api/schedules.api';
import { unwrapList } from '@/utils/apiUtils';
import type { ReviewSchedule } from '@/types/review.types';

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
