import { ApiProperty } from '@nestjs/swagger';

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  SHOPPING = 'shopping',
  HEALTH = 'health',
  OTHER = 'other',
}

export class Task {
  @ApiProperty({ description: 'Unique task identifier (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Task title', example: 'Complete project documentation', maxLength: 200 })
  title: string;

  @ApiProperty({ description: 'Detailed task description', example: 'Write comprehensive API documentation', required: false, maxLength: 1000 })
  description?: string;

  @ApiProperty({ description: 'Task priority level', enum: TaskPriority, example: TaskPriority.HIGH })
  priority: TaskPriority;

  @ApiProperty({ description: 'Current task status', enum: TaskStatus, example: TaskStatus.PENDING })
  status: TaskStatus;

  @ApiProperty({ description: 'Task category', enum: TaskCategory, example: TaskCategory.WORK, required: false })
  category?: TaskCategory;

  @ApiProperty({ description: 'Due date in ISO 8601 format', example: '2025-12-31T23:59:59.000Z', required: false })
  dueDate?: string;

  @ApiProperty({ description: 'Task creation timestamp', example: '2025-12-14T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp', example: '2025-12-14T12:30:00.000Z' })
  updatedAt: string;
}
