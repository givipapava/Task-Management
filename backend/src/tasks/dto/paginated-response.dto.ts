import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../task.entity';

/**
 * Pagination metadata
 */
export class PaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageSize: number;

  @ApiProperty({ description: 'Total number of items', example: 50 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a previous page', example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;
}

/**
 * Generic paginated response DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items for current page', type: [Task] })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMeta })
  meta: PaginationMeta;
}

/**
 * Paginated tasks response DTO (for Swagger documentation)
 */
export class PaginatedTasksResponseDto extends PaginatedResponseDto<Task> {
  @ApiProperty({ description: 'Array of tasks for current page', type: [Task] })
  data: Task[];
}
