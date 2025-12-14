import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { TaskPriority, TaskStatus } from '../types/task';
import type { Task } from '../types/task';
import dayjs from 'dayjs';

interface TaskStatisticsProps {
  tasks: Task[];
}

export const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const overdue = tasks.filter(t =>
      t.status === TaskStatus.PENDING &&
      t.dueDate &&
      dayjs(t.dueDate).isBefore(dayjs(), 'day')
    ).length;

    const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
    const mediumPriority = tasks.filter(t => t.priority === TaskPriority.MEDIUM).length;
    const lowPriority = tasks.filter(t => t.priority === TaskPriority.LOW).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
    };
  }, [tasks]);

  // Priority distribution data for pie chart
  const priorityData = [
    { type: 'High', value: stats.highPriority },
    { type: 'Medium', value: stats.mediumPriority },
    { type: 'Low', value: stats.lowPriority },
  ].filter(item => item.value > 0);

  // Status distribution data for column chart
  const statusData = [
    { status: 'Completed', count: stats.completed, type: 'Completed' },
    { status: 'Pending', count: stats.pending, type: 'Pending' },
    { status: 'Overdue', count: stats.overdue, type: 'Overdue' },
  ];

  const pieConfig = {
    data: priorityData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'bottom',
      },
    },
    color: ({ type }: { type: string }) => {
      if (type === 'High') return '#ff4d4f';
      if (type === 'Medium') return '#faad14';
      return '#1890ff';
    },
  };

  const columnConfig = {
    data: statusData,
    xField: 'status',
    yField: 'count',
    colorField: 'type',
    color: ({ type }: { type: string }) => {
      if (type === 'Completed') return '#52c41a';
      if (type === 'Pending') return '#1890ff';
      return '#ff4d4f';
    },
    label: {
      text: 'count',
      position: 'top' as const,
      style: {
        fill: '#000',
        opacity: 0.6,
      },
    },
    legend: false,
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Summary Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={stats.overdue}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Completion Rate */}
        <Col xs={24} md={8}>
          <Card title="Completion Rate" size="small">
            <Progress
              type="circle"
              percent={stats.completionRate}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={(percent) => `${percent}%`}
            />
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' }}>
              {stats.completed} of {stats.total} tasks completed
            </div>
          </Card>
        </Col>

        {/* Priority Distribution */}
        <Col xs={24} md={8}>
          <Card title="Priority Distribution" size="small">
            {priorityData.length > 0 ? (
              <Pie {...pieConfig} height={200} />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                No tasks to display
              </div>
            )}
          </Card>
        </Col>

        {/* Status Overview */}
        <Col xs={24} md={8}>
          <Card title="Status Overview" size="small">
            <Column {...columnConfig} height={200} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
