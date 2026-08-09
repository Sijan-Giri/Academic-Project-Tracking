import { api } from './client';
import type { Team } from '@/types/project.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const createTeam = async (data: Partial<Team>) =>
  (await api.post<ApiResponse<Team>>('/teams', data)).data;

export const getMyTeam = async () =>
  (await api.get<ApiResponse<Team>>('/teams/my-team')).data;

export const getTeam = async (id: string) =>
  (await api.get<ApiResponse<Team>>(`/teams/${id}`)).data;

export const updateTeam = async (id: string, data: Partial<Team>) =>
  (await api.put<ApiResponse<Team>>(`/teams/${id}`, data)).data;

// Sends a PENDING invitation — the student must accept it to join
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

// ── Invitation management ──────────────────────────────────────────────────

/** Get all pending invitations for the logged-in student */
export const getMyInvitations = async () =>
  (await api.get<ApiResponse<any[]>>('/teams/my-invitations')).data;

/** Accept a pending invitation by its ID */
export const acceptInvitation = async (invitationId: string) =>
  (await api.post<ApiResponse<any>>(`/teams/invitations/${invitationId}/accept`)).data;

/** Decline a pending invitation by its ID */
export const declineInvitation = async (invitationId: string) =>
  (await api.post<ApiResponse<any>>(`/teams/invitations/${invitationId}/decline`)).data;

/** Leader: view all invitations sent for a team */
export const getTeamInvitations = async (teamId: string) =>
  (await api.get<ApiResponse<any[]>>(`/teams/${teamId}/invitations`)).data;
