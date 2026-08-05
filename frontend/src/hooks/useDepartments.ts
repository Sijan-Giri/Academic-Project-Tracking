import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/api/departments.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Department } from '@/types/system.types';

export function useDepartments() {
  const queryClient = useQueryClient();

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const departments = unwrapList<Department>(rawData);

  const createMut = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create department');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update department');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete department');
    },
  });

  return {
    departments,
    isLoading,
    createDepartment: createMut.mutateAsync,
    updateDepartment: updateMut.mutateAsync,
    deleteDepartment: deleteMut.mutateAsync,
    isSubmitting: createMut.isPending || updateMut.isPending || deleteMut.isPending,
  };
}
