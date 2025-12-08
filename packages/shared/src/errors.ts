/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    cause?: Error
  ) {
    super(message, "VALIDATION_ERROR", 400, cause);
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    public readonly resource?: string,
    cause?: Error
  ) {
    super(message, "NOT_FOUND", 404, cause);
  }
}

/**
 * Unauthorized error for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    cause?: Error
  ) {
    super(message, "UNAUTHORIZED", 401, cause);
  }
}

/**
 * Forbidden error for authorization failures
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "Forbidden",
    cause?: Error
  ) {
    super(message, "FORBIDDEN", 403, cause);
  }
}

/**
 * Conflict error for resource conflicts
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    cause?: Error
  ) {
    super(message, "CONFLICT", 409, cause);
  }
}

/**
 * Internal server error for unexpected failures
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    cause?: Error
  ) {
    super(message, "INTERNAL_SERVER_ERROR", 500, cause);
  }
}

/**
 * Check if an error is an AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to an AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new InternalServerError(error.message, error);
  }
  return new InternalServerError(String(error));
}

