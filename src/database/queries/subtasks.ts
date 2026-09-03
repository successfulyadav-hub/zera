import { getDB } from '../connection';

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: number;
  sort_order: number;
}

export const subtasksQuery = {
  async getByTaskId(taskId: string): Promise<Subtask[]> {
    const db = await getDB();
    return await db.getAllAsync<Subtask>(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, created_at ASC',
      [taskId]
    );
  },

  async create(taskId: string, title: string): Promise<void> {
    const db = await getDB();
    const maxOrder = await db.getFirstAsync<{ m: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as m FROM subtasks WHERE task_id = ?',
      [taskId]
    );
    await db.runAsync(
      'INSERT INTO subtasks (task_id, title, sort_order) VALUES (?, ?, ?)',
      [taskId, title, (maxOrder?.m ?? -1) + 1]
    );
  },

  async toggleComplete(id: string, isCompleted: boolean): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'UPDATE subtasks SET is_completed = ? WHERE id = ?',
      [isCompleted ? 1 : 0, id]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM subtasks WHERE id = ?', [id]);
  },

  async deleteByTaskId(taskId: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM subtasks WHERE task_id = ?', [taskId]);
  },

  async getCountByTaskId(taskId: string): Promise<{ total: number; completed: number }> {
    const db = await getDB();
    const row = await db.getFirstAsync<{ total: number; completed: number }>(
      'SELECT COUNT(*) as total, SUM(is_completed) as completed FROM subtasks WHERE task_id = ?',
      [taskId]
    );
    return { total: row?.total ?? 0, completed: row?.completed ?? 0 };
  },

  async getCountsByTaskIds(taskIds: string[]): Promise<Record<string, { total: number; completed: number }>> {
    if (taskIds.length === 0) return {};
    const db = await getDB();
    const placeholders = taskIds.map(() => '?').join(',');
    const rows = await db.getAllAsync<{ task_id: string; total: number; completed: number }>(
      `SELECT task_id, COUNT(*) as total, SUM(is_completed) as completed
       FROM subtasks WHERE task_id IN (${placeholders}) GROUP BY task_id`,
      taskIds
    );
    const map: Record<string, { total: number; completed: number }> = {};
    for (const r of rows) {
      map[r.task_id] = { total: r.total, completed: r.completed ?? 0 };
    }
    return map;
  },
};
