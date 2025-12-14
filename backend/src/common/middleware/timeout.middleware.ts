import { Injectable, NestMiddleware, RequestTimeoutException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Timeout middleware to prevent long-running requests from exhausting resources
 * Properly handles timeout cleanup to prevent memory leaks
 */
@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TimeoutMiddleware.name);
  private readonly timeout = 30000; // 30 seconds

  use(req: Request, res: Response, next: NextFunction) {
    let isTimedOut = false;

    // Set timeout and handle it properly
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        isTimedOut = true;
        this.logger.warn(`Request timeout: ${req.method} ${req.url}`);

        // Send timeout response instead of throwing
        // Throwing in setTimeout is outside request context and can't be caught
        res.status(408).json({
          statusCode: 408,
          message: 'Request timeout - operation took too long',
          error: 'Request Timeout',
          timestamp: new Date().toISOString(),
          path: req.url,
        });
      }
    }, this.timeout);

    // Clear timeout when response is finished or connection closed
    const cleanup = () => {
      clearTimeout(timer);
      if (!isTimedOut) {
        this.logger.debug(`Request completed: ${req.method} ${req.url}`);
      }
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
  }
}
