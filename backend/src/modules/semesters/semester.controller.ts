import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as semesterService from './semester.service';
import { sendSuccess } from '../../shared/utils';

export const getSemesters = async (req: AuthRequest, res: Response) => {
  const data = await semesterService.getSemesters(req.query.batchId as string);
  sendSuccess(res, data);
};

export const getSemesterById = async (req: AuthRequest, res: Response) => {
  const data = await semesterService.getSemesterById(req.params.id);
  sendSuccess(res, data);
};

export const createSemester = async (req: AuthRequest, res: Response) => {
  const data = await semesterService.createSemester(req.body);
  sendSuccess(res, data, 'Semester created successfully', 201);
};

export const updateSemester = async (req: AuthRequest, res: Response) => {
  const data = await semesterService.updateSemester(req.params.id, req.body);
  sendSuccess(res, data, 'Semester updated successfully');
};

export const deleteSemester = async (req: AuthRequest, res: Response) => {
  const data = await semesterService.deleteSemester(req.params.id);
  sendSuccess(res, data, 'Semester deleted successfully');
};

export const setCurrentSemester = async (req: AuthRequest, res: Response) => {
  const data = await semesterService.setCurrentSemester(req.params.id);
  sendSuccess(res, data, 'Semester set as current successfully');
};
