import React from 'react';
import { Layout, Space, Button, Switch, Avatar, Dropdown, Typography } from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: (checked: boolean) => void;
  onCreateTask: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = React.memo(({
  darkMode,
  onToggleDarkMode,
  onCreateTask,
  onExport,
  onImport,
}) => {
  const userMenuItems = [
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: darkMode ? '#001529' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Title level={4} style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>
        Task Manager
      </Title>

      <Space size="middle">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateTask}
        >
          New Task
        </Button>

        <Button
          icon={<DownloadOutlined />}
          onClick={onExport}
        >
          Export
        </Button>

        <Button
          icon={<UploadOutlined />}
          onClick={onImport}
        >
          Import
        </Button>

        <Space>
          <SunOutlined style={{ fontSize: 16 }} />
          <Switch
            checked={darkMode}
            onChange={onToggleDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </Space>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar
            style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </Header>
  );
});

AppHeader.displayName = 'AppHeader';
