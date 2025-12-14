import React from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface DeleteConfirmModalProps {
  open: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  taskTitle,
  onConfirm,
  onCancel,
  loading,
}) => {
  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Delete Task</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
    >
      <div style={{ padding: '8px 0 24px' }}>
        <Paragraph style={{ fontSize: 15, marginBottom: 16 }}>
          Are you sure you want to delete this task?
        </Paragraph>

        <div
          style={{
            padding: 16,
            backgroundColor: '#fff1f0',
            border: '1px solid #ffa39e',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <Text strong style={{ fontSize: 14, color: '#000' }}>
            {taskTitle}
          </Text>
        </div>

        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          This action cannot be undone. The task will be permanently deleted.
        </Paragraph>

        <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button onClick={onCancel} disabled={loading} size="large">
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={onConfirm}
            loading={loading}
            size="large"
            style={{ minWidth: 120 }}
          >
            Delete Task
          </Button>
        </Space>
      </div>
    </Modal>
  );
};
