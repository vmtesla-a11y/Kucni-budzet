import { DatabaseSync } from 'node:sqlite';

import { prepareBudgetDatabase } from './budget-db';
import { BudgetError } from './errors';
import { SqlDatabase } from './sql';

function openMemoryDatabase(): SqlDatabase {
  const db = new DatabaseSync(':memory:');
  return {
    async exec(sql) {
      db.exec(sql);
    },
    async run(sql, params = []) {
      const result = db.prepare(sql).run(...params);
      const changes = typeof result.changes === 'bigint' ? Number(result.changes) : result.changes;
      return { changes };
    },
    async all(sql, params = []) {
      return db.prepare(sql).all(...params) as Record<string, unknown>[];
    },
    async get(sql, params = []) {
      return (db.prepare(sql).get(...params) as Record<string, unknown> | undefined) ?? null;
    },
  };
}

async function check(name: string, run: () => Promise<void>) {
  try {
    await run();
    console.log(`ok ${name}`);
  } catch (error) {
    console.error(`fail ${name}`);
    throw error;
  }
}

function equal(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`${String(actual)} !== ${String(expected)}`);
  }
}

async function rejects(run: () => Promise<unknown>, message: string) {
  try {
    await run();
  } catch (error) {
    if (error instanceof BudgetError && error.message === message) {
      return;
    }
    throw error;
  }
  throw new Error(`expected error: ${message}`);
}

async function main() {
await check('seeds default categories once', async () => {
  const store = await prepareBudgetDatabase(openMemoryDatabase());
  const categories = await store.listCategories();
  equal(categories.find((item) => item.id === 'exp-hrana')?.monthlyLimit, 40000);
  equal(categories.find((item) => item.id === 'inc-plata')?.kind, 'income');
  equal(categories.filter((item) => item.kind === 'expense').length, 7);
});

await check('keeps an edited limit when the schema is prepared again', async () => {
  const db = openMemoryDatabase();
  const first = await prepareBudgetDatabase(db);
  await first.setCategoryLimit('exp-hrana', 30000);
  const second = await prepareBudgetDatabase(db);
  equal((await second.listCategories()).find((item) => item.id === 'exp-hrana')?.monthlyLimit, 30000);
});

await check('stores money in para and summarizes one month', async () => {
  const store = await prepareBudgetDatabase(openMemoryDatabase());
  await store.addTransaction({
    kind: 'income',
    amount: 120000,
    categoryId: 'inc-plata',
    note: 'oktobar',
    date: '2026-10-05',
  });
  await store.addTransaction({
    kind: 'expense',
    amount: 2500.5,
    categoryId: 'exp-hrana',
    note: 'pijaca',
    date: '2026-10-05',
  });
  await store.addTransaction({
    kind: 'expense',
    amount: 80,
    categoryId: 'exp-hrana',
    note: 'septembar',
    date: '2026-09-30',
  });

  const october = await store.monthSummary('2026-10');
  equal(october.income, 120000);
  equal(october.expense, 2500.5);
  equal(october.balance, 117499.5);
  equal(october.categories.find((item) => item.category.id === 'exp-hrana')?.spent, 2500.5);
  equal(october.categories.find((item) => item.category.id === 'exp-hrana')?.remaining, 37499.5);
  equal((await store.listTransactions('2026-09')).length, 1);
  equal((await store.listTransactions('2026-10')).length, 2);
});

await check('rejects invalid writes and leaves the month unchanged', async () => {
  const store = await prepareBudgetDatabase(openMemoryDatabase());
  await rejects(
    () =>
      store.addTransaction({
        kind: 'expense',
        amount: 10,
        categoryId: 'inc-plata',
        note: '',
        date: '2026-10-05',
      }),
    'Vrsta unosa ne odgovara kategoriji.',
  );
  await rejects(
    () =>
      store.addTransaction({
        kind: 'expense',
        amount: 10,
        categoryId: 'nema',
        note: '',
        date: '2026-10-05',
      }),
    'Kategorija ne postoji.',
  );
  await rejects(
    () =>
      store.addTransaction({
        kind: 'expense',
        amount: 0,
        categoryId: 'exp-hrana',
        note: '',
        date: '2026-10-05',
      }),
    'Iznos mora biti veći od nule.',
  );
  await rejects(
    () =>
      store.addTransaction({
        kind: 'expense',
        amount: 10,
        categoryId: 'exp-hrana',
        note: '',
        date: '2026-02-31',
      }),
    'Datum treba da bude u obliku GGGG-MM-DD.',
  );
  await rejects(() => store.setCategoryLimit('inc-plata', 1000), 'Limit važi samo za rashod.');
  equal((await store.listTransactions('2026-10')).length, 0);
});

await check('updates and deletes a transaction', async () => {
  const store = await prepareBudgetDatabase(openMemoryDatabase());
  const created = await store.addTransaction({
    kind: 'expense',
    amount: 100,
    categoryId: 'exp-hrana',
    note: 'hleb',
    date: '2026-10-01',
  });
  await store.updateTransaction(created.id, {
    kind: 'expense',
    amount: 180,
    categoryId: 'exp-racuni',
    note: 'struja',
    date: '2026-10-02',
  });
  const [saved] = await store.listTransactions('2026-10');
  equal(saved?.amount, 180);
  equal(saved?.categoryId, 'exp-racuni');
  equal(saved?.note, 'struja');
  await store.deleteTransaction(created.id);
  equal((await store.listTransactions('2026-10')).length, 0);
  await rejects(() => store.deleteTransaction(created.id), 'Unos ne postoji.');
});

console.log('budget database tests passed');
}

main();
