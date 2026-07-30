import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as notificationService from './notification.service';
import { sendSuccess } from '../../shared/utils';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const data = await notificationService.getMyNotifications(
    req.user!.userId,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20
  );
  sendSuccess(res, data);
};

export const markRead = async (req: AuthRequest, res: Response) => {
  const data = await notificationService.markRead(req.params.id, req.user!.userId);
  sendSuccess(res, data, 'Notification marked as read');
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  const data = await notificationService.markAllRead(req.user!.userId);
  sendSuccess(res, data, 'All notifications marked as read');
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  const data = await notificationService.getUnreadCount(req.user!.userId);
  sendSuccess(res, data);
};
