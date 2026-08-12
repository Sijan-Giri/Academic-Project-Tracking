import { NotificationType } from '@prisma/client';
import prisma from '../../config/database';
import { sendEmail } from '../../config/mailer';
import { emitToUser } from '../../config/socket';

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'GENERAL',
  relatedProjectId?: string
) => {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, relatedProjectId },
  });

  try {
    const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });
    emitToUser(userId, 'notification:new', notification);
    emitToUser(userId, 'notification:unread_count', { count: unreadCount });
  } catch (_) {}

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user) {
      sendEmail(
        user.email,
        `APTS: ${title}`,
        `<h3>Hello ${user.name}</h3><p>${message}</p><hr/><small>Academic Project Tracking System</small>`
      ).catch(() => {});
    }
  } catch (_) {}
};

export const getMyNotifications = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const markRead = async (id: string, userId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return null;
  }
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};
