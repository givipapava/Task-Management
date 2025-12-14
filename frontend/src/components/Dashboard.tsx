import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Typography, Empty, Badge, Space, Divider, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  RocketOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { TaskPriority, TaskStatus } from '../types/task';
import type { Task } from '../types/task';
import dayjs from 'dayjs';
import { GRADIENTS, SHADOWS, ANIMATION, EASING, DISPLAY_LIMITS } from '../constants/theme';
import { getPriorityColor, getCategoryColor, getCategoryEmoji, createGradient } from '../utils/taskHelpers';

const { Title, Text, Paragraph } = Typography;

interface DashboardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const DashboardComponent: React.FC<DashboardProps> = ({ tasks, onTaskClick }) => {
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const overdue = tasks.filter(t =>
      (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS) &&
      t.dueDate &&
      dayjs(t.dueDate).isBefore(dayjs(), 'day')
    ).length;

    const highPriority = tasks.filter(t =>
      t.priority === TaskPriority.HIGH &&
      (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS)
    ).length;

    const dueToday = tasks.filter(t =>
      (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS) &&
      t.dueDate &&
      dayjs(t.dueDate).isSame(dayjs(), 'day')
    ).length;

    const dueSoon = tasks.filter(t =>
      (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS) &&
      t.dueDate &&
      dayjs(t.dueDate).isAfter(dayjs(), 'day') &&
      dayjs(t.dueDate).isBefore(dayjs().add(7, 'days'), 'day')
    );

