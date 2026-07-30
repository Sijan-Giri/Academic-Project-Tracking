import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as deptService from './department.service';
import { sendSuccess } from '../../shared/utils';

export const getDepartments = async (req: AuthRequest, res: Response) => {
  const data = await deptService.getDepartments();
  sendSuccess(res, data);
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  const data = await deptService.getDepartmentById(req.params.id);
  sendSuccess(res, data);
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  const data = await deptService.createDepartment(req.body, req.user?.userId);
  sendSuccess(res, data, 'Department created successfully', 201);
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  const data = await deptService.updateDepartment(req.params.id, req.body, req.user?.userId);
  sendSuccess(res, data, 'Department updated successfully');
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  const data = await deptService.deleteDepartment(req.params.id, req.user?.userId);
  sendSuccess(res, data, 'Department deleted successfully');
};

export const getDepartmentFaculty = async (req: AuthRequest, res: Response) => {
  const data = await deptService.getDepartmentFaculty(req.params.id);
  sendSuccess(res, data);
};

export const getDepartmentBatches = async (req: AuthRequest, res: Response) => {
  const data = await deptService.getDepartmentBatches(req.params.id);
  sendSuccess(res, data);
};