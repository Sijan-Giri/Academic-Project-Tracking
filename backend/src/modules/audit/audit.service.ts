import { AuditAction } from '@prisma/client';
import prisma from '../../config/database';

interface AuditData {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (data: AuditData): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValue: data.oldValue as any,
      newValue: data.newValue as any,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
};

export const getAuditLogs = async (filters: {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 20, ...where } = filters;
  const skip = (page - 1) * limit;
  const whereClause: any = {};
  if (where.userId) whereClause.userId = where.userId;
  if (where.action) whereClause.action = where.action;
  if (where.entityType) whereClause.entityType = where.entityType;
  if (where.entityId) whereClause.entityId = where.entityId;
  if (where.startDate || where.endDate) {
    whereClause.createdAt = {};
    if (where.startDate) whereClause.createdAt.gte = new Date(where.startDate);
    if (where.endDate) whereClause.createdAt.lte = new Date(where.endDate);
  }
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where: whereClause }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};