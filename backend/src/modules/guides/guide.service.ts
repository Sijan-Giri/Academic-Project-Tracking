import prisma from '../../config/database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { AuditAction, Role, GuidePreferenceStatus } from '@prisma/client';

export const submitPreferences = async (data: { projectId: string; preferences: { facultyProfileId: string; rank: number }[] }, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    include: { team: { include: { members: true } } },
  });

  if (!project) throw new NotFoundError('Project not found');

  const isMember = project.team.members.some(m => m.studentProfileId === profile.id);
  if (!isMember) throw new ForbiddenError('You are not a member of this project\'s team');

  await prisma.guidePreference.deleteMany({
    where: { projectId: data.projectId, status: GuidePreferenceStatus.PENDING },
  });

  const preferences = await prisma.guidePreference.createMany({
    data: data.preferences.map(pref => ({
      projectId: data.projectId,
      facultyProfileId: pref.facultyProfileId,
      rank: pref.rank,
      status: GuidePreferenceStatus.PENDING,
    })),
  });

  return { message: 'Preferences submitted successfully', count: preferences.count };
};

export const getGuidePreferences = async (projectId: string) => {
  const preferences = await prisma.guidePreference.findMany({
    where: { projectId },
    include: { facultyProfile: { include: { user: true } } },
    orderBy: { rank: 'asc' },
  });
  return preferences;
};

export const getAllGuidePreferences = async () => {
  const preferences = await prisma.guidePreference.findMany({
    include: {
      project: { select: { id: true, title: true } },
      facultyProfile: { include: { user: true } },
    },
    orderBy: { rank: 'asc' },
  });
  return preferences;
};

export const approvePreference = async (preferenceId: string, reviewerId: string) => {
  const preference = await prisma.guidePreference.findUnique({ where: { id: preferenceId } });
  if (!preference) throw new NotFoundError('Preference not found');

  const updatedPreference = await prisma.guidePreference.update({
    where: { id: preferenceId },
    data: {
      status: GuidePreferenceStatus.APPROVED,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
  });

  await prisma.guideAssignment.create({
    data: {
      projectId: preference.projectId,
      facultyProfileId: preference.facultyProfileId,
      assignedById: reviewerId,
      isActive: true,
    },
  });

  await prisma.guidePreference.updateMany({
    where: { projectId: preference.projectId, id: { not: preferenceId }, status: GuidePreferenceStatus.PENDING },
    data: { status: GuidePreferenceStatus.REJECTED },
  });

  const project = await prisma.project.findUnique({
    where: { id: preference.projectId },
    include: { team: { include: { members: { include: { studentProfile: true } } } } },
  });

  const faculty = await prisma.facultyProfile.findUnique({
    where: { id: preference.facultyProfileId },
    include: { user: true },
  });

  if (project) {
    for (const member of project.team.members) {
      await notificationService.sendNotification(
        member.studentProfile.userId,
        'Guide Assigned',
        'A guide has been assigned to your project based on preferences.',
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
    entityId: preference.projectId,
    userId: reviewerId,
    newValue: JSON.stringify({ facultyProfileId: preference.facultyProfileId }),
  });

  return updatedPreference;
};

export const rejectPreference = async (preferenceId: string, note: string, reviewerId: string) => {
  const preference = await prisma.guidePreference.update({
    where: { id: preferenceId },
    data: {
      status: GuidePreferenceStatus.REJECTED,
      note,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
  });
  return preference;
};

export const assignGuide = async (data: { projectId: string; facultyProfileId: string }, assignedById: string) => {
  const existing = await prisma.guideAssignment.findFirst({
    where: { projectId: data.projectId, isActive: true },
  });

  if (existing) {
    await prisma.guideAssignment.update({
      where: { id: existing.id },
      data: { isActive: false },
    });
  }

  const assignment = await prisma.guideAssignment.create({
    data: {
      projectId: data.projectId,
      facultyProfileId: data.facultyProfileId,
      assignedById,
      isActive: true,
    },
  });

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
