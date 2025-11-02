// Application error types for better error handling and classification

/**
 * Base application error class
 * All custom errors should extend this
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly retryable: boolean;

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
      context: this.context,
    };
  }
}

/**
 * Validation errors (4xx - client fault, not retryable)
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly retryable = false;
}

/**
 * Resource not found errors (4xx - client fault, not retryable)
 */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  readonly retryable = false;
}

/**
 * Storage errors (5xx - infrastructure, retryable)
 */
export class StorageError extends AppError {
  readonly code = 'STORAGE_ERROR';
  readonly statusCode = 503;
  readonly retryable = true;
}

/**
 * Database errors (5xx - infrastructure, may be retryable)
 */
export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 503;
  readonly retryable: boolean;

  constructor(message: string, context?: Record<string, unknown>, retryable = true) {
    super(message, context);
    this.retryable = retryable;
  }
}

/**
 * Image processing errors (5xx - processing failure, not retryable)
 */
export class ImageProcessingError extends AppError {
  readonly code = 'IMAGE_PROCESSING_ERROR';
  readonly statusCode = 422;
  readonly retryable = false;
}

/**
 * State transition errors (4xx - invalid state, not retryable)
 */
export class StateTransitionError extends AppError {
  readonly code = 'STATE_TRANSITION_ERROR';
  readonly statusCode = 409;
  readonly retryable = false;
}

/**
 * External service errors (5xx - third-party failure, retryable)
 */
export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 503;
  readonly retryable = true;
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      return new DatabaseError(error.message, { originalError: error.name });
    }

    // AWS SDK errors
    if ('name' in error && typeof error.name === 'string') {
      if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        return new StorageError('Object not found in storage', { originalError: error.name });
      }
      if (error.name === 'AccessDenied') {
        return new StorageError('Storage access denied', { originalError: error.name });
      }
    }

    // Generic error
    return new ExternalServiceError(error.message, { originalError: error.name });
  }

  // Unknown error type
  return new ExternalServiceError('An unknown error occurred', { error: String(error) });
}
