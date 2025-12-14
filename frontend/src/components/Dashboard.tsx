import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Typography, Empty, Badge, Space, Tooltip, Avatar } from 'antd';
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
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
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
