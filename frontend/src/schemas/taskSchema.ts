import { z } from 'zod';
import { TaskPriority, TaskStatus, TaskCategory } from '../types/task';

export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus).optional(),
  category: z.nativeEnum(TaskCategory).optional(),
  dueDate: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const TaskArraySchema = z.array(TaskSchema).max(1000); // Limit to 1000 tasks

export type TaskSchemaType = z.infer<typeof TaskSchema>;
