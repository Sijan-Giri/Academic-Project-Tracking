import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as teamService from './team.service';
import { TeamStatus } from '@prisma/client';

export const createTeamHandler = async (req: AuthRequest, res: Response) => {
  const team = await teamService.createTeam(req.body, req.user!.userId);
  res.status(201).json(team);
};

export const getMyTeamHandler = async (req: AuthRequest, res: Response) => {
  const team = await teamService.getMyTeam(req.user!.userId);
  res.json(team);
};

export const getTeamHandler = async (req: AuthRequest, res: Response) => {
  const team = await teamService.getTeamById(req.params.id);
  res.json(team);
};

export const updateTeamHandler = async (req: AuthRequest, res: Response) => {
  const team = await teamService.updateTeam(req.params.id, req.body, req.user!.userId);
  res.json(team);
};

// Send an invitation (does NOT immediately add the member)
export const inviteMemberHandler = async (req: AuthRequest, res: Response) => {
  const invitation = await teamService.inviteMember(req.params.id, req.body.studentId, req.user!.userId);
  res.status(201).json(invitation);
};

// Accept a pending invitation
export const acceptInvitationHandler = async (req: AuthRequest, res: Response) => {
  const result = await teamService.acceptInvitation(req.params.invitationId, req.user!.userId);
  res.json(result);
};

// Decline a pending invitation
export const declineInvitationHandler = async (req: AuthRequest, res: Response) => {
  const result = await teamService.declineInvitation(req.params.invitationId, req.user!.userId);
  res.json(result);
};

// Get all pending invitations for the logged-in student
export const getMyInvitationsHandler = async (req: AuthRequest, res: Response) => {
  const invitations = await teamService.getMyInvitations(req.user!.userId);
  res.json(invitations);
};

// Get all invitations sent by a team (leader only)
export const getTeamInvitationsHandler = async (req: AuthRequest, res: Response) => {
  const invitations = await teamService.getTeamInvitations(req.params.id, req.user!.userId);
  res.json(invitations);
};

export const removeMemberHandler = async (req: AuthRequest, res: Response) => {
  const result = await teamService.removeMember(req.params.id, req.params.memberId, req.user!.userId);
  res.json(result);
};

export const leaveTeamHandler = async (req: AuthRequest, res: Response) => {
  const result = await teamService.leaveTeam(req.params.id, req.user!.userId);
  res.json(result);
};

export const getTeamsHandler = async (req: AuthRequest, res: Response) => {
  const { semesterId, status, page, limit } = req.query;
  const result = await teamService.getTeams({
    semesterId: semesterId as string,
    status: status as TeamStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  res.json(result);
};

export const approveTeamHandler = async (req: AuthRequest, res: Response) => {
  const team = await teamService.approveTeam(req.params.id, req.user!.userId);
  res.json(team);
};

export const rejectTeamHandler = async (req: AuthRequest, res: Response) => {
  const team = await teamService.rejectTeam(req.params.id, req.body.rejectionReason, req.user!.userId);
  res.json(team);
};

export const deleteTeamHandler = async (req: AuthRequest, res: Response) => {
  const result = await teamService.deleteTeam(req.params.id, req.user!.userId);
  res.json(result);
};

