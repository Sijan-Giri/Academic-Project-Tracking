import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 

import { unwrapList } from '@/utils';
import type { AcademicYear, Batch, Department } from '@/types';
import { getBatches, createBatch, updateBatch, deleteBatch, getDepartments, getAcademicYears } from '@/api';

export function useBatches() {
  const queryClient = useQueryClient();

  const { data: rawBatches, isLoading: loadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: rawDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 10 * 60 * 1000,
  });

  const { data: rawYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: getAcademicYears,
    staleTime: 10 * 60 * 1000,
  });

  const batches = unwrapList<Batch>(rawBatches);
  const departments = unwrapList<Department>(rawDepts);
  const academicYears = unwrapList<AcademicYear>(rawYears);

  const createMut = useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create batch');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Batch> }) =>
      updateBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update batch');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete batch');
    },
  });

  return {
    batches,
    departments,
    academicYears,
    isLoading: loadingBatches,
    createBatch: createMut.mutateAsync,
    updateBatch: updateMut.mutateAsync,
    deleteBatch: deleteMut.mutateAsync,
    isSubmitting: createMut.isPending || updateMut.isPending || deleteMut.isPending,
  };
}
