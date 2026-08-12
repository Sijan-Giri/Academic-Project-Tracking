import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 

import { unwrapList } from '@/utils';
import type { Project, ReviewSchedule, ReviewStage, User } from '@/types';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, assignPanelMember, removePanelMember, getProjects, getReviewStages, getUsers } from '@/api';

export function useSchedules(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data: rawSchedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules', params],
    queryFn: () => getSchedules(params),
  });

  const { data: rawProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const { data: rawStages } = useQuery({
    queryKey: ['review-stages'],
    queryFn: () => getReviewStages(),
  });

  const { data: rawFaculty } = useQuery({
    queryKey: ['faculty-users'],
    queryFn: () => getUsers({ role: 'FACULTY' }),
  });

  const schedules = unwrapList<ReviewSchedule>(rawSchedules);
  const projects = unwrapList<Project>(rawProjects);
  const stages = unwrapList<ReviewStage>(rawStages);
  const facultyList = unwrapList<User>(rawFaculty);

  const createMut = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create schedule');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReviewSchedule> }) =>
      updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update schedule');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule deleted!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete schedule');
    },
  });

  const assignPanelMut = useMutation({
    mutationFn: ({ scheduleId, facultyProfileId }: { scheduleId: string; facultyProfileId: string }) =>
      assignPanelMember(scheduleId, facultyProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Panel member assigned!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to assign panel member');
    },
  });

  const removePanelMut = useMutation({
    mutationFn: ({ scheduleId, facultyProfileId }: { scheduleId: string; facultyProfileId: string }) =>
      removePanelMember(scheduleId, facultyProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Panel member removed!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove panel member');
    },
  });

  return {
    schedules,
    projects,
    stages,
    facultyList,
    isLoading: loadingSchedules,
    isCreating: createMut.isPending,
    isDeleting: deleteMut.isPending,
    createSchedule: createMut.mutateAsync,
    updateSchedule: updateMut.mutateAsync,
    deleteSchedule: deleteMut.mutateAsync,
    assignPanelMember: assignPanelMut.mutateAsync,
    removePanelMember: removePanelMut.mutateAsync,
  };
}
