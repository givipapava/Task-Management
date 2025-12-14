import { useState, useEffect, useMemo } from 'react';
import type { Task } from '../types/task';
import type { FilterStatus } from '../components/TaskFilters';
import type { AdvancedFilterOptions } from '../components/AdvancedFilters';
import { DISPLAY_LIMITS } from '../constants/theme';
import { TaskStatus, TaskPriority } from '../types/task';

// Priority order mapping for efficient sorting
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1,
};

// Type-safe sort keys
type SortableTaskKey = keyof Pick<Task, 'title' | 'createdAt' | 'updatedAt' | 'dueDate'>;

// Comparator function for sorting (extracted for reusability and testing)
function createComparator(sortBy: string, sortOrder: 'asc' | 'desc'): (a: Task, b: Task) => number {
  return (a: Task, b: Task) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortBy === 'priority') {
      aValue = PRIORITY_ORDER[a.priority];
      bValue = PRIORITY_ORDER[b.priority];
    } else if (sortBy === 'title') {
      aValue = a.title.toLowerCase();
      bValue = b.title.toLowerCase();
    } else {
      const key = sortBy as SortableTaskKey;
      aValue = a[key] || '';
      bValue = b[key] || '';
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  };
}

export const useTaskFilters = (tasks: Task[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DISPLAY_LIMITS.SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Filter and sort tasks - optimized for performance
  const filteredTasks = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    const sortBy = advancedFilters.sortBy || 'createdAt';
    const sortOrder = advancedFilters.sortOrder || 'desc';

    // Single-pass filter using reduce (more efficient than filter)
    const filtered = tasks.reduce<Task[]>((acc, task) => {
      // Early exit on status mismatch
      if (filterStatus !== 'all' && task.status !== filterStatus) return acc;

      // Early exit on priority filter
      if (advancedFilters.priority && task.priority !== advancedFilters.priority) return acc;

      // Early exit on category filter
      if (advancedFilters.category && task.category !== advancedFilters.category) return acc;

      // Optimized search (check only if query exists)
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query) ?? false;
        if (!titleMatch && !descMatch) return acc;
      }

      acc.push(task);
      return acc;
    }, []);

    // Create sorted copy (don't mutate filtered array)
    return [...filtered].sort(createComparator(sortBy, sortOrder));
  }, [tasks, filterStatus, debouncedSearchQuery, advancedFilters]);

  // Task counts for filter badges
  const taskCounts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    }),
    [tasks]
  );

  return {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    advancedFilters,
    setAdvancedFilters,
    filteredTasks,
    taskCounts,
  };
};
