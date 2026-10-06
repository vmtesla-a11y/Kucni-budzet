declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(filename: string);
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: (string | number | null | bigint)[]): { changes: number | bigint };
      all(...params: (string | number | null | bigint)[]): Record<string, unknown>[];
      get(...params: (string | number | null | bigint)[]): Record<string, unknown> | undefined;
    };
  }
}
