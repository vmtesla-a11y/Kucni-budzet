export type SqlParams = readonly (string | number | null)[];

export type SqlRow = Record<string, unknown>;

export type SqlDatabase = {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlParams): Promise<{ changes: number }>;
  all(sql: string, params?: SqlParams): Promise<SqlRow[]>;
  get(sql: string, params?: SqlParams): Promise<SqlRow | null>;
};
