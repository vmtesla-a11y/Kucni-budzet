import { BudgetStore, prepareBudgetDatabase } from './budget-db';
import { SqlDatabase, SqlRow } from './sql';
import type { SqlJsDatabase } from 'sql.js';

const STORAGE_KEY = 'kucni-budzet.sqlite';

export async function openDeviceBudgetStore(): Promise<BudgetStore> {
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs({
    locateFile: () => '/sql-wasm.wasm',
  });
  const database = new SQL.Database(readSaved());
  const db: SqlDatabase = {
    async exec(sql) {
      database.exec(sql);
      persist(database);
    },
    async run(sql, params = []) {
      database.run(sql, params);
      const changes = database.getRowsModified();
      persist(database);
      return { changes };
    },
    async all(sql, params = []) {
      return readRows(database, sql, params);
    },
    async get(sql, params = []) {
      const rows = readRows(database, sql, params);
      return rows[0] ?? null;
    },
  };
  return prepareBudgetDatabase(db);
}

function readRows(database: SqlJsDatabase, sql: string, params: readonly (string | number | null)[]): SqlRow[] {
  const statement = database.prepare(sql);
  if (params.length > 0) {
    statement.bind(params);
  }
  const rows: SqlRow[] = [];
  while (statement.step()) {
    rows.push(statement.getAsObject() as SqlRow);
  }
  statement.free();
  return rows;
}

function persist(database: SqlJsDatabase) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  const bytes = database.export();
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  localStorage.setItem(STORAGE_KEY, btoa(binary));
}

function readSaved(): Uint8Array | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
