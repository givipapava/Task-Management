
import { TaskStatus } from '../types/task';

export const KANBAN_COLUMNS = {
  PENDING: {
    id: 'pending-column',
    title: 'To Do',
    color: '#1890ff',
    status: TaskStatus.PENDING,
  },
  IN_PROGRESS: {
    id: 'in-progress-column',
    title: 'In Progress',
    color: '#faad14',
    status: TaskStatus.IN_PROGRESS,
  },
  COMPLETED: {
    id: 'completed-column',
    title: 'Completed',
    color: '#52c41a',
    status: TaskStatus.COMPLETED,
  },
} as const;

export const COLUMN_ID_TO_STATUS: Record<string, TaskStatus> = {
  [KANBAN_COLUMNS.PENDING.id]: TaskStatus.PENDING,
  [KANBAN_COLUMNS.IN_PROGRESS.id]: TaskStatus.IN_PROGRESS,
  [KANBAN_COLUMNS.COMPLETED.id]: TaskStatus.COMPLETED,
};
