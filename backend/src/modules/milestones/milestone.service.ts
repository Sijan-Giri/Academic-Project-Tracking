import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { AuditAction, MilestoneStatus } from '@prisma/client';

export const getMilestones = async (projectId?: string) => {
  const where = projectId ? { projectId } : {};
  const milestones = await prisma.milestone.findMany({
    where,
    include: { submissions: { include: { files: true } } },
    orderBy: { order: 'asc' },
  });
  return milestones;
};

export const getMilestoneById = async (id: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { submissions: { include: { files: true } } },
  });
  if (!milestone) throw new NotFoundError('Milestone not found');
  return milestone;
};

export const createMilestone = async (data: any, userId: string) => {
  const milestone = await prisma.milestone.create({ data });
  await auditService.createAuditLog({
    action: AuditAction.CREATE,
    entityType: 'MILESTONE',
    entityId: milestone.id,
    userId,
    newValue: JSON.stringify(data),
  });
  return milestone;
};

export const updateMilestone = async (id: string, data: any, userId: string) => {
  const milestone = await prisma.milestone.findUnique({ where: { id } });
  if (!milestone) throw new NotFoundError('Milestone not found');

  const updatedMilestone = await prisma.milestone.update({
    where: { id },
    data,
  });
  
  await auditService.createAuditLog({
    action: AuditAction.UPDATE,
    entityType: 'MILESTONE',
    entityId: id,
    userId,
    newValue: JSON.stringify(data),
  });

  return updatedMilestone;
};

export const deleteMilestone = async (id: string, userId: string) => {
  const milestone = await prisma.milestone.findUnique({ where: { id } });
  if (!milestone) throw new NotFoundError('Milestone not found');
  await prisma.milestone.delete({ where: { id } });
  
  await auditService.createAuditLog({
    action: AuditAction.DELETE,
    entityType: 'MILESTONE',
    entityId: id,
    userId,
  });
  
  return { message: 'Milestone deleted' };
};

export const updateMilestoneStatus = async (id: string, status: MilestoneStatus, userId: string) => {
  const milestone = await prisma.milestone.update({
    where: { id },
    data: { status },
    include: { project: { include: { team: { include: { members: { include: { studentProfile: true } } } } } } },
  });

  if (status === MilestoneStatus.APPROVED || status === MilestoneStatus.REJECTED || status === MilestoneStatus.REVISION_NEEDED) {
    await Promise.all(
      milestone.project.team.members.map((member) =>
        notificationService.sendNotification(
          member.studentProfile.userId,
          `Milestone Status: ${status}`,
          `The status of milestone "${milestone.name}" is now ${status}.`,
          'GENERAL'
        )
      )
    );
  }

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'MILESTONE',
    entityId: id,
    userId,
    newValue: status,
  });

  return milestone;
};
