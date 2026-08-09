import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as guideService from './guide.service';

export const submitPreferencesHandler = async (req: AuthRequest, res: Response) => {
  const result = await guideService.submitPreferences(req.body, req.user!.userId);
  res.status(201).json(result);
};

export const getGuidePreferencesHandler = async (req: AuthRequest, res: Response) => {
  const prefs = await guideService.getGuidePreferences(req.params.projectId);
  res.json(prefs);
};

export const getAllGuidePreferencesHandler = async (req: AuthRequest, res: Response) => {
  const prefs = await guideService.getAllGuidePreferences();
  res.json(prefs);
};

export const approvePreferenceHandler = async (req: AuthRequest, res: Response) => {
  const pref = await guideService.approvePreference(req.params.id, req.user!.userId);
  res.json(pref);
};

export const rejectPreferenceHandler = async (req: AuthRequest, res: Response) => {
  const pref = await guideService.rejectPreference(req.params.id, req.body.note, req.user!.userId);
  res.json(pref);
};

export const assignGuideHandler = async (req: AuthRequest, res: Response) => {
  const assignment = await guideService.assignGuide(req.body, req.user!.userId);
  res.status(201).json(assignment);
};

export const removeGuideAssignmentHandler = async (req: AuthRequest, res: Response) => {
  const assignment = await guideService.removeGuideAssignment(req.params.id, req.user!.userId);
  res.json(assignment);
};

export const getAvailableGuidesHandler = async (req: AuthRequest, res: Response) => {
  const guides = await guideService.getAvailableGuides();
  res.json(guides);
};

export const getGuideAssignmentsHandler = async (req: AuthRequest, res: Response) => {
  const assignments = await guideService.getGuideAssignments();
  res.json(assignments);
};
