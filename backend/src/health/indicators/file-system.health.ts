import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Custom health indicator for file system and data file
 * Verifies that the tasks.json file is accessible and contains valid JSON
 */
@Injectable()
export class FileSystemHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(FileSystemHealthIndicator.name);
  // Use same path resolution as TasksService for consistency
  private readonly dataPath = join(__dirname, '../../data/tasks.json');

  /**
   * Check if the tasks data file is accessible and valid
   * @param key - The key to use in the health check response
   * @returns HealthIndicatorResult
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if file exists and is readable
      await fs.access(this.dataPath, fs.constants.R_OK | fs.constants.W_OK);

      // Try to read and parse the file
      const content = await fs.readFile(this.dataPath, 'utf-8');
      const data = JSON.parse(content);

      // Verify structure
      if (!data || typeof data !== 'object' || !Array.isArray(data.tasks)) {
        throw new Error('Invalid tasks.json structure');
      }

      const result = this.getStatus(key, true, {
        file: this.dataPath,
        taskCount: data.tasks.length,
        readable: true,
        writable: true,
        validJSON: true,
      });

      this.logger.debug(`File system health check passed: ${data.tasks.length} tasks`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`File system health check failed: ${errorMessage}`);

      const result = this.getStatus(key, false, {
        file: this.dataPath,
        error: errorMessage,
        readable: false,
        writable: false,
        validJSON: false,
      });

      throw new HealthCheckError('File system check failed', result);
    }
  }
}
