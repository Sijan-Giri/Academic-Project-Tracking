import prisma from '../../config/database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { AuditAction, Role } from '@prisma/client';

export const getGuideAssignments = async () => {
  const assignments = await prisma.guideAssignment.findMany({
    include: {
      project: { select: { id: true, title: true } },
      facultyProfile: { include: { user: true } },
    },
    orderBy: { assignedAt: 'desc' },
  });
  return assignments;
};

export const assignGuide = async (data: { projectId: string; facultyProfileId: string }, assignedById: string) => {
  const existing = await prisma.guideAssignment.findFirst({
    where: { projectId: data.projectId },
  });

  let assignment;
  if (existing) {
    assignment = await prisma.guideAssignment.update({
      where: { id: existing.id },
      data: {
        facultyProfileId: data.facultyProfileId,
        assignedById,
        assignedAt: new Date(),
        isActive: true,
      },
    });
  } else {
    assignment = await prisma.guideAssignment.create({
      data: {
        projectId: data.projectId,
        facultyProfileId: data.facultyProfileId,
        assignedById,
        isActive: true,
      },
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    include: { team: { include: { members: { include: { studentProfile: true } } } } },
  });

  const faculty = await prisma.facultyProfile.findUnique({
    where: { id: data.facultyProfileId },
    include: { user: true },
  });

  if (project) {
    for (const member of project.team.members) {
      await notificationService.sendNotification(
        member.studentProfile.userId,
        'Guide Assigned',
        'A guide has been assigned to your project.',
        'GENERAL'
      );
    }
  }

  if (faculty) {
    await notificationService.sendNotification(
      faculty.userId,
      'Project Assigned',
      'You have been assigned as a guide to a new project.',
      'GENERAL'
    );
  }

  await auditService.createAuditLog({
    action: AuditAction.CREATE,
    entityType: 'GUIDE_ASSIGNMENT',
    entityId: assignment.id,
    userId: assignedById,
    newValue: JSON.stringify(data),
  });

  return assignment;
};

export const removeGuideAssignment = async (assignmentId: string, userId: string) => {
  const assignment = await prisma.guideAssignment.update({
    where: { id: assignmentId },
    data: { isActive: false },
  });

  await auditService.createAuditLog({
    action: AuditAction.UPDATE,
    entityType: 'GUIDE_ASSIGNMENT',
    entityId: assignmentId,
    userId,
    newValue: JSON.stringify({ isActive: false }),
  });

  return assignment;
};

export const getAvailableGuides = async () => {
  const facultyUsers = await prisma.user.findMany({
    where: { role: { in: [Role.FACULTY, Role.COORDINATOR] }, isActive: true },
    include: {
      facultyProfile: {
        include: { department: { select: { name: true } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  const defaultDept = await prisma.department.findFirst();

  const formattedGuides = [];
  for (const user of facultyUsers) {
    let profile = user.facultyProfile;
    if (!profile && defaultDept) {
      profile = await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          facultyId: `FAC-${user.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}`,
          departmentId: defaultDept.id,
          designation: 'Faculty / Guide',
        },
        include: { department: { select: { name: true } } },
      });
    }

    formattedGuides.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      facultyProfileId: profile?.id,
      facultyProfile: profile
        ? {
            id: profile.id,
            facultyId: profile.facultyId,
            designation: profile.designation,
            specialization: profile.specialization,
            department: profile.department,
          }
        : null,
    });
  }

  return formattedGuides;
};
