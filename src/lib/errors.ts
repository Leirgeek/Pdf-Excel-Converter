export class AppError extends Error {
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(
    message: string,
    statusCode: number = 500,
    userMessage: string = 'An unexpected error occurred'
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }

  static badRequest(message: string, userMessage?: string) {
    return new AppError(message, 400, userMessage || 'Invalid request');
  }

  static notFound(message: string, userMessage?: string) {
    return new AppError(message, 404, userMessage || 'Resource not found');
  }

  static internal(message: string, userMessage?: string) {
    return new AppError(
      message,
      500,
      userMessage || 'An unexpected error occurred'
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 400, userMessage || 'Validation failed');
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 500, userMessage || 'Failed to process the request');
    this.name = 'ProcessingError';
  }
}
