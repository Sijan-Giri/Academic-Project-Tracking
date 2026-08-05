import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
} from '@/api/users.api';
import { getDepartments } from '@/api/departments.api';
import { getBatches } from '@/api/batches.api';
import { unwrapList } from '@/utils/apiUtils';
import type { User } from '@/types/user.types';
import type { Department, Batch } from '@/types/system.types';

export function useUsers(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data: rawUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  });

  const { data: rawDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: rawBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const users = unwrapList<User>(rawUsers);
  const departments = unwrapList<Department>(rawDepts);
  const batches = unwrapList<Batch>(rawBatches);

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateUser(id) : activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
  });

  return {
    users,
    departments,
    batches,
    isLoading: loadingUsers,
    createUser: createMut.mutateAsync,
    updateUser: updateMut.mutateAsync,
    deleteUser: deleteMut.mutateAsync,
    toggleUserStatus: toggleStatusMut.mutateAsync,
    isSubmitting: createMut.isPending || updateMut.isPending || deleteMut.isPending,
  };
}
