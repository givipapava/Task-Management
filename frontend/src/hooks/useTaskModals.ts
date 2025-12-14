import { useState, useCallback } from 'react';
import type { Task } from '../types/task';

export const useTaskModals = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setShowTaskModal(false);
    setEditingTask(null);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingTask(null);
    setShowTaskModal(true);
  }, []);

  return {
    showTaskModal,
    setShowTaskModal,
    showDeleteModal,
    setShowDeleteModal,
    editingTask,
    setEditingTask,
    taskToDelete,
    setTaskToDelete,
    handleEditTask,
    handleCancelEdit,
    handleDeleteTask,
    handleCancelDelete,
    openCreateModal,
  };
};
