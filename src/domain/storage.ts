import AsyncStorage from '@react-native-async-storage/async-storage';

import { mergeCategories } from './defaults';
import { Category, Kind, PersistedBudget, Transaction } from './types';

const STORAGE_KEY = 'kucni-budzet.v1';

export async function loadPersisted(): Promise<PersistedBudget | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return sanitizePersisted(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function savePersisted(value: PersistedBudget): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function sanitizePersisted(value: unknown): PersistedBudget | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as { categories?: unknown; transactions?: unknown };
  if (!Array.isArray(record.categories) || !Array.isArray(record.transactions)) {
    return null;
  }
  const categories = record.categories.map(sanitizeCategory).filter((item) => item != null);
  const transactions = record.transactions.map(sanitizeTransaction).filter((item) => item != null);
  return { categories: mergeCategories(categories), transactions };
}

function sanitizeCategory(value: unknown): Category | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<Category>;
  if (typeof record.id !== 'string' || typeof record.name !== 'string' || !isKind(record.kind)) {
    return null;
  }
  const monthlyLimit =
    typeof record.monthlyLimit === 'number' && Number.isFinite(record.monthlyLimit)
      ? record.monthlyLimit
      : null;
  return { id: record.id, name: record.name, kind: record.kind, monthlyLimit };
}

function sanitizeTransaction(value: unknown): Transaction | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<Transaction>;
  if (
    typeof record.id !== 'string' ||
    !isKind(record.kind) ||
    typeof record.amount !== 'number' ||
    !Number.isFinite(record.amount) ||
    record.amount <= 0 ||
    typeof record.categoryId !== 'string' ||
    typeof record.note !== 'string' ||
    typeof record.date !== 'string'
  ) {
    return null;
  }
  return {
    id: record.id,
    kind: record.kind,
    amount: record.amount,
    categoryId: record.categoryId,
    note: record.note,
    date: record.date,
  };
}

function isKind(value: unknown): value is Kind {
  return value === 'income' || value === 'expense';
}
