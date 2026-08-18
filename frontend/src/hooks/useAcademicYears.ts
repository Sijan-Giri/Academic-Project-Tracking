import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 
import { unwrapList } from '@/utils';
import type { AcademicYear } from '@/types';
import { getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } from '@/api';

export function useAcademicYears() {
  const queryClient = useQueryClient();

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn: getAcademicYears,
    staleTime: 10 * 60 * 1000,
  });

  const academicYears = unwrapList<AcademicYear>(rawData);

  const createMut = useMutation({
    mutationFn: createAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create academic year');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AcademicYear> }) =>
      updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update academic year');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Academic year deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete academic year');
    },
  });

  return {
    academicYears,
    isLoading,
    createAcademicYear: createMut.mutateAsync,
    updateAcademicYear: updateMut.mutateAsync,
    deleteAcademicYear: deleteMut.mutateAsync,
    isSubmitting: createMut.isPending || updateMut.isPending || deleteMut.isPending,
  };
}
