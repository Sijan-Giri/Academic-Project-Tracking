import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../shared/types';
import { ForbiddenError } from '../shared/errors';

export const requireRoles = (...roles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) throw new ForbiddenError();
  if (!roles.includes(req.user.role)) throw new ForbiddenError(`Role ${req.user.role} is not allowed here`);
  next();
};