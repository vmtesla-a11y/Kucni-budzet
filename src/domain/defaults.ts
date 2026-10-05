import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'exp-hrana', name: 'Hrana', kind: 'expense', monthlyLimit: 40000 },
  { id: 'exp-racuni', name: 'Računi', kind: 'expense', monthlyLimit: 15000 },
  { id: 'exp-prevoz', name: 'Prevoz', kind: 'expense', monthlyLimit: 8000 },
  { id: 'exp-stan', name: 'Stanovanje', kind: 'expense', monthlyLimit: 50000 },
  { id: 'exp-zdravlje', name: 'Zdravlje', kind: 'expense', monthlyLimit: null },
  { id: 'exp-zabava', name: 'Zabava', kind: 'expense', monthlyLimit: 10000 },
  { id: 'exp-ostalo', name: 'Ostalo', kind: 'expense', monthlyLimit: null },
  { id: 'inc-plata', name: 'Plata', kind: 'income', monthlyLimit: null },
  { id: 'inc-dodatno', name: 'Dodatni prihod', kind: 'income', monthlyLimit: null },
  { id: 'inc-ostalo', name: 'Ostali prihodi', kind: 'income', monthlyLimit: null },
];

export function mergeCategories(stored: Category[]): Category[] {
  const byId = new Map(stored.map((category) => [category.id, category]));
  const defaults = DEFAULT_CATEGORIES.map((category) => byId.get(category.id) ?? category);
  const extras = stored.filter(
    (category) => !DEFAULT_CATEGORIES.some((item) => item.id === category.id),
  );
  return [...defaults, ...extras];
}
