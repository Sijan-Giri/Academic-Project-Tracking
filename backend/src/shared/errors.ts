export class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class NotFoundError extends AppError { constructor(msg = 'Resource not found', code = 'NOT_FOUND') { super(msg, 404, code); } }
export class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized', code = 'UNAUTHORIZED') { super(msg, 401, code); } }
export class ForbiddenError extends AppError { constructor(msg = 'Forbidden', code = 'FORBIDDEN') { super(msg, 403, code); } }
export class ConflictError extends AppError { constructor(msg = 'Conflict', code = 'CONFLICT') { super(msg, 409, code); } }
export class ValidationError extends AppError { constructor(msg = 'Validation failed', code = 'VALIDATION') { super(msg, 422, code); } }
export class LockedError extends AppError { constructor(msg = 'This evaluation is locked and cannot be modified', code = 'LOCKED') { super(msg, 423, code); } }