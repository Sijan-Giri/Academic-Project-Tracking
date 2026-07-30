import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as announcementService from './announcement.service';
import { sendSuccess } from '../../shared/utils';

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  const data = await announcementService.createAnnouncement(req.body, req.user!.userId);
  sendSuccess(res, data, 'Announcement created successfully', 201);
};

export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  const { departmentId, batchId, semesterId, page, limit } = req.query;
  const data = await announcementService.getAnnouncements(
    req.user!.userId,
    req.user!.role,
    departmentId as string,
    batchId as string,
    semesterId as string,
    page ? parseInt(page as string) : 1,
    limit ? parseInt(limit as string) : 20
  );
  sendSuccess(res, data);
};

export const getAnnouncementById = async (req: AuthRequest, res: Response) => {
  const data = await announcementService.getAnnouncementById(req.params.id);
  sendSuccess(res, data);
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  const data = await announcementService.deleteAnnouncement(req.params.id, req.user!.userId, req.user!.role);
  sendSuccess(res, data, 'Announcement deleted successfully');
};
