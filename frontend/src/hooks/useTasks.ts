import { useState, useEffect, useCallback, useRef } from 'react';
import { App } from 'antd';
import { taskApi } from '../services/api';
import { TaskStatus } from '../types/task';
import type { Task, CreateTaskDto } from '../types/task';

export const useTasks = () => {
  const { message } = App.useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inflightRequests = useRef(new Map<string, Promise<Task>>());

  const loadTasks = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      const data = await taskApi.getAllTasks(abortController.signal);

      if (!abortController.signal.aborted) {
        setTasks(data);
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
  }, [message]);

  useEffect(() => {
    loadTasks();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
        setTasks((prev) => [newTask, ...prev]);
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
  }, [message]);

  const updateTask = useCallback(async (id: string, data: Partial<CreateTaskDto>) => {
    try {
      setSubmitting(true);
      const updatedTask = await taskApi.updateTask(id, data);
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
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
  }, [message]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      message.success({
        content: `🗑️ Task deleted successfully!`,
        duration: 2,
      });
    } catch {
      message.error('Failed to delete task. Please try again.');
      throw new Error('Failed to delete task');
    }
  }, [message]);

  const toggleTaskStatus = useCallback(async (task: Task) => {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    const statusText = newStatus === TaskStatus.COMPLETED ? 'completed' : 'pending';
    try {
      const updatedTask = await taskApi.updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      message.success({
        content: `✓ Task marked as ${statusText}`,
        duration: 2,
      });
    } catch {
      message.error('Failed to update task status. Please try again.');
    }
  }, [message]);

  const changeTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus, silent = false) => {
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

      if (!silent) {
        message.success({
          content: `${statusIcons[newStatus]} Task moved to ${statusLabels[newStatus]}`,
          duration: 2,
        });
      }
    } catch {
      message.error('Failed to update task status. Please try again.');
    }
  }, [message]);

  return {
    tasks,
    loading,
    submitting,
    setTasks,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    changeTaskStatus,
  };
};
