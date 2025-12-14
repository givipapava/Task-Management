import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Health check controller for monitoring application status
 * Provides endpoints for liveness and readiness probes
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  /**
   * Health check endpoint for monitoring
   * Checks disk space and memory usage
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check', description: 'Check application health status' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  check() {
    return this.health.check([
      // Check if disk storage has at least 50% free space
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.5,
        }),
      // Check if memory heap doesn't exceed 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Check if RSS memory doesn't exceed 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  /**
   * Simple liveness probe
   * Returns 200 if application is running
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe', description: 'Check if application is alive' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  getLiveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Readiness probe
   * Returns 200 if application is ready to serve requests
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe', description: 'Check if application is ready' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  getReadiness() {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
