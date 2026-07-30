import prisma from '../../config/database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { TeamStatus, AuditAction, Role } from '@prisma/client';

export const createTeam = async (data: { name: string; semesterId: string }, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const existingTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: profile.id,
      team: { semesterId: data.semesterId },
    },
  });

  if (existingTeam) {
    throw new ValidationError('You are already part of a team in this semester');
  }

  const team = await prisma.team.create({
    data: {
      name: data.name,
      semesterId: data.semesterId,
      status: TeamStatus.PENDING,
      members: {
        create: {
          studentProfileId: profile.id,
          isLeader: true,
        },
      },
    },
    include: {
      members: { include: { studentProfile: { include: { user: true } } } },
    },
  });

  await auditService.createAuditLog({
    action: AuditAction.CREATE,
    entityType: 'TEAM',
    entityId: team.id,
    userId,
    newValue: JSON.stringify({ name: team.name, semesterId: team.semesterId }),
  });

  return team;
};

export const getMyTeam = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const member = await prisma.teamMember.findFirst({
    where: { studentProfileId: profile.id },
    include: {
      team: {
        include: {
          members: { include: { studentProfile: { include: { user: true } } } },
          project: true,
        },
      },
    },
  });

  if (!member) throw new NotFoundError('You do not belong to any team');
  return member.team;
};

export const getTeamById = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: { include: { studentProfile: { include: { user: true } } } },
      project: true,
    },
  });

  if (!team) throw new NotFoundError('Team not found');
  return team;
};

export const updateTeam = async (id: string, data: { name: string }, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const member = await prisma.teamMember.findFirst({
    where: { teamId: id, studentProfileId: profile.id, isLeader: true },
  });

  if (!member) throw new ForbiddenError('Only the team leader can update the team');

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) throw new NotFoundError('Team not found');
  if (team.status !== TeamStatus.PENDING) throw new ValidationError('Only pending teams can be updated');

  const updatedTeam = await prisma.team.update({
    where: { id },
    data: { name: data.name },
  });

  return updatedTeam;
};

export const inviteMember = async (teamId: string, studentIdRollNumber: string, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const leaderMember = await prisma.teamMember.findFirst({
    where: { teamId, studentProfileId: profile.id, isLeader: true },
  });

  if (!leaderMember) throw new ForbiddenError('Only the team leader can invite members');

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team) throw new NotFoundError('Team not found');
  if (team.status !== TeamStatus.PENDING) throw new ValidationError('Cannot modify members of a non-pending team');

  const invitedStudent = await prisma.studentProfile.findUnique({
    where: { studentId: studentIdRollNumber },
    include: { user: true },
  });

  if (!invitedStudent) throw new NotFoundError('Student to invite not found');

  const existingTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: invitedStudent.id,
      team: { semesterId: team.semesterId },
    },
  });

  if (existingTeam) throw new ValidationError('Student is already in a team for this semester');

  // get max team size from settings
  const settings = await prisma.settings.findFirst();
  const maxTeamSize = settings?.maxTeamSize || 4;

  if (team.members.length >= maxTeamSize) throw new ValidationError('Team is full');

  const newMember = await prisma.teamMember.create({
    data: {
      teamId,
      studentProfileId: invitedStudent.id,
      isLeader: false,
    },
  });

  await notificationService.sendNotification(
    invitedStudent.userId,
    'Team Invitation',
    `You have been added to team ${team.name}`,
    'SYSTEM'
  );

  return newMember;
};

export const removeMember = async (teamId: string, memberId: string, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const leaderMember = await prisma.teamMember.findFirst({
    where: { teamId, studentProfileId: profile.id, isLeader: true },
  });

  if (!leaderMember) throw new ForbiddenError('Only the team leader can remove members');

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new NotFoundError('Team not found');
  if (team.status !== TeamStatus.PENDING) throw new ValidationError('Cannot modify members of a non-pending team');

  const memberToRemove = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!memberToRemove) throw new NotFoundError('Member not found');
  if (memberToRemove.isLeader) throw new ValidationError('Cannot remove the team leader');

  await prisma.teamMember.delete({ where: { id: memberId } });
  return { message: 'Member removed' };
};

export const leaveTeam = async (teamId: string, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const member = await prisma.teamMember.findFirst({
    where: { teamId, studentProfileId: profile.id },
  });

  if (!member) throw new NotFoundError('You are not in this team');
  if (member.isLeader) throw new ValidationError('Leader cannot leave the team, transfer leadership or delete the team first');

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (team?.status !== TeamStatus.PENDING) throw new ValidationError('Cannot leave a non-pending team');

  await prisma.teamMember.delete({ where: { id: member.id } });
  return { message: 'Left team successfully' };
};

export const getTeams = async (filters: { semesterId?: string; status?: TeamStatus; page?: number; limit?: number }) => {
  const { semesterId, status, page = 1, limit = 10 } = filters;
  const where: any = {};
  if (semesterId) where.semesterId = semesterId;
  if (status) where.status = status;

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { members: true } },
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.team.count({ where }),
  ]);

  return { data: teams, total, page, limit };
};

export const approveTeam = async (id: string, userId: string) => {
  const team = await prisma.team.update({
    where: { id },
    data: {
      status: TeamStatus.APPROVED,
      approvedById: userId,
      approvedAt: new Date(),
    },
    include: { members: { include: { studentProfile: true } } },
  });

  for (const member of team.members) {
    await notificationService.sendNotification(
      member.studentProfile.userId,
      'Team Approved',
      `Your team ${team.name} has been approved`,
      'SYSTEM'
    );
  }

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'TEAM',
    entityId: id,
    userId,
    newValue: TeamStatus.APPROVED,
  });

  return team;
};

export const rejectTeam = async (id: string, reason: string, userId: string) => {
  const team = await prisma.team.update({
    where: { id },
    data: {
      status: TeamStatus.REJECTED,
      rejectionReason: reason,
    },
    include: { members: { include: { studentProfile: true } } },
  });

  for (const member of team.members) {
    await notificationService.sendNotification(
      member.studentProfile.userId,
      'Team Rejected',
      `Your team ${team.name} has been rejected. Reason: ${reason}`,
      'SYSTEM'
    );
  }

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'TEAM',
    entityId: id,
    userId,
    newValue: JSON.stringify({ newValue: TeamStatus.REJECTED, reason }),
  });

  return team;
};
