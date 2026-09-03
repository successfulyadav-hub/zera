import { getDB } from '../connection';

export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  date: string;
  is_completed: number;
  completed_at: string | null;
  sort_order: number;
  priority: TaskPriority;
  due_time: string | null;
}

export const tasksQuery = {
  async getByDate(date: string): Promise<Task[]> {
    const db = await getDB();
    return await db.getAllAsync<Task>(
      `SELECT * FROM tasks WHERE date = ?
       ORDER BY is_completed ASC, sort_order ASC, created_at DESC`,
      [date]
    );
  },

  async create(title: string, date: string, priority: TaskPriority = 'none', dueTime?: string | null): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO tasks (title, date, priority, due_time) VALUES (?, ?, ?, ?)',
      [title, date, priority, dueTime ?? null]
    );
  },

  async toggleComplete(id: string, isCompleted: boolean): Promise<void> {
    const db = await getDB();
    const completedAt = isCompleted ? new Date().toISOString() : null;
    await db.runAsync(
      'UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?',
      [isCompleted ? 1 : 0, completedAt, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  },

  async updateTitle(id: string, title: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'UPDATE tasks SET title = ?, updated_at = datetime("now") WHERE id = ?',
      [title, id]
    );
  },

  async updatePriority(id: string, priority: TaskPriority): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'UPDATE tasks SET priority = ?, updated_at = datetime("now") WHERE id = ?',
      [priority, id]
    );
  },

  async updateDueTime(id: string, dueTime: string | null): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'UPDATE tasks SET due_time = ?, updated_at = datetime("now") WHERE id = ?',
      [dueTime, id]
    );
  },

  async reorder(ids: string[]): Promise<void> {
    const db = await getDB();
    for (let i = 0; i < ids.length; i++) {
      await db.runAsync('UPDATE tasks SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }
  },

  async getByMonth(year: number, month: number): Promise<{ date: string }[]> {
    const db = await getDB();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return await db.getAllAsync<{ date: string }>(
      `SELECT DISTINCT date FROM tasks WHERE date LIKE ? || '%'`,
      [prefix]
    );
  },

  async getCompletionStats(startDate: string, endDate: string): Promise<{ date: string; total: number; completed: number }[]> {
    const db = await getDB();
    return await db.getAllAsync<{ date: string; total: number; completed: number }>(
      `SELECT date, COUNT(*) as total, SUM(is_completed) as completed
       FROM tasks WHERE date >= ? AND date <= ?
       GROUP BY date ORDER BY date ASC`,
      [startDate, endDate]
    );
  },

  async getStreak(): Promise<number> {
    const db = await getDB();
    const rows = await db.getAllAsync<{ date: string; total: number; completed: number }>(
      `SELECT date, COUNT(*) as total, SUM(is_completed) as completed
       FROM tasks GROUP BY date
       HAVING total > 0 AND total = completed
       ORDER BY date DESC`
    );

    if (rows.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < rows.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];

      if (rows[i].date === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};
