import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Card, Tag, Typography, Space, Button, Dropdown, Empty, App } from 'antd';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
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
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus, silent?: boolean) => void;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isJustDropped?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, isJustDropped }) => {
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
    transition: isJustDropped ? undefined : (transition || 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
    opacity: isDragging ? 0.3 : 1,
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
        className={isJustDropped ? 'task-just-dropped task-slide-in' : ''}
        style={{
          marginBottom: 12,
          cursor: 'grab',
          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        styles={{ body: { padding: '12px' } }}
        extra={
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 14 }}>{task.title}</Text>

          {task.description && (
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 8, fontSize: 12, color: '#666' }}
            >
              {task.description}
            </Paragraph>
          )}

          <Space wrap size={4}>
            <Tag color={getPriorityColor(task.priority)} style={{ fontSize: 11 }}>
              <FlagOutlined /> {task.priority.toUpperCase()}
            </Tag>
            {task.category && (
              <Tag color={getCategoryColor(task.category)} style={{ fontSize: 11 }}>
                {task.category.toUpperCase()}
              </Tag>
            )}
          </Space>

          {task.dueDate && (
            <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 11 }}>
              <CalendarOutlined /> {dayjs(task.dueDate).format('MMM DD, YYYY')}
              {isOverdue && ' (Overdue)'}
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
};

const KanbanBoardComponent: React.FC<KanbanBoardProps> = ({
  tasks,
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
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize task grouping for better performance
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

  // Column to status mapping
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

      // O(1) lookup instead of O(n) find
      const activeTask = taskMap.get(active.id as string);
      if (!activeTask) {
        setActiveId(null);
        return;
      }

      const newStatus = columnToStatus[over.id as string];

      if (newStatus && activeTask.status !== newStatus) {
        const oldStatus = activeTask.status;

        // Show success toast notification (before status change for better UX)
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

        // Trigger the status change (silent mode - no notification from useTasks)
        onStatusChange(activeTask.id, newStatus, true);

        // Set animation state
        setJustDroppedId(activeTask.id);
        setLastDroppedColumn(over.id as string);

        // Clear animation after 600ms
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
    count: number;
    color: string;
    columnId: string;
    taskList: Task[];
  }> = ({ title, count, color, columnId, taskList }) => {
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
          minWidth: 350,
          transition: 'all 0.2s ease',
        }}
      >
        <Card
          title={
            <Space>
              <Text strong style={{ fontSize: 16 }}>{title}</Text>
              <Tag
                color={color}
                className={shouldAnimate ? 'count-badge-pulse' : ''}
              >
                {count}
              </Tag>
            </Space>
          }
          style={{
            height: '100%',
            borderTop: `3px solid ${color}`,
            transition: 'all 0.2s ease',
            backgroundColor: isOver ? 'rgba(24, 144, 255, 0.08)' : undefined,
            border: isOver ? `2px solid ${color}` : undefined,
            transform: isOver ? 'scale(1.01)' : 'scale(1)',
            boxShadow: isOver ? `0 8px 24px ${color}40` : undefined,
          }}
          styles={{
            body: {
              padding: 0,
              height: 'calc(100vh - 300px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }
          }}
        >
          <div
            style={{
              flex: 1,
              width: '100%',
              overflowY: 'auto',
              padding: '16px',
            }}
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
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
        <ColumnCard
          title="To Do"
          count={pendingTasks.length}
          color="#1890ff"
          columnId="pending-column"
          taskList={pendingTasks}
        />
        <ColumnCard
          title="In Progress"
          count={inProgressTasks.length}
          color="#faad14"
          columnId="in-progress-column"
          taskList={inProgressTasks}
        />
        <ColumnCard
          title="Completed"
          count={completedTasks.length}
          color="#52c41a"
          columnId="completed-column"
          taskList={completedTasks}
        />
      </div>

      <DragOverlay>
        {activeId ? (
          <Card
            size="small"
            style={{
              cursor: 'grabbing',
              transform: 'rotate(3deg)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
              opacity: 0.9,
              borderLeft: `4px solid ${getPriorityColor(
                taskMap.get(activeId)?.priority || TaskPriority.MEDIUM
              )}`,
            }}
            styles={{ body: { padding: '12px' } }}
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
  );
};

KanbanBoardComponent.displayName = 'KanbanBoard';

export const KanbanBoard = React.memo(KanbanBoardComponent);
