import { expenseProgress, plannedRemaining, sumByKind, transactionsInMonth } from './calc';
import { defaultDateForMonth, formatMonth, isValidDate, shiftMonth } from './dates';
import { mergeCategories } from './defaults';
import { formatMoney, parseMoney } from './money';
import { Category, Transaction } from './types';

function check(name: string, run: () => void) {
  try {
    run();
    console.log(`ok ${name}`);
  } catch (error) {
    console.error(`fail ${name}`);
    throw error;
  }
}

check('parses Serbian and US amounts', () => {
  equal(parseMoney('1500'), 1500);
  equal(parseMoney('1.500,50'), 1500.5);
  equal(parseMoney('1,500.50'), 1500.5);
  equal(parseMoney('1500,5'), 1500.5);
  equal(parseMoney('1.500'), 1500);
  equal(parseMoney('0'), null);
  equal(parseMoney('0', true), 0);
  equal(parseMoney('-5'), null);
  equal(parseMoney('abc'), null);
  equal(parseMoney(''), null);
});

check('formats dinars', () => {
  match(formatMoney(1500), /1\.500/);
  match(formatMoney(1500.5), /1\.500,50|1\.500,5/);
});

check('moves across year boundaries', () => {
  equal(shiftMonth('2026-01', -1), '2025-12');
  equal(shiftMonth('2026-12', 1), '2027-01');
  equal(formatMonth('2026-10'), 'Oktobar 2026');
  equal(isValidDate('2026-02-31'), false);
  equal(isValidDate('2026-10-05'), true);
  equal(defaultDateForMonth('2026-09', new Date(2026, 9, 5)), '2026-09-01');
  equal(defaultDateForMonth('2026-10', new Date(2026, 9, 5)), '2026-10-05');
});

check('sums only the selected month', () => {
  const transactions: Transaction[] = [
    { id: '1', kind: 'income', amount: 1000, categoryId: 'inc-plata', note: '', date: '2026-10-01' },
    { id: '2', kind: 'expense', amount: 400, categoryId: 'exp-hrana', note: '', date: '2026-10-02' },
    { id: '3', kind: 'expense', amount: 50, categoryId: 'exp-hrana', note: '', date: '2026-09-02' },
  ];
  const october = transactionsInMonth(transactions, '2026-10');
  equal(sumByKind(october, 'income'), 1000);
  equal(sumByKind(october, 'expense'), 400);

  const categories: Category[] = [
    { id: 'exp-hrana', name: 'Hrana', kind: 'expense', monthlyLimit: 1000 },
    { id: 'exp-ostalo', name: 'Ostalo', kind: 'expense', monthlyLimit: null },
  ];
  const progress = expenseProgress(categories, october);
  equal(progress[0]?.remaining, 600);
  equal(progress[1]?.remaining, null);
  deepEqual(plannedRemaining(progress), { limit: 1000, spent: 400, remaining: 600 });
});

check('keeps edited default limits and unknown categories', () => {
  const merged = mergeCategories([
    { id: 'exp-hrana', name: 'Hrana', kind: 'expense', monthlyLimit: 123 },
    { id: 'custom', name: 'Škola', kind: 'expense', monthlyLimit: 5000 },
  ]);
  equal(merged.find((item) => item.id === 'exp-hrana')?.monthlyLimit, 123);
  equal(merged.find((item) => item.id === 'exp-racuni')?.name, 'Računi');
  equal(merged.at(-1)?.id, 'custom');
});

function equal(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`${String(actual)} !== ${String(expected)}`);
  }
}

function match(actual: string, pattern: RegExp) {
  if (!pattern.test(actual)) {
    throw new Error(`${actual} does not match ${pattern}`);
  }
}

function deepEqual(actual: unknown, expected: unknown) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) {
    throw new Error(`${left} !== ${right}`);
  }
}

console.log('domain tests passed');
