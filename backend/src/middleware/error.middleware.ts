import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, code: err.code });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A record with this value already exists', code: 'CONFLICT' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found', code: 'NOT_FOUND' });
    }
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: 'Invalid JSON', code: 'BAD_REQUEST' });
  }

  return res.status(500).json({ success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' });
};