export const BUDGET_SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
  monthly_limit_para INTEGER CHECK (monthly_limit_para IS NULL OR monthly_limit_para >= 0)
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
  amount_para INTEGER NOT NULL CHECK (amount_para > 0),
  category_id TEXT NOT NULL REFERENCES categories(id),
  note TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL CHECK (length(date) = 10)
);
CREATE INDEX IF NOT EXISTS transactions_by_date ON transactions(date);
`;
