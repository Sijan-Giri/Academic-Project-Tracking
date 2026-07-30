import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as academicYearService from './academic-year.service';
import { sendSuccess } from '../../shared/utils';

export const getAcademicYears = async (req: AuthRequest, res: Response) => {
  const data = await academicYearService.getAcademicYears();
  sendSuccess(res, data);
};

export const getAcademicYearById = async (req: AuthRequest, res: Response) => {
  const data = await academicYearService.getAcademicYearById(req.params.id);
  sendSuccess(res, data);
};

export const createAcademicYear = async (req: AuthRequest, res: Response) => {
  const data = await academicYearService.createAcademicYear(req.body);
  sendSuccess(res, data, 'Academic year created successfully', 201);
};

export const updateAcademicYear = async (req: AuthRequest, res: Response) => {
  const data = await academicYearService.updateAcademicYear(req.params.id, req.body);
  sendSuccess(res, data, 'Academic year updated successfully');
};

export const deleteAcademicYear = async (req: AuthRequest, res: Response) => {
  const data = await academicYearService.deleteAcademicYear(req.params.id);
  sendSuccess(res, data, 'Academic year deleted successfully');
};