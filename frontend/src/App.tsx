import { useState } from 'react';
import { ConfigProvider, Layout, FloatButton, theme } from 'antd';
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

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

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

  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <Layout style={{ minHeight: '100vh' }}>
          <AppSidebar
            collapsed={collapsed}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCollapse={setCollapsed}
          />

          <Layout>
            <AppHeader
              darkMode={darkMode}
              onToggleDarkMode={setDarkMode}
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
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
