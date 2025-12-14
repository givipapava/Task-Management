import React from 'react';
import { Table, Tag, Button, Space, Checkbox, Typography, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { TaskPriority, TaskStatus, TaskCategory } from '../types/task';
import type { Task } from '../types/task';
import { getPriorityColor, getCategoryColor } from '../utils/taskHelpers';

const { Text } = Typography;
const { Option } = Select;

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskListComponent: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onStatusChange,
}) => {
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'green';
      case TaskStatus.IN_PROGRESS:
        return 'blue';
      case TaskStatus.PENDING:
        return 'orange';
      default:
        return 'default';
    }
  };

  const formatStatusText = (status: TaskStatus): string => {
    return status.replace('_', ' ').toUpperCase();
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
      return false;
    }
    return dayjs(task.dueDate).isBefore(dayjs(), 'day');
  };

  const columns: ColumnsType<Task> = [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Checkbox
          checked={record.status === TaskStatus.COMPLETED}
          onChange={() => onToggleStatus(record)}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Text
          delete={record.status === TaskStatus.COMPLETED}
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {text || '-'}
        </Text>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      align: 'center',
      render: (priority: TaskPriority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      align: 'center',
      render: (category?: TaskCategory) => (
        category ? (
          <Tag color={getCategoryColor(category)}>{category.toUpperCase()}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'statusTag',
      width: 150,
      align: 'center',
      render: (status: TaskStatus, record: Task) => (
        <Select
          value={status}
          onChange={(newStatus) => onStatusChange(record.id, newStatus)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value={TaskStatus.PENDING}>
            <Tag color={getStatusColor(TaskStatus.PENDING)} style={{ margin: 0 }}>
              {formatStatusText(TaskStatus.PENDING)}
            </Tag>
          </Option>
          <Option value={TaskStatus.IN_PROGRESS}>
            <Tag color={getStatusColor(TaskStatus.IN_PROGRESS)} style={{ margin: 0 }}>
              {formatStatusText(TaskStatus.IN_PROGRESS)}
            </Tag>
          </Option>
          <Option value={TaskStatus.COMPLETED}>
            <Tag color={getStatusColor(TaskStatus.COMPLETED)} style={{ margin: 0 }}>
              {formatStatusText(TaskStatus.COMPLETED)}
            </Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 140,
      render: (date, record) => {
        if (!date) return <Text type="secondary">-</Text>;

        const formattedDate = dayjs(date).format('MMM DD, YYYY');
        const overdue = isOverdue(record);

        return (
          <Text type={overdue ? 'danger' : 'secondary'}>
            {formattedDate}
            {overdue && ' (Overdue)'}
          </Text>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {dayjs(date).format('MMM DD, YYYY')}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tasks}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} tasks`,
      }}
      locale={{
        emptyText: 'No tasks found',
      }}
    />
  );
};

TaskListComponent.displayName = 'TaskList';

export const TaskList = React.memo(TaskListComponent);
