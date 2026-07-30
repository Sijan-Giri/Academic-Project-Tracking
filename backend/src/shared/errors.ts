export class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class NotFoundError extends AppError { constructor(msg = 'Resource not found') { super(msg, 404, 'NOT_FOUND'); } }
export class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized') { super(msg, 401, 'UNAUTHORIZED'); } }
export class ForbiddenError extends AppError { constructor(msg = 'Forbidden') { super(msg, 403, 'FORBIDDEN'); } }
export class ConflictError extends AppError { constructor(msg = 'Conflict') { super(msg, 409, 'CONFLICT'); } }
export class ValidationError extends AppError { constructor(msg = 'Validation failed') { super(msg, 422, 'VALIDATION'); } }
export class LockedError extends AppError { constructor(msg = 'This evaluation is locked and cannot be modified') { super(msg, 423, 'LOCKED'); } }