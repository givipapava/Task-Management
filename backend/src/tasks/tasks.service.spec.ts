import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority, TaskStatus, TaskCategory } from './task.entity';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
    rename: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('TasksService', () => {
  let service: TasksService;

  // Suppress logger output during tests
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      category: TaskCategory.WORK,
      dueDate: '2025-12-31T23:59:59.000Z',
      createdAt: '2025-12-14T12:00:00.000Z',
      updatedAt: '2025-12-14T12:00:00.000Z',
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      category: TaskCategory.PERSONAL,
      createdAt: '2025-12-14T12:00:00.000Z',
      updatedAt: '2025-12-14T12:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );

      const result = await service.findAll();

      expect(result).toEqual(mockTasks);
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should return empty array when file does not exist', async () => {
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException on other file read errors', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );

      const result = await service.findOne('1');

      expect(result).toEqual(mockTasks[0]);
    });

    it('should throw NotFoundException when task not found', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('Task with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        dueDate: '2025-12-31T23:59:59.000Z',
      };

      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create(createTaskDto);

      expect(result).toMatchObject({
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        category: createTaskDto.category,
        dueDate: createTaskDto.dueDate,
        status: TaskStatus.PENDING,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        priority: TaskPriority.MEDIUM,
      };

      const error: any = new Error('Directory not found');
      error.code = 'ENOENT';

      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: [] }),
      );
      (fs.access as jest.Mock).mockRejectedValue(error);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.create(createTaskDto);

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.COMPLETED,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.update('1', updateTaskDto);

      expect(result).toMatchObject({
        id: '1',
        title: updateTaskDto.title,
        status: updateTaskDto.status,
      });
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
        new Date(mockTasks[0].updatedAt).getTime(),
      );
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );

      const updateTaskDto: UpdateTaskDto = { title: 'Updated' };

      await expect(service.update('999', updateTaskDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: [...mockTasks] }),
      );
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.remove('1');

      expect(fs.writeFile).toHaveBeenCalled();
      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      expect(writtenData.tasks).toHaveLength(1);
      expect(writtenData.tasks[0].id).toBe('2');
    });

    it('should throw NotFoundException when removing non-existent task', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockTasks }),
      );

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('file operations', () => {
    it('should handle write errors gracefully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test',
        priority: TaskPriority.LOW,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: [] }),
      );
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('Write failed'));

      await expect(service.create(createTaskDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('pagination', () => {
    const mockPaginationTasks = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      category: TaskCategory.WORK,
      createdAt: '2025-12-14T12:00:00.000Z',
      updatedAt: '2025-12-14T12:00:00.000Z',
    }));

    it('should return all tasks when no pagination params provided', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(25);
    });

    it('should return paginated tasks with page 1', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect((result as any).data).toHaveLength(10);
      expect((result as any).meta).toEqual({
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasPreviousPage: false,
        hasNextPage: true,
      });
    });

    it('should return paginated tasks with page 2', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      const result = await service.findAll({ page: 2, pageSize: 10 });

      expect((result as any).data).toHaveLength(10);
      expect((result as any).meta).toEqual({
        page: 2,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });

    it('should return remaining tasks on last page', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      const result = await service.findAll({ page: 3, pageSize: 10 });

      expect((result as any).data).toHaveLength(5);
      expect((result as any).meta).toEqual({
        page: 3,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: false,
      });
    });

    it('should throw BadRequestException for page < 1', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      await expect(service.findAll({ page: 0, pageSize: 10 })).rejects.toThrow(
        'Page number must be greater than 0',
      );
    });

    it('should throw BadRequestException when page exceeds total pages', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      await expect(service.findAll({ page: 10, pageSize: 10 })).rejects.toThrow(
        'Page 10 does not exist. Total pages: 3',
      );
    });

    it('should throw BadRequestException when requesting page > 1 for empty data', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: [] }),
      );

      await expect(service.findAll({ page: 2, pageSize: 10 })).rejects.toThrow(
        'No data available',
      );
    });

    it('should handle custom page size', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      const result = await service.findAll({ page: 1, pageSize: 5 });

      expect((result as any).data).toHaveLength(5);
      expect((result as any).meta.totalPages).toBe(5);
    });

    it('should use default page and pageSize when only one is provided', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: mockPaginationTasks }),
      );

      const result = await service.findAll({ page: 1 });

      expect((result as any).data).toHaveLength(10);
      expect((result as any).meta.pageSize).toBe(10);
    });

    it('should handle empty array on page 1', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ tasks: [] }),
      );

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect((result as any).data).toHaveLength(0);
      expect((result as any).meta).toEqual({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    });
  });
});
