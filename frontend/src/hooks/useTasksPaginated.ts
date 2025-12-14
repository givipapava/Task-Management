import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { taskApi } from '../services/api';
import { TaskStatus } from '../types/task';
import type { Task, CreateTaskDto, PaginationMeta } from '../types/task';

export const useTasksPaginated = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inflightRequests = useRef(new Map<string, Promise<Task>>());

  const loadTasks = useCallback(async (page: number = 1, pageSize: number = 10) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      const response = await taskApi.getTasksPaginated(
        { page, pageSize },
        abortController.signal
      );

      if (!abortController.signal.aborted) {
        setTasks(response.data);
        setPagination(response.meta);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'CanceledError') {
        return;
      }
      if (!abortController.signal.aborted) {
        message.error('Failed to load tasks. Please try again.');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const loadAllTasks = useCallback(async () => {
    try {
      const data = await taskApi.getAllTasks();
      setAllTasks(data);
    } catch (error) {
      console.error('Failed to load all tasks for filtering:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks(pagination.page, pagination.pageSize);
    loadAllTasks();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    loadTasks(page, pageSize);
  }, [loadTasks]);

  const createTask = useCallback(async (data: CreateTaskDto) => {
    const requestKey = `create-${JSON.stringify(data)}`;

    if (inflightRequests.current.has(requestKey)) {
      return inflightRequests.current.get(requestKey)!;
    }

    const requestPromise = (async () => {
      try {
        setSubmitting(true);
        const newTask = await taskApi.createTask(data);

        await loadTasks(pagination.page, pagination.pageSize);
        await loadAllTasks();

        message.success({
          content: `Task "${data.title}" created successfully!`,
          duration: 3,
        });
        return newTask;
      } catch (error) {
        message.error('Failed to create task. Please try again.');
        throw error;
      } finally {
        setSubmitting(false);
        inflightRequests.current.delete(requestKey);
      }
    })();

    inflightRequests.current.set(requestKey, requestPromise);
    return requestPromise;
  }, [pagination.page, pagination.pageSize, loadTasks, loadAllTasks]);

  const updateTask = useCallback(async (id: string, data: Partial<CreateTaskDto>) => {
    try {
      setSubmitting(true);
      const updatedTask = await taskApi.updateTask(id, data);

      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      setAllTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));

      message.success({
        content: `📝 Task updated successfully!`,
        duration: 2,
      });
      return updatedTask;
    } catch {
      message.error('Failed to update task. Please try again.');
      throw new Error('Failed to update task');
    } finally {
      setSubmitting(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskApi.deleteTask(id);

      await loadTasks(pagination.page, pagination.pageSize);
      await loadAllTasks();

      message.success({
        content: `🗑️ Task deleted successfully!`,
        duration: 2,
      });
    } catch {
      message.error('Failed to delete task. Please try again.');
      throw new Error('Failed to delete task');
    }
  }, [pagination.page, pagination.pageSize, loadTasks, loadAllTasks]);

  const toggleTaskStatus = useCallback(async (task: Task) => {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    const statusText = newStatus === TaskStatus.COMPLETED ? 'completed' : 'pending';
    try {
      const updatedTask = await taskApi.updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      setAllTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      message.success({
        content: `✓ Task marked as ${statusText}`,
        duration: 2,
      });
    } catch {
      message.error('Failed to update task status. Please try again.');
    }
  }, []);

  const changeTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const statusLabels = {
      [TaskStatus.PENDING]: 'Pending',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed',
    };
    const statusIcons = {
      [TaskStatus.PENDING]: '📋',
      [TaskStatus.IN_PROGRESS]: '⏳',
      [TaskStatus.COMPLETED]: '✅',
    };

    try {
      const updatedTask = await taskApi.updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      setAllTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      message.success({
        content: `${statusIcons[newStatus]} Task moved to ${statusLabels[newStatus]}`,
        duration: 2,
      });
    } catch {
      message.error('Failed to update task status. Please try again.');
    }
  }, []);

  return {
    tasks,
    allTasks,
    loading,
    submitting,
    pagination,
    setTasks,
    setAllTasks,
    loadTasks,
    handlePaginationChange,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    changeTaskStatus,
  };
};
