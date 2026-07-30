import prisma from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { auditService } from '../audit/audit.service';
import { ReviewStageType } from '@prisma/client';

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
    await auditService.createAuditLog('CREATE', 'ReviewStageTemplate', template.id, userId, { data });
    return template;
  },

  async updateTemplate(id: string, data: any, userId: string) {
    const template = await prisma.reviewStageTemplate.update({ where: { id }, data });
    await auditService.createAuditLog('UPDATE', 'ReviewStageTemplate', template.id, userId, { data });
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
    return prisma.reviewStage.create({ data });
  },

  async updateReviewStage(id: string, data: any) {
    return prisma.reviewStage.update({ where: { id }, data });
  },

  async deleteReviewStage(id: string) {
    return prisma.reviewStage.delete({ where: { id } });
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
    return prisma.evaluationCriteria.delete({
      where: { id: criteriaId, reviewStageId: stageId },
    });
  },
};
