import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import * as userService from './user.service';
import { sendSuccess } from '../../shared/utils';
import { Role } from '@prisma/client';

export const getUsers = async (req: AuthRequest, res: Response) => {
  const { role, departmentId, batchId, search, page, limit } = req.query as any;
  const data = await userService.getUsers({
    role: role as Role,
    departmentId, batchId, search,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  sendSuccess(res, data);
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const data = await userService.getUserById(req.params.id);
  sendSuccess(res, data);
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const data = await userService.createUser(req.body);
  sendSuccess(res, data, 'User created successfully', 201);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const data = await userService.updateUser(userId, req.body);
  sendSuccess(res, data, 'Profile updated successfully');
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const data = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, data, 'User updated successfully');
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const data = await userService.deleteUser(req.params.id);
  sendSuccess(res, data, 'User deleted successfully');
};

export const activateUser = async (req: AuthRequest, res: Response) => {
  const data = await userService.activateUser(req.params.id);
  sendSuccess(res, data, 'User activated successfully');
};

export const deactivateUser = async (req: AuthRequest, res: Response) => {
  const data = await userService.deactivateUser(req.params.id);
  sendSuccess(res, data, 'User deactivated successfully');
};

export const getUserActivity = async (req: AuthRequest, res: Response) => {
  const data = await userService.getUserActivity(req.params.id);
  sendSuccess(res, data);
};
