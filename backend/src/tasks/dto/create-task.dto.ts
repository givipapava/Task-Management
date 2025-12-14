import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsISO8601,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskCategory } from '../task.entity';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Sanitize()
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Detailed task description',
    example: 'Write comprehensive API documentation including examples',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  @Sanitize()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsNotEmpty({ message: 'Priority is required' })
  @IsEnum(TaskPriority, { message: 'Priority must be high, medium, or low' })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Task category',
    enum: TaskCategory,
    example: TaskCategory.WORK,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskCategory, {
    message: 'Category must be work, personal, shopping, health, or other',
  })
  category?: TaskCategory;

  @ApiProperty({
    description: 'Due date in ISO 8601 format',
    example: '2025-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601(
    { strict: true },
    { message: 'Due date must be a valid ISO 8601 date string' },
  )
  dueDate?: string;
}
