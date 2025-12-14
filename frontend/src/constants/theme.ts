
import { TaskPriority, TaskCategory } from '../types/task';

export const GRADIENTS = {
  PURPLE: ['#667eea', '#764ba2'],
  GREEN: ['#11998e', '#38ef7d'],
  PINK: ['#f093fb', '#f5576c'],
  ORANGE: ['#fa709a', '#fee140'],
  BLUE: ['#4facfe', '#00f2fe'],
  TEAL: ['#43e97b', '#38f9d7'],
} as const;

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: '#ff4d4f',
  [TaskPriority.MEDIUM]: '#faad14',
  [TaskPriority.LOW]: '#52c41a',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: 'purple',
  [TaskCategory.PERSONAL]: 'cyan',
  [TaskCategory.SHOPPING]: 'magenta',
  [TaskCategory.HEALTH]: 'green',
  [TaskCategory.OTHER]: 'default',
};

export const CATEGORY_EMOJIS: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: '🏢',
  [TaskCategory.PERSONAL]: '👤',
  [TaskCategory.SHOPPING]: '🛒',
  [TaskCategory.HEALTH]: '💪',
  [TaskCategory.OTHER]: '📌',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const EASING = {
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_OUT: 'cubic-bezier(0.0, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  SPRING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const SHADOWS = {
  SM: '0 2px 8px rgba(0,0,0,0.08)',
  MD: '0 4px 12px rgba(0,0,0,0.15)',
  LG: '0 8px 24px rgba(0,0,0,0.25)',
  XL: '0 12px 32px rgba(0,0,0,0.3)',
} as const;

export const RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  CIRCLE: '50%',
} as const;

export const FONT_WEIGHT = {
  REGULAR: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
} as const;

export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

export const DISPLAY_LIMITS = {
  RECENT_COMPLETED_TASKS: 6,
  HIGH_PRIORITY_TASKS: 5,
  DUE_SOON_TASKS: 5,
  SEARCH_DEBOUNCE_MS: 300,
} as const;
