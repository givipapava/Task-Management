import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { TaskPriority, TaskStatus, TaskCategory } from './task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    category: TaskCategory.WORK,
    dueDate: '2025-12-31T23:59:59.000Z',
    createdAt: '2025-12-14T12:00:00.000Z',
    updatedAt: '2025-12-14T12:00:00.000Z',
  };

  const mockTasksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tasks without pagination', async () => {
      const mockTasks = [mockTask];
      mockTasksService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll({});

      expect(result).toEqual(mockTasks);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should return paginated tasks with pagination query', async () => {
      const paginationQuery: PaginationQueryDto = { page: 1, pageSize: 10 };
      const mockPaginatedResponse = {
        data: [mockTask],
        meta: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockTasksService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(paginationQuery);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(paginationQuery);
    });

    it('should handle empty task list', async () => {
      mockTasksService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      const error = new Error('Task with ID 999 not found');
      mockTasksService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('999')).rejects.toThrow(error);
      expect(service.findOne).toHaveBeenCalledWith('999');
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

      const createdTask = { ...mockTask, ...createTaskDto };
      mockTasksService.create.mockResolvedValue(createdTask);

      const result = await controller.create(createTaskDto);

      expect(result).toEqual(createdTask);
      expect(service.create).toHaveBeenCalledWith(createTaskDto);
    });

    it('should create a task with minimal required fields', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Minimal Task',
        priority: TaskPriority.MEDIUM,
      };

      const createdTask = {
        ...mockTask,
        ...createTaskDto,
        description: undefined,
        category: undefined,
        dueDate: undefined,
      };
      mockTasksService.create.mockResolvedValue(createdTask);

      const result = await controller.create(createTaskDto);

      expect(result).toEqual(createdTask);
      expect(service.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.COMPLETED,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update('1', updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith('1', updateTaskDto);
    });

    it('should update only specified fields', async () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update('1', updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith('1', updateTaskDto);
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated' };
      const error = new Error('Task with ID 999 not found');
      mockTasksService.update.mockRejectedValue(error);

      await expect(controller.update('999', updateTaskDto)).rejects.toThrow(error);
      expect(service.update).toHaveBeenCalledWith('999', updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when removing non-existent task', async () => {
      const error = new Error('Task with ID 999 not found');
      mockTasksService.remove.mockRejectedValue(error);

      await expect(controller.remove('999')).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith('999');
    });
  });
});
