import { Category, Kind, Transaction } from './types';

export type CategorySpend = {
  category: Category;
  spent: number;
  limit: number | null;
  remaining: number | null;
  ratio: number | null;
};

export function transactionsInMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((transaction) => transaction.date.startsWith(`${month}-`));
}

export function sumByKind(transactions: Transaction[], kind: Kind): number {
  return transactions
    .filter((transaction) => transaction.kind === kind)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((left, right) => {
    if (left.date === right.date) {
      return 0;
    }
    return left.date < right.date ? 1 : -1;
  });
}

export function expenseProgress(
  categories: Category[],
  transactions: Transaction[],
): CategorySpend[] {
  return categories
    .filter((category) => category.kind === 'expense')
    .map((category) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.kind === 'expense' && transaction.categoryId === category.id,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const limit = category.monthlyLimit;
      const remaining = limit == null ? null : roundMoney(limit - spent);
      const ratio = limit == null || limit <= 0 ? null : spent / limit;
      return { category, spent: roundMoney(spent), limit, remaining, ratio };
    });
}

export function plannedRemaining(progress: CategorySpend[]): {
  limit: number;
  spent: number;
  remaining: number;
} | null {
  const planned = progress.filter((item) => item.limit != null);
  if (planned.length === 0) {
    return null;
  }
  const limit = roundMoney(planned.reduce((sum, item) => sum + (item.limit ?? 0), 0));
  const spent = roundMoney(planned.reduce((sum, item) => sum + item.spent, 0));
  return { limit, spent, remaining: roundMoney(limit - spent) };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
