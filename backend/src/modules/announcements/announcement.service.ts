import { Role } from '@prisma/client';
import prisma from '../../config/database';
import { sendNotification } from '../notifications/notification.service';
import { broadcastEvent } from '../../config/socket';

export const createAnnouncement = async (data: any, createdById: string) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      createdById,
    },
    include: { createdBy: { select: { name: true, role: true } } },
  });

  // Real-time socket broadcast
  try {
    broadcastEvent('announcement:new', announcement);
  } catch (_) {}

  // Sending notifications to relevant users
  const users = await prisma.user.findMany({ where: { isActive: true } });
  for (const user of users) {
    await sendNotification(user.id, `New Announcement: ${data.title}`, data.content, 'GENERAL');
  }

  return announcement;
};

export const getAnnouncements = async (
  userId: string,
  userRole: Role,
  departmentId?: string,
  batchId?: string,
  semesterId?: string,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true, role: true } } },
    }),
    prisma.announcement.count(),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getAnnouncementById = async (id: string) => {
  return prisma.announcement.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true, role: true } } },
  });
};

export const deleteAnnouncement = async (id: string, userId: string, userRole: Role) => {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new Error('Announcement not found');
  if (announcement.createdById !== userId && userRole !== Role.ADMIN) {
    throw new Error('Forbidden');
  }
  const deleted = await prisma.announcement.delete({ where: { id } });

  // Real-time socket broadcast
  try {
    broadcastEvent('announcement:deleted', { id });
  } catch (_) {}

  return deleted;
};
