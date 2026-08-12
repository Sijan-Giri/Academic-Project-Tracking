import prisma from '../../config/database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { TeamStatus, AuditAction, Role } from '@prisma/client';
import { emitToUser, broadcastEvent } from '../../config/socket';

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
  if (team.status === TeamStatus.REJECTED) throw new ValidationError('Cannot update a rejected team');

  const updatedTeam = await prisma.team.update({
    where: { id },
    data: { name: data.name },
  });

  try {
    broadcastEvent('team:updated', updatedTeam);
  } catch (_) {}

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
  if (team.status === TeamStatus.REJECTED) throw new ValidationError('Cannot modify members of a rejected team');

  const invitedStudent = await prisma.studentProfile.findUnique({
    where: { studentId: studentIdRollNumber },
    include: { user: true },
  });

  if (!invitedStudent) throw new NotFoundError('Student with this roll number not found');

  const alreadyInTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: invitedStudent.id,
      team: { semesterId: team.semesterId },
    },
  });
  if (alreadyInTeam) throw new ValidationError('This student is already in a team for this semester');

  const existingInvite = await prisma.teamInvitation.findUnique({
    where: { teamId_studentProfileId: { teamId, studentProfileId: invitedStudent.id } },
  });
  if (existingInvite && existingInvite.status === 'PENDING') {
    throw new ValidationError('This student already has a pending invitation to this team');
  }

  const maxTeamSetting = await prisma.settings.findFirst({ where: { key: 'maxTeamSize' } });
  const maxTeamSize = maxTeamSetting ? parseInt(maxTeamSetting.value, 10) || 4 : 4;
  if (team.members.length >= maxTeamSize) throw new ValidationError(`Team is full (max ${maxTeamSize} members)`);

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

  try {
    emitToUser(invitedStudent.userId, 'invitation:new', invitation);
  } catch (_) {}

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
  if (invitation.team.status === TeamStatus.REJECTED) throw new ValidationError('This team was rejected and cannot accept members');

  const alreadyInTeam = await prisma.teamMember.findFirst({
    where: {
      studentProfileId: profile.id,
      team: { semesterId: invitation.team.semesterId },
    },
  });
  if (alreadyInTeam) throw new ValidationError('You are already in a team for this semester');

  const maxTeamSetting = await prisma.settings.findFirst({ where: { key: 'maxTeamSize' } });
  const maxTeamSize = maxTeamSetting ? parseInt(maxTeamSetting.value, 10) || 4 : 4;
  if (invitation.team.members.length >= maxTeamSize) throw new ValidationError(`Team is full (max ${maxTeamSize} members)`);

  const [updatedInvitation, newMember, updatedTeam] = await prisma.$transaction([
    prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    }),
    prisma.teamMember.create({
      data: { teamId: invitation.teamId, studentProfileId: profile.id, isLeader: false },
    }),
    prisma.team.update({
      where: { id: invitation.teamId },
      data: { status: TeamStatus.PENDING },
      include: { members: { include: { studentProfile: { include: { user: true } } } } },
    }),
  ]);

  await Promise.all(updatedTeam.members.map(async (member) => {
    try {
      emitToUser(member.studentProfile.userId, 'team:updated', updatedTeam);
    } catch (_) {}
    if (member.isLeader) {
      await notificationService.sendNotification(
        member.studentProfile.userId,
        'Invitation Accepted',
        `A student accepted your invitation and joined "${updatedTeam.name}". Team status is now PENDING coordinator re-approval.`,
        'GENERAL'
      );
    }
  }));

  const coordinators = await prisma.user.findMany({
    where: { role: { in: ['COORDINATOR', 'ADMIN'] }, isActive: true },
  });
  await Promise.all(coordinators.map(async (coord) => {
    try {
      emitToUser(coord.id, 'team:updated', updatedTeam);
    } catch (_) {}
    await notificationService.sendNotification(
      coord.id,
      'Team Pending Re-Approval',
      `Team "${updatedTeam.name}" added a new member and requires coordinator re-approval.`,
      'GENERAL'
    );
  }));

  try {
    broadcastEvent('team:updated', updatedTeam);
  } catch (_) {}

  return { invitation: updatedInvitation, member: newMember, team: updatedTeam };
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
  if (team.status === TeamStatus.REJECTED) throw new ValidationError('Cannot modify members of a rejected team');

  const memberToRemove = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!memberToRemove) throw new NotFoundError('Member not found');
  if (memberToRemove.isLeader) throw new ValidationError('Cannot remove the team leader');

  await prisma.teamMember.delete({ where: { id: memberId } });

  try {
    broadcastEvent('team:updated', team);
  } catch (_) {}

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
    include: { members: { include: { studentProfile: { include: { user: true } } } } },
  });

  await Promise.all(team.members.map(async (member) => {
    try {
      emitToUser(member.studentProfile.userId, 'team:updated', team);
    } catch (_) {}
    await notificationService.sendNotification(
      member.studentProfile.userId,
      'Team Approved',
      `Your team ${team.name} has been approved`,
      'GENERAL'
    );
  }));

  try {
    broadcastEvent('team:updated', team);
  } catch (_) {}

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'TEAM',
    entityId: id,
    userId,
    newValue: TeamStatus.APPROVED,
  });

  return team;
};

