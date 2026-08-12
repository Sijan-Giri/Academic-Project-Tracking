import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 
import { unwrapList } from '@/utils';
import type { ReviewStage } from '@/types';
import { getReviewStages, createReviewStage, updateReviewStage, deleteReviewStage, addCriteria, updateCriteria, deleteCriteria } from '@/api';

export function useReviewStages(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data: rawStages, isLoading } = useQuery({
    queryKey: ['review-stages', params],
    queryFn: () => getReviewStages(params),
  });

  const reviewStages = unwrapList<ReviewStage>(rawStages);

  const createStageMut = useMutation({
    mutationFn: createReviewStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Review stage created!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create review stage');
    },
  });

  const updateStageMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReviewStage> }) =>
      updateReviewStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Review stage updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update review stage');
    },
  });

  const deleteStageMut = useMutation({
    mutationFn: deleteReviewStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Review stage deleted!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete review stage');
    },
  });

  const addCriteriaMut = useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: any }) =>
      addCriteria(stageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Evaluation criteria added!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add criteria');
    },
  });

  const updateCriteriaMut = useMutation({
    mutationFn: ({ stageId, criteriaId, data }: { stageId: string; criteriaId: string; data: any }) =>
      updateCriteria(stageId, criteriaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Criteria updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update criteria');
    },
  });

  const deleteCriteriaMut = useMutation({
    mutationFn: ({ stageId, criteriaId }: { stageId: string; criteriaId: string }) =>
      deleteCriteria(stageId, criteriaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-stages'] });
      toast.success('Criteria removed!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete criteria');
    },
  });

  return {
    reviewStages,
    isLoading,
    isCreatingStage: createStageMut.isPending,
    isAddingCriteria: addCriteriaMut.isPending,
    createReviewStage: createStageMut.mutateAsync,
    updateReviewStage: updateStageMut.mutateAsync,
    deleteReviewStage: deleteStageMut.mutateAsync,
    addCriteria: addCriteriaMut.mutateAsync,
    updateCriteria: updateCriteriaMut.mutateAsync,
    deleteCriteria: deleteCriteriaMut.mutateAsync,
  };
}
