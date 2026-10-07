import * as SQLite from 'expo-sqlite';

import { BudgetStore, prepareBudgetDatabase } from './budget-db';
import { SqlDatabase, SqlRow } from './sql';

export async function openDeviceBudgetStore(): Promise<BudgetStore> {
  const database = await SQLite.openDatabaseAsync('kucni-budzet.db');
  const db: SqlDatabase = {
    exec: (sql) => database.execAsync(sql),
    run: async (sql, params = []) => {
      const result = await database.runAsync(sql, [...params]);
      return { changes: result.changes };
    },
    all: (sql, params = []) => database.getAllAsync(sql, [...params]),
    get: async (sql, params = []) => {
      const row = await database.getFirstAsync(sql, [...params]);
      return (row as SqlRow | null) ?? null;
    },
  };
  return prepareBudgetDatabase(db);
}
