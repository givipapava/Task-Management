import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export type ViewMode = 'dashboard' | 'list' | 'kanban' | 'analytics';

interface AppSidebarProps {
  collapsed: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCollapse: (collapsed: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = React.memo(({
  collapsed,
  viewMode,
  onViewModeChange,
  onCollapse,
}) => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'list',
      icon: <UnorderedListOutlined />,
      label: 'Task List',
    },
    {
      key: 'kanban',
      icon: <AppstoreOutlined />,
      label: 'Kanban Board',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? 12 : 14,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {!collapsed && 'SD Task Management'}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[viewMode]}
        mode="inline"
        items={menuItems}
        onClick={({ key }) => onViewModeChange(key as ViewMode)}
      />
    </Sider>
  );
});

AppSidebar.displayName = 'AppSidebar';
