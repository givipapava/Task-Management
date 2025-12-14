import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Row, Col, Card } from 'antd';
import {
  CalendarOutlined,
  FlagOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { TaskPriority } from '../types/task';
import type { Task, CreateTaskDto } from '../types/task';

const { TextArea } = Input;
const { Option } = Select;

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
  onSubmit: (values: CreateTaskDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  task,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        category: task.category,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, task, form]);

  const handleFinish = async (values: any) => {
    const taskData: CreateTaskDto = {
      title: values.title.trim(),
      description: values.description?.trim(),
      priority: values.priority,
      status: values.status,
      category: values.category,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
    };

    await onSubmit(taskData);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const priorityConfig = {
    high: {
      color: '#ff4d4f',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff4d4f 100%)',
      label: 'High Priority',
      icon: '🔥',
    },
    medium: {
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #ffc53d 0%, #faad14 100%)',
      label: 'Medium Priority',
      icon: '⚡',
    },
    low: {
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #73d13d 0%, #52c41a 100%)',
      label: 'Low Priority',
      icon: '✅',
    },
  };

  const categoryConfig = {
    work: { emoji: '💼', label: 'Work', color: '#1890ff' },
    personal: { emoji: '👤', label: 'Personal', color: '#722ed1' },
    shopping: { emoji: '🛒', label: 'Shopping', color: '#eb2f96' },
    health: { emoji: '💪', label: 'Health', color: '#52c41a' },
    other: { emoji: '📌', label: 'Other', color: '#8c8c8c' },
  };

  const statusConfig = {
    pending: { emoji: '📋', label: 'To Do', color: '#1890ff' },
    in_progress: { emoji: '⏳', label: 'In Progress', color: '#faad14' },
    completed: { emoji: '✅', label: 'Completed', color: '#52c41a' },
  };

  return (
    <Modal
      title={
        <Space>
          <RocketOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {task ? 'Edit Task' : 'Create New Task'}
          </span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={720}
      destroyOnHidden
      centered
      styles={{
        body: { paddingTop: 24, maxHeight: '80vh', overflow: 'auto' },
      }}
    >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            priority: TaskPriority.MEDIUM,
          }}
          requiredMark="optional"
        >
          {/* Task Title */}
          <Form.Item
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Task Title
              </span>
            }
            name="title"
            rules={[
              { required: true, message: 'Please enter a task title' },
              { max: 100, message: 'Title must be less than 100 characters' },
              { whitespace: true, message: 'Title cannot be empty' },
            ]}
          >
            <Input
              placeholder="What needs to be done?"
              disabled={loading}
              size="large"
              autoFocus
              style={{
                fontSize: 15,
                borderRadius: 8,
                borderWidth: 2,
              }}
              prefix={<CheckCircleOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>

          {task && (
            <Form.Item
              label={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  <CheckCircleOutlined style={{ marginRight: 6 }} />
                  Status
                </span>
              }
              name="status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select
                placeholder="Select status"
                disabled={loading}
                size="large"
                style={{ borderRadius: 8 }}
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Option key={key} value={key}>
                    <Space>
                      <span style={{ fontSize: 16 }}>{config.emoji}</span>
                      <span>{config.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Priority and Category Row */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    <FlagOutlined style={{ marginRight: 6 }} />
                    Priority Level
                  </span>
                }
                name="priority"
                rules={[{ required: true, message: 'Please select a priority' }]}
              >
                <Select
                  placeholder="Select priority"
                  disabled={loading}
                  size="large"
                  style={{ borderRadius: 8 }}
                  optionLabelProp="label"
                >
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <Option
                      key={key}
                      value={key}
                      label={
                        <Space>
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </Space>
                      }
                    >
                      <Card
                        size="small"
                        style={{
                          background: config.gradient,
                          border: 'none',
                          marginBottom: 4,
                        }}
                        bodyStyle={{ padding: '8px 12px' }}
                      >
                        <Space>
                          <span style={{ fontSize: 18 }}>{config.icon}</span>
                          <span style={{ color: 'white', fontWeight: 600 }}>
                            {config.label}
                          </span>
                        </Space>
                      </Card>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    <FolderOutlined style={{ marginRight: 6 }} />
                    Category
                  </span>
                }
                name="category"
              >
                <Select
                  placeholder="Select category (optional)"
                  disabled={loading}
                  allowClear
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Space>
                        <span style={{ fontSize: 16 }}>{config.emoji}</span>
                        <span>{config.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Due Date */}
          <Form.Item
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Due Date
              </span>
            }
            name="dueDate"
          >
            <DatePicker
              style={{ width: '100%', borderRadius: 8 }}
              placeholder="Select due date (optional)"
              disabled={loading}
              format="MMMM DD, YYYY"
              size="large"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Description
              </span>
            }
            name="description"
            rules={[{ max: 500, message: 'Description must be less than 500 characters' }]}
          >
            <TextArea
              rows={4}
              placeholder="Add more details about this task (optional)"
              disabled={loading}
              showCount
              maxLength={500}
              style={{
                fontSize: 14,
                borderRadius: 8,
              }}
            />
          </Form.Item>

          {/* Action Buttons */}
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="middle">
              <Button
                onClick={handleCancel}
                disabled={loading}
                size="large"
                style={{
                  minWidth: 100,
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={task ? <CheckCircleOutlined /> : <RocketOutlined />}
                style={{
                  minWidth: 140,
                }}
              >
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
    </Modal>
  );
};
