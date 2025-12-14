import React from 'react';
import { Card, Input, Radio, Space, Typography, Row, Col, Badge, theme } from 'antd';
import { SearchOutlined, UnorderedListOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { TaskStatus } from '../types/task';

const { Text } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();
  const isDark = token.colorBgContainer === '#141414';

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: '16px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f0f0f0',
        boxShadow: isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space align="center" size={8}>
              <SearchOutlined style={{
                fontSize: 18,
                color: isDark ? '#4facfe' : '#1890ff',
              }} />
              <Text strong style={{ fontSize: 15 }}>
                Search Tasks
              </Text>
            </Space>
            <Input
              placeholder="Search by title or description..."
              prefix={
                <SearchOutlined style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
                  fontSize: 16,
                }} />
              }
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              allowClear
              size="large"
              style={{
                borderRadius: '12px',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.12)'
                  : '1px solid #d9d9d9',
                background: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : '#ffffff',
                fontSize: 15,
              }}
            />
          </Space>
        </Col>

        <Col xs={24} lg={12}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space align="center" size={8}>
              <UnorderedListOutlined style={{
                fontSize: 18,
                color: isDark ? '#feca57' : '#faad14',
              }} />
              <Text strong style={{ fontSize: 15 }}>
                Filter by Status
              </Text>
            </Space>
            <Radio.Group
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Radio.Button
                    value="all"
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: '12px',
                      border: filterStatus === 'all'
                        ? `2px solid ${isDark ? '#4facfe' : '#1890ff'}`
                        : isDark
                          ? '1px solid rgba(255, 255, 255, 0.12)'
                          : '1px solid #d9d9d9',
                      background: filterStatus === 'all'
                        ? isDark
                          ? 'linear-gradient(135deg, rgba(79, 172, 254, 0.25) 0%, rgba(0, 242, 254, 0.15) 100%)'
                          : 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                        : isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      color: filterStatus === 'all'
                        ? isDark ? '#4facfe' : '#1890ff'
                        : isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    <Space align="center" size={8}>
                      <UnorderedListOutlined style={{
                        fontSize: 16,
                        color: filterStatus === 'all'
                          ? isDark ? '#4facfe' : '#1890ff'
                          : isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
                      }} />
                      <span>All</span>
                      <Badge
                        count={taskCounts.all}
                        showZero
                        style={{
                          backgroundColor: isDark ? '#4facfe' : '#1890ff',
                          boxShadow: isDark
                            ? '0 2px 8px rgba(79, 172, 254, 0.4)'
                            : '0 2px 4px rgba(24, 144, 255, 0.3)',
                        }}
                      />
                    </Space>
                  </Radio.Button>
                </Col>

                <Col xs={24} sm={8}>
                  <Radio.Button
                    value={TaskStatus.PENDING}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: '12px',
                      border: filterStatus === TaskStatus.PENDING
                        ? `2px solid ${isDark ? '#ffa940' : '#fa8c16'}`
                        : isDark
                          ? '1px solid rgba(255, 255, 255, 0.12)'
                          : '1px solid #d9d9d9',
                      background: filterStatus === TaskStatus.PENDING
                        ? isDark
                          ? 'linear-gradient(135deg, rgba(250, 140, 22, 0.25) 0%, rgba(250, 169, 64, 0.15) 100%)'
                          : 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)'
                        : isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      color: filterStatus === TaskStatus.PENDING
                        ? isDark ? '#ffa940' : '#fa8c16'
                        : isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    <Space align="center" size={8}>
                      <ClockCircleOutlined style={{
                        fontSize: 16,
                        color: filterStatus === TaskStatus.PENDING
                          ? isDark ? '#ffa940' : '#fa8c16'
                          : isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
                      }} />
                      <span>Pending</span>
                      <Badge
                        count={taskCounts.pending}
                        showZero
                        style={{
                          backgroundColor: isDark ? '#ffa940' : '#fa8c16',
                          boxShadow: isDark
                            ? '0 2px 8px rgba(250, 140, 22, 0.4)'
                            : '0 2px 4px rgba(250, 140, 22, 0.3)',
                        }}
                      />
                    </Space>
                  </Radio.Button>
                </Col>

                <Col xs={24} sm={8}>
                  <Radio.Button
                    value={TaskStatus.COMPLETED}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: '12px',
                      border: filterStatus === TaskStatus.COMPLETED
                        ? `2px solid ${isDark ? '#73d13d' : '#52c41a'}`
                        : isDark
                          ? '1px solid rgba(255, 255, 255, 0.12)'
                          : '1px solid #d9d9d9',
                      background: filterStatus === TaskStatus.COMPLETED
                        ? isDark
                          ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.25) 0%, rgba(115, 209, 61, 0.15) 100%)'
                          : 'linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)'
                        : isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      color: filterStatus === TaskStatus.COMPLETED
                        ? isDark ? '#73d13d' : '#52c41a'
                        : isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
                    }}
                  >
                    <Space align="center" size={8}>
                      <CheckCircleOutlined style={{
                        fontSize: 16,
                        color: filterStatus === TaskStatus.COMPLETED
                          ? isDark ? '#73d13d' : '#52c41a'
                          : isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
                      }} />
                      <span>Completed</span>
                      <Badge
                        count={taskCounts.completed}
                        showZero
                        style={{
                          backgroundColor: isDark ? '#73d13d' : '#52c41a',
                          boxShadow: isDark
                            ? '0 2px 8px rgba(82, 196, 26, 0.4)'
                            : '0 2px 4px rgba(82, 196, 26, 0.3)',
                        }}
                      />
                    </Space>
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
