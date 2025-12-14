import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

/**
 * Controller handling all task-related HTTP endpoints
 * Base route: /api/tasks
 */
@ApiTags('tasks')
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Retrieve all tasks
   * @returns Array of all tasks
   */
  @Get()
  @ApiOperation({ summary: 'Get all tasks', description: 'Retrieve a list of all tasks' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully', type: [Task] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findAll() {
    return this.tasksService.findAll();
  }

  /**
   * Retrieve a single task by ID
   * @param id Task UUID
   * @returns Single task or 404
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID', description: 'Retrieve a single task by its unique identifier' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Task found', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  /**
   * Create a new task
   * @param createTaskDto Task creation data
   * @returns Newly created task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new task', description: 'Create a new task with the provided data' })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: Task })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  /**
   * Update an existing task
   * @param id Task UUID
   * @param updateTaskDto Task update data
   * @returns Updated task or 404
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update task', description: 'Update an existing task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: Task })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  /**
   * Delete a task
   * @param id Task UUID
   * @returns 204 No Content or 404
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task', description: 'Delete a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '1' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
  }
}
