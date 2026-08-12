import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSchedule } from '@/api/schedules.api';
import { getStageCriteria } from '@/api/reviews.api';
import { submitEvaluation } from '@/api/evaluations.api';
import { unwrapData, unwrapList } from '@/utils/apiUtils';
import { ROUTES } from '@/constants';
import type { ReviewSchedule, EvaluationCriteria } from '@/types/review.types';

export function useEvaluationForm(scheduleId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawSchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => getSchedule(scheduleId),
    enabled: Boolean(scheduleId),
  });

  const schedule = unwrapData<ReviewSchedule>(rawSchedule);
  const stageId = schedule?.reviewStageId;

  const { data: rawCriteria, isLoading: loadingCriteria } = useQuery({
    queryKey: ['stage-criteria', stageId],
    queryFn: () => getStageCriteria(stageId!),
    enabled: Boolean(stageId),
  });

  const criteriaList = unwrapList<EvaluationCriteria>(rawCriteria);

  const submitMut = useMutation({
    mutationFn: (data: any) => submitEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
      toast.success('Evaluation submitted successfully!');
      navigate(ROUTES.MY_SCHEDULES);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit evaluation');
    },
  });

  return {
    schedule,
    criteriaList,
    isLoading: loadingSchedule || loadingCriteria,
    submitEvaluation: submitMut.mutateAsync,
    isSubmitting: submitMut.isPending,
  };
}
