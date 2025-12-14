
import { TaskPriority, TaskCategory } from '../types/task';
import { PRIORITY_COLORS, CATEGORY_COLORS, CATEGORY_EMOJIS } from '../constants/theme';

export const getPriorityColor = (priority: TaskPriority): string => {
  return PRIORITY_COLORS[priority] || '#d9d9d9';
};

export const getCategoryColor = (category?: TaskCategory): string => {
  if (!category) return 'default';
  return CATEGORY_COLORS[category] || 'default';
};

export const getCategoryEmoji = (category?: TaskCategory): string => {
  if (!category) return '📌';
  return CATEGORY_EMOJIS[category] || '📌';
};

export const createGradient = (colors: readonly [string, string]): string => {
  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};
