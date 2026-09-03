import { getDB } from '../connection';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: number;
  color: string | null;
}

export const eventsQuery = {
  async getByDate(date: string): Promise<Event[]> {
    const db = await getDB();
    return await db.getAllAsync<Event>('SELECT * FROM events WHERE date = ? ORDER BY start_time ASC', [date]);
  },
  
  async create(event: Omit<Event, 'id'>): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO events (title, description, date, start_time, end_time, is_all_day, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [event.title, event.description, event.date, event.start_time, event.end_time, event.is_all_day, event.color]
    );
  },

  async getById(id: string): Promise<Event | null> {
    const db = await getDB();
    return await db.getFirstAsync<Event>('SELECT * FROM events WHERE id = ?', [id]);
  },

  async update(id: string, data: Partial<Omit<Event, 'id'>>): Promise<void> {
    const db = await getDB();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.runAsync(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM events WHERE id = ?', [id]);
  },

  async getByMonth(year: number, month: number): Promise<{ date: string; count: number }[]> {
    const db = await getDB();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return await db.getAllAsync<{ date: string; count: number }>(
      `SELECT date, COUNT(*) as count FROM events WHERE date LIKE ? || '%' GROUP BY date`,
      [prefix]
    );
  },
};
