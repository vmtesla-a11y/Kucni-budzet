import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { currentMonth } from './dates';
import { DEFAULT_CATEGORIES } from './defaults';
import { newId } from './ids';
import { loadPersisted, savePersisted } from './storage';
import { Category, Transaction } from './types';

type DraftTransaction = Omit<Transaction, 'id'>;

type BudgetContextValue = {
  ready: boolean;
  month: string;
  setMonth: (month: string) => void;
  categories: Category[];
  transactions: Transaction[];
  addTransaction: (input: DraftTransaction) => void;
  updateTransaction: (id: string, input: DraftTransaction) => void;
  deleteTransaction: (id: string) => void;
  setCategoryLimit: (id: string, monthlyLimit: number | null) => void;
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadPersisted()
      .then((stored) => {
        if (cancelled || !stored) {
          return;
        }
        setCategories(stored.categories);
        setTransactions(stored.transactions);
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    savePersisted({ categories, transactions }).catch(() => {
      // The next successful edit retries the write. The screen keeps the in-memory copy.
    });
  }, [ready, categories, transactions]);

  const value = useMemo<BudgetContextValue>(
    () => ({
      ready,
      month,
      setMonth,
      categories,
      transactions,
      addTransaction: (input) => {
        setTransactions((current) => [{ ...input, id: newId() }, ...current]);
      },
      updateTransaction: (id, input) => {
        setTransactions((current) =>
          current.map((transaction) => (transaction.id === id ? { ...input, id } : transaction)),
        );
      },
      deleteTransaction: (id) => {
        setTransactions((current) => current.filter((transaction) => transaction.id !== id));
      },
      setCategoryLimit: (id, monthlyLimit) => {
        setCategories((current) =>
          current.map((category) => (category.id === id ? { ...category, monthlyLimit } : category)),
        );
      },
    }),
    [ready, month, categories, transactions],
  );

  return <BudgetContext value={value}>{children}</BudgetContext>;
}

export function useBudget(): BudgetContextValue {
  const value = useContext(BudgetContext);
  if (!value) {
    throw new Error('useBudget mora da stoji unutar BudgetProvider-a.');
  }
  return value;
}
