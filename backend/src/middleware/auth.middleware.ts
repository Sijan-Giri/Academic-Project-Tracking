import { Response, NextFunction } from 'express';
import { AuthRequest } from '../shared/types';
import { UnauthorizedError } from '../shared/errors';
import { verifyToken } from '../shared/utils';
import { env } from '../config/env';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = req.cookies?.access_token || bearerToken;

  if (!token) throw new UnauthorizedError('No access token provided');
  req.user = verifyToken(token, env.JWT_ACCESS_SECRET);
  next();
};