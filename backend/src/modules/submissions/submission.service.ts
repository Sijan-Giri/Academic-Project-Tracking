import prisma from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';
import { sendNotification } from '../notifications/notification.service';
import { AuditAction, MilestoneStatus } from '@prisma/client';
import fs from 'fs';

export const createSubmission = async (data: { milestoneId: string; notes?: string }, files: Express.Multer.File[], userId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: data.milestoneId },
    include: {
      submissions: { orderBy: { version: 'desc' }, take: 1 },
      project: { include: { guideAssignment: { include: { facultyProfile: true } } } },
    },
  });

  if (!milestone) throw new NotFoundError('Milestone not found');

  const latestVersion = milestone.submissions.length > 0 ? milestone.submissions[0].version : 0;
  const nextVersion = latestVersion + 1;

  const submission = await prisma.submission.create({
    data: {
      milestoneId: data.milestoneId,
      version: nextVersion,
      notes: data.notes,
      submittedById: userId,
      files: {
        create: files.map(file => ({
          originalName: file.originalname,
          storagePath: file.path,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          uploadedById: userId,
        })),
      },
    },
    include: { files: true },
  });

  await prisma.milestone.update({
    where: { id: data.milestoneId },
    data: { status: MilestoneStatus.SUBMITTED },
  });

  const guideAssignment: any = milestone.project.guideAssignment;
  if (guideAssignment && guideAssignment.isActive && guideAssignment.facultyProfile) {
    await sendNotification(
      guideAssignment.facultyProfile.userId,
      'New Milestone Submission',
      `A new submission was made for milestone: ${milestone.name}`,
      'GENERAL'
    );
  }

  await createAuditLog({
    action: AuditAction.FILE_UPLOAD,
    entityType: 'SUBMISSION',
    entityId: submission.id,
    userId,
    newValue: JSON.stringify({ version: nextVersion, fileCount: files.length }),
  });

  return submission;
};

export const getSubmissions = async (
  filters: { milestoneId?: string; projectId?: string },
  userId: string,
  role: string
) => {
  const where: any = {};
  if (filters.milestoneId) where.milestoneId = filters.milestoneId;
  if (filters.projectId) where.milestone = { projectId: filters.projectId };

  if (role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) return [];

    where.milestone = {
      ...where.milestone,
      project: {
        team: {
          members: {
            some: { studentProfileId: studentProfile.id }
          }
        }
      }
    };
  } else if (role === 'FACULTY' || role === 'PANEL') {
    const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId } });
    if (!facultyProfile) return [];

    if (!filters.projectId && !filters.milestoneId) {
      where.milestone = {
        project: {
          OR: [
            { guideAssignment: { facultyProfileId: facultyProfile.id, isActive: true } },
            { schedules: { some: { panelAssignments: { some: { facultyProfileId: facultyProfile.id } } } } }
          ]
        }
      };
    }
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      files: true,
      submittedBy: { select: { id: true, name: true, email: true } },
      milestone: { select: { id: true, name: true, projectId: true } }
    },
    orderBy: { submittedAt: 'desc' },
  });
  return submissions;
};

export const getSubmissionById = async (id: string, userId: string, role: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      files: true,
      submittedBy: { select: { id: true, name: true, email: true } },
      milestone: {
        include: {
          project: {
            include: {
              team: { include: { members: true } }
            }
          }
        }
      }
    },
  });
  if (!submission) throw new NotFoundError('Submission not found');

  if (role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) throw new ForbiddenError('Access denied');
    const members = submission.milestone?.project?.team?.members || [];
    const isMember = members.some(m => m.studentProfileId === studentProfile.id);
    if (!isMember && submission.submittedById !== userId) {
      throw new ForbiddenError('You do not have permission to view this submission');
    }
  }

  return submission;
};

export const getFileStream = async (fileId: string, userId: string, role: string) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      submission: {
        include: {
          milestone: {
            include: {
              project: {
                include: {
                  team: { include: { members: true } }
                }
              }
            }
          }
        }
      }
    }
  });
  if (!file) throw new NotFoundError('File not found');

  if (['ADMIN', 'COORDINATOR'].includes(role)) {
    return file;
  }

  if (role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) throw new ForbiddenError('Unauthorized file access');

    const projectMembers = file.submission?.milestone?.project?.team?.members || [];
    const isMember = projectMembers.some(m => m.studentProfileId === studentProfile.id);
    if (!isMember && file.uploadedById !== userId) {
      throw new ForbiddenError('You do not have permission to access files from other teams');
    }
  }

  return file;
};

export const deleteFile = async (fileId: string, requestingUserId: string, requestingRole: string) => {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) throw new NotFoundError('File not found');

  const isOwner = file.uploadedById === requestingUserId;
  const isPrivileged = ['ADMIN', 'COORDINATOR'].includes(requestingRole);
  if (!isOwner && !isPrivileged) {
    throw new Error('You do not have permission to delete this file');
  }

  if (fs.existsSync(file.storagePath)) {
    fs.unlinkSync(file.storagePath);
  }

  await prisma.file.delete({ where: { id: fileId } });
  return { message: 'File deleted successfully' };
};
