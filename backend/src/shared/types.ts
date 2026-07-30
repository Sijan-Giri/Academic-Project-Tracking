import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}
