import prisma from '../../config/database';
import { createAuditLog } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

export const getAllSettings = async () => {
  return prisma.settings.findMany();
};

export const getSetting = async (key: string) => {
  return prisma.settings.findUnique({ where: { key } });
};

export const updateSetting = async (key: string, value: string, userId?: string) => {
  const oldSetting = await prisma.settings.findUnique({ where: { key } });
  const newSetting = await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  
  if (userId) {
    await createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entityType: 'SETTING',
      entityId: key,
      oldValue: oldSetting,
      newValue: newSetting,
    });
  }
  return newSetting;
};

export const getPublicSettings = async () => {
  const publicKeys = ['max_team_size', 'min_team_size', 'abstract_max_words'];
  const settings = await prisma.settings.findMany({
    where: { key: { in: publicKeys } },
  });
  return settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
};
