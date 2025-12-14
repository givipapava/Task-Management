import React from 'react';
import { Card, Skeleton, Row, Col, Space } from 'antd';

/**
 * Dashboard Loading Skeleton
 * Displays placeholder content while dashboard data is loading
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Hero Stats Cards */}
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title={<Skeleton.Input active size="small" style={{ width: 120 }} />}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
            <Card title={<Skeleton.Input active size="small" style={{ width: 120 }} />}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  );
};

/**
 * Task List Loading Skeleton
 * Displays placeholder content while task list is loading
 */
export const TaskListSkeleton: React.FC = () => {
  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} active avatar paragraph={{ rows: 2 }} />
        ))}
      </Space>
    </Card>
  );
};

/**
 * Kanban Board Loading Skeleton
 * Displays placeholder content while kanban board is loading
 */
export const KanbanSkeleton: React.FC = () => {
  return (
    <Row gutter={16}>
      {['To Do', 'In Progress', 'Completed'].map((title) => (
        <Col xs={24} md={8} key={title}>
          <Card
            title={<Skeleton.Input active size="small" style={{ width: 100 }} />}
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {[1, 2, 3].map((i) => (
                <Card key={i} size="small">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/**
 * Generic Card Loading Skeleton
 * Reusable skeleton for card-based layouts
 */
export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <Card>
      <Skeleton active paragraph={{ rows }} />
    </Card>
  );
};
