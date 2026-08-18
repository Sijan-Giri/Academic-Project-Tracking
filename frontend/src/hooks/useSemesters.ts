import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 

import { unwrapList } from '@/utils';
import type { Batch, Semester } from '@/types';
import { getSemesters, createSemester, updateSemester, deleteSemester, setCurrentSemester, getBatches } from '@/api';

export function useSemesters() {
  const queryClient = useQueryClient();

  const { data: rawSemesters, isLoading: loadingSemesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => getSemesters(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: rawBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
    staleTime: 10 * 60 * 1000,
  });

  const semesters = unwrapList<Semester>(rawSemesters);
  const batches = unwrapList<Batch>(rawBatches);

  const createMut = useMutation({
    mutationFn: createSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast.success('Semester created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create semester');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Semester> }) =>
      updateSemester(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast.success('Semester updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update semester');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast.success('Semester deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete semester');
    },
  });

  const setCurrentMut = useMutation({
    mutationFn: setCurrentSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast.success('Current semester updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to set current semester');
    },
  });

  return {
    semesters,
    batches,
    isLoading: loadingSemesters,
    createSemester: createMut.mutateAsync,
    updateSemester: updateMut.mutateAsync,
    deleteSemester: deleteMut.mutateAsync,
    setCurrentSemester: setCurrentMut.mutateAsync,
    isSubmitting: createMut.isPending || updateMut.isPending || deleteMut.isPending || setCurrentMut.isPending,
  };
}
