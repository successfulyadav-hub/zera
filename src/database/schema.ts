export const schema = `
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_all_day INTEGER DEFAULT 0,
  color TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notify_before INTEGER DEFAULT 0,
  is_recurring INTEGER DEFAULT 0,
  recurrence_type TEXT,
  recurrence_end_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  sort_order INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'none',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date TEXT NOT NULL,
  title TEXT,
  content TEXT,
  page_number INTEGER DEFAULT 1,
  is_pinned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_meta (
  table_name TEXT PRIMARY KEY,
  last_sync TEXT,
  last_pull TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
`;
