import { supabase } from './supabase';
import { getDB } from '@/database/connection';

const TABLES = ['events', 'tasks', 'notes', 'reminders'] as const;

export async function pushChanges(userId: string): Promise<number> {
  if (!supabase) return 0;
  const db = await getDB();
  let pushed = 0;

  for (const table of TABLES) {
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${table} WHERE updated_at > COALESCE((SELECT last_sync FROM sync_meta WHERE table_name = ?), '1970-01-01')`,
      [table]
    );

    for (const row of rows) {
      const { error } = await supabase.from(table).upsert(
        { ...row, user_id: userId },
        { onConflict: 'id' }
      );
      if (!error) pushed++;
    }

    if (rows.length > 0) {
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_meta (table_name, last_sync) VALUES (?, datetime('now'))`,
        [table]
      );
    }
  }

  return pushed;
}

export async function pullChanges(userId: string): Promise<number> {
  if (!supabase) return 0;
  const db = await getDB();
  let pulled = 0;

  for (const table of TABLES) {
    const lastSync = await db.getFirstAsync<{ last_pull: string }>(
      `SELECT last_pull FROM sync_meta WHERE table_name = ?`,
      [table]
    );
    const since = lastSync?.last_pull ?? '1970-01-01T00:00:00Z';

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', since)
      .order('updated_at', { ascending: true })
      .limit(500);

    if (error || !data) continue;

    for (const row of data) {
      const { user_id, ...localRow } = row;
      const columns = Object.keys(localRow);
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map((c) => localRow[c]);

      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
      pulled++;
    }

    if (data.length > 0) {
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_meta (table_name, last_pull) VALUES (?, datetime('now'))`,
        [table]
      );
    }
  }

  return pulled;
}

export async function syncAll(userId: string): Promise<{ pushed: number; pulled: number }> {
  const pushed = await pushChanges(userId);
  const pulled = await pullChanges(userId);
  return { pushed, pulled };
}