    const recentlyCompleted = tasks
      .filter(t => t.status === TaskStatus.COMPLETED)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, DISPLAY_LIMITS.RECENT_COMPLETED_TASKS);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const activeTasksCount = pending + inProgress;
    const productivity = completed > 0 && completed >= activeTasksCount ? 'up' : activeTasksCount > completed ? 'down' : 'neutral';

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      highPriority,
      dueToday,
      dueSoon,
      recentlyCompleted,
      completionRate,
      productivity,
    };
  }, [tasks]);

  const gradientCardStyle = (colors: readonly [string, string]) => ({
    background: createGradient(colors),
    border: 'none',
    boxShadow: SHADOWS.MD,
    transition: `all ${ANIMATION.NORMAL}ms ${EASING.EASE_IN_OUT}`,
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ marginBottom: 8, fontWeight: 700 }}>
          Welcome back! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Here's what's happening with your tasks today
        </Text>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }} role="region" aria-label="Task Statistics">
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={gradientCardStyle(GRADIENTS.PURPLE)}
            styles={{ body: { padding: 24 } }}
            className="stat-card"
            role="article"
            aria-label={`Total tasks: ${stats.total}`}
            tabIndex={0}
          >
            <Statistic
              title={<Text style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Total Tasks</Text>}
              value={stats.total}
              prefix={<RocketOutlined style={{ fontSize: 28 }} />}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              All tasks in your workspace
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={gradientCardStyle(GRADIENTS.GREEN)}
            styles={{ body: { padding: 24 } }}
            className="stat-card"
          >
            <Statistic
              title={<Text style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Completed</Text>}
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ fontSize: 28 }} />}
              suffix={<Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>/ {stats.total}</Text>}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {stats.completionRate}% completion rate
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={gradientCardStyle(GRADIENTS.PINK)}
            styles={{ body: { padding: 24 } }}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>In Progress</Text>
              {stats.highPriority > 0 && (
                <Badge count={stats.highPriority} style={{ backgroundColor: '#fff', color: '#f5576c', fontWeight: 600 }} />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockCircleOutlined style={{ fontSize: 28, color: '#fff' }} />
              <Text style={{ color: '#fff', fontSize: 36, fontWeight: 700, margin: 0 }}>{stats.inProgress}</Text>
            </div>
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {stats.pending} pending to start
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={gradientCardStyle(GRADIENTS.ORANGE)}
            styles={{ body: { padding: 24 } }}
            className="stat-card"
          >
            <Statistic
              title={<Text style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Overdue</Text>}
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined style={{ fontSize: 28 }} />}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {stats.dueToday} due today
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
                <Text strong style={{ fontSize: 16 }}>Productivity</Text>
              </Space>
            }
            variant="borderless"
            style={{ height: '100%', boxShadow: SHADOWS.SM }}
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Progress
                type="circle"
                percent={stats.completionRate}
                strokeColor={{
                  '0%': '#667eea',
                  '50%': '#11998e',
                  '100%': '#38ef7d',
                }}
                strokeWidth={8}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: '#1890ff' }}>{percent}%</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Complete</div>
                  </div>
                )}
                size={180}
              />
              <Divider style={{ margin: '20px 0' }} />
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">Tasks Done</Text>
                  <Text strong style={{ fontSize: 16 }}>{stats.completed} / {stats.total}</Text>
                </div>
                <div>
                  {stats.productivity === 'up' && (
                    <Tooltip title="Your completion rate is excellent!">
                      <Tag
                        icon={<ArrowUpOutlined />}
                        color="success"
                        className="productivity-tag"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          transition: `all ${ANIMATION.NORMAL}ms ${EASING.SPRING}`,
                        }}
                      >
                        Great Progress! Keep it up 🚀
                      </Tag>
                    </Tooltip>
                  )}
                  {stats.productivity === 'down' && (
                    <Tooltip title="Focus on completing pending tasks to boost productivity">
                      <Tag
                        icon={<ArrowDownOutlined />}
                        color="warning"
                        className="productivity-tag"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          transition: `all ${ANIMATION.NORMAL}ms ${EASING.SPRING}`,
                        }}
                      >
                        Let's focus on pending tasks 💪
                      </Tag>
                    </Tooltip>
                  )}
                  {stats.productivity === 'neutral' && (
                    <Tooltip title="You're making steady progress!">
                      <Tag
                        color="processing"
                        className="productivity-tag"
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          transition: `all ${ANIMATION.NORMAL}ms ${EASING.SPRING}`,
                        }}
                      >
                        Good pace! Stay consistent ⚡
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                <Text strong style={{ fontSize: 16 }}>High Priority</Text>
              </Space>
            }
            variant="borderless"
            extra={<Badge count={stats.highPriority} style={{ backgroundColor: '#ff4d4f' }} />}
            style={{ height: '100%', boxShadow: SHADOWS.SM }}
          >
            <List
              size="small"
              dataSource={tasks.filter(t =>
                t.priority === TaskPriority.HIGH &&
                (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS)
              ).slice(0, DISPLAY_LIMITS.HIGH_PRIORITY_TASKS)}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text type="secondary">No high priority tasks</Text>}
                    style={{ padding: '24px 0' }}
                  />
                )
              }}
              renderItem={(task) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '12px 0',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => onTaskClick?.(task)}
                  className="task-list-item"
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 4,
                        height: 36,
                        backgroundColor: getPriorityColor(task.priority),
                        borderRadius: 2,
                      }} />
                    }
                    title={
                      <Tooltip title={task.title}>
                        <Text ellipsis strong style={{ fontSize: 13, display: 'block', maxWidth: '90%' }}>
                          {task.title}
                        </Text>
                      </Tooltip>
                    }
                    description={
                      <Space size={4} wrap>
                        {task.category && (
                          <Tag color={getCategoryColor(task.category)} style={{ fontSize: 11, margin: 0 }}>
                            {getCategoryEmoji(task.category)} {task.category}
                          </Tag>
                        )}
                        {task.dueDate && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <CalendarOutlined /> {dayjs(task.dueDate).format('MMM DD')}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                <Text strong style={{ fontSize: 16 }}>Due Soon</Text>
              </Space>
            }
            variant="borderless"
            extra={<Badge count={stats.dueSoon.length} style={{ backgroundColor: '#1890ff' }} />}
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <List
              size="small"
              dataSource={stats.dueSoon.slice(0, DISPLAY_LIMITS.DUE_SOON_TASKS)}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text type="secondary">Nothing due soon</Text>}
                    style={{ padding: '24px 0' }}
                  />
                )
              }}
              renderItem={(task) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '12px 0',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => onTaskClick?.(task)}
                  className="task-list-item"
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 4,
                        height: 36,
                        backgroundColor: getPriorityColor(task.priority),
                        borderRadius: 2,
                      }} />
                    }
                    title={
                      <Tooltip title={task.title}>
                        <Text ellipsis strong style={{ fontSize: 13, display: 'block', maxWidth: '90%' }}>
                          {task.title}
                        </Text>
                      </Tooltip>
                    }
                    description={
                      <Space size={4} wrap>
                        <Tag color={getPriorityColor(task.priority)} style={{ fontSize: 11, margin: 0, border: 'none' }}>
                          {task.priority}
                        </Tag>
                        {task.dueDate && (
                          <Text type="warning" strong style={{ fontSize: 11 }}>
                            Due {dayjs(task.dueDate).fromNow()}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <Text strong style={{ fontSize: 16 }}>Recently Completed</Text>
              </Space>
            }
            variant="borderless"
            extra={<StarOutlined style={{ color: '#faad14' }} />}
            style={{ boxShadow: SHADOWS.SM }}
          >
            {stats.recentlyCompleted.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No completed tasks yet. Start completing tasks to see them here!"
                style={{ padding: '40px 0' }}
              />
            ) : (
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 6,
                  xxl: 6,
                }}
                dataSource={stats.recentlyCompleted}
                renderItem={(task) => (
                  <List.Item>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => onTaskClick?.(task)}
                      style={{
                        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                        height: '100%',
                        transition: 'all 0.3s',
                      }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        strong
                        style={{ marginBottom: 12, fontSize: 13, minHeight: 40 }}
                      >
                        {task.title}
                      </Paragraph>
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        {task.category && (
                          <Tag color={getCategoryColor(task.category)} style={{ fontSize: 10 }}>
                            {getCategoryEmoji(task.category)} {task.category}
                          </Tag>
                        )}
                        <div>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12, marginRight: 4 }} />
                          <Text type="success" style={{ fontSize: 11 }}>
                            Completed
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          {dayjs(task.updatedAt).fromNow()}
                        </Text>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <style>{`
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: ${SHADOWS.LG} !important;
        }

        .task-list-item:hover {
          background-color: #fafafa;
          margin: 0 -12px;
          padding-left: 12px !important;
          padding-right: 12px !important;
          border-radius: 8px;
        }

        .productivity-tag:hover {
          transform: scale(1.02);
          box-shadow: ${SHADOWS.SM};
        }

        .productivity-tag:active {
          transform: scale(0.98);
        }

        .ant-card {
          transition: all ${ANIMATION.NORMAL}ms ${EASING.EASE_IN_OUT};
        }

        .ant-progress-circle .ant-progress-circle-path {
          transition: stroke-dashoffset ${ANIMATION.SLOW}ms ${EASING.EASE_IN_OUT};
        }
      `}</style>
    </div>
  );
};

DashboardComponent.displayName = 'Dashboard';

export const Dashboard = React.memo(DashboardComponent);
