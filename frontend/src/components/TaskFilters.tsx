import React from 'react';
import { Card, Input, Radio, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { TaskStatus } from '../types/task';

const { Text } = Typography;

export type FilterStatus = 'all' | TaskStatus;

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  taskCounts: {
    all: number;
    pending: number;
    completed: number;
  };
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  taskCounts,
}) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Search Tasks
          </Text>
          <Input
            placeholder="Search by title or description..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            size="large"
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Filter by Status
          </Text>
          <Radio.Group
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            buttonStyle="solid"
            size="large"
          >
            <Radio.Button value="all">
              All ({taskCounts.all})
            </Radio.Button>
            <Radio.Button value={TaskStatus.PENDING}>
              Pending ({taskCounts.pending})
            </Radio.Button>
            <Radio.Button value={TaskStatus.COMPLETED}>
              Completed ({taskCounts.completed})
            </Radio.Button>
          </Radio.Group>
        </div>
      </Space>
    </Card>
  );
};