export const rejectTeam = async (id: string, reason?: string, userId?: string) => {
  const team = await prisma.team.update({
    where: { id },
    data: {
      status: TeamStatus.REJECTED,
      rejectionReason: reason || null,
    },
    include: { members: { include: { studentProfile: { include: { user: true } } } } },
  });

  await Promise.all(team.members.map(async (member) => {
    try {
      emitToUser(member.studentProfile.userId, 'team:updated', team);
    } catch (_) {}
    await notificationService.sendNotification(
      member.studentProfile.userId,
      'Team Rejected',
      `Your team ${team.name} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      'GENERAL'
    );
  }));

  try {
    broadcastEvent('team:updated', team);
  } catch (_) {}

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'TEAM',
    entityId: id,
    userId: userId || '',
    newValue: JSON.stringify({ newValue: TeamStatus.REJECTED, reason: reason || null }),
  });

  return team;
};

export const deleteTeam = async (id: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  const isLeader = profile
    ? await prisma.teamMember.findFirst({
        where: { teamId: id, studentProfileId: profile.id, isLeader: true },
      })
    : false;

  const isPrivileged = user.role === Role.ADMIN || user.role === Role.COORDINATOR;

  if (!isLeader && !isPrivileged) {
    throw new ForbiddenError('Only the team leader or an admin/coordinator can delete the team');
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: { include: { studentProfile: true } },
      project: true,
    },
  });

  if (!team) throw new NotFoundError('Team not found');

  await prisma.$transaction(async (tx) => {
    
    await tx.teamInvitation.deleteMany({ where: { teamId: id } });

    if (team.project) {
      const projectId = team.project.id;
      const milestones = await tx.milestone.findMany({ where: { projectId } });
      const milestoneIds = milestones.map((m) => m.id);

      if (milestoneIds.length > 0) {
        const submissions = await tx.submission.findMany({
          where: { milestoneId: { in: milestoneIds } },
          include: { files: true },
        });

        const fileIds = submissions.flatMap((s) => s.files.map((f) => f.id));
        if (fileIds.length > 0) {
          await tx.file.deleteMany({ where: { id: { in: fileIds } } });
        }
        await tx.submission.deleteMany({ where: { milestoneId: { in: milestoneIds } } });
        await tx.milestone.deleteMany({ where: { projectId } });
      }

      await tx.guideAssignment.deleteMany({ where: { projectId } });
      await tx.evaluation.deleteMany({ where: { projectId } });
      await tx.reviewSchedule.deleteMany({ where: { projectId } });
      await tx.project.delete({ where: { id: projectId } });
    }

    await tx.teamMember.deleteMany({ where: { teamId: id } });
    await tx.team.delete({ where: { id } });
  });

  await Promise.all(
    team.members
      .filter((member) => member.studentProfile.userId !== userId)
      .map((member) =>
        notificationService.sendNotification(
          member.studentProfile.userId,
          'Team Disbanded',
          `Team "${team.name}" has been deleted by the team leader.`,
          'GENERAL'
        )
      )
  );

  await auditService.createAuditLog({
    action: AuditAction.DELETE,
    entityType: 'TEAM',
    entityId: id,
    userId,
    oldValue: JSON.stringify({ name: team.name }),
  });

  try {
    broadcastEvent('team:deleted', { id });
  } catch (_) {}

  return { message: 'Team deleted successfully' };
};
