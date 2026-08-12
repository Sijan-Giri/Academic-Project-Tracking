import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 
import { unwrapList } from '@/utils';
import type { Settings } from '@/types';
import { getSettings, updateSetting } from '@/api';

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: rawSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const settings = unwrapList<Settings>(rawSettings);

  const updateMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Setting updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update setting');
    },
  });

  return {
    settings,
    isLoading,
    updateSetting: updateMut.mutateAsync,
    isUpdating: updateMut.isPending,
  };
}
