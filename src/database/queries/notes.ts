import { getDB } from '../connection';

export interface Note {
  id: string;
  date: string;
  title: string | null;
  content: string | null;
  page_number: number;
  is_pinned: number;
}

export const notesQuery = {
  async getByDate(date: string): Promise<Note[]> {
    const db = await getDB();
    return await db.getAllAsync<Note>(
      'SELECT * FROM notes WHERE date = ? ORDER BY is_pinned DESC, page_number ASC',
      [date]
    );
  },

  async save(date: string, content: string, title?: string | null, pageNumber: number = 1): Promise<string> {
    const db = await getDB();
    const existing = await db.getFirstAsync<Note>(
      'SELECT id FROM notes WHERE date = ? AND page_number = ?',
      [date, pageNumber]
    );
    if (existing) {
      await db.runAsync(
        'UPDATE notes SET content = ?, title = ?, updated_at = datetime("now") WHERE id = ?',
        [content, title ?? null, existing.id]
      );
      return existing.id;
    } else {
      const result = await db.runAsync(
        'INSERT INTO notes (date, content, title, page_number) VALUES (?, ?, ?, ?)',
        [date, content, title ?? null, pageNumber]
      );
      const row = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM notes WHERE rowid = ?',
        [result.lastInsertRowId]
      );
      return row?.id ?? '';
    }
  },

  async getById(id: string): Promise<Note | null> {
    const db = await getDB();
    return await db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', [id]);
  },

  async getAll(): Promise<Note[]> {
    const db = await getDB();
    return await db.getAllAsync<Note>(
      'SELECT * FROM notes ORDER BY is_pinned DESC, date DESC, page_number ASC'
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  },

  async update(id: string, data: { title?: string | null; content?: string | null }): Promise<void> {
    const db = await getDB();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
    fields.push("updated_at = datetime('now')");
    values.push(id);
    await db.runAsync(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async togglePin(id: string, isPinned: boolean): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'UPDATE notes SET is_pinned = ?, updated_at = datetime("now") WHERE id = ?',
      [isPinned ? 1 : 0, id]
    );
  },

  async getPagesByDate(date: string): Promise<Note[]> {
    const db = await getDB();
    return await db.getAllAsync<Note>(
      'SELECT * FROM notes WHERE date = ? ORDER BY page_number ASC',
      [date]
    );
  },

  async getMaxPageNumber(date: string): Promise<number> {
    const db = await getDB();
    const row = await db.getFirstAsync<{ m: number }>(
      'SELECT COALESCE(MAX(page_number), 0) as m FROM notes WHERE date = ?',
      [date]
    );
    return row?.m ?? 0;
  },
};
