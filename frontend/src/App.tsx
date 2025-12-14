import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, FloatButton, theme, App as AntApp } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTasks } from './hooks/useTasks';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useTaskModals } from './hooks/useTaskModals';
import { useTaskImportExport } from './hooks/useTaskImportExport';
import { AppHeader } from './components/AppHeader';
import { AppSidebar, type ViewMode } from './components/AppSidebar';
import { MainContent } from './components/MainContent';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { CreateTaskDto } from './types/task';

dayjs.extend(relativeTime);

interface AppContentProps {
  darkMode: boolean;
  onToggleDarkMode: (mode: boolean) => void;
}

function AppContent({ darkMode, onToggleDarkMode }: AppContentProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getViewModeFromPath = (pathname: string): ViewMode => {
    if (pathname === '/tasks') return 'list';
    if (pathname === '/board') return 'kanban';
    if (pathname === '/analytics') return 'analytics';
    return 'dashboard';
  };

  const viewMode = getViewModeFromPath(location.pathname);

  const handleViewModeChange = (mode: ViewMode) => {
    const pathMap: Record<ViewMode, string> = {
      dashboard: '/',
      list: '/tasks',
      kanban: '/board',
      analytics: '/analytics',
    };
    navigate(pathMap[mode]);
  };

  const {
    tasks,
    loading,
    submitting,
    setTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    changeTaskStatus,
  } = useTasks();

  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    advancedFilters,
    setAdvancedFilters,
    filteredTasks,
    taskCounts,
  } = useTaskFilters(tasks);

  const {
    showTaskModal,
    setShowTaskModal,
    showDeleteModal,
    editingTask,
    taskToDelete,
    handleEditTask,
    handleCancelEdit,
    handleDeleteTask,
    handleCancelDelete,
    openCreateModal,
  } = useTaskModals();

  const { handleExport, handleImport } = useTaskImportExport(tasks, setTasks);

  const handleCreateOrUpdateTask = async (data: CreateTaskDto) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setShowTaskModal(false);
    handleCancelEdit();
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      handleCancelDelete();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar
        collapsed={collapsed}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onCollapse={setCollapsed}
      />

      <Layout>
        <AppHeader
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onCreateTask={openCreateModal}
          onExport={handleExport}
          onImport={handleImport}
        />

        <MainContent
          viewMode={viewMode}
          loading={loading}
          tasks={tasks}
          filteredTasks={filteredTasks}
          taskCounts={taskCounts}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          advancedFilters={advancedFilters}
          darkMode={darkMode}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterStatus}
          onAdvancedFilterChange={setAdvancedFilters}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleStatus={toggleTaskStatus}
          onStatusChange={changeTaskStatus}
        />
      </Layout>

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={openCreateModal}
        tooltip="Create New Task"
      />

      <TaskModal
        open={showTaskModal}
        task={editingTask}
        onSubmit={handleCreateOrUpdateTask}
        onCancel={handleCancelEdit}
        loading={submitting}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        taskTitle={taskToDelete?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Layout>
  );
}

function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <AntApp message={{ top: 80, maxCount: 3 }}>
          <Routes>
            <Route path="/" element={<AppContent darkMode={darkMode} onToggleDarkMode={setDarkMode} />} />
            <Route path="/tasks" element={<AppContent darkMode={darkMode} onToggleDarkMode={setDarkMode} />} />
            <Route path="/board" element={<AppContent darkMode={darkMode} onToggleDarkMode={setDarkMode} />} />
            <Route path="/analytics" element={<AppContent darkMode={darkMode} onToggleDarkMode={setDarkMode} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
