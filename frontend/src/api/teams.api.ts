import { api } from './client';
import type { ApiResponse, PaginatedResponse, Team } from '@/types';

export const createTeam = async (data: Partial<Team>) =>
  (await api.post<ApiResponse<Team>>('/teams', data)).data;

export const getMyTeam = async () =>
  (await api.get<ApiResponse<Team>>('/teams/my-team')).data;

export const getTeam = async (id: string) =>
  (await api.get<ApiResponse<Team>>(`/teams/${id}`)).data;

export const updateTeam = async (id: string, data: Partial<Team>) =>
  (await api.put<ApiResponse<Team>>(`/teams/${id}`, data)).data;

export const inviteMember = async (teamId: string, studentId: string) =>
  (await api.post<ApiResponse<any>>(`/teams/${teamId}/members/invite`, { studentId })).data;

export const removeMember = async (teamId: string, memberId: string) =>
  (await api.delete<ApiResponse<any>>(`/teams/${teamId}/members/${memberId}`)).data;

export const leaveTeam = async (teamId: string) =>
  (await api.post<ApiResponse<any>>(`/teams/${teamId}/leave`)).data;

export const deleteTeam = async (teamId: string) =>
  (await api.delete<ApiResponse<any>>(`/teams/${teamId}`)).data;

export const getTeams = async (params?: any) =>
  (await api.get<ApiResponse<PaginatedResponse<Team>>>('/teams', { params })).data;

export const approveTeam = async (id: string) =>
  (await api.post<ApiResponse<Team>>(`/teams/${id}/approve`)).data;

export const rejectTeam = async (id: string, reason: string) =>
  (await api.post<ApiResponse<Team>>(`/teams/${id}/reject`, { reason })).data;

export const getMyInvitations = async () =>
  (await api.get<ApiResponse<any[]>>('/teams/my-invitations')).data;

export const acceptInvitation = async (invitationId: string) =>
  (await api.post<ApiResponse<any>>(`/teams/invitations/${invitationId}/accept`)).data;

export const declineInvitation = async (invitationId: string) =>
  (await api.post<ApiResponse<any>>(`/teams/invitations/${invitationId}/decline`)).data;

export const getTeamInvitations = async (teamId: string) =>
  (await api.get<ApiResponse<any[]>>(`/teams/${teamId}/invitations`)).data;
