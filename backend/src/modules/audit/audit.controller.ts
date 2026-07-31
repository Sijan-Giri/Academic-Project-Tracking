import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import { getAuditLogs } from './audit.service';
import { sendSuccess } from '../../shared/utils';
import { AuditAction } from '@prisma/client';

export const getAuditLogsHandler = async (req: AuthRequest, res: Response) => {
  const { userId, action, entityType, entityId, startDate, endDate, page, limit } = req.query as any;
  const result = await getAuditLogs({
    userId, action: action as AuditAction, entityType, entityId, startDate, endDate,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  sendSuccess(res, result, 'Audit logs retrieved');
};
