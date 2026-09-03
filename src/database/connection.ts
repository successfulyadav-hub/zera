import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbFailed = false;

const noopDB = {
  execAsync: async () => {},
  runAsync: async () => ({ changes: 0, lastInsertRowId: 0 }),
  getFirstAsync: async () => null,
  getAllAsync: async () => [],
  withExclusiveTransactionAsync: async () => {},
} as unknown as SQLite.SQLiteDatabase;

export const getDB = async () => {
  if (dbFailed) return noopDB;
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync('zera.db');
    } catch {
      if (Platform.OS === 'web') {
        dbFailed = true;
        return noopDB;
      }
      throw new Error('Failed to open database');
    }
  }
  return db;
};
