import React from 'react';
import { Card, Row, Col, Progress, List, Tag, Typography, Empty, Badge, Space, Tooltip, Avatar } from 'antd';
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
  ThunderboltOutlined,
  BulbOutlined,
  FolderOutlined,
  PlusCircleOutlined,
  WarningOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { TaskPriority, TaskStatus } from '../types/task';
import type { Task, TaskCategory } from '../types/task';
import dayjs from 'dayjs';
import { DISPLAY_LIMITS } from '../constants/theme';
import { getPriorityColor, getCategoryColor, getCategoryEmoji } from '../utils/taskHelpers';

const { Title, Text, Paragraph } = Typography;

interface DashboardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  darkMode: boolean;
}

const DashboardComponent: React.FC<DashboardProps> = ({ tasks, onTaskClick, darkMode }) => {
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

    // Active tasks for today (in progress + due today)
    const activeTodayTasks = tasks.filter(t =>
      t.status === TaskStatus.IN_PROGRESS ||
      (t.dueDate && dayjs(t.dueDate).isSame(dayjs(), 'day') && t.status !== TaskStatus.COMPLETED)
    );

    // Category breakdown
    const categoryBreakdown = tasks.reduce((acc, task) => {
      if (task.status !== TaskStatus.COMPLETED) {
        const category = task.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Tasks created this week
    const createdThisWeek = tasks.filter(t =>
      dayjs(t.createdAt).isAfter(dayjs().startOf('week'))
    ).length;

    // Tasks completed this week
    const completedThisWeek = tasks.filter(t =>
      t.status === TaskStatus.COMPLETED &&
      dayjs(t.updatedAt).isAfter(dayjs().startOf('week'))
    ).length;

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
      activeTodayTasks,
      topCategories,
      createdThisWeek,
      completedThisWeek,
    };
  }, [tasks]);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = currentHour < 12 ? '☀️' : currentHour < 18 ? '👋' : '🌙';

  return (
    <div style={{ background: 'transparent', minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
        }} />

        <Row align="middle" justify="space-between" style={{ position: 'relative', zIndex: 1 }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                {greeting}! {greetingEmoji}
              </Title>
              <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
                Here's your productivity overview for today
              </Text>
            </Space>
          </Col>
          <Col>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px 24px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <Space size={16}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>Active</Text>
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{stats.inProgress + stats.pending}</Text>
                </div>
                <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>Done</Text>
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{stats.completed}</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <div
            className="modern-stat-card"
            style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#fff',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.1,
              borderRadius: '50%',
            }} />
            <Space direction="vertical" size={8} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <RocketOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Total Tasks</Text>
              <Title level={2} style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>{stats.total}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Workspace overview</Text>
            </Space>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div
            className="modern-stat-card"
            style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#fff',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              opacity: 0.1,
              borderRadius: '50%',
            }} />
            <Space direction="vertical" size={8} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Completed</Text>
              <Space align="baseline">
                <Title level={2} style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>{stats.completed}</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>/ {stats.total}</Text>
              </Space>
              <Progress percent={stats.completionRate} strokeColor="#38ef7d" showInfo={false} strokeWidth={6} />
            </Space>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div
            className="modern-stat-card"
            style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#fff',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              opacity: 0.1,
              borderRadius: '50%',
            }} />
            <Space direction="vertical" size={8} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>In Progress</Text>
                {stats.highPriority > 0 && (
                  <Badge count={stats.highPriority} style={{ backgroundColor: '#ff4d4f', fontSize: 10 }} />
                )}
              </div>
              <Title level={2} style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>{stats.inProgress}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{stats.pending} pending tasks</Text>
            </Space>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div
            className="modern-stat-card modern-stat-card-overdue"
            style={{
              background: darkMode
                ? 'rgba(255, 255, 255, 0.04)'
                : (stats.overdue > 0 ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : '#fff'),
              border: darkMode
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : (stats.overdue > 0 ? 'none' : '1px solid rgba(0,0,0,0.06)'),
              borderRadius: '16px',
              padding: '24px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {stats.overdue === 0 && !darkMode && (
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                opacity: 0.1,
                borderRadius: '50%',
              }} />
            )}
            <Space direction="vertical" size={8} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: darkMode
                  ? (stats.overdue > 0 ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)')
                  : (stats.overdue > 0 ? 'rgba(255,255,255,0.25)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <ExclamationCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, color: (!darkMode && stats.overdue > 0) ? 'rgba(255,255,255,0.9)' : undefined }}>
                Overdue Tasks
              </Text>
              <Title level={2} style={{ margin: 0, fontSize: 36, fontWeight: 800, color: (!darkMode && stats.overdue > 0) ? '#fff' : undefined }}>
                {stats.overdue}
              </Title>
              <Text type="secondary" style={{ fontSize: 12, color: (!darkMode && stats.overdue > 0) ? 'rgba(255,255,255,0.8)' : undefined }}>
                {stats.dueToday} due today
              </Text>
            </Space>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={8}>
          <Card
            hoverable={false}
            style={{
              borderRadius: '16px',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '100%',
              overflow: 'hidden',
            }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ padding: '24px', position: 'relative' }}>
              {!darkMode && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    transform: 'translate(40%, -40%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    transform: 'translate(-30%, 30%)',
                  }} />
                </>
              )}

              <Space style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: darkMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrophyOutlined style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <Text strong style={{ fontSize: 18, color: darkMode ? undefined : '#fff' }}>Productivity Score</Text>
              </Space>

              <div style={{ textAlign: 'center', padding: '20px 0', position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Progress
                    type="circle"
                    percent={stats.completionRate}
                    strokeColor={{
                      '0%': '#ffd89b',
                      '100%': '#19547b',
                    }}
                    trailColor={darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={12}
                    format={(percent) => (
                      <div>
                        <div style={{ fontSize: 48, fontWeight: 900, color: darkMode ? undefined : '#fff', lineHeight: 1 }}>
                          {percent}
                        </div>
                        <div style={{ fontSize: 14, color: darkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.9)', marginTop: 6, fontWeight: 600 }}>
                          SCORE
                        </div>
                      </div>
                    )}
                    size={170}
                  />
                </div>

                <div style={{
                  marginTop: 24,
                  background: darkMode ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  padding: '18px',
                  backdropFilter: 'blur(10px)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                }}>
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div style={{ textAlign: 'left' }}>
                        <Text style={{ color: darkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.8)', fontSize: 12, display: 'block' }}>
                          Completed
                        </Text>
                        <Text style={{ color: darkMode ? undefined : '#fff', fontSize: 22, fontWeight: 700, display: 'block' }}>
                          {stats.completed}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'right' }}>
                        <Text style={{ color: darkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.8)', fontSize: 12, display: 'block' }}>
                          Total
                        </Text>
                        <Text style={{ color: darkMode ? undefined : '#fff', fontSize: 22, fontWeight: 700, display: 'block' }}>
                          {stats.total}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginTop: 16 }}>
                  {stats.productivity === 'up' && (
                    <div style={{
                      background: 'rgba(82, 196, 26, 0.25)',
                      border: '2px solid rgba(82, 196, 26, 0.6)',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}>
                      <ArrowUpOutlined style={{ color: '#95de64', fontSize: 18 }} />
                      <Text style={{ color: darkMode ? undefined : '#fff', fontSize: 14, fontWeight: 600 }}>
                        Excellent Progress! 🚀
                      </Text>
                    </div>
                  )}
                  {stats.productivity === 'down' && (
                    <div style={{
                      background: 'rgba(250, 173, 20, 0.25)',
                      border: '2px solid rgba(250, 173, 20, 0.6)',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}>
                      <ArrowDownOutlined style={{ color: '#ffc53d', fontSize: 18 }} />
                      <Text style={{ color: darkMode ? undefined : '#fff', fontSize: 14, fontWeight: 600 }}>
                        Focus Mode 💪
                      </Text>
                    </div>
                  )}
                  {stats.productivity === 'neutral' && (
                    <div style={{
                      background: 'rgba(24, 144, 255, 0.25)',
                      border: '2px solid rgba(24, 144, 255, 0.6)',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}>
                      <ThunderboltOutlined style={{ color: '#69c0ff', fontSize: 18 }} />
                      <Text style={{ color: darkMode ? undefined : '#fff', fontSize: 14, fontWeight: 600 }}>
                        Steady Progress ⚡
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FireOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text strong style={{ fontSize: 17 }}>High Priority</Text>
              </Space>
            }
            hoverable={false}
            extra={
              <Badge
                count={stats.highPriority}
                style={{
                  backgroundColor: '#ff4d4f',
                  boxShadow: '0 2px 8px rgba(255,77,79,0.3)',
                }}
              />
            }
            style={{
              height: '100%',
              borderRadius: '16px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : undefined,
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
            className="modern-dashboard-card"
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
                    description={
                      <Space direction="vertical" size={4}>
                        <BulbOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                        <Text type="secondary">All clear! No urgent tasks</Text>
                      </Space>
                    }
                    style={{ padding: '32px 0' }}
                  />
                )
              }}
              renderItem={(task) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '14px 0',
                    transition: 'all 0.2s',
                    borderRadius: '8px',
                  }}
                  onClick={() => onTaskClick?.(task)}
                  className="task-list-item-modern"
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: '#ff4d4f',
                          boxShadow: '0 2px 8px rgba(255,77,79,0.3)',
                        }}
                        size={40}
                        icon={<FireOutlined />}
                      />
                    }
                    title={
                      <Tooltip title={task.title}>
                        <Text strong style={{ fontSize: 14, display: 'block' }} ellipsis>
                          {task.title}
                        </Text>
                      </Tooltip>
                    }
                    description={
                      <Space size={6} wrap style={{ marginTop: 4 }}>
                        {task.category && (
                          <Tag
                            color={getCategoryColor(task.category)}
                            style={{
                              fontSize: 11,
                              borderRadius: '6px',
                              border: 'none',
                            }}
                          >
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

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CalendarOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text strong style={{ fontSize: 17 }}>Due Soon</Text>
              </Space>
            }
            hoverable={false}
            extra={
              <Badge
                count={stats.dueSoon.length}
                style={{
                  backgroundColor: '#1890ff',
                  boxShadow: '0 2px 8px rgba(24,144,255,0.3)',
                }}
              />
            }
            style={{
              height: '100%',
              borderRadius: '16px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : undefined,
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
            className="modern-dashboard-card"
          >
            <List
              size="small"
              dataSource={stats.dueSoon.slice(0, DISPLAY_LIMITS.DUE_SOON_TASKS)}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical" size={4}>
                        <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                        <Text type="secondary">Nothing due soon</Text>
                      </Space>
                    }
                    style={{ padding: '32px 0' }}
                  />
                )
              }}
              renderItem={(task) => {
                const daysUntil = dayjs(task.dueDate).diff(dayjs(), 'day');
                const isUrgent = daysUntil <= 2;

                return (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '14px 0',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                    }}
                    onClick={() => onTaskClick?.(task)}
                    className="task-list-item-modern"
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: isUrgent ? '#faad14' : '#1890ff',
                            boxShadow: `0 2px 8px ${isUrgent ? 'rgba(250,173,20,0.3)' : 'rgba(24,144,255,0.3)'}`,
                          }}
                          size={40}
                          icon={isUrgent ? <ExclamationCircleOutlined /> : <CalendarOutlined />}
                        />
                      }
                      title={
                        <Tooltip title={task.title}>
                          <Text strong style={{ fontSize: 14, display: 'block' }} ellipsis>
                            {task.title}
                          </Text>
                        </Tooltip>
                      }
                      description={
                        <Space size={6} wrap style={{ marginTop: 4 }}>
                          <Tag
                            color={getPriorityColor(task.priority)}
                            style={{
                              fontSize: 11,
                              borderRadius: '6px',
                              border: 'none',
                            }}
                          >
                            {task.priority}
                          </Tag>
                          {task.dueDate && (
                            <Text type={isUrgent ? 'warning' : 'secondary'} strong={isUrgent} style={{ fontSize: 11 }}>
                              Due {dayjs(task.dueDate).fromNow()}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ThunderboltOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text strong style={{ fontSize: 17 }}>Active Today</Text>
              </Space>
            }
            hoverable={false}
            extra={
              <Badge
                count={stats.activeTodayTasks.length}
                style={{
                  backgroundColor: '#f5576c',
                  boxShadow: '0 2px 8px rgba(245,87,108,0.3)',
                }}
              />
            }
            style={{
              height: '100%',
              borderRadius: '16px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : undefined,
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
            className="modern-dashboard-card"
          >
            <List
              size="small"
              dataSource={stats.activeTodayTasks.slice(0, 4)}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical" size={4}>
                        <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                        <Text type="secondary">No active tasks for today</Text>
                      </Space>
                    }
                    style={{ padding: '32px 0' }}
                  />
                )
              }}
              renderItem={(task) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '14px 0',
                    transition: 'all 0.2s',
                    borderRadius: '8px',
                  }}
                  onClick={() => onTaskClick?.(task)}
                  className="task-list-item-modern"
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: getPriorityColor(task.priority),
                          boxShadow: `0 2px 8px ${getPriorityColor(task.priority)}50`,
                        }}
                        size={40}
                      >
                        {task.status === TaskStatus.IN_PROGRESS ? '⚡' : '📅'}
                      </Avatar>
                    }
                    title={
                      <Tooltip title={task.title}>
                        <Text strong style={{ fontSize: 14, display: 'block' }} ellipsis>
                          {task.title}
                        </Text>
                      </Tooltip>
                    }
                    description={
                      <Space size={6} wrap style={{ marginTop: 4 }}>
                        <Tag
                          color={task.status === TaskStatus.IN_PROGRESS ? 'processing' : 'default'}
                          style={{
                            fontSize: 11,
                            borderRadius: '6px',
                            border: 'none',
                          }}
                        >
                          {task.status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Due Today'}
                        </Tag>
                        {task.category && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {getCategoryEmoji(task.category)} {task.category}
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

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FolderOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text strong style={{ fontSize: 17 }}>Top Categories</Text>
              </Space>
            }
            hoverable={false}
            style={{
              height: '100%',
              borderRadius: '16px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : undefined,
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
            className="modern-dashboard-card"
          >
            {stats.topCategories.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size={4}>
                    <BulbOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                    <Text type="secondary">No categories yet</Text>
                  </Space>
                }
                style={{ padding: '32px 0' }}
              />
            ) : (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {stats.topCategories.map(([category, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / (stats.total - stats.completed)) * 100) : 0;
                  const taskCategory = category as TaskCategory;
                  return (
                    <div key={category} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Space size={8}>
                          <span style={{ fontSize: 18 }}>{getCategoryEmoji(taskCategory)}</span>
                          <Text strong style={{ fontSize: 14, textTransform: 'capitalize' }}>
                            {category}
                          </Text>
                        </Space>
                        <Space size={8}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {count} tasks
                          </Text>
                          <Tag color={getCategoryColor(taskCategory)} style={{ fontSize: 11, borderRadius: 6 }}>
                            {percentage}%
                          </Tag>
                        </Space>
                      </div>
                      <Progress
                        percent={percentage}
                        strokeColor={getCategoryColor(taskCategory)}
                        showInfo={false}
                        strokeWidth={8}
                        style={{ marginBottom: 4 }}
                      />
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{
              borderRadius: '20px',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e8f4fd',
              boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(79, 172, 254, 0.08)',
              background: darkMode
                ? 'rgba(255, 255, 255, 0.04)'
                : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              height: '100%',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            styles={{ body: { padding: 28 } }}
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <Space align="center" size={12}>
                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '14px',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)',
                }}>
                  <RocketOutlined style={{ color: '#fff', fontSize: 26 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
                    This Week's Activity
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Track your progress
                  </Text>
                </div>
              </Space>

              <Row gutter={12}>
                <Col span={12}>
                  <div style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.1) 100%)'
                      : 'linear-gradient(135deg, #4facfe15 0%, #00f2fe08 100%)',
                    borderRadius: '14px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    border: darkMode ? '1px solid rgba(79, 172, 254, 0.2)' : '1px solid #e0f3ff',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = darkMode
                      ? '0 8px 20px rgba(79, 172, 254, 0.3)'
                      : '0 4px 12px rgba(79, 172, 254, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <PlusCircleOutlined style={{
                      fontSize: 20,
                      color: '#4facfe',
                      marginBottom: 8,
                      display: 'block'
                    }} />
                    <Text style={{
                      color: darkMode ? 'rgba(255, 255, 255, 0.5)' : '#8c8c8c',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 500
                    }}>
                      Created
                    </Text>
                    <Title level={1} style={{
                      margin: 0,
                      fontSize: 40,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {stats.createdThisWeek}
                    </Title>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(17, 153, 142, 0.2) 0%, rgba(56, 239, 125, 0.1) 100%)'
                      : 'linear-gradient(135deg, #11998e15 0%, #38ef7d08 100%)',
                    borderRadius: '14px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    border: darkMode ? '1px solid rgba(56, 239, 125, 0.2)' : '1px solid #d9f7e8',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = darkMode
                      ? '0 8px 20px rgba(56, 239, 125, 0.3)'
                      : '0 4px 12px rgba(56, 239, 125, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <CheckCircleOutlined style={{
                      fontSize: 20,
                      color: '#38ef7d',
                      marginBottom: 8,
                      display: 'block'
                    }} />
                    <Text style={{
                      color: darkMode ? 'rgba(255, 255, 255, 0.5)' : '#8c8c8c',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 500
                    }}>
                      Done
                    </Text>
                    <Title level={1} style={{
                      margin: 0,
                      fontSize: 40,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {stats.completedThisWeek}
                    </Title>
                  </div>
                </Col>
              </Row>

              <div style={{
                background: darkMode
                  ? 'rgba(79, 172, 254, 0.1)'
                  : '#f0f9ff',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: darkMode ? '1px solid rgba(79, 172, 254, 0.15)' : '1px solid #d6f0ff',
              }}>
                <Space size={8}>
                  <TrophyOutlined style={{ color: '#4facfe', fontSize: 18 }} />
                  <Text style={{ fontSize: 14, fontWeight: 500 }}>
                    Week Performance
                  </Text>
                </Space>
                <Tag
                  icon={stats.completedThisWeek >= stats.createdThisWeek ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  color={stats.completedThisWeek >= stats.createdThisWeek ? 'success' : 'warning'}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 14px',
                    borderRadius: '8px'
                  }}
                >
                  {stats.completedThisWeek >= stats.createdThisWeek ? 'On Track' : 'Keep Going'}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{
              borderRadius: '20px',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #fff4e6',
              boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(254, 202, 87, 0.08)',
              background: darkMode
                ? 'rgba(255, 255, 255, 0.04)'
                : 'linear-gradient(135deg, #ffffff 0%, #fff9f0 100%)',
              height: '100%',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <Space align="center" size={12}>
                <div style={{
                  background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                  borderRadius: '14px',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(254, 202, 87, 0.3)',
                }}>
                  <StarOutlined style={{ color: '#fff', fontSize: 26 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 18, display: 'block' }}>Quick Stats</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>Key metrics at a glance</Text>
                </div>
              </Space>

              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.2) 0%, rgba(255, 77, 79, 0.1) 100%)'
                      : 'linear-gradient(135deg, #ff4d4f15 0%, #ff4d4f08 100%)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 77, 79, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Space align="center" size={10}>
                    <ClockCircleOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
                    <Text style={{ color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)', fontSize: 14, fontWeight: 500 }}>
                      Due Today
                    </Text>
                  </Space>
                  <div style={{
                    background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {stats.dueToday}
                  </div>
                </div>

                <div
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(250, 84, 28, 0.2) 0%, rgba(250, 84, 28, 0.1) 100%)'
                      : 'linear-gradient(135deg, #fa541c15 0%, #fa541c08 100%)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(250, 84, 28, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 84, 28, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Space align="center" size={10}>
                    <FireOutlined style={{ fontSize: 18, color: '#fa541c' }} />
                    <Text style={{ color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)', fontSize: 14, fontWeight: 500 }}>
                      High Priority
                    </Text>
                  </Space>
                  <div style={{
                    background: 'linear-gradient(135deg, #fa541c 0%, #ff7a45 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {stats.highPriority}
                  </div>
                </div>

                <div
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(250, 140, 22, 0.2) 0%, rgba(250, 140, 22, 0.1) 100%)'
                      : 'linear-gradient(135deg, #fa8c1615 0%, #fa8c1608 100%)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(250, 140, 22, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 140, 22, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Space align="center" size={10}>
                    <WarningOutlined style={{ fontSize: 18, color: '#fa8c16' }} />
                    <Text style={{ color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)', fontSize: 14, fontWeight: 500 }}>
                      Overdue
                    </Text>
                  </Space>
                  <div style={{
                    background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {stats.overdue}
                  </div>
                </div>

                <div
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.2) 0%, rgba(82, 196, 26, 0.1) 100%)'
                      : 'linear-gradient(135deg, #52c41a15 0%, #52c41a08 100%)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(82, 196, 26, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Space align="center" size={10}>
                    <PercentageOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                    <Text style={{ color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)', fontSize: 14, fontWeight: 500 }}>
                      Completion Rate
                    </Text>
                  </Space>
                  <div style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {stats.completionRate}%
                  </div>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircleOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text strong style={{ fontSize: 17 }}>Recently Completed</Text>
              </Space>
            }
            extra={<StarOutlined style={{ color: '#faad14', fontSize: 20 }} />}
            style={{
              borderRadius: '16px',
              boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : undefined,
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
            className="modern-dashboard-card"
          >
            {stats.recentlyCompleted.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">No completed tasks yet</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Start completing tasks to see them here!</Text>
                  </Space>
                }
                style={{ padding: '48px 0' }}
              />
            ) : (
              <List
                grid={{
                  gutter: 20,
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
                    <div
                      className="completed-task-card"
                      onClick={() => onTaskClick?.(task)}
                      style={{
                        background: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#fff',
                        borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                        borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                        borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                        borderRadius: '12px',
                        padding: 16,
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        strong
                        style={{ marginBottom: 16, fontSize: 14, minHeight: 44, lineHeight: 1.6 }}
                      >
                        {task.title}
                      </Paragraph>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {task.category && (
                          <Tag
                            color={getCategoryColor(task.category)}
                            style={{
                              fontSize: 11,
                              borderRadius: '6px',
                              border: 'none',
                            }}
                          >
                            {getCategoryEmoji(task.category)} {task.category}
                          </Tag>
                        )}
                        <div>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginRight: 6 }} />
                          <Text type="success" style={{ fontSize: 12, fontWeight: 500 }}>
                            Completed
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(task.updatedAt).fromNow()}
                        </Text>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <style>{`
        .modern-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
        }

        [data-theme='dark'] .modern-stat-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.5) !important;
        }

        .task-list-item-modern:hover {
          background-color: rgba(0, 0, 0, 0.02);
          padding-left: 12px !important;
          padding-right: 12px !important;
          margin: 0 -12px;
        }

        [data-theme='dark'] .task-list-item-modern:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .completed-task-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }

        [data-theme='dark'] .completed-task-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
        }

        .ant-progress-circle .ant-progress-circle-path {
          transition: stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ant-card {
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ant-list-item {
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

DashboardComponent.displayName = 'Dashboard';

export const Dashboard = React.memo(DashboardComponent);
