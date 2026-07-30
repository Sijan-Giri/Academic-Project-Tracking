import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as settingsService from './settings.service';
import { sendSuccess } from '../../shared/utils';

export const getAllSettings = async (req: AuthRequest, res: Response) => {
  const data = await settingsService.getAllSettings();
  sendSuccess(res, data);
};

export const getPublicSettings = async (req: AuthRequest, res: Response) => {
  const data = await settingsService.getPublicSettings();
  sendSuccess(res, data);
};

export const updateSetting = async (req: AuthRequest, res: Response) => {
  const data = await settingsService.updateSetting(req.params.key, req.body.value, req.user?.userId);
  sendSuccess(res, data, 'Setting updated successfully');
};
