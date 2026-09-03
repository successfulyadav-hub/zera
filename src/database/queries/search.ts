import { getDB } from '../connection';

export interface SearchResult {
  id: string;
  type: 'event' | 'task' | 'note' | 'reminder';
  title: string;
  date: string;
  preview: string | null;
}

export const searchQuery = {
  async search(query: string, limit = 30): Promise<SearchResult[]> {
    const db = await getDB();
    const pattern = `%${query}%`;
    const results: SearchResult[] = [];

    const events = await db.getAllAsync<{ id: string; title: string; date: string; description: string | null }>(
      `SELECT id, title, date, description FROM events WHERE title LIKE ? OR description LIKE ? ORDER BY date DESC LIMIT ?`,
      [pattern, pattern, limit]
    );
    for (const e of events) {
      results.push({ id: e.id, type: 'event', title: e.title, date: e.date, preview: e.description });
    }

    const tasks = await db.getAllAsync<{ id: string; title: string; date: string }>(
      `SELECT id, title, date FROM tasks WHERE title LIKE ? ORDER BY date DESC LIMIT ?`,
      [pattern, limit]
    );
    for (const t of tasks) {
      results.push({ id: t.id, type: 'task', title: t.title, date: t.date, preview: null });
    }

    const notes = await db.getAllAsync<{ id: string; title: string | null; date: string; content: string | null }>(
      `SELECT id, title, date, content FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY date DESC LIMIT ?`,
      [pattern, pattern, limit]
    );
    for (const n of notes) {
      results.push({
        id: n.id, type: 'note',
        title: n.title || 'Untitled Note',
        date: n.date,
        preview: n.content ? n.content.substring(0, 80) : null,
      });
    }

    const reminders = await db.getAllAsync<{ id: string; title: string; date: string; description: string | null }>(
      `SELECT id, title, date, description FROM reminders WHERE title LIKE ? OR description LIKE ? ORDER BY date DESC LIMIT ?`,
      [pattern, pattern, limit]
    );
    for (const r of reminders) {
      results.push({ id: r.id, type: 'reminder', title: r.title, date: r.date, preview: r.description });
    }

    results.sort((a, b) => b.date.localeCompare(a.date));
    return results.slice(0, limit);
  },
};
