import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as batchService from './batch.service';
import { sendSuccess } from '../../shared/utils';

export const getBatches = async (req: AuthRequest, res: Response) => {
  const data = await batchService.getBatches(req.query.departmentId as string);
  sendSuccess(res, data);
};

export const getBatchById = async (req: AuthRequest, res: Response) => {
  const data = await batchService.getBatchById(req.params.id);
  sendSuccess(res, data);
};

export const createBatch = async (req: AuthRequest, res: Response) => {
  const data = await batchService.createBatch(req.body);
  sendSuccess(res, data, 'Batch created successfully', 201);
};

export const updateBatch = async (req: AuthRequest, res: Response) => {
  const data = await batchService.updateBatch(req.params.id, req.body);
  sendSuccess(res, data, 'Batch updated successfully');
};

export const deleteBatch = async (req: AuthRequest, res: Response) => {
  const data = await batchService.deleteBatch(req.params.id);
  sendSuccess(res, data, 'Batch deleted successfully');
};

export const getBatchSemesters = async (req: AuthRequest, res: Response) => {
  const data = await batchService.getBatchSemesters(req.params.id);
  sendSuccess(res, data);
};

export const getBatchStudents = async (req: AuthRequest, res: Response) => {
  const data = await batchService.getBatchStudents(req.params.id);
  sendSuccess(res, data);
};