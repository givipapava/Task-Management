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

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category?: TaskCategory;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskDto = {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  dueDate?: string;
}

export type UpdateTaskDto = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  dueDate?: string;
}
