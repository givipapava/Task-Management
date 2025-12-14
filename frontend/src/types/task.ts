export type TaskPriority = 'high' | 'medium' | 'low';

export const TaskPriority = {
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const,
} as const;

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export const TaskStatus = {
  PENDING: 'pending' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
} as const;

export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'other';

export const TaskCategory = {
  WORK: 'work' as const,
  PERSONAL: 'personal' as const,
  SHOPPING: 'shopping' as const,
  HEALTH: 'health' as const,
  OTHER: 'other' as const,
} as const;

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

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
}

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
}
