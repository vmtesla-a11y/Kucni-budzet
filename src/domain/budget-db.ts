import { expenseProgress, plannedRemaining, sumByKind, type CategorySpend } from './calc';
import { DEFAULT_CATEGORIES } from './defaults';
import { isValidDate, monthRange } from './dates';
import { BudgetError } from './errors';
import { newId } from './ids';
import { fromPara, toPara } from './money-units';
import { BUDGET_SCHEMA } from './schema';
import { SqlDatabase, SqlParams } from './sql';
import { Category, Kind, NewTransaction, Transaction } from './types';

export type MonthSummary = {
  month: string;
  income: number;
  expense: number;
  balance: number;
  categories: CategorySpend[];
  plan: { limit: number; spent: number; remaining: number } | null;
};

export type BudgetStore = {
  listCategories(): Promise<Category[]>;
  setCategoryLimit(id: string, monthlyLimit: number | null): Promise<void>;
  addTransaction(input: NewTransaction): Promise<Transaction>;
  updateTransaction(id: string, input: NewTransaction): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  listTransactions(month: string): Promise<Transaction[]>;
  monthSummary(month: string): Promise<MonthSummary>;
};

type CategoryRow = {
  id: string;
  name: string;
  kind: string;
  monthly_limit_para: number | bigint | null;
};

type TransactionRow = {
  id: string;
  kind: string;
  amount_para: number | bigint;
  category_id: string;
  note: string;
  date: string;
};

export async function prepareBudgetDatabase(db: SqlDatabase): Promise<BudgetStore> {
  await db.exec(BUDGET_SCHEMA);
  for (const category of DEFAULT_CATEGORIES) {
    await db.run(
      `INSERT INTO categories (id, name, kind, monthly_limit_para)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO NOTHING`,
      [category.id, category.name, category.kind, limitToPara(category.monthlyLimit)],
    );
  }
  return {
    listCategories: () => listCategories(db),
    setCategoryLimit: (id, monthlyLimit) => setCategoryLimit(db, id, monthlyLimit),
    addTransaction: (input) => insertTransaction(db, { ...input, id: newId() }),
    updateTransaction: (id, input) => insertTransaction(db, { ...input, id }, true),
    deleteTransaction: (id) => deleteTransaction(db, id),
    listTransactions: (month) => listTransactions(db, month),
    monthSummary: async (month) => {
      const [categories, transactions] = await Promise.all([
        listCategories(db),
        listTransactions(db, month),
      ]);
      const income = sumByKind(transactions, 'income');
      const expense = sumByKind(transactions, 'expense');
      const categoriesProgress = expenseProgress(categories, transactions);
      return {
        month,
        income,
        expense,
        balance: roundMoney(income - expense),
        categories: categoriesProgress,
        plan: plannedRemaining(categoriesProgress),
      };
    },
  };
}

async function listCategories(db: SqlDatabase): Promise<Category[]> {
  const rows = (await db.all(
    'SELECT id, name, kind, monthly_limit_para FROM categories ORDER BY kind, name',
  )) as CategoryRow[];
  return rows.map(mapCategory);
}

async function setCategoryLimit(
  db: SqlDatabase,
  id: string,
  monthlyLimit: number | null,
): Promise<void> {
  const category = await findCategory(db, id);
  if (category.kind === 'income' && monthlyLimit != null) {
    throw new BudgetError('Limit važi samo za rashod.');
  }
  const para = monthlyLimit == null ? null : toPara(monthlyLimit, true);
  await db.run('UPDATE categories SET monthly_limit_para = ? WHERE id = ?', [para, id]);
}

async function insertTransaction(
  db: SqlDatabase,
  transaction: Transaction,
  replace = false,
): Promise<Transaction> {
  assertTransaction(transaction);
  const category = await findCategory(db, transaction.categoryId);
  if (category.kind !== transaction.kind) {
    throw new BudgetError('Vrsta unosa ne odgovara kategoriji.');
  }
  if (replace) {
    const existing = await db.get('SELECT id FROM transactions WHERE id = ?', [transaction.id]);
    if (!existing) {
      throw new BudgetError('Unos ne postoji.');
    }
  }
  const params: SqlParams = [
    transaction.id,
    transaction.kind,
    toPara(transaction.amount),
    transaction.categoryId,
    transaction.note,
    transaction.date,
  ];
  await db.run(
    replace
      ? `UPDATE transactions
         SET kind = ?, amount_para = ?, category_id = ?, note = ?, date = ?
         WHERE id = ?`
      : `INSERT INTO transactions (id, kind, amount_para, category_id, note, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
    replace
      ? [transaction.kind, toPara(transaction.amount), transaction.categoryId, transaction.note, transaction.date, transaction.id]
      : params,
  );
  return transaction;
}

async function deleteTransaction(db: SqlDatabase, id: string): Promise<void> {
  const result = await db.run('DELETE FROM transactions WHERE id = ?', [id]);
  if (result.changes === 0) {
    throw new BudgetError('Unos ne postoji.');
  }
}

async function listTransactions(db: SqlDatabase, month: string): Promise<Transaction[]> {
  const range = monthRange(month);
  const rows = (await db.all(
    `SELECT id, kind, amount_para, category_id, note, date
     FROM transactions
     WHERE date >= ? AND date < ?
     ORDER BY date DESC, id DESC`,
    [range.start, range.end],
  )) as TransactionRow[];
  return rows.map(mapTransaction);
}

async function findCategory(db: SqlDatabase, id: string): Promise<Category> {
  const row = (await db.get(
    'SELECT id, name, kind, monthly_limit_para FROM categories WHERE id = ?',
    [id],
  )) as CategoryRow | null;
  if (!row) {
    throw new BudgetError('Kategorija ne postoji.');
  }
  return mapCategory(row);
}

function assertTransaction(transaction: Transaction) {
  if (transaction.kind !== 'income' && transaction.kind !== 'expense') {
    throw new BudgetError('Vrsta unosa mora biti prihod ili rashod.');
  }
  if (!isValidDate(transaction.date)) {
    throw new BudgetError('Datum treba da bude u obliku GGGG-MM-DD.');
  }
  if (typeof transaction.note !== 'string') {
    throw new BudgetError('Beleška mora biti tekst.');
  }
  toPara(transaction.amount);
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    kind: asKind(row.kind),
    monthlyLimit: row.monthly_limit_para == null ? null : fromPara(asNumber(row.monthly_limit_para)),
  };
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    kind: asKind(row.kind),
    amount: fromPara(asNumber(row.amount_para)),
    categoryId: row.category_id,
    note: row.note,
    date: row.date,
  };
}

function asKind(value: string): Kind {
  if (value === 'income' || value === 'expense') {
    return value;
  }
  throw new BudgetError('Nepoznata vrsta kategorije.');
}

function asNumber(value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value;
}

function limitToPara(limit: number | null): number | null {
  return limit == null ? null : toPara(limit, true);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
