import React from 'react';
import { Card, Select, Space, Typography, Row, Col } from 'antd';
import { TaskPriority, TaskCategory } from '../types/task';

const { Text } = Typography;
const { Option } = Select;

export interface AdvancedFilterOptions {
  priority?: TaskPriority;
  category?: TaskCategory;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterOptions;
  onFilterChange: (filters: AdvancedFilterOptions) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleChange = (key: keyof AdvancedFilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <Card title="Advanced Filters" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Text strong style={{ fontSize: 12 }}>Priority</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="All priorities"
              allowClear
              value={filters.priority}
              onChange={(value) => handleChange('priority', value)}
            >
              <Option value={TaskPriority.HIGH}>High</Option>
              <Option value={TaskPriority.MEDIUM}>Medium</Option>
              <Option value={TaskPriority.LOW}>Low</Option>
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Text strong style={{ fontSize: 12 }}>Category</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="All categories"
              allowClear
              value={filters.category}
              onChange={(value) => handleChange('category', value)}
            >
              <Option value={TaskCategory.WORK}>Work</Option>
              <Option value={TaskCategory.PERSONAL}>Personal</Option>
              <Option value={TaskCategory.SHOPPING}>Shopping</Option>
              <Option value={TaskCategory.HEALTH}>Health</Option>
              <Option value={TaskCategory.OTHER}>Other</Option>
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Text strong style={{ fontSize: 12 }}>Sort By</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Sort by..."
              value={filters.sortBy}
              onChange={(value) => handleChange('sortBy', value)}
            >
              <Option value="createdAt">Created Date</Option>
              <Option value="dueDate">Due Date</Option>
              <Option value="priority">Priority</Option>
              <Option value="title">Title</Option>
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Text strong style={{ fontSize: 12 }}>Sort Order</Text>
            <Select
              style={{ width: '100%' }}
              value={filters.sortOrder}
              onChange={(value) => handleChange('sortOrder', value)}
            >
              <Option value="desc">Descending</Option>
              <Option value="asc">Ascending</Option>
            </Select>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
