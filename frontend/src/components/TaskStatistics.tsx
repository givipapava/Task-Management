import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag, Empty } from 'antd';
import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FallOutlined,
  FireOutlined,
  FolderOutlined,
  RiseOutlined,
  SyncOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/plots';
import { TaskPriority, TaskStatus } from '../types/task';
import type { Task } from '../types/task';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const { Title, Text } = Typography;

interface TaskStatisticsProps {
  tasks: Task[];
}

export const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const overdue = tasks.filter(t =>
      t.status !== TaskStatus.COMPLETED &&
      t.dueDate &&
      dayjs(t.dueDate).isBefore(dayjs(), 'day')
    ).length;

    const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
    const mediumPriority = tasks.filter(t => t.priority === TaskPriority.MEDIUM).length;
    const lowPriority = tasks.filter(t => t.priority === TaskPriority.LOW).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category distribution
    const categories = tasks.reduce((acc, task) => {
      const category = task.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tasks due this week
    const dueThisWeek = tasks.filter(t =>
      t.dueDate &&
      dayjs(t.dueDate).isSame(dayjs(), 'week') &&
      t.status !== TaskStatus.COMPLETED
    ).length;

    // Tasks created this week
    const createdThisWeek = tasks.filter(t =>
      dayjs(t.createdAt).isSame(dayjs(), 'week')
    ).length;

    // Average completion time (for completed tasks with due dates)
    const completedTasksWithDates = tasks.filter(t =>
      t.status === TaskStatus.COMPLETED &&
      t.createdAt &&
      t.updatedAt
    );
    const avgCompletionTime = completedTasksWithDates.length > 0
      ? Math.round(
          completedTasksWithDates.reduce((sum, t) => {
            const diff = dayjs(t.updatedAt).diff(dayjs(t.createdAt), 'day');
            return sum + diff;
          }, 0) / completedTasksWithDates.length
        )
      : 0;

    // Productivity trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day');
      const completedOnDay = tasks.filter(t =>
        t.status === TaskStatus.COMPLETED &&
        dayjs(t.updatedAt).isSame(date, 'day')
      ).length;
      const createdOnDay = tasks.filter(t =>
        dayjs(t.createdAt).isSame(date, 'day')
      ).length;
      return {
        date: date.format('MMM DD'),
        completed: completedOnDay,
        created: createdOnDay,
      };
    });

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
      categories,
      dueThisWeek,
      createdThisWeek,
      avgCompletionTime,
      last7Days,
    };
  }, [tasks]);

  // Priority distribution data for pie chart
  const priorityData = [
    { type: 'High Priority', value: stats.highPriority, priority: 'high' },
    { type: 'Medium Priority', value: stats.mediumPriority, priority: 'medium' },
    { type: 'Low Priority', value: stats.lowPriority, priority: 'low' },
  ].filter(item => item.value > 0);

  // Status distribution data for column chart
  const statusData = [
    { status: 'Completed', count: stats.completed, type: 'completed' },
    { status: 'In Progress', count: stats.inProgress, type: 'in_progress' },
    { status: 'Pending', count: stats.pending, type: 'pending' },
    { status: 'Overdue', count: stats.overdue, type: 'overdue' },
  ];

  // Category distribution data
  const categoryData = Object.entries(stats.categories).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count,
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Productivity trend data
  const trendData = stats.last7Days.flatMap(day => [
    { date: day.date, value: day.completed, type: 'Completed' },
    { date: day.date, value: day.created, type: 'Created' },
  ]);

  const pieConfig = {
    data: priorityData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,
    innerRadius: 0.6,
    label: {
      text: 'value',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'bottom' as const,
        itemName: {
          style: {
            fontSize: 12,
          },
        },
      },
    },
    tooltip: {
      items: [
        {
          field: 'value',
          name: 'Tasks',
        },
      ],
    },
    color: ({ priority }: { priority: string }) => {
      if (priority === 'high') return '#ff4d4f';
      if (priority === 'medium') return '#faad14';
      return '#52c41a';
    },
    interactions: [{ type: 'element-active' }],
  };

  const columnConfig = {
    data: statusData,
    xField: 'status',
    yField: 'count',
    colorField: 'type',
    color: ({ type }: { type: string }) => {
      if (type === 'completed') return '#52c41a';
      if (type === 'in_progress') return '#1890ff';
      if (type === 'pending') return '#faad14';
      return '#ff4d4f';
    },
    label: {
      text: 'count',
      position: 'top' as const,
      style: {
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
    legend: false,
    axis: {
      y: {
        title: 'Number of Tasks',
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  const categoryConfig = {
    data: categoryData,
    xField: 'category',
    yField: 'count',
    label: {
      text: 'count',
      position: 'top' as const,
      style: {
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
    color: '#722ed1',
    legend: false,
    axis: {
      y: {
        title: 'Number of Tasks',
      },
      x: {
        title: 'Categories',
      },
    },
  };

  const trendConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    colorField: 'type',
    color: ['#52c41a', '#1890ff'],
    point: {
      size: 5,
      shape: 'circle',
    },
    interaction: {
      tooltip: {
        marker: true,
      },
    },
    legend: {
      position: 'top' as const,
    },
    smooth: true,
  };

  if (tasks.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty
          description={
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: 16 }}>No tasks available</Text>
              <Text type="secondary">Create your first task to see analytics</Text>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Task Analytics Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Comprehensive overview of your task management performance and insights
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>Total Tasks</span>}
              value={stats.total}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<TrophyOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(240, 147, 251, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>Completed</span>}
              value={stats.completed}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              suffix={<span style={{ fontSize: 16, opacity: 0.8 }}>/ {stats.total}</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(79, 172, 254, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>In Progress</span>}
              value={stats.inProgress}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<SyncOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(250, 112, 154, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>Overdue</span>}
              value={stats.overdue}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<ExclamationCircleOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable={false}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Completion Rate</Text>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {stats.completionRate}%
              </Title>
              <Progress
                percent={stats.completionRate}
                showInfo={false}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#52c41a',
                }}
                size="small"
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable={false}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined /> Due This Week
              </Text>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                {stats.dueThisWeek}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.dueThisWeek === 0 ? 'All caught up!' : 'tasks pending'}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable={false}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <RiseOutlined /> Created This Week
              </Text>
              <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
                {stats.createdThisWeek}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.createdThisWeek > stats.last7Days[stats.last7Days.length - 2]?.created ? (
                  <Tag color="green" icon={<RiseOutlined />}>Trending Up</Tag>
                ) : (
                  <Tag color="blue" icon={<FallOutlined />}>Stable</Tag>
                )}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable={false}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> Avg. Completion Time
              </Text>
              <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>
                {stats.avgCompletionTime}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                days on average
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: '#1890ff' }} />
                <span>Status Distribution</span>
              </Space>
            }
            bordered={false}
            hoverable={false}
            style={{ height: '100%' }}
          >
            <Column {...columnConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: '#ff4d4f' }} />
                <span>Priority Breakdown</span>
              </Space>
            }
            bordered={false}
            hoverable={false}
            style={{ height: '100%' }}
          >
            {priorityData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Pie {...pieConfig} height={300} />
              </div>
            ) : (
              <Empty description="No priority data" style={{ padding: '100px 0' }} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FolderOutlined style={{ color: '#722ed1' }} />
                <span>Top Categories</span>
              </Space>
            }
            bordered={false}
            hoverable={false}
            style={{ height: '100%' }}
          >
            {categoryData.length > 0 ? (
              <Column {...categoryConfig} height={300} />
            ) : (
              <Empty description="No category data" style={{ padding: '100px 0' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>7-Day Activity Trend</span>
              </Space>
            }
            bordered={false}
            hoverable={false}
            style={{ height: '100%' }}
          >
            <Line {...trendConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>High Priority</span>}
              value={stats.highPriority}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<FireOutlined style={{ color: '#fff' }} />}
            />
            <Progress
              percent={stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}
              strokeColor="#fff"
              trailColor="rgba(255, 255, 255, 0.3)"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12, marginTop: 4, display: 'block' }}>
              {stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}% of total tasks
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(254, 202, 87, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>Medium Priority</span>}
              value={stats.mediumPriority}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
            />
            <Progress
              percent={stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0}
              strokeColor="#fff"
              trailColor="rgba(255, 255, 255, 0.3)"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12, marginTop: 4, display: 'block' }}>
              {stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0}% of total tasks
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            className="gradient-card"
            style={{
              background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            styles={{
              body: { padding: 24 }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(72, 219, 251, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Statistic
              title={<span style={{ color: '#fff', opacity: 0.9 }}>Low Priority</span>}
              value={stats.lowPriority}
              valueStyle={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
            />
            <Progress
              percent={stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0}
              strokeColor="#fff"
              trailColor="rgba(255, 255, 255, 0.3)"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12, marginTop: 4, display: 'block' }}>
              {stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0}% of total tasks
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
