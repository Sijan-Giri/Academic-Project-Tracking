import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
      code: 'VALIDATION_ERROR',
    });
  }

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

  if (err?.name === 'TokenExpiredError' || err?.message === 'jwt expired') {
    return res.status(401).json({
      success: false,
      message: 'Session has expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid access token',
      code: 'INVALID_TOKEN',
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({ success: false, message: 'Database connection failed. Please ensure PostgreSQL is running.', code: 'DATABASE_CONNECTION_ERROR' });
  }

  console.error(err?.stack || err?.message || String(err));

  return res.status(500).json({ success: false, message: err?.message || 'Internal server error', code: 'INTERNAL_ERROR' });
};