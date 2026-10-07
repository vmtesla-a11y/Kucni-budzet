declare module 'sql.js' {
  export interface SqlJsStatement {
    bind(values?: readonly (string | number | null)[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, string | number | null | Uint8Array>;
    free(): boolean;
  }

  export interface SqlJsDatabase {
    exec(sql: string): void;
    run(sql: string, params?: readonly (string | number | null)[]): SqlJsDatabase;
    prepare(sql: string): SqlJsStatement;
    export(): Uint8Array;
    getRowsModified(): number;
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | null) => SqlJsDatabase;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
