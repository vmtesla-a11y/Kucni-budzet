import { BudgetStore } from './budget-db';
import { openDeviceBudgetStore } from './expo-database';

let opening: Promise<BudgetStore> | null = null;

export function getBudgetStore(): Promise<BudgetStore> {
  if (!opening) {
    opening = openDeviceBudgetStore().catch((error: unknown) => {
      opening = null;
      throw error;
    });
  }
  return opening;
}
