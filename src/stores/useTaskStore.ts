import { create } from 'zustand';
import { tasksQuery, type Task, type TaskPriority } from '../database/queries/tasks';

interface TaskStore {
  tasks: Task[];
  streak: number;
  loadTasks: (date: string) => Promise<void>;
  addTask: (title: string, date: string, priority?: TaskPriority) => Promise<void>;
  toggleComplete: (id: string, isCompleted: boolean, date: string) => Promise<void>;
  deleteTask: (id: string, date: string) => Promise<void>;
  updatePriority: (id: string, priority: TaskPriority, date: string) => Promise<void>;
  reorderTasks: (ids: string[]) => Promise<void>;
  loadStreak: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  streak: 0,
  loadTasks: async (date) => {
    const data = await tasksQuery.getByDate(date);
    set({ tasks: data });
  },
  addTask: async (title, date, priority = 'none') => {
    await tasksQuery.create(title, date, priority);
    const data = await tasksQuery.getByDate(date);
    set({ tasks: data });
  },
  toggleComplete: async (id, isCompleted, date) => {
    set((state) => ({
      tasks: state.tasks
        .map((t) => (t.id === id ? { ...t, is_completed: isCompleted ? 1 : 0 } : t))
        .sort((a, b) => a.is_completed - b.is_completed),
    }));
    await tasksQuery.toggleComplete(id, isCompleted);
    const data = await tasksQuery.getByDate(date);
    set({ tasks: data });
  },
  deleteTask: async (id, date) => {
    await tasksQuery.delete(id);
    const data = await tasksQuery.getByDate(date);
    set({ tasks: data });
  },
  updatePriority: async (id, priority, date) => {
    await tasksQuery.updatePriority(id, priority);
    const data = await tasksQuery.getByDate(date);
    set({ tasks: data });
  },
  reorderTasks: async (ids) => {
    await tasksQuery.reorder(ids);
    set((state) => {
      const ordered = ids.map((id, i) => {
        const t = state.tasks.find((x) => x.id === id);
        return t ? { ...t, sort_order: i } : null;
      }).filter(Boolean) as Task[];
      return { tasks: ordered };
    });
  },
  loadStreak: async () => {
    const streak = await tasksQuery.getStreak();
    set({ streak });
  },
}));
