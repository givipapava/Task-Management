import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Card, Tag, Typography, Space, Button, Dropdown, Empty, App, Row, Col, Statistic, Tooltip, Badge } from 'antd';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, rectIntersection, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  FlagOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  TrophyOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  FireOutlined,
  FolderOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { TaskStatus, TaskPriority, TaskCategory } from '../types/task';
import type { Task } from '../types/task';
import { getPriorityColor, getCategoryColor } from '../utils/taskHelpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface KanbanBoardProps {
  tasks: Task[];
  darkMode: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus, silent?: boolean) => void;
}

interface TaskCardProps {
  task: Task;
  darkMode: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isJustDropped?: boolean;
}

interface BoardSummaryProps {
  tasks: Task[];
  darkMode: boolean;
}

interface QuickFiltersProps {
  darkMode: boolean;
  activeFilters: {
    priority?: TaskPriority;
    category?: TaskCategory;
  };
  onFilterChange: (filters: { priority?: TaskPriority; category?: TaskCategory }) => void;
  filteredCount: number;
  totalCount: number;
}

// Board Summary Component
const BoardSummary: React.FC<BoardSummaryProps> = ({ tasks, darkMode }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const overdue = tasks.filter(t =>
      t.dueDate &&
      t.status !== TaskStatus.COMPLETED &&
      dayjs(t.dueDate).isBefore(dayjs(), 'day')
    ).length;
    const active = tasks.filter(t =>
      t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, active, completionRate };
  }, [tasks]);

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: '16px',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e8e8e8',
        boxShadow: darkMode
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.08)',
        background: darkMode
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: darkMode ? 'rgba(24, 144, 255, 0.08)' : '#fafafa',
            border: darkMode ? '1px solid rgba(24, 144, 255, 0.2)' : '1px solid #e8e8e8',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Statistic
              title={
                <Space style={{ color: darkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                  <InfoCircleOutlined style={{ color: darkMode ? '#69c0ff' : '#1890ff' }} />
                  <span>Total Tasks</span>
                </Space>
              }
              value={stats.total}
              valueStyle={{ color: darkMode ? '#69c0ff' : '#1890ff', fontSize: 32, fontWeight: 600 }}
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: darkMode ? 'rgba(250, 140, 22, 0.08)' : '#fafafa',
            border: darkMode ? '1px solid rgba(250, 140, 22, 0.2)' : '1px solid #e8e8e8',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Statistic
              title={
                <Space style={{ color: darkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                  <RiseOutlined style={{ color: darkMode ? '#ffa940' : '#fa8c16' }} />
                  <span>Active Tasks</span>
                </Space>
              }
              value={stats.active}
              valueStyle={{ color: darkMode ? '#ffa940' : '#fa8c16', fontSize: 32, fontWeight: 600 }}
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: darkMode ? 'rgba(255, 77, 79, 0.08)' : '#fafafa',
            border: darkMode ? '1px solid rgba(255, 77, 79, 0.2)' : '1px solid #e8e8e8',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Statistic
              title={
                <Space style={{ color: darkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                  <span>Overdue</span>
                </Space>
              }
              value={stats.overdue}
              valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 600 }}
              suffix={stats.overdue > 0 ? <Badge status="error" /> : null}
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: darkMode ? 'rgba(82, 196, 26, 0.08)' : '#fafafa',
            border: darkMode ? '1px solid rgba(82, 196, 26, 0.2)' : '1px solid #e8e8e8',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Statistic
              title={
                <Space style={{ color: darkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                  <TrophyOutlined style={{ color: darkMode ? '#95de64' : '#52c41a' }} />
                  <span>Completion Rate</span>
                </Space>
              }
              value={stats.completionRate}
              suffix="%"
              valueStyle={{ color: darkMode ? '#95de64' : '#52c41a', fontSize: 32, fontWeight: 600 }}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// Quick Filters Component
const QuickFilters: React.FC<QuickFiltersProps> = ({
  darkMode,
  activeFilters,
  onFilterChange,
  filteredCount,
  totalCount,
}) => {
  const priorityFilters = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
  const categoryFilters = [
    TaskCategory.WORK,
    TaskCategory.PERSONAL,
    TaskCategory.SHOPPING,
    TaskCategory.HEALTH,
    TaskCategory.OTHER,
  ];

  const hasActiveFilters = activeFilters.priority || activeFilters.category;

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: '12px',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e8e8e8',
        background: darkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
        boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <Space wrap size={12} style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space wrap size={12}>
          <Space align="center" size={8}>
            <FilterOutlined style={{ color: darkMode ? '#69c0ff' : '#1890ff', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
              Filters:
            </Text>
          </Space>

          <Space wrap size={8}>
            {priorityFilters.map(priority => (
              <Tag
                key={priority}
                color={activeFilters.priority === priority ? getPriorityColor(priority) : undefined}
                style={{
                  cursor: 'pointer',
                  borderRadius: 8,
                  fontSize: 12,
                  padding: '4px 12px',
                  background: activeFilters.priority === priority
                    ? undefined
                    : darkMode ? 'rgba(255,255,255,0.08)' : '#fafafa',
                  border: activeFilters.priority === priority
                    ? `2px solid ${getPriorityColor(priority)}`
                    : darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e8e8e8',
                  fontWeight: activeFilters.priority === priority ? 600 : 500,
                  color: activeFilters.priority === priority
                    ? '#fff'
                    : darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onFilterChange({
                  ...activeFilters,
                  priority: activeFilters.priority === priority ? undefined : priority,
                })}
              >
                <FireOutlined /> {priority.toUpperCase()}
              </Tag>
            ))}
          </Space>

          <Space wrap size={8}>
            {categoryFilters.map(category => (
              <Tag
                key={category}
                color={activeFilters.category === category ? getCategoryColor(category) : undefined}
                style={{
                  cursor: 'pointer',
                  borderRadius: 8,
                  fontSize: 12,
                  padding: '4px 12px',
                  textTransform: 'capitalize',
                  background: activeFilters.category === category
                    ? undefined
                    : darkMode ? 'rgba(255,255,255,0.08)' : '#fafafa',
                  border: activeFilters.category === category
                    ? `2px solid ${getCategoryColor(category)}`
                    : darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e8e8e8',
                  fontWeight: activeFilters.category === category ? 600 : 500,
                  color: activeFilters.category === category
                    ? '#fff'
                    : darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onFilterChange({
                  ...activeFilters,
                  category: activeFilters.category === category ? undefined : category,
                })}
              >
                <FolderOutlined /> {category}
              </Tag>
            ))}
          </Space>
        </Space>

        <Space size={12}>
          {hasActiveFilters && (
            <Button
              type="text"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => onFilterChange({})}
              style={{
                fontSize: 12,
                color: darkMode ? '#ff7875' : '#ff4d4f',
                fontWeight: 500,
              }}
            >
              Clear
            </Button>
          )}
          <div style={{
            padding: '4px 12px',
            borderRadius: '8px',
            background: darkMode ? 'rgba(24, 144, 255, 0.1)' : 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
            border: darkMode ? '1px solid rgba(24, 144, 255, 0.2)' : '1px solid #91d5ff',
          }}>
            <Text strong style={{
              fontSize: 12,
              color: darkMode ? '#69c0ff' : '#1890ff',
            }}>
              {filteredCount === totalCount
                ? `${totalCount} tasks`
                : `${filteredCount} of ${totalCount} tasks`}
            </Text>
          </div>
        </Space>
      </Space>
    </Card>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, darkMode, onEdit, onDelete, isJustDropped }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: isJustDropped ? undefined : CSS.Transform.toString(transform),
    transition: isJustDropped ? undefined : (transition || 'transform 250ms cubic-bezier(0.18, 0.67, 0.6, 1.22)'),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const isOverdue = task.dueDate && task.status !== TaskStatus.COMPLETED && dayjs(task.dueDate).isBefore(dayjs(), 'day');

  // Calculate days in current status (aging indicator)
  const daysInStatus = dayjs().diff(dayjs(task.updatedAt), 'day');
  const isAging = daysInStatus >= 7 && task.status !== TaskStatus.COMPLETED;

  // Calculate due date info
  const dueDateInfo = useMemo(() => {
    if (!task.dueDate) return null;

    const dueDate = dayjs(task.dueDate);
    const today = dayjs();
    const daysUntilDue = dueDate.diff(today, 'day');

    let text = '';
    let color = '';

    if (daysUntilDue < 0) {
      text = `${Math.abs(daysUntilDue)} days overdue`;
      color = '#ff4d4f';
    } else if (daysUntilDue === 0) {
      text = 'Due today';
      color = '#faad14';
    } else if (daysUntilDue === 1) {
      text = 'Due tomorrow';
      color = '#faad14';
    } else if (daysUntilDue <= 3) {
      text = `Due in ${daysUntilDue} days`;
      color = '#faad14';
    } else {
      text = `Due in ${daysUntilDue} days`;
      color = darkMode ? 'rgba(255, 255, 255, 0.65)' : '#666';
    }

    return { text, color, date: dueDate.format('MMM DD, YYYY') };
  }, [task.dueDate, darkMode]);

  const menuItems = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => onEdit(task),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(task),
    },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card
        size="small"
        hoverable
        className={isJustDropped ? 'task-just-dropped task-slide-in kanban-task-card' : 'kanban-task-card'}
        style={{
          marginBottom: 12,
          cursor: isDragging ? 'grabbing' : 'grab',
          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
          borderRadius: 10,
          background: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#fff',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0',
          borderLeftColor: getPriorityColor(task.priority),
          borderLeftWidth: 4,
          boxShadow: isDragging
            ? darkMode ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.15)'
            : isAging
              ? darkMode ? '0 0 12px rgba(250, 140, 22, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)' : '0 0 12px rgba(250, 140, 22, 0.3), 0 2px 8px rgba(0, 0, 0, 0.08)'
              : darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
          transform: isDragging ? 'rotate(3deg) scale(1.03)' : undefined,
        }}
        styles={{ body: { padding: '12px' } }}
        extra={
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        }
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 14, lineHeight: '20px' }}>{task.title}</Text>

          {task.description && (
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{
                marginBottom: 0,
                fontSize: 12,
                color: darkMode ? 'rgba(255, 255, 255, 0.65)' : '#666',
                lineHeight: '18px',
              }}
            >
              {task.description}
            </Paragraph>
          )}

          <Space wrap size={6}>
            <Tag
              color={getPriorityColor(task.priority)}
              style={{
                fontSize: 11,
                borderRadius: 8,
                border: 'none',
                padding: '2px 8px',
                fontWeight: 500,
              }}
            >
              <FlagOutlined /> {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Tag>
            {task.category && (
              <Tag
                color={getCategoryColor(task.category)}
                style={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: 'none',
                  padding: '2px 8px',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}
              >
                {task.category}
              </Tag>
            )}
          </Space>

          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {dueDateInfo && (
              <Tooltip title={dueDateInfo.date}>
                <div style={{
                  background: isOverdue
                    ? darkMode ? 'rgba(255, 77, 79, 0.15)' : 'rgba(255, 77, 79, 0.1)'
                    : darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <CalendarOutlined style={{
                    fontSize: 12,
                    color: dueDateInfo.color,
                  }} />
                  <Text
                    style={{ fontSize: 11, fontWeight: 500, color: dueDateInfo.color }}
                  >
                    {dueDateInfo.text}
                  </Text>
                </div>
              </Tooltip>
            )}

            <Space size={8} style={{ flexWrap: 'wrap' }}>
              <Tooltip title={`Created on ${dayjs(task.createdAt).format('MMM DD, YYYY h:mm A')}`}>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  <ClockCircleOutlined /> Created {dayjs(task.createdAt).fromNow()}
                </Text>
              </Tooltip>

              {isAging && (
                <Tooltip title={`Task has been in "${task.status.replace('_', ' ')}" status for ${daysInStatus} days`}>
                  <Tag
                    color="warning"
                    style={{
                      fontSize: 10,
                      padding: '0 6px',
                      borderRadius: 6,
                      border: 'none',
                    }}
                  >
                    <WarningOutlined /> {daysInStatus}d in status
                  </Tag>
                </Tooltip>
              )}
            </Space>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

const KanbanBoardComponent: React.FC<KanbanBoardProps> = ({
  tasks,
  darkMode,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { message } = App.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null);
  const [lastDroppedColumn, setLastDroppedColumn] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ priority?: TaskPriority; category?: TaskCategory }>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.category && task.category !== filters.category) return false;
      return true;
    });
  }, [tasks, filters]);

  const { pendingTasks, inProgressTasks, completedTasks, taskMap, columnStats } = useMemo(() => {
    const pending: Task[] = [];
    const inProgress: Task[] = [];
    const completed: Task[] = [];
    const map = new Map<string, Task>();

    filteredTasks.forEach((task) => {
      map.set(task.id, task);
      if (task.status === TaskStatus.PENDING) {
        pending.push(task);
      } else if (task.status === TaskStatus.IN_PROGRESS) {
        inProgress.push(task);
      } else if (task.status === TaskStatus.COMPLETED) {
        completed.push(task);
      }
    });

    // Calculate column statistics
    const getColumnStats = (taskList: Task[]) => {
      const overdue = taskList.filter(t =>
        t.dueDate && dayjs(t.dueDate).isBefore(dayjs(), 'day')
      ).length;
      const high = taskList.filter(t => t.priority === TaskPriority.HIGH).length;
      const medium = taskList.filter(t => t.priority === TaskPriority.MEDIUM).length;
      const low = taskList.filter(t => t.priority === TaskPriority.LOW).length;
      return { overdue, high, medium, low };
    };

    return {
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed,
      taskMap: map,
      columnStats: {
        pending: getColumnStats(pending),
        inProgress: getColumnStats(inProgress),
        completed: getColumnStats(completed),
      },
    };
  }, [filteredTasks]);

  const columnToStatus: Record<string, TaskStatus> = useMemo(
    () => ({
      'pending-column': TaskStatus.PENDING,
      'in-progress-column': TaskStatus.IN_PROGRESS,
      'completed-column': TaskStatus.COMPLETED,
    }),
    []
  );

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        return;
      }

      const activeTask = taskMap.get(active.id as string);
      if (!activeTask) {
        setActiveId(null);
        return;
      }

      // Check if we dropped over a column directly
      let newStatus = columnToStatus[over.id as string];

      // If not, check if we dropped over another task and determine its column
      if (!newStatus) {
        const overTask = taskMap.get(over.id as string);
        if (overTask) {
          newStatus = overTask.status;
        }
      }

      if (newStatus && activeTask.status !== newStatus) {
        const oldStatus = activeTask.status;

        const statusLabels = {
          [TaskStatus.PENDING]: 'To Do',
          [TaskStatus.IN_PROGRESS]: 'In Progress',
          [TaskStatus.COMPLETED]: 'Completed',
        };

        const statusIcons = {
          [TaskStatus.PENDING]: '📋',
          [TaskStatus.IN_PROGRESS]: '⏳',
          [TaskStatus.COMPLETED]: '✅',
        };

        message.success({
          content: `${statusIcons[oldStatus]} ➜ ${statusIcons[newStatus]} Moved from ${statusLabels[oldStatus]} to ${statusLabels[newStatus]}`,
          duration: 2.5,
        });

        onStatusChange(activeTask.id, newStatus, true);

        setJustDroppedId(activeTask.id);
        setLastDroppedColumn(over.id as string);

        setTimeout(() => {
          setJustDroppedId(null);
        }, 600);
      }

      setActiveId(null);
    },
    [taskMap, columnToStatus, onStatusChange, message]
  );

  const handleDragCancel = useCallback((): void => {
    setActiveId(null);
  }, []);

  const ColumnCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    count: number;
    color: string;
    gradient: string;
    columnId: string;
    taskList: Task[];
    stats?: { overdue: number; high: number; medium: number; low: number };
  }> = ({ title, icon, count, color, gradient, columnId, taskList, stats = { overdue: 0, high: 0, medium: 0, low: 0 } }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: columnId,
    });

    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
      if (lastDroppedColumn === columnId) {
        setShouldAnimate(true);
        const timer = setTimeout(() => setShouldAnimate(false), 300);
        return () => clearTimeout(timer);
      }
    }, [lastDroppedColumn, columnId]);

    return (
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minWidth: 360,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Card
          className="kanban-column"
          title={
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
              }}>
                <Space size={12}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: '#fff',
                    boxShadow: `0 4px 12px ${color}40`,
                  }}>
                    {icon}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 17, display: 'block' }}>{title}</Text>
                    {stats.overdue > 0 && (
                      <Text type="danger" style={{ fontSize: 11 }}>
                        <WarningOutlined /> {stats.overdue} overdue
                      </Text>
                    )}
                  </div>
                </Space>
                <Space size={8}>
                  {stats.overdue > 0 && (
                    <Badge count={stats.overdue} style={{ backgroundColor: '#ff4d4f' }} />
                  )}
                  <Tooltip
                    title={
                      <Space direction="vertical" size={4}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>Priority Breakdown:</Text>
                        <Text style={{ color: '#fff', fontSize: 11 }}>
                          <FireOutlined style={{ color: '#ff4d4f' }} /> High: {stats.high}
                        </Text>
                        <Text style={{ color: '#fff', fontSize: 11 }}>
                          <FireOutlined style={{ color: '#faad14' }} /> Medium: {stats.medium}
                        </Text>
                        <Text style={{ color: '#fff', fontSize: 11 }}>
                          <FireOutlined style={{ color: '#52c41a' }} /> Low: {stats.low}
                        </Text>
                      </Space>
                    }
                  >
                    <Tag
                      color={color}
                      className={shouldAnimate ? 'count-badge-pulse' : ''}
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 12,
                        minWidth: 36,
                        textAlign: 'center',
                        cursor: 'help',
                      }}
                    >
                      {count}
                    </Tag>
                  </Tooltip>
                </Space>
              </div>
            </div>
          }
          style={{
            height: '100%',
            borderRadius: 16,
            background: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e8e8e8',
            borderTop: `4px solid ${color}`,
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOver ? 'scale(1.015)' : 'scale(1)',
            boxShadow: isOver
              ? `0 12px 40px ${color}70, 0 0 0 2px ${color}30`
              : darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          }}
          styles={{
            body: {
              padding: 0,
              height: 'calc(100vh - 340px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: isOver
                ? darkMode ? `linear-gradient(180deg, ${color}15 0%, transparent 100%)`
                : `linear-gradient(180deg, ${color}08 0%, transparent 100%)`
                : undefined,
            }
          }}
        >
          <div
            style={{
              flex: 1,
              width: '100%',
              overflowY: 'auto',
              padding: '18px',
            }}
            className="kanban-column-content"
          >
            <SortableContext items={taskList.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {taskList.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={`No ${title.toLowerCase()} tasks`}
                  style={{ marginTop: 60 }}
                />
              ) : (
                taskList.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isJustDropped={justDroppedId === task.id}
                  />
                ))
              )}
            </SortableContext>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <BoardSummary tasks={tasks} darkMode={darkMode} />

      <QuickFilters
        darkMode={darkMode}
        activeFilters={filters}
        onFilterChange={setFilters}
        filteredCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
      <div style={{
        display: 'flex',
        gap: 20,
        overflowX: 'auto',
        paddingBottom: 20,
        paddingTop: 4,
      }}>
        <ColumnCard
          title="To Do"
          icon="📋"
          count={pendingTasks.length}
          color="#1890ff"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          columnId="pending-column"
          taskList={pendingTasks}
          stats={columnStats.pending}
        />
        <ColumnCard
          title="In Progress"
          icon="⚡"
          count={inProgressTasks.length}
          color="#faad14"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          columnId="in-progress-column"
          taskList={inProgressTasks}
          stats={columnStats.inProgress}
        />
        <ColumnCard
          title="Completed"
          icon="✅"
          count={completedTasks.length}
          color="#52c41a"
          gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          columnId="completed-column"
          taskList={completedTasks}
          stats={columnStats.completed}
        />
      </div>

      <DragOverlay dropAnimation={{
        duration: 350,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeId ? (
          <Card
            size="small"
            style={{
              cursor: 'grabbing',
              transform: 'rotate(4deg) scale(1.05)',
              boxShadow: darkMode
                ? '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              opacity: 0.97,
              borderLeft: `4px solid ${getPriorityColor(
                taskMap.get(activeId)?.priority || TaskPriority.MEDIUM
              )}`,
              borderRadius: 10,
              background: darkMode ? 'rgba(255, 255, 255, 0.12)' : '#fff',
              backdropFilter: 'blur(8px)',
            }}
            styles={{ body: { padding: '14px' } }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ fontSize: 14 }}>
                {taskMap.get(activeId)?.title}
              </Text>
              {taskMap.get(activeId)?.description && (
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 0, fontSize: 12, color: '#666' }}
                >
                  {taskMap.get(activeId)?.description}
                </Paragraph>
              )}
            </Space>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>

      <style>{`
      .kanban-task-card {
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .kanban-task-card:hover {
        transform: translateY(-3px) scale(1.01) !important;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18) !important;
      }

      [data-theme='dark'] .kanban-task-card:hover {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6) !important;
      }

      .kanban-task-card:active {
        cursor: grabbing !important;
        transform: scale(0.98) !important;
      }

      .kanban-column {
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .kanban-column-content {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        scroll-behavior: smooth;
      }

      .kanban-column-content::-webkit-scrollbar {
        width: 6px;
      }

      .kanban-column-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .kanban-column-content::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
      }

      [data-theme='dark'] .kanban-column-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
      }

      .kanban-column-content::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }

      [data-theme='dark'] .kanban-column-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .task-slide-in {
        animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes slideIn {
        0% {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        60% {
          transform: translateY(5px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .count-badge-pulse {
        animation: pulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .kanban-task-card,
        .kanban-column,
        .task-slide-in,
        .count-badge-pulse {
          animation: none !important;
          transition: none !important;
        }
      }
      `}</style>
    </div>
  );
};

KanbanBoardComponent.displayName = 'KanbanBoard';

export const KanbanBoard = React.memo(KanbanBoardComponent);
