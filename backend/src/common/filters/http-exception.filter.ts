import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter for standardized error responses
 * Catches all HTTP exceptions and formats them consistently
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === 'production';

    // Extract error message(s)
    let message: string | string[];
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      message = (exceptionResponse as any).message;
    } else {
      message = exception.message;
    }

    // Build standardized error response (environment-aware)
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Only show detailed messages in development or for 4xx errors
      message: isProduction && status >= 500
        ? 'Internal server error'
        : message,
      // Only include extra details in development
      ...(! isProduction && {
        error: HttpStatus[status] || 'Error',
        method: request.method,
      }),
    };

    // Log the error with appropriate level
    if (status >= 500) {
      // Only log stack traces in development
      this.logger.error(
        `HTTP ${status} Error: ${request.method} ${request.url}`,
        isProduction ? undefined : exception.stack,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `HTTP ${status} Warning: ${request.method} ${request.url} - ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
