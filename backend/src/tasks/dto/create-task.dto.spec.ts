import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTaskDto } from './create-task.dto';
import { TaskPriority, TaskCategory } from '../task.entity';

describe('CreateTaskDto', () => {
  describe('title validation', () => {
    it('should pass validation with valid title', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Valid Task Title',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is empty', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: '',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is missing', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation when title exceeds 200 characters', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'a'.repeat(201),
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should trim whitespace from title', () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: '  Test Task  ',
        priority: TaskPriority.HIGH,
      });

      expect(dto.title).toBe('Test Task');
    });

    it('should fail validation when title is whitespace only', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: '   ',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('description validation', () => {
    it('should pass validation with valid description', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        description: 'This is a test description',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when description is missing (optional)', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when description exceeds 1000 characters', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        description: 'a'.repeat(1001),
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should trim whitespace from description', () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        description: '  Test Description  ',
        priority: TaskPriority.HIGH,
      });

      expect(dto.description).toBe('Test Description');
    });

    it('should accept empty description', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        description: '',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('priority validation', () => {
    it('should pass validation with HIGH priority', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with MEDIUM priority', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.MEDIUM,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with LOW priority', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.LOW,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when priority is missing', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('priority');
    });

    it('should fail validation with invalid priority value', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('priority');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('category validation', () => {
    it('should pass validation with WORK category', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with PERSONAL category', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
        category: TaskCategory.PERSONAL,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when category is missing (optional)', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid category value', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
        category: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('category');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('dueDate validation', () => {
    it('should pass validation with valid ISO 8601 date', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
        dueDate: '2025-12-31T23:59:59.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when dueDate is missing (optional)', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with date-only format', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
        dueDate: '2025-12-31',
      });

      const errors = await validate(dto);
      // ISO8601 accepts date-only format
      expect(errors.length).toBe(0);
    });

    it('should fail validation with non-date string', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Test Task',
        priority: TaskPriority.HIGH,
        dueDate: 'invalid-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dueDate');
    });
  });

  describe('complete DTO validation', () => {
    it('should pass validation with all valid fields', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Complete Project Documentation',
        description: 'Write comprehensive API documentation including examples',
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        dueDate: '2025-12-31T23:59:59.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only required fields', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Minimal Task',
        priority: TaskPriority.MEDIUM,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
