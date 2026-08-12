import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as guideService from './guide.service';

export const assignGuideHandler = async (req: AuthRequest, res: Response) => {
  const assignment = await guideService.assignGuide(req.body, req.user!.userId);
  res.status(201).json(assignment);
};

export const removeGuideAssignmentHandler = async (req: AuthRequest, res: Response) => {
  const assignment = await guideService.removeGuideAssignment(req.params.id, req.user!.userId);
  res.json(assignment);
};

export const getAvailableGuidesHandler = async (_req: AuthRequest, res: Response) => {
  const guides = await guideService.getAvailableGuides();
  res.json(guides);
};

export const getGuideAssignmentsHandler = async (_req: AuthRequest, res: Response) => {
  const assignments = await guideService.getGuideAssignments();
  res.json(assignments);
};
