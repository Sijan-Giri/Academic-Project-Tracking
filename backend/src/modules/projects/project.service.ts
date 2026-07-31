import prisma from '../../config/database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import * as auditService from '../audit/audit.service';
import * as notificationService from '../notifications/notification.service';
import { ProjectStatus, AuditAction, TeamStatus } from '@prisma/client';

export const createProject = async (data: any, userId: string) => {
  const team = await prisma.team.findUnique({ where: { id: data.teamId } });
  if (!team) throw new NotFoundError('Team not found');
  if (team.status !== TeamStatus.APPROVED) throw new ValidationError('Team must be approved to create a project');

  const existingProject = await prisma.project.findUnique({ where: { teamId: data.teamId } });
  if (existingProject) throw new ValidationError('Team already has a project');

  const project = await prisma.project.create({
    data: {
      ...data,
      status: ProjectStatus.DRAFT,
    },
  });

  await auditService.createAuditLog({
    action: AuditAction.CREATE,
    entityType: 'PROJECT',
    entityId: project.id,
    userId,
    newValue: JSON.stringify(data),
  });

  return project;
};

export const getProjects = async (filters: any) => {
  const { semesterId, departmentId, status, guideId, search, page = 1, limit = 10 } = filters;
  const where: any = {};

  if (semesterId) where.semesterId = semesterId;
  if (status) where.status = status;
  if (guideId) where.guideAssignment = { some: { facultyProfileId: guideId, isActive: true } };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { domain: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (departmentId) {
    where.team = { semester: { batch: { departmentId } } };
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        team: { include: { members: { include: { studentProfile: { include: { user: true } } } } } },
        guideAssignment: { include: { facultyProfile: { include: { user: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return { data: projects, total, page, limit };
};

export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      team: { include: { members: { include: { studentProfile: { include: { user: true } } } } } },
      guideAssignment: { include: { facultyProfile: { include: { user: true } } } },
      milestones: { include: { submissions: { include: { files: true } } } },
      evaluations: { include: { evaluator: true, scores: { include: { criteria: true } } } },
    },
  });

  if (!project) throw new NotFoundError('Project not found');
  return project;
};

export const updateProject = async (id: string, data: any, userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const project = await prisma.project.findUnique({
    where: { id },
    include: { team: { include: { members: true } } },
  });

  if (!project) throw new NotFoundError('Project not found');

  const isLeader = project.team.members.some(m => m.studentProfileId === profile.id && m.isLeader);
  if (!isLeader) throw new ForbiddenError('Only the team leader can update the project');

  if (![ProjectStatus.DRAFT, ProjectStatus.ABSTRACT_REJECTED, ProjectStatus.REVISION_NEEDED].includes(project.status)) {
    throw new ValidationError('Project cannot be updated in its current status');
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data,
  });

  await auditService.createAuditLog({
    action: AuditAction.UPDATE,
    entityType: 'PROJECT',
    entityId: id,
    userId,
    newValue: JSON.stringify(data),
  });

  return updatedProject;
};

export const deleteProject = async (id: string) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new NotFoundError('Project not found');
  await prisma.project.delete({ where: { id } });
  return { message: 'Project deleted successfully' };
};

export const submitAbstract = async (id: string, userId: string) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new NotFoundError('Project not found');
  if (!project.abstract || project.abstract.trim() === '') {
    throw new ValidationError('Abstract cannot be empty');
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: { status: ProjectStatus.ABSTRACT_SUBMITTED },
  });

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'PROJECT',
    entityId: id,
    userId,
    newValue: ProjectStatus.ABSTRACT_SUBMITTED,
  });

  // Notify coordinators
  const coordinators = await prisma.user.findMany({ where: { role: 'COORDINATOR' } });
  for (const coord of coordinators) {
    await notificationService.sendNotification(
      coord.id,
      'Abstract Submitted',
      `Project ${project.title} has submitted its abstract`,
      'GENERAL'
    );
  }

  return updatedProject;
};

export const reviewAbstract = async (id: string, data: { status: string; comments: string }, reviewerId: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { team: { include: { members: { include: { studentProfile: true } } } } },
  });
  if (!project) throw new NotFoundError('Project not found');

  let finalStatus = data.status as ProjectStatus;
  if (data.status === 'REVISION_NEEDED') {
    finalStatus = ProjectStatus.ABSTRACT_REJECTED;
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: { status: finalStatus },
  });

  await auditService.createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: 'PROJECT',
    entityId: id,
    userId: reviewerId,
    oldValue: project.status,
    newValue: finalStatus,
  });

  for (const member of project.team.members) {
    await notificationService.sendNotification(
      member.studentProfile.userId,
      'Abstract Review Updated',
      `Your project abstract has been reviewed. Status: ${finalStatus}. Comments: ${data.comments}`,
      'GENERAL'
    );
  }

  return updatedProject;
};

export const getMyProjects = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a student profile');

  const projects = await prisma.project.findMany({
    where: {
      team: { members: { some: { studentProfileId: profile.id } } },
    },
    include: {
      team: { include: { members: { include: { studentProfile: { include: { user: true } } } } } },
      guideAssignment: { include: { facultyProfile: { include: { user: true } } } },
    },
  });

  return projects;
};

export const getGuidedProjects = async (userId: string) => {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  if (!profile) throw new ValidationError('User does not have a faculty profile');

  const projects = await prisma.project.findMany({
    where: {
      guideAssignment: { some: { facultyProfileId: profile.id, isActive: true } },
    },
    include: {
      team: { include: { members: { include: { studentProfile: { include: { user: true } } } } } },
      milestones: true,
      evaluations: true,
    },
  });

  return projects;
};
