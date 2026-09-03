import { getDB } from './connection';
import { schema } from './schema';

const MIGRATIONS = [
  {
    version: 1,
    sql: `
      ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'none';
      ALTER TABLE notes ADD COLUMN is_pinned INTEGER DEFAULT 0;
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE tasks ADD COLUMN due_time TEXT;
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        task_id TEXT NOT NULL,
        title TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
    `,
  },
];

export async function initDatabase() {
  const db = await getDB();
  await db.execAsync(schema);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  for (const migration of MIGRATIONS) {
    const existing = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM _migrations WHERE version = ?',
      [migration.version]
    );
    if (!existing) {
      try {
        await db.execAsync(migration.sql);
        await db.runAsync('INSERT INTO _migrations (version) VALUES (?)', [migration.version]);
      } catch (e) {
        // Column may already exist if schema was created fresh with it
      }
    }
  }
}
