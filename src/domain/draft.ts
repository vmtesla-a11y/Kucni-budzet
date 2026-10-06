import { isValidDate } from './dates';
import { BudgetError } from './errors';
import { parseMoney } from './money';
import { Kind, NewTransaction } from './types';

export function transactionDraft(input: {
  kind: Kind;
  amountText: string;
  categoryId: string;
  note: string;
  date: string;
}): NewTransaction {
  const amount = parseMoney(input.amountText);
  if (amount == null) {
    throw new BudgetError('Unesi iznos veći od nule. Primer: 1500 ili 1.500,50.');
  }
  if (!input.categoryId) {
    throw new BudgetError('Izaberi kategoriju.');
  }
  if (!isValidDate(input.date)) {
    throw new BudgetError('Datum treba da bude u obliku GGGG-MM-DD.');
  }
  return {
    kind: input.kind,
    amount,
    categoryId: input.categoryId,
    note: input.note.trim(),
    date: input.date,
  };
}
