import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResponseDto, PaginationMeta } from './dto/paginated-response.dto';

interface TasksData {
  tasks: Task[];
}

interface CacheEntry {
  data: TasksData;
  timestamp: number;
}

/**
 * Service handling business logic for task operations
 * Uses file-based storage with JSON persistence
 * Thread-safe with mutex for concurrent write operations
 * Implements in-memory caching for improved performance
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly dataPath = join(__dirname, '../data/tasks.json');
  private readonly dataDir = join(__dirname, '../data');
  private readonly mutex = new Mutex();

  // In-memory cache configuration
  private cache: CacheEntry | null = null;
  private readonly cacheTTL = 5000; // 5 seconds cache TTL

  /**
   * Check if cache is valid
   * @returns boolean indicating if cache is fresh
   */
  private isCacheValid(): boolean {
    if (!this.cache) {
      return false;
    }
    const age = Date.now() - this.cache.timestamp;
    return age < this.cacheTTL;
  }

  /**
   * Invalidate the cache
   */
  private invalidateCache(): void {
    this.cache = null;
    this.logger.debug('Cache invalidated');
  }

  /**
   * Read tasks data from JSON file with caching
   * @returns TasksData object containing array of tasks
   * @throws InternalServerErrorException if file read or parse fails
   */
  private async readData(): Promise<TasksData> {
    // Return cached data if valid
    if (this.isCacheValid()) {
      this.logger.debug('Returning cached data');
      return this.cache!.data;
    }

    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsedData = JSON.parse(data);

      // Update cache
      this.cache = {
        data: parsedData,
        timestamp: Date.now(),
      };
      this.logger.debug(`Cached ${parsedData.tasks.length} tasks`);

      return parsedData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.warn(`Tasks file not found at ${this.dataPath}, initializing empty task list`);
        const emptyData = { tasks: [] };

        // Cache empty result too
        this.cache = {
          data: emptyData,
          timestamp: Date.now(),
        };

        return emptyData;
      }
      this.logger.error(`Failed to read tasks file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to load tasks data');
    }
  }

  /**
   * Ensure data directory exists, create if not
   * @throws InternalServerErrorException if directory creation fails
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.log(`Creating data directory at ${this.dataDir}`);
        await fs.mkdir(this.dataDir, { recursive: true });
      } else {
        this.logger.error(`Failed to access data directory: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to access data directory');
      }
    }
  }

  /**
   * Internal write method without mutex lock (called from within mutex-protected operations)
   * Uses atomic write pattern (write to temp file, then rename)
   * Creates backup before writing for disaster recovery
   * @param data TasksData object to persist
   * @throws InternalServerErrorException if file write fails
   */
  private async writeDataInternal(data: TasksData): Promise<void> {
    const tempPath = `${this.dataPath}.tmp`;
    const backupPath = `${this.dataPath}.backup`;

    try {
      await this.ensureDataDir();

      // Step 1: Create backup of existing file (if it exists)
      try {
        await fs.access(this.dataPath);
        await fs.copyFile(this.dataPath, backupPath);
        this.logger.debug('Created backup of tasks file');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
        // File doesn't exist yet, no backup needed
      }

      // Step 2: Write to temporary file
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');

      // Step 3: Atomic rename (overwrites target file atomically)
      await fs.rename(tempPath, this.dataPath);

      this.logger.debug(`Successfully wrote ${data.tasks.length} tasks to file (atomic write)`);

      // Step 4: Invalidate cache after write
      this.invalidateCache();

      // Step 5: Clean up backup file after successful write
      try {
        await fs.unlink(backupPath);
        this.logger.debug('Cleaned up backup file');
      } catch (unlinkError) {
        // Ignore if backup doesn't exist
      }
    } catch (error) {
      // Rollback: Try to restore from backup if write failed
      try {
        await fs.access(backupPath);
        await fs.copyFile(backupPath, this.dataPath);
        this.logger.warn('Write failed, restored from backup');
      } catch (rollbackError) {
        this.logger.error('Failed to rollback from backup', rollbackError);
      }

      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch (unlinkError) {
        // Ignore if temp file doesn't exist
      }

      this.logger.error(`Failed to write tasks file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to save tasks data');
    }
  }

  /**
   * Write tasks data to JSON file with mutex lock
   * Public method that wraps writeDataInternal with mutex protection
   * @param data TasksData object to persist
   * @throws InternalServerErrorException if file write fails
   */
  private async writeData(data: TasksData): Promise<void> {
    return this.mutex.runExclusive(async () => {
      await this.writeDataInternal(data);
    });
  }

  /**
   * Retrieve all tasks with pagination support
   * @param paginationQuery Optional pagination parameters
   * @returns Paginated response with tasks and metadata
   */
  async findAll(paginationQuery?: PaginationQueryDto): Promise<Task[] | PaginatedResponseDto<Task>> {
    this.logger.debug('Retrieving tasks', { pagination: paginationQuery });
    const data = await this.readData();

    // If no pagination requested, return all tasks (backward compatibility)
    // Check if page or pageSize are actually set (not just undefined)
    const hasPagination = paginationQuery?.page !== undefined || paginationQuery?.pageSize !== undefined;

    if (!hasPagination) {
      this.logger.log(`Retrieved ${data.tasks.length} tasks (no pagination)`);
      return data.tasks;
    }

    // Apply pagination
    const page = paginationQuery.page ?? 1;
    const pageSize = paginationQuery.pageSize ?? 10;
    const total = data.tasks.length;
    const totalPages = Math.ceil(total / pageSize) || 1; // At least 1 page

    // Validate page number
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    // For empty results, allow page 1 only
    if (total === 0 && page > 1) {
      throw new BadRequestException('No data available');
    }

    // For non-empty results, validate page range
    if (total > 0 && page > totalPages) {
      throw new BadRequestException(
        `Page ${page} does not exist. Total pages: ${totalPages}`,
      );
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedTasks = data.tasks.slice(startIndex, endIndex);

    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    this.logger.log(`Retrieved ${paginatedTasks.length} tasks (page ${page}/${totalPages})`);

    return {
      data: paginatedTasks,
      meta,
    };
  }

  /**
   * Retrieve a single task by ID
   * @param id Task UUID
   * @returns Task object
   * @throws NotFoundException if task not found
   */
  async findOne(id: string): Promise<Task> {
    this.logger.debug(`Retrieving task with ID: ${id}`);

    // Use mutex for consistent read to prevent reading during writes
    return this.mutex.runExclusive(async () => {
      const data = await this.readData();
      const task = data.tasks.find((t) => t.id === id);

      if (!task) {
        this.logger.warn(`Task not found with ID: ${id}`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      this.logger.debug(`Found task: ${task.title}`);
      return task;
    });
  }

  /**
   * Create a new task
   * @param createTaskDto Task creation data
   * @returns Newly created task
   * @throws InternalServerErrorException if task creation fails
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    this.logger.log(`Creating new task: ${createTaskDto.title}`);
    const data = await this.readData();
    const now = new Date().toISOString();

    const newTask: Task = {
      id: uuidv4(),
      ...createTaskDto,
      status: TaskStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    data.tasks.push(newTask);
    await this.writeData(data);

    this.logger.log(`Task created successfully with ID: ${newTask.id}`);
    return newTask;
  }

  /**
   * Update an existing task
   * @param id Task UUID
   * @param updateTaskDto Task update data
   * @returns Updated task
   * @throws NotFoundException if task not found
   * @throws InternalServerErrorException if update fails
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    this.logger.log(`Updating task with ID: ${id}`);

    // Wrap entire read-modify-write operation in mutex to prevent race conditions
    return this.mutex.runExclusive(async () => {
      const data = await this.readData();
      const taskIndex = data.tasks.findIndex((t) => t.id === id);

      if (taskIndex === -1) {
        this.logger.warn(`Cannot update - task not found with ID: ${id}`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      const updatedTask: Task = {
        ...data.tasks[taskIndex],
        ...updateTaskDto,
        updatedAt: new Date().toISOString(),
      };

      data.tasks[taskIndex] = updatedTask;
      await this.writeDataInternal(data);

      this.logger.log(`Task updated successfully: ${updatedTask.title}`);
      return updatedTask;
    });
  }

  /**
   * Delete a task
   * @param id Task UUID
   * @throws NotFoundException if task not found
   * @throws InternalServerErrorException if deletion fails
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting task with ID: ${id}`);

    // Wrap entire read-modify-write operation in mutex to prevent race conditions
    return this.mutex.runExclusive(async () => {
      const data = await this.readData();
      const taskIndex = data.tasks.findIndex((t) => t.id === id);

      if (taskIndex === -1) {
        this.logger.warn(`Cannot delete - task not found with ID: ${id}`);
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      const taskTitle = data.tasks[taskIndex].title;
      data.tasks.splice(taskIndex, 1);
      await this.writeDataInternal(data);

      this.logger.log(`Task deleted successfully: ${taskTitle}`);
    });
  }
}
