import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Card, Tag, Typography, Space, Button, Dropdown, Empty, App } from 'antd';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, rectIntersection, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditOutlined, DeleteOutlined, MoreOutlined, CalendarOutlined, FlagOutlined } from '@ant-design/icons';
import { TaskStatus, TaskPriority } from '../types/task';
import type { Task } from '../types/task';
import { getPriorityColor, getCategoryColor } from '../utils/taskHelpers';
import dayjs from 'dayjs';

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

  const isOverdue = task.dueDate && task.status === TaskStatus.PENDING && dayjs(task.dueDate).isBefore(dayjs(), 'day');

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

          {task.dueDate && (
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
                color: isOverdue ? '#ff4d4f' : darkMode ? 'rgba(255, 255, 255, 0.65)' : '#666'
              }} />
              <Text
                type={isOverdue ? 'danger' : 'secondary'}
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                {dayjs(task.dueDate).format('MMM DD, YYYY')}
                {isOverdue && ' • Overdue'}
              </Text>
            </div>
          )}
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

  const { pendingTasks, inProgressTasks, completedTasks, taskMap } = useMemo(() => {
    const pending: Task[] = [];
    const inProgress: Task[] = [];
    const completed: Task[] = [];
    const map = new Map<string, Task>();

    tasks.forEach((task) => {
      map.set(task.id, task);
      if (task.status === TaskStatus.PENDING) {
        pending.push(task);
      } else if (task.status === TaskStatus.IN_PROGRESS) {
        inProgress.push(task);
      } else if (task.status === TaskStatus.COMPLETED) {
        completed.push(task);
      }
    });

    return {
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed,
      taskMap: map,
    };
  }, [tasks]);

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
  }> = ({ title, icon, count, color, gradient, columnId, taskList }) => {
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
                <Text strong style={{ fontSize: 17 }}>{title}</Text>
              </Space>
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
                }}
              >
                {count}
              </Tag>
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
        />
        <ColumnCard
          title="In Progress"
          icon="⚡"
          count={inProgressTasks.length}
          color="#faad14"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          columnId="in-progress-column"
          taskList={inProgressTasks}
        />
        <ColumnCard
          title="Completed"
          icon="✅"
          count={completedTasks.length}
          color="#52c41a"
          gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          columnId="completed-column"
          taskList={completedTasks}
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
