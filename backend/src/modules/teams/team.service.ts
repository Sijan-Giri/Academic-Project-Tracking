import prisma from '../../config/database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { TeamStatus, AuditAction, Role } from '@prisma/client';

export const createTeam = async (data: { name: string; semesterId?: string }, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  let targetSemesterId = data.semesterId;

  if (!targetSemesterId) {
    if (profile.currentSemesterId) {
      targetSemesterId = profile.currentSemesterId;
    } else {
      const activeSem = await prisma.semester.findFirst({
        where: { batchId: profile.batchId, isCurrent: true },
      }) || await prisma.semester.findFirst({
        where: { batchId: profile.batchId, isActive: true },
      }) || await prisma.semester.findFirst({
        where: { isActive: true },
      });

      if (activeSem) {
        targetSemesterId = activeSem.id;
      }
    }
  }

  if (!targetSemesterId) {
    throw new ValidationError('No active semester found for your batch. Please contact your coordinator.');
  }

  const existingTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: profile.id,
      team: { semesterId: targetSemesterId },
    },
  });

  if (existingTeam) {
    throw new ValidationError('You are already part of a team in this semester');
  }

  const team = await prisma.team.create({
    data: {
      name: data.name,
      semesterId: targetSemesterId,
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

  if (!invitedStudent) throw new NotFoundError('Student with this roll number not found');

  // Check if the student is already a member of any team in this semester
  const alreadyInTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: invitedStudent.id,
      team: { semesterId: team.semesterId },
    },
  });
  if (alreadyInTeam) throw new ValidationError('This student is already in a team for this semester');

  // Check for an existing pending invitation
  const existingInvite = await prisma.teamInvitation.findUnique({
    where: { teamId_studentProfileId: { teamId, studentProfileId: invitedStudent.id } },
  });
  if (existingInvite && existingInvite.status === 'PENDING') {
    throw new ValidationError('This student already has a pending invitation to this team');
  }

  // Check max team size (counting only confirmed members, not pending invitations)
  const maxTeamSetting = await prisma.settings.findFirst({ where: { key: 'maxTeamSize' } });
  const maxTeamSize = maxTeamSetting ? parseInt(maxTeamSetting.value, 10) || 4 : 4;
  if (team.members.length >= maxTeamSize) throw new ValidationError(`Team is full (max ${maxTeamSize} members)`);

  // Create the invitation (upsert in case a previous declined invite exists)
  const invitation = await prisma.teamInvitation.upsert({
    where: { teamId_studentProfileId: { teamId, studentProfileId: invitedStudent.id } },
    update: { status: 'PENDING', invitedById: profile.id, respondedAt: null, createdAt: new Date() },
    create: {
      teamId,
      studentProfileId: invitedStudent.id,
      invitedById: profile.id,
      status: 'PENDING',
    },
    include: {
      team: true,
      studentProfile: { include: { user: true } },
    },
  });

  // Notify the invited student
  await notificationService.sendNotification(
    invitedStudent.userId,
    'Team Invitation',
    `You have been invited to join team "${team.name}". Visit your Team page to accept or decline.`,
    'GENERAL'
  );

  return invitation;
};

export const acceptInvitation = async (invitationId: string, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
    include: { team: { include: { members: true } } },
  });

  if (!invitation) throw new NotFoundError('Invitation not found');
  if (invitation.studentProfileId !== profile.id) throw new ForbiddenError('This invitation is not for you');
  if (invitation.status !== 'PENDING') throw new ValidationError('This invitation has already been responded to');
  if (invitation.team.status !== TeamStatus.PENDING) throw new ValidationError('This team is no longer accepting members');

  // Re-check they are not already in a team
  const alreadyInTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: profile.id,
      team: { semesterId: invitation.team.semesterId },
    },
  });
  if (alreadyInTeam) throw new ValidationError('You are already in a team for this semester');

  // Re-check team size
  const maxTeamSetting = await prisma.settings.findFirst({ where: { key: 'maxTeamSize' } });
  const maxTeamSize = maxTeamSetting ? parseInt(maxTeamSetting.value, 10) || 4 : 4;
  if (invitation.team.members.length >= maxTeamSize) throw new ValidationError(`Team is full (max ${maxTeamSize} members)`);

  // Add as member and mark invitation accepted — in a transaction
  const [updatedInvitation, newMember] = await prisma.$transaction([
    prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    }),
    prisma.teamMember.create({
      data: { teamId: invitation.teamId, studentProfileId: profile.id, isLeader: false },
    }),
  ]);

  // Notify the team leader
  const leaderMember = await prisma.teamMember.findFirst({
    where: { teamId: invitation.teamId, isLeader: true },
    include: { studentProfile: { include: { user: true } } },
  });
  if (leaderMember) {
    await notificationService.sendNotification(
      leaderMember.studentProfile.userId,
      'Invitation Accepted',
      `A student has accepted your invitation and joined team "${invitation.team.name}"`,
      'GENERAL'
    );
  }

  return { invitation: updatedInvitation, member: newMember };
};

export const declineInvitation = async (invitationId: string, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
    include: { team: true },
  });

  if (!invitation) throw new NotFoundError('Invitation not found');
  if (invitation.studentProfileId !== profile.id) throw new ForbiddenError('This invitation is not for you');
  if (invitation.status !== 'PENDING') throw new ValidationError('This invitation has already been responded to');

  const updated = await prisma.teamInvitation.update({
    where: { id: invitationId },
    data: { status: 'DECLINED', respondedAt: new Date() },
  });

  // Notify the leader
  const leaderMember = await prisma.teamMember.findFirst({
    where: { teamId: invitation.teamId, isLeader: true },
    include: { studentProfile: { include: { user: true } } },
  });
  if (leaderMember) {
    await notificationService.sendNotification(
      leaderMember.studentProfile.userId,
      'Invitation Declined',
      `A student has declined your invitation to join team "${invitation.team.name}"`,
      'GENERAL'
    );
  }

  return updated;
};

export const getMyInvitations = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  return prisma.teamInvitation.findMany({
    where: { studentProfileId: profile.id, status: 'PENDING' },
    include: {
      team: {
        include: {
          members: {
            include: { studentProfile: { include: { user: true } } },
          },
        },
      },
      invitedBy: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTeamInvitations = async (teamId: string, userId: string) => {
  // Leader can see all invitations for their team
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const leaderMember = await prisma.teamMember.findFirst({
    where: { teamId, studentProfileId: profile.id, isLeader: true },
  });
  if (!leaderMember) throw new ForbiddenError('Only the team leader can view team invitations');

  return prisma.teamInvitation.findMany({
    where: { teamId },
    include: {
      studentProfile: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
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
        members: { include: { studentProfile: { include: { user: true } } } },
        semester: true,
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
      'GENERAL'
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
      'GENERAL'
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
