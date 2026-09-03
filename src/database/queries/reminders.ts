import { getDB } from '../connection';

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  notify_before: number;
  is_recurring: number;
  recurrence_type: string | null;
  recurrence_end_date: string | null;
  is_active: number;
}

export const remindersQuery = {
  async getByDate(date: string): Promise<Reminder[]> {
    const db = await getDB();
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE date = ? AND is_active = 1 ORDER BY time ASC',
      [date]
    );
  },

  async getAll(): Promise<Reminder[]> {
    const db = await getDB();
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE is_active = 1 ORDER BY date ASC, time ASC'
    );
  },

  async getUpcoming(fromDate: string): Promise<Reminder[]> {
    const db = await getDB();
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE date >= ? AND is_active = 1 ORDER BY date ASC, time ASC LIMIT 20',
      [fromDate]
    );
  },

  async getById(id: string): Promise<Reminder | null> {
    const db = await getDB();
    return await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
  },

  async create(reminder: Omit<Reminder, 'id'>): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO reminders (title, description, date, time, notify_before, is_recurring, recurrence_type, recurrence_end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reminder.title, reminder.description, reminder.date, reminder.time, reminder.notify_before,
       reminder.is_recurring, reminder.recurrence_type, reminder.recurrence_end_date, reminder.is_active]
    );
  },

  async update(id: string, data: Partial<Omit<Reminder, 'id'>>): Promise<void> {
    const db = await getDB();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.runAsync(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const db = await getDB();
    await db.runAsync('UPDATE reminders SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  },
};
