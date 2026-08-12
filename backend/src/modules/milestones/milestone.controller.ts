import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as milestoneService from './milestone.service';

export const getMilestonesHandler = async (req: AuthRequest, res: Response) => {
  const milestones = await milestoneService.getMilestones(
    req.query.projectId as string,
    req.user?.userId,
    req.user?.role
  );
  res.json({ success: true, data: { items: milestones, total: milestones.length } });
};

export const getMilestoneByIdHandler = async (req: AuthRequest, res: Response) => {
  const milestone = await milestoneService.getMilestoneById(req.params.id);
  res.json({ success: true, data: milestone });
};

export const createMilestoneHandler = async (req: AuthRequest, res: Response) => {
  const milestone = await milestoneService.createMilestone(req.body, req.user!.userId);
  res.status(201).json({ success: true, data: milestone });
};

export const updateMilestoneHandler = async (req: AuthRequest, res: Response) => {
  const milestone = await milestoneService.updateMilestone(req.params.id, req.body, req.user!.userId);
  res.json({ success: true, data: milestone });
};

export const deleteMilestoneHandler = async (req: AuthRequest, res: Response) => {
  const result = await milestoneService.deleteMilestone(req.params.id, req.user!.userId);
  res.json({ success: true, data: result });
};

export const updateMilestoneStatusHandler = async (req: AuthRequest, res: Response) => {
  const milestone = await milestoneService.updateMilestoneStatus(req.params.id, req.body.status, req.user!.userId);
  res.json({ success: true, data: milestone });
};
