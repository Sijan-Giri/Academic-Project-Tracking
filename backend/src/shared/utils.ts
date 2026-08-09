import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload, PaginatedResult } from './types';
import { UnauthorizedError } from './errors';

export const sendSuccess = <T>(res: Response, data: T, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

export const sendError = (res: Response, message: string, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, data: null, message });
};

export const paginate = (page = 1, limit = 20) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const buildPaginatedResult = <T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 12);

export const comparePassword = async (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);

export const generateToken = (payload: object, secret: string, expiresIn: string): string =>
  jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

export const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret) as any;
    const userId = decoded.userId || decoded.id;
    return { ...decoded, userId, id: userId };
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError' || error?.message === 'jwt expired') {
      throw new UnauthorizedError('Session has expired', 'TOKEN_EXPIRED');
    }
    if (error?.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid access token', 'INVALID_TOKEN');
    }
    throw new UnauthorizedError('Authentication failed', 'UNAUTHORIZED');
  }
};

export const exclude = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(k => delete result[k]);
  return result;
};
