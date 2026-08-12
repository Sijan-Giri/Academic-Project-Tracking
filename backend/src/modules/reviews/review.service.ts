import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { createAuditLog } from '../audit/audit.service';
import { sendNotification } from '../notifications/notification.service';

const notifyStageDeadline = async (stage: any, isUpdate = false) => {
  try {
    const formattedDeadline = stage.deadline
      ? new Date(stage.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBD';

    const title = isUpdate ? `Deadline Updated: ${stage.name}` : `New Stage Deadline: ${stage.name}`;
    const message = `Deadline for "${stage.name}" is set for ${formattedDeadline}. Please check your project portal for milestone requirements and submission guidelines.`;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { studentProfile: { batch: { departmentId: stage.departmentId } } },
          { facultyProfile: { departmentId: stage.departmentId } },
        ],
      },
      select: { id: true },
    });

    for (const u of users) {
      await sendNotification(u.id, title, message, 'DEADLINE_REMINDER');
    }
  } catch (err) {
    console.error('Failed to dispatch stage deadline notifications:', err);
  }
};

const syncMilestonesForStage = async (stage: any) => {
  try {
    const projects = await prisma.project.findMany({
      where: { semesterId: stage.semesterId },
    });

    for (const project of projects) {
      const existingMilestone = await prisma.milestone.findFirst({
        where: { projectId: project.id, reviewStageId: stage.id },
      });

      if (existingMilestone) {
        await prisma.milestone.update({
          where: { id: existingMilestone.id },
          data: {
            name: stage.name,
            deadline: stage.deadline ? new Date(stage.deadline) : undefined,
            order: stage.order,
          } as any,
        });
      } else {
        await prisma.milestone.create({
          data: {
            projectId: project.id,
            reviewStageId: stage.id,
            name: stage.name,
            description: `Review stage milestone: ${stage.name}`,
            deadline: stage.deadline ? new Date(stage.deadline) : undefined,
            order: stage.order,
            status: 'NOT_STARTED',
            requiredDocuments: ['Project Report (PDF)', 'Slide Deck (PPTX/PDF)'],
          } as any,
        });
      }
    }
  } catch (err) {
    console.error('Failed to sync milestones for review stage:', err);
  }
};

export const reviewService = {
  async getTemplates() {
    return prisma.reviewStageTemplate.findMany({
      orderBy: { order: 'asc' },
    });
  },

  async getTemplateById(id: string) {
    const template = await prisma.reviewStageTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundError('ReviewStageTemplate not found');
    return template;
  },

  async createTemplate(data: any, userId: string) {
    const template = await prisma.reviewStageTemplate.create({ data });
    await createAuditLog({ userId, action: 'CREATE', entityType: 'ReviewStageTemplate', entityId: template.id, newValue: data });
    return template;
  },

  async updateTemplate(id: string, data: any, userId: string) {
    const template = await prisma.reviewStageTemplate.update({ where: { id }, data });
    await createAuditLog({ userId, action: 'UPDATE', entityType: 'ReviewStageTemplate', entityId: template.id, newValue: data });
    return template;
  },

  async deleteTemplate(id: string) {
    return prisma.reviewStageTemplate.delete({ where: { id } });
  },

  async getReviewStages(filters: { semesterId?: string; departmentId?: string } = {}) {
    return prisma.reviewStage.findMany({
      where: filters,
      include: { criteria: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
  },

  async getReviewStageById(id: string) {
    const stage = await prisma.reviewStage.findUnique({
      where: { id },
      include: { criteria: { orderBy: { order: 'asc' } }, schedules: true },
    });
    if (!stage) throw new NotFoundError('ReviewStage not found');
    return stage;
  },

  async createReviewStage(data: any) {
    const cleanData = {
      ...data,
      templateId: data.templateId || undefined,
      semesterId: data.semesterId || undefined,
      departmentId: data.departmentId || undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    };

    if (!cleanData.semesterId) {
      const activeSemester = (await prisma.semester.findFirst({ where: { isCurrent: true } })) || (await prisma.semester.findFirst());
      if (activeSemester) {
        cleanData.semesterId = activeSemester.id;
      }
    }

    if (!cleanData.departmentId) {
      const activeDept = (await prisma.department.findFirst({ where: { isActive: true } })) || (await prisma.department.findFirst());
      if (activeDept) {
        cleanData.departmentId = activeDept.id;
      }
    }

    if (!cleanData.templateId) {
      let defaultTemplate = await prisma.reviewStageTemplate.findFirst({
        where: { type: cleanData.type },
      });
      if (!defaultTemplate) {
        defaultTemplate = await prisma.reviewStageTemplate.create({
          data: {
            name: cleanData.name || 'Default Stage Template',
            type: cleanData.type,
            order: cleanData.order || 1,
            isDefault: true,
          },
        });
      }
      cleanData.templateId = defaultTemplate.id;
    }

    const stage = await prisma.reviewStage.create({ data: cleanData });

    await syncMilestonesForStage(stage);

    notifyStageDeadline(stage, false).catch(err => console.error('Deadline notification error:', err));

    return stage;
  },

  async updateReviewStage(id: string, data: any) {
    const stage = await prisma.reviewStage.update({ where: { id }, data });
    await syncMilestonesForStage(stage);
    notifyStageDeadline(stage, true).catch(err => console.error('Deadline update notification error:', err));
    return stage;
  },

  async deleteReviewStage(id: string) {
    return prisma.$transaction(async (tx) => {
      const criteria = await tx.evaluationCriteria.findMany({ where: { reviewStageId: id } });
      const criteriaIds = criteria.map((c) => c.id);

      if (criteriaIds.length > 0) {
        await tx.evaluationScore.deleteMany({ where: { criteriaId: { in: criteriaIds } } });
        await tx.evaluationCriteria.deleteMany({ where: { reviewStageId: id } });
      }

      await tx.evaluation.deleteMany({ where: { reviewStageId: id } });

      const schedules = await tx.reviewSchedule.findMany({ where: { reviewStageId: id } });
      const scheduleIds = schedules.map((s) => s.id);

      if (scheduleIds.length > 0) {
        await tx.panelAssignment.deleteMany({ where: { scheduleId: { in: scheduleIds } } });
        await tx.reviewSchedule.deleteMany({ where: { reviewStageId: id } });
      }

      const milestones = await tx.milestone.findMany({ where: { reviewStageId: id } });
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
        await tx.milestone.deleteMany({ where: { reviewStageId: id } });
      }

      return tx.reviewStage.delete({ where: { id } });
    });
  },

  async getStageCriteria(stageId: string) {
    return prisma.evaluationCriteria.findMany({
      where: { reviewStageId: stageId },
      orderBy: { order: 'asc' },
    });
  },

  async addCriteria(stageId: string, data: any) {
    return prisma.evaluationCriteria.create({
      data: { ...data, reviewStageId: stageId },
    });
  },

  async updateCriteria(stageId: string, criteriaId: string, data: any) {
    return prisma.evaluationCriteria.update({
      where: { id: criteriaId, reviewStageId: stageId },
      data,
    });
  },

  async deleteCriteria(stageId: string, criteriaId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.evaluationScore.deleteMany({ where: { criteriaId } });
      return tx.evaluationCriteria.delete({
        where: { id: criteriaId, reviewStageId: stageId },
      });
    });
  },
};
