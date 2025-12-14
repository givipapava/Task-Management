import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Dashboard } from './Dashboard';
import { TaskList } from './TaskList';
import { KanbanBoard } from './KanbanBoard';
import { TaskStatistics } from './TaskStatistics';
import { TaskFilters } from './TaskFilters';
import { AdvancedFilters } from './AdvancedFilters';
import { DashboardSkeleton, TaskListSkeleton, KanbanSkeleton } from './LoadingSkeleton';
import type { ViewMode } from './AppSidebar';
import type { Task } from '../types/task';
import type { FilterStatus } from './TaskFilters';
import type { AdvancedFilterOptions } from './AdvancedFilters';
import { TaskStatus } from '../types/task';

const { Content } = Layout;

interface TaskCounts {
  all: number;
  pending: number;
  completed: number;
}

interface MainContentProps {
  viewMode: ViewMode;
  loading: boolean;
  tasks: Task[];
  filteredTasks: Task[];
  taskCounts: TaskCounts;
  searchQuery: string;
  filterStatus: FilterStatus;
  advancedFilters: AdvancedFilterOptions;
  onSearchChange: (query: string) => void;
  onFilterChange: (status: FilterStatus) => void;
  onAdvancedFilterChange: (filters: AdvancedFilterOptions) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const MainContent: React.FC<MainContentProps> = React.memo(({
  viewMode,
  loading,
  tasks,
  filteredTasks,
  taskCounts,
  searchQuery,
  filterStatus,
  advancedFilters,
  onSearchChange,
  onFilterChange,
  onAdvancedFilterChange,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onStatusChange,
}) => {
  const getViewTitle = () => {
    switch (viewMode) {
      case 'dashboard':
        return 'Dashboard';
      case 'list':
        return 'Task List';
      case 'kanban':
        return 'Kanban Board';
      case 'analytics':
        return 'Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Content style={{
      padding: '24px',
      minHeight: 280,
      overflow: 'auto',
      height: 'calc(100vh - 64px)'
    }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <HomeOutlined /> },
          { title: getViewTitle() },
        ]}
      />

      {loading ? (
        <>
          {viewMode === 'dashboard' && <DashboardSkeleton />}
          {viewMode === 'list' && <TaskListSkeleton />}
          {viewMode === 'kanban' && <KanbanSkeleton />}
          {viewMode === 'analytics' && <DashboardSkeleton />}
        </>
      ) : (
        <>
          {viewMode === 'dashboard' && (
            <Dashboard tasks={tasks} onTaskClick={onEditTask} />
          )}

          {viewMode === 'list' && (
            <>
              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                filterStatus={filterStatus}
                onFilterChange={onFilterChange}
                taskCounts={taskCounts}
              />

              <AdvancedFilters
                filters={advancedFilters}
                onFilterChange={onAdvancedFilterChange}
              />

              <TaskList
                tasks={filteredTasks}
                loading={loading}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleStatus={onToggleStatus}
              />
            </>
          )}

          {viewMode === 'kanban' && (
            <KanbanBoard
              tasks={filteredTasks}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          )}

          {viewMode === 'analytics' && (
            <TaskStatistics tasks={tasks} />
          )}
        </>
      )}
    </Content>
  );
});

MainContent.displayName = 'MainContent';
