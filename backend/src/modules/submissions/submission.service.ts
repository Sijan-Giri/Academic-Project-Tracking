import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
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

export const getSubmissions = async (filters: { milestoneId?: string; projectId?: string }) => {
  const where: any = {};
  if (filters.milestoneId) where.milestoneId = filters.milestoneId;
  if (filters.projectId) where.milestone = { projectId: filters.projectId };

  const submissions = await prisma.submission.findMany({
    where,
    include: { files: true, submittedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { submittedAt: 'desc' },
  });
  return submissions;
};

export const getSubmissionById = async (id: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { files: true, submittedBy: { select: { id: true, name: true, email: true } } },
  });
  if (!submission) throw new NotFoundError('Submission not found');
  return submission;
};

export const getFileStream = async (fileId: string) => {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) throw new NotFoundError('File not found');
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
