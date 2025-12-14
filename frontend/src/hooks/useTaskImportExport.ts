import { useCallback } from 'react';
import { message, Modal } from 'antd';
import { saveAs } from 'file-saver';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import type { Task } from '../types/task';
import { TaskArraySchema } from '../schemas/taskSchema';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useTaskImportExport = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const fileName = `tasks-export-${dayjs().format('YYYY-MM-DD')}.json`;
    saveAs(dataBlob, fileName);
    message.success('Tasks exported successfully!');
  }, [tasks]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        message.error('File too large. Maximum size is 5MB.');
        return;
      }

      try {
        const text = await file.text();

        let rawData;
        try {
          rawData = JSON.parse(text);
        } catch {
          message.error('Invalid JSON format.');
          return;
        }

        const validationResult = TaskArraySchema.safeParse(rawData);
        if (!validationResult.success) {
          console.error('Validation errors:', validationResult.error.issues);
          message.error(
            `Invalid task data format: ${validationResult.error.issues[0]?.message || 'Unknown error'}`
          );
          return;
        }

        const sanitizedTasks = validationResult.data.map((task) => ({
          ...task,
          title: DOMPurify.sanitize(task.title, { ALLOWED_TAGS: [] }),
          description: task.description
            ? DOMPurify.sanitize(task.description, { ALLOWED_TAGS: [] })
            : undefined,
        }));

        const existingIds = new Set(tasks.map((t) => t.id));
        const hasConflicts = sanitizedTasks.some((t) => t.id && existingIds.has(t.id));

        if (hasConflicts) {
          Modal.confirm({
            title: 'Duplicate tasks found',
            content: 'Some imported tasks have IDs that already exist. Do you want to merge them?',
            okText: 'Merge',
            cancelText: 'Cancel',
            onOk: () => {
              const updatedTasks = mergeTasks(tasks, sanitizedTasks);
              setTasks(updatedTasks);
              message.success(`Successfully imported ${sanitizedTasks.length} tasks!`);
            },
          });
        } else {
          const newTasks = sanitizedTasks.map((t) => ({
            ...t,
            id: t.id || crypto.randomUUID(),
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: t.updatedAt || new Date().toISOString(),
          })) as Task[];

          setTasks([...tasks, ...newTasks]);
          message.success(`Successfully imported ${sanitizedTasks.length} tasks!`);
        }
      } catch (error) {
        console.error('Import error:', error);
        message.error('Failed to import tasks. Please try again.');
      }
    };

    input.click();
  }, [tasks, setTasks]);

  return {
    handleExport,
    handleImport,
  };
};

function mergeTasks(existingTasks: Task[], importedTasks: any[]): Task[] {
  const taskMap = new Map(existingTasks.map((t) => [t.id, t]));

  importedTasks.forEach((task) => {
    if (task.id) {
      taskMap.set(task.id, {
        ...task,
        id: task.id,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task);
    } else {
      taskMap.set(crypto.randomUUID(), {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task);
    }
  });

  return Array.from(taskMap.values());
}
