import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '@/api/announcements.api';
import { getDepartments } from '@/api/departments.api';
import { getBatches } from '@/api/batches.api';
import { getSemesters } from '@/api/semesters.api';
import { unwrapList } from '@/utils/apiUtils';
import type { Announcement } from '@/types/notification.types';
import type { Department, Batch, Semester } from '@/types/system.types';

export function useAnnouncementsManage(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data: rawAnnouncements, isLoading } = useQuery({
    queryKey: ['announcements-manage', params],
    queryFn: () => getAnnouncements(params),
  });

  const { data: rawDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: rawBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const { data: rawSemesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => getSemesters(),
  });

  const announcements = unwrapList<Announcement>(rawAnnouncements);
  const departments = unwrapList<Department>(rawDepts);
  const batches = unwrapList<Batch>(rawBatches);
  const semesters = unwrapList<Semester>(rawSemesters);

  const createMut = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-manage'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create announcement');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-manage'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete announcement');
    },
  });

  return {
    announcements,
    departments,
    batches,
    semesters,
    isLoading,
    createAnnouncement: createMut.mutateAsync,
    deleteAnnouncement: deleteMut.mutateAsync,
    isSubmitting: createMut.isPending || deleteMut.isPending,
  };
}
