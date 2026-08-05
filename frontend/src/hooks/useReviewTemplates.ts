import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '@/api/reviews.api';
import { unwrapList } from '@/utils/apiUtils';
import type { ReviewStageTemplate } from '@/types/review.types';

export function useReviewTemplates() {
  const queryClient = useQueryClient();

  const { data: rawTemplates, isLoading } = useQuery({
    queryKey: ['review-templates'],
    queryFn: getTemplates,
  });

  const templates = unwrapList<ReviewStageTemplate>(rawTemplates);

  const createMut = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-templates'] });
      toast.success('Review template created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create review template');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReviewStageTemplate> }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-templates'] });
      toast.success('Review template updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update review template');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-templates'] });
      toast.success('Review template deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete review template');
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createMut.mutateAsync,
    updateTemplate: updateMut.mutateAsync,
    deleteTemplate: deleteMut.mutateAsync,
    isSubmitting: createMut.isPending || updateMut.isPending || deleteMut.isPending,
  };
}
