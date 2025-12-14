import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';
import { TaskPriority, TaskStatus, TaskCategory } from '../task.entity';

describe('UpdateTaskDto', () => {
  describe('title validation', () => {
    it('should pass validation with valid title', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Updated Task Title',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when title is missing (optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        status: TaskStatus.IN_PROGRESS,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title exceeds 200 characters', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'a'.repeat(201),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should trim whitespace from title', () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: '  Updated Task  ',
      });

      expect(dto.title).toBe('Updated Task');
    });

    it('should accept empty string title', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: '',
      });

      const errors = await validate(dto);
      // UpdateTaskDto allows empty strings since all fields are optional
      expect(errors.length).toBe(0);
    });
  });

  describe('description validation', () => {
    it('should pass validation with valid description', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        description: 'Updated description',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when description is missing (optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when description exceeds 1000 characters', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        description: 'a'.repeat(1001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should trim whitespace from description', () => {
      const dto = plainToInstance(UpdateTaskDto, {
        description: '  Updated Description  ',
      });

      expect(dto.description).toBe('Updated Description');
    });

    it('should accept empty string description', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        description: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('priority validation', () => {
    it('should pass validation with HIGH priority', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        priority: TaskPriority.HIGH,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with MEDIUM priority', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        priority: TaskPriority.MEDIUM,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with LOW priority', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        priority: TaskPriority.LOW,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when priority is missing (optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid priority value', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        priority: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('priority');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('status validation', () => {
    it('should pass validation with PENDING status', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        status: TaskStatus.PENDING,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with IN_PROGRESS status', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        status: TaskStatus.IN_PROGRESS,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with COMPLETED status', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        status: TaskStatus.COMPLETED,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when status is missing (optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid status value', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        status: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('category validation', () => {
    it('should pass validation with WORK category', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        category: TaskCategory.WORK,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with PERSONAL category', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        category: TaskCategory.PERSONAL,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with SHOPPING category', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        category: TaskCategory.SHOPPING,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when category is missing (optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid category value', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
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
      const dto = plainToInstance(UpdateTaskDto, {
        dueDate: '2025-12-31T23:59:59.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when dueDate is missing (optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with date-only format', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        dueDate: '2025-12-31',
      });

      const errors = await validate(dto);
      // ISO8601 accepts date-only format
      expect(errors.length).toBe(0);
    });

    it('should fail validation with non-date string', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        dueDate: 'not-a-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dueDate');
    });
  });

  describe('complete DTO validation', () => {
    it('should pass validation with all valid fields', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        title: 'Updated Task',
        description: 'Updated description',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        category: TaskCategory.WORK,
        dueDate: '2025-12-31T23:59:59.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty DTO (all fields optional)', async () => {
      const dto = plainToInstance(UpdateTaskDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with partial update', async () => {
      const dto = plainToInstance(UpdateTaskDto, {
        status: TaskStatus.COMPLETED,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
