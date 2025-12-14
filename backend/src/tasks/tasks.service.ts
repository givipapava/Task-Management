import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface TasksData {
  tasks: Task[];
}

/**
 * Service handling business logic for task operations
 * Uses file-based storage with JSON persistence
 * Thread-safe with mutex for concurrent write operations
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly dataPath = join(__dirname, '../data/tasks.json');
  private readonly dataDir = join(__dirname, '../data');
  private readonly mutex = new Mutex();

  /**
   * Read tasks data from JSON file
   * @returns TasksData object containing array of tasks
   * @throws InternalServerErrorException if file read or parse fails
   */
  private async readData(): Promise<TasksData> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.warn(`Tasks file not found at ${this.dataPath}, initializing empty task list`);
        return { tasks: [] };
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
   * Write tasks data to JSON file with mutex lock and atomic write
   * Ensures thread-safe writes to prevent race conditions
   * Uses atomic write pattern (write to temp file, then rename)
   * Creates backup before writing for disaster recovery
   * @param data TasksData object to persist
   * @throws InternalServerErrorException if file write fails
   */
  private async writeData(data: TasksData): Promise<void> {
    return this.mutex.runExclusive(async () => {
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
    });
  }

  /**
   * Retrieve all tasks
   * @returns Array of all tasks
   */
  async findAll(): Promise<Task[]> {
    this.logger.debug('Retrieving all tasks');
    const data = await this.readData();
    this.logger.log(`Retrieved ${data.tasks.length} tasks`);
    return data.tasks;
  }

  /**
   * Retrieve a single task by ID
   * @param id Task UUID
   * @returns Task object
   * @throws NotFoundException if task not found
   */
  async findOne(id: string): Promise<Task> {
    this.logger.debug(`Retrieving task with ID: ${id}`);
    const data = await this.readData();
    const task = data.tasks.find((t) => t.id === id);

    if (!task) {
      this.logger.warn(`Task not found with ID: ${id}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    this.logger.debug(`Found task: ${task.title}`);
    return task;
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
    await this.writeData(data);

    this.logger.log(`Task updated successfully: ${updatedTask.title}`);
    return updatedTask;
  }

  /**
   * Delete a task
   * @param id Task UUID
   * @throws NotFoundException if task not found
   * @throws InternalServerErrorException if deletion fails
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting task with ID: ${id}`);
    const data = await this.readData();
    const taskIndex = data.tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      this.logger.warn(`Cannot delete - task not found with ID: ${id}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const taskTitle = data.tasks[taskIndex].title;
    data.tasks.splice(taskIndex, 1);
    await this.writeData(data);

    this.logger.log(`Task deleted successfully: ${taskTitle}`);
  }
}
