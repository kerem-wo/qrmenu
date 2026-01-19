/**
 * Custom Error Classes
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation error", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", details?: any) {
    super(message, 409, "CONFLICT", details);
  }
}

export class InternalError extends AppError {
  constructor(message: string = "Internal server error", details?: any) {
    super(message, 500, "INTERNAL_ERROR", details);
  }
}

/**
 * Error handler utility
 */
export function handleError(error: unknown): { message: string; statusCode: number; code?: string; details?: any } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: "INTERNAL_ERROR",
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
    code: "UNKNOWN_ERROR",
  };
}
