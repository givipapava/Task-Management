import { Injectable, NestMiddleware, RequestTimeoutException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Timeout middleware to prevent long-running requests from exhausting resources
 * Throws RequestTimeoutException if request takes longer than configured timeout
 */
@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly timeout = 30000; // 30 seconds

  use(req: Request, res: Response, next: NextFunction) {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        throw new RequestTimeoutException('Request timeout - operation took too long');
      }
    }, this.timeout);

    // Clear timeout when response is finished or connection closed
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  }
}
